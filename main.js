/* Always open at the top (no scroll restore on refresh), unless a #link was used */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) { window.scrollTo(0, 0); window.addEventListener('load', function () { window.scrollTo(0, 0); }); }

(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero headline: words appear one by one
  var h1 = document.querySelector('.hero h1');
  if (h1 && !reduce) {
    var i = 0;
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = part;
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName === 'EM') {
          child.classList.add('w'); child.style.setProperty('--i', i++);
        } else if (child.nodeType === 1) { split(child); }
      });
    })(h1);
  }

  // Number count-up
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    if (reduce || isNaN(target)) return;
    var start = null, dur = 1100;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + (target * eased).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Reveal on scroll, with a small stagger for siblings
  document.querySelectorAll('section .eyebrow, section h2, section .lead, .card, .stat, .insight, .quote, .skills li, .two-col p, .case-hero > .wrap > *, section .narrow > p, .placeholder, .contact .links, .next-case, .tldr > div, .timeline li, .job, .flow li, .persona div, .pains li, .journey li, .game, .ai-item, .tl2 li, .mchart li, .funnel li, .hypos li, .todos li, .duo-item, .findings li, .decision, .frame, .design-block h3, .design-block p, .checklist li, .shot')
    .forEach(function (el) { if (!el.closest('.hero')) el.classList.add('reveal'); });
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--d', (n++ * 0.08) + 's');
        e.target.classList.add('in');
        var nums = e.target.querySelectorAll('[data-count]');
        nums.forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // Nav shadow + reading progress
  var nav = document.querySelector('nav');
  var bar = document.querySelector('.progress');
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 8);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    }
  }

  // Lightbox for design screenshots
  var shots = document.querySelectorAll('.shot img');
  if (shots.length) {
    var lb = document.createElement('div'); lb.className = 'lightbox'; lb.setAttribute('role','dialog');
    var big = document.createElement('img'); lb.appendChild(big); document.body.appendChild(lb);
    shots.forEach(function (img) {
      img.parentNode.addEventListener('click', function () {
        big.src = img.src; big.alt = img.alt; lb.scrollTop = 0; lb.scrollLeft = 0;
        lb.classList.remove('full');
        lb.classList.toggle('zoom', img.parentNode.classList.contains('zoomable')); big.style.setProperty('--zw', (img.parentNode.dataset.zw || 6000) + 'px');
        lb.classList.add('open');
      });
    });
    var hint = document.createElement('p'); hint.className = 'lb-hint'; lb.appendChild(hint);
    var setHint = function () { hint.textContent = lb.classList.contains('full') ? 'Drag or scroll to read · click to zoom out' : 'Click the board to zoom in'; };
    big.addEventListener('click', function (e) {
      if (!lb.classList.contains('zoom')) return;
      e.stopPropagation();
      var r = big.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
      lb.classList.toggle('full'); setHint();
      if (lb.classList.contains('full')) {
        requestAnimationFrame(function () {
          lb.scrollLeft = big.offsetLeft + fx * big.offsetWidth - lb.clientWidth / 2;
          lb.scrollTop = big.offsetTop + fy * big.offsetHeight - lb.clientHeight / 2;
        });
      }
    });
    // drag to pan when zoomed
    var drag = null, moved = false;
    big.addEventListener('mousedown', function (e) { if (!lb.classList.contains('full')) return; drag = { x: e.clientX, y: e.clientY, l: lb.scrollLeft, t: lb.scrollTop }; moved = false; e.preventDefault(); });
    window.addEventListener('mousemove', function (e) { if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) moved = true; lb.scrollLeft = drag.l - dx; lb.scrollTop = drag.t - dy; });
    window.addEventListener('mouseup', function () { setTimeout(function () { drag = null; }, 0); });
    big.addEventListener('click', function (e) { if (moved) { e.stopImmediatePropagation(); moved = false; } }, true);
    lb.addEventListener('click', function () { lb.classList.remove('open'); });
    setHint();
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('open'); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* Hero table: messy research dealt to PM, Design and Engineering */
(function () {
  var host = document.querySelector('.hero-table'); if (!host) return;
  var cv = host.querySelector('.ht-canvas'), CW = 480, CH = 400, D = '#110c18';
  var P = ['#a98bff', '#ffd466', '#ff9f8a'], DARK = ['#7a52e0', '#c99a1a', '#d0644d'];
  var ic = {
    mega: function (m) { return m ? '<g fill="' + m + '"><path d="M3 10 L6 10 L15 5 L15 19 L6 14 L3 14 Z"/><path d="M8 15 L10 21" stroke="' + m + '" stroke-width="2.4" stroke-linecap="round"/></g>'
      : '<path d="M3 10 L6 10 L15 5 L15 19 L6 14 L3 14 Z" fill="#2a9d9a"/><ellipse cx="15.5" cy="12" rx="2.2" ry="7" fill="#e6f4f3" stroke="#2a9d9a" stroke-width="1.4"/><path d="M8 15 L10 21" stroke="#f08c2e" stroke-width="2.6" stroke-linecap="round"/>'; },
    hammer: function (m) { return m ? '<g fill="' + m + '"><path d="M5 5 H16 V9.5 H11.5 L5 8.5 Z"/><rect x="9.6" y="9.5" width="3.6" height="12" rx="1.2"/></g>'
      : '<path d="M5 5 H16 V9.5 H11.5 L5 8.5 Z" fill="#5f5f6b"/><rect x="9.6" y="9.5" width="3.6" height="12" rx="1.2" fill="#f2c230"/><rect x="9.6" y="16" width="3.6" height="5.5" rx="1.2" fill="#d99a1c"/>'; },
    book: function (m) { return m ? '<rect x="5" y="3" width="14" height="18" rx="2" fill="' + m + '"/>'
      : '<rect x="5" y="3" width="14" height="18" rx="2" fill="#1f4f5a"/><rect x="15.5" y="3" width="1.6" height="18" fill="#8bd14f"/><circle cx="9.5" cy="15" r="1.6" fill="none" stroke="#6fd0e0" stroke-width="1"/>'; },
    pack: function (m) {
      return '<path d="M10 4.8 C10 2.2 14 2.2 14 4.8" fill="none" stroke="#9c8a2c" stroke-width="1.5" stroke-linecap="round"/>'
        + '<path d="M6.2 6 C6.2 5 7 4.5 8 4.5 H16 C17 4.5 17.8 5 17.8 6 L19.4 19.6 C19.5 21 18.6 22 17.2 22 H6.8 C5.4 22 4.5 21 4.6 19.6 Z" fill="#e8672c"/>'
        + '<path d="M5.8 7 C5.8 5.4 6.9 4.6 8 4.6 H16 C17.1 4.6 18.2 5.4 18.2 7 V10.8 C18.2 11.8 17.5 12.3 16.5 12.1 C13.5 11.5 10.5 11.5 7.5 12.1 C6.5 12.3 5.8 11.8 5.8 10.8 Z" fill="#b9a43a"/>'
        + '<rect x="11.2" y="4.6" width="1.6" height="11.2" rx=".8" fill="#9c8a2c"/>'
        + '<path d="M12.4 15.6 L12.9 18" stroke="#9c8a2c" stroke-width="1.3" stroke-linecap="round"/>'
        + '<rect x="10.3" y="10.2" width="3.4" height="1.3" rx=".5" fill="#3a3245"/>';
    }
  };
  var G = '#ffd466', K = '#2a2235';
  var packBack = '<path d="M10 6.5 V5 C10 3.6 14 3.6 14 5 V6.5" fill="none" stroke="' + G + '" stroke-width="1.6" stroke-linecap="round"/>'
    + '<rect x="5" y="6.5" width="14" height="16" rx="3.5" fill="' + G + '"/>'
    + '<path d="M5.6 11.5 H18.4" stroke="' + K + '" stroke-width="1.1"/>'
    + '<rect x="11.2" y="11.5" width="1.6" height="3.2" fill="' + K + '"/>'
    + '<rect x="7.8" y="16.5" width="8.4" height="4" rx="1.2" fill="none" stroke="' + K + '" stroke-width="1.1"/>';
  var cardIc = ['mega', 'book', 'hammer'];
  function sv(w, h, body) { return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + body + '</svg>'; }
  var draw = {
    order: function (c) { return sv(34, 34, '<circle cx="17" cy="17" r="15" fill="' + c + '" stroke="' + D + '" stroke-width="2"/><circle cx="17" cy="17" r="11" fill="none" stroke="' + D + '" stroke-width="1.5" opacity=".5"/><path d="M11 20 L17 13 L23 20" stroke="' + D + '" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'); },
    dino: function (c) { return sv(46, 32, '<path d="M1 19 C6 18 9 15 14 14 C20 12 26 13 29 15 L32 6 C33 3 37 2 40 3 C43 4 44 7 41 8 L37 8 L35 17 C37 20 36 23 33 24 L33 31 L29 31 L28 25 L19 25 L18 31 L14 31 L14 24 C10 23 6 21 1 19 Z" fill="' + c + '"/><circle cx="39" cy="5" r="1.1" fill="' + D + '"/>'); },
    loco: function (c) { return sv(42, 30, '<rect x="2" y="9" width="24" height="12" rx="2" fill="' + c + '"/><rect x="24" y="3" width="13" height="18" rx="2" fill="' + c + '"/><rect x="27" y="6" width="7" height="5" rx="1" fill="' + D + '"/><rect x="7" y="2" width="5" height="8" fill="' + c + '"/><circle cx="9" cy="24" r="4" fill="' + D + '" stroke="' + c + '" stroke-width="2"/><circle cx="20" cy="24" r="4" fill="' + D + '" stroke="' + c + '" stroke-width="2"/><circle cx="31" cy="24" r="4" fill="' + D + '" stroke="' + c + '" stroke-width="2"/>'); },
    meeple: function (c) { return '<svg width="34" height="34" viewBox="0 0 36 36"><path d="M18 2a6 6 0 0 1 6 6a6 6 0 0 1-1.5 4L33 15a3 3 0 0 1-1 5.5L24 20l4 13a2 2 0 0 1-2 2h-5l-3-8-3 8h-5a2 2 0 0 1-2-2l4-13-8 .5a3 3 0 0 1-1-5.5L13.5 12A6 6 0 0 1 12 8a6 6 0 0 1 6-6z" fill="' + c + '"/></svg>'; },
    card: function (c, o) { var k = cardIc[o], m = DARK[o]; return sv(32, 44, '<rect x="1" y="1" width="30" height="42" rx="4" fill="' + c + '"/><rect x="4" y="4" width="24" height="36" rx="3" fill="#fbf8f2"/><g transform="translate(5,10) scale(.92)">' + ic[k]() + '</g><g transform="translate(6.5,33) scale(.32)">' + ic[k](m) + '</g><g transform="translate(18,33) scale(.32)">' + ic[k](m) + '</g>'); },
    deck: function () { var s = ''; for (var i = 3; i >= 0; i--) { var o = i * 2.5; s += '<rect x="' + (4 + o) + '" y="' + (4 + o) + '" width="32" height="44" rx="4" fill="#2a2235" stroke="#ffd466" stroke-width="1.2"/>'; }
      return sv(44, 52, s + '<rect x="8" y="8" width="24" height="36" rx="2" fill="none" stroke="#ffd466" stroke-width=".8" opacity=".6"/><g transform="translate(8.5,15) scale(.95)">' + ic.pack() + '</g>'); },
    wdie: function (c, o, f) { return sv(30, 30, '<rect x="1" y="1" width="28" height="28" rx="6" fill="#fbfaf7"/><rect x="1" y="24" width="28" height="5" rx="3" fill="#e2ddd2"/><g transform="translate(3.5,3) scale(.95)">' + ic[f]() + '</g>'); },
    cube: function (c) { return sv(20, 20, '<rect x="1" y="1" width="18" height="18" rx="3" fill="' + c + '"/><rect x="1" y="1" width="18" height="6" rx="3" fill="#fff" opacity=".25"/>'); },
    coin: function (c, o, f) {
      var v = f || 5, n = v === 5 ? 28 : v === 10 ? 33 : 38, h = n / 2, bronze = v === 5;
      var silver = v === 10;
      var fill = bronze ? '#c98a4b' : silver ? '#cfd3da' : '#e9b949', ring = bronze ? '#8a5a2b' : silver ? '#8c929c' : '#a87e1c', txt = bronze ? '#5a3714' : silver ? '#4a4f58' : '#6b4c0b';
      return sv(n, n, '<circle cx="' + h + '" cy="' + h + '" r="' + (h - 1) + '" fill="' + fill + '"/><circle cx="' + h + '" cy="' + h + '" r="' + (h - 4.5) + '" fill="none" stroke="' + ring + '" stroke-width="1.5"/>'
        + (v === 15 ? '<circle cx="' + h + '" cy="' + h + '" r="' + (h - 7.5) + '" fill="none" stroke="' + ring + '" stroke-width=".8" opacity=".7"/>' : '')
        + '<text x="' + h + '" y="' + (h + n * .16) + '" font-size="' + Math.round(n * .42) + '" font-weight="700" text-anchor="middle" fill="' + txt + '" font-family="sans-serif">' + v + '</text>'); },
    d12: function () { var R = 16, r = 8.5, c = 18, out = [], inn = [], i, s;
      for (i = 0; i < 10; i++) out.push([c + R * Math.cos(-Math.PI / 2 + i * Math.PI / 5), c + R * Math.sin(-Math.PI / 2 + i * Math.PI / 5)]);
      for (i = 0; i < 5; i++) inn.push([c + r * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / 5), c + r * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / 5)]);
      s = '<polygon points="' + out.map(function (p) { return p.join(','); }).join(' ') + '" fill="#f4f1f7" stroke="#bfb7cc"/>';
      inn.forEach(function (p, j) { var o = out[j * 2]; s += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + o[0] + '" y2="' + o[1] + '" stroke="#bfb7cc"/>'; });
      return sv(36, 36, s + '<polygon points="' + inn.map(function (p) { return p.join(','); }).join(' ') + '" fill="#fff" stroke="#bfb7cc"/><text x="18" y="22.5" font-size="12" font-weight="700" text-anchor="middle" fill="' + D + '" font-family="sans-serif">3</text>'); },
    trophy: function () { return sv(36, 36, '<circle cx="18" cy="18" r="16" fill="#2a2235" stroke="#ffd466" stroke-width="2"/><path d="M12 9 H24 V14 C24 18.5 21.3 21 18 21 C14.7 21 12 18.5 12 14 Z" fill="#ffd466"/><path d="M12 11 H8.5 C8.5 15 10 17 13 17.5 M24 11 H27.5 C27.5 15 26 17 23 17.5" fill="none" stroke="#ffd466" stroke-width="1.8"/><rect x="16.5" y="21" width="3" height="4" fill="#e0a92a"/><rect x="13" y="25" width="10" height="3" rx="1" fill="#ffd466"/><path d="M15 11 V15" stroke="#fff6d6" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>'); }
  };
  var items = [];
  P.forEach(function (c, o) { ['order', 'dino', 'loco', 'meeple', 'card'].forEach(function (k) { items.push({ k: k, c: c, o: o }); }); });
  var coinV = [5, 10, 15], ci = 0;
  ['deck', 'deck', 'wdie', 'wdie', 'wdie', 'cube', 'cube', 'cube', 'cube', 'coin', 'coin', 'coin', 'd12', 'trophy'].forEach(function (k, i) {
    items.push({ k: k, c: ['#7fd8a8', '#6fa8ff', '#f4f1f7', '#5a4f6b'][i % 4], o: -1, f: k === 'coin' ? coinV[ci++] : ['mega', 'hammer', 'pack'][i % 3] });
  });
  var cx = CW / 2, cnt = [0, 0, 0], nc = { deck: 0, wdie: 0, cube: 0, coin: 0 };
  items.forEach(function (it) {
    var el = document.createElement('div'); el.className = 'ht-piece'; el.innerHTML = draw[it.k](it.c, it.o, it.f); cv.appendChild(el); it.el = el;
    it.m = { x: 10 + Math.random() * (CW - 60), y: 10 + Math.random() * (CH - 60), r: Math.random() * 160 - 80 };
    var k;
    if (it.o === 0) { k = cnt[0]++; it.d = { x: 10, y: 60 + k * 50, r: 0 }; }
    else if (it.o === 2) { k = cnt[2]++; it.d = { x: CW - 56, y: 60 + k * 50, r: 0 }; }
    else if (it.o === 1) { k = cnt[1]++; it.d = { x: cx - 135 + k * 56, y: 316, r: 0 }; }
    else if (it.k === 'deck') { k = nc.deck++; it.d = { x: cx - 130 + k * 52, y: 78, r: k ? 6 : -4 }; }
    else if (it.k === 'wdie') { k = nc.wdie++; it.d = { x: cx + 6 + k * 38, y: 88, r: [-8, 4, 10][k] }; }
    else if (it.k === 'cube') { k = nc.cube++; it.d = { x: cx - 120 + k * 30, y: 158, r: 0 }; }
    else if (it.k === 'coin') { k = nc.coin++; it.d = { x: cx + [12, 44, 82][k], y: [158, 155, 152][k], r: 0 }; }
    else if (it.k === 'd12') { it.d = { x: cx - 110, y: 205, r: 8 }; }
    else { it.d = { x: cx - 60, y: 203, r: 0 }; }
  });
  var kOrder = ['meeple', 'dino', 'loco', 'order', 'card', 'deck', 'wdie', 'cube', 'coin', 'd12', 'trophy'];
  items.slice().sort(function (a, b) { return kOrder.indexOf(a.k) - kOrder.indexOf(b.k) || a.o - b.o; }).forEach(function (it, j) {
    var cols = 8, col = j % cols, row = Math.floor(j / cols);
    it.s = { x: (CW - cols * 56) / 2 + 6 + col * 56, y: 40 + row * 82, r: 0 };
  });
  function spill() { items.forEach(function (it) { it.m = { x: 10 + Math.random() * (CW - 60), y: 10 + Math.random() * (CH - 60), r: Math.random() * 160 - 80 }; }); }
  function set(pick, j) {
    items.forEach(function (it) { var p = pick(it), dx = j ? Math.random() * 16 - 8 : 0, dy = j ? Math.random() * 16 - 8 : 0, dr = j ? Math.random() * 30 - 15 : 0;
      it.el.style.transform = 'translate(' + (p.x + dx) + 'px,' + (p.y + dy) + 'px) rotate(' + (p.r + dr) + 'deg)'; });
  }
  function fit() { var w = host.clientWidth, s = Math.min(1.1, w / CW); cv.style.transform = 'scale(' + s + ')'; host.style.height = (CH * s) + 'px'; }
  fit(); window.addEventListener('resize', fit);
  var d12el = (items.filter(function (it) { return it.k === 'd12'; })[0] || {}).el;
  var mode = 'm';
  var touch = window.matchMedia('(hover: none)').matches;
  var hint = document.createElement('p'); hint.className = 'ht-hint'; host.parentNode.insertBefore(hint, host.nextSibling);
  function setHint() { hint.textContent = (touch ? 'Tap or shake to ' : 'Click to ') + (mode === 'm' ? 'sort' : mode === 's' ? 'deal' : 'shuffle'); }
  function go(m) {
    mode = m; host.classList.toggle('dealt', m === 'd'); host.classList.toggle('sorted', m === 's');
    if (m === 'm') { spill(); var t = d12el && d12el.querySelector('text'); if (t) { var nv; do { nv = Math.floor(Math.random() * 4); } while (String(nv) === t.textContent); t.textContent = nv; } }
    set(function (it) { return m === 'd' ? it.d : m === 's' ? it.s : it.m; });
    setHint();
  }
  function next() { hint.classList.add('used'); go(mode === 'd' ? 'm' : mode === 'm' ? 's' : 'd'); }
  host.addEventListener('click', next);
  hint.setAttribute('role', 'button'); hint.tabIndex = 0;
  hint.addEventListener('click', next);
  hint.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } });
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  go('m');
  if (reduce) return;
  /* Phones: pieces drift a little as the phone tilts */
  if (window.matchMedia('(hover: none)').matches && 'DeviceOrientationEvent' in window) {
    items.forEach(function (it) { it.el.style.setProperty('--k', (0.5 + Math.random()).toFixed(2)); });
    var raf = 0, gx = 0, gy = 0;
    var clamp = function (v) { return Math.max(-30, Math.min(30, v || 0)); };
    var onTilt = function (e) {
      gx = clamp(e.gamma) / 30 * 7; gy = clamp((e.beta || 45) - 45) / 30 * 7;
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; host.style.setProperty('--gx', gx.toFixed(2)); host.style.setProperty('--gy', gy.toFixed(2)); });
    };
    var listen = function () { window.addEventListener('deviceorientation', onTilt); };
    listen();
    /* Shake the phone to go to the next step */
    var last = null, lastShake = 0;
    var onMotion = function (e) {
      var now = Date.now(), hit = false, a = e.acceleration, g = e.accelerationIncludingGravity;
      if (a && a.x != null) { hit = Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z) > 13; }
      else if (g && g.x != null) {
        if (last) hit = Math.abs(g.x - last.x) + Math.abs(g.y - last.y) + Math.abs(g.z - last.z) > 14;
        last = { x: g.x, y: g.y, z: g.z };
      }
      if (hit && now - lastShake > 1000) { lastShake = now; next(); }
    };
    var listenMotion = function () { window.addEventListener('devicemotion', onMotion); };
    listenMotion();
    if (typeof DeviceOrientationEvent.requestPermission === 'function' || (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function')) {
      host.addEventListener('click', function ask() {
        host.removeEventListener('click', ask);
        if (typeof DeviceOrientationEvent.requestPermission === 'function') DeviceOrientationEvent.requestPermission().then(function (r) { if (r === 'granted') listen(); }).catch(function () {});
        if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') DeviceMotionEvent.requestPermission().then(function (r) { if (r === 'granted') listenMotion(); }).catch(function () {});
      });
    }
  }
  function cur(it) { return mode === 'd' ? it.d : mode === 's' ? it.s : it.m; }
  host.addEventListener('mouseenter', function () { set(cur, true); });
  host.addEventListener('mouseleave', function () { set(cur); });
})();

/* Let's talk: player 4's pieces gather in the seat as you scroll, and leave again on the way up */
(function () {
  var pile = document.querySelector('.seats .pile'); if (!pile) return;
  var T = '#5fd3c0', D = '#110c18';
  function sv(w, h, b, vb) { return '<svg width="' + w + '" height="' + h + '" viewBox="' + (vb || '0 0 ' + w + ' ' + h) + '">' + b + '</svg>'; }
  var tpack = '<path d="M10 4.8 C10 2.2 14 2.2 14 4.8" fill="none" stroke="#1e8a7b" stroke-width="1.5" stroke-linecap="round"/>'
    + '<path d="M6.2 6 C6.2 5 7 4.5 8 4.5 H16 C17 4.5 17.8 5 17.8 6 L19.4 19.6 C19.5 21 18.6 22 17.2 22 H6.8 C5.4 22 4.5 21 4.6 19.6 Z" fill="#2fb3a0"/>'
    + '<path d="M5.8 7 C5.8 5.4 6.9 4.6 8 4.6 H16 C17.1 4.6 18.2 5.4 18.2 7 V10.8 C18.2 11.8 17.5 12.3 16.5 12.1 C13.5 11.5 10.5 11.5 7.5 12.1 C6.5 12.3 5.8 11.8 5.8 10.8 Z" fill="#8ee6d8"/>'
    + '<rect x="11.2" y="4.6" width="1.6" height="11.2" rx=".8" fill="#1e8a7b"/><path d="M12.4 15.6 L12.9 18" stroke="#1e8a7b" stroke-width="1.3" stroke-linecap="round"/>'
    + '<rect x="10.3" y="10.2" width="3.4" height="1.3" rx=".5" fill="#3a3245"/>';
  var defs = [
    { k: 'order', html: sv(40, 40, '<circle cx="17" cy="17" r="15" fill="' + T + '" stroke="' + D + '" stroke-width=".8" stroke-opacity=".5"/><circle cx="17" cy="17" r="11" fill="none" stroke="' + D + '" stroke-width="1.5" opacity=".5"/><path d="M11 20 L17 13 L23 20" stroke="' + D + '" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>', '0 0 34 34'), x: -50, y: -2, r: -10 },
    { k: 'loco', html: sv(34, 24, '<rect x="2" y="9" width="24" height="12" rx="2" fill="' + T + '"/><rect x="24" y="3" width="13" height="18" rx="2" fill="' + T + '"/><rect x="27" y="6" width="7" height="5" rx="1" fill="' + D + '"/><rect x="7" y="2" width="5" height="8" fill="' + T + '"/><circle cx="9" cy="24" r="4" fill="' + D + '" stroke="' + T + '" stroke-width="2"/><circle cx="20" cy="24" r="4" fill="' + D + '" stroke="' + T + '" stroke-width="2"/><circle cx="31" cy="24" r="4" fill="' + D + '" stroke="' + T + '" stroke-width="2"/>', '0 0 42 30'), x: -32, y: 0, r: -4 },
    { k: 'dino', html: sv(36, 25, '<path d="M1 19 C6 18 9 15 14 14 C20 12 26 13 29 15 L32 6 C33 3 37 2 40 3 C43 4 44 7 41 8 L37 8 L35 17 C37 20 36 23 33 24 L33 31 L29 31 L28 25 L19 25 L18 31 L14 31 L14 24 C10 23 6 21 1 19 Z" fill="' + T + '"/>', '0 0 46 32'), x: 2, y: 0, r: 3 },
    { k: 'card', html: sv(22, 30, '<rect x="1" y="1" width="30" height="42" rx="4" fill="' + T + '"/><rect x="4" y="4" width="24" height="36" rx="3" fill="#fbf8f2"/><g transform="translate(4,9)">' + tpack + '</g>', '0 0 32 44'), x: 20, y: -6, r: 12 },
    { k: 'meeple', html: sv(40, 40, '<path d="M18 2a6 6 0 0 1 6 6a6 6 0 0 1-1.5 4L33 15a3 3 0 0 1-1 5.5L24 20l4 13a2 2 0 0 1-2 2h-5l-3-8-3 8h-5a2 2 0 0 1-2-2l4-13-8 .5a3 3 0 0 1-1-5.5L13.5 12A6 6 0 0 1 12 8a6 6 0 0 1 6-6z" fill="' + T + '"/>', '0 0 36 36'), x: -18, y: -22, r: 0 }
  ];
  var totop = document.createElement('button');
  totop.className = 'totop'; totop.setAttribute('aria-label', 'Back to top');
  totop.innerHTML = '<svg width="40" height="40" viewBox="0 0 34 34"><circle cx="17" cy="17" r="15" fill="' + T + '" stroke="' + D + '" stroke-width=".8" stroke-opacity=".5"/><circle cx="17" cy="17" r="11" fill="none" stroke="' + D + '" stroke-width="1.5" opacity=".5"/><path d="M11 20 L17 13 L23 20" stroke="' + D + '" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(totop);
  totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  var hero = document.querySelector('.hero');
  function btnStart(d) {
    var b = totop.getBoundingClientRect(), pr = pile.getBoundingClientRect();
    return { x: b.left - (pr.left + pr.width / 2), y: b.top - (pr.bottom - d.h0) };
  }
  function syncBtn() { totop.classList.toggle('show', window.scrollY > (hero ? hero.offsetHeight * 0.8 : 600)); }
  window.addEventListener('scroll', syncBtn, { passive: true }); syncBtn();
  var n = defs.length;
  defs.forEach(function (d, i) {
    var el = document.createElement('span'); el.className = 'yp yp-' + d.k; el.innerHTML = d.html; pile.appendChild(el); d.el = el;
    d.w0 = el.offsetWidth || 30; d.h0 = el.offsetHeight || 30;
    d.ang = (-165 + i * 38 + Math.random() * 16) * Math.PI / 180; d.rad = 110 + Math.random() * 60; d.spin = Math.random() * 120 - 60;
    if (i === n - 1) { d.a = 0.8; d.b = 1; } else { d.a = i * 0.17; d.b = d.a + 0.32; }
    d.w = { x: 0, y: 0, r: 0 };
  });
  var meeple = defs[n - 1];
  function back(t) { var c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  function render(p) {
    defs.forEach(function (d) {
      var t = Math.max(0, Math.min(1, (p - d.a) / (d.b - d.a))), x, y, r, sc, op;
      if (d === meeple) {
        var e = back(t);
        x = -20 + d.w.x; y = 14 + (-3 - 14) * e + d.w.y; r = d.w.r; sc = 0.3 + 0.7 * e; op = Math.min(1, t * 2.5);
      } else if (d.k === 'order') {
        var k = Math.pow(t, 2.6), st = btnStart(d);
        x = st.x + (-d.w0 / 2 - st.x) * k; y = st.y + (-d.h0 / 2 + 4 - st.y) * k;
        r = k * 300; sc = 1; op = t <= 0 ? 0 : 1 - Math.max(0, (k - 0.75) / 0.25);
        totop.classList.toggle('gone', t > 0);
      } else {
        var k = Math.pow(t, 2.6);
        var ang = d.ang + k * 2.2, rad = d.rad * (1 - k);
        x = Math.cos(ang) * rad - d.w0 / 2; y = Math.sin(ang) * rad * 0.7 - d.h0 / 2 + 4;
        r = d.spin * (1 - k) + k * 240; sc = 1; op = t <= 0 ? 0 : Math.min(1, t * 6) * (1 - Math.max(0, (k - 0.75) / 0.25));
      }
      d.el.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + r + 'deg) scale(' + sc + ')';
      d.el.style.opacity = op;
    });
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { render(1); totop.classList.remove('gone'); return; }
  /* The pieces follow the scroll with a soft delay: the target comes from the scroll, the pieces ease towards it */
  var cur = 0, target = 0, loop = 0;
  function measure() {
    var vh = window.innerHeight, y = window.scrollY, top = pile.getBoundingClientRect().top + y;
    var start = top - vh * 0.95, end = (document.scrollingElement || document.documentElement).scrollHeight - vh - 12;
    target = end <= start ? 1 : Math.max(0, Math.min(1, (y - start) / (end - start)));
    if (!loop) loop = requestAnimationFrame(tick);
  }
  function tick() {
    var diff = target - cur;
    cur = Math.abs(diff) < 0.0008 ? target : cur + diff * 0.07;
    render(cur);
    loop = cur === target ? 0 : requestAnimationFrame(tick);
  }
  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', measure); measure();
  meeple.el.addEventListener('mouseenter', function () { if (cur < 1) return; meeple.w = { x: Math.random() * 12 - 6, y: -6 - Math.random() * 6, r: Math.random() * 24 - 12 }; render(cur); });
  meeple.el.addEventListener('mouseleave', function () { meeple.w = { x: 0, y: 0, r: 0 }; render(cur); });
})();

/* Trophy tokens on cards: small springy wiggle when hovered, like the table pieces */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.score-coin').forEach(function (c) {
    c.addEventListener('mouseenter', function () {
      var x = Math.random() * 12 - 6, y = -4 - Math.random() * 6, r = -8 + (Math.random() * 30 - 15);
      c.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + r + 'deg)';
    });
    c.addEventListener('mouseleave', function () { c.style.transform = ''; });
  });
})();

/* Jump chips: smooth jump on click, the active chip follows the scroll */
(function () {
  var bar = document.querySelector('.jump'); if (!bar) return;
  var chips = [].slice.call(bar.querySelectorAll('.jchip'));
  var secs = chips.map(function (c) { return document.getElementById(c.dataset.t); });
  var lock = 0;
  function setOn(i) {
    chips.forEach(function (c, j) { c.classList.toggle('on', j === i); });
    var c = chips[i], w = bar.querySelector('.wrap');
    if (c && w.scrollWidth > w.clientWidth) w.scrollTo({ left: c.offsetLeft - 16, behavior: 'smooth' });
  }
  chips.forEach(function (c, i) {
    c.addEventListener('click', function (e) {
      e.preventDefault(); setOn(i); lock = Date.now() + 900;
      secs[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  var raf = 0, cur = 0;
  function spy() {
    raf = 0; if (Date.now() < lock) return;
    var line = 140, i = 0;
    secs.forEach(function (s, j) { if (s && s.getBoundingClientRect().top <= line) i = j; });
    if (i !== cur) { cur = i; setOn(i); }
  }
  window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(spy); }, { passive: true });
})();
