/**
 * Landing pages for Google Ads (18 Oct 2026): /lp/us/…, /lp/mx/…, /lp/ca/… and /lp/ca/fr/…, one per country, language
 * and industry. Each page is written in its own language only (no data-es / data-fr…), carries noindex, and stays out
 * of the sitemap, the menus and the translation dictionaries (meta.noindex: see build.mjs and i18n/strings.mjs), so it
 * never competes with the organic pages. The shell gives them a minimal header and footer (meta.lp in shell.mjs).
 *
 * Every page leads with Aharon's headline ("We use StockistScout to find our own customers. Now let our AI agents find
 * yours.") and has one call to action, the free trial in the app. The click carries the ad's utm_* / gclid / gbraid /
 * wbraid (the site script in shell.mjs) and fires the GA4 event sign_up_click.
 *
 * Facts only (the same as the rest of the site): the numbers in the proof block are those of /results; emails go out
 * under the customer's business name with their reply-to, from our sending domain (a sending subdomain of their own on
 * a paid plan), never from the customer's own domain; no sales are promised; prices in US dollars.
 * The store rows in each hero are an illustration, and say so.
 */
import { CTA_URL } from './shell.mjs';

/* The texts every page of a language shares. */
const T = {
  en: {
    hook1: 'We use StockistScout to find our own customers.',
    hook2: 'Now let our AI agents find yours.',
    cta: 'Start free — 50 emails, no card',
    ctaShort: 'Start free',
    ticks: ['Free trial: 50 emails, no card', 'No commission on your orders', 'Cancel anytime'],
    example: 'Example',
    why: 'Why it fits: ',
    mockCaption: 'An illustration of the kind of stores an agent looks for, not real stores. Your agent finds real ones, each with the reason it fits.',
    stepsEyebrow: 'How it works',
    stepsTitle: 'Three steps, then your agent works every day.',
    steps: [
      ['Describe your business and your ideal store', 'What you sell, your wholesale prices and terms, and the kind of store you want. Katya, our assistant, reviews each section with you and can write your emails.'],
      ['Approve your email template', 'Your agent writes a personal email to each store from your template, mentioning why that store fits. Nothing is sent until the template passes review, and every edit goes back to review.'],
      ['Stores reply to your inbox', 'Every day your agent finds new stores that fit, writes to each one under your business name and sends within safe daily limits. Replies go straight to your email.'],
    ],
    proofEyebrow: 'We use it ourselves',
    proofTitle: 'Our own brands find their customers with StockistScout.',
    proofText: 'We are Aharon &amp; Ita Corp, a Florida company that sells its own products. Every morning our agents look for customers for our brands: kids’ boutiques for MyKids-USA, our children’s clothing brand; brands for Drop-USA, our dropshipping network; merchants for Bins-USA, our warehouse software. And StockistScout’s own agent looks for brands like yours.',
    statsLead: 'October 1–8, 2026: three agents for three of our brands, writing to US stores.',
    stats: [['1,106', 'businesses found that passed our checks'], ['1,074', 'first emails sent'], ['41', 'clicks by people'], ['4', 'installs or paying customers']],
    statsNote: 'Our own figures, from our databases, with no store or person named. No sales result is guaranteed.',
    statsLink: 'See the full numbers →',
    shotAlt: 'StockistScout: the stores an agent contacted, with why each one fits',
    shotCaption: 'Inside the app: every store your agent found, why it fits, and what happened next. A sample account with fictional stores.',
    trustEyebrow: 'What you can count on',
    trustTitle: 'Your brand, your words, your inbox.',
    trust: (law) => [
      ['You approve the email', 'Your template, your words. Nothing goes out until it also passes our review, and you can pause your agent anytime.'],
      ['Your name, your inbox', 'Every email carries your business name, with your email as the reply-to. On paid plans your account gets its own sending subdomain, so your reputation never depends on anyone else’s.'],
      law,
      ['No commission, cancel anytime', 'A flat monthly plan by emails sent, from $49.99 a month (USD). The orders you win are yours, in full. No contract.'],
    ],
    faqTitle: 'Questions',
    faq: (where) => [
      ['What does it cost?', 'The trial is free: 50 emails, once, no card. Then monthly plans by emails sent, from $49.99 a month for 200 emails, in US dollars. No commission, no contract, cancel anytime.'],
      ['Do you guarantee sales?', 'No, and be wary of anyone who does. We find stores that fit what you described and write to them carefully; whether a store buys depends on your product, your price, your offer and your conversation with them.'],
      ['Where do the replies go?', 'To your own inbox: your email is the reply-to. From there the conversation, the samples and the first order are yours.'],
      ['Which stores do you write to?', `Stores and businesses only, never consumers, at business addresses published on their own websites or other public business sources. Each agent works one country: ${where} and more than 30 other countries.`],
      ['Do I need Shopify?', 'No. You can sign up on our website with your email or Google and pay by card. If you sell on Shopify, you can bring in your best sellers to show in your emails.'],
    ],
    finalTitle: 'Let an agent find your next stockists.',
    finalText: 'Start with a free trial of 50 emails, no card needed. Set up your business, your ideal customer and your offer, and your agent starts looking.',
    privacy: 'Privacy', terms: 'Terms', place: 'Florida, United States',
    home: 'StockistScout, home',
  },
  es: {
    hook1: 'Usamos StockistScout para conseguir nuestros propios clientes.',
    hook2: 'Ahora deje que nuestros agentes de IA consigan los suyos.',
    cta: 'Empiece gratis: 50 correos, sin tarjeta',
    ctaShort: 'Empiece gratis',
    ticks: ['Prueba gratis: 50 correos, sin tarjeta', 'Sin comisión sobre sus pedidos', 'Cancele cuando quiera'],
    example: 'Ejemplo',
    why: 'Por qué encaja: ',
    mockCaption: 'Una ilustración del tipo de tiendas que busca un agente, no son tiendas reales. Su agente encuentra tiendas reales, cada una con el motivo por el que encaja.',
    stepsEyebrow: 'Cómo funciona',
    stepsTitle: 'Tres pasos, y su agente trabaja todos los días.',
    steps: [
      ['Describa su negocio y su tienda ideal', 'Qué vende, sus precios de mayoreo y sus condiciones, y el tipo de tienda que busca. Katya, nuestra asistente, revisa cada sección con usted y puede escribir sus correos.'],
      ['Apruebe su plantilla de correo', 'Su agente escribe un correo personal a cada tienda a partir de su plantilla y menciona por qué esa tienda encaja. No se envía nada hasta que la plantilla pasa la revisión, y cada cambio vuelve a revisión.'],
      ['Las tiendas le responden a su correo', 'Cada día su agente encuentra tiendas nuevas que encajan, escribe a cada una con el nombre de su negocio y envía dentro de límites diarios seguros. Las respuestas llegan directo a su correo.'],
    ],
    proofEyebrow: 'Lo usamos nosotros mismos',
    proofTitle: 'Nuestras propias marcas consiguen sus clientes con StockistScout.',
    proofText: 'Somos Aharon &amp; Ita Corp, una empresa de Florida que vende sus propios productos. Cada mañana nuestros agentes buscan clientes para nuestras marcas: boutiques infantiles para MyKids-USA, nuestra marca de ropa para niños; marcas para Drop-USA, nuestra red de dropshipping; comercios para Bins-USA, nuestro software de almacén. Y el propio agente de StockistScout busca marcas como la suya.',
    statsLead: 'Del 1 al 8 de octubre de 2026: tres agentes para tres de nuestras marcas, escribiendo a tiendas de Estados Unidos.',
    stats: [['1,106', 'negocios encontrados que pasaron nuestros filtros'], ['1,074', 'primeros correos enviados'], ['41', 'clics de personas'], ['4', 'instalaciones o clientes de pago']],
    statsNote: 'Cifras propias, de nuestras bases de datos, sin nombrar a ninguna tienda ni persona. No se garantiza ningún resultado de ventas.',
    statsLink: 'Ver las cifras completas →',
    shotAlt: 'StockistScout: las tiendas que contactó un agente, con el motivo por el que encaja cada una',
    shotCaption: 'Por dentro: cada tienda que encontró su agente, por qué encaja y qué pasó después. Una cuenta de ejemplo con tiendas ficticias.',
    trustEyebrow: 'Con qué puede contar',
    trustTitle: 'Su marca, sus palabras, su correo.',
    trust: (law) => [
      ['Usted aprueba el correo', 'Su plantilla, sus palabras. No sale nada hasta que también pasa nuestra revisión, y puede pausar a su agente cuando quiera.'],
      ['Su nombre, su correo', 'Cada correo lleva el nombre de su negocio, con su correo como dirección de respuesta. En los planes de pago su cuenta tiene su propio subdominio de envío, así su reputación nunca depende de la de otros.'],
      law,
      ['Sin comisión, cancele cuando quiera', 'Un plan mensual fijo por correos enviados, desde 49.99 dólares al mes (USD). Los pedidos que consiga son suyos, completos. Sin contrato.'],
    ],
    faqTitle: 'Preguntas',
    faq: (where) => [
      ['¿Cuánto cuesta?', 'La prueba es gratis: 50 correos, una vez, sin tarjeta. Después, planes mensuales por correos enviados, desde 49.99 dólares al mes por 200 correos, en dólares estadounidenses. Sin comisión, sin contrato, cancele cuando quiera.'],
      ['¿Garantizan ventas?', 'No, y desconfíe de quien lo haga. Encontramos tiendas que encajan con lo que usted describió y les escribimos con cuidado; que una tienda compre depende de su producto, su precio, su oferta y su conversación con ella.'],
      ['¿A dónde llegan las respuestas?', 'A su propio correo: su dirección es la de respuesta. Desde ahí, la conversación, las muestras y el primer pedido son suyos.'],
      ['¿A qué tiendas escriben?', `Solo a tiendas y negocios, nunca a consumidores, en direcciones comerciales publicadas en sus propios sitios web u otras fuentes públicas de negocios. Cada agente trabaja un país: ${where} y más de 30 países más.`],
      ['¿Necesito Shopify?', 'No. Puede registrarse en nuestro sitio con su correo o con Google y pagar con tarjeta. Si vende en Shopify, puede traer sus productos más vendidos para mostrarlos en sus correos.'],
    ],
    finalTitle: 'Deje que un agente encuentre sus próximas tiendas.',
    finalText: 'Empiece con una prueba gratis de 50 correos, sin tarjeta. Configure su negocio, su cliente ideal y su oferta, y su agente empieza a buscar.',
    privacy: 'Privacidad', terms: 'Términos', place: 'Florida, Estados Unidos',
    home: 'StockistScout, inicio',
  },
  fr: {
    hook1: 'Nous utilisons StockistScout pour trouver nos propres clients.',
    hook2: 'Laissez maintenant nos agents d’IA trouver les vôtres.',
    cta: 'Commencez gratuitement : 50 courriels, sans carte',
    ctaShort: 'Essai gratuit',
    ticks: ['Essai gratuit : 50 courriels, sans carte', 'Aucune commission sur vos commandes', 'Annulez en tout temps'],
    example: 'Exemple',
    why: 'Pourquoi elle convient : ',
    mockCaption: 'Une illustration du type de boutiques qu’un agent recherche, pas de vraies boutiques. Votre agent en trouve de vraies, chacune avec la raison pour laquelle elle convient.',
    stepsEyebrow: 'Comment ça fonctionne',
    stepsTitle: 'Trois étapes, puis votre agent travaille chaque jour.',
    steps: [
      ['Décrivez votre entreprise et votre boutique idéale', 'Ce que vous vendez, vos prix de gros et vos conditions, et le type de boutique que vous visez. Katya, notre assistante, révise chaque section avec vous et peut rédiger vos courriels.'],
      ['Approuvez votre modèle de courriel', 'Votre agent écrit un courriel personnalisé à chaque boutique à partir de votre modèle, en expliquant pourquoi elle convient. Rien n’est envoyé avant que le modèle passe la révision, et chaque modification y retourne.'],
      ['Les boutiques vous répondent directement', 'Chaque jour, votre agent trouve de nouvelles boutiques qui conviennent, écrit à chacune au nom de votre entreprise et envoie dans des limites quotidiennes prudentes. Les réponses arrivent dans votre boîte de réception.'],
    ],
    proofEyebrow: 'Nous l’utilisons nous-mêmes',
    proofTitle: 'Nos propres marques trouvent leurs clients avec StockistScout.',
    proofText: 'Nous sommes Aharon &amp; Ita Corp, une entreprise de Floride qui vend ses propres produits. Chaque matin, nos agents cherchent des clients pour nos marques : des boutiques pour enfants pour MyKids-USA, notre marque de vêtements pour enfants; des marques pour Drop-USA, notre réseau de livraison directe; des commerçants pour Bins-USA, notre logiciel d’entrepôt. Et l’agent de StockistScout lui-même cherche des marques comme la vôtre.',
    statsLead: 'Du 1<sup>er</sup> au 8 octobre 2026 : trois agents pour trois de nos marques, qui écrivaient à des boutiques des États-Unis.',
    stats: [['1 106', 'entreprises trouvées qui ont passé nos vérifications'], ['1 074', 'premiers courriels envoyés'], ['41', 'clics de personnes'], ['4', 'installations ou clients payants']],
    statsNote: 'Nos propres chiffres, tirés de nos bases de données, sans nommer de boutique ni de personne. Aucun résultat de vente n’est garanti.',
    statsLink: 'Voir tous les chiffres →',
    shotAlt: 'StockistScout : les boutiques qu’un agent a contactées, avec la raison pour laquelle chacune convient',
    shotCaption: 'Dans l’application : chaque boutique trouvée par votre agent, pourquoi elle convient et ce qui s’est passé ensuite. Un compte d’exemple avec des boutiques fictives.',
    trustEyebrow: 'Ce sur quoi vous pouvez compter',
    trustTitle: 'Votre marque, vos mots, votre boîte de réception.',
    trust: (law) => [
      ['Vous approuvez le courriel', 'Votre modèle, vos mots. Rien ne part avant qu’il passe aussi notre révision, et vous pouvez mettre votre agent en pause en tout temps.'],
      ['Votre nom, vos réponses', 'Chaque courriel porte le nom de votre entreprise, avec votre adresse comme adresse de réponse. Avec un forfait payant, votre compte a son propre sous-domaine d’envoi : votre réputation ne dépend jamais de celle des autres.'],
      law,
      ['Aucune commission, annulez en tout temps', 'Un forfait mensuel fixe selon les courriels envoyés, à partir de 49,99 $ US par mois. Les commandes que vous obtenez sont entièrement à vous. Aucun contrat.'],
    ],
    faqTitle: 'Questions',
    faq: (where) => [
      ['Combien ça coûte?', 'L’essai est gratuit : 50 courriels, une seule fois, sans carte. Ensuite, des forfaits mensuels selon les courriels envoyés, à partir de 49,99 $ US par mois pour 200 courriels, en dollars américains. Aucune commission, aucun contrat, annulez en tout temps.'],
      ['Garantissez-vous des ventes?', 'Non, et méfiez-vous de quiconque le fait. Nous trouvons des boutiques qui correspondent à ce que vous avez décrit et leur écrivons avec soin; qu’une boutique achète dépend de votre produit, de votre prix, de votre offre et de votre conversation avec elle.'],
      ['Où arrivent les réponses?', 'Dans votre propre boîte de réception : votre adresse est l’adresse de réponse. À partir de là, la conversation, les échantillons et la première commande vous appartiennent.'],
      ['À quelles boutiques écrivez-vous?', `Uniquement à des boutiques et à des entreprises, jamais à des consommateurs, à des adresses d’affaires publiées sur leur propre site Web ou dans d’autres sources publiques d’entreprises. Chaque agent travaille un pays : ${where} et plus de 30 autres pays.`],
      ['Ai-je besoin de Shopify?', 'Non. Vous pouvez vous inscrire sur notre site avec votre courriel ou Google et payer par carte. Si vous vendez sur Shopify, vous pouvez importer vos meilleurs vendeurs pour les montrer dans vos courriels.'],
    ],
    finalTitle: 'Laissez un agent trouver vos prochains détaillants.',
    finalText: 'Commencez par un essai gratuit de 50 courriels, sans carte. Configurez votre entreprise, votre client idéal et votre offre, et votre agent commence à chercher.',
    privacy: 'Confidentialité', terms: 'Conditions', place: 'Floride, États-Unis',
    home: 'StockistScout, accueil',
  },
};

/* Each country's anti-spam line (the third trust item) and its "which countries" wording. */
const LAW = {
  us: ['Follows US law', 'B2B only: published business addresses, never consumers. Every email carries your postal address and a way to unsubscribe, as CAN-SPAM requires, and every unsubscribe is honoured.'],
  ca: ['Follows Canada’s anti-spam law', 'We follow CASL: only business addresses published without a notice refusing commercial messages, never consumers, and every email shows how to reach you and unsubscribe.'],
  mx: ['Cumple las reglas de cada país', 'Solo B2B: direcciones comerciales publicadas sin un aviso que rechace mensajes comerciales, nunca consumidores. Cada correo indica cómo contactarle y cómo darse de baja, y cada baja se respeta.'],
  cafr: ['Conforme à la Loi canadienne anti-pourriel', 'Nous suivons la LCAP : uniquement des adresses d’affaires publiées sans mention refusant les messages commerciaux, jamais de consommateurs, et chaque courriel indique comment vous joindre et se désabonner.'],
};

/* The pages. `agent` is one of the eight (its portrait) or a custom avatar file; `rows` the illustrative stores
   [type and place, why it fits]; `extraFaq` the industry's own question, first in the list. */
export const LP = [
  {
    path: '/lp/us/manufacturers', lang: 'en', country: 'us', where: 'the United States, Mexico, Canada',
    title: 'AI agents that find US stores and distributors for manufacturers',
    description: 'StockistScout’s AI agents find US retailers, distributors and online stores for your products and write each one a personal email under your company name. Free trial: 50 emails, no card.',
    eyebrow: 'Manufacturers selling wholesale · United States',
    lead: 'Tell us what you make and which stores should carry it. Every day your agent finds US retailers, distributors and online stores that fit, checks each one, and writes them a personal email under your company name. Replies come to your inbox.',
    agent: 'Roberto', agentLine: 'Roberto, your agent', agentSpec: 'Retailers &amp; distributors · US',
    rows: [
      ['Regional distributor <span class="muted small">· Columbus, OH</span>', 'carries your product category to independent stores across the Midwest.'],
      ['Independent hardware store <span class="muted small">· Austin, TX</span>', 'stocks tools and home goods from smaller makers, and sells online too.'],
      ['Specialty online store <span class="muted small">· Denver, CO</span>', 'its catalog already has your category, but not your brand.'],
      ['Family-owned general store <span class="muted small">· Burlington, VT</span>', 'made-in-USA products are its core range.'],
    ],
    extraFaq: ['What kinds of businesses can my agent find?', 'Stores and online shops that fit what you describe, and wholesalers, distributors and warehouses that could carry your line in volume. You choose the store type, the area, the size and the signs that a store fits, and what to exclude.'],
  },
  {
    path: '/lp/us/fashion', lang: 'en', country: 'us', where: 'the United States, Mexico, Canada',
    title: 'AI agents that find boutiques for fashion and apparel brands',
    description: 'StockistScout’s AI agents find US fashion and accessories boutiques whose style and prices match yours, and write each one a personal email under your brand. Free trial: 50 emails, no card.',
    eyebrow: 'Fashion &amp; apparel brands · United States',
    lead: 'Tell us your style, your price point and the boutiques you want. Every day your agent finds US fashion and accessories boutiques whose style and prices match yours, checks each one, and writes them a personal email under your brand. Replies come to your inbox.',
    agent: 'Raquel', agentLine: 'Raquel, your agent', agentSpec: 'Fashion &amp; accessories boutiques · US',
    rows: [
      ['Women’s clothing boutique <span class="muted small">· Charleston, SC</span>', 'carries emerging labels at your price point and posts new arrivals every week.'],
      ['Men’s shop <span class="muted small">· Portland, OR</span>', 'basics and accessories from independent brands, shipped nationwide.'],
      ['Online boutique <span class="muted small">· Scottsdale, AZ</span>', 'its style and prices match your line, with no brand like yours yet.'],
      ['Resort-wear shop <span class="muted small">· Naples, FL</span>', 'buys by season, swim and linen: a fit for your summer collection.'],
    ],
    extraFaq: ['Is this like a wholesale marketplace?', 'No. You are not listed in a catalog next to other brands, and there is no cut of your orders. Your agent writes to each boutique directly, under your brand, and the relationship is yours.'],
  },
  {
    path: '/lp/us/food', lang: 'en', country: 'us', where: 'the United States, Mexico, Canada',
    title: 'AI agents that find specialty stores for food and beverage brands',
    description: 'StockistScout’s AI agents find US gourmet grocers, specialty food shops and cafés for your products and write each one a personal email under your brand. Free trial: 50 emails, no card.',
    eyebrow: 'Food &amp; beverage brands · United States',
    lead: 'Describe your products, your wholesale terms and the stores you want: gourmet grocers, specialty food shops, cafés, delis. Every day your agent finds US stores that fit, checks each one, and writes them a personal email under your brand. Replies come to your inbox.',
    customAvatar: 'a05', agentLine: 'Your agent', agentSpec: 'Specialty food shops · US',
    rows: [
      ['Gourmet grocery <span class="muted small">· Asheville, NC</span>', 'local and small-batch pantry goods are its focus.'],
      ['Specialty coffee and tea shop <span class="muted small">· Seattle, WA</span>', 'sells packaged goods next to the bar, and your line fits its shelf.'],
      ['Cheese and charcuterie shop <span class="muted small">· Madison, WI</span>', 'pairs crackers, jams and sauces with what it sells.'],
      ['Online pantry store <span class="muted small">· Brooklyn, NY</span>', 'curates snacks and sauces from independent makers.'],
    ],
    extraFaq: ['Is there an agent for food and beverage?', 'Our eight ready-made specialists cover other kinds of stores (gift and home, beauty and wellness come closest), so you describe the food stores you want yourself. If none of the eight fits, you create your own agent for them, with its name and specialty; custom agents come with the Starter plan and up.'],
  },
  {
    path: '/lp/us/home-gift', lang: 'en', country: 'us', where: 'the United States, Mexico, Canada',
    title: 'AI agents that find gift and home stores for your brand',
    description: 'StockistScout’s AI agents find US gift shops, home stores and décor boutiques that carry products like yours, and write each one a personal email under your brand. Free trial: 50 emails, no card.',
    eyebrow: 'Home &amp; gift brands · United States',
    lead: 'Tell us what you make and the shops you want. Every day your agent finds US gift shops, home stores and décor boutiques that carry products like yours, checks each one, and writes to the person who buys for them, under your brand. Replies come to your inbox.',
    agent: 'Elias', agentLine: 'Elias, your agent', agentSpec: 'Gift, home &amp; décor shops · US',
    rows: [
      ['Gift shop <span class="muted small">· Savannah, GA</span>', 'carries handmade and small-brand gifts in your price range.'],
      ['Home décor boutique <span class="muted small">· Nashville, TN</span>', 'candles, textiles and tableware from independent makers.'],
      ['Garden and home store <span class="muted small">· Hudson, NY</span>', 'seasonal home goods: a natural fit for your spring line.'],
      ['Online gift store <span class="muted small">· Chicago, IL</span>', 'curated gift boxes, and your products fit its best sellers.'],
    ],
    extraFaq: ['Is this like a wholesale marketplace?', 'No. You are not listed in a catalog next to other brands, and there is no cut of your orders, reorders included. Your agent writes to each shop directly, under your brand, and the relationship is yours.'],
  },
  {
    path: '/lp/us/overseas', lang: 'en', country: 'us', where: 'the United States, Mexico, Canada',
    title: 'AI agents that find US stores for manufacturers abroad',
    description: 'Make it in Asia, Europe or Latin America? StockistScout’s AI agents find US retailers, distributors and online stores for your products and write each one a personal email in English under your company name. Free trial: 50 emails, no card.',
    eyebrow: 'Manufacturers abroad · Selling to the US',
    lead: 'You make it in Asia, Europe or Latin America, and US stores should carry it. Your agent finds US retailers, distributors and online stores that fit your products, checks each one, and writes them a personal email in English under your company name. Replies come to your inbox, wherever you are.',
    agent: 'Roberto', agentLine: 'Roberto, your agent', agentSpec: 'US retailers &amp; distributors',
    rows: [
      ['Importer and distributor <span class="muted small">· Los Angeles, CA</span>', 'brings in products in your category from overseas makers.'],
      ['Kitchen and home store <span class="muted small">· Minneapolis, MN</span>', 'buys direct from manufacturers for its own selection.'],
      ['Online store <span class="muted small">· Miami, FL</span>', 'sells your category nationwide, with no supplier like you yet.'],
      ['Toy and hobby shop <span class="muted small">· Columbus, OH</span>', 'an independent store that adds new lines every season.'],
    ],
    extraFaq: ['We are outside the US. Can we use it?', 'Yes. Your business can be anywhere. Your agent writes to US stores in English, under your company name, and you give a postal address for the email footer, as US law (CAN-SPAM) requires. Replies come to your inbox, in any time zone.'],
  },
  {
    path: '/lp/mx/fabricantes', lang: 'es', html: 'es-MX', locale: 'es_MX', country: 'mx', where: 'México, Estados Unidos, Canadá',
    title: 'Agentes de IA que encuentran tiendas y distribuidores para fabricantes',
    description: 'Los agentes de IA de StockistScout encuentran tiendas, distribuidores y tiendas en línea para sus productos y escriben a cada una un correo personal con el nombre de su empresa. Prueba gratis: 50 correos, sin tarjeta.',
    eyebrow: 'Fabricantes y marcas · México',
    lead: 'Cuéntenos qué fabrica y qué tiendas deberían venderlo. Cada día su agente encuentra tiendas, distribuidores y tiendas en línea que encajan, en México o en Estados Unidos, revisa cada una y les escribe un correo personal con el nombre de su empresa. Las respuestas llegan a su correo.',
    agent: 'Roberto', agentLine: 'Roberto, su agente', agentSpec: 'Tiendas y distribuidores · México',
    rows: [
      ['Distribuidora regional <span class="muted small">· Guadalajara, Jal.</span>', 'surte su categoría a tiendas independientes del Bajío.'],
      ['Ferretería independiente <span class="muted small">· Monterrey, N.L.</span>', 'vende herramienta y artículos para el hogar de marcas pequeñas, también en línea.'],
      ['Tienda en línea especializada <span class="muted small">· Ciudad de México</span>', 'su catálogo ya tiene su categoría, pero no su marca.'],
      ['Tienda de artículos para el hogar <span class="muted small">· Querétaro, Qro.</span>', 'trabaja con fabricantes mexicanos y busca líneas nuevas.'],
    ],
    extraFaq: ['¿Puedo vender a tiendas en Estados Unidos?', 'Sí. Cada agente trabaja un país y escribe en su idioma: un agente para México, en español, y otro para Estados Unidos, en inglés. Su negocio puede estar en cualquier lugar.'],
  },
  {
    path: '/lp/mx/moda', lang: 'es', html: 'es-MX', locale: 'es_MX', country: 'mx', where: 'México, Estados Unidos, Canadá',
    title: 'Agentes de IA que encuentran boutiques para marcas de moda y ropa',
    description: 'Los agentes de IA de StockistScout encuentran boutiques de moda y accesorios cuyo estilo y precios coinciden con los suyos, y les escriben un correo personal con el nombre de su marca. Prueba gratis: 50 correos, sin tarjeta.',
    eyebrow: 'Moda y ropa · México',
    lead: 'Cuéntenos su estilo, su rango de precios y las boutiques que busca. Cada día su agente encuentra boutiques de moda y accesorios cuyo estilo y precios coinciden con los suyos, revisa cada una y les escribe un correo personal con el nombre de su marca. Las respuestas llegan a su correo.',
    agent: 'Raquel', agentLine: 'Raquel, su agente', agentSpec: 'Boutiques de moda y accesorios · México',
    rows: [
      ['Boutique de ropa para dama <span class="muted small">· San Pedro Garza García, N.L.</span>', 'trabaja marcas mexicanas emergentes en su rango de precio.'],
      ['Tienda de ropa para caballero <span class="muted small">· Guadalajara, Jal.</span>', 'básicos y accesorios de marcas independientes, con envíos a todo el país.'],
      ['Boutique en línea <span class="muted small">· Ciudad de México</span>', 'su estilo y sus precios coinciden con su línea, y aún no tiene una marca como la suya.'],
      ['Tienda de ropa de playa <span class="muted small">· Playa del Carmen, Q. Roo</span>', 'compra por temporada, trajes de baño y lino: ideal para su colección de verano.'],
    ],
    extraFaq: ['¿Es como un marketplace de mayoreo?', 'No. No aparece en un catálogo junto a otras marcas y no hay comisión sobre sus pedidos. Su agente escribe directamente a cada boutique, con el nombre de su marca, y la relación es suya.'],
  },
  {
    path: '/lp/mx/alimentos', lang: 'es', html: 'es-MX', locale: 'es_MX', country: 'mx', where: 'México, Estados Unidos, Canadá',
    title: 'Agentes de IA que encuentran tiendas para marcas de alimentos y bebidas',
    description: 'Los agentes de IA de StockistScout encuentran tiendas gourmet, tiendas de productos regionales y cafeterías para sus productos, y les escriben un correo personal con el nombre de su marca. Prueba gratis: 50 correos, sin tarjeta.',
    eyebrow: 'Alimentos y bebidas · México',
    lead: 'Describa sus productos, sus condiciones de mayoreo y las tiendas que busca: tiendas gourmet, tiendas de productos regionales, cafeterías, delis. Cada día su agente encuentra tiendas que encajan, revisa cada una y les escribe un correo personal con el nombre de su marca. Las respuestas llegan a su correo.',
    customAvatar: 'a05', agentLine: 'Su agente', agentSpec: 'Tiendas gourmet y especializadas · México',
    rows: [
      ['Tienda gourmet <span class="muted small">· Polanco, Ciudad de México</span>', 'se especializa en productos artesanales y de pequeños productores.'],
      ['Cafetería de especialidad <span class="muted small">· Oaxaca, Oax.</span>', 'vende café, chocolate y productos empacados junto a la barra.'],
      ['Tienda de productos regionales <span class="muted small">· Mérida, Yuc.</span>', 'salsas, mieles y dulces de productores mexicanos son su línea principal.'],
      ['Tienda de despensa en línea <span class="muted small">· Guadalajara, Jal.</span>', 'selecciona botanas y salsas de marcas independientes.'],
    ],
    extraFaq: ['¿Hay un agente para alimentos y bebidas?', 'Nuestros ocho especialistas listos cubren otros tipos de tienda (regalos y hogar, belleza y bienestar son los más cercanos), así que usted describe las tiendas de alimentos que busca. Si ninguno de los ocho encaja, crea su propio agente para ellas, con su nombre y su especialidad; los agentes propios vienen desde el plan Starter.'],
  },
  {
    path: '/lp/ca/manufacturers', lang: 'en', html: 'en-CA', locale: 'en_CA', country: 'ca', where: 'Canada, the United States, Mexico',
    title: 'AI agents that find Canadian stores and distributors for your brand',
    description: 'StockistScout’s AI agents find retailers, distributors and online stores in Canada for your products and write each one a personal email under your company name, following CASL. Free trial: 50 emails, no card.',
    eyebrow: 'Manufacturers &amp; brands · Canada',
    lead: 'Tell us what you make and which stores should carry it. Every day your agent finds retailers, distributors and online stores that fit, in Canada or the United States, checks each one, and writes them a personal email under your company name. Replies come to your inbox.',
    agent: 'Roberto', agentLine: 'Roberto, your agent', agentSpec: 'Retailers &amp; distributors · Canada',
    rows: [
      ['Regional distributor <span class="muted small">· Mississauga, ON</span>', 'carries your category to independent stores across Ontario.'],
      ['Independent hardware store <span class="muted small">· Calgary, AB</span>', 'stocks tools and home goods from smaller makers, and sells online too.'],
      ['Specialty online store <span class="muted small">· Vancouver, BC</span>', 'its catalogue already has your category, but not your brand.'],
      ['General store <span class="muted small">· Halifax, NS</span>', 'Canadian-made products are its core range.'],
    ],
    extraFaq: ['Can I reach US stores too?', 'Yes. Each agent works one country: one agent for Canada and another for the United States. Your business can be anywhere.'],
  },
  {
    path: '/lp/ca/home-gift', lang: 'en', html: 'en-CA', locale: 'en_CA', country: 'ca', where: 'Canada, the United States, Mexico',
    title: 'AI agents that find gift and home stores in Canada',
    description: 'StockistScout’s AI agents find gift shops, home stores and décor boutiques in Canada that carry products like yours, and write each one a personal email under your brand, following CASL. Free trial: 50 emails, no card.',
    eyebrow: 'Home &amp; gift brands · Canada',
    lead: 'Tell us what you make and the shops you want. Every day your agent finds gift shops, home stores and décor boutiques across Canada that carry products like yours, checks each one, and writes to the person who buys for them, under your brand. Replies come to your inbox.',
    agent: 'Elias', agentLine: 'Elias, your agent', agentSpec: 'Gift, home &amp; décor shops · Canada',
    rows: [
      ['Gift shop <span class="muted small">· Niagara-on-the-Lake, ON</span>', 'carries handmade and small-brand gifts in your price range.'],
      ['Home décor boutique <span class="muted small">· Victoria, BC</span>', 'candles, textiles and tableware from independent makers.'],
      ['Cottage-country gift shop <span class="muted small">· Huntsville, ON</span>', 'seasonal home goods: a natural fit for your summer line.'],
      ['Online gift store <span class="muted small">· Toronto, ON</span>', 'curated gift boxes, and your products fit its best sellers.'],
    ],
    extraFaq: ['Is this like a wholesale marketplace?', 'No. You are not listed in a catalogue next to other brands, and there is no cut of your orders, reorders included. Your agent writes to each shop directly, under your brand, and the relationship is yours.'],
  },
  {
    path: '/lp/ca/fr/fabricants', lang: 'fr', html: 'fr-CA', locale: 'fr_CA', country: 'cafr', where: 'le Canada, les États-Unis, le Mexique',
    title: 'Des agents d’IA qui trouvent des détaillants et des distributeurs pour votre marque',
    description: 'Les agents d’IA de StockistScout trouvent des détaillants, des distributeurs et des boutiques en ligne au Canada pour vos produits et écrivent à chacun un courriel personnalisé au nom de votre entreprise, conformément à la LCAP. Essai gratuit : 50 courriels, sans carte.',
    eyebrow: 'Fabricants et marques · Canada',
    lead: 'Dites-nous ce que vous fabriquez et quelles boutiques devraient l’offrir. Chaque jour, votre agent trouve des détaillants, des distributeurs et des boutiques en ligne qui conviennent, au Canada ou aux États-Unis, vérifie chacun et lui écrit un courriel personnalisé au nom de votre entreprise. Les réponses arrivent dans votre boîte de réception.',
    agent: 'Roberto', agentLine: 'Roberto, votre agent', agentSpec: 'Détaillants et distributeurs · Canada',
    rows: [
      ['Distributeur régional <span class="muted small">· Laval, QC</span>', 'distribue votre catégorie aux commerces indépendants du Québec.'],
      ['Quincaillerie indépendante <span class="muted small">· Sherbrooke, QC</span>', 'offre des outils et des articles de maison de petits fabricants, et vend aussi en ligne.'],
      ['Boutique en ligne spécialisée <span class="muted small">· Montréal, QC</span>', 'son catalogue a déjà votre catégorie, mais pas votre marque.'],
      ['Magasin général <span class="muted small">· Gaspé, QC</span>', 'les produits d’ici sont au cœur de son offre.'],
    ],
    extraFaq: ['Puis-je joindre des boutiques aux États-Unis?', 'Oui. Chaque agent travaille un pays : un agent pour le Canada et un autre pour les États-Unis. Vous choisissez la langue de vos courriels, et votre entreprise peut être située n’importe où.'],
  },
  {
    path: '/lp/ca/fr/maison-cadeaux', lang: 'fr', html: 'fr-CA', locale: 'fr_CA', country: 'cafr', where: 'le Canada, les États-Unis, le Mexique',
    title: 'Des agents d’IA qui trouvent des boutiques cadeaux et déco pour votre marque',
    description: 'Les agents d’IA de StockistScout trouvent des boutiques cadeaux, des magasins de maison et des boutiques déco au Canada qui offrent des produits comme les vôtres, et leur écrivent un courriel personnalisé au nom de votre marque. Essai gratuit : 50 courriels, sans carte.',
    eyebrow: 'Maison et cadeaux · Canada',
    lead: 'Dites-nous ce que vous fabriquez et les boutiques que vous visez. Chaque jour, votre agent trouve des boutiques cadeaux, des magasins de maison et des boutiques déco qui offrent des produits comme les vôtres, vérifie chacune et écrit à la personne qui fait les achats, au nom de votre marque. Les réponses arrivent dans votre boîte de réception.',
    agent: 'Elias', agentLine: 'Elias, votre agent', agentSpec: 'Boutiques cadeaux, maison et déco · Canada',
    rows: [
      ['Boutique cadeaux <span class="muted small">· Québec, QC</span>', 'offre des cadeaux faits à la main et de petites marques dans votre gamme de prix.'],
      ['Boutique déco <span class="muted small">· Montréal, QC</span>', 'chandelles, textiles et vaisselle de créateurs indépendants.'],
      ['Magasin de jardin et maison <span class="muted small">· Saint-Sauveur, QC</span>', 'des articles de saison : un choix naturel pour votre collection de printemps.'],
      ['Boutique cadeaux en ligne <span class="muted small">· Gatineau, QC</span>', 'des coffrets-cadeaux soignés, et vos produits s’accordent avec ses meilleurs vendeurs.'],
    ],
    extraFaq: ['Est-ce comme une plateforme de vente en gros?', 'Non. Vous n’êtes pas inscrit dans un catalogue à côté d’autres marques, et aucune commission n’est prélevée sur vos commandes, ni sur les réapprovisionnements. Votre agent écrit directement à chaque boutique, au nom de votre marque, et la relation vous appartient.'],
  },
];

const ctaHref = (p) => CTA_URL + (p.lang === 'en' ? '' : `?lang=${p.lang}`);
/** The page's one call to action; `where` names the spot for the GA4 event (hero, header, final). */
export const lpCta = (p, where, cls = 'btn-primary', label = T[p.lang].cta) =>
  `<a class="btn ${cls} lp-cta" href="${ctaHref(p)}" data-cta="${where}">${label}</a>`;
export const lpText = (lang) => T[lang];
/** Our pages in the page's language (privacy, terms, results, home): English at the root, the others in their folder. */
export const inLang = (lang, path) => lang === 'en' ? path : `/${lang}${path === '/' ? '/' : path}`;

function body(p) {
  const t = T[p.lang];
  const avatar = p.agent ? `{{AVATAR:${p.agent}}}` : `<img class="avatar" src="/img/agents/custom/${p.customAvatar}.png" alt="" width="44" height="44" decoding="async">`;
  const check = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  const faq = [p.extraFaq, ...t.faq(p.where)];
  return `<section class="hero lp-hero">
  <div class="wrap hero-grid">
    <div>
      <p class="eyebrow">${p.eyebrow}</p>
      <h1>${t.hook1} <em>${t.hook2}</em></h1>
      <p class="lead">${p.lead}</p>
      <div class="actions">${lpCta(p, 'hero')}</div>
      <ul class="lp-ticks">
${t.ticks.map((x) => `        <li>${check}${x}</li>`).join('\n')}
      </ul>
    </div>
    <figure class="mock lp-mock" style="margin:0">
      <span class="mock-label">${t.example}</span>
      <div class="mock-top">
        ${avatar}
        <div class="who"><b>${p.agentLine}</b><span>${p.agentSpec}</span></div>
      </div>
      <ul class="mock-rows">
${p.rows.map(([store, why]) => `        <li><b>${store}</b><span class="why"><strong>${t.why}</strong>${why}</span></li>`).join('\n')}
      </ul>
      <figcaption class="caption">${t.mockCaption}</figcaption>
    </figure>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">${t.stepsEyebrow}</p>
      <h2>${t.stepsTitle}</h2>
    </div>
    <ol class="lp-steps">
${t.steps.map(([h, d], i) => `      <li class="card"><span class="lp-n">0${i + 1}</span><h3>${h}</h3><p>${d}</p></li>`).join('\n')}
    </ol>
  </div>
</section>

<section class="section tint">
  <div class="wrap lp-proof">
    <div>
      <p class="eyebrow">${t.proofEyebrow}</p>
      <h2>${t.proofTitle}</h2>
      <p class="lp-proof-text">${t.proofText}</p>
    </div>
    <div class="card lp-stats">
      <p class="lp-stats-lead">${t.statsLead}</p>
      <dl>
${t.stats.map(([n, l]) => `        <div><dt>${n}</dt><dd>${l}</dd></div>`).join('\n')}
      </dl>
      <p class="caption">${t.statsNote} <a href="${inLang(p.lang, '/results')}">${t.statsLink}</a></p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap lp-trust-grid">
    <div>
      <p class="eyebrow">${t.trustEyebrow}</p>
      <h2 class="lp-h2">${t.trustTitle}</h2>
      <ul class="lp-trust">
${t.trust(LAW[p.country]).map(([h, d]) => `        <li>${check}<div><b>${h}</b><span>${d}</span></div></li>`).join('\n')}
      </ul>
    </div>
    <figure class="app-shot lp-shot">
      <span class="shot-frame">
        <span class="shot-bar" aria-hidden="true"><i></i><i></i><i></i></span>
        <img src="/img/app/stores-${p.lang}.jpg" alt="${t.shotAlt}" width="1600" height="1000" loading="lazy" decoding="async">
      </span>
      <figcaption><span>${t.shotCaption}</span></figcaption>
    </figure>
  </div>
</section>

<section class="section tint">
  <div class="wrap faq">
    <h2 class="lp-h2">${t.faqTitle}</h2>
${faq.map(([q, a]) => `    <details><summary>${q}</summary><div class="ans"><p>${a}</p></div></details>`).join('\n')}
  </div>
</section>

<section class="cta-band">
  <div class="wrap cta-inner">
    <div>
      <h2>${t.finalTitle}</h2>
      <p>${t.finalText}</p>
    </div>
    <div class="cta-actions">${lpCta(p, 'final', 'btn-light')}</div>
  </div>
</section>`;
}

/** The pages as build.mjs reads them: { meta, body }. */
export function lpPages() {
  return LP.map((p) => ({
    meta: {
      path: p.path, title: p.title, description: p.description, noindex: true, html: p.html || p.lang, locale: p.locale,
      // What the shell's minimal header and footer need (shell.mjs, lpHeader / lpFooter).
      lp: { lang: p.lang, home: inLang(p.lang, '/'), homeLabel: T[p.lang].home, cta: lpCta(p, 'header', 'btn-primary btn-sm', T[p.lang].ctaShort),
        privacy: [inLang(p.lang, '/privacy'), T[p.lang].privacy], terms: [inLang(p.lang, '/terms'), T[p.lang].terms], place: T[p.lang].place },
    },
    body: body(p),
  }));
}

