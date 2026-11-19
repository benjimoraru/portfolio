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
  document.querySelectorAll('section .eyebrow, section h2, section .lead, .card, .stat, .insight, .quote, .skills li, .two-col p, .case-hero > .wrap > *, section .narrow > p, .placeholder, .contact .links, .next-case, .tldr > div, .timeline li, .tl2 li, .hypos li, .todos li, .duo-item, .findings li, .decision, .frame, .design-block h3, .design-block p, .checklist li, .shot')
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
        lb.classList.toggle('zoom', img.parentNode.classList.contains('zoomable'));
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
