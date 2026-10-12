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
    var who = '<strong>' + esc(t.name) + (t.title ? ', ' + esc(t.title) : '') + '</strong>' + (t.company ? '<span>' + esc(t.company) + '</span>' : '');
    var n = Math.max(1, Math.min(5, t.rating | 0));
    return '<figure class="card review"><div class="review-stars" aria-label="' + n + ' / 5">' + '★'.repeat(n) + '<span>' + '★'.repeat(5 - n) + '</span></div>'
      + '<blockquote>&ldquo;' + esc(t.body) + '&rdquo;</blockquote><figcaption>' + logo + '<span class="review-who">' + who + '</span></figcaption></figure>';
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
