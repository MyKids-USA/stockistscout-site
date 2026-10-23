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
 * Placeholders inside a fragment: {{CTA_BUTTON}} {{CTA_BUTTON_LIGHT}} {{SHOPIFY_BUTTON}} {{CTA}}
 * {{WAITLIST_FORM}} (the waitlist form, one per page), {{CONTACT_EMAIL}},
 * {{AGENTS}} / {{AGENTS_FULL}} (the eight agent cards, short and long) and
 * {{AVATAR:Name}} (one agent's picture) and {{CUSTOM_AVATARS}} (the custom-agent avatar gallery),
 * {{COUNTRIES:<lang>:<and|or>[:in]}} (the countries the agents write to, as a sentence) and {{WHERE_COUNTRIES}}
 * (the same countries by region, id="countries"), {{FAQ_COUNTRY_GROUPS}} (them by region inside a FAQ answer) and
 * {{COUNTRY_COUNT}} (how many, the Caribbean islands not counted): all from COUNTRIES in shell.mjs.
 *
 * Languages: see LANGUAGES in shell.mjs. es/fr/pt/zh ride in data-<lang> attributes; ja/ko/he/ar/it/de/nl/hi come from
 * site/i18n/<lang>.json once it exists, and the build stops if that file misses any string (site/i18n/strings.mjs).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { writeFlags } from './flags.mjs';
import { FLAG_ISOS } from './shell.mjs';
import { folderOf, attrKey, LANGUAGES, SITE_LANGUAGES, ATTR_LANGUAGES, dictFile, countryList, countriesSection, heroFlags, faqCountryGroups, countryCount, localizeMap, pathIn, page, ctaBand, ctaButton, shopifyButton, waitlistForm, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_DIGITS, CONTACT_TEL, US_FLAG, flagPhones, ORIGIN, INDEXABLE, AGENTS, agentImg, attr, APP_URL, VIDEO_IDS, TUTORIAL_IDS } from './shell.mjs';

import { lpPages } from './lp.mjs';
import { collectStrings, scriptStrings, ATTRS, WHY_LABEL } from './i18n/strings.mjs';

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

/* The blog (17 Oct 2026): a card per post, from the post's own metadata (title, description, cover, tag, each in every
   language the post has), so the index and the "Keep reading" of every post need no texts of their own. */
let POSTS = [];
const ATTR4 = ['es', 'fr', 'pt', 'zh'];
const cap1 = (l) => l[0].toUpperCase() + l.slice(1);
function postCard(m, featured = false) {
  const a = m.article;
  const tr = (k) => ATTR4.map((l) => (m[k + cap1(l)] ? ` data-${l}="${attr(m[k + cap1(l)])}"` : '')).join('');
  const tag = a.tag ? `<span class="pc-tag"${ATTR4.map((l) => (a['tag' + cap1(l)] ? ` data-${l}="${attr(a['tag' + cap1(l)])}"` : '')).join('')}>${a.tag}</span>` : '';
  return `<a class="post-card${featured ? ' featured' : ''}" href="${m.path}">
  <img src="${a.image}" alt="" width="1600" height="1067" loading="lazy" decoding="async">
  <div class="pc-body">${tag}
    <h2${tr('title')}>${m.title}</h2>
    <p${tr('description')}>${m.description}</p>
  </div>
</a>`;
}
const blogCards = () => POSTS.map((m, i) => postCard(m, i === 0)).join('\n');
const blogMore = (path) => POSTS.filter((m) => m.path !== path).slice(0, 3).map((m) => postCard(m)).join('\n');

function fill(html, path = '') {
  const out = html
    .replaceAll('{{BLOG_CARDS}}', blogCards())
    .replaceAll('{{BLOG_MORE}}', blogMore(path))
    .replaceAll('{{CTA_BUTTON}}', ctaButton('btn-primary'))
    .replaceAll('{{CTA_BUTTON_LIGHT}}', ctaButton('btn-light'))
    .replaceAll('{{SHOPIFY_BUTTON}}', shopifyButton('btn-ghost'))
    .replaceAll('{{CTA}}', ctaBand())
    .replaceAll('{{WAITLIST_FORM}}', waitlistForm())
    .replaceAll('{{CONTACT_EMAIL}}', CONTACT_EMAIL)
    .replaceAll('{{US_FLAG}}', US_FLAG)
    .replaceAll('{{CONTACT_PHONE}}', CONTACT_PHONE)
    .replaceAll('{{CONTACT_PHONE_DIGITS}}', CONTACT_PHONE_DIGITS)
    .replaceAll('{{CONTACT_TEL}}', CONTACT_TEL)
    .replaceAll('{{AGENTS}}', agentCards(false))
    .replaceAll('{{AGENTS_FULL}}', agentCards(true))
    .replaceAll('{{CUSTOM_AVATARS}}', customAvatars())
    .replaceAll('{{WHERE_COUNTRIES:companies}}', countriesSection('companies'))
    .replaceAll('{{WHERE_COUNTRIES}}', countriesSection())
    .replaceAll('{{HERO_FLAGS}}', heroFlags())
    .replaceAll('{{FAQ_COUNTRY_GROUPS}}', faqCountryGroups())
    .replaceAll('{{COUNTRY_COUNT}}', String(countryCount()))
    .replace(/\{\{COUNTRIES:(\w+):(and|or)(?::(in))?\}\}/g, (_, lang, conj, form) => countryList(lang, conj, form))
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
   The languages themselves are the one LANGUAGES list in shell.mjs (16 Oct 2026); everything here comes from it.
   Dictionary languages (17 Oct 2026, ja ko he it de nl hi): their text comes from site/i18n/<lang>.json, keyed by the
   English; each is built only once its file exists (SITE_LANGUAGES), and a right-to-left language (`dir: 'rtl'`: Hebrew, Arabic) gets dir="rtl". */
export const LANGS = SITE_LANGUAGES.map((l) => l.code);
const ATTR_LANGS = ATTR_LANGUAGES.map((l) => l.code);
const BY = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]));
const hreflang = (l) => BY[l]?.hreflang ?? l; // x-default stays itself
export { pathIn };
const fileIn = (path, lang) => lang === 'en' ? outFile(path) : `${folderOf(lang)}/${outFile(path)}`;

/** The text of an element in a language (data-es / data-fr / data-pt, or data-es-alt and the like): French and
    Portuguese fall back to English. `key` is '' for the element's own text, '-alt', '-src', ... for an attribute. */
function pick(el, lang, en, key) {
  return lang === 'en' ? en : el.getAttribute(`data-${lang}${key}`) ?? en;
}

/** A page's title as the shell writes it: the home's alone, every other with the site's name. */
const titled = (path, t) => path === '/' ? t : `${t} | StockistScout`;

/** A dictionary language's text into the page: every element with data-pt (and its -alt / -label / -placeholder) gets
    the translation of its English, unless it carries the language's own attribute; then the title, the description,
    and for the scripts window.SS_I18N (Katya, the waitlist) and the label of the home mock. Returns the misses. */
function translateFromDict(document, lang, path, meta, dict) {
  const miss = [];
  const tr = (en) => { const t = dict[en]; if (t == null) miss.push(en.slice(0, 80)); return t; };
  for (const el of document.querySelectorAll('[data-pt]')) {
    if (el.tagName === 'TITLE') continue;
    const text = el.getAttribute(`data-${attrKey(lang)}`) ?? tr(el.innerHTML);
    if (text != null) el.innerHTML = text;
  }
  for (const [a, key] of ATTRS) {
    for (const el of document.querySelectorAll(`[data-pt-${key}]`)) {
      if (!el.hasAttribute(a)) continue;
      const v = el.getAttribute(`data-${attrKey(lang)}-${key}`) ?? tr(el.getAttribute(a));
      if (v != null) el.setAttribute(a, v);
    }
  }
  const head = document.head;
  const title = tr(meta.title);
  if (title != null) document.title = titled(path, title);
  const desc = tr(meta.description);
  if (desc != null) {
    head.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    head.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
  }
  const scripts = Object.fromEntries(scriptStrings().map((en) => [en, tr(en)]));
  const s = document.createElement('script');
  // As JSON in a script: "<" escaped, so no text can close the tag.
  s.textContent = `window.SS_I18N=${JSON.stringify(scripts).replace(/</g, '\\u003c')};`;
  head.appendChild(s);
  const style = document.createElement('style');
  style.textContent = `.mock-rows .why::before{content:${JSON.stringify(scripts[WHY_LABEL] + ' ')}}`;
  head.appendChild(style);
  return miss;
}

/** The first 8 hex of a file's sha1: the ?v= that fill() puts on every /img/ URL. */
const imgVersion = (f) => createHash('sha1').update(readFileSync(join(ROOT, f))).digest('hex').slice(0, 8);

/** Pictures in the page's language, for any language (17 Oct 2026): an app screenshot img/app/<name>-en.jpg, or the
    home video's thumbnail img/video/katya-en.jpg, still in English after the data-<lang>-src swap becomes
    <name>-<lang>.jpg when that file exists (the full-size link's href too); with no such file it stays English. So a
    language gets its screenshots by adding the four files, with no change to the pages. And the home video plays the
    page's own YouTube id from VIDEO_IDS (shell.mjs), or the English one where a language has none. */
const dirListing = new Map();
/** Whether a site file exists with exactly this spelling, case included, on any file system. */
function existsExactly(f) {
  const dir = dirname(join(ROOT, f)), name = f.slice(f.lastIndexOf('/') + 1);
  if (!dirListing.has(dir)) dirListing.set(dir, new Set(existsSync(dir) ? readdirSync(dir) : []));
  return dirListing.get(dir).has(name);
}
function localizedImages(document, lang) {
  for (const box of document.querySelectorAll('.promo-video')) {
    const ids = box.getAttribute('data-video') === 'tutorial' ? TUTORIAL_IDS : VIDEO_IDS;
    box.setAttribute('data-yt', ids[lang] || ids.en);
  }
  if (lang === 'en') return;
  const inLang = (url) => {
    const m = /^(\/img\/(?:app|video)\/[\w-]+)-en\.jpg(?:\?v=\w+)?$/.exec(url || '');
    if (!m) return null;
    // File names are lower case (zh-Hant → katya-zh-hant.jpg), and the file must exist with exactly that spelling: macOS
    // finds -zh-Hant.jpg for -zh-hant.jpg, Render's Linux does not, so a case-blind check would publish a 404.
    const f = `${m[1]}-${lang.toLowerCase()}.jpg`;
    // The video's own thumbnail only once that language has its own video: a Chinese picture over the English video misleads.
    if (m[1] === '/img/video/katya' && !VIDEO_IDS[lang]) return null;
    if (m[1] === '/img/video/tutorial' && !TUTORIAL_IDS[lang]) return null;
    return existsExactly(f) ? f : null;
  };
  for (const img of document.querySelectorAll('img[src]')) {
    const f = inLang(img.getAttribute('src'));
    if (f) img.setAttribute('src', `${f}?v=${imgVersion(f)}`);
  }
  for (const a of document.querySelectorAll('a[href]')) {
    const f = inLang(a.getAttribute('href'));
    if (f) a.setAttribute('href', f);
  }
}

/** Writes the English page's translation into the HTML itself, and points its links and head at that language.
    `dict` is the language's dictionary when it is a dictionary language. */
export function localize(html, lang, path, pages, meta, dict) {
  const { document } = parseHTML(html);
  const head = document.head;
  if (lang !== 'en' && BY[lang].dict) {
    document.documentElement.setAttribute('lang', BY[lang].html);
    if (BY[lang].dir) document.documentElement.setAttribute('dir', BY[lang].dir);
    const miss = translateFromDict(document, lang, path, meta, dict || {});
    if (miss.length) throw new Error(`${lang}${path}: no translation for\n${miss.join('\n')}`);
  } else if (lang !== 'en') {
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
  }
  localizedImages(document, lang);
  if (lang !== 'en') {
    head.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    // Links to our pages stay in the language; the app opens in it too.
    for (const a of document.querySelectorAll('a[href]')) {
      if (a.closest('#langMenu')) continue; // the language menu already points at each language
      const href = a.getAttribute('href');
      const m = /^(\/[a-z0-9-]*(?:\/[a-z0-9-]+)?)(#.*)?$/.exec(href);
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
  // The map's country names and aria-label in the language (the chips' names: COUNTRIES, or the dictionary).
  const isDict = lang !== 'en' && BY[lang].dict;
  flagPhones(document); // the US flag before the number inside translated texts (privacy)
  localizeMap(document, (c) => lang === 'en' ? c.en : isDict ? dict?.[c.en] : c[lang], { zh: '、', 'zh-Hant': '、', ja: '、', ar: '، ' }[lang] ?? ', ');
  const url = ORIGIN + pathIn(path, lang);
  head.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  head.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  document.querySelector(`#langMenu a[data-lang="${lang}"]`)?.setAttribute('aria-current', 'true');
  const og = document.createElement('meta'); og.setAttribute('property', 'og:locale'); og.setAttribute('content', meta.locale || BY[lang].locale);
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
    language added later needs its texts before the build passes.) Images and links (-src, -href) may stay English: a
    language without its screenshot files shows the English ones (localizedImages).
    Returns the problems, empty when all is well. */
export function missingTranslations(html, where) {
  const { document } = parseHTML(html);
  const out = [];
  const checked = ATTR_LANGS.slice(ATTR_LANGS.indexOf('fr'));
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

/** Every page in English, as the build makes it: { meta, html }. extract.mjs reads its strings from these. */
export function englishPages() {
  // The blog's posts live in site/pages/blog/ (17 Oct 2026): /blog/<file name>.
  const blog = existsSync(join(PAGES, 'blog')) ? readdirSync(join(PAGES, 'blog')).filter((f) => f.endsWith('.html')).sort().map((f) => `blog/${f}`) : [];
  // The ad landing pages (site/lp.mjs, 18 Oct 2026) come after: noindex, so English-only output at their own path, out of
  // the sitemap and the dictionaries; each is written in its own language.
  const read = [...[...readdirSync(PAGES).filter((f) => f.endsWith('.html')).sort(), ...blog].map(readPage), ...lpPages()];
  // Newest first; the first is the featured card of the index.
  POSTS = read.map((x) => x.meta).filter((m) => m.article).sort((a, b) => (b.article.published + b.path).localeCompare(a.article.published + a.path) || (a.article.order ?? 0) - (b.article.order ?? 0));
  POSTS.sort((a, b) => (a.article.order ?? 99) - (b.article.order ?? 99));
  return read.map(({ meta, body }) => ({ meta, html: page({ ...meta, body: fill(body, meta.path) }) }));
}

export const EN_JSON = join(HERE, 'i18n', 'en.json');

/** The dictionaries of the dictionary languages being built, each checked to hold every string (or the build stops). */
function loadDictionaries(all) {
  const problems = [];
  const strings = collectStrings(all, problems);
  if (problems.length) throw new Error('Strings the dictionaries cannot key:\n' + problems.join('\n'));
  if (!existsSync(EN_JSON) || JSON.stringify(JSON.parse(readFileSync(EN_JSON, 'utf8'))) !== JSON.stringify(strings)) {
    console.warn(`site/i18n/en.json is out of date (${strings.length} strings now): run node site/i18n/extract.mjs and send the new ones to the translators.`);
  }
  const dicts = {};
  for (const l of SITE_LANGUAGES.filter((x) => x.dict)) {
    const dict = JSON.parse(readFileSync(dictFile(l.code), 'utf8'));
    const missing = strings.filter((en) => typeof dict[en] !== 'string' || !dict[en].trim());
    if (missing.length) {
      throw new Error(`site/i18n/${l.code}.json misses ${missing.length} of ${strings.length} strings, so /${l.code}/ would show English. The first:\n`
        + missing.slice(0, 10).map((m) => '  ' + m.slice(0, 100)).join('\n'));
    }
    dicts[l.code] = dict;
  }
  return dicts;
}

export function build() {
  const urls = [];
  const order = ['/', '/how-it-works', '/features', '/agents', '/pricing', '/results', '/faq', '/about', '/contact', '/privacy', '/terms'];
  const all = englishPages();
  const pages = new Set(all.map((x) => x.meta.path));
  const dicts = loadDictionaries(all);
  for (const l of LANGS.slice(1)) mkdirSync(join(ROOT, folderOf(l)), { recursive: true });
  for (const { meta, html: en } of all) {
    const gaps = missingTranslations(en, meta.path);
    // titleFr, titlePt, titleZh ... and the same for description: each language from French on has them when French does.
    const cap = (l) => l[0].toUpperCase() + l.slice(1);
    for (const k of ['title', 'description']) if (meta[k + 'Fr'])
      for (const l of ATTR_LANGS.slice(ATTR_LANGS.indexOf('fr') + 1)) if (!meta[k + cap(l)]) gaps.push(`${meta.path}: ${k}Fr without ${k}${cap(l)}`);
    if (gaps.length) throw new Error('Missing translations:\n' + gaps.join('\n'));
    // The 404 stays English-only: it is never indexed.
    for (const l of meta.noindex ? ['en'] : LANGS) {
      const out = join(ROOT, fileIn(meta.path, l));
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, localize(en, l, meta.path, pages, meta, dicts[l]));
    }
    if (!meta.noindex) urls.push([meta.path, meta.updated || TODAY]);
  }
  // Pages not in the list (the blog and its posts) after the ones that are, in path order.
  const rank = (u) => (order.indexOf(u) + 1 || order.length + 1);
  urls.sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]));
  writeFileSync(join(ROOT, 'sitemap.xml'), sitemap(urls));
  writeFileSync(join(ROOT, 'robots.txt'), ROBOTS);
  return urls.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await writeFlags(FLAG_ISOS());
  console.log(`site: ${build()} pages × ${LANGS.length} languages${INDEXABLE ? '' : ' (noindex, robots disallow all)'}`);
}
