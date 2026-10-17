/**
 * The world map of the "Where our agents find stores" section (#countries, home and pricing; 18 Oct 2026), drawn at
 * BUILD time into a static inline SVG: no map library and no request when the page loads. world-atlas 110m
 * (Natural Earth, numeric ISO 3166-1 ids) through topojson-client, projected by d3-geo (Natural Earth projection,
 * Antarctica removed), coordinates rounded to whole units of a 1000-wide viewBox and written as relative moves (compactPath).
 *
 * Which countries are green, and which is "coming soon", comes from COUNTRIES and COMING_SOON in shell.mjs (their
 * iso/num fields), the same list as the chips, the FAQ and the Terms. The SVG carries English names in its <title>s;
 * build.mjs (localizeMap) writes each language's names and the aria-label after the page is translated.
 *
 * A covered country smaller than MIN_AREA (Israel; Singapore and Hong Kong are not even in the 110m file) is also drawn
 * as a dot with a ring, at its `at` [lon, lat] or at its centroid.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoNaturalEarth1, geoPath } from 'd3-geo';

const require = createRequire(import.meta.url);
const W = 1000;
const MIN_AREA = 25; // square units of the 1000-wide viewBox: Israel (19) gets a dot, Belgium (30, beside France) does not
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** A d3-geo path context that writes compact SVG: whole units, relative moves, repeated points dropped (about a
    third of d3's own output, which repeats absolute coordinates). Positions are rounded before differencing, so
    nothing drifts. */
function compactPath() {
  let d = '', x = 0, y = 0, n = 0;
  const pair = (a, b) => `${a}${b < 0 ? '' : ' '}${b}`;
  return {
    moveTo(px, py) { const a = Math.round(px), b = Math.round(py); d += `M${pair(a, b)}`; x = a; y = b; n = 0; },
    lineTo(px, py) {
      const a = Math.round(px), b = Math.round(py);
      if (a === x && b === y) return;
      d += `${n++ ? (a - x < 0 ? '' : ' ') : 'l'}${pair(a - x, b - y)}`; x = a; y = b;
    },
    closePath() { d += 'z'; },
    arc() {}, // points (never drawn here)
    result() { const r = d; d = ''; return r; },
  };
}

let cache = null;
/** The map as an SVG string. `covered` and `soon`: [{ iso, num, en, at? }]. */
export function worldMapSvg(covered, soon) {
  const key = JSON.stringify([covered, soon]);
  if (cache?.key === key) return cache.svg;
  const topo = JSON.parse(readFileSync(require.resolve('world-atlas/countries-110m.json'), 'utf8'));
  const world = feature(topo, topo.objects.countries);
  world.features = world.features.filter((f) => f.id !== '010'); // Antarctica
  const projection = geoNaturalEarth1().fitWidth(W, world);
  const path = geoPath(projection).digits(1);
  const ctx = compactPath();
  const draw = geoPath(projection, ctx);
  const d = (f) => { draw(f); return ctx.result().replace(/M[^Mz]*z(?=M|$)/g, (r) => /l/.test(r) ? r : ''); };
  const [[, y0], [, y1]] = path.bounds(world);
  const H = Math.ceil(y1 - y0);
  projection.translate([projection.translate()[0], projection.translate()[1] - y0]);

  const byNum = new Map(world.features.map((f) => [f.id, f]));
  const special = new Set([...covered, ...soon].map((c) => c.num));
  const rest = world.features.filter((f) => !special.has(f.id)).map(d).join('');
  const shape = (c, cls, name) => {
    const f = byNum.get(c.num);
    const dd = f ? d(f) : '';
    const out = [];
    if (dd) out.push(`<path class="${cls}" data-iso="${c.iso}" d="${dd}"><title>${esc(name)}</title></path>`);
    if (!dd || path.area(f) < MIN_AREA) {
      const p = c.at ? projection(c.at) : path.centroid(f);
      if (!p || p.some(Number.isNaN)) throw new Error(`map: no place for ${c.iso} (give it at: [lon, lat])`);
      const [x, y] = p.map((v) => Math.round(v * 10) / 10);
      out.push(`<g class="${cls} cmap-dot" data-iso="${c.iso}"><circle cx="${x}" cy="${y}" r="7" class="cmap-ring"/><circle cx="${x}" cy="${y}" r="3.2"/><title>${esc(name)}</title></g>`);
    }
    return out.join('');
  };
  const svg = `<svg class="cmap" viewBox="0 0 ${W} ${H}" dir="ltr" role="img" aria-label="" focusable="false" xmlns="http://www.w3.org/2000/svg">`
    + `<path class="cmap-land" d="${rest}"/>`
    + soon.map((c) => shape(c, 'cmap-soon', c.en)).join('')
    + covered.map((c) => shape(c, 'cmap-on', c.en)).join('')
    + `</svg>`;
  cache = { key, svg };
  return svg;
}
