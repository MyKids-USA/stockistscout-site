/* Katya: the pre-sales chat on stockistscout.com.
 *
 * The bins-usa.com widget, no framework, in StockistScout's colours (styles in site.css,
 * .katya-*, built on the site's tokens, so light and dark both follow the system).
 * Typed chat first; the live avatar loads only when the visitor asks for it, because
 * every minute of video spends LiveAvatar credits.
 *
 * Backend: the WMS Cloud API, /api/stockistscout/katya (StockistScout has no backend of
 * its own yet). Her language is the page's (<html lang>, set by the EN/ES toggle), never
 * the browser's. The comments that matter are kept: each marks a LiveAvatar defect that
 * fails silently.
 */
(function () {
  // One widget per page: a second copy of this file would draw a second launcher.
  if (window.__katyaLoaded) return;
  window.__katyaLoaded = true;

  var API = 'https://api.binsusa.com/api/stockistscout/katya';
  var SDK_URL = 'https://unpkg.com/@heygen/liveavatar-web-sdk@0.0.18/dist/index.umd.js';
  var EMAIL = 'sales@stockistscout.com';
  var lang = function () { return (document.documentElement.lang === 'es') ? 'es' : 'en'; };
  var L = function (es, en) { return lang() === 'es' ? es : en; };

  /* Their UMD hands the factory `window.events$1` for Node's EventEmitter and never
     ships one, so evaluation throws partway and leaves a global with the enums but
     none of the classes. Supply it before the script loads. */
  function ensureEventEmitter() {
    if (window.events$1) return;
    function EE() { this._e = {}; }
    EE.prototype.on = function (n, f) { (this._e[n] = this._e[n] || []).push(f); return this; };
    EE.prototype.addListener = EE.prototype.on;
    EE.prototype.once = function (n, f) {
      var self = this;
      var w = function () { self.off(n, w); f.apply(null, arguments); };
      w.listener = f; return this.on(n, w);
    };
    EE.prototype.off = function (n, f) {
      var a = this._e[n];
      if (a) this._e[n] = a.filter(function (x) { return x !== f && x.listener !== f; });
      return this;
    };
    EE.prototype.removeListener = EE.prototype.off;
    EE.prototype.removeAllListeners = function (n) { if (n) delete this._e[n]; else this._e = {}; return this; };
    EE.prototype.emit = function (n) {
      var a = (this._e[n] || []).slice(), r = [].slice.call(arguments, 1);
      a.forEach(function (fn) { try { fn.apply(null, r); } catch (e) {} });
      return a.length > 0;
    };
    EE.prototype.listenerCount = function (n) { return (this._e[n] || []).length; };
    EE.prototype.listeners = function (n) { return (this._e[n] || []).slice(); };
    EE.prototype.setMaxListeners = function () { return this; };
    window.events$1 = { EventEmitter: EE };
  }

  var sdkPromise = null;
  function loadSdk() {
    if (window.LiveAvatarSDK && window.LiveAvatarSDK.LiveAvatarSession) return Promise.resolve(window.LiveAvatarSDK);
    if (sdkPromise) return sdkPromise;
    // A megabyte, fetched only when someone asks to talk. Pinned: this SDK is 0.0.x.
    sdkPromise = new Promise(function (resolve, reject) {
      ensureEventEmitter();
      var s = document.createElement('script');
      s.src = SDK_URL; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = function () {
        (window.LiveAvatarSDK && window.LiveAvatarSDK.LiveAvatarSession) ? resolve(window.LiveAvatarSDK) : reject(new Error('sdk'));
      };
      s.onerror = function () { sdkPromise = null; reject(new Error('sdk')); };
      document.head.appendChild(s);
    });
    return sdkPromise;
  }

  // Chroma key in a shader: a 2D-canvas getImageData key stalls the video pipeline.
  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*0.5+0.5,0.5-p.y*0.5);gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision mediump float;varying vec2 v;',
    'uniform sampler2D vid;uniform sampler2D bg;uniform vec2 sv;uniform vec2 sb;',
    'vec2 cover(vec2 uv,vec2 s){return (uv-0.5)*s+0.5;}',
    'void main(){',
    ' vec4 c=texture2D(vid,cover(v,sv));',
    ' float mx=max(c.r,max(c.g,c.b)), mn=min(c.r,min(c.g,c.b));',
    // Green must dominate and be saturated: her hair is dark and her jacket black.
    ' float isGreen=step(mx-0.001,c.g)*step(0.17,mx-mn)*step(0.27,c.g)',
    '   *step(c.r*1.18,c.g)*step(c.b*1.12,c.g);',
    ' gl_FragColor=mix(c,texture2D(bg,cover(v,sb)),isGreen);',
    '}'
  ].join('\n');

  var el = {}, session = null, starting = false, cancelStart = false, gl = null, raf = 0, msgs = [], busy = false;

  // One id per browser tab for the conversation log behind the daily digest: random,
  // in sessionStorage (moving between pages keeps one conversation), gone with the tab.
  // Storage blocked: the chat works, the turn is not kept.
  var cidBroken = false, cidUsed = false, cidCheck = Promise.resolve();
  function newConversationId() {
    var b = new Uint8Array(16);
    crypto.getRandomValues(b);
    var id = 'c_' + Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    try { sessionStorage.setItem('ss_katya_cid', id); } catch (e) { cidBroken = true; return null; }
    if (sessionStorage.getItem('ss_katya_cid') !== id) { cidBroken = true; return null; }
    return id;
  }
  function conversationId() {
    return cidCheck.then(function () {
      if (cidBroken) return null;
      try {
        var id = sessionStorage.getItem('ss_katya_cid') || newConversationId();
        if (id) cidUsed = true;
        return id;
      } catch (e) { return null; }
    });
  }
  // "Duplicate tab" copies sessionStorage, so two live tabs could share an id. On load a
  // page holding one asks the others; if one answers before this page has sent anything,
  // this tab takes a fresh id.
  (function () {
    try {
      var mine = sessionStorage.getItem('ss_katya_cid');
      var ch = new BroadcastChannel('ss_katya_cid');
      var nonce = Math.random().toString(36).slice(2);
      var settle = null;
      ch.onmessage = function (e) {
        var d = e.data || {}, cur = sessionStorage.getItem('ss_katya_cid');
        if (!cur) return;
        if (d.q === cur) ch.postMessage({ a: cur, n: d.n });
        else if (d.a && d.a === cur && d.n === nonce && !cidUsed) {
          nonce = null; newConversationId(); if (settle) settle();
        }
      };
      if (mine) {
        cidCheck = new Promise(function (res) { settle = res; setTimeout(res, 1000); });
        ch.postMessage({ q: mine, n: nonce });
      }
    } catch (e) {}
  })();
  // Path only; the server drops any query string before storing it.
  function where() { return { page: location.pathname, ref: document.referrer || '' }; }

  function place() {
    if (!el.stage || !el.panel || el.stage.style.display === 'none') return;
    var r = el.panel.getBoundingClientRect();
    // On a phone the panel fills the screen; she shrinks and is clamped into view.
    var narrow = window.innerWidth < 600;
    var w = narrow ? 150 : 230, h = narrow ? 165 : 253;
    el.stage.style.width = w + 'px';
    el.stage.style.height = h + 'px';
    el.stage.style.left = Math.round(r.left + r.width / 2 - w / 2) + 'px';
    el.stage.style.top = Math.max(6, Math.round(r.top - h + (narrow ? 26 : 10))) + 'px';
  }

  function callLabel() {
    el.callBtn.textContent = session ? L('Terminar', 'End call')
      : starting ? L('Cancelar', 'Cancel') : L('Hablar con Katya', 'Talk to Katya');
  }

  function stopLive() {
    cancelAnimationFrame(raf); raf = 0;
    var s = session; session = null;
    if (starting) cancelStart = true;
    if (s) { try { s.stop(); } catch (e) {} }
    if (el.stage) el.stage.style.display = 'none';
    if (el.callBtn) callLabel();
  }

  function initGl() {
    var cvs = el.canvas, g = null;
    try { g = cvs.getContext('webgl', { alpha: false, antialias: false }); } catch (e) { g = null; }
    if (!g) return null;
    var sh = function (t, src) { var x = g.createShader(t); g.shaderSource(x, src); g.compileShader(x); return x; };
    var prog = g.createProgram();
    g.attachShader(prog, sh(g.VERTEX_SHADER, VS));
    g.attachShader(prog, sh(g.FRAGMENT_SHADER, FS));
    g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) return null;
    g.useProgram(prog);
    var buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    var loc = g.getAttribLocation(prog, 'p');
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    var mkTex = function () {
      var t = g.createTexture();
      g.bindTexture(g.TEXTURE_2D, t);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
      return t;
    };
    var ctx = { gl: g, texV: mkTex(), texB: mkTex(), bgReady: false,
                sv: g.getUniformLocation(prog, 'sv'), sb: g.getUniformLocation(prog, 'sb') };
    g.uniform1i(g.getUniformLocation(prog, 'vid'), 0);
    g.uniform1i(g.getUniformLocation(prog, 'bg'), 1);
    g.viewport(0, 0, cvs.width, cvs.height);
    return ctx;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var c = gl, vid = el.video, cvs = el.canvas;
    if (!c || !vid || !vid.videoWidth) return;
    if (now - (frame.last || 0) < 33) return;   // the stream is no faster
    frame.last = now;
    var g = c.gl;
    var cover = function (sw, sh) {
      var a = (sw / sh) / (cvs.width / cvs.height);
      return a > 1 ? [1 / a, 1] : [1, a];
    };
    if (!c.bgReady && el.room && el.room.complete && el.room.naturalWidth) {
      // Isolated: a backdrop that cannot become a texture leaves her on green rather
      // than turning the whole frame black.
      try {
        g.activeTexture(g.TEXTURE1);
        g.bindTexture(g.TEXTURE_2D, c.texB);
        g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, el.room);
        var b = cover(el.room.naturalWidth, el.room.naturalHeight);
        g.uniform2f(c.sb, b[0], b[1]);
      } catch (e) { console.warn('[katya] backdrop unusable as a texture'); }
      c.bgReady = true;
    }
    g.activeTexture(g.TEXTURE0);
    g.bindTexture(g.TEXTURE_2D, c.texV);
    g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, vid);
    var s = cover(vid.videoWidth, vid.videoHeight);
    g.uniform2f(c.sv, s[0], s[1]);
    g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
  }

  async function startLive() {
    // The button is never disabled: a disabled button never receives the click, and on
    // trademarkscanner.app that left a paid call running behind an open mic prompt.
    // While a session is opening, the same button cancels it.
    if (session || starting) return stopLive();
    starting = true; cancelStart = false; callLabel();
    var s = null;
    try {
      var out = await Promise.all([
        loadSdk(),
        fetch(API + '/session', {
          method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'omit',
          body: JSON.stringify({ language: lang(), page: where().page, ref: where().ref })
        }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; }); })
      ]);
      var SDK = out[0], data = out[1];
      if (cancelStart) return;
      if (data._status === 429) {
        say('assistant', data.error === 'busy'
          ? L('El video está muy solicitado hoy. Escríbeme aquí y te respondo enseguida.', 'Video is in high demand today. Type here and I will answer right away.')
          : L('Ya hablamos varias veces esta hora. Escríbeme aquí y te respondo enseguida.', 'We have already talked several times this hour. Type here and I will answer right away.'));
        return;
      }
      if (!data || !data.session_token) throw new Error('token');

      s = new SDK.LiveAvatarSession(data.session_token, {});
      session = s; callLabel();
      s.on('session.stream_ready', function () {
        if (session !== s) return;
        s.attach(el.video);
        el.stage.style.display = 'block';
        place();
        if (!gl) gl = initGl();
        if (!gl) el.canvas.style.display = 'none';   // no WebGL: show the raw stream
        if (!raf) frame(0);
        // Attaching a track does not start playback; a first visit has no sticky
        // activation, and without this the first call comes up mute.
        var p = el.video.play();
        if (p && p.catch) p.catch(function () {
          var once = function () { el.video.play(); document.removeEventListener('click', once); };
          document.addEventListener('click', once);
        });
      });
      s.on('session.disconnected', function () { if (session === s) stopLive(); });

      await s.start();
      if (session !== s) { try { s.stop(); } catch (e) {} return; }   // ended while connecting
      // The microphone only works once the room is connected. Started from stream_ready
      // it hits the SDK's own guard, which warns to console and returns.
      await s.voiceChat.start();
      if (session !== s) { try { s.stop(); } catch (e) {} return; }
      if (s.voiceChat.state !== 'ACTIVE') {
        say('assistant', L('No pude usar tu micrófono: revisa el permiso, o escríbeme abajo.',
                           'I could not reach your microphone: check the permission, or type below.'));
      }
    } catch (e) {
      if (s && session === s) stopLive();
      else if (s) { try { s.stop(); } catch (x) {} }
      if (!cancelStart) {
        say('assistant', L('No pude iniciar el video ahora mismo. Escríbeme y te respondo igual.',
                           'I could not start the video just now. Type your question and I will answer anyway.'));
      }
    } finally {
      starting = false; cancelStart = false;
      if (el.callBtn) callLabel();
    }
  }

  function say(role, text) {
    var d = document.createElement('div');
    d.className = 'katya-row' + (role === 'user' ? ' katya-row-user' : '');
    var b = document.createElement('div');
    b.className = 'katya-msg ' + (role === 'user' ? 'katya-msg-user' : 'katya-msg-her');
    b.textContent = text;
    d.appendChild(b); el.log.appendChild(d);
    el.log.scrollTop = el.log.scrollHeight;
  }

  async function send() {
    var text = el.input.value.trim();
    if (!text || busy) return;
    el.input.value = ''; busy = true;
    say('user', text);
    msgs.push({ role: 'user', content: text });
    var typing = document.createElement('div');
    typing.className = 'katya-typing';
    typing.textContent = L('Katya está escribiendo…', 'Katya is typing…');
    el.log.appendChild(typing); el.log.scrollTop = el.log.scrollHeight;
    try {
      var r = await fetch(API + '/ask', {
        method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'omit',
        body: JSON.stringify({ messages: msgs.slice(-10), lang: lang(), cid: await conversationId(), page: where().page, ref: where().ref })
      });
      var d = await r.json();
      typing.remove();
      if (!d || !d.reply) throw new Error('empty');
      say('assistant', d.reply);
      if (r.ok) msgs.push({ role: 'assistant', content: d.reply });
    } catch (e) {
      typing.remove();
      say('assistant', L('No pude responder ahora. Escríbenos a ' + EMAIL + '.',
                         'I could not answer just now. Email us at ' + EMAIL + '.'));
    }
    busy = false;
  }

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'katya';
    wrap.innerHTML = [
      '<div id="katyaStage" class="katya-stage" style="display:none">',
      '  <canvas id="katyaCanvas" width="460" height="506"></canvas>',
      '  <video id="katyaVideo" playsinline autoplay></video>',
      '</div>',
      '<div id="katyaPanel" class="katya-panel" role="dialog" aria-labelledby="katyaTitle" style="display:none">',
      '  <div class="katya-head">',
      '    <img id="katyaFace" class="katya-face" alt="" width="36" height="36">',
      '    <div class="katya-who"><div id="katyaTitle" class="katya-title"></div>',
      '      <div id="katyaSub" class="katya-sub"></div></div>',
      '    <button id="katyaCall" class="katya-call" type="button"></button>',
      '    <button id="katyaClose" class="katya-x" type="button">&times;</button>',
      '  </div>',
      '  <div id="katyaLog" class="katya-log" aria-live="polite"></div>',
      '  <div class="katya-bar">',
      '    <input id="katyaInput" class="katya-input" type="text" maxlength="1000" autocomplete="off">',
      '    <button id="katyaSend" class="katya-send" type="button">&rarr;</button>',
      '  </div>',
      '  <div id="katyaNotice" class="katya-notice"></div>',
      '</div>',
      '<button id="katyaLauncher" class="katya-launcher" type="button">',
      '  <img id="katyaFace2" alt="" width="60" height="60">',
      '</button>',
      // Seven seconds: long enough not to interrupt someone reading the hero, short
      // enough to catch them before they leave. Once per browser.
      '<div id="katyaBubble" class="katya-bubble" role="status" style="display:none">',
      '  <span id="katyaBubbleText"></span>',
      '  <button id="katyaBubbleX" class="katya-bubble-x" type="button">&times;</button>',
      '</div>'
    ].join('');
    document.body.appendChild(wrap);

    el.stage = document.getElementById('katyaStage');
    el.canvas = document.getElementById('katyaCanvas');
    el.video = document.getElementById('katyaVideo');
    el.panel = document.getElementById('katyaPanel');
    el.log = document.getElementById('katyaLog');
    el.input = document.getElementById('katyaInput');
    el.callBtn = document.getElementById('katyaCall');
    // crossOrigin before src, or WebGL refuses the image as a texture. Same origin here,
    // but kept in case the image ever moves to a CDN.
    el.room = new Image(); el.room.crossOrigin = 'anonymous';
    el.room.src = '/img/katya/room.jpg';
    document.getElementById('katyaFace').src = '/img/katya/katya.png';
    document.getElementById('katyaFace2').src = '/img/katya/katya.png';
    var launcher = document.getElementById('katyaLauncher');

    function texts() {
      document.getElementById('katyaTitle').textContent = L('Katya · Asistente de StockistScout', 'Katya · StockistScout Assistant');
      document.getElementById('katyaSub').textContent = L('Tus preguntas, respondidas al instante', 'Your questions, answered instantly');
      el.input.placeholder = L('Escribe tu pregunta…', 'Type your question…');
      el.input.setAttribute('aria-label', L('Tu pregunta', 'Your question'));
      document.getElementById('katyaSend').setAttribute('aria-label', L('Enviar', 'Send'));
      document.getElementById('katyaClose').setAttribute('aria-label', L('Cerrar', 'Close'));
      document.getElementById('katyaBubbleX').setAttribute('aria-label', L('Cerrar', 'Close'));
      launcher.setAttribute('aria-label', L('Chatear con Katya', 'Chat with Katya'));
      document.getElementById('katyaNotice').textContent =
        L('Guardamos las conversaciones para atenderte mejor.', 'Chats are saved to help us answer you better.');
      callLabel();
    }
    texts();
    new MutationObserver(texts).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    function open() {
      hideBubble(true);
      el.panel.style.display = 'flex';
      launcher.style.display = 'none';
      if (!el.log.children.length) {
        say('assistant', L('¡Hola! 👋 Soy Katya. Pregúntame cómo los agentes de StockistScout encuentran tiendas para tus productos, por los planes o cómo unirte a la lista de espera.',
                           'Hi! 👋 I\u2019m Katya. Ask me how StockistScout’s agents find stores for your products, about the plans, or how to join the waitlist.'));
      }
      el.input.focus();
    }
    function close() {
      el.panel.style.display = 'none';
      launcher.style.display = 'block';
      stopLive();
      launcher.focus();
    }
    launcher.addEventListener('click', open);
    document.getElementById('katyaClose').addEventListener('click', close);
    document.getElementById('katyaSend').addEventListener('click', send);
    el.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
    el.panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    el.callBtn.addEventListener('click', startLive);

    var bubble = document.getElementById('katyaBubble');
    var bubbleTimer = null;
    function hideBubble(remember) {
      if (!bubble) return;
      clearTimeout(bubbleTimer);
      bubble.classList.remove('katya-bubble-on');
      setTimeout(function () { bubble.style.display = 'none'; }, 350);
      if (remember) { try { localStorage.setItem('ss_katya_bubble', 'seen'); } catch (e) {} }
    }
    function bubbleText() {
      document.getElementById('katyaBubbleText').textContent =
        L('¿Preguntas sobre StockistScout? Con gusto te ayudo. 👋', 'Questions about StockistScout? Happy to help. 👋');
    }
    var seen = false;
    try { seen = localStorage.getItem('ss_katya_bubble') === 'seen'; } catch (e) {}
    if (!seen) {
      bubbleTimer = setTimeout(function () {
        if (el.panel.style.display === 'flex') return;
        bubbleText();
        bubble.style.display = 'block';
        requestAnimationFrame(function () { bubble.classList.add('katya-bubble-on'); });
      }, 7000);
    }
    document.getElementById('katyaBubbleX').addEventListener('click', function (e) { e.stopPropagation(); hideBubble(true); });
    bubble.addEventListener('click', function () { hideBubble(true); open(); });
    new MutationObserver(function () { if (bubble.style.display === 'block') bubbleText(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { passive: true });
    // Nobody hangs up on a tab they have left, and the meter does not care. A minute's grace.
    var away = null;
    document.addEventListener('visibilitychange', function () {
      clearTimeout(away);
      if (document.hidden && (session || starting)) away = setTimeout(stopLive, 60000);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
