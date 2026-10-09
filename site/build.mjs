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
 * {{AVATAR:Name}} (one agent's picture).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { page, ctaBand, ctaButton, waitlistForm, CONTACT_EMAIL, ORIGIN, INDEXABLE, AGENTS, agentImg, attr } from './shell.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const PAGES = join(HERE, 'pages');

/* Home: avatar, name and specialty. The agents page adds what each one does. */
function agentCards(full) {
  return AGENTS.map((a) => `<li class="agent${full ? ' agent-full' : ''}">
  ${agentImg(a.name, full ? 112 : 80)}
  <span class="agent-name">${a.name}</span>
  <span class="agent-spec" data-es="${attr(a.specEs)}">${a.spec}</span>${full ? `
  <p data-es="${attr(a.doesEs)}">${a.does}</p>` : ''}
</li>`).join('\n');
}

function fill(html) {
  const out = html
    .replaceAll('{{CTA_BUTTON}}', ctaButton('btn-primary'))
    .replaceAll('{{CTA_BUTTON_LIGHT}}', ctaButton('btn-light'))
    .replaceAll('{{CTA}}', ctaBand())
    .replaceAll('{{WAITLIST_FORM}}', waitlistForm())
    .replaceAll('{{CONTACT_EMAIL}}', CONTACT_EMAIL)
    .replaceAll('{{AGENTS}}', agentCards(false))
    .replaceAll('{{AGENTS_FULL}}', agentCards(true))
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

function sitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, d]) => `  <url><loc>${ORIGIN}${u}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
}

/* Until launch (INDEXABLE false) nothing is crawled; every page also carries noindex. */
const ROBOTS = INDEXABLE
  ? `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`
  : `# Pre-launch: the site is not to be indexed yet. Flip INDEXABLE in site/shell.mjs at launch.\nUser-agent: *\nDisallow: /\n`;

export function build() {
  const urls = [];
  const order = ['/', '/how-it-works', '/features', '/agents', '/pricing', '/faq', '/about', '/contact', '/privacy', '/terms'];
  for (const file of readdirSync(PAGES).filter((f) => f.endsWith('.html')).sort()) {
    const { meta, body } = readPage(file);
    writeFileSync(join(ROOT, outFile(meta.path)), page({ ...meta, body: fill(body) }));
    if (!meta.noindex) urls.push([meta.path, meta.updated || null]);
  }
  urls.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  writeFileSync(join(ROOT, 'sitemap.xml'), sitemap(urls));
  writeFileSync(join(ROOT, 'robots.txt'), ROBOTS);
  return urls.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`site: ${build()} pages${INDEXABLE ? '' : ' (noindex, robots disallow all)'}`);
}
