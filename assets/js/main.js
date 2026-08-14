/* Firstlight Travel Co. - site behaviour
   No scroll listeners: IntersectionObserver only. Reduced motion respected. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mark JS available so reveal styles can safely hide content. */
  document.documentElement.classList.add('js');

  /* ---------- Broken remote image safety net --------------------------- */
  function guardImages(scope) {
    var imgs = (scope || document).querySelectorAll('img[data-fallback]');
    Array.prototype.forEach.call(imgs, function (img) {
      img.addEventListener('error', function handler() {
        img.removeEventListener('error', handler);
        var seed = img.getAttribute('data-fallback');
        var w = img.getAttribute('width') || 900;
        var h = img.getAttribute('height') || 700;
        img.src = 'https://picsum.photos/seed/' + encodeURIComponent(seed) + '/' + w + '/' + h;
      });
      if (img.complete && img.naturalWidth === 0) {
        img.dispatchEvent(new Event('error'));
      }
    });
  }
  guardImages(document);

  /* ---------- Sticky header state (sentinel, not scroll events) --------- */
  var header = document.querySelector('.site-header');
  if (header && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  /* ---------- Mobile drawer -------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.getElementById('mobile-drawer');
  function setDrawer(open) {
    if (!drawer || !toggle) return;
    drawer.setAttribute('data-open', String(open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    /* Class on <html>: iOS Safari ignores overflow:hidden on <body> alone. */
    document.documentElement.classList.toggle('nav-open', open);
    if (open) {
      var first = drawer.querySelector('a, button');
      if (first) first.focus();
    }
  }
  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      setDrawer(drawer.getAttribute('data-open') !== 'true');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setDrawer(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.getAttribute('data-open') === 'true') {
        setDrawer(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1020) setDrawer(false);
    });
  }

  /* ---------- Scroll reveal --------------------------------------------
     Purpose: sections arrive in reading order so the eye is led down the
     page rather than hit with everything at once. Degrades to visible.   */
  var revealables = document.querySelectorAll('[data-reveal]');
  function showAll() {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-in'); });
  }
  if (reduce || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var group = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        if (el.hasAttribute('data-stagger')) {
          el.style.setProperty('--d', Math.min(group, 8) * 65 + 'ms');
        }
        el.classList.add('is-in');
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
    /* Safety: never leave content hidden (hidden tabs, headless renderers). */
    window.setTimeout(showAll, 2600);
  }

  /* ---------- Counters -------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(counters, function (el) {
        el.textContent = el.getAttribute('data-count');
      });
    } else {
      var cio = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          obs.unobserve(el);
          var target = parseFloat(el.getAttribute('data-count'));
          var suffix = el.getAttribute('data-suffix') || '';
          var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
          var start = null, dur = 1100;
          function step(ts) {
            if (start === null) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * eased).toFixed(dec) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      }, { threshold: 0.5 });
      Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
    }
  }

  /* ---------- Filter chips --------------------------------------------- */
  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var items = document.querySelectorAll('[data-tags]');
    var empty = document.querySelector('[data-empty]');
    var countOut = document.querySelector('[data-result-count]');

    function applyFilter(value) {
      var shown = 0;
      Array.prototype.forEach.call(items, function (item) {
        var tags = (item.getAttribute('data-tags') || '').split(/\s+/);
        var match = value === 'all' || tags.indexOf(value) > -1;
        item.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.setAttribute('data-show', String(shown === 0));
      if (countOut) countOut.textContent = shown;
    }

    filterBar.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      Array.prototype.forEach.call(filterBar.querySelectorAll('.chip'), function (c) {
        c.setAttribute('aria-pressed', String(c === chip));
      });
      applyFilter(chip.getAttribute('data-filter'));
    });
    applyFilter('all');
  }

  /* ---------- Forms: inline validation, no placeholder-as-label -------- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-validate]'), function (form) {
    var status = form.querySelector('.form-status');

    function validateField(input) {
      var wrap = input.closest('.field') || input.closest('.check');
      if (!wrap) return true;
      var valid = input.checkValidity();
      wrap.setAttribute('data-invalid', String(!valid));
      input.setAttribute('aria-invalid', String(!valid));
      return valid;
    }

    Array.prototype.forEach.call(form.querySelectorAll('input, select, textarea'), function (input) {
      input.addEventListener('blur', function () { validateField(input); });
      input.addEventListener('input', function () {
        if ((input.closest('.field') || input.closest('.check') || {}).getAttribute &&
            (input.closest('.field') || input.closest('.check')).getAttribute('data-invalid') === 'true') {
          validateField(input);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll('input, select, textarea');
      var firstBad = null;
      Array.prototype.forEach.call(fields, function (input) {
        if (!validateField(input) && !firstBad) firstBad = input;
      });
      if (firstBad) {
        if (status) {
          status.setAttribute('data-state', 'err');
          status.textContent = 'Please correct the highlighted fields and try again.';
        }
        firstBad.focus();
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; }
      window.setTimeout(function () {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
        if (status) {
          status.setAttribute('data-state', 'ok');
          status.textContent = form.getAttribute('data-success') ||
            'Thanks. Your request reached our team. A trip planner replies within one business day.';
        }
        form.reset();
        Array.prototype.forEach.call(form.querySelectorAll('[data-invalid]'), function (w) {
          w.setAttribute('data-invalid', 'false');
        });
      }, 700);
    });
  });

  /* ---------- Cookie consent (Google Ads / CMP friendly) ---------------- */
  var consent = document.getElementById('consent');
  var STORE = 'firstlight-consent-v1';

  function readConsent() {
    try { return JSON.parse(localStorage.getItem(STORE) || 'null'); }
    catch (err) { return null; }
  }
  function writeConsent(state) {
    var payload = { state: state, ts: new Date().toISOString() };
    try { localStorage.setItem(STORE, JSON.stringify(payload)); } catch (err) { /* private mode */ }
    /* Google Consent Mode v2 signal if gtag is present on the page. */
    if (typeof window.gtag === 'function') {
      var granted = state === 'all';
      window.gtag('consent', 'update', {
        ad_storage: granted ? 'granted' : 'denied',
        ad_user_data: granted ? 'granted' : 'denied',
        ad_personalization: granted ? 'granted' : 'denied',
        analytics_storage: granted ? 'granted' : 'denied'
      });
    }
    document.dispatchEvent(new CustomEvent('consentchange', { detail: payload }));
  }

  if (consent) {
    if (!readConsent()) {
      window.setTimeout(function () { consent.setAttribute('data-open', 'true'); }, 900);
    }
    consent.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-consent]');
      if (!btn) return;
      writeConsent(btn.getAttribute('data-consent'));
      consent.setAttribute('data-open', 'false');
    });
  }

  /* Re-open from the cookie policy page. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-open-consent]'), function (btn) {
    btn.addEventListener('click', function () {
      if (consent) consent.setAttribute('data-open', 'true');
    });
  });

  /* ---------- Current year ---------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
