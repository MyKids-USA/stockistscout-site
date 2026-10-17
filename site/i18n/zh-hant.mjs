#!/usr/bin/env node
/**
 * Traditional Chinese (zh-Hant, Taiwan usage; 17 Oct 2026): writes site/i18n/zh-Hant.json from the Simplified texts the
 * pages already carry (data-zh, titleZh / descriptionZh, the zh of katya.js and MSG), keyed by the English exactly as
 * extract.mjs keys every dictionary language. OpenCC 'cn' → 'twp' (Taiwan standard with its phrase table), then the
 * Taiwan words OpenCC leaves alone or gets wrong (the same table as the app's scripts/zh-hant.mjs), then 「」 quotes.
 *
 *   node site/i18n/zh-hant.mjs
 *
 * One-off: the JSON it writes is reviewed by hand and committed. A new English string later needs its Traditional
 * text in zh-Hant.json like any dictionary language (rerunning overwrites hand edits not kept in SITE_FIXES below).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import * as OpenCC from 'opencc-js';
import { englishPages } from '../build.mjs';
import { collectStrings, katyaStrings, ATTRS, WHY_LABEL } from './strings.mjs';
import { writeFlags } from '../flags.mjs';
import { FLAG_ISOS, MSG } from '../shell.mjs';

const cn2tw = OpenCC.Converter({ from: 'cn', to: 'twp' });

/** After OpenCC: [Mainland word as OpenCC leaves it, Taiwan word]. Longest first where one contains another. */
const FIXES = [
  // Accounts, plans, billing.
  ['到賬', '入帳'], ['賬戶', '帳戶'], ['賬號', '帳號'], ['賬單', '帳單'], ['賬', '帳'],
  ['套餐', '方案'], ['銀行卡', '信用卡'],
  // Email.
  ['電子郵箱', '電子郵件'], ['郵箱地址', '電子郵件地址'], ['回覆郵箱', '回覆信箱'], ['此郵箱', '此信箱'], ['該郵箱', '該電子郵件'], ['郵箱', '電子郵件'],
  ['收件箱', '收件匣'], ['垃圾箱', '垃圾郵件匣'], ['發件人', '寄件者'], ['收件人', '收件者'],
  ['退訂', '取消訂閱'], ['跟進郵件', '後續郵件'], ['跟進溝通', '後續聯繫'], ['跟進', '後續聯繫'],
  ['郵件客戶端', '郵件程式'], ['客戶端', '用戶端'], ['郵件服務商', '郵件服務供應商'],
  // Stores, hotels, review.
  ['店鋪', '商店'], ['酒店', '飯店'], ['稽核', '審核'], ['獲批', '獲得核准'], ['批准', '核准'],
  ['提交審核', '送出審核'], ['提交 Katya', '送出 Katya'], ['重新提交', '重新送出'], ['提交評價', '送出評價'], ['即可提交', '即可送出'], ['提交後', '送出後'], ['品類', '類別'], ['示例', '範例'], ['模板', '範本'], ['助手', '助理'],
  // Software words.
  ['域名', '網域'], ['獲取', '取得'], ['列表', '清單'], ['轉化', '轉換'], ['網上搜索', '網路上搜尋'], ['搜索', '搜尋'],
  ['計劃', '計畫'], ['跟蹤', '追蹤'], ['迴圈播放', '重複播放'], ['擴容', '擴充容量'], ['郵政編碼', '郵遞區號'],
  ['單詞', '字'], ['質量', '品質'], ['按需', '視需要'], ['發送', '傳送'], ['撤銷', '取消'], ['回復', '回覆'],
  // OpenCC's slips: 天后 is a goddess, 隻 an animal counter, 併/籤 the wrong characters here.
  ['天后', '天後'], ['最多隻', '最多只'], ['會籤併', '會簽並'], ['會籤', '會簽'],
  ['美國製裁', '美國制裁'], ['滿額髮送', '滿額傳送'], ['封后', '封後'], ['擴充容量磁碟', '擴充磁碟容量'],
  // twp's computer words that are wrong in a UI: 物件 (an object in code) for 對象, 型別 (a type in code) for 類型,
  // 釋出 (a software release) for a published review.
  ['物件', '對象'], ['型別', '類型'], ['釋出', '發布'],
  // More Taiwan UI words.
  ['退出登入', '登出'], ['無需繫結信用卡', '無需提供信用卡'], ['繫結', '綁定'], ['點擊', '點選'], ['重置', '重設'],
  ['Shopify 後臺', 'Shopify 管理後台'], ['後臺', '後台'], ['平臺', '平台'], ['純文本', '純文字'], ['文本', '文字'],
  ['正在生成', '正在產生'], ['生成的', '產生的'], ['審批', '審核'], ['渠道', '管道'], ['首單', '首筆訂單'],
  ['最低起訂量', '最低訂購量'], ['起訂量', '最低訂購量'], ['下單', '訂購'], ['門店', '門市'], ['訪問', '造訪'], ['匹配', '符合'],
  ['策劃方', '企劃單位'], ['策劃', '企劃'], ['行業', '產業'], ['標題欄', '標題列'], ['下劃線', '底線'], ['字號', '字型大小'],
  ['迴圈 GIF', '循環 GIF'], ['可複用', '可重複使用'], ['滾動', '捲動'], ['查詢商店', '尋找商店'], ['查詢新商店', '尋找新商店'],
  ['分銷商', '經銷商'], ['個性化', '個人化'], ['個護', '個人護理'], ['時間段', '時段'], ['拼寫', '拼字'], ['徽標', '標誌'],
  ['自定義', '自訂'], ['當前', '目前'], ['歷史記錄', '歷史紀錄'], ['傳送記錄', '傳送紀錄'], ['占', '佔'],
  ['條訊息', '則訊息'], ['條回覆', '則回覆'], ['條評價', '則評價'], ['條建議', '則建議'], ['最新 3 條', '最新 3 則'],
  ['運動隊', '運動隊伍'], ['AI 智慧體', 'AI 代理'], ['智慧體', '代理'], ['代髮', '代發'], ['網絡', '網路'], ['營銷', '行銷'],
  ['包郵', '免運費'], ['社交媒體', '社群媒體'], ['批次經銷', '大量經銷'], ['大批次', '大量'], ['復購', '回購'], ['合同', '合約'],
  ['開具發票', '開立發票'], ['資不抵債', '無力償債'], ['傳送爬坡', '傳送量逐步提升'], ['爬坡', '提升'], ['重復', '重複'], ['瞭解', '了解'], ['應用內', '應用程式內'],
  ['電話運營商', '電信業者'], ['運營', '營運'], ['逐周', '逐週'], ['按周', '按週'], ['可選', '選填'], ['概覽', '總覽'], ['（可選）', '（選填）'], ['記入日誌', '記錄在日誌中'],
  // Place names as Taiwan writes them; neutral, as the Simplified texts (台灣, not 臺灣).
  ['阿聯酋', '阿拉伯聯合大公國'], ['澳大利亞', '澳洲'], ['佛蘭德', '法蘭德斯'], ['瓜德羅普', '瓜地洛普'], ['蒙臺梭利', '蒙特梭利'],
  ['臺灣', '台灣'],
];

const regexFixes = [
  // "via Stripe/Shopify/email" is 透過; 通過 stays for "passed" (已通過, 審核通過).
  [/通過(?=\s?(?:Stripe|Shopify|Google|StockistScout|郵件|電子郵件|我們|您的|LinkedIn|右下角|自己的))/g, '透過'],
  // An app is 應用程式 (Shopify 應用程式, 郵件應用程式); 應用 as a verb (to apply) stays.
  [/(Shopify\s?|郵件|進入了|StockistScout\s)應用(?!程式)/g, '$1應用程式'],
  // OpenCC leaves 后 (after) in a few places: always 後 in these texts.
  [/后/g, '後'],
  // twp writes 并 (and) as 併 in phrases (併為, 簽署併傳送); 併 stays only in 合併, 吞併, 併購.
  [/(?<![合吞])併(?!購)/g, '並'],
  // Weeks: 週 (3 週內, 本週), OpenCC keeps 周 after a number.
  [/(\d\s?)周/g, '$1週'],
];

/** Simplified → Traditional (Taiwan), with Taiwan's quotes 「」『』. */
function toHant(s) {
  let out = cn2tw(s);
  for (const [a, b] of FIXES) out = out.split(a).join(b);
  for (const [re, b] of regexFixes) out = out.replace(re, b);
  return out.replace(/“/g, '「').replace(/”/g, '」').replace(/‘/g, '『').replace(/’/g, '』');
}

/* The site's own words, after the table above: [Traditional as converted, as it should read]. */
const SITE_FIXES = [
  // The Chinese PDF of the agreement is the Simplified one: say so.
  ['下載中文 PDF', '下載簡體中文 PDF'],
];

await writeFlags(FLAG_ISOS()); // the pages hash their images, so the chip flags must exist first

/** English → Simplified, gathered where the build reads each English string. */
const zh = new Map();
const put = (en, z) => { if (en != null && z != null && !zh.has(en)) zh.set(en, z); };
for (const { html, meta } of englishPages()) {
  if (meta.noindex) continue;
  put(meta.title, meta.titleZh); put(meta.description, meta.descriptionZh);
  const { document } = parseHTML(html);
  for (const el of document.querySelectorAll('[data-pt]')) if (el.tagName !== 'TITLE') put(el.innerHTML, el.getAttribute('data-zh'));
  for (const [a, key] of ATTRS) for (const el of document.querySelectorAll(`[data-pt-${key}]`)) put(el.getAttribute(a), el.getAttribute(`data-zh-${key}`));
}
// katya.js: L(es, en, fr, pt, zh): the English and the Chinese, read the way strings.mjs reads the English.
function katyaCalls(src) {
  const out = []; const re = /(^|[^\w$.])L\(/g; let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length; const args = [];
    for (;;) {
      while (/\s/.test(src[i])) i++;
      const q = src[i]; let j = i + 1;
      while (src[j] !== q) { if (src[j] === '\\') j++; j++; }
      args.push(new Function(`return ${src.slice(i, j + 1)};`)());
      i = j + 1; while (/\s/.test(src[i])) i++;
      if (src[i] === ',') { i++; continue; }
      break;
    }
    out.push(args);
  }
  return out;
}
const calls = katyaCalls(readFileSync(new URL('../../katya.js', import.meta.url), 'utf8'));
if (calls.length !== katyaStrings().length) throw new Error('katya.js: the calls do not match strings.mjs');
for (const a of calls) put(a[1], a[4]);
for (const m of Object.values(MSG)) put(m.en, m.zh);
put(WHY_LABEL, readFileSync(new URL('../../site.css', import.meta.url), 'utf8').match(/:lang\(zh\) \.mock-rows \.why::before \{ content: "([^"]+)"/)?.[1]);

const strings = collectStrings(englishPages());
const out = {}; const missing = [];
for (const en of strings) {
  const z = zh.get(en);
  if (z == null) { missing.push(en); continue; }
  let t = toHant(z);
  for (const [a, b] of SITE_FIXES) t = t.split(a).join(b);
  out[en] = t;
}
if (missing.length) { console.error(`no Simplified text for ${missing.length}:\n` + missing.map((m) => '  ' + m.slice(0, 120)).join('\n')); process.exit(1); }
writeFileSync(new URL('./zh-Hant.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
console.log(`site/i18n/zh-Hant.json: ${Object.keys(out).length} of ${strings.length} strings`);
