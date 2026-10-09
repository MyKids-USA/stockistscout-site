/**
 * The one shell every public page is built from: head, header with the menu, footer and
 * the language script. Change the menu here and run `npm run build`; every page picks it
 * up, because build.mjs re-wraps all of them. Modelled on trademarkscanner.app.
 *
 * Bilingual the bins-usa.com way: English is the real text in the HTML (what search
 * engines index), Spanish rides along in data-es, and the script swaps it in. The
 * visitor's choice is remembered; a first visit follows the browser language.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const ORIGIN = 'https://stockistscout.com';
export const COMPANY = 'Aharon &amp; Ita Corp';

/* Launch switches.
   INDEXABLE: false puts <meta name="robots" content="noindex"> on every page and a
   robots.txt that disallows everything. Flip to true at launch, build, push.
   WAITLIST_OPEN: true since 8 Oct 2026. The form posts to WAITLIST_API (the WMS Cloud
   API, POST /api/stockistscout/waitlist, table wms.stockistscout_waitlist) until
   StockistScout has a backend of its own; each sign-up is emailed to Aharon there. */
export const INDEXABLE = true;
export const WAITLIST_OPEN = true;
export const WAITLIST_API = 'https://api.binsusa.com/api/stockistscout/waitlist';
/* The public address (Aharon, 8 Oct 2026). Mail to it is forwarded by Cloudflare Email
   Routing once that is set up; the waitlist never depends on it. */
export const CONTACT_EMAIL = 'sales@stockistscout.com';

export const CTA_URL = '/contact';
export const CTA_LABEL = WAITLIST_OPEN ? 'Join the waitlist' : 'Coming soon';
export const CTA_LABEL_ES = WAITLIST_OPEN ? 'Únete a la lista de espera' : 'Próximamente';

/** The one call-to-action button; `cls` is the button style of the place it sits in. */
export function ctaButton(cls) {
  return `<a class="btn ${cls}" href="${CTA_URL}" data-es="${attr(CTA_LABEL_ES)}">${CTA_LABEL}</a>`;
}

/** Changes whenever site.css changes, so a browser never pairs new HTML with an old cached stylesheet. */
const CSS_VERSION = createHash('sha256').update(readFileSync(new URL('../site.css', import.meta.url))).digest('hex').slice(0, 10);

export const NAV = [
  ['/', 'Home', 'Inicio'],
  ['/how-it-works', 'How it works', 'Cómo funciona'],
  ['/features', 'Features', 'Funciones'],
  ['/agents', 'Meet our agents', 'Conoce a nuestros agentes'],
  ['/pricing', 'Pricing', 'Precios'],
  ['/results', 'Results', 'Resultados'],
  ['/faq', 'FAQ', 'Preguntas'],
  ['/about', 'About', 'Quiénes somos'],
  ['/contact', 'Contact', 'Contacto'],
];

/* The eight agents (names fixed by the owner: first names only, never surnames, ages or
   any personal detail). Each specialises in one kind of store; when a customer describes
   an ideal customer, the agent for that store type is assigned. Plans include 1 to 8.
   The picture is img/agents/agent-<name>.png, square; today a placeholder made by
   site/avatars.mjs, later replaced by the cartoon portraits with the same file names. */
export const AGENTS = [
  { name: 'Tammy', spec: 'Baby &amp; kids’ clothing stores', specEs: 'Tiendas de ropa de bebé e infantil',
    does: 'Looks for children’s boutiques and baby stores whose range and price point fit your line, and writes to each one about why it belongs on their shelves.',
    doesEs: 'Busca boutiques infantiles y tiendas de bebé cuyo surtido y precios encajan con tu línea, y le escribe a cada una por qué merece estar en sus estantes.' },
  { name: 'Elias', spec: 'Gift, home &amp; décor shops', specEs: 'Tiendas de regalos, hogar y decoración',
    does: 'Finds gift shops, home stores and décor boutiques that carry products like yours, and introduces your brand to the person who buys for them.',
    doesEs: 'Encuentra tiendas de regalos, de hogar y de decoración que venden productos como los tuyos, y le presenta tu marca a quien compra para ellas.' },
  { name: 'Raquel', spec: 'Fashion &amp; accessories boutiques', specEs: 'Boutiques de moda y accesorios',
    does: 'Searches for fashion and accessories boutiques whose style and prices match yours, and writes to each one personally.',
    doesEs: 'Busca boutiques de moda y accesorios con un estilo y unos precios como los tuyos, y le escribe a cada una de forma personal.' },
  { name: 'Roberto', spec: 'Wholesalers, distributors &amp; warehouses', specEs: 'Mayoristas, distribuidores y almacenes',
    does: 'Finds wholesalers, distributors and warehouses that could carry your line in volume, and opens the conversation on your behalf.',
    doesEs: 'Encuentra mayoristas, distribuidores y almacenes que podrían llevar tu línea por volumen, y abre la conversación en tu nombre.' },
  { name: 'Rony', spec: 'Sports, outdoor &amp; adventure stores', specEs: 'Tiendas de deportes, aire libre y aventura',
    does: 'Looks for sporting goods, outdoor and adventure stores where your products fit, and tells each one why.',
    doesEs: 'Busca tiendas de deportes, de aire libre y de aventura donde tus productos encajan, y le explica a cada una por qué.' },
  { name: 'Gabriel', spec: 'Beauty, personal care &amp; wellness', specEs: 'Belleza, cuidado personal y bienestar',
    does: 'Finds beauty, personal-care and wellness shops that suit your products, and writes each one a note about what you can offer them.',
    doesEs: 'Encuentra tiendas de belleza, cuidado personal y bienestar que van con tus productos, y le escribe a cada una lo que le puedes ofrecer.' },
  { name: 'Aaron', spec: 'Pet stores', specEs: 'Tiendas de mascotas',
    does: 'Searches for independent pet stores and pet boutiques that fit your line, and introduces your products to them.',
    doesEs: 'Busca tiendas de mascotas independientes y boutiques para mascotas que encajan con tu línea, y les presenta tus productos.' },
  { name: 'Joel', spec: 'Toys, games &amp; hobby shops', specEs: 'Jugueterías, juegos y hobbies',
    does: 'Finds toy stores, game shops and hobby stores that match your range, and writes to each one about your products.',
    doesEs: 'Encuentra jugueterías, tiendas de juegos y de hobbies que encajan con tu surtido, y le escribe a cada una sobre tus productos.' },
];

/** One agent's picture: a fixed square slot, the same file name for the placeholder and the final portrait. */
export function agentImg(name, size, lazy = true) {
  const file = `/img/agents/agent-${name.toLowerCase()}.png`;
  // The file name never changes when a portrait is replaced, so the URL carries a hash of
  // its bytes: a new portrait is a new URL, and no cache keeps showing the old one.
  const v = createHash('sha1').update(readFileSync(new URL(`..${file}`, import.meta.url))).digest('hex').slice(0, 8);
  return `<img class="avatar" src="${file}?v=${v}" alt="" width="${size}" height="${size}"${lazy ? ' loading="lazy"' : ''} decoding="async">`;
}

export const esc = (t) => String(t)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Attribute value for data-es when the Spanish already contains markup (strong, a, b):
   only quotes and ampersands need escaping inside a double-quoted attribute. */
export const attr = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const FONTS = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap';

function head({ path, title, titleEs, description }) {
  const url = ORIGIN + (path === '/' ? '/' : path);
  const full = path === '/' ? title : `${title} | StockistScout`;
  const fullEs = titleEs ? (path === '/' ? titleEs : `${titleEs} | StockistScout`) : null;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title${fullEs ? ` data-es="${attr(fullEs)}"` : ''}>${full}</title>
<meta name="description" content="${esc(description)}">
${INDEXABLE ? '' : '<meta name="robots" content="noindex">\n'}<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="StockistScout">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ORIGIN}/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="StockistScout: AI agents that find the stores to carry your products.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${ORIGIN}/img/og.png">
<meta name="theme-color" content="#0F2A4A">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="/site.css?v=${CSS_VERSION}">
</head>`;
}

/** The horizontal logo, with the light-text version when the system is in dark mode. */
function logo(w, h, extra = '') {
  return `<picture><source srcset="/img/logo-dark-520.png" media="(prefers-color-scheme: dark)"><img src="/img/logo-520.png" alt="StockistScout" width="${w}" height="${h}"${extra}></picture>`;
}

function header(path) {
  const links = NAV.map(([href, en, es]) => {
    const on = path === href ? ' aria-current="page"' : '';
    return `      <a href="${href}"${on} data-es="${attr(es)}">${en}</a>`;
  }).join('\n');
  return `<a class="skip" href="#main" data-es="Ir al contenido">Skip to content</a>
<header class="site-head">
  <div class="head-row">
    <a class="brand" href="/" aria-label="StockistScout, home" data-es-label="StockistScout, inicio">
      ${logo(196, 52, ' fetchpriority="high"')}
    </a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu">
      <span class="bars" aria-hidden="true"></span><span class="sr" data-es="Menú">Menu</span>
    </button>
    <nav id="site-menu" class="site-nav" aria-label="Main">
      <div class="nav-links">
${links}
      </div>
      <div class="nav-end">
        <div class="lang" id="langToggle" role="group" aria-label="Language">
          <button type="button" data-lang="en" aria-pressed="true">English</button>
          <button type="button" data-lang="es" aria-pressed="false">Español</button>
        </div>
      </div>
    </nav>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-foot">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <a class="foot-logo" href="/" aria-label="StockistScout, home" data-es-label="StockistScout, inicio"><img src="/img/logo-dark-520.png" alt="StockistScout" width="196" height="52" loading="lazy"></a>
      <p data-es="Agentes de IA que encuentran tiendas que encajan con tus productos y les escriben en nombre de tu negocio. Solo B2B: tiendas, nunca consumidores.">AI agents that find stores that fit your products and write to them on behalf of your business. B2B only: stores, never consumers.</p>
      <p class="disclaimer" data-es="Abre pronto: únete a la lista de espera. Ningún resultado de ventas está garantizado.">Opening soon: join the waitlist. No sales results are guaranteed.</p>
    </div>
    <nav aria-label="Product" data-es-label="Producto">
      <h2 data-es="Producto">Product</h2>
      <a href="/how-it-works" data-es="Cómo funciona">How it works</a>
      <a href="/features" data-es="Funciones">Features</a>
      <a href="/pricing" data-es="Precios">Pricing</a>
      <a href="/results" data-es="Resultados">Results</a>
      <a href="/faq" data-es="Preguntas frecuentes">FAQ</a>
    </nav>
    <nav aria-label="Company" data-es-label="Empresa">
      <h2 data-es="Empresa">Company</h2>
      <a href="/about" data-es="Quiénes somos">About</a>
      <a href="/contact" data-es="Contacto">Contact</a>
      <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
      <a href="/privacy" data-es="Privacidad">Privacy</a>
      <a href="/terms" data-es="Términos">Terms</a>
    </nav>
    <nav aria-label="Our other products" data-es-label="Nuestros otros productos">
      <h2 data-es="Del mismo equipo">From the same team</h2>
      <a href="https://www.mykids-usa.com" rel="noopener">MyKids-USA</a>
      <a href="https://drop-usa.com" rel="noopener">Drop-USA</a>
      <a href="https://bins-usa.com" rel="noopener">Bins-USA</a>
      <a href="https://trademarkscanner.app" rel="noopener">ScanRights</a>
    </nav>
  </div>
  <div class="wrap foot-legal">
    <span data-es="© 2026 ${COMPANY}. Todos los derechos reservados.">© 2026 ${COMPANY}. All rights reserved.</span>
    <span data-es="Florida, Estados Unidos.">Florida, United States.</span>
  </div>
</footer>`;
}

/* Included exactly once per page (the bins-usa.com lesson: a script included twice
   ran twice). The guard makes a second copy harmless anyway. No regex literals in here:
   this is a template literal and a backslash would be eaten before the browser sees it. */
const SCRIPT = `<script>
(function () {
  if (window.__ssSite) return; window.__ssSite = true;
  var KEY = 'ss_lang';
  function swap(sel, attrName, enKey, esKey, lang) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.dataset[enKey] === undefined) el.dataset[enKey] = el.getAttribute(attrName) || '';
      el.setAttribute(attrName, (lang === 'es') ? el.dataset[esKey] : el.dataset[enKey]);
    });
  }
  function apply(lang) {
    document.querySelectorAll('[data-es]').forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = (lang === 'es') ? el.dataset.es : el.dataset.en;
    });
    swap('[data-es-alt]', 'alt', 'enAlt', 'esAlt', lang);
    swap('[data-es-placeholder]', 'placeholder', 'enPlaceholder', 'esPlaceholder', lang);
    swap('[data-es-label]', 'aria-label', 'enLabel', 'esLabel', lang);
    document.documentElement.lang = (lang === 'es') ? 'es' : 'en';
    document.querySelectorAll('#langToggle button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false');
    });
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }
  /* Waitlist form: posts JSON to the address in data-waitlist and confirms on screen. */
  var LOADED = Date.now();
  var MSG = {
    ok: { en: '<strong>You are on the list. Thank you.</strong> We will write to you when StockistScout opens. We do not send a confirmation email yet, so this message is your confirmation.',
          es: '<strong>Ya estás en la lista. Gracias.</strong> Te escribiremos cuando StockistScout abra. Todavía no enviamos un correo de confirmación, así que este mensaje es tu confirmación.' },
    sending: { en: 'Sending…', es: 'Enviando…' },
    fix: { en: 'Please check the highlighted fields.', es: 'Revisa los campos marcados.' },
    many: { en: 'Too many tries from this connection. Please wait an hour, or write to <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            es: 'Demasiados intentos desde esta conexión. Espera una hora o escríbenos a <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.' },
    fail: { en: 'We could not send it. Check your connection and try again, or write to <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            es: 'No pudimos enviarlo. Revisa tu conexión y vuelve a intentarlo, o escríbenos a <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.' }
  };
  function curLang() { return document.documentElement.lang === 'es' ? 'es' : 'en'; }
  function say(el, m) {
    el.dataset.en = m.en; el.dataset.es = m.es;
    el.innerHTML = m[curLang()];
    el.hidden = false;
  }
  function looksLikeEmail(v) {
    var at = v.indexOf('@');
    return at > 0 && v.indexOf('.', at) > at + 1 && v.indexOf(' ') < 0 && v.length <= 254;
  }
  function wireWaitlist(form) {
    var url = form.getAttribute('data-waitlist');
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type=submit]');
    var lang = form.querySelector('select[name=language]');
    if (lang) {
      lang.value = curLang();
      lang.addEventListener('change', function () { lang.dataset.touched = '1'; });
      document.querySelectorAll('#langToggle button').forEach(function (b) {
        b.addEventListener('click', function () { if (!lang.dataset.touched) lang.value = b.dataset.lang; });
      });
    }
    function mark(name, bad) {
      var input = form.elements[name];
      var err = document.getElementById(input.id + '-err');
      if (bad) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
      if (err) err.hidden = !bad;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var data = {
        email: f.email.value.trim(), company: f.company.value.trim(), website: f.website.value.trim(),
        sells: f.sells.value.trim(), language: lang ? lang.value : curLang(), nickname: f.nickname.value,
        elapsed_ms: Date.now() - LOADED, page: location.pathname
      };
      var bad = { email: !looksLikeEmail(data.email), company: data.company.length < 2, sells: data.sells.length < 3, website: false };
      ['email', 'company', 'sells', 'website'].forEach(function (k) { mark(k, bad[k]); });
      if (bad.email || bad.company || bad.sells) {
        say(status, MSG.fix);
        var first = form.querySelector('[aria-invalid=true]'); if (first) first.focus();
        return;
      }
      var label = { en: btn.dataset.en || btn.innerHTML, es: btn.dataset.es };
      btn.disabled = true; say(btn, MSG.sending); status.hidden = true;
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), credentials: 'omit' })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { code: r.status, body: j }; }); })
        .then(function (res) {
          if (res.code === 200 && res.body.ok) {
            var done = document.createElement('div');
            done.className = 'note'; done.setAttribute('role', 'status'); done.setAttribute('tabindex', '-1');
            done.innerHTML = '<p></p>';
            say(done.firstChild, MSG.ok);
            done.firstChild.setAttribute('data-es', MSG.ok.es);
            form.replaceChildren(done);
            done.focus();
            return;
          }
          btn.disabled = false; say(btn, label);
          if (res.code === 400 && res.body.fields) {
            Object.keys(res.body.fields).forEach(function (k) { if (form.elements[k]) mark(k, true); });
            say(status, MSG.fix);
          } else if (res.code === 429) say(status, MSG.many);
          else say(status, MSG.fail);
        })
        .catch(function () { btn.disabled = false; say(btn, label); say(status, MSG.fail); });
    });
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var start = saved || ((navigator.language || 'en').toLowerCase().indexOf('es') === 0 ? 'es' : 'en');
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#langToggle button').forEach(function (b) {
      b.addEventListener('click', function () { apply(b.dataset.lang); });
    });
    var btn = document.querySelector('.menu-btn');
    var head = document.querySelector('.site-head');
    if (btn && head) {
      btn.addEventListener('click', function () {
        var open = head.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && head.classList.contains('open')) { head.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
      });
    }
    if (start === 'es') apply('es');
    // After apply: the language select starts on the language the page is shown in.
    document.querySelectorAll('form[data-waitlist]').forEach(wireWaitlist);
  });
})();
</script>`;

/** A complete page: shell around a body fragment. */
export function page({ path, title, titleEs, description, body }) {
  return `${head({ path, title, titleEs, description })}
<body>
${header(path)}
<main id="main" tabindex="-1">
${body.trim()}
</main>
${footer()}
${SCRIPT}
</body>
</html>
`;
}

/** The closing call to action used at the bottom of most pages. */
export function ctaBand() {
  return `<section class="cta-band">
  <div class="wrap cta-inner">
    <div>
      <h2 data-es="Deja que un agente encuentre tus próximas tiendas.">Let an agent find your next stockists.</h2>
      <p data-es="StockistScout abre pronto. Únete a la lista de espera y te escribiremos cuando haya lugar.">StockistScout opens soon. Join the waitlist and we will write when there is room.</p>
    </div>
    <div class="cta-actions">
      ${ctaButton('btn-light')}
      <a class="btn btn-outline-light" href="/pricing" data-es="Ver precios">See pricing</a>
    </div>
  </div>
</section>`;
}

/** The placeholder portrait (site/avatars.mjs renders it to PNG): the agent's initial on
    a brand gradient with a small magnifier. Pages use agentImg, never this directly. */
export function avatar(name, i, size = 64) {
  const hues = [
    ['#1FA57E', '#1E6FB0'], ['#1E6FB0', '#0F2A4A'], ['#2DBE8C', '#1E8FC0'], ['#155FA0', '#1FA57E'],
    ['#0F2A4A', '#1FA57E'], ['#1E8FC0', '#155FA0'], ['#1FA57E', '#0F2A4A'], ['#1E6FB0', '#2DBE8C'],
  ][i % 8];
  const id = `av${i}`;
  return `<svg class="avatar" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hues[0]}"/><stop offset="1" stop-color="${hues[1]}"/></linearGradient></defs>
<circle cx="32" cy="32" r="32" fill="url(#${id})"/>
<text x="29" y="41" text-anchor="middle" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="800" font-size="27" fill="#fff">${name[0]}</text>
<g transform="translate(46 46)"><circle r="9" fill="#fff"/><circle cx="-1.3" cy="-1.3" r="3.8" fill="none" stroke="#0F2A4A" stroke-width="1.9"/><path d="M1.4 1.4l3 3" stroke="#0F2A4A" stroke-width="2" stroke-linecap="round"/></g>
</svg>`;
}

/* The waitlist form ({{WAITLIST_FORM}} in a page). One per page: the ids are fixed.
   The honeypot (nickname) is off-screen and out of the tab order; people never see it,
   form-filling bots do. The script in SCRIPT posts it to WAITLIST_API and shows the
   confirmation on screen: StockistScout sends no email to the subscriber yet. */
export function waitlistForm() {
  return `<form class="card contact-form" data-waitlist="${WAITLIST_API}" novalidate>
  <fieldset>
    <legend class="sr" data-es="Únete a la lista de espera">Join the waitlist</legend>
    <div class="field-row">
      <div class="field">
        <label for="wl-email" data-es="Correo electrónico">Email</label>
        <input type="email" id="wl-email" name="email" autocomplete="email" required maxlength="254" aria-describedby="wl-email-err">
        <p class="field-err" id="wl-email-err" hidden data-es="Escribe un correo válido.">Enter a valid email.</p>
      </div>
      <div class="field">
        <label for="wl-company" data-es="Empresa">Company</label>
        <input type="text" id="wl-company" name="company" autocomplete="organization" required maxlength="200" aria-describedby="wl-company-err">
        <p class="field-err" id="wl-company-err" hidden data-es="Escribe el nombre de tu empresa.">Enter your company name.</p>
      </div>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="wl-site"><span data-es="Sitio web">Website</span> <span class="opt" data-es="(opcional)">(optional)</span></label>
        <input type="text" id="wl-site" name="website" inputmode="url" autocomplete="url" maxlength="300" placeholder="yourbrand.com" data-es-placeholder="tumarca.com" aria-describedby="wl-site-err">
        <p class="field-err" id="wl-site-err" hidden data-es="Ese sitio web no parece válido.">That website does not look right.</p>
      </div>
      <div class="field">
        <label for="wl-lang" data-es="Idioma para escribirte">Language we write to you in</label>
        <select id="wl-lang" name="language">
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>
    </div>
    <div class="field">
      <label for="wl-sells" data-es="¿Qué vendes y a qué tipo de tiendas?">What do you sell, and to which kinds of stores?</label>
      <textarea id="wl-sells" name="sells" required maxlength="1000" placeholder="Organic baby clothing, to independent kids’ boutiques" data-es-placeholder="Ropa de bebé orgánica, para boutiques infantiles independientes" aria-describedby="wl-sells-err"></textarea>
      <p class="field-err" id="wl-sells-err" hidden data-es="Cuéntanos en pocas palabras qué vendes.">Tell us in a few words what you sell.</p>
    </div>
    <div class="hp" aria-hidden="true">
      <label for="wl-nickname">Leave this empty</label>
      <input type="text" id="wl-nickname" name="nickname" tabindex="-1" autocomplete="off">
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="submit" data-es="Únete a la lista de espera">Join the waitlist</button>
      <p class="form-fine" data-es="Solo lo usamos para avisarte cuando abramos y saber si podemos ayudarte. Ve la <a href=&quot;/privacy&quot;>privacidad</a>.">We use it only to tell you when we open and to see whether we can help. See <a href="/privacy">privacy</a>.</p>
    </div>
    <p class="form-status" role="status" aria-live="polite" hidden></p>
  </fieldset>
</form>`;
}
