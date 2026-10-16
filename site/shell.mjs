/**
 * The one shell every public page is built from: head, header with the menu, footer and
 * the language script. Change the menu here and run `npm run build`; every page picks it
 * up, because build.mjs re-wraps all of them. Modelled on trademarkscanner.app.
 *
 * One URL per language (15 Oct 2026): the pages carry English with Spanish, French and Brazilian Portuguese in
 * data-es / data-fr / data-pt, and build.mjs writes /es/, /fr/ and /pt/ copies with that text in the HTML, so
 * search engines index all four (Portuguese since 16 Oct 2026). The toggle goes to the other language's URL; the choice is remembered, and a first visit to an
 * English page follows the browser language.
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
// The sales line (Aharon, 14 Oct 2026): Katya answers it, in English, Spanish or French, any hour (the site is also in Portuguese; the line is not).
export const CONTACT_PHONE = '(401) 41-SCOUT';
export const CONTACT_PHONE_DIGITS = '(401) 417-2688';
export const CONTACT_TEL = 'tel:+14014172688';
const PHONE_ICON = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>';

/* Open for business (Aharon, 10 Oct 2026): the call to action is the free trial in the app, no waitlist. */
export const APP_URL = 'https://app.stockistscout.com';
export const CTA_URL = `${APP_URL}/signup`;
export const LOGIN_URL = `${APP_URL}/login`;
export const CTA_LABEL = 'Start free';
export const CTA_LABEL_ES = 'Empieza gratis';
export const CTA_LABEL_FR = 'Commencez gratuitement';
export const CTA_LABEL_PT = 'Comece grátis';

/** The one call-to-action button; `cls` is the button style of the place it sits in. */
export function ctaButton(cls) {
  return `<a class="btn ${cls}" href="${CTA_URL}" data-es="${attr(CTA_LABEL_ES)}" data-fr="${attr(CTA_LABEL_FR)}" data-pt="${attr(CTA_LABEL_PT)}">${CTA_LABEL}</a>`;
}

/** Changes whenever site.css changes, so a browser never pairs new HTML with an old cached stylesheet. */
const CSS_VERSION = createHash('sha256').update(readFileSync(new URL('../site.css', import.meta.url))).digest('hex').slice(0, 10);
/* Katya, the chat (katya.js at the root; its backend is the WMS Cloud API,
   /api/stockistscout/katya). One tag per page, after SCRIPT, and the file guards itself
   too (window.__katyaLoaded): on bins-usa.com a second copy drew a second, blank launcher.
   The version is a hash of the file, like the stylesheet's. */
const KATYA_VERSION = createHash('sha256').update(readFileSync(new URL('../katya.js', import.meta.url))).digest('hex').slice(0, 10);

export const NAV = [
  ['/', 'Home', 'Inicio', 'Accueil', 'Início'],
  ['/how-it-works', 'How it works', 'Cómo funciona', 'Comment ça marche', 'Como funciona'],
  ['/features', 'Features', 'Funciones', 'Fonctionnalités', 'Recursos'],
  ['/agents', 'Meet our agents', 'Conoce a nuestros agentes', 'Nos agents', 'Nossos agentes'],
  ['/pricing', 'Pricing', 'Precios', 'Tarifs', 'Preços'],
  ['/hotels', 'For hotels', 'Para hoteles', 'Pour les hôtels', 'Para hotéis'],
  ['/results', 'Results', 'Resultados', 'Résultats', 'Resultados'],
  ['/reviews', 'Reviews', 'Reseñas', 'Avis', 'Avaliações'],
  ['/faq', 'FAQ', 'Preguntas', 'FAQ', 'Perguntas'],
  ['/about', 'About', 'Quiénes somos', 'À propos', 'Quem somos'],
  ['/contact', 'Contact', 'Contacto', 'Contact', 'Contato'],
];

/* The eight agents (names fixed by the owner: first names only, never surnames, ages or
   any personal detail). Each specialises in one kind of store; when a customer describes
   an ideal customer, the agent for that store type is assigned. Plans include 1 to 8.
   The picture is img/agents/agent-<name>.png, square; today a placeholder made by
   site/avatars.mjs, later replaced by the cartoon portraits with the same file names. */
export const AGENTS = [
  { name: 'Tammy', spec: 'Baby &amp; kids’ clothing stores', specEs: 'Tiendas de ropa de bebé e infantil',
    does: 'Looks for children’s boutiques and baby stores whose range and price point fit your line, and writes to each one about why it belongs on their shelves.',
    doesEs: 'Busca boutiques infantiles y tiendas de bebé cuyo surtido y precios encajan con tu línea, y le escribe a cada una por qué merece estar en sus estantes.',
    specFr: 'Boutiques de vêtements pour bébés et enfants', doesFr: 'Cherche des boutiques pour enfants et des magasins pour bébés dont l’assortiment et les prix conviennent à votre gamme, et écrit à chacune pourquoi vos produits ont leur place sur ses tablettes.', specPt: 'Lojas de roupa para bebês e crianças',
    doesPt: 'Procura butiques infantis e lojas de bebê cujo sortimento e faixa de preço combinam com a sua linha, e escreve para cada uma explicando por que os seus produtos merecem estar nas prateleiras dela.' },
  { name: 'Elias', spec: 'Gift, home &amp; décor shops', specEs: 'Tiendas de regalos, hogar y decoración',
    does: 'Finds gift shops, home stores and décor boutiques that carry products like yours, and introduces your brand to the person who buys for them.',
    doesEs: 'Encuentra tiendas de regalos, de hogar y de decoración que venden productos como los tuyos, y le presenta tu marca a quien compra para ellas.',
    specFr: 'Boutiques de cadeaux, maison et décoration', doesFr: 'Trouve des boutiques de cadeaux, de maison et de décoration qui vendent des produits comme les vôtres, et présente votre marque à la personne qui fait leurs achats.', specPt: 'Lojas de presentes, casa e decoração',
    doesPt: 'Encontra lojas de presentes, de casa e butiques de decoração que vendem produtos como os seus, e apresenta a sua marca para a pessoa que faz as compras delas.' },
  { name: 'Raquel', spec: 'Fashion &amp; accessories boutiques', specEs: 'Boutiques de moda y accesorios',
    does: 'Searches for fashion and accessories boutiques whose style and prices match yours, and writes to each one personally.',
    doesEs: 'Busca boutiques de moda y accesorios con un estilo y unos precios como los tuyos, y le escribe a cada una de forma personal.',
    specFr: 'Boutiques de mode et d’accessoires', doesFr: 'Cherche des boutiques de mode et d’accessoires au style et aux prix semblables aux vôtres, et écrit à chacune de façon personnelle.', specPt: 'Butiques de moda e acessórios',
    doesPt: 'Procura butiques de moda e acessórios com estilo e preços parecidos com os seus, e escreve para cada uma de forma pessoal.' },
  { name: 'Roberto', spec: 'Wholesalers, distributors &amp; warehouses', specEs: 'Mayoristas, distribuidores y almacenes',
    does: 'Finds wholesalers, distributors and warehouses that could carry your line in volume, and opens the conversation on your behalf.',
    doesEs: 'Encuentra mayoristas, distribuidores y almacenes que podrían llevar tu línea por volumen, y abre la conversación en tu nombre.',
    specFr: 'Grossistes, distributeurs et entrepôts', doesFr: 'Trouve des grossistes, des distributeurs et des entrepôts qui pourraient prendre votre gamme en volume, et ouvre la conversation en votre nom.', specPt: 'Atacadistas, distribuidores e armazéns',
    doesPt: 'Encontra atacadistas, distribuidores e armazéns que poderiam levar a sua linha em volume, e abre a conversa em seu nome.' },
  { name: 'Rony', spec: 'Sports, outdoor &amp; adventure stores', specEs: 'Tiendas de deportes, aire libre y aventura',
    does: 'Looks for sporting goods, outdoor and adventure stores where your products fit, and tells each one why.',
    doesEs: 'Busca tiendas de deportes, de aire libre y de aventura donde tus productos encajan, y le explica a cada una por qué.',
    specFr: 'Magasins de sport, de plein air et d’aventure', doesFr: 'Cherche des magasins de sport, de plein air et d’aventure où vos produits ont leur place, et explique à chacun pourquoi.', specPt: 'Lojas de esportes, ar livre e aventura',
    doesPt: 'Procura lojas de artigos esportivos, de ar livre e de aventura onde os seus produtos se encaixam, e explica a cada uma por quê.' },
  { name: 'Gabriel', spec: 'Beauty, personal care &amp; wellness', specEs: 'Belleza, cuidado personal y bienestar',
    does: 'Finds beauty, personal-care and wellness shops that suit your products, and writes each one a note about what you can offer them.',
    doesEs: 'Encuentra tiendas de belleza, cuidado personal y bienestar que van con tus productos, y le escribe a cada una lo que le puedes ofrecer.',
    specFr: 'Beauté, soins personnels et bien-être', doesFr: 'Trouve des boutiques de beauté, de soins personnels et de bien-être qui conviennent à vos produits, et écrit à chacune ce que vous pouvez lui offrir.', specPt: 'Beleza, cuidados pessoais e bem-estar',
    doesPt: 'Encontra lojas de beleza, cuidados pessoais e bem-estar que combinam com os seus produtos, e escreve para cada uma o que você pode oferecer.' },
  { name: 'Aaron', spec: 'Pet stores', specEs: 'Tiendas de mascotas',
    does: 'Searches for independent pet stores and pet boutiques that fit your line, and introduces your products to them.',
    doesEs: 'Busca tiendas de mascotas independientes y boutiques para mascotas que encajan con tu línea, y les presenta tus productos.',
    specFr: 'Animaleries', doesFr: 'Cherche des animaleries indépendantes et des boutiques pour animaux qui conviennent à votre gamme, et leur présente vos produits.', specPt: 'Pet shops',
    doesPt: 'Procura pet shops independentes e butiques para animais que combinam com a sua linha, e apresenta os seus produtos a elas.' },
  { name: 'Joel', spec: 'Toys, games &amp; hobby shops', specEs: 'Jugueterías, juegos y hobbies',
    does: 'Finds toy stores, game shops and hobby stores that match your range, and writes to each one about your products.',
    doesEs: 'Encuentra jugueterías, tiendas de juegos y de hobbies que encajan con tu surtido, y le escribe a cada una sobre tus productos.',
    specFr: 'Magasins de jouets, de jeux et de loisirs', doesFr: 'Trouve des magasins de jouets, de jeux et de loisirs qui conviennent à votre assortiment, et écrit à chacun au sujet de vos produits.', specPt: 'Lojas de brinquedos, jogos e hobbies',
    doesPt: 'Encontra lojas de brinquedos, de jogos e de hobbies que combinam com o seu sortimento, e escreve para cada uma sobre os seus produtos.' },
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

function head({ path, title, titleEs, titleFr, titlePt, description }) {
  const url = ORIGIN + (path === '/' ? '/' : path);
  const full = path === '/' ? title : `${title} | StockistScout`;
  const fullEs = titleEs ? (path === '/' ? titleEs : `${titleEs} | StockistScout`) : null;
  const fullFr = titleFr ? (path === '/' ? titleFr : `${titleFr} | StockistScout`) : null;
  const fullPt = titlePt ? (path === '/' ? titlePt : `${titlePt} | StockistScout`) : null;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Google tag (gtag.js), GA4 property G-6V3RJHBRL5 (Aharon, 14 Oct 2026) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6V3RJHBRL5"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-6V3RJHBRL5');
</script>
<title${fullEs ? ` data-es="${attr(fullEs)}"` : ''}${fullFr ? ` data-fr="${attr(fullFr)}"` : ''}${fullPt ? ` data-pt="${attr(fullPt)}"` : ''}>${full}</title>
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
  const links = NAV.map(([href, en, es, fr, pt]) => {
    const on = path === href ? ' aria-current="page"' : '';
    return `      <a href="${href}"${on} data-es="${attr(es)}" data-fr="${attr(fr)}" data-pt="${attr(pt)}">${en}</a>`;
  }).join('\n');
  return `<a class="skip" href="#main" data-es="Ir al contenido" data-fr="Aller au contenu" data-pt="Pular para o conteúdo">Skip to content</a>
<header class="site-head">
  <div class="head-row">
    <a class="brand" href="/" aria-label="StockistScout, home" data-es-label="StockistScout, inicio" data-fr-label="StockistScout, accueil" data-pt-label="StockistScout, início">
      ${logo(196, 52, ' fetchpriority="high"')}
    </a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu">
      <span class="bars" aria-hidden="true"></span><span class="sr" data-es="Menú" data-fr="Menu" data-pt="Menu">Menu</span>
    </button>
    <nav id="site-menu" class="site-nav" aria-label="Main">
      <div class="nav-links">
${links}
      </div>
      <div class="nav-end">
        <a class="nav-phone" href="${CONTACT_TEL}" aria-label="Call StockistScout at ${CONTACT_PHONE_DIGITS}" data-es-label="Llama a StockistScout al ${CONTACT_PHONE_DIGITS}" data-pt-label="Ligue para o StockistScout no ${CONTACT_PHONE_DIGITS}">${PHONE_ICON}<span>${CONTACT_PHONE}</span></a>
        <a class="btn btn-ghost nav-login" href="${LOGIN_URL}" data-es="Iniciar sesión" data-fr="Se connecter" data-pt="Entrar">Log in</a>
        <a class="btn btn-primary nav-cta" href="${CTA_URL}" data-es="Empieza gratis" data-fr="Commencer gratuitement" data-pt="Comece grátis">Start free</a>
        <div class="lang" id="langToggle" role="group" aria-label="Language">
          <!-- Four languages (16 Oct 2026): the short codes fit a phone; each says its full name to a screen reader. -->
          <button type="button" data-lang="en" aria-pressed="true" lang="en" aria-label="English" title="English">EN</button>
          <button type="button" data-lang="es" aria-pressed="false" lang="es" aria-label="Español" title="Español">ES</button>
          <button type="button" data-lang="fr" aria-pressed="false" lang="fr" aria-label="Français" title="Français">FR</button>
          <button type="button" data-lang="pt" aria-pressed="false" lang="pt-BR" aria-label="Português" title="Português">PT</button>
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
      <a class="foot-logo" href="/" aria-label="StockistScout, home" data-es-label="StockistScout, inicio" data-fr-label="StockistScout, accueil" data-pt-label="StockistScout, início"><img src="/img/logo-dark-520.png" alt="StockistScout" width="196" height="52" loading="lazy"></a>
      <p data-es="Agentes de IA que encuentran tiendas que encajan con tus productos y les escriben en nombre de tu negocio. Solo B2B: tiendas, nunca consumidores." data-fr="Des agents d'IA qui trouvent des boutiques qui correspondent à vos produits et leur écrivent au nom de votre entreprise. B2B seulement : des boutiques, jamais des consommateurs." data-pt="Agentes de IA que encontram lojas que combinam com seus produtos e escrevem para elas em nome da sua empresa. Somente B2B: lojas, nunca consumidores.">AI agents that find stores that fit your products and write to them on behalf of your business. B2B only: stores, never consumers.</p>
      <p class="disclaimer" data-es="Prueba gratis con 50 correos, sin tarjeta. Ningún resultado de ventas está garantizado." data-fr="Essai gratuit de 50 courriels, sans carte. Aucun résultat de vente n'est garanti." data-pt="Teste grátis com 50 e-mails, sem cartão. Nenhum resultado de vendas é garantido.">Free trial with 50 emails, no card needed. No sales results are guaranteed.</p>
      <p class="foot-contact">
        <a href="${CONTACT_TEL}" aria-label="Call ${CONTACT_PHONE_DIGITS}" data-es-label="Llamar al ${CONTACT_PHONE_DIGITS}" data-pt-label="Ligar para ${CONTACT_PHONE_DIGITS}">${CONTACT_PHONE} · ${CONTACT_PHONE_DIGITS}</a>
        <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
      </p>
    </div>
    <nav aria-label="Product" data-es-label="Producto" data-fr-label="Produit" data-pt-label="Produto">
      <h2 data-es="Producto" data-fr="Produit" data-pt="Produto">Product</h2>
      <a href="/how-it-works" data-es="Cómo funciona" data-fr="Comment ça fonctionne" data-pt="Como funciona">How it works</a>
      <a href="/features" data-es="Funciones" data-fr="Fonctionnalités" data-pt="Recursos">Features</a>
      <a href="/pricing" data-es="Precios" data-fr="Tarifs" data-pt="Preços">Pricing</a>
      <a href="/hotels" data-es="Para cadenas de hoteles" data-fr="Pour les chaînes hôtelières" data-pt="Para redes hoteleiras">For hotel chains</a>
      <a href="/results" data-es="Resultados" data-fr="Résultats" data-pt="Resultados">Results</a>
      <a href="/faq" data-es="Preguntas frecuentes" data-fr="Foire aux questions" data-pt="Perguntas frequentes">FAQ</a>
    </nav>
    <nav aria-label="Company" data-es-label="Empresa" data-fr-label="Entreprise" data-pt-label="Empresa">
      <h2 data-es="Empresa" data-fr="Entreprise" data-pt="Empresa">Company</h2>
      <a href="/about" data-es="Quiénes somos" data-fr="À propos" data-pt="Quem somos">About</a>
      <a href="/contact" data-es="Contacto" data-fr="Contact" data-pt="Contato">Contact</a>
      <a href="/privacy" data-es="Privacidad" data-fr="Confidentialité" data-pt="Privacidade">Privacy</a>
      <a href="/terms" data-es="Términos" data-fr="Conditions" data-pt="Termos">Terms</a>
      <a href="/corporate-agreement" data-es="Contrato corporativo" data-fr="Entente d'entreprise" data-pt="Contrato corporativo">Corporate agreement</a>
    </nav>
    <nav aria-label="Our other products" data-es-label="Nuestros otros productos" data-fr-label="Nos autres produits" data-pt-label="Nossos outros produtos">
      <h2 data-es="Del mismo equipo" data-fr="De la même équipe" data-pt="Da mesma equipe">From the same team</h2>
      <a href="https://www.mykids-usa.com" rel="noopener">MyKids-USA</a>
      <a href="https://drop-usa.com" rel="noopener">Drop-USA</a>
      <a href="https://bins-usa.com" rel="noopener">Bins-USA</a>
      <a href="https://trademarkscanner.app" rel="noopener">ScanRights</a>
    </nav>
  </div>
  <div class="wrap foot-legal">
    <span data-es="© 2026 ${COMPANY}. Todos los derechos reservados." data-pt="© 2026 ${COMPANY}. Todos os direitos reservados.">© 2026 ${COMPANY}. All rights reserved.</span>
    <span data-es="Florida, Estados Unidos." data-fr="Floride, États-Unis." data-pt="Flórida, Estados Unidos.">Florida, United States.</span>
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
  /* One URL per language since 15 Oct 2026: /es/ and /fr/ carry their text in the HTML, so Google shows them. The
     toggle goes to the same page in the other language, and the choice is remembered. */
  var LANGS = ['es', 'fr', 'pt'];
  function pageLang() { var l = document.documentElement.lang; return LANGS.indexOf(l) >= 0 ? l : 'en'; }
  function urlFor(lang) {
    var p = location.pathname;
    var first = p.slice(1, 3);
    if (LANGS.indexOf(first) >= 0 && (p.length === 3 || p.charAt(3) === '/')) p = p.slice(3) || '/';
    var to = lang === 'en' ? p : '/' + lang + (p === '/' ? '/' : p);
    return to + location.search + location.hash;
  }
  /* The funnel (15 Oct 2026): a click to the app carries this visit's session id (the tracker's), the page's language
     and where the visit landed, so a sign-up can be traced back to its visit. Added at click time only. */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="https://app.stockistscout.com/"]') : null;
    if (!a) return;
    var sid = null;
    try { sid = sessionStorage.getItem('wms_sid'); } catch (err) {}
    if (!sid || sid === 'nostorage') return;
    try {
      var u = new URL(a.href);
      u.searchParams.set('ss_sid', sid);
      u.searchParams.set('ss_lang', pageLang());
      u.searchParams.set('ss_path', location.pathname);
      a.href = u.toString();
    } catch (err) {}
  }, true);
  function go(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    if (lang !== pageLang()) location.href = urlFor(lang);
  }
  /* Waitlist form: posts JSON to the address in data-waitlist and confirms on screen. */
  var LOADED = Date.now();
  var MSG = {
    ok: { en: '<strong>You are on the list. Thank you.</strong> We will write to you when StockistScout opens. We do not send a confirmation email yet, so this message is your confirmation.',
          es: '<strong>Ya estás en la lista. Gracias.</strong> Te escribiremos cuando StockistScout abra. Todavía no enviamos un correo de confirmación, así que este mensaje es tu confirmación.',
          fr: '<strong>Vous êtes sur la liste. Merci.</strong> Nous vous écrirons à l’ouverture de StockistScout. Nous n’envoyons pas encore de courriel de confirmation : ce message est votre confirmation.',
          pt: '<strong>Você está na lista. Obrigado.</strong> Vamos escrever para você quando o StockistScout abrir. Ainda não enviamos e-mail de confirmação, então esta mensagem é a sua confirmação.' },
    sending: { en: 'Sending…', es: 'Enviando…', fr: 'Envoi…', pt: 'Enviando…' },
    fix: { en: 'Please check the highlighted fields.', es: 'Revisa los campos marcados.', fr: 'Veuillez vérifier les champs indiqués.', pt: 'Confira os campos destacados.' },
    many: { en: 'Too many tries from this connection. Please wait an hour, or write to <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            es: 'Demasiados intentos desde esta conexión. Espera una hora o escríbenos a <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            fr: 'Trop de tentatives depuis cette connexion. Attendez une heure ou écrivez-nous à <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            pt: 'Tentativas demais a partir desta conexão. Aguarde uma hora ou escreva para <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.' },
    fail: { en: 'We could not send it. Check your connection and try again, or write to <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            es: 'No pudimos enviarlo. Revisa tu conexión y vuelve a intentarlo, o escríbenos a <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            fr: 'Nous n’avons pas pu l’envoyer. Vérifiez votre connexion et réessayez, ou écrivez-nous à <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            pt: 'Não conseguimos enviar. Verifique sua conexão e tente de novo, ou escreva para <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.' }
  };
  function curLang() { return pageLang(); }
  function say(el, m) {
    el.dataset.en = m.en; el.dataset.es = m.es; el.dataset.fr = m.fr || m.en; el.dataset.pt = m.pt || m.en;
    el.innerHTML = m[curLang()] || m.en;
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
      var label = { en: btn.dataset.en || btn.innerHTML, es: btn.dataset.es, fr: btn.dataset.fr, pt: btn.dataset.pt };
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
  var nav = (navigator.language || 'en').toLowerCase();
  /* On an English page, a visitor who chose Spanish, French or Portuguese before, or whose browser speaks it on a first
     visit (es-*, fr-*, pt-*), goes to that page in their language. A page reached in another language remembers it. */
  if (pageLang() === 'en') {
    var want = saved || (LANGS.indexOf(nav.slice(0, 2)) >= 0 ? nav.slice(0, 2) : 'en');
    if (LANGS.indexOf(want) >= 0) { location.replace(urlFor(want)); return; }
  } else {
    try { localStorage.setItem(KEY, pageLang()); } catch (e) {}
  }
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#langToggle button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.lang === pageLang() ? 'true' : 'false');
      b.addEventListener('click', function () { go(b.dataset.lang); });
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
    // The language select starts on the page's language.
    document.querySelectorAll('form[data-waitlist]').forEach(wireWaitlist);
  });
})();
</script>`;

/** A complete page: shell around a body fragment. */
export function page({ path, title, titleEs, titleFr, titlePt, description, body }) {
  return `${head({ path, title, titleEs, titleFr, titlePt, description })}
<body>
${header(path)}
<main id="main" tabindex="-1">
${body.trim()}
</main>
${footer()}
${SCRIPT}
<script src="/katya.js?v=${KATYA_VERSION}" defer></script>
<script src="https://api.binsusa.com/api/site/tracker.js" data-site="stockistscout" defer></script>
</body>
</html>
`;
}

/** The closing call to action used at the bottom of most pages. */
export function ctaBand() {
  return `<section class="cta-band">
  <div class="wrap cta-inner">
    <div>
      <h2 data-es="Deja que un agente encuentre tus próximas tiendas." data-fr="Laissez un agent trouver vos prochains détaillants." data-pt="Deixe um agente encontrar suas próximas lojas revendedoras.">Let an agent find your next stockists.</h2>
      <p data-es="Empieza con una prueba gratis de 50 correos, sin tarjeta. Configura tu negocio, tu cliente ideal y tu oferta, y tu agente empieza a buscar." data-fr="Commencez par un essai gratuit de 50 courriels, sans carte. Configurez votre entreprise, votre client idéal et votre offre, et votre agent commence à chercher." data-pt="Comece com um teste grátis de 50 e-mails, sem cartão. Configure sua empresa, seu cliente ideal e sua oferta, e seu agente começa a procurar.">Start with a free trial of 50 emails, no card needed. Set up your business, your ideal customer and your offer, and your agent starts looking.</p>
    </div>
    <div class="cta-actions">
      ${ctaButton('btn-light')}
      <a class="btn btn-outline-light" href="/pricing" data-es="Ver precios" data-fr="Voir les prix" data-pt="Ver preços">See pricing</a>
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
    <legend class="sr" data-es="Únete a la lista de espera" data-fr="Inscrivez-vous à la liste d'attente" data-pt="Entre na lista de espera">Join the waitlist</legend>
    <div class="field-row">
      <div class="field">
        <label for="wl-email" data-es="Correo electrónico" data-fr="Courriel" data-pt="E-mail">Email</label>
        <input type="email" id="wl-email" name="email" autocomplete="email" required maxlength="254" aria-describedby="wl-email-err">
        <p class="field-err" id="wl-email-err" hidden data-es="Escribe un correo válido." data-fr="Entrez un courriel valide." data-pt="Digite um e-mail válido.">Enter a valid email.</p>
      </div>
      <div class="field">
        <label for="wl-company" data-es="Empresa" data-fr="Entreprise" data-pt="Empresa">Company</label>
        <input type="text" id="wl-company" name="company" autocomplete="organization" required maxlength="200" aria-describedby="wl-company-err">
        <p class="field-err" id="wl-company-err" hidden data-es="Escribe el nombre de tu empresa." data-fr="Entrez le nom de votre entreprise." data-pt="Digite o nome da sua empresa.">Enter your company name.</p>
      </div>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="wl-site"><span data-es="Sitio web" data-fr="Site Web" data-pt="Site">Website</span> <span class="opt" data-es="(opcional)" data-fr="(facultatif)" data-pt="(opcional)">(optional)</span></label>
        <input type="text" id="wl-site" name="website" inputmode="url" autocomplete="url" maxlength="300" placeholder="yourbrand.com" data-es-placeholder="tumarca.com" data-fr-placeholder="votremarque.com" data-pt-placeholder="suamarca.com.br" aria-describedby="wl-site-err">
        <p class="field-err" id="wl-site-err" hidden data-es="Ese sitio web no parece válido." data-fr="Ce site Web ne semble pas valide." data-pt="Esse site não parece válido.">That website does not look right.</p>
      </div>
      <div class="field">
        <label for="wl-lang" data-es="Idioma para escribirte" data-fr="Langue dans laquelle vous écrire" data-pt="Idioma em que escrevemos para você">Language we write to you in</label>
        <select id="wl-lang" name="language">
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>
    </div>
    <div class="field">
      <label for="wl-sells" data-es="¿Qué vendes y a qué tipo de tiendas?" data-fr="Que vendez-vous, et à quels types de boutiques?" data-pt="O que você vende, e para que tipo de lojas?">What do you sell, and to which kinds of stores?</label>
      <textarea id="wl-sells" name="sells" required maxlength="1000" placeholder="Organic baby clothing, to independent kids’ boutiques" data-es-placeholder="Ropa de bebé orgánica, para boutiques infantiles independientes" data-fr-placeholder="Vêtements biologiques pour bébés, pour les boutiques indépendantes pour enfants" data-pt-placeholder="Roupas orgânicas para bebês, para butiques infantis independentes" aria-describedby="wl-sells-err"></textarea>
      <p class="field-err" id="wl-sells-err" hidden data-es="Cuéntanos en pocas palabras qué vendes." data-fr="Dites-nous en quelques mots ce que vous vendez." data-pt="Conte em poucas palavras o que você vende.">Tell us in a few words what you sell.</p>
    </div>
    <div class="hp" aria-hidden="true">
      <label for="wl-nickname">Leave this empty</label>
      <input type="text" id="wl-nickname" name="nickname" tabindex="-1" autocomplete="off">
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="submit" data-es="Únete a la lista de espera" data-fr="Inscrivez-vous à la liste d'attente" data-pt="Entre na lista de espera">Join the waitlist</button>
      <p class="form-fine" data-es="Solo lo usamos para avisarte cuando abramos y saber si podemos ayudarte. Ve la <a href=&quot;/privacy&quot;>privacidad</a>." data-fr="Nous l'utilisons uniquement pour vous aviser de notre ouverture et voir si nous pouvons vous aider. Consultez la <a href=&quot;/privacy&quot;>confidentialité</a>." data-pt="Usamos isso apenas para avisar quando abrirmos e para ver se podemos ajudar. Veja a <a href=&quot;/privacy&quot;>privacidade</a>.">We use it only to tell you when we open and to see whether we can help. See <a href="/privacy">privacy</a>.</p>
    </div>
    <p class="form-status" role="status" aria-live="polite" hidden></p>
  </fieldset>
</form>`;
}
