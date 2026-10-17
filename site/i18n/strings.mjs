/**
 * The English strings a dictionary language (site/i18n/<lang>.json) must translate, gathered the same way by
 * extract.mjs (which writes en.json for the translators) and by build.mjs (which refuses a dictionary missing one):
 * - on every built page (not the 404): its title and description, the inner HTML of every element that has data-pt,
 *   and the English alt / aria-label / placeholder of every element with data-pt-alt / -label / -placeholder.
 *   An element that already carries the language's own attribute (the language menu names each language in itself)
 *   is left out: its own attribute wins.
 * - SCRIPT_STRINGS: what scripts show, which the build hands to dictionary pages as window.SS_I18N: the English of
 *   every L(...) in katya.js, the waitlist messages (MSG in shell.mjs), and the "Why it fits:" label of the home mock.
 * Keys are the English exactly as the built page holds it (inner HTML as linkedom serialises it), so a change to an
 * English text is a new key: run `node site/i18n/extract.mjs` and send the new strings to the translators.
 */
import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { LANGUAGES, MSG } from '../shell.mjs';

export const DICT_LANGS = LANGUAGES.filter((l) => l.dict).map((l) => l.code);
/** The attribute variants a dictionary covers: [html attribute, data-<lang>-<key> suffix]. Images and links stay English. */
export const ATTRS = [['alt', 'alt'], ['aria-label', 'label'], ['placeholder', 'placeholder']];
/** The label in front of each reason in the home page's mock (a CSS ::before), translated through the dictionary. */
export const WHY_LABEL = 'Why it fits:';

/** The English (second argument) of every L(es, en, fr, pt, zh) call in katya.js; each argument one quoted string. */
export function katyaStrings(src = readFileSync(new URL('../../katya.js', import.meta.url), 'utf8')) {
  const out = [];
  const re = /(^|[^\w$.])L\(/g;
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length;
    const args = [];
    for (;;) {
      while (/\s/.test(src[i])) i++;
      const q = src[i];
      if (q !== "'" && q !== '"') throw new Error(`katya.js: L(...) at ${i} has an argument that is not a plain string`);
      let j = i + 1;
      while (src[j] !== q) { if (src[j] === '\\') j++; j++; if (j >= src.length) throw new Error('katya.js: unterminated string'); }
      args.push(new Function(`return ${src.slice(i, j + 1)};`)()); // our own file: the literal exactly as JavaScript reads it
      i = j + 1;
      while (/\s/.test(src[i])) i++;
      if (src[i] === ',') { i++; continue; }
      if (src[i] === ')') break;
      throw new Error(`katya.js: L(...) at ${m.index} joins strings with "${src[i]}": use one string and .replace() after the call`);
    }
    if (args.length < 2) throw new Error(`katya.js: L(...) at ${m.index} has no English`);
    out.push(args[1]);
  }
  if (!out.length) throw new Error('katya.js: no L(...) texts found');
  return out;
}

export function scriptStrings() {
  return [...katyaStrings(), ...Object.values(MSG).map((m) => m.en), WHY_LABEL];
}

/** The strings of one built English page (see above). */
export function pageStrings(html, meta, problems = []) {
  if (meta.noindex) return [];
  const out = [meta.title, meta.description];
  const { document } = parseHTML(html);
  const own = (el, key) => DICT_LANGS.some((l) => el.hasAttribute(`data-${l}${key}`));
  for (const el of document.querySelectorAll('[data-pt]')) {
    if (el.tagName === 'TITLE' || own(el, '')) continue;
    if (el.querySelector('[data-pt]')) problems.push(`${meta.path}: <${el.tagName.toLowerCase()}> with data-pt holds another element with data-pt`);
    out.push(el.innerHTML);
  }
  for (const [a, key] of ATTRS) for (const el of document.querySelectorAll(`[data-pt-${key}]`)) {
    if (!own(el, `-${key}`) && el.hasAttribute(a)) out.push(el.getAttribute(a));
  }
  return out;
}

/** Every string, unique, in the order first met: pages (as build.mjs makes them), then the scripts. */
export function collectStrings(pages, problems = []) {
  const all = pages.flatMap(({ html, meta }) => pageStrings(html, meta, problems)).concat(scriptStrings());
  return [...new Set(all.filter((s) => s != null && String(s).trim() !== ''))];
}
