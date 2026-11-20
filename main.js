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
  var P = ['#a98bff', '#ff9f8a', '#ffd466'], DARK = ['#7a52e0', '#d0644d', '#c99a1a'];
  var ic = {
    mega: function (m) { return m ? '<g fill="' + m + '"><path d="M3 10 L6 10 L15 5 L15 19 L6 14 L3 14 Z"/><path d="M8 15 L10 21" stroke="' + m + '" stroke-width="2.4" stroke-linecap="round"/></g>'
      : '<path d="M3 10 L6 10 L15 5 L15 19 L6 14 L3 14 Z" fill="#2a9d9a"/><ellipse cx="15.5" cy="12" rx="2.2" ry="7" fill="#e6f4f3" stroke="#2a9d9a" stroke-width="1.4"/><path d="M8 15 L10 21" stroke="#f08c2e" stroke-width="2.6" stroke-linecap="round"/>'; },
    hammer: function (m) { return m ? '<g fill="' + m + '"><path d="M5 5 H16 V9.5 H11.5 L5 8.5 Z"/><rect x="9.6" y="9.5" width="3.6" height="12" rx="1.2"/></g>'
      : '<path d="M5 5 H16 V9.5 H11.5 L5 8.5 Z" fill="#5f5f6b"/><rect x="9.6" y="9.5" width="3.6" height="12" rx="1.2" fill="#f2c230"/><rect x="9.6" y="16" width="3.6" height="5.5" rx="1.2" fill="#d99a1c"/>'; },
    book: function (m) { return m ? '<rect x="5" y="3" width="14" height="18" rx="2" fill="' + m + '"/>'
      : '<rect x="5" y="3" width="14" height="18" rx="2" fill="#1f4f5a"/><rect x="15.5" y="3" width="1.6" height="18" fill="#8bd14f"/><circle cx="9.5" cy="15" r="1.6" fill="none" stroke="#6fd0e0" stroke-width="1"/>'; },
    pack: function (m) { return m ? '<g fill="' + m + '"><rect x="5" y="8" width="14" height="13" rx="4"/><path d="M7 9 C7 4 17 4 17 9 Z"/></g>'
      : '<rect x="5" y="8" width="14" height="13" rx="4" fill="#e8672c"/><path d="M7 10 C7 4 17 4 17 10 Z" fill="#b9a43a"/><rect x="10.5" y="10" width="3" height="5" rx="1" fill="#b9a43a"/><rect x="7" y="16" width="10" height="3" rx="1" fill="#c9521f"/>'; }
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
    coin: function () { return sv(28, 28, '<circle cx="14" cy="14" r="13" fill="#e9b949"/><circle cx="14" cy="14" r="9.5" fill="none" stroke="#a87e1c" stroke-width="1.5"/><text x="14" y="18.5" font-size="12" font-weight="700" text-anchor="middle" fill="#6b4c0b" font-family="sans-serif">5</text>'); },
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
  ['deck', 'deck', 'wdie', 'wdie', 'wdie', 'cube', 'cube', 'cube', 'cube', 'coin', 'coin', 'd12', 'trophy'].forEach(function (k, i) {
    items.push({ k: k, c: ['#7fd8a8', '#6fa8ff', '#f4f1f7', '#5a4f6b'][i % 4], o: -1, f: ['mega', 'hammer', 'pack'][i % 3] });
  });
  var cx = CW / 2, cnt = [0, 0, 0], nc = { deck: 0, wdie: 0, cube: 0, coin: 0 };
  items.forEach(function (it) {
    var el = document.createElement('div'); el.className = 'ht-piece'; el.innerHTML = draw[it.k](it.c, it.o, it.f); cv.appendChild(el); it.el = el;
    it.m = { x: 10 + Math.random() * (CW - 60), y: 10 + Math.random() * (CH - 60), r: Math.random() * 160 - 80 };
    var k;
    if (it.o === 0) { k = cnt[0]++; it.d = { x: 10, y: 60 + k * 50, r: 0 }; }
    else if (it.o === 2) { k = cnt[2]++; it.d = { x: CW - 56, y: 60 + k * 50, r: 0 }; }
    else if (it.o === 1) { k = cnt[1]++; it.d = { x: cx - 135 + k * 56, y: 330, r: 0 }; }
    else if (it.k === 'deck') { k = nc.deck++; it.d = { x: cx - 130 + k * 52, y: 78, r: k ? 6 : -4 }; }
    else if (it.k === 'wdie') { k = nc.wdie++; it.d = { x: cx + 6 + k * 38, y: 88, r: [-8, 4, 10][k] }; }
    else if (it.k === 'cube') { k = nc.cube++; it.d = { x: cx - 120 + k * 30, y: 158, r: 0 }; }
    else if (it.k === 'coin') { k = nc.coin++; it.d = { x: cx + 20 + k * 36, y: 150, r: 0 }; }
    else if (it.k === 'd12') { it.d = { x: cx - 110, y: 205, r: 8 }; }
    else { it.d = { x: cx - 60, y: 203, r: 0 }; }
  });
  var kOrder = ['meeple', 'dino', 'loco', 'order', 'card', 'deck', 'wdie', 'cube', 'coin', 'd12', 'trophy'];
  items.slice().sort(function (a, b) { return kOrder.indexOf(a.k) - kOrder.indexOf(b.k) || a.o - b.o; }).forEach(function (it, j) {
    var cols = 7, col = j % cols, row = Math.floor(j / cols);
    it.s = { x: (CW - cols * 62) / 2 + 8 + col * 62, y: 40 + row * 82, r: 0 };
  });
  function spill() { items.forEach(function (it) { it.m = { x: 10 + Math.random() * (CW - 60), y: 10 + Math.random() * (CH - 60), r: Math.random() * 160 - 80 }; }); }
  function set(pick, j) {
    items.forEach(function (it) { var p = pick(it), dx = j ? Math.random() * 16 - 8 : 0, dy = j ? Math.random() * 16 - 8 : 0, dr = j ? Math.random() * 30 - 15 : 0;
      it.el.style.transform = 'translate(' + (p.x + dx) + 'px,' + (p.y + dy) + 'px) rotate(' + (p.r + dr) + 'deg)'; });
  }
  function fit() { var w = host.clientWidth, s = Math.min(1.1, w / CW); cv.style.transform = 'scale(' + s + ')'; host.style.height = (CH * s) + 'px'; }
  fit(); window.addEventListener('resize', fit);
  var mode = 'm';
  function go(m) {
    mode = m; host.classList.toggle('dealt', m === 'd');
    if (m === 'm') spill();
    set(function (it) { return m === 'd' ? it.d : m === 's' ? it.s : it.m; });
  }
  host.addEventListener('click', function () { go(mode === 'd' ? 'm' : mode === 'm' ? 's' : 'd'); });
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  go('m');
  if (reduce) return;
  function cur(it) { return mode === 'd' ? it.d : mode === 's' ? it.s : it.m; }
  host.addEventListener('mouseenter', function () { set(cur, true); });
  host.addEventListener('mouseleave', function () { set(cur); });
})();
