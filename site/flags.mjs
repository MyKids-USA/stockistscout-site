/**
 * The small flags on the country chips of "Where our agents find stores" (#countries; Aharon, 17 Oct 2026): real flags,
 * never the flag emoji (Windows shows those as two letters). They come from flag-icons (lipis/flag-icons, MIT licence,
 * pinned in package.json), the 4x3 SVGs, one per iso code of COUNTRIES and COMING_SOON in shell.mjs, so a new country
 * gets its flag by itself. The build writes them to img/flags/: each one through svgo, as <iso>.svg; a flag whose
 * emblem leaves it over MAX_SVG bytes even then (Mexico's eagle is 84 KB) is drawn instead as a 60x45 PNG, three
 * times the 20x15 it is shown at, <iso>.png, which looks the same at that size and weighs a few hundred bytes.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { optimize } from 'svgo';

const require = createRequire(import.meta.url);
const OUT = new URL('../img/flags/', import.meta.url);
const MAX_SVG = 8000;

const svgs = new Map();
/** A flag's optimised SVG text (cached). */
function svgOf(iso) {
  const code = iso.toLowerCase();
  if (!svgs.has(code)) {
    const raw = readFileSync(require.resolve(`flag-icons/flags/4x3/${code}.svg`), 'utf8');
    svgs.set(code, optimize(raw, { multipass: true, plugins: ['preset-default'] }).data);
  }
  return svgs.get(code);
}
/** The published file name of a flag: <iso>.svg, or <iso>.png when its SVG is too heavy. */
export const flagFile = (iso) => `${iso.toLowerCase()}.${svgOf(iso).length > MAX_SVG ? 'png' : 'svg'}`;

/** The <img> before a country's name: decorative (the name follows), lazy, the same box for every flag. */
export const flagImg = (iso) => `<img class="flag" src="/img/flags/${flagFile(iso)}" width="20" height="15" alt="" aria-hidden="true" loading="lazy" decoding="async">`;

/** Writes img/flags/ for these iso codes (build.mjs, before the pages). PNGs only when missing or older than the package. */
export async function writeFlags(isos) {
  mkdirSync(OUT, { recursive: true });
  let sharp = null;
  for (const iso of [...new Set(isos.map((i) => i.toLowerCase()))]) {
    const file = flagFile(iso);
    const to = new URL(file, OUT);
    if (file.endsWith('.svg')) { writeFileSync(to, svgOf(iso)); continue; }
    if (existsSync(to)) continue; // already drawn (committed): the same flag-icons version draws the same PNG
    sharp ??= (await import('sharp')).default;
    const png = await sharp(Buffer.from(svgOf(iso))).resize(60, 45).png({ compressionLevel: 9, palette: true }).toBuffer();
    writeFileSync(to, png);
  }
}
