/* Customer reviews of StockistScout: written in the app, approved by us in the admin, served by
   app.stockistscout.com. Fills every [data-reviews] block (data-limit = how many) and shows it; a block
   without reviews stays hidden, or shows its [data-reviews-empty] message. */
(function () {
  var blocks = document.querySelectorAll('[data-reviews]');
  if (!blocks.length) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function card(t) {
    var logo = t.logo_url && /^https:\/\/app\.stockistscout\.com\//.test(t.logo_url)
      ? '<img src="' + esc(t.logo_url) + '" alt="" width="44" height="44" loading="lazy">'
      : '<span class="review-logo-empty" aria-hidden="true">' + esc((t.company || t.name || '?').slice(0, 1)) + '</span>';
    var n = Math.max(1, Math.min(5, t.rating | 0));
    // The five attribute languages ride along in data-en / data-es / data-fr / data-pt / data-zh, like the rest of the site, so the
    // language switch swaps them. They hold HTML that the switch puts back with innerHTML: escaped twice, so the reader's text never
    // becomes markup. The other pages (ja, ko, he, ar, it, de, nl, hi, zh-Hant) show their own translation (17 Oct 2026),
    // one translator per language in the app; English where one is still missing.
    var html = document.documentElement.lang || '';
    var page = /^zh-hant/i.test(html) ? 'zh-Hant' : html.slice(0, 2);
    var tr = t.translations || {};
    function bodyIn(l) { return '&ldquo;' + esc(l === 'en' ? (t.body_en || t.body) : l === 'es' ? (t.body_es || t.body) : l === 'fr' ? (t.body_fr || t.body_en || t.body) : ((tr[l] && tr[l].body) || t.body_en || t.body)) + '&rdquo;'; }
    function whoIn(l) {
      var title = l === 'en' ? (t.title_en || t.title) : l === 'es' ? (t.title_es || t.title) : l === 'fr' ? (t.title_fr || t.title_en || t.title) : ((tr[l] && tr[l].title) || t.title_en || t.title);
      return esc(t.name) + (title ? ', ' + esc(title) : '');
    }
    var ATTR = ['en', 'es', 'fr', 'pt', 'zh'];
    var shown = ATTR.indexOf(page) >= 0 || tr[page] ? page : 'en';
    var data = function (f) { return ATTR.map(function (l) { return ' data-' + l + '="' + esc(f(l)) + '"'; }).join(''); };
    var who = '<strong' + data(whoIn) + '>' + whoIn(shown) + '</strong>' + (t.company ? '<span>' + esc(t.company) + '</span>' : '');
    return '<figure class="card review"><div class="review-stars" aria-label="' + n + ' / 5">' + '\u2605'.repeat(n) + '<span>' + '\u2605'.repeat(5 - n) + '</span></div>'
      + '<blockquote' + data(bodyIn) + '>' + bodyIn(shown) + '</blockquote><figcaption>' + logo + '<span class="review-who">' + who + '</span></figcaption></figure>';
  }
  fetch('https://app.stockistscout.com/api/public/testimonials').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    var list = (d && d.testimonials) || [];
    blocks.forEach(function (b) {
      var limit = parseInt(b.getAttribute('data-limit') || '0', 10) || list.length;
      var shown = list.slice(0, limit);
      var grid = b.querySelector('[data-reviews-list]');
      var empty = b.querySelector('[data-reviews-empty]');
      if (shown.length) { grid.innerHTML = shown.map(card).join(''); b.hidden = false; if (empty) empty.hidden = true; }
      else if (empty) { empty.hidden = false; b.hidden = false; }
    });
  }).catch(function () {});
})();
