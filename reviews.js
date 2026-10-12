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
    // Both languages ride along in data-en / data-es, like the rest of the site, so the language switch swaps them.
    // They hold HTML that the switch puts back with innerHTML: escaped twice, so the reader's text never becomes markup.
    var es = document.documentElement.lang === 'es';
    var bodyEn = '&ldquo;' + esc(t.body_en || t.body) + '&rdquo;', bodyEs = '&ldquo;' + esc(t.body_es || t.body) + '&rdquo;';
    var whoEn = esc(t.name) + ((t.title_en || t.title) ? ', ' + esc(t.title_en || t.title) : '');
    var whoEs = esc(t.name) + ((t.title_es || t.title) ? ', ' + esc(t.title_es || t.title) : '');
    var who = '<strong data-en="' + esc(whoEn) + '" data-es="' + esc(whoEs) + '">' + (es ? whoEs : whoEn) + '</strong>' + (t.company ? '<span>' + esc(t.company) + '</span>' : '');
    return '<figure class="card review"><div class="review-stars" aria-label="' + n + ' / 5">' + '\u2605'.repeat(n) + '<span>' + '\u2605'.repeat(5 - n) + '</span></div>'
      + '<blockquote data-en="' + esc(bodyEn) + '" data-es="' + esc(bodyEs) + '">' + (es ? bodyEs : bodyEn) + '</blockquote><figcaption>' + logo + '<span class="review-who">' + who + '</span></figcaption></figure>';
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
