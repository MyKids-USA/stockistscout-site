/**
 * The one shell every public page is built from: head, header with the menu, footer and
 * the language script. Change the menu here and run `npm run build`; every page picks it
 * up, because build.mjs re-wraps all of them. Modelled on trademarkscanner.app.
 *
 * One URL per language (15 Oct 2026): the pages carry English with Spanish, French, Brazilian Portuguese and
 * Simplified Chinese in data-es / data-fr / data-pt / data-zh, and build.mjs writes /es/, /fr/, /pt/ and /zh/ copies
 * with that text in the HTML, so search engines index all five (Portuguese and Chinese since 16 Oct 2026). The toggle goes to the other language's URL; the choice is remembered, and a first visit to an
 * English page follows the browser language.
 */
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { worldMapSvg } from './map.mjs';
// Chip flags: flag-icons (lipis/flag-icons, MIT licence), see site/flags.mjs.
import { flagImg } from './flags.mjs';

export const ORIGIN = 'https://stockistscout.com';

/* The site's languages, in the order of the language menu: one entry per language (Aharon, 16 Oct 2026: a dropdown,
   because there will be more: English, Español, Français, Português, 中文, then 日本語, 한국어, עברית, Italiano, Deutsch,
   Nederlands, العربية). `code` is the URL folder (or `folder`), `name` the language's name in itself, `word` its word for "Language", `html` its
   <html lang>, `hreflang` its hreflang, `locale` its og:locale, `dir` 'rtl' for a right-to-left language.
   Two ways to carry the texts:
   - es, fr, pt, zh: in data-<code> attributes beside the English in site/pages (and here);
   - `dict: true` (17 Oct 2026, ja ko he it de nl hi; ar, Modern Standard Arabic, right to left): a dictionary file site/i18n/<code>.json, {english: translation}, for
     every string in site/i18n/en.json (node site/i18n/extract.mjs writes it). The build refuses a dictionary that misses one.
   A dictionary language is built (folder, menu entry, hreflang, sitemap, browser redirect) only once its file exists, so
   adding a language is one entry here plus its JSON file. English is first and lives at the root. */
export const LANGUAGES = [
  { code: 'en', name: 'English', word: 'Language', html: 'en', hreflang: 'en', locale: 'en_US' },
  { code: 'es', name: 'Español', word: 'Idioma', html: 'es', hreflang: 'es', locale: 'es_MX' },
  { code: 'fr', name: 'Français', word: 'Langue', html: 'fr', hreflang: 'fr', locale: 'fr_CA' },
  { code: 'pt', name: 'Português', word: 'Idioma', html: 'pt-BR', hreflang: 'pt', locale: 'pt_BR' },
  { code: 'zh', name: '简体中文', word: '语言', html: 'zh-CN', hreflang: 'zh-Hans', locale: 'zh_CN' },
  // Traditional Chinese (17 Oct 2026), as Taiwan writes it, for Taiwan and Hong Kong: a dictionary language whose
  // site/i18n/zh-Hant.json is the Simplified texts converted (site/i18n/zh-hant.mjs, OpenCC cn → twp) and reviewed.
  // The code is the BCP 47 tag, as in the app (?lang=zh-Hant); `folder` is its URL (/zh-hant/).
  { code: 'zh-Hant', folder: 'zh-hant', name: '繁體中文', word: '語言', html: 'zh-Hant', hreflang: 'zh-Hant', locale: 'zh_TW', dict: true },
  { code: 'ja', name: '日本語', word: '言語', html: 'ja', hreflang: 'ja', locale: 'ja_JP', dict: true },
  { code: 'ko', name: '한국어', word: '언어', html: 'ko', hreflang: 'ko', locale: 'ko_KR', dict: true },
  { code: 'he', name: 'עברית', word: 'שפה', html: 'he', hreflang: 'he', locale: 'he_IL', dir: 'rtl', dict: true },
  { code: 'ar', name: 'العربية', word: 'اللغة', html: 'ar', hreflang: 'ar', locale: 'ar_AR', dir: 'rtl', dict: true },
  { code: 'it', name: 'Italiano', word: 'Lingua', html: 'it', hreflang: 'it', locale: 'it_IT', dict: true },
  { code: 'de', name: 'Deutsch', word: 'Sprache', html: 'de', hreflang: 'de', locale: 'de_DE', dict: true },
  { code: 'nl', name: 'Nederlands', word: 'Taal', html: 'nl', hreflang: 'nl', locale: 'nl_NL', dict: true },
  // Hindi (17 Oct 2026), Devanagari, for Indian brands and manufacturers selling to stores abroad: /hi/, site/i18n/hi.json.
  { code: 'hi', name: 'हिन्दी', word: 'भाषा', html: 'hi', hreflang: 'hi', locale: 'hi_IN', dict: true },
  // Bengali and Urdu (17 Oct 2026, Aharon: the most spoken languages we lacked; Russian left out on purpose), for the
  // garment and textile makers of Bangladesh and Pakistan selling to stores abroad. Urdu reads right to left, in Nastaliq.
  { code: 'bn', name: 'বাংলা', word: 'ভাষা', html: 'bn', hreflang: 'bn', locale: 'bn_BD', dict: true },
  { code: 'ur', name: 'اردو', word: 'زبان', html: 'ur', hreflang: 'ur', locale: 'ur_PK', dir: 'rtl', dict: true },
];
/* The home video (Katya, "In 60 seconds"): its YouTube id per language, the one place to set them. An empty id, or a
   language not listed, plays the English video. The build writes the page's id into data-yt of .promo-video. Its
   thumbnail is img/video/katya-<lang>.jpg when that file exists, else the English one (build.mjs, localizedImages). */
export const VIDEO_IDS = {
  en: 'HE0cuxSvniM',
  es: 'JJF5inZs5Wc',
  fr: 'DrOwz4ygT2s',
  pt: '-g9oN6wkOMw',
  zh: 'TDiLvoGpR1I',
  ja: 'GpeiUl_p0Tc',
  ko: 'sRWcQ7uPGqs',
  he: 'nhGyUfqmA_w',
  ar: 'Nq4Z18A1uU8',
  it: '2__CEktNPHc',
  de: 'gSSVdn8cr9E',
  nl: 'M60E8OVhar8',
  hi: 'Hn1dYKUqxds', // its thumbnail is img/video/katya-hi.jpg
  'zh-Hant': 'LL-3vszcp0U', // its thumbnail is img/video/katya-zh-hant.jpg
  bn: '9ZPpshD9BgA', // Bengali (17 Oct 2026); its thumbnail is img/video/katya-bn.jpg
  ur: 'q6F2pUNILdA', // Urdu (17 Oct 2026); its thumbnail is img/video/katya-ur.jpg
};
/* The setup tutorial (Katya, step by step, 2:49, 18 Oct 2026) on /how-it-works: its YouTube id per language, the one
   place to set them. A language not listed plays the English video. The build writes the id into data-yt of the
   .promo-video[data-video="tutorial"] box. Its thumbnail is img/video/tutorial-<lang>.jpg (lower case, zh-Hant →
   tutorial-zh-hant.jpg) once that language has an id here and the file exists, else the English one. */
export const TUTORIAL_IDS = {
  en: 'VukWTr2y8Sg',
  nl: 'q0lDRqDoO9c',
  'zh-Hant': '2uH5fzC1ibY',
  zh: 'c5LPFDmVnXE',
  ja: 'LOYzoL8a46Q',
  he: 'sDeGZ2G--sA',
  pt: 'oVKAqoWE0YM',
  fr: 'rJvHeeRzyFg',
  es: 'RuIb5ZHJYxw',
};
/** Where a dictionary language's translations live. */
export const dictFile = (code) => new URL(`./i18n/${code}.json`, import.meta.url);
/** The languages the site is built in: every attribute language, and each dictionary language whose file exists. */
export const SITE_LANGUAGES = LANGUAGES.filter((l) => !l.dict || existsSync(dictFile(l.code)));
/** The attribute languages (data-es, data-fr, ...): the build checks their coverage itself. */
export const ATTR_LANGUAGES = LANGUAGES.filter((l) => !l.dict);

/* The countries where the agents find stores and write to them (Aharon, 17 Oct 2026: "Available worldwide" needs one
   clear list, so a customer elsewhere does not buy thinking we cover their country). The one source for every list on
   the site: {{COUNTRIES:<lang>:<and|or>[:in]}} in a page writes the sentence form ("the United States, Mexico, ...
   and New Zealand"; French :in is "aux États-Unis, au Mexique, ..."), and {{WHERE_COUNTRIES}} the section of chips by
   region (home and pricing, id="countries"). The corporate agreement keeps its own fixed list: it is a dated contract,
   checked against the app's src/corporate/agreement.json. A new country is one entry here (and its rules in faq.html).
   `iso` / `num` (ISO 3166-1 alpha-2 and numeric, 18 Oct 2026) paint it green on the section's world map (site/map.mjs,
   world-atlas ids are the numeric code); `at` [lon, lat] places the dot of a country too small for the 110m map. */
export const COUNTRIES = [
  { region: 'americas', iso: 'US', num: '840', en: 'United States', the: true, es: 'Estados Unidos', fr: 'États-Unis', frArt: 'les États-Unis', frIn: 'aux États-Unis', pt: 'Estados Unidos', zh: '美国' },
  { region: 'americas', iso: 'MX', num: '484', en: 'Mexico', es: 'México', fr: 'Mexique', frArt: 'le Mexique', frIn: 'au Mexique', pt: 'México', zh: '墨西哥' },
  { region: 'americas', iso: 'CA', num: '124', en: 'Canada', es: 'Canadá', fr: 'Canada', frArt: 'le Canada', frIn: 'au Canada', pt: 'Canadá', zh: '加拿大' },
  { region: 'americas', iso: 'GT', num: '320', en: 'Guatemala', es: 'Guatemala', fr: 'Guatemala', frArt: 'le Guatemala', frIn: 'au Guatemala', pt: 'Guatemala', zh: '危地马拉' },
  // Honduras and Paraguay (17 Oct 2026, app commit 1a5eaf9): Spanish, company inboxes only; Paraguay's Ley 4868 notice.
  { region: 'americas', iso: 'HN', num: '340', en: 'Honduras', es: 'Honduras', fr: 'Honduras', frArt: 'le Honduras', frIn: 'au Honduras', pt: 'Honduras', zh: '洪都拉斯' },
  { region: 'americas', iso: 'PE', num: '604', en: 'Peru', es: 'Perú', fr: 'Pérou', frArt: 'le Pérou', frIn: 'au Pérou', pt: 'Peru', zh: '秘鲁' },
  { region: 'americas', iso: 'CO', num: '170', en: 'Colombia', es: 'Colombia', fr: 'Colombie', frArt: 'la Colombie', frIn: 'en Colombie', pt: 'Colômbia', zh: '哥伦比亚' },
  { region: 'americas', iso: 'PA', num: '591', en: 'Panama', es: 'Panamá', fr: 'Panama', frArt: 'le Panama', frIn: 'au Panama', pt: 'Panamá', zh: '巴拿马' },
  { region: 'americas', iso: 'AR', num: '032', en: 'Argentina', es: 'Argentina', fr: 'Argentine', frArt: 'l’Argentine', frIn: 'en Argentine', pt: 'Argentina', zh: '阿根廷' },
  { region: 'americas', iso: 'CL', num: '152', en: 'Chile', es: 'Chile', fr: 'Chili', frArt: 'le Chili', frIn: 'au Chili', pt: 'Chile', zh: '智利' },
  { region: 'americas', iso: 'PY', num: '600', en: 'Paraguay', es: 'Paraguay', fr: 'Paraguay', frArt: 'le Paraguay', frIn: 'au Paraguay', pt: 'Paraguai', zh: '巴拉圭' },
  { region: 'americas', iso: 'BR', num: '076', en: 'Brazil', es: 'Brasil', fr: 'Brésil', frArt: 'le Brésil', frIn: 'au Brésil', pt: 'Brasil', zh: '巴西' },
  { region: 'europe', iso: 'GB', num: '826', en: 'United Kingdom', the: true, es: 'Reino Unido', fr: 'Royaume-Uni', frArt: 'le Royaume-Uni', frIn: 'au Royaume-Uni', pt: 'Reino Unido', zh: '英国' },
  { region: 'europe', iso: 'IE', num: '372', en: 'Ireland', es: 'Irlanda', fr: 'Irlande', frArt: 'l’Irlande', frIn: 'en Irlande', pt: 'Irlanda', zh: '爱尔兰' },
  // France with Guadeloupe and Martinique (17 Oct 2026, app commit 2e20645: French rules, regions of France): `adds` is
  // what the sentences say after France (`chip`, shorter, on its chip), `dots` the two islands on the map (green dots, named in each language).
  { region: 'europe', iso: 'FR', num: '250', en: 'France', es: 'Francia', fr: 'France', frArt: 'la France', frIn: 'en France', pt: 'França', zh: '法国',
    adds: { en: 'with Guadeloupe and Martinique', es: 'con Guadalupe y Martinica', fr: 'avec la Guadeloupe et la Martinique', pt: 'com Guadalupe e Martinica', zh: '含瓜德罗普和马提尼克' },
    chip: { en: '+ Guadeloupe, Martinique', es: '+ Guadalupe, Martinica', fr: '+ Guadeloupe, Martinique', pt: '+ Guadalupe, Martinica', zh: '含瓜德罗普、马提尼克' },
    dots: [
      { small: true, iso: 'GP', num: '312', at: [-61.55, 16.25], en: 'Guadeloupe', es: 'Guadalupe', fr: 'Guadeloupe', pt: 'Guadalupe', zh: '瓜德罗普' },
      { small: true, iso: 'MQ', num: '474', at: [-61.02, 14.64], en: 'Martinique', es: 'Martinica', fr: 'Martinique', pt: 'Martinica', zh: '马提尼克' },
    ] },
  // Belgium: Brussels and Wallonia in French, Flanders in English (17 Oct 2026, app commit badd871: two options in the app,
  // 'BE' and 'XF'); one country here and on the map, its chip and the sentences name the three regions.
  { region: 'europe', iso: 'BE', num: '056', en: 'Belgium', es: 'Bélgica', fr: 'Belgique', frArt: 'la Belgique', frIn: 'en Belgique', pt: 'Bélgica', zh: '比利时',
    adds: { en: 'Brussels, Wallonia and Flanders', es: 'Bruselas, Valonia y Flandes', fr: 'Bruxelles, la Wallonie et la Flandre', pt: 'Bruxelas, Valônia e Flandres', zh: '布鲁塞尔、瓦隆和佛兰德' },
    chip: { en: 'Brussels, Wallonia, Flanders', es: 'Bruselas, Valonia, Flandes', fr: 'Bruxelles, Wallonie, Flandre', pt: 'Bruxelas, Valônia, Flandres', zh: '布鲁塞尔、瓦隆、佛兰德' } },
  // Northern Europe and Croatia (17 Oct 2026, app commit badd871): English, a company's generic inbox only, companies only
  // (no sole traders), the GDPR notice.
  { region: 'europe', iso: 'NO', num: '578', en: 'Norway', es: 'Noruega', fr: 'Norvège', frArt: 'la Norvège', frIn: 'en Norvège', pt: 'Noruega', zh: '挪威' },
  { region: 'europe', iso: 'FI', num: '246', en: 'Finland', es: 'Finlandia', fr: 'Finlande', frArt: 'la Finlande', frIn: 'en Finlande', pt: 'Finlândia', zh: '芬兰' },
  { region: 'europe', iso: 'EE', num: '233', en: 'Estonia', es: 'Estonia', fr: 'Estonie', frArt: 'l’Estonie', frIn: 'en Estonie', pt: 'Estônia', zh: '爱沙尼亚' },
  { region: 'europe', iso: 'LT', num: '440', en: 'Lithuania', es: 'Lituania', fr: 'Lituanie', frArt: 'la Lituanie', frIn: 'en Lituanie', pt: 'Lituânia', zh: '立陶宛' },
  { region: 'europe', iso: 'IS', num: '352', en: 'Iceland', es: 'Islandia', fr: 'Islande', frArt: 'l’Islande', frIn: 'en Islande', pt: 'Islândia', zh: '冰岛' },
  { region: 'europe', iso: 'HR', num: '191', en: 'Croatia', es: 'Croacia', fr: 'Croatie', frArt: 'la Croatie', frIn: 'en Croatie', pt: 'Croácia', zh: '克罗地亚' },
  // Israel (16 Oct 2026, app commit 2338602): a single consent request first, the offer only after a written yes.
  { region: 'mideast', iso: 'IL', num: '376', en: 'Israel', es: 'Israel', fr: 'Israël', frArt: 'Israël', frIn: 'en Israël', pt: 'Israel', zh: '以色列' },
  // The United Arab Emirates, Jordan, Morocco (French) and South Africa (17 Oct 2026, app commit ac1d00e): company inboxes only;
  // South Africa is consent first like Israel (one request for consent, the offer only after a written yes, no follow-up).
  { region: 'mideast', iso: 'AE', num: '784', en: 'United Arab Emirates', the: true, es: 'Emiratos Árabes Unidos', fr: 'Émirats arabes unis', frArt: 'les Émirats arabes unis', frIn: 'aux Émirats arabes unis', pt: 'Emirados Árabes Unidos', zh: '阿拉伯联合酋长国' },
  { region: 'mideast', iso: 'JO', num: '400', en: 'Jordan', es: 'Jordania', fr: 'Jordanie', frArt: 'la Jordanie', frIn: 'en Jordanie', pt: 'Jordânia', zh: '约旦' },
  { region: 'africa', iso: 'MA', num: '504', en: 'Morocco', es: 'Marruecos', fr: 'Maroc', frArt: 'le Maroc', frIn: 'au Maroc', pt: 'Marrocos', zh: '摩洛哥' },
  { region: 'africa', iso: 'ZA', num: '710', en: 'South Africa', es: 'Sudáfrica', fr: 'Afrique du Sud', frArt: 'l’Afrique du Sud', frIn: 'en Afrique du Sud', pt: 'África do Sul', zh: '南非' },
  { region: 'apac', iso: 'SG', num: '702', at: [103.82, 1.35], en: 'Singapore', es: 'Singapur', fr: 'Singapour', frArt: 'Singapour', frIn: 'à Singapour', pt: 'Singapura', zh: '新加坡' },
  { region: 'apac', iso: 'HK', num: '344', at: [114.17, 22.32], en: 'Hong Kong', es: 'Hong Kong', fr: 'Hong Kong', frArt: 'Hong Kong', frIn: 'à Hong Kong', pt: 'Hong Kong', zh: '香港' },
  // Taiwan (17 Oct 2026, app commit 97ab756): Traditional Chinese by default (or English), the source and a free refusal in every
  // email, a refusal stops every brand at once, 「謝絕推銷」 sites skipped. Named neutrally everywhere: Taiwan, 台湾 / 台灣.
  // 27 square units on the 110m map, just above MIN_AREA, so it is painted without a dot.
  { region: 'apac', iso: 'TW', num: '158', en: 'Taiwan', es: 'Taiwán', fr: 'Taïwan', frArt: 'Taïwan', frIn: 'à Taïwan', pt: 'Taiwan', zh: '台湾' },
  { region: 'apac', iso: 'AU', num: '036', en: 'Australia', es: 'Australia', fr: 'Australie', frArt: 'l’Australie', frIn: 'en Australie', pt: 'Austrália', zh: '澳大利亚' },
  { region: 'apac', iso: 'NZ', num: '554', en: 'New Zealand', es: 'Nueva Zelanda', fr: 'Nouvelle-Zélande', frArt: 'la Nouvelle-Zélande', frIn: 'en Nouvelle-Zélande', pt: 'Nova Zelândia', zh: '新西兰' },
  // India and the Philippines (17 Oct 2026, app commit ac1d00e): English, company inboxes only; the Philippines adds a privacy notice.
  { region: 'apac', iso: 'IN', num: '356', en: 'India', es: 'India', fr: 'Inde', frArt: 'l’Inde', frIn: 'en Inde', pt: 'Índia', zh: '印度' },
  { region: 'apac', iso: 'PH', num: '608', en: 'Philippines', the: true, es: 'Filipinas', fr: 'Philippines', frArt: 'les Philippines', frIn: 'aux Philippines', pt: 'Filipinas', zh: '菲律宾' },
  // The Caribbean islands (17 Oct 2026, app commit 2e20645): ONE country option in the app ("Caribbean Islands"), one agent
  // for all six; English, Barbados to company inboxes only. Jamaica is not open. The sentences name them as one item
  // ("the Caribbean islands (Trinidad and Tobago, ...)", CARIBBEAN below); `esArt` is the Spanish name in that sentence.
  { region: 'caribbean', small: true, iso: 'TT', num: '780', at: [-61.25, 10.45], en: 'Trinidad and Tobago', es: 'Trinidad y Tobago', fr: 'Trinité-et-Tobago', frArt: 'Trinité-et-Tobago', pt: 'Trinidad e Tobago', zh: '特立尼达和多巴哥' },
  { region: 'caribbean', iso: 'BS', num: '044', at: [-77.35, 25.05], en: 'Bahamas', the: true, es: 'Bahamas', esArt: 'las Bahamas', fr: 'Bahamas', frArt: 'les Bahamas', pt: 'Bahamas', zh: '巴哈马' },
  { region: 'caribbean', small: true, iso: 'BB', num: '052', at: [-59.55, 13.15], en: 'Barbados', es: 'Barbados', fr: 'Barbade', frArt: 'la Barbade', pt: 'Barbados', zh: '巴巴多斯' },
  { region: 'caribbean', iso: 'KY', num: '136', at: [-81.25, 19.31], en: 'Cayman Islands', the: true, es: 'Islas Caimán', esArt: 'las Islas Caimán', fr: 'Îles Caïmans', frArt: 'les îles Caïmans', pt: 'Ilhas Cayman', zh: '开曼群岛' },
  { region: 'caribbean', iso: 'BM', num: '060', at: [-64.75, 32.31], en: 'Bermuda', es: 'Bermudas', fr: 'Bermudes', frArt: 'les Bermudes', pt: 'Bermudas', zh: '百慕大' },
  { region: 'caribbean', iso: 'AW', num: '533', at: [-69.97, 12.52], en: 'Aruba', es: 'Aruba', fr: 'Aruba', frArt: 'Aruba', pt: 'Aruba', zh: '阿鲁巴' },
];
/** The Caribbean islands as one item of a sentence, in each attribute language (the islands follow in parentheses). */
const CARIBBEAN = { en: 'the Caribbean islands', es: 'las islas del Caribe', frArt: 'les îles des Caraïbes', frIn: 'dans les îles des Caraïbes', pt: 'ilhas do Caribe', zh: '加勒比群岛' };
/** The iso codes that need a flag on the chips (build.mjs writes img/flags/ for them). */
export const FLAG_ISOS = () => [...COUNTRIES, ...COMING_SOON].map((c) => c.iso);
/** Every place painted on the map: the countries, and the dots that belong to one (Guadeloupe and Martinique). */
export const MAP_PLACES = COUNTRIES.flatMap((c) => [c, ...(c.dots || [])]);
/* Next in line (shown on the map in a lighter green, and as the line under the chips): not on any list above until it moves
   into COUNTRIES. `soon` is the line in each attribute language; dictionary languages translate its English. */
export const COMING_SOON = [
  { iso: 'PT', num: '620', en: 'Portugal', soon: { en: 'Portugal: coming soon', es: 'Portugal: próximamente', fr: 'Portugal : bientôt', pt: 'Portugal: em breve', zh: '葡萄牙：即将推出' } },
];
const REGIONS = [
  { id: 'americas', en: 'Americas', es: 'América', fr: 'Amériques', pt: 'Américas', zh: '美洲' },
  { id: 'caribbean', en: 'Caribbean islands', es: 'Islas del Caribe', fr: 'Îles des Caraïbes', pt: 'Ilhas do Caribe', zh: '加勒比群岛' },
  { id: 'europe', en: 'Europe', es: 'Europa', fr: 'Europe', pt: 'Europa', zh: '欧洲' },
  { id: 'mideast', en: 'Middle East', es: 'Oriente Medio', fr: 'Moyen-Orient', pt: 'Oriente Médio', zh: '中东' },
  { id: 'africa', en: 'Africa', es: 'África', fr: 'Afrique', pt: 'África', zh: '非洲' },
  { id: 'apac', en: 'Asia-Pacific', es: 'Asia-Pacífico', fr: 'Asie-Pacifique', pt: 'Ásia-Pacífico', zh: '亚太地区' },
];
const CONJ = { en: { and: 'and', or: 'or' }, es: { and: 'y', or: 'o' }, fr: { and: 'et', or: 'ou' }, pt: { and: 'e', or: 'ou' }, zh: { and: '和', or: '或' } };
/** The countries as a sentence in a language: "the United States, Mexico, ... and New Zealand". */
export function countryList(lang, conj = 'and', form = '') {
  const one = (c, f = form) => lang === 'en' ? (c.the ? 'the ' : '') + c.en : lang === 'fr' ? (f === 'in' ? c.frIn : c.frArt) : lang === 'es' ? c.esArt || c.es : c[lang];
  const join = (names, word) => {
    if (!word || names.some((n) => !n)) throw new Error(`countryList: no ${lang}/${conj}`);
    if (lang === 'zh') return names.slice(0, -1).join('、') + word + names.at(-1);
    return names.slice(0, -1).join(', ') + ` ${word} ` + names.at(-1);
  };
  const [lp, rp] = lang === 'zh' ? ['（', '）'] : [' (', ')'];
  const names = COUNTRIES.filter((c) => c.region !== 'caribbean').map((c) => c.adds ? one(c) + lp + c.adds[lang] + rp : one(c));
  const islands = COUNTRIES.filter((c) => c.region === 'caribbean').map((c) => one(c, ''));
  names.push((lang === 'fr' ? CARIBBEAN[form === 'in' ? 'frIn' : 'frArt'] : CARIBBEAN[lang]) + lp + join(islands, CONJ[lang]?.and) + rp);
  return join(names, CONJ[lang]?.[conj]);
}
/** A strip of every country's flag for a hero ({{HERO_FLAGS}}, the hotels page; Aharon, 18 Oct 2026: "más bonito, con
 *  sus banderitas y en hero"). Each flag carries its name for screen readers and as a hover label; the strip links to the
 *  full list by region (#countries) on the same page. */
export function heroFlags() {
  const t = (o, tag = 'span', extra = '') => `<${tag}${extra} data-es="${attr(o.es)}" data-fr="${attr(o.fr)}" data-pt="${attr(o.pt)}" data-zh="${attr(o.zh)}">${o.en}</${tag}>`;
  const items = COUNTRIES.map((c) => `      <li>${flagImg(c.iso).replace('class="flag"', 'class="flag flag-hero"')}${t(c, 'span', ' class="hero-flag-name"')}</li>`).join('\n');
  const all = { en: 'See all the countries', es: 'Ver todos los países', fr: 'Voir tous les pays', pt: 'Ver todos os países', zh: '查看全部国家和地区' };
  return `<div class="hero-flags">
    <ul class="hero-flag-list">
${items}
    </ul>
    <a class="hero-flags-all" href="#countries">${t(all)} →</a>
  </div>`;
}
/** How many countries the agents write to, the Caribbean islands not counted ({{COUNTRY_COUNT}}, the FAQ). */
export const countryCount = () => COUNTRIES.filter((c) => c.region !== 'caribbean').length;
/** The countries by region as compact flag chips inside an answer ({{FAQ_COUNTRY_GROUPS}}, the FAQ; Aharon, 18 Oct 2026:
 *  "que sea fácil de leer"). Five groups: the Middle East and Africa share one. */
export function faqCountryGroups() {
  const t = (o, tag = 'span', extra = '') => `<${tag}${extra} data-es="${attr(o.es)}" data-fr="${attr(o.fr)}" data-pt="${attr(o.pt)}" data-zh="${attr(o.zh)}">${o.en}</${tag}>`;
  const by = (id) => REGIONS.find((r) => r.id === id);
  const groups = [
    [by('americas'), ['americas']],
    [by('caribbean'), ['caribbean']],
    [by('europe'), ['europe']],
    [{ en: 'Middle East and Africa', es: 'Oriente Medio y África', fr: 'Moyen-Orient et Afrique', pt: 'Oriente Médio e África', zh: '中东和非洲' }, ['mideast', 'africa']],
    [by('apac'), ['apac']],
  ];
  return `<div class="country-groups faq-countries">
${groups.map(([label, ids]) => `      <div class="country-group">
        ${t(label, 'h3')}
        <ul class="country-chips">
${COUNTRIES.filter((c) => ids.includes(c.region)).map((c) => `          <li>${flagImg(c.iso)}${t(c, 'span')}${c.chip ? ` ${t(c.chip, 'small', ' class="chip-adds"')}` : ''}</li>`).join('\n')}
        </ul>
      </div>`).join('\n')}
    </div>`;
}
/** The section that lists them by region ({{WHERE_COUNTRIES}}, home and pricing): the anchor #countries. */
export function countriesSection(kind = 'stores') {
  // The hotels page says companies, not stores ({{WHERE_COUNTRIES:companies}}, 18 Oct 2026).
  const co = kind === 'companies';
  const t = (o, tag = 'span', extra = '') => `<${tag}${extra} data-es="${attr(o.es)}" data-fr="${attr(o.fr)}" data-pt="${attr(o.pt)}" data-zh="${attr(o.zh)}">${o.en}</${tag}>`;
  const groups = REGIONS.map((r) => `      <div class="country-group">
        ${t(r, 'h3')}
        <ul class="country-chips">
${COUNTRIES.filter((c) => c.region === r.id).map((c) => `          <li>${flagImg(c.iso)}${t(c, 'span')}${c.chip ? ` ${t(c.chip, 'small', ' class="chip-adds"')}` : ''}</li>`).join('\n')}
        </ul>
      </div>`).join('\n');
  return `<section class="countries-band" id="countries" aria-labelledby="countries-h">
  <div class="wrap">
    ${t(co ? { en: 'Where our agents find companies', es: 'Dónde encuentran empresas nuestros agentes', fr: 'Où nos agents trouvent des entreprises', pt: 'Onde nossos agentes encontram empresas', zh: '我们的智能体在哪些国家/地区寻找企业' } : { en: 'Where our agents find stores', es: 'Dónde encuentran tiendas nuestros agentes', fr: 'Où nos agents trouvent des boutiques', pt: 'Onde nossos agentes encontram lojas', zh: '我们的智能体在哪些国家/地区寻找零售店' }, 'h2', ' id="countries-h"')}
    ${t(co ? { en: 'Your hotel can be anywhere; your agents write to companies in these countries. More are coming as we check each country’s law.', es: 'Su hotel puede estar en cualquier lugar; sus agentes escriben a empresas de estos países. Iremos sumando más a medida que revisamos la ley de cada país.', fr: 'Votre hôtel peut être n’importe où ; vos agents écrivent aux entreprises de ces pays. D’autres s’ajouteront à mesure que nous vérifions la loi de chaque pays.', pt: 'Seu hotel pode estar em qualquer lugar; seus agentes escrevem para empresas destes países. Vamos somar mais à medida que verificamos a lei de cada país.', zh: '您的酒店可以位于任何地方；您的智能体会给这些国家和地区的企业写信。我们核查各国法律后，会陆续增加更多国家和地区。' } : { en: 'Your business can be anywhere; your agents write to stores in these countries. More are coming as we check each country’s law.', es: 'Tu negocio puede estar en cualquier lugar; tus agentes escriben a tiendas de estos países. Iremos sumando más a medida que revisamos la ley de cada país.', fr: 'Votre entreprise peut être n’importe où; vos agents écrivent à des boutiques de ces pays. D’autres s’ajouteront à mesure que nous vérifions la loi de chaque pays.', pt: 'Sua empresa pode estar em qualquer lugar; seus agentes escrevem para lojas destes países. Outros virão à medida que verificamos a lei de cada país.', zh: '您的企业可以位于任何地方；您的智能体会给这些国家/地区的零售店写信。我们核查各国法律后，会陆续增加更多国家/地区。' }, 'p', ' class="countries-lead"')}
    <figure class="cmap-wrap">
      ${worldMapSvg(MAP_PLACES, COMING_SOON)}
      <span class="cmap-tip" hidden></span>
      <figcaption class="cmap-legend">
        <span class="cmap-key"><i class="cmap-sw" aria-hidden="true"></i>${t(co ? { en: 'Agents find companies here', es: 'Los agentes encuentran empresas aquí', fr: 'Les agents trouvent des entreprises ici', pt: 'Os agentes encontram empresas aqui', zh: '智能体在这里寻找企业' } : { en: 'Agents find stores here', es: 'Los agentes encuentran tiendas aquí', fr: 'Les agents trouvent des boutiques ici', pt: 'Os agentes encontram lojas aqui', zh: '智能体在这里寻找零售店' })}</span>
        <span class="cmap-key"><i class="cmap-sw cmap-sw-soon" aria-hidden="true"></i>${t({ en: 'Coming soon', es: 'Próximamente', fr: 'Bientôt', pt: 'Em breve', zh: '即将推出' })}</span>
      </figcaption>
    </figure>
${COUNTRIES.flatMap((c) => c.dots || []).map((c) => `    ${t(c, 'span', ` class="cmap-name" data-iso="${c.iso}" hidden`)}`).join('\n')}
    ${t({ en: 'World map of the countries where our agents find stores: {countries}. {soon}', es: 'Mapa del mundo con los países donde nuestros agentes encuentran tiendas: {countries}. {soon}', fr: 'Carte du monde des pays où nos agents trouvent des boutiques : {countries}. {soon}', pt: 'Mapa-múndi dos países onde nossos agentes encontram lojas: {countries}. {soon}', zh: '我们的智能体寻找零售店的国家/地区世界地图：{countries}。{soon}' }, 'span', ' class="cmap-label" hidden')}
    <div class="country-groups">
${groups}
    </div>
${COMING_SOON.map((c) => `    <p class="countries-soon" data-iso="${c.iso}">${flagImg(c.iso)}${t(c.soon)}</p>`).join('\n')}
    ${MAP_SCRIPT}
  </div>
</section>`;
}
/* The map's tooltip (hover or tap on a green country): the <title> becomes the tooltip, so the browser's own does not
   show twice. The SVG is role="img" with an aria-label listing every country, so its inner titles are never read. */
const MAP_SCRIPT = `<script>(function(){var w=document.querySelector('.cmap-wrap');if(!w)return;var tip=w.querySelector('.cmap-tip');w.querySelectorAll('.cmap [data-iso]').forEach(function(e){var t=e.querySelector('title');if(t){e.setAttribute('data-name',t.textContent);t.remove();}});function hide(){tip.hidden=true;}w.addEventListener('pointermove',function(v){var e=v.target.closest&&v.target.closest('[data-name]');if(!e){hide();return;}var r=w.getBoundingClientRect();tip.textContent=e.getAttribute('data-name');tip.hidden=false;var x=Math.max(8,Math.min(v.clientX-r.left,r.width-tip.offsetWidth/2-8));tip.style.left=Math.max(tip.offsetWidth/2,x)+'px';tip.style.top=(v.clientY-r.top)+'px';});w.addEventListener('pointerleave',hide);})();</script>`;

/** The names in the map in a language, and its aria-label (build.mjs calls it after translating a page): `name(c)`
    is a country's name in that language, `join` how a list is joined. */
export function localizeMap(document, name, join) {
  const svg = document.querySelector('svg.cmap');
  if (!svg) return;
  const byIso = new Map(COUNTRIES.map((c) => [c.iso, name(c)]));
  for (const el of document.querySelectorAll('.cmap-name[data-iso]')) { byIso.set(el.getAttribute('data-iso'), el.textContent.trim()); el.remove(); }
  for (const c of COMING_SOON) byIso.set(c.iso, document.querySelector(`.countries-soon[data-iso="${c.iso}"]`)?.textContent.trim());
  for (const el of svg.querySelectorAll('[data-iso]')) {
    const n = byIso.get(el.getAttribute('data-iso'));
    if (!n) throw new Error(`map: no name for ${el.getAttribute('data-iso')}`);
    const title = [...el.childNodes].find((x) => x.nodeName.toLowerCase() === 'title');
    title.textContent = n;
  }
  const label = document.querySelector('.cmap-label');
  const soon = COMING_SOON.map((c) => byIso.get(c.iso)).join(' ');
  svg.setAttribute('aria-label', label.textContent.replace('{countries}', MAP_PLACES.map((c) => byIso.get(c.iso)).join(join)).replace('{soon}', soon).trim());
  label.remove();
}

/** A language's URL folder: its code, or `folder` where the code has capitals (zh-Hant → zh-hant). */
export const folderOf = (lang) => LANGUAGES.find((l) => l.code === lang)?.folder ?? lang;
/** A language's data-<key> attribute name: lower case (data-zh-hant), as HTML writes attribute names. */
export const attrKey = (lang) => lang.toLowerCase();
/** A page's path in a language: /pricing → /es/pricing, / → /es/. */
export const pathIn = (path, lang) => lang === 'en' ? path : `/${folderOf(lang)}${path === '/' ? '/' : path}`;
const GLOBE_ICON = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
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
export const CONTACT_PHONE = '+1 (401) 41-SCOUT'; // the country code shown with the letters too (Aharon, 17 Oct 2026)
export const CONTACT_PHONE_DIGITS = '+1 (401) 417-2688'; // with the US country code (Aharon, 17 Oct 2026)
export const CONTACT_TEL = 'tel:+14014172688';
/* A tiny US flag in front of the number (17 Oct 2026): an inline SVG, never the flag emoji (Windows shows the letters
   "US"). Written by the templates (nav, footer, contact) and, for a number inside a translated text (privacy), by
   flagPhones after the page is translated. The number and its flag sit in .tel-num, a left-to-right island on he/ar. */
export const US_FLAG = '<svg class="us-flag" aria-hidden="true" focusable="false" width="16" height="11" viewBox="0 0 16 11"><rect width="16" height="11" fill="#B22234"/><path fill="#fff" d="M0 0.846h16v0.846H0zM0 2.538h16v0.846H0zM0 4.231h16v0.846H0zM0 5.923h16v0.846H0zM0 7.615h16v0.846H0zM0 9.308h16v0.846H0z"/><rect width="6.8" height="5.923" fill="#3C3B6E"/></svg>';
/** Wraps every CONTACT_PHONE_DIGITS in the body's text that is not already in .tel-num with the flag (build.mjs calls it
    after a page is translated, so the dictionaries keep the bare number). */
export function flagPhones(document) {
  const walker = document.createTreeWalker(document.body, 4 /* NodeFilter.SHOW_TEXT */);
  const hits = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.textContent.includes(CONTACT_PHONE_DIGITS) && !n.parentNode.closest('.tel-num, script, style')) hits.push(n);
  }
  for (const n of hits) {
    const parts = n.textContent.split(CONTACT_PHONE_DIGITS);
    const frag = document.createDocumentFragment();
    parts.forEach((t, i) => {
      if (i) {
        const span = document.createElement('span');
        span.setAttribute('class', 'tel-num');
        span.innerHTML = US_FLAG + CONTACT_PHONE_DIGITS;
        frag.appendChild(span);
      }
      if (t) frag.appendChild(document.createTextNode(t));
    });
    n.parentNode.replaceChild(frag, n);
  }
}
const PHONE_ICON = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>';

/* Open for business (Aharon, 10 Oct 2026): the call to action is the free trial in the app, no waitlist. */
export const APP_URL = 'https://app.stockistscout.com';
export const CTA_URL = `${APP_URL}/signup`;
export const LOGIN_URL = `${APP_URL}/login`;
export const CTA_LABEL = 'Start free';
export const CTA_LABEL_ES = 'Empieza gratis';
export const CTA_LABEL_FR = 'Commencez gratuitement';
export const CTA_LABEL_PT = 'Comece grátis';
export const CTA_LABEL_ZH = '免费开始';

/** The one call-to-action button; `cls` is the button style of the place it sits in. */
export function ctaButton(cls) {
  return `<a class="btn ${cls}" href="${CTA_URL}" data-es="${attr(CTA_LABEL_ES)}" data-fr="${attr(CTA_LABEL_FR)}" data-pt="${attr(CTA_LABEL_PT)}" data-zh="${attr(CTA_LABEL_ZH)}">${CTA_LABEL}</a>`;
}

/** Changes whenever site.css changes, so a browser never pairs new HTML with an old cached stylesheet. */
const CSS_VERSION = createHash('sha256').update(readFileSync(new URL('../site.css', import.meta.url))).digest('hex').slice(0, 10);
/** The ad landing pages' own stylesheet (lp.css, 18 Oct 2026), loaded only by them. */
const LP_CSS_VERSION = createHash('sha256').update(readFileSync(new URL('../lp.css', import.meta.url))).digest('hex').slice(0, 10);
/* Katya, the chat (katya.js at the root; its backend is the WMS Cloud API,
   /api/stockistscout/katya). One tag per page, after SCRIPT, and the file guards itself
   too (window.__katyaLoaded): on bins-usa.com a second copy drew a second, blank launcher.
   The version is a hash of the file, like the stylesheet's. */
const KATYA_VERSION = createHash('sha256').update(readFileSync(new URL('../katya.js', import.meta.url))).digest('hex').slice(0, 10);

export const NAV = [
  ['/', 'Home', 'Inicio', 'Accueil', 'Início', '首页'],
  ['/how-it-works', 'How it works', 'Cómo funciona', 'Comment ça marche', 'Como funciona', '工作原理'],
  ['/features', 'Features', 'Funciones', 'Fonctionnalités', 'Recursos', '功能'],
  ['/agents', 'Meet our agents', 'Conoce a nuestros agentes', 'Nos agents', 'Nossos agentes', '认识我们的智能体'],
  ['/pricing', 'Pricing', 'Precios', 'Tarifs', 'Preços', '价格'],
  ['/hotels', 'For hotels', 'Para hoteles', 'Pour les hôtels', 'Para hotéis', '酒店方案'],
  ['/results', 'Results', 'Resultados', 'Résultats', 'Resultados', '成效'],
  ['/reviews', 'Reviews', 'Reseñas', 'Avis', 'Avaliações', '用户评价'],
  ['/blog', 'Blog', 'Blog', 'Blogue', 'Blog', '博客'],
  ['/faq', 'FAQ', 'Preguntas', 'FAQ', 'Perguntas', '常见问题'],
  ['/about', 'About', 'Quiénes somos', 'À propos', 'Quem somos', '关于我们'],
  ['/contact', 'Contact', 'Contacto', 'Contact', 'Contato', '联系我们'],
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
    doesPt: 'Procura butiques infantis e lojas de bebê cujo sortimento e faixa de preço combinam com a sua linha, e escreve para cada uma explicando por que os seus produtos merecem estar nas prateleiras dela.',
    specZh: '婴童服装店', doesZh: '寻找产品组合和价位与您产品线相符的童装精品店和母婴店，并逐一写信说明您的产品为何值得上架。' },
  { name: 'Elias', spec: 'Gift, home &amp; décor shops', specEs: 'Tiendas de regalos, hogar y decoración',
    does: 'Finds gift shops, home stores and décor boutiques that carry products like yours, and introduces your brand to the person who buys for them.',
    doesEs: 'Encuentra tiendas de regalos, de hogar y de decoración que venden productos como los tuyos, y le presenta tu marca a quien compra para ellas.',
    specFr: 'Boutiques de cadeaux, maison et décoration', doesFr: 'Trouve des boutiques de cadeaux, de maison et de décoration qui vendent des produits comme les vôtres, et présente votre marque à la personne qui fait leurs achats.', specPt: 'Lojas de presentes, casa e decoração',
    doesPt: 'Encontra lojas de presentes, de casa e butiques de decoração que vendem produtos como os seus, e apresenta a sua marca para a pessoa que faz as compras delas.',
    specZh: '礼品、家居和装饰店', doesZh: '寻找销售与您同类产品的礼品店、家居店和装饰精品店，并把您的品牌介绍给负责采购的人。' },
  { name: 'Raquel', spec: 'Fashion &amp; accessories boutiques', specEs: 'Boutiques de moda y accesorios',
    does: 'Searches for fashion and accessories boutiques whose style and prices match yours, and writes to each one personally.',
    doesEs: 'Busca boutiques de moda y accesorios con un estilo y unos precios como los tuyos, y le escribe a cada una de forma personal.',
    specFr: 'Boutiques de mode et d’accessoires', doesFr: 'Cherche des boutiques de mode et d’accessoires au style et aux prix semblables aux vôtres, et écrit à chacune de façon personnelle.', specPt: 'Butiques de moda e acessórios',
    doesPt: 'Procura butiques de moda e acessórios com estilo e preços parecidos com os seus, e escreve para cada uma de forma pessoal.',
    specZh: '时尚与配饰精品店', doesZh: '寻找风格和价位与您相近的时尚与配饰精品店，并为每一家撰写个性化的邮件。' },
  { name: 'Roberto', spec: 'Wholesalers, distributors &amp; warehouses', specEs: 'Mayoristas, distribuidores y almacenes',
    does: 'Finds wholesalers, distributors and warehouses that could carry your line in volume, and opens the conversation on your behalf.',
    doesEs: 'Encuentra mayoristas, distribuidores y almacenes que podrían llevar tu línea por volumen, y abre la conversación en tu nombre.',
    specFr: 'Grossistes, distributeurs et entrepôts', doesFr: 'Trouve des grossistes, des distributeurs et des entrepôts qui pourraient prendre votre gamme en volume, et ouvre la conversation en votre nom.', specPt: 'Atacadistas, distribuidores e armazéns',
    doesPt: 'Encontra atacadistas, distribuidores e armazéns que poderiam levar a sua linha em volume, e abre a conversa em seu nome.',
    specZh: '批发商、分销商和仓储商', doesZh: '寻找能够批量经销您产品线的批发商、分销商和仓储商，并代表您开启洽谈。' },
  { name: 'Rony', spec: 'Sports, outdoor &amp; adventure stores', specEs: 'Tiendas de deportes, aire libre y aventura',
    does: 'Looks for sporting goods, outdoor and adventure stores where your products fit, and tells each one why.',
    doesEs: 'Busca tiendas de deportes, de aire libre y de aventura donde tus productos encajan, y le explica a cada una por qué.',
    specFr: 'Magasins de sport, de plein air et d’aventure', doesFr: 'Cherche des magasins de sport, de plein air et d’aventure où vos produits ont leur place, et explique à chacun pourquoi.', specPt: 'Lojas de esportes, ar livre e aventura',
    doesPt: 'Procura lojas de artigos esportivos, de ar livre e de aventura onde os seus produtos se encaixam, e explica a cada uma por quê.',
    specZh: '运动、户外和探险用品店', doesZh: '寻找适合您产品的体育用品店、户外店和探险用品店，并向每一家说明原因。' },
  { name: 'Gabriel', spec: 'Beauty, personal care &amp; wellness', specEs: 'Belleza, cuidado personal y bienestar',
    does: 'Finds beauty, personal-care and wellness shops that suit your products, and writes each one a note about what you can offer them.',
    doesEs: 'Encuentra tiendas de belleza, cuidado personal y bienestar que van con tus productos, y le escribe a cada una lo que le puedes ofrecer.',
    specFr: 'Beauté, soins personnels et bien-être', doesFr: 'Trouve des boutiques de beauté, de soins personnels et de bien-être qui conviennent à vos produits, et écrit à chacune ce que vous pouvez lui offrir.', specPt: 'Beleza, cuidados pessoais e bem-estar',
    doesPt: 'Encontra lojas de beleza, cuidados pessoais e bem-estar que combinam com os seus produtos, e escreve para cada uma o que você pode oferecer.',
    specZh: '美妆、个人护理和健康', doesZh: '寻找与您产品相匹配的美妆、个人护理和健康类门店，并写信告诉每一家您能为其提供什么。' },
  { name: 'Aaron', spec: 'Pet stores', specEs: 'Tiendas de mascotas',
    does: 'Searches for independent pet stores and pet boutiques that fit your line, and introduces your products to them.',
    doesEs: 'Busca tiendas de mascotas independientes y boutiques para mascotas que encajan con tu línea, y les presenta tus productos.',
    specFr: 'Animaleries', doesFr: 'Cherche des animaleries indépendantes et des boutiques pour animaux qui conviennent à votre gamme, et leur présente vos produits.', specPt: 'Pet shops',
    doesPt: 'Procura pet shops independentes e butiques para animais que combinam com a sua linha, e apresenta os seus produtos a elas.',
    specZh: '宠物用品店', doesZh: '寻找与您产品线相符的独立宠物店和宠物精品店，并向他们介绍您的产品。' },
  { name: 'Joel', spec: 'Toys, games &amp; hobby shops', specEs: 'Jugueterías, juegos y hobbies',
    does: 'Finds toy stores, game shops and hobby stores that match your range, and writes to each one about your products.',
    doesEs: 'Encuentra jugueterías, tiendas de juegos y de hobbies que encajan con tu surtido, y le escribe a cada una sobre tus productos.',
    specFr: 'Magasins de jouets, de jeux et de loisirs', doesFr: 'Trouve des magasins de jouets, de jeux et de loisirs qui conviennent à votre assortiment, et écrit à chacun au sujet de vos produits.', specPt: 'Lojas de brinquedos, jogos e hobbies',
    doesPt: 'Encontra lojas de brinquedos, de jogos e de hobbies que combinam com o seu sortimento, e escreve para cada uma sobre os seus produtos.',
    specZh: '玩具、游戏和爱好用品店', doesZh: '寻找与您产品组合相符的玩具店、游戏店和爱好用品店，并逐一写信介绍您的产品。' },
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

function head(meta) {
  const { path, title, description } = meta;
  const url = ORIGIN + (path === '/' ? '/' : path);
  const titled = (t) => path === '/' ? t : `${t} | StockistScout`;
  const full = titled(title);
  // The title in each language (titleEs, titleFr, titlePt, titleZh, ...) rides in data-<lang> on <title>.
  const titles = LANGUAGES.slice(1).map((l) => {
    const t = meta['title' + l.code[0].toUpperCase() + l.code.slice(1)];
    return t ? ` data-${l.code}="${attr(titled(t))}"` : '';
  }).join('');
  return `<!doctype html>
<html lang="${meta.html || 'en'}"${meta.lp ? ' data-lp' : ''}>
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
<title${titles}>${full}</title>
<meta name="description" content="${esc(description)}">
${INDEXABLE && !meta.noindex ? '' : '<meta name="robots" content="noindex">\n'}<link rel="canonical" href="${url}">
<meta property="og:type" content="${meta.article ? 'article' : 'website'}">${meta.article ? `
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: title, description, datePublished: meta.article.published, dateModified: meta.updated || meta.article.published, author: { '@type': 'Organization', name: 'StockistScout', url: ORIGIN }, publisher: { '@type': 'Organization', name: 'StockistScout', logo: { '@type': 'ImageObject', url: ORIGIN + '/img/logo-520.png' } }, image: ORIGIN + (meta.article.image || '/img/og.png'), mainEntityOfPage: url }).replace(/</g, '\\u003c')}</script>` : ''}
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
<link rel="stylesheet" href="/site.css?v=${CSS_VERSION}">${meta.lp ? `
<link rel="stylesheet" href="/lp.css?v=${LP_CSS_VERSION}">` : ''}
</head>`;
}

/** The horizontal logo, with the light-text version when the system is in dark mode. */
function logo(w, h, extra = '') {
  return `<picture><source srcset="/img/logo-dark-520.png" media="(prefers-color-scheme: dark)"><img src="/img/logo-520.png" alt="StockistScout" width="${w}" height="${h}"${extra}></picture>`;
}

/* The language menu (16 Oct 2026): a button that opens a list of real links, one per language, each to this page in
   that language and named in its own language. Without JavaScript the list is simply always shown. build.mjs marks the
   page's own language (aria-current) and leaves these links alone when it points the other links at the language. */
function langMenu(path) {
  // The button names the page's language in that language: every language carries it here as data-<code>, dictionary
  // languages too (their own attribute wins over the dictionary), so these two never go to the translators.
  const current = LANGUAGES.slice(1).map((l) => ` data-${attrKey(l.code)}="${attr(l.name)}"`).join('');
  const label = ' aria-label="Language: English"' + LANGUAGES.slice(1).map((l) => ` data-${attrKey(l.code)}-label="${attr(l.word)}: ${attr(l.name)}"`).join('');
  const items = SITE_LANGUAGES.map((l) =>
    `            <li><a href="${pathIn(path, l.code)}" hreflang="${l.hreflang}" lang="${l.html}" data-lang="${l.code}">${l.name}</a></li>`).join('\n');
  return `<div class="lang" id="langToggle">
          <button type="button" class="lang-btn" aria-expanded="false" aria-controls="langMenu"${label}>${GLOBE_ICON}<span${current}>English</span><span class="lang-caret" aria-hidden="true"></span></button>
          <ul class="lang-menu" id="langMenu">
${items}
          </ul>
        </div>`;
}

/* The header (17 Oct 2026): four main links, the rest under "More", so the full row fits at 1280px in every language
   (Spanish and German were falling back to the hamburger on a PC). The phone moved to a slim bar above the header on
   desktop; under 1280px the hamburger menu lists every link flat, the phone included. Home is the logo on desktop. */
const NAV_MAIN = ['/how-it-works', '/agents', '/pricing', '/hotels'];
const NAV_MORE = ['/features', '/results', '/reviews', '/blog', '/faq', '/about', '/contact'];

function navLink(path, href, cls = '') {
  const [, en, es, fr, pt, zh] = NAV.find((n) => n[0] === href);
  const on = path === href ? ' aria-current="page"' : '';
  return `<a${cls ? ` class="${cls}"` : ''} href="${href}"${on} data-es="${attr(es)}" data-fr="${attr(fr)}" data-pt="${attr(pt)}" data-zh="${attr(zh)}">${en}</a>`;
}

function header(path) {
  const main = ['      ' + navLink(path, '/', 'nav-home'), ...NAV_MAIN.map((h) => '      ' + navLink(path, h))].join('\n');
  const more = NAV_MORE.map((h) => '            ' + navLink(path, h)).join('\n');
  const moreOn = NAV_MORE.includes(path) || path.startsWith('/blog/') ? ' has-current' : '';
  const callLabel = `aria-label="Call StockistScout at ${CONTACT_PHONE_DIGITS}" data-es-label="Llama a StockistScout al ${CONTACT_PHONE_DIGITS}" data-pt-label="Ligue para o StockistScout no ${CONTACT_PHONE_DIGITS}" data-zh-label="致电 StockistScout：${CONTACT_PHONE_DIGITS}"`;
  return `<a class="skip" href="#main" data-es="Ir al contenido" data-fr="Aller au contenu" data-pt="Pular para o conteúdo" data-zh="跳到正文">Skip to content</a>
<div class="topbar">
  <div class="topbar-row">
    <a class="topbar-phone" href="${CONTACT_TEL}" ${callLabel}>${PHONE_ICON}<span class="tel-num">${US_FLAG}${CONTACT_PHONE}</span></a>
    <span class="topbar-note" data-es="24/7 · 14 idiomas" data-fr="24 h/24, 7 j/7 · 14 langues" data-pt="24 horas, 7 dias · 14 idiomas" data-zh="全天候 · 14 种语言">24/7 · 14 languages</span>
    <a class="topbar-mail" href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
  </div>
</div>
<header class="site-head">
  <div class="head-row">
    <a class="brand" href="/" aria-label="StockistScout, home" data-es-label="StockistScout, inicio" data-fr-label="StockistScout, accueil" data-pt-label="StockistScout, início" data-zh-label="StockistScout，首页">
      ${logo(196, 52, ' fetchpriority="high"')}
    </a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu">
      <span class="bars" aria-hidden="true"></span><span class="sr" data-es="Menú" data-fr="Menu" data-pt="Menu" data-zh="菜单">Menu</span>
    </button>
    <nav id="site-menu" class="site-nav" aria-label="Main">
      <div class="nav-links">
${main}
        <div class="nav-more${moreOn}" id="navMore">
          <button type="button" class="nav-more-btn" aria-expanded="false" aria-controls="navMoreMenu"><span data-es="Más" data-fr="Plus" data-pt="Mais" data-zh="更多">More</span><span class="lang-caret" aria-hidden="true"></span></button>
          <div class="nav-more-menu" id="navMoreMenu">
${more}
          </div>
        </div>
      </div>
      <div class="nav-end">
        <a class="nav-phone" href="${CONTACT_TEL}" ${callLabel}>${PHONE_ICON}<span class="tel-num">${US_FLAG}${CONTACT_PHONE}</span></a>
        <a class="btn btn-ghost nav-login" href="${LOGIN_URL}" data-es="Iniciar sesión" data-fr="Se connecter" data-pt="Entrar" data-zh="登录">Log in</a>
        <a class="btn btn-primary nav-cta" href="${CTA_URL}" data-es="Empieza gratis" data-fr="Commencer gratuitement" data-pt="Comece grátis" data-zh="免费开始">Start free</a>
        ${langMenu(path)}
      </div>
    </nav>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-foot">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <a class="foot-logo" href="/" aria-label="StockistScout, home" data-es-label="StockistScout, inicio" data-fr-label="StockistScout, accueil" data-pt-label="StockistScout, início" data-zh-label="StockistScout，首页"><img src="/img/logo-dark-520.png" alt="StockistScout" width="196" height="52" loading="lazy"></a>
      <p data-es="Agentes de IA que encuentran tiendas que encajan con tus productos y les escriben en nombre de tu negocio. Solo B2B: tiendas, nunca consumidores." data-fr="Des agents d'IA qui trouvent des boutiques qui correspondent à vos produits et leur écrivent au nom de votre entreprise. B2B seulement : des boutiques, jamais des consommateurs." data-pt="Agentes de IA que encontram lojas que combinam com seus produtos e escrevem para elas em nome da sua empresa. Somente B2B: lojas, nunca consumidores." data-zh="AI 智能体为您找到与产品相匹配的零售店，并以您企业的名义给它们写信。仅限 B2B：只联系零售店，从不联系消费者。">AI agents that find stores that fit your products and write to them on behalf of your business. B2B only: stores, never consumers.</p>
      <p class="disclaimer" data-es="Prueba gratis con 50 correos, sin tarjeta. Ningún resultado de ventas está garantizado." data-fr="Essai gratuit de 50 courriels, sans carte. Aucun résultat de vente n'est garanti." data-pt="Teste grátis com 50 e-mails, sem cartão. Nenhum resultado de vendas é garantido." data-zh="免费试用 50 封邮件，无需信用卡。不保证任何销售结果。">Free trial with 50 emails, no card needed. No sales results are guaranteed.</p>
      <p class="foot-contact">
        <a href="${CONTACT_TEL}" aria-label="Call ${CONTACT_PHONE_DIGITS}" data-es-label="Llamar al ${CONTACT_PHONE_DIGITS}" data-pt-label="Ligar para ${CONTACT_PHONE_DIGITS}" data-zh-label="拨打 ${CONTACT_PHONE_DIGITS}"><span class="tel-num">${US_FLAG}${CONTACT_PHONE} · ${CONTACT_PHONE_DIGITS}</span></a>
        <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
      </p>
    </div>
    <nav aria-label="Product" data-es-label="Producto" data-fr-label="Produit" data-pt-label="Produto" data-zh-label="产品">
      <h2 data-es="Producto" data-fr="Produit" data-pt="Produto" data-zh="产品">Product</h2>
      <a href="/how-it-works" data-es="Cómo funciona" data-fr="Comment ça fonctionne" data-pt="Como funciona" data-zh="工作原理">How it works</a>
      <a href="/features" data-es="Funciones" data-fr="Fonctionnalités" data-pt="Recursos" data-zh="功能">Features</a>
      <a href="/pricing" data-es="Precios" data-fr="Tarifs" data-pt="Preços" data-zh="价格">Pricing</a>
      <a href="/hotels" data-es="Para cadenas de hoteles" data-fr="Pour les chaînes hôtelières" data-pt="Para redes hoteleiras" data-zh="酒店集团方案">For hotel chains</a>
      <a href="/results" data-es="Resultados" data-fr="Résultats" data-pt="Resultados" data-zh="成效">Results</a>
      <a href="/faq" data-es="Preguntas frecuentes" data-fr="Foire aux questions" data-pt="Perguntas frequentes" data-zh="常见问题">FAQ</a>
      <a href="/blog" data-es="Blog" data-fr="Blogue" data-pt="Blog" data-zh="博客">Blog</a>
    </nav>
    <nav aria-label="Company" data-es-label="Empresa" data-fr-label="Entreprise" data-pt-label="Empresa" data-zh-label="公司">
      <h2 data-es="Empresa" data-fr="Entreprise" data-pt="Empresa" data-zh="公司">Company</h2>
      <a href="/about" data-es="Quiénes somos" data-fr="À propos" data-pt="Quem somos" data-zh="关于我们">About</a>
      <a href="/contact" data-es="Contacto" data-fr="Contact" data-pt="Contato" data-zh="联系我们">Contact</a>
      <a href="/privacy" data-es="Privacidad" data-fr="Confidentialité" data-pt="Privacidade" data-zh="隐私">Privacy</a>
      <a href="/terms" data-es="Términos" data-fr="Conditions" data-pt="Termos" data-zh="条款">Terms</a>
      <a href="/corporate-agreement" data-es="Contrato corporativo" data-fr="Entente d'entreprise" data-pt="Contrato corporativo" data-zh="企业订阅协议">Corporate agreement</a>
      <a href="/partners" data-es="Programa de socios" data-fr="Programme partenaires" data-pt="Programa de parceiros" data-zh="合作伙伴计划">Partner program</a>
    </nav>
    <nav aria-label="Our other products" data-es-label="Nuestros otros productos" data-fr-label="Nos autres produits" data-pt-label="Nossos outros produtos" data-zh-label="我们的其他产品">
      <h2 data-es="Del mismo equipo" data-fr="De la même équipe" data-pt="Da mesma equipe" data-zh="同一团队的其他产品">From the same team</h2>
      <a href="https://www.mykids-usa.com" rel="noopener">MyKids-USA</a>
      <a href="https://drop-usa.com" rel="noopener">Drop-USA</a>
      <a href="https://bins-usa.com" rel="noopener">Bins-USA</a>
      <a href="https://trademarkscanner.app" rel="noopener">ScanRights</a>
    </nav>
  </div>
  <div class="wrap foot-legal">
    <span data-es="© 2026 ${COMPANY}. Todos los derechos reservados." data-pt="© 2026 ${COMPANY}. Todos os direitos reservados." data-zh="© 2026 ${COMPANY}。保留所有权利。">© 2026 ${COMPANY}. All rights reserved.</span>
    <span data-es="Florida, Estados Unidos." data-fr="Floride, États-Unis." data-pt="Flórida, Estados Unidos." data-zh="美国佛罗里达州。">Florida, United States.</span>
  </div>
</footer>`;
}

/* The waitlist form's messages (shown by SCRIPT). A dictionary language finds the English in window.SS_I18N. */
export const MSG = {
    ok: { en: '<strong>You are on the list. Thank you.</strong> We will write to you when StockistScout opens. We do not send a confirmation email yet, so this message is your confirmation.',
          es: '<strong>Ya estás en la lista. Gracias.</strong> Te escribiremos cuando StockistScout abra. Todavía no enviamos un correo de confirmación, así que este mensaje es tu confirmación.',
          fr: '<strong>Vous êtes sur la liste. Merci.</strong> Nous vous écrirons à l’ouverture de StockistScout. Nous n’envoyons pas encore de courriel de confirmation : ce message est votre confirmation.',
          pt: '<strong>Você está na lista. Obrigado.</strong> Vamos escrever para você quando o StockistScout abrir. Ainda não enviamos e-mail de confirmação, então esta mensagem é a sua confirmação.',
          zh: '<strong>您已加入名单，谢谢。</strong>StockistScout 开放时我们会写信通知您。我们暂不发送确认邮件，因此本条消息即为您的确认。' },
    sending: { en: 'Sending…', es: 'Enviando…', fr: 'Envoi…', pt: 'Enviando…', zh: '正在发送…' },
    fix: { en: 'Please check the highlighted fields.', es: 'Revisa los campos marcados.', fr: 'Veuillez vérifier les champs indiqués.', pt: 'Confira os campos destacados.', zh: '请检查标出的字段。' },
    many: { en: 'Too many tries from this connection. Please wait an hour, or write to <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            es: 'Demasiados intentos desde esta conexión. Espera una hora o escríbenos a <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            fr: 'Trop de tentatives depuis cette connexion. Attendez une heure ou écrivez-nous à <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            pt: 'Tentativas demais a partir desta conexão. Aguarde uma hora ou escreva para <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            zh: '此网络连接尝试次数过多。请等待一小时，或写信至 <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>。' },
    fail: { en: 'We could not send it. Check your connection and try again, or write to <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            es: 'No pudimos enviarlo. Revisa tu conexión y vuelve a intentarlo, o escríbenos a <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            fr: 'Nous n’avons pas pu l’envoyer. Vérifiez votre connexion et réessayez, ou écrivez-nous à <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            pt: 'Não conseguimos enviar. Verifique sua conexão e tente de novo, ou escreva para <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>.',
            zh: '未能发送。请检查网络连接后重试，或写信至 <a href="mailto:sales@stockistscout.com">sales@stockistscout.com</a>。' }
  };

/* Included exactly once per page (the bins-usa.com lesson: a script included twice
   ran twice). The guard makes a second copy harmless anyway. No regex literals in here:
   this is a template literal and a backslash would be eaten before the browser sees it. */
const SCRIPT = `<script>
(function () {
  if (window.__ssSite) return; window.__ssSite = true;
  /* A safety net only: since 17 Oct 2026 the row (four links, More, two buttons, the language menu) fits at 1280px in
     every language, measured. Should a longer text ever make it overflow, html.nav-compact shows the compact menu
     (site.css) instead of running off the page. Measured with the class off, again once the fonts load and on resize. */
  (function () {
    var root = document.documentElement, row = document.querySelector('.head-row');
    if (!row) return;
    function fit() {
      root.classList.remove('nav-compact');
      if (window.innerWidth >= 1280 && row.scrollWidth > row.clientWidth + 1) root.classList.add('nav-compact');
    }
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener('resize', fit);
  })();
  var KEY = 'ss_lang';
  /* One URL per language since 15 Oct 2026: /es/ and /fr/ carry their text in the HTML, so Google shows them. The
     toggle goes to the same page in the other language, and the choice is remembered. */
  var LANGS = ${JSON.stringify(SITE_LANGUAGES.slice(1).map((l) => l.code))};
  // Each language's URL folder, in the order of LANGS (zh-Hant lives at /zh-hant/).
  var FOLDERS = ${JSON.stringify(SITE_LANGUAGES.slice(1).map((l) => folderOf(l.code)))};
  // /zh/ pages say lang="zh-CN", /pt/ "pt-BR": the language code is the first two letters, except Traditional Chinese
  // (lang="zh-Hant"), whose code is the whole tag.
  function pageLang() {
    var h = document.documentElement.lang || '';
    if (/^zh-hant/i.test(h)) return LANGS.indexOf('zh-Hant') >= 0 ? 'zh-Hant' : 'en';
    var l = h.slice(0, 2); return LANGS.indexOf(l) >= 0 ? l : 'en';
  }
  function urlFor(lang) {
    var p = location.pathname;
    var first = p.split('/')[1];
    if (FOLDERS.indexOf(first) >= 0) p = p.slice(first.length + 1) || '/';
    var to = lang === 'en' ? p : '/' + FOLDERS[LANGS.indexOf(lang)] + (p === '/' ? '/' : p);
    return to + location.search + location.hash;
  }
  /* Ads (18 Oct 2026): the utm_* parameters and Google's click ids (gclid, gbraid, wbraid) of the URL a visit landed on
     are kept on this device for 30 days, and every click to the app carries them, so the app can tell which campaign a
     sign-up came from even when the visitor read two more pages first. The landing URL's own parameters win. */
  var ADS_KEY = 'ss_ads', ADS_TTL = 30 * 86400000;
  function isAdsParam(k) { return k.indexOf('utm_') === 0 || k === 'gclid' || k === 'gbraid' || k === 'wbraid'; }
  function adsHere() {
    var got = {}, any = false;
    try { new URLSearchParams(location.search).forEach(function (v, k) { if (isAdsParam(k) && v) { got[k.slice(0, 40)] = v.slice(0, 200); any = true; } }); } catch (err) {}
    return any ? got : null;
  }
  (function () {
    var here = adsHere();
    if (here) try { localStorage.setItem(ADS_KEY, JSON.stringify({ p: here, at: Date.now() })); } catch (err) {}
  })();
  function adsParams() {
    var here = adsHere();
    if (here) return here;
    try {
      var v = JSON.parse(localStorage.getItem(ADS_KEY) || 'null');
      if (v && v.p && Date.now() - v.at < ADS_TTL) return v.p;
    } catch (err) {}
    return {};
  }
  /* Partners (affiliates, 18 Oct 2026): a partner's ?ref= code on the URL a visit landed on is kept on this device for 60
     days and the first code wins (a later code never replaces it). Every link to the app carries it, and the visit counts as
     the partner's click, once per code and visit session, sent to the app with navigator.sendBeacon once the page has loaded
     (the tracker's session id is there by then, so the app's own arrival of the same visit is not counted twice). */
  var REF_KEY = 'ss_ref', REF_TTL = 60 * 86400000, APP = 'https://app.stockistscout.com';
  function refOk(v) { return !!v && v.length >= 3 && v.length <= 32 && !/[^A-Za-z0-9_-]/.test(v); }
  function keptRef() {
    try { var v = JSON.parse(localStorage.getItem(REF_KEY) || 'null'); if (v && refOk(v.r) && Date.now() - v.at < REF_TTL) return v.r; } catch (err) {}
    return null;
  }
  (function () {
    var here = null;
    try { here = new URLSearchParams(location.search).get('ref'); } catch (err) {}
    if (!refOk(here)) return;
    if (!keptRef()) try { localStorage.setItem(REF_KEY, JSON.stringify({ r: here, at: Date.now() })); } catch (err) {}
    var done = null;
    try { done = sessionStorage.getItem('ss_ref_click'); sessionStorage.setItem('ss_ref_click', here); } catch (err) {}
    if (done === here) return;
    function send() {
      var sid = null;
      try { sid = sessionStorage.getItem('wms_sid'); } catch (err) {}
      var body = JSON.stringify({ ref: here, sid: sid && sid !== 'nostorage' ? sid : undefined, landing: location.pathname.slice(0, 200) });
      try { if (navigator.sendBeacon && navigator.sendBeacon(APP + '/api/affiliates/click', new Blob([body], { type: 'text/plain' }))) return; } catch (err) {}
      try { fetch(APP + '/api/affiliates/click', { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain' }, body: body }); } catch (err) {}
    }
    if (document.readyState === 'complete') setTimeout(send, 1500); else window.addEventListener('load', function () { setTimeout(send, 1500); });
  })();
  /* The kept code on every link to the app, already in the page (what a visitor sees on hover), and again at click time below. */
  function withRef(a) {
    var r = keptRef();
    if (!r) return;
    try { var u = new URL(a.href); if (!u.searchParams.has('ref')) { u.searchParams.set('ref', r); a.href = u.toString(); } } catch (err) {}
  }
  function refLinks() { if (keptRef()) document.querySelectorAll('a[href^="' + APP + '/"]').forEach(withRef); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refLinks); else refLinks();
  /* The funnel (15 Oct 2026): a click to the app carries this visit's session id (the tracker's), the page's language
     and where the visit landed, so a sign-up can be traced back to its visit. Added at click time only. A click on a
     sign-up link is also a GA4 event, sign_up_click (with data-cta: where on the page), to mark as a key event. */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="https://app.stockistscout.com/"]') : null;
    if (!a) return;
    var u;
    try { u = new URL(a.href); } catch (err) { return; }
    var ads = adsParams();
    Object.keys(ads).forEach(function (k) { if (!u.searchParams.has(k)) u.searchParams.set(k, ads[k]); });
    var ref = keptRef();
    if (ref && !u.searchParams.has('ref')) u.searchParams.set('ref', ref);
    var sid = null;
    try { sid = sessionStorage.getItem('wms_sid'); } catch (err) {}
    if (sid && sid !== 'nostorage') {
      u.searchParams.set('ss_sid', sid);
      u.searchParams.set('ss_lang', pageLang());
      u.searchParams.set('ss_path', location.pathname);
    }
    a.href = u.toString();
    if (u.pathname === '/signup' && typeof window.gtag === 'function') {
      try { window.gtag('event', 'sign_up_click', { cta: a.getAttribute('data-cta') || 'link', page_path: location.pathname, lang: pageLang() }); } catch (err) {}
    }
  }, true);
  function go(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    if (lang !== pageLang()) location.href = urlFor(lang);
  }
  /* Waitlist form: posts JSON to the address in data-waitlist and confirms on screen. */
  var LOADED = Date.now();
  var MSG = ${JSON.stringify(MSG)};
  function curLang() { return pageLang(); }
  function say(el, m) {
    el.dataset.en = m.en; el.dataset.es = m.es; el.dataset.fr = m.fr || m.en; el.dataset.pt = m.pt || m.en; el.dataset.zh = m.zh || m.en;
    el.innerHTML = m[curLang()] || (window.SS_I18N && window.SS_I18N[m.en]) || m.en;
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
      var label = { en: btn.dataset.en || btn.innerHTML, es: btn.dataset.es, fr: btn.dataset.fr, pt: btn.dataset.pt, zh: btn.dataset.zh };
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
  var tag = (navigator.language || 'en').toLowerCase(), nav = tag.slice(0, 2);
  if (nav === 'iw') nav = 'he'; // older browsers still say iw-IL for Hebrew
  // Chinese by its script, else its region (as the app): zh-TW, zh-HK, zh-MO and zh-Hant* read Traditional; zh-CN, zh-SG,
  // zh-Hans* and plain zh Simplified.
  if (nav === 'zh') {
    var sub = tag.split(/[-_]/).slice(1);
    if (sub.indexOf('hant') >= 0 || (sub.indexOf('hans') < 0 && (sub.indexOf('tw') >= 0 || sub.indexOf('hk') >= 0 || sub.indexOf('mo') >= 0))) nav = 'zh-Hant';
  }
  /* On an English page, a visitor who chose another language before, or whose browser speaks one the site is built in on
     a first visit (es-*, fr-*, pt-*, zh-* (Traditional for zh-TW, zh-HK, zh-MO, zh-Hant*), and once their files exist ja-*, ko-*, he-* or iw-*, ar-*, it-*, de-*, nl-*, hi-*), goes to
     that page in their language. A saved language the site no longer has stays on English. A page reached in another language remembers it. */
  if (pageLang() === 'en' && !document.documentElement.hasAttribute('data-lp')) {
    var want = saved || (LANGS.indexOf(nav) >= 0 ? nav : 'en');
    if (LANGS.indexOf(want) >= 0) { location.replace(urlFor(want)); return; }
  } else {
    try { localStorage.setItem(KEY, pageLang()); } catch (e) {}
  }
  document.addEventListener('DOMContentLoaded', function () {
    /* The language menu: the button opens and closes the list; Escape or a click elsewhere closes it. Choosing a
       language remembers it and goes to the same page in that language (with the query and the anchor). */
    var lt = document.getElementById('langToggle');
    if (lt) {
      var lb = lt.querySelector('.lang-btn'), lm = lt.querySelector('.lang-menu');
      lt.classList.add('js'); lm.hidden = true;
      var setOpen = function (open) { lm.hidden = !open; lb.setAttribute('aria-expanded', open ? 'true' : 'false'); };
      lb.addEventListener('click', function () {
        setOpen(lm.hidden);
        if (!lm.hidden) { var cur = lm.querySelector('[aria-current]') || lm.querySelector('a'); if (cur) cur.focus(); }
      });
      lt.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !lm.hidden) { setOpen(false); lb.focus(); }
        if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !lm.hidden) {
          var links = Array.prototype.slice.call(lm.querySelectorAll('a')), i = links.indexOf(document.activeElement);
          if (i >= 0) { e.preventDefault(); links[(i + (e.key === 'ArrowDown' ? 1 : links.length - 1)) % links.length].focus(); }
        }
      });
      document.addEventListener('click', function (e) { if (!lm.hidden && !lt.contains(e.target)) setOpen(false); });
      lm.querySelectorAll('a[data-lang]').forEach(function (a) {
        a.addEventListener('click', function (e) { e.preventDefault(); setOpen(false); go(a.dataset.lang); });
      });
    }
    /* "More" (desktop): a disclosure button over a list of links. Enter or Space opens it, Tab walks its links,
       the arrows move between them, Escape closes it and returns to the button; a click elsewhere or focus leaving it
       closes it. In the hamburger menu the same links are listed flat (site.css) and the button is hidden. */
    var nm = document.getElementById('navMore');
    if (nm) {
      var mb = nm.querySelector('.nav-more-btn'), mm = nm.querySelector('.nav-more-menu');
      nm.classList.add('js');
      var setMore = function (open) { nm.classList.toggle('open', open); mb.setAttribute('aria-expanded', open ? 'true' : 'false'); };
      mb.addEventListener('click', function () { setMore(!nm.classList.contains('open')); });
      nm.addEventListener('keydown', function (e) {
        var open = nm.classList.contains('open');
        if (e.key === 'Escape' && open) { e.stopPropagation(); setMore(false); mb.focus(); return; }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          var links = Array.prototype.slice.call(mm.querySelectorAll('a')), i = links.indexOf(document.activeElement);
          if (document.activeElement === mb) { e.preventDefault(); setMore(true); links[e.key === 'ArrowDown' ? 0 : links.length - 1].focus(); }
          else if (i >= 0) { e.preventDefault(); links[(i + (e.key === 'ArrowDown' ? 1 : links.length - 1)) % links.length].focus(); }
        }
      });
      nm.addEventListener('focusout', function (e) { if (e.relatedTarget && !nm.contains(e.relatedTarget)) setMore(false); });
      document.addEventListener('click', function (e) { if (nm.classList.contains('open') && !nm.contains(e.target)) setMore(false); });
    }
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
/* Launch offer (18 Oct 2026): the counter comes from the app (real paid and held seats, never a made-up number). While
   the offer is open the banner and the Plus card show n/10 taken; once it is closed they disappear. If the app cannot be
   reached the text stays as written, without a number. The Monthly / Annual toggle of the pricing page switches the
   prices shown and sends the offer link with interval=year. */
(function () {
  function ready(f) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', f); else f(); }
  ready(function () {
    var plans = document.querySelector('.plans');
    var section = plans ? plans.parentNode : null;
    document.querySelectorAll('.billing-toggle button').forEach(function (b) {
      b.addEventListener('click', function () {
        var year = b.getAttribute('data-interval') === 'year';
        document.querySelectorAll('.billing-toggle button').forEach(function (o) { var on = o === b; o.classList.toggle('on', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        if (section) section.classList.toggle('annual', year);
        document.querySelectorAll('a[data-offer-link]').forEach(function (a) {
          try { var u = new URL(a.href); if (year) u.searchParams.set('interval', 'year'); else u.searchParams.delete('interval'); a.href = u.toString(); } catch (e) {}
        });
      });
    });
    var marks = document.querySelectorAll('[data-offer]');
    if (!marks.length || !window.fetch) return;
    fetch('https://app.stockistscout.com/api/public/launch-offer', { mode: 'cors', credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (o) {
        if (!o || typeof o.taken !== 'number') return;
        if (!o.open) {
          marks.forEach(function (el) { el.style.display = 'none'; });
          document.querySelectorAll('.plan.has-offer').forEach(function (el) { el.classList.remove('has-offer'); });
          return;
        }
        document.querySelectorAll('.offer-count').forEach(function (c) {
          var n = c.querySelector('.offer-n'); var s = c.querySelector('.offer-seats');
          if (n) n.textContent = String(o.taken);
          if (s) s.textContent = String(o.seats);
          c.hidden = false;
        });
      })
      .catch(function () {});
  });
})();
</script>`;

/* The ad landing pages (site/lp.mjs, 18 Oct 2026): a header with only the logo and the call to action, and a footer
   with the legal links, so nothing pulls the visitor away from the one action. No language menu: each page is one
   language, and the site script never sends it to another (html[data-lp]). */
function lpHeader(lp) {
  return `<header class="site-head lp-head">
  <div class="head-row">
    <a class="brand" href="${lp.home}" aria-label="${attr(lp.homeLabel)}">${logo(196, 52, ' fetchpriority="high"')}</a>
    ${lp.cta}
  </div>
</header>`;
}
function lpFooter(lp) {
  return `<footer class="site-foot lp-foot">
  <div class="wrap foot-legal">
    <span>© 2026 ${COMPANY} · ${lp.place}</span>
    <span class="lp-foot-links"><a href="${lp.privacy[0]}">${lp.privacy[1]}</a><a href="${lp.terms[0]}">${lp.terms[1]}</a><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a><a href="${CONTACT_TEL}"><span class="tel-num">${US_FLAG}${CONTACT_PHONE_DIGITS}</span></a></span>
  </div>
</footer>`;
}

/** A complete page: shell around a body fragment. */
export function page(meta) {
  const { path, body } = meta;
  return `${head(meta)}
<body>
${meta.lp ? lpHeader(meta.lp) : header(path)}
<main id="main" tabindex="-1">
${body.trim()}
</main>
${meta.lp ? lpFooter(meta.lp) : footer()}
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
      <h2 data-es="Deja que un agente encuentre tus próximas tiendas." data-fr="Laissez un agent trouver vos prochains détaillants." data-pt="Deixe um agente encontrar suas próximas lojas revendedoras." data-zh="让智能体为您找到下一批零售商。">Let an agent find your next stockists.</h2>
      <p data-es="Empieza con una prueba gratis de 50 correos, sin tarjeta. Configura tu negocio, tu cliente ideal y tu oferta, y tu agente empieza a buscar." data-fr="Commencez par un essai gratuit de 50 courriels, sans carte. Configurez votre entreprise, votre client idéal et votre offre, et votre agent commence à chercher." data-pt="Comece com um teste grátis de 50 e-mails, sem cartão. Configure sua empresa, seu cliente ideal e sua oferta, e seu agente começa a procurar." data-zh="从 50 封邮件的免费试用开始，无需信用卡。设置好您的企业、理想客户和合作方案，您的智能体就会开始寻找。">Start with a free trial of 50 emails, no card needed. Set up your business, your ideal customer and your offer, and your agent starts looking.</p>
    </div>
    <div class="cta-actions">
      ${ctaButton('btn-light')}
      <a class="btn btn-outline-light" href="/pricing" data-es="Ver precios" data-fr="Voir les prix" data-pt="Ver preços" data-zh="查看价格">See pricing</a>
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
    <legend class="sr" data-es="Únete a la lista de espera" data-fr="Inscrivez-vous à la liste d'attente" data-pt="Entre na lista de espera" data-zh="加入候补名单">Join the waitlist</legend>
    <div class="field-row">
      <div class="field">
        <label for="wl-email" data-es="Correo electrónico" data-fr="Courriel" data-pt="E-mail" data-zh="电子邮箱">Email</label>
        <input type="email" id="wl-email" name="email" autocomplete="email" required maxlength="254" aria-describedby="wl-email-err">
        <p class="field-err" id="wl-email-err" hidden data-es="Escribe un correo válido." data-fr="Entrez un courriel valide." data-pt="Digite um e-mail válido." data-zh="请输入有效的电子邮箱。">Enter a valid email.</p>
      </div>
      <div class="field">
        <label for="wl-company" data-es="Empresa" data-fr="Entreprise" data-pt="Empresa" data-zh="公司">Company</label>
        <input type="text" id="wl-company" name="company" autocomplete="organization" required maxlength="200" aria-describedby="wl-company-err">
        <p class="field-err" id="wl-company-err" hidden data-es="Escribe el nombre de tu empresa." data-fr="Entrez le nom de votre entreprise." data-pt="Digite o nome da sua empresa." data-zh="请输入您的公司名称。">Enter your company name.</p>
      </div>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="wl-site"><span data-es="Sitio web" data-fr="Site Web" data-pt="Site" data-zh="网站">Website</span> <span class="opt" data-es="(opcional)" data-fr="(facultatif)" data-pt="(opcional)" data-zh="（选填）">(optional)</span></label>
        <input type="text" id="wl-site" name="website" inputmode="url" autocomplete="url" maxlength="300" placeholder="yourbrand.com" data-es-placeholder="tumarca.com" data-fr-placeholder="votremarque.com" data-pt-placeholder="suamarca.com.br" data-zh-placeholder="yourbrand.com" aria-describedby="wl-site-err">
        <p class="field-err" id="wl-site-err" hidden data-es="Ese sitio web no parece válido." data-fr="Ce site Web ne semble pas valide." data-pt="Esse site não parece válido." data-zh="该网址似乎不正确。">That website does not look right.</p>
      </div>
      <div class="field">
        <label for="wl-lang" data-es="Idioma para escribirte" data-fr="Langue dans laquelle vous écrire" data-pt="Idioma em que escrevemos para você" data-zh="我们与您沟通所用的语言">Language we write to you in</label>
        <select id="wl-lang" name="language">
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>
    </div>
    <div class="field">
      <label for="wl-sells" data-es="¿Qué vendes y a qué tipo de tiendas?" data-fr="Que vendez-vous, et à quels types de boutiques?" data-pt="O que você vende, e para que tipo de lojas?" data-zh="您销售什么产品？面向哪类零售店？">What do you sell, and to which kinds of stores?</label>
      <textarea id="wl-sells" name="sells" required maxlength="1000" placeholder="Organic baby clothing, to independent kids’ boutiques" data-es-placeholder="Ropa de bebé orgánica, para boutiques infantiles independientes" data-fr-placeholder="Vêtements biologiques pour bébés, pour les boutiques indépendantes pour enfants" data-pt-placeholder="Roupas orgânicas para bebês, para butiques infantis independentes" data-zh-placeholder="有机婴儿服装，面向独立童装精品店" aria-describedby="wl-sells-err"></textarea>
      <p class="field-err" id="wl-sells-err" hidden data-es="Cuéntanos en pocas palabras qué vendes." data-fr="Dites-nous en quelques mots ce que vous vendez." data-pt="Conte em poucas palavras o que você vende." data-zh="请用几句话告诉我们您销售什么。">Tell us in a few words what you sell.</p>
    </div>
    <div class="hp" aria-hidden="true">
      <label for="wl-nickname">Leave this empty</label>
      <input type="text" id="wl-nickname" name="nickname" tabindex="-1" autocomplete="off">
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="submit" data-es="Únete a la lista de espera" data-fr="Inscrivez-vous à la liste d'attente" data-pt="Entre na lista de espera" data-zh="加入候补名单">Join the waitlist</button>
      <p class="form-fine" data-es="Solo lo usamos para avisarte cuando abramos y saber si podemos ayudarte. Ve la <a href=&quot;/privacy&quot;>privacidad</a>." data-fr="Nous l'utilisons uniquement pour vous aviser de notre ouverture et voir si nous pouvons vous aider. Consultez la <a href=&quot;/privacy&quot;>confidentialité</a>." data-pt="Usamos isso apenas para avisar quando abrirmos e para ver se podemos ajudar. Veja a <a href=&quot;/privacy&quot;>privacidade</a>." data-zh="我们仅用这些信息在开放时通知您，并了解能否为您提供帮助。详见<a href=&quot;/privacy&quot;>隐私政策</a>。">We use it only to tell you when we open and to see whether we can help. See <a href="/privacy">privacy</a>.</p>
    </div>
    <p class="form-status" role="status" aria-live="polite" hidden></p>
  </fieldset>
</form>`;
}
