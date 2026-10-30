/* Samardha Photography — interactions */
(function () {
  'use strict';

  /* year */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* nav scroll state */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* hamburger */
  var burger = document.getElementById('hamburger');
  var links = document.getElementById('navLinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* hero slider — fade + dots + counter */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hslide'));
  var dotsBox = document.getElementById('heroDots');
  var counter = document.getElementById('heroCounter');
  var cur = 0, timer = null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function go(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('active', k === cur); });
    if (dotsBox) {
      Array.prototype.forEach.call(dotsBox.children, function (d, k) {
        d.classList.toggle('active', k === cur);
        d.setAttribute('aria-selected', k === cur ? 'true' : 'false');
      });
    }
    if (counter) counter.textContent = pad(cur + 1) + ' / ' + pad(slides.length);
  }

  function start() { stop(); timer = setInterval(function () { go(cur + 1); }, 5200); }
  function stop() { if (timer) clearInterval(timer); }

  if (slides.length && dotsBox) {
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Show slide ' + (i + 1));
      b.addEventListener('click', function () { go(i); start(); });
      dotsBox.appendChild(b);
    });
    go(0);
    start();
  }

  /* reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* counters */
  var counters = document.querySelectorAll('.count');
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var dur = 1500, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(dec);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(function (c) {
      var d = parseInt(c.getAttribute('data-dec') || '0', 10);
      c.textContent = parseFloat(c.getAttribute('data-count')).toFixed(d);
    });
  }

  /* toast */
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 4200);
  }

  /* enquiry form */
  var form = document.getElementById('enquiryForm');
  var dateInput = document.getElementById('eventDate');
  if (dateInput) {
    var today = new Date();
    dateInput.min = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
  }
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.replace(/\D/g, '');
      var service = form.service.value;
      var date = form.date.value;
      if (name.length < 2) { showToast('Please enter your name.'); form.name.focus(); return; }
      if (phone.length < 10) { showToast('Please enter a valid 10-digit phone number.'); form.phone.focus(); return; }
      if (!service) { showToast('Please select a service.'); form.service.focus(); return; }
      if (!date) { showToast('Please choose your event date.'); form.date.focus(); return; }
      showToast('Thank you, ' + name.split(' ')[0] + '! Your enquiry is noted — we’ll WhatsApp you within a day.');
      form.reset();
      if (dateInput) {
        var t = new Date();
        dateInput.min = t.getFullYear() + '-' +
          String(t.getMonth() + 1).padStart(2, '0') + '-' +
          String(t.getDate()).padStart(2, '0');
      }
    });
  }

  /* lightbox — contact sheet viewer */
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbCur = 0;

  function lbOpen(i) {
    if (!lb || !tiles.length) return;
    lbCur = (i + tiles.length) % tiles.length;
    var t = tiles[lbCur];
    var img = t.querySelector('img');
    lbImg.src = img.getAttribute('src');
    lbImg.alt = img.getAttribute('alt') || '';
    lbCap.textContent = t.getAttribute('data-caption') || '';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function lbHide() {
    if (!lb) return;
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  tiles.forEach(function (t, i) {
    t.addEventListener('click', function () { lbOpen(i); });
  });
  if (lbClose) lbClose.addEventListener('click', lbHide);
  if (lbPrev) lbPrev.addEventListener('click', function () { lbOpen(lbCur - 1); });
  if (lbNext) lbNext.addEventListener('click', function () { lbOpen(lbCur + 1); });
  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === lb) lbHide();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') lbHide();
    else if (e.key === 'ArrowLeft') lbOpen(lbCur - 1);
    else if (e.key === 'ArrowRight') lbOpen(lbCur + 1);
  });
})();
