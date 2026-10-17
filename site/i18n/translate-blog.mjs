#!/usr/bin/env node
/**
 * Translates the blog (17 Oct 2026). Posts are written in English with a `data-t` marker on every element to translate
 * (and `data-t-alt` beside an alt text). This script:
 *   1. fills data-es / data-fr / data-pt / data-zh (and their -alt) on every marked element of site/pages/blog.html and
 *      site/pages/blog/*.html, plus titleEs…/descriptionEs… and article.tagEs… in the metadata, then drops the markers;
 *   2. runs extract.mjs and translates, into every dictionary language, the English strings its JSON still misses.
 * Each language is asked with a glossary of the site's own translations, so the blog uses the words of the rest of the site.
 *
 *   ANTHROPIC_API_KEY=… node site/i18n/translate-blog.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGUAGES, attrKey, dictFile } from '../shell.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PAGES = join(HERE, '..', 'pages');
const KEY = process.env.ANTHROPIC_API_KEY;
if (!KEY) throw new Error('ANTHROPIC_API_KEY is not set');
const MODEL = process.env.MODEL || 'claude-sonnet-5-5';

const STYLE = {
  es: 'neutral Latin American Spanish, addressing the reader as “tú”, as the rest of the site does',
  fr: 'Canadian French (Québec usage: “courriel”), addressing the reader as “vous”',
  pt: 'Brazilian Portuguese, addressing the reader as “você”',
  zh: 'Simplified Chinese, mainland usage',
  'zh-Hant': 'Traditional Chinese as written in Taiwan (Taiwan vocabulary, 「」 quotes)',
  ja: 'Japanese, polite です/ます style',
  ko: 'Korean, polite 합니다 style',
  he: 'Hebrew, addressing the reader in plural or neutral form as the site does',
  ar: 'Modern Standard Arabic, Western digits (0-9)',
  it: 'Italian, addressing the reader as “tu”',
  de: 'German, addressing the reader as “Sie”',
  nl: 'Dutch, addressing the reader as “je”',
  hi: 'Hindi in Devanagari, everyday business Hindi, Western digits (0-9)',
  bn: 'Bengali (Bangla) as written in Bangladesh, in Bengali script, polite আপনি form, plain business Bengali; Western digits (0-9) for numbers and prices',
  ur: 'Urdu as written in Pakistan, in Urdu (Nastaliq) script, polite آپ form, plain business Urdu; Western digits (0-9) for numbers and prices',
};

/** Glossary: a few of the site's own short texts in that language (its menu, its features, its agents). */
function glossary(lang) {
  const en = JSON.parse(readFileSync(join(HERE, 'en.json'), 'utf8')).filter((s) => s.length < 60 && !/[<{]/.test(s)).slice(0, 220);
  if (LANGUAGES.find((l) => l.code === lang)?.dict) {
    const d = JSON.parse(readFileSync(dictFile(lang), 'utf8'));
    return en.filter((s) => d[s]).map((s) => `${s} => ${d[s]}`).join('\n');
  }
  // Attribute languages: pairs from the pages' own data-<lang>.
  const pairs = new Map();
  for (const f of readdirSync(PAGES).filter((x) => x.endsWith('.html'))) {
    const src = readFileSync(join(PAGES, f), 'utf8');
    for (const m of src.matchAll(new RegExp(`data-${lang}="([^"]{2,60})"[^>]*>([^<]{2,60})<`, 'g'))) pairs.set(m[2], m[1]);
  }
  return [...pairs].slice(0, 220).map(([a, b]) => `${a} => ${b}`).join('\n');
}

async function translate(lang, texts) {
  if (!texts.length) return [];
  const out = [];
  for (let i = 0; i < texts.length; i += 40) {
    const batch = texts.slice(i, i + 40);
    const system = `You translate the website of StockistScout (AI agents that find stores for brands and write to them) into ${STYLE[lang]}.
You get a JSON array of English texts; answer with ONLY a JSON array of the same length, each item the translation of the item at the same position.
Rules: keep every HTML tag, attribute and entity exactly (translate only the text between tags); keep names of products, people, agents and businesses (StockistScout, Katya, Elias, Clay & Fern, Lin, Maya, Ana) as they are; keep numbers, prices in US dollars and percentages exactly; keep URLs, email addresses, phone numbers, placeholders in braces like {email}, plan names, law names and the words quoted in another language (PUBLICIDAD, &lt;ADV&gt;, פרסומת, 不要再寄, Comunicación comercial no solicitada) exactly as they are; keep URLs, email addresses, phone numbers, placeholders in braces like {email}, plan names, law names and the words quoted in another language (PUBLICIDAD, &lt;ADV&gt;, פרסומת, 不要再寄, Comunicación comercial no solicitada) exactly as they are; translate “[three shops you admire]” keeping the square brackets.
Write naturally, the way a careful native copywriter would, faithful to the meaning, without adding or removing claims.
Use the site's existing terms; this glossary is how the site already says things in this language:
${glossary(lang)}`;
    let tries = 0;
    for (;;) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: MODEL, max_tokens: 16000, system, messages: [{ role: 'user', content: JSON.stringify(batch) }] }),
      });
      const d = await r.json();
      const text = d.content?.map((c) => c.text || '').join('') ?? '';
      try {
        const arr = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
        if (!Array.isArray(arr) || arr.length !== batch.length || arr.some((x) => typeof x !== 'string' || !x.trim())) throw new Error(`got ${arr.length} for ${batch.length}`);
        // The tags must survive: same tags, in the same order.
        const tags = (s) => (s.match(/<\/?[a-z][^>]*>/g) || []).map((t) => t.replace(/\s.*?>/, '>')).join('');
        batch.forEach((en, k) => { if (tags(en) !== tags(arr[k])) throw new Error(`tags changed in: ${en.slice(0, 60)}`); });
        out.push(...arr);
        break;
      } catch (e) {
        if (++tries > 3) throw new Error(`${lang}: ${e.message}\n${text.slice(0, 300)}`);
        console.warn(`${lang}: retry (${e.message})`);
      }
    }
  }
  return out;
}

const esc = (s) => s.replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/"/g, '&quot;');
const ATTR = LANGUAGES.filter((l) => !l.dict).map((l) => l.code).filter((l) => l !== 'en');
const cap = (l) => l[0].toUpperCase() + l.slice(1);

// 1. The attribute languages, in the blog's own files.
const files = ['blog.html', ...readdirSync(join(PAGES, 'blog')).filter((f) => f.endsWith('.html')).map((f) => `blog/${f}`)];
for (const f of files) {
  const path = join(PAGES, f);
  let src = readFileSync(path, 'utf8');
  const m = src.match(/^<!--(\{[\s\S]*?\})-->/);
  const meta = JSON.parse(m[1]);
  const els = [...src.matchAll(/<(\w+)([^>]*?) data-t>([\s\S]*?)<\/\1>/g)];
  const alts = [...src.matchAll(/alt="([^"]*)" data-t-alt/g)];
  const metaTexts = [meta.title, meta.description, ...(meta.article?.tag ? [meta.article.tag] : [])];
  const texts = [...els.map((e) => e[3]), ...alts.map((a) => a[1]), ...metaTexts];
  if (!els.length && !alts.length && meta.titleEs) continue;
  console.log(`${f}: ${texts.length} texts`);
  const done = Object.fromEntries(await Promise.all(ATTR.map(async (l) => [l, await translate(l, texts)])));
  // Rewritten by position, from the end, never with String.replace: a translation holding "$'" or "$&" (prices do)
  // would be read as a replacement pattern and paste other text into the page.
  const edits = [
    ...els.map((e, i) => ({ at: e.index, len: e[0].length, text: `<${e[1]}${e[2]}${ATTR.map((l) => ` data-${l}="${esc(done[l][i])}"`).join('')}>${e[3]}</${e[1]}>` })),
    ...alts.map((a, j) => ({ at: a.index, len: a[0].length, text: `alt="${a[1]}"` + ATTR.map((l) => ` data-${l}-alt="${esc(done[l][els.length + j])}"`).join('') })),
  ].sort((x, y) => y.at - x.at);
  for (const e of edits) src = src.slice(0, e.at) + e.text + src.slice(e.at + e.len);
  const k = els.length + alts.length;
  for (const l of ATTR) {
    meta['title' + cap(l)] = done[l][k];
    meta['description' + cap(l)] = done[l][k + 1];
    if (meta.article?.tag) meta.article['tag' + cap(l)] = done[l][k + 2];
  }
  src = `<!--${JSON.stringify(meta)}-->` + src.slice(m[0].length);
  writeFileSync(path, src);
}

// 2. The dictionary languages: whatever en.json has that their file does not.
execFileSync('node', [join(HERE, 'extract.mjs')], { stdio: 'inherit' });
const en = JSON.parse(readFileSync(join(HERE, 'en.json'), 'utf8'));
await Promise.all(LANGUAGES.filter((l) => l.dict && existsSync(dictFile(l.code))).map(async (l) => {
  // Only the strings the site still has: a text that changed or went away leaves no stale entry behind.
  const all = JSON.parse(readFileSync(dictFile(l.code), 'utf8'));
  const dict = Object.fromEntries(en.filter((s) => s in all).map((s) => [s, all[s]]));
  const missing = en.filter((s) => typeof dict[s] !== 'string' || !dict[s].trim());
  if (!missing.length) { writeFileSync(dictFile(l.code), JSON.stringify(dict, null, 1) + '\n'); return; }
  console.log(`${l.code}: ${missing.length} strings`);
  const t = await translate(l.code, missing);
  missing.forEach((s, i) => { dict[s] = t[i]; });
  writeFileSync(dictFile(l.code), JSON.stringify(dict, null, 1) + '\n');
}));
console.log('done');
