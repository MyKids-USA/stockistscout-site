#!/usr/bin/env node
/**
 * Writes site/i18n/en.json: every English string a dictionary language translates (site/i18n/strings.mjs says which),
 * unique, in the order the site shows them, inner HTML as-is. And site/i18n/chunks/en-1.json ... en-<n>.json: the same
 * list cut into <n> files of about the same size (in characters) for translators, default 4.
 *
 *   node site/i18n/extract.mjs [chunks]
 *
 * A translator returns each chunk as {english: translation}, the English exactly as given (tags, entities, the
 * {email} placeholder and punctuation inside tags kept); the chunks of one language are merged into site/i18n/<lang>.json.
 */
import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { englishPages, EN_JSON } from '../build.mjs';
import { collectStrings } from './strings.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const n = Math.max(1, parseInt(process.argv[2] || '4', 10));

const problems = [];
const strings = collectStrings(englishPages(), problems);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
writeFileSync(EN_JSON, JSON.stringify(strings, null, 1) + '\n');

// Chunks: consecutive runs of about the same number of characters, so a page's texts stay together.
const total = strings.reduce((a, s) => a + s.length, 0);
const chunks = Array.from({ length: n }, () => []);
let acc = 0;
for (const s of strings) {
  const i = Math.min(n - 1, Math.floor((acc + s.length / 2) / (total / n)));
  chunks[i].push(s); acc += s.length;
}
const dir = join(HERE, 'chunks');
mkdirSync(dir, { recursive: true });
for (const f of readdirSync(dir)) if (/^en-\d+\.json$/.test(f)) rmSync(join(dir, f));
chunks.forEach((c, i) => writeFileSync(join(dir, `en-${i + 1}.json`), JSON.stringify(c, null, 1) + '\n'));

const words = strings.reduce((a, s) => a + s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length, 0);
console.log(`site/i18n/en.json: ${strings.length} strings, ${total} characters, about ${words} words`);
chunks.forEach((c, i) => console.log(`  chunks/en-${i + 1}.json: ${c.length} strings, ${c.reduce((a, s) => a + s.length, 0)} characters`));
