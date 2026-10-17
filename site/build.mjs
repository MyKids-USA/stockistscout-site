#!/usr/bin/env node
/**
 * Builds the public site into the repo root (Render serves the root as a static site,
 * publishPath "."): every page in site/pages, sitemap.xml and robots.txt. The built
 * HTML is committed, so Render needs no build command.
 *
 *   npm run build
 *
 * Pages are HTML fragments that start with a JSON comment holding their metadata:
 *   <!--{"path":"/pricing","title":"Pricing","titleEs":"Precios","description":"..."}-->
 * Placeholders inside a fragment: {{CTA_BUTTON}} {{CTA_BUTTON_LIGHT}} {{CTA}}
 * {{WAITLIST_FORM}} (the waitlist form, one per page), {{CONTACT_EMAIL}},
 * {{AGENTS}} / {{AGENTS_FULL}} (the eight agent cards, short and long) and
 * {{AVATAR:Name}} (one agent's picture) and {{CUSTOM_AVATARS}} (the custom-agent avatar gallery).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { LANGUAGES, pathIn, page, ctaBand, ctaButton, waitlistForm, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_DIGITS, CONTACT_TEL, ORIGIN, INDEXABLE, AGENTS, agentImg, attr, APP_URL } from './shell.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const PAGES = join(HERE, 'pages');

/* Home: avatar, name and specialty. The agents page adds what each one does. */
function agentCards(full) {
  return AGENTS.map((a) => `<li class="agent${full ? ' agent-full' : ''}">
  ${agentImg(a.name, full ? 112 : 80)}
  <span class="agent-name">${a.name}</span>
  <span class="agent-spec" data-es="${attr(a.specEs)}" data-fr="${attr(a.specFr)}" data-pt="${attr(a.specPt)}" data-zh="${attr(a.specZh)}">${a.spec}</span>${full ? `
  <p data-es="${attr(a.doesEs)}" data-fr="${attr(a.doesFr)}" data-pt="${attr(a.doesPt)}" data-zh="${attr(a.doesZh)}">${a.does}</p>` : ''}
</li>`).join('\n');
}

/* The 20 avatars a customer can give a custom agent (same files as the app's gallery). */
function customAvatars() {
  return readdirSync(join(ROOT, 'img/agents/custom')).filter((f) => /^a\d{2}\.png$/.test(f)).sort()
    .map((f) => `      <li><img class="avatar" src="/img/agents/custom/${f}" alt="" width="72" height="72" loading="lazy" decoding="async"></li>`).join('\n');
}

function fill(html) {
  const out = html
    .replaceAll('{{CTA_BUTTON}}', ctaButton('btn-primary'))
    .replaceAll('{{CTA_BUTTON_LIGHT}}', ctaButton('btn-light'))
    .replaceAll('{{CTA}}', ctaBand())
    .replaceAll('{{WAITLIST_FORM}}', waitlistForm())
    .replaceAll('{{CONTACT_EMAIL}}', CONTACT_EMAIL)
    .replaceAll('{{CONTACT_PHONE}}', CONTACT_PHONE)
    .replaceAll('{{CONTACT_PHONE_DIGITS}}', CONTACT_PHONE_DIGITS)
    .replaceAll('{{CONTACT_TEL}}', CONTACT_TEL)
    .replaceAll('{{AGENTS}}', agentCards(false))
    .replaceAll('{{AGENTS_FULL}}', agentCards(true))
    .replaceAll('{{CUSTOM_AVATARS}}', customAvatars())
    .replace(/\{\{AVATAR:(\w+)\}\}/g, (_, name) => {
      if (!AGENTS.some((a) => a.name === name)) throw new Error(`unknown agent ${name}`);
      return agentImg(name, 44, false);
    });
  // Images under /img/ get a hash of their bytes in the URL, so replacing a file is a new
  // URL and no cache in front of the site keeps serving the old picture.
  const versioned = out.replace(/src="(\/img\/[^"?]+)"/g, (_, f) =>
    `src="${f}?v=${createHash('sha1').update(readFileSync(join(ROOT, f))).digest('hex').slice(0, 8)}"`);
  const left = versioned.match(/\{\{[^}]*\}\}/);
  if (left) throw new Error(`unfilled placeholder ${left[0]}`);
  return versioned;
}

function readPage(file) {
  const src = readFileSync(join(PAGES, file), 'utf8');
  const m = src.match(/^<!--(\{[\s\S]*?\})-->\s*/);
  if (!m) throw new Error(`${file}: missing the metadata comment`);
  return { meta: JSON.parse(m[1]), body: src.slice(m[0].length) };
}

const outFile = (path) => path === '/' ? 'index.html' : path.slice(1) + '.html';

/* One URL per language (Aharon, 15 Oct 2026: "hay que hacer /en /fr /es en las paginas para que google lo muestre").
   Until then the Spanish and French rode in data-es / data-fr and a script swapped them in, so Google only ever saw
   English. Now the build writes each page three times with the text already in it: English at the root (the URLs
   Google already knows; /en redirects there), Spanish under /es/ and French under /fr/, joined by hreflang, each with
   its own canonical and listed in the sitemap with its alternates. The data-* stay, harmless.
   Brazilian Portuguese (16 Oct 2026) is the fourth: data-pt, under /pt/, the same way. Simplified Chinese (16 Oct 2026,
   for factories looking for stores abroad) is the fifth: data-zh, under /zh/, <html lang="zh-CN">, hreflang zh-Hans.
   The languages themselves are the one LANGUAGES list in shell.mjs (16 Oct 2026); everything here comes from it. */
export const LANGS = LANGUAGES.map((l) => l.code);
const BY = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]));
const hreflang = (l) => BY[l]?.hreflang ?? l; // x-default stays itself
export { pathIn };
const fileIn = (path, lang) => lang === 'en' ? outFile(path) : `${lang}/${outFile(path)}`;

/** The text of an element in a language (data-es / data-fr / data-pt, or data-es-alt and the like): French and
    Portuguese fall back to English. `key` is '' for the element's own text, '-alt', '-src', ... for an attribute. */
function pick(el, lang, en, key) {
  return lang === 'en' ? en : el.getAttribute(`data-${lang}${key}`) ?? en;
}

/** Writes the English page's translation into the HTML itself, and points its links and head at that language. */
export function localize(html, lang, path, pages, meta) {
  const { document } = parseHTML(html);
  const head = document.head;
  if (lang !== 'en') {
    document.documentElement.setAttribute('lang', BY[lang].html);
    for (const el of document.querySelectorAll(`[data-${lang}]`)) {
      const text = pick(el, lang, null, '');
      if (text == null) continue;
      if (el.tagName === 'TITLE') el.textContent = text; else el.innerHTML = text;
    }
    for (const [a, key] of [['alt', 'alt'], ['src', 'src'], ['href', 'href'], ['placeholder', 'placeholder'], ['aria-label', 'label']]) {
      for (const el of document.querySelectorAll(`[data-${lang}-${key}]`)) {
        const v = pick(el, lang, el.getAttribute(a), `-${key}`);
        if (v != null) el.setAttribute(a, v);
      }
    }
    const desc = meta['description' + lang[0].toUpperCase() + lang.slice(1)];
    if (desc) {
      head.querySelector('meta[name="description"]')?.setAttribute('content', desc);
      head.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
    }
    head.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    // Links to our pages stay in the language; the app opens in it too.
    for (const a of document.querySelectorAll('a[href]')) {
      if (a.closest('#langMenu')) continue; // the language menu already points at each language
      const href = a.getAttribute('href');
      const m = /^(\/[a-z0-9-]*)(#.*)?$/.exec(href);
      if (m && pages.has(m[1])) a.setAttribute('href', pathIn(m[1], lang) + (m[2] || ''));
      else if (href.startsWith(APP_URL + '/')) a.setAttribute('href', href + (href.includes('?') ? '&' : '?') + `lang=${lang}`);
    }
    // Google Fonts is blocked in mainland China, and a stylesheet link blocks rendering until it loads or times out.
    // On /zh/ it loads without blocking (print, then all), and the Chinese font stack in site.css (:lang(zh)) needs none of it.
    if (lang === 'zh') {
      for (const l of head.querySelectorAll('link[href^="https://fonts.g"]')) {
        if (l.getAttribute('rel') === 'preconnect') { l.remove(); continue; }
        l.setAttribute('media', 'print'); l.setAttribute('onload', "this.media='all'");
      }
    }
  }
  const url = ORIGIN + pathIn(path, lang);
  head.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  head.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  document.querySelector(`#langMenu a[data-lang="${lang}"]`)?.setAttribute('aria-current', 'true');
  const og = document.createElement('meta'); og.setAttribute('property', 'og:locale'); og.setAttribute('content', BY[lang].locale);
  head.querySelector('meta[property="og:type"]')?.after(og);
  if (!meta.noindex) {
    const canonical = head.querySelector('link[rel="canonical"]');
    for (const l of [...LANGS, 'x-default']) {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate'); link.setAttribute('hreflang', hreflang(l));
      link.setAttribute('href', ORIGIN + pathIn(path, l === 'x-default' ? 'en' : l));
      canonical.after(link);
    }
  }
  return document.toString();
}

/** Every French text has its Portuguese (16 Oct 2026), and every Portuguese text its Chinese (16 Oct 2026): from French on,
    an element with data-<lang>, data-<lang>-alt, ... must have the same attribute in every language after it in LANGUAGES,
    or that page would show English there without anyone noticing, so the build stops. (So data-pt needs data-zh, and a
    language added later needs its texts before the build passes.) Images and links (-src, -href) may stay English: the
    app screenshots have Portuguese (16 Oct 2026) but no Chinese yet, and /zh/ uses the English ones.
    Returns the problems, empty when all is well. */
export function missingTranslations(html, where) {
  const { document } = parseHTML(html);
  const out = [];
  const checked = LANGS.slice(LANGS.indexOf('fr'));
  for (const el of document.querySelectorAll('*')) for (const { name } of [...el.attributes]) {
    const from = checked.find((l) => name === `data-${l}` || name.startsWith(`data-${l}-`));
    if (!from) continue;
    const key = name.slice(`data-${from}`.length);
    if (key === '-src' || key === '-href') continue;
    for (const to of checked.slice(checked.indexOf(from) + 1)) {
      if (!el.hasAttribute(`data-${to}${key}`)) out.push(`${where}: <${el.tagName.toLowerCase()} ${name}="${el.getAttribute(name).slice(0, 50)}"> has no data-${to}${key}`);
    }
  }
  return out;
}

// Pages without their own date carry the build date, so Google sees when the site changed.
const TODAY = new Date().toISOString().slice(0, 10);

/* Every language of every page, each listing all of them as alternates (Google's sitemap form of hreflang). */
function sitemap(urls) {
  const alts = (u) => LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${hreflang(l)}" href="${ORIGIN}${pathIn(u, l)}"/>`)
    .concat(`<xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${u}"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.flatMap(([u, d]) => LANGS.map((l) => `  <url><loc>${ORIGIN}${pathIn(u, l)}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}${alts(u)}</url>`)).join('\n')}
</urlset>
`;
}

/* Until launch (INDEXABLE false) nothing is crawled; every page also carries noindex. */
const ROBOTS = INDEXABLE
  ? `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`
  : `# Pre-launch: the site is not to be indexed yet. Flip INDEXABLE in site/shell.mjs at launch.\nUser-agent: *\nDisallow: /\n`;

export function build() {
  const urls = [];
  const order = ['/', '/how-it-works', '/features', '/agents', '/pricing', '/results', '/faq', '/about', '/contact', '/privacy', '/terms'];
  const all = readdirSync(PAGES).filter((f) => f.endsWith('.html')).sort().map(readPage);
  const pages = new Set(all.map((x) => x.meta.path));
  for (const l of LANGS.slice(1)) mkdirSync(join(ROOT, l), { recursive: true });
  for (const { meta, body } of all) {
    const en = page({ ...meta, body: fill(body) });
    const gaps = missingTranslations(en, meta.path);
    // titleFr, titlePt, titleZh ... and the same for description: each language from French on has them when French does.
    const cap = (l) => l[0].toUpperCase() + l.slice(1);
    for (const k of ['title', 'description']) if (meta[k + 'Fr'])
      for (const l of LANGS.slice(LANGS.indexOf('fr') + 1)) if (!meta[k + cap(l)]) gaps.push(`${meta.path}: ${k}Fr without ${k}${cap(l)}`);
    if (gaps.length) throw new Error('Missing translations:\n' + gaps.join('\n'));
    // The 404 stays English-only: it is never indexed.
    for (const l of meta.noindex ? ['en'] : LANGS) writeFileSync(join(ROOT, fileIn(meta.path, l)), localize(en, l, meta.path, pages, meta));
    if (!meta.noindex) urls.push([meta.path, meta.updated || TODAY]);
  }
  urls.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  writeFileSync(join(ROOT, 'sitemap.xml'), sitemap(urls));
  writeFileSync(join(ROOT, 'robots.txt'), ROBOTS);
  return urls.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`site: ${build()} pages × ${LANGS.length} languages${INDEXABLE ? '' : ' (noindex, robots disallow all)'}`);
}
