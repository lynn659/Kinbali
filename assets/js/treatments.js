/* Kin Bali Massage — treatments page */
(function () {
  'use strict';
  var KB = window.KB || {};
  var mq = window.matchMedia('(max-width: 820px)');
  var PGT = document.getElementById('pg-tr');
  var views = [PGT.querySelector('.v-d'), PGT.querySelector('.v-m')];

  /* ---------- filters + price toggle (with fade) ---------- */
  views.forEach(function (V) {
    if (!V) return;
    var root = V.querySelector('.tr-root') || V;
    var chips = V.querySelectorAll('.tr-chip');
    var grid = V.querySelector('.js-grid'), pkgs = V.querySelector('.js-pkgs');
    var filter = 'all', tier = 0, T = null;
    function fx(cls, apply, ms) {
      clearTimeout(T); root.classList.add(cls);
      T = setTimeout(function () { apply(); root.classList.remove(cls); }, ms);
    }
    function applyFilter() {
      chips.forEach(function (c) {
        var on = c.classList.contains('f-' + filter);
        c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      V.querySelectorAll('.tr-card').forEach(function (card) {
        var k = (card.className.match(/\bk-(\w+)/) || [])[1];
        card.classList.toggle('is-hidden', !(filter === 'all' || filter === k));
      });
      if (grid) grid.classList.toggle('tr-hide', filter === 'pkg');
      if (pkgs) pkgs.classList.toggle('tr-hide', !(filter === 'all' || filter === 'pkg'));
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var k = (c.className.match(/\bf-(\w+)/) || [])[1];
        if (!k || k === filter) return;
        fx('is-fading', function () { filter = k; applyFilter(); }, 280);
      });
    });
    var segs = V.querySelectorAll('.tr-seg button');
    segs.forEach(function (b, i) {
      b.addEventListener('click', function () {
        if (i === tier) return;
        fx('is-repricing', function () {
          tier = i;
          segs.forEach(function (s, j) { s.classList.toggle('is-on', j === tier); s.setAttribute('aria-pressed', j === tier ? 'true' : 'false'); });
          V.querySelectorAll('.px, .tl').forEach(function (p) { p.textContent = p.getAttribute('data-p' + tier); });
        }, 220);
      });
    });

    /* ---------- booking modal ---------- */
    var scrim = V.querySelector('.bk-scrim');
    if (!scrim) return;
    var forEl = scrim.querySelector('.bk-for');
    var links = scrim.querySelectorAll('a[href^="https://wa.me/"]');
    links.forEach(function (a) { a.setAttribute('data-base', a.getAttribute('href')); });
    function open(name) {
      forEl.textContent = name || 'Your visit';
      var msg = encodeURIComponent("Hi Kin Bali, I'd like to book " + (name || 'a treatment') + '.');
      links.forEach(function (a) { a.setAttribute('href', a.getAttribute('data-base') + '?text=' + msg); });
      scrim.classList.add('is-open');
    }
    function close() { scrim.classList.remove('is-open'); }
    V.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (!b) return;
      if (b.matches('[data-onclick="openBook"]')) return open('a treatment');
      if (b.matches('[data-onclick="t.book"]')) { var c = b.closest('.tr-card'); return open(c.querySelector('.tr-name').textContent.trim()); }
      if (b.matches('[data-onclick="o.book"]')) {
        var st = b.closest('.pc-stage'), it = b.closest('.pc-item');
        return open(st.querySelector('.pc-name').textContent.trim() + ' — ' + it.querySelector('.pc-line b').textContent.trim());
      }
      if (b.matches('[data-onclick="closeBook"]')) return close();
    });
    scrim.addEventListener('click', function (e) { if (e.target === scrim) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  });

  /* ---------- media helpers ---------- */
  function mediaGo(m, fromStart) {
    m._want = true;
    function start() {
      if (!m._want) return;
      if (fromStart) { try { m.currentTime = 0; } catch (x) {} }
      var p = m.play();
      if (p && p.catch) p.catch(function () { m.addEventListener('canplay', function () { if (m._want) { var q = m.play(); if (q && q.catch) q.catch(function () {}); } }, { once: true }); });
    }
    if (m.readyState >= 2) { start(); return; }
    m.addEventListener('canplay', start, { once: true });
    if (m.networkState === 0 || m.networkState === 3 || m.error) { try { m.load(); } catch (x) {} }
    start();
  }
  function sfx(n) { return document.querySelector('.tr-sfx[data-sfx="' + n + '"]'); }
  function sfxPlay(n) {
    var a = sfx(n); if (!a || KB.soundOn === false) return;
    var MAX = 0.63, IN = 0.7, OUT = 0.9;
    clearInterval(a._f); a.volume = 0;
    mediaGo(a, true);
    a._f = setInterval(function () {
      var t = a.currentTime || 0, d = a.duration || 6, v = MAX;
      if (t < IN) v = MAX * (t / IN);
      if (d - t < OUT) v = Math.min(v, MAX * Math.max(0, (d - t) / OUT));
      a.volume = Math.max(0, Math.min(1, v));
      if (a.ended || !a._want) clearInterval(a._f);
    }, 40);
  }
  function sfxStop(n) {
    var a = sfx(n); if (!a) return;
    a._want = false; clearInterval(a._f);
    a._f = setInterval(function () { if (a.volume > 0.05) a.volume = Math.max(0, a.volume - 0.05); else { a.volume = 0; a.pause(); clearInterval(a._f); } }, 40);
  }

  /* ---------- desktop: hover video + sound, once per hover ---------- */
  var cur = null;
  function enter(c) {
    var v = c.querySelector('.tr-vid'); if (!v) return;
    clearTimeout(v._t); v.classList.add('is-on');
    mediaGo(v, true);
    sfxPlay(c.getAttribute('data-num'));
    clearTimeout(c._wd);
    c._wd = setTimeout(function () {
      if (cur !== c) return;
      if (v.paused || v.currentTime < 0.05) { try { v.load(); } catch (x) {} mediaGo(v, true); }
    }, 500);
  }
  function leave(c) {
    var v = c.querySelector('.tr-vid'); clearTimeout(c._wd);
    if (v) { v._want = false; v.classList.remove('is-on'); clearTimeout(v._t); v._t = setTimeout(function () { v.pause(); }, 750); }
    sfxStop(c.getAttribute('data-num'));
  }
  function track(e) {
    if (mq.matches || PGT.hidden) return;
    var t = e.target && e.target.closest ? e.target.closest('#pg-tr .v-d .tr-card') : null;
    if (t === cur) return;
    if (cur) leave(cur);
    cur = t;
    if (t) enter(t);
  }
  document.addEventListener('mouseover', track);
  document.addEventListener('mousemove', track, { passive: true });
  document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && cur) { leave(cur); cur = null; } });

  /* ---------- mobile: play each video once when it scrolls into view ---------- */
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        var v = en.target;
        if (!mq.matches) return;
        if (en.intersectionRatio > 0.6) { if (!v._seen) { v._seen = true; v.classList.add('is-on'); mediaGo(v, true); } }
        else if (en.intersectionRatio < 0.1 && v._seen) { v._seen = false; v._want = false; v.classList.remove('is-on'); v.pause(); }
      });
    }, { threshold: [0, 0.1, 0.6, 1] });
    PGT.querySelectorAll('.v-m .tr-vid').forEach(function (v) { obs.observe(v); });
  }

  /* load hover media only when this page is on screen (desktop: videos + sounds, phone: videos) */
  function prime() {
    if (PGT.hidden) return;
    var sel = mq.matches ? '.v-m .tr-vid[data-src]' : '.v-d .tr-vid[data-src], .tr-sfx[data-src]';
    PGT.querySelectorAll(sel).forEach(function (m) { m.src = m.getAttribute('data-src'); m.removeAttribute('data-src'); try { m.load(); } catch (x) {} });
  }
  function hideAll() {
    if (cur) { leave(cur); cur = null; }
    PGT.querySelectorAll('.bk-scrim.is-open').forEach(function (s) { s.classList.remove('is-open'); });
  }
  (KB.hooks = KB.hooks || []).push(function (p) { if (p === 'treatments') prime(); else hideAll(); });
  mq.addEventListener ? mq.addEventListener('change', prime) : mq.addListener(prime);
  prime();
})();
