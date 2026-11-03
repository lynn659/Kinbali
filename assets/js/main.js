/* Kin Bali Massage — site interactions (vanilla JS, no dependencies) */
(function () {
  'use strict';
  var root = document.documentElement;
  var D = document.querySelector('.v-d');
  var M = document.querySelector('.v-m');
  var mq = window.matchMedia('(max-width: 820px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var K = reduce ? 0 : 1; // parallax strength

  function isMobile() { return mq.matches; }
  function view() { return isMobile() ? M : D; }

  /* ---------- hero video: load only the visible one ---------- */
  function syncVideo() {
    [D, M].forEach(function (v) {
      var vid = v.querySelector('video[data-src]');
      if (!vid) return;
      if (v === view()) {
        if (!vid.src) vid.src = vid.getAttribute('data-src');
        var p = vid.play(); if (p && p.catch) p.catch(function () {});
      } else if (vid.src) { vid.pause(); }
    });
  }

  /* ---------- background music ---------- */
  var audio = document.getElementById('bgm');
  var soundOn = true, playing = false, armed = false;
  function setSoundUI() {
    document.querySelectorAll('.snd-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
      b.setAttribute('aria-label', soundOn ? 'Mute background music' : 'Play background music');
    });
  }
  function unlock(e) {
    if (e && e.target && e.target.closest && e.target.closest('.snd-btn')) return;
    disarm(); startAudio();
  }
  function arm() { if (armed) return; armed = true; ['pointerdown', 'keydown', 'touchend'].forEach(function (t) { window.addEventListener(t, unlock, true); }); }
  function disarm() { if (!armed) return; armed = false; ['pointerdown', 'keydown', 'touchend'].forEach(function (t) { window.removeEventListener(t, unlock, true); }); }
  function startAudio() {
    if (!audio || !soundOn) return;
    audio.volume = 0.45;
    var p = audio.play();
    if (p && p.then) p.then(function () { playing = true; disarm(); }).catch(arm);
  }
  document.querySelectorAll('.snd-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      if (soundOn && playing) { audio.pause(); playing = false; soundOn = false; disarm(); }
      else { soundOn = true; startAudio(); }
      setSoundUI();
    });
  });

  /* ---------- scroll effects ---------- */
  var seen = {};
  var lastY = 0, navHidden = false;
  function q(sel) { return view().querySelector(sel); }
  function rel(el) {
    if (!el) return 0;
    var vh = window.innerHeight || 800, r = el.getBoundingClientRect();
    return (r.top + r.height / 2 - vh / 2) / vh;
  }
  function px(n) { return 'translate3d(0,' + Math.round(n * K) + 'px,0)'; }
  function setVar(n, v) { root.style.setProperty('--' + n, v); }

  function measure() {
    var y = window.scrollY || 0, vh = window.innerHeight || 800, mob = isMobile();
    var story = rel(q('[data-ref="storyRef"]')), member = rel(q('[data-ref="memberRef"]'));
    // reveal-on-scroll
    [['treat', 'treatRef'], ['story', 'storyRef'], ['outlet', 'outletRef'], ['member', 'memberRef']].forEach(function (p) {
      var el = q('[data-ref="' + p[1] + '"]');
      if (el && el.getBoundingClientRect().top < vh * (mob ? 0.88 : 0.86)) {
        view().querySelectorAll('.js-in-' + p[0]).forEach(function (n) { n.classList.add('is-in'); });
      }
    });
    if (mob) {
      setVar('heroPhotoShift', px(y * 0.35));
      setVar('heroTextShift', px(y * 0.12));
      setVar('heroTextFade', Math.max(0, 1 - y / 420));
      setVar('storyPhotoShift', px(Math.min(0, story * -40)));
      setVar('storyBgShift', px(story * -60));
      setVar('glowShift', 'translate3d(' + Math.round(member * -90 * K) + 'px,' + Math.round(member * 60 * K) + 'px,0)');
      if (y <= 120 || y < lastY - 6) navHidden = false; else if (y > lastY + 6) navHidden = true;
      var h = M.querySelector('.m-header');
      h.classList.toggle('is-solid', y > 200); h.classList.toggle('is-clear', y <= 200);
      h.classList.toggle('is-hidden', navHidden && !menuOpen);
    } else {
      setVar('heroVideoShift', px(y * 0.3));
      setVar('heroTextShift', px(y * -0.12));
      setVar('heroTextFade', Math.max(0, 1 - y / 560));
      setVar('storyPhotoShift', px(Math.min(0, story * -60)));
      setVar('storyBgShift', px(story * -90));
      setVar('glowShift', 'translate3d(' + Math.round(member * -160 * K) + 'px,' + Math.round(member * 80 * K) + 'px,0)');
      var hd = D.querySelector('.site-header');
      hd.classList.toggle('is-solid', y > 200); hd.classList.toggle('is-clear', y <= 200);
    }
    lastY = y;
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; measure(); });
  }, { passive: true });
  window.addEventListener('resize', function () { measure(); });
  mq.addEventListener ? mq.addEventListener('change', function () { syncVideo(); measure(); }) : mq.addListener(function () { syncVideo(); measure(); });

  /* ---------- coverflow (treatments) ---------- */
  function Coverflow(box, hiddenOver, hoverPause) {
    var items = Array.prototype.slice.call(box.querySelectorAll('.cf-item'));
    var segs = Array.prototype.slice.call(box.parentNode.querySelectorAll('.acc-seg'));
    var n = items.length, active = 0, tick = 0, hovering = false, timer = null, touchX = null;
    function render() {
      items.forEach(function (it, j) {
        var d = (j - active + n) % n; if (d > 4) d -= n;
        it.className = it.className.replace(/\s?\b(p\d|m\d)\b/g, '') + ' ' + (d === 0 ? 'p0' : (d > 0 ? 'p' + d : 'm' + (-d)));
        it.setAttribute('aria-hidden', Math.abs(d) > hiddenOver ? 'true' : 'false');
        it._d = d;
        var hit = it.querySelector('.cf-hit');
        if (hit) hit.setAttribute('tabindex', Math.abs(d) >= 1 && Math.abs(d) <= hiddenOver ? '0' : '-1');
      });
      var real = active % 3;
      segs.forEach(function (s, i) {
        var on = real === i;
        s.classList.toggle('is-on', on);
        s.setAttribute('aria-selected', on ? 'true' : 'false');
        var f = s.querySelector('.acc-fill');
        f.classList.remove('run-a', 'run-b', 'full');
        if (on) f.classList.add(hovering ? 'full' : (tick % 2 ? 'run-a' : 'run-b'));
      });
    }
    function schedule() { clearTimeout(timer); if (hovering) return; timer = setTimeout(function () { shift(1); }, 7000); }
    function shift(d) { active = (active + d + n) % n; tick++; hovering = false; render(); schedule(); }
    items.forEach(function (it) {
      var hit = it.querySelector('.cf-hit');
      if (hit) hit.addEventListener('click', function () { shift(it._d); });
      if (hoverPause) {
        it.addEventListener('mouseenter', function () { if (it._d === 0) { clearTimeout(timer); if (!hovering) { hovering = true; render(); } } });
        it.addEventListener('mouseleave', function () { if (hovering) { hovering = false; tick++; render(); schedule(); } });
      }
    });
    segs.forEach(function (s, i) {
      s.addEventListener('click', function () { var d = i - active % 3; if (d > 1) d -= 3; if (d < -1) d += 3; shift(d); });
    });
    box.addEventListener('touchstart', function (e) { touchX = e.touches && e.touches[0] ? e.touches[0].clientX : null; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (touchX == null || !e.changedTouches || !e.changedTouches[0]) return;
      var dx = e.changedTouches[0].clientX - touchX; touchX = null;
      if (Math.abs(dx) > 40) shift(dx < 0 ? 1 : -1);
    });
    render(); schedule();
  }
  var dcf = D.querySelector('.cf'); if (dcf) Coverflow(dcf, 2, true);
  var mcf = M.querySelector('.cf'); if (mcf) Coverflow(mcf, 1, false);

  /* ---------- mobile menu ---------- */
  var menu = M.querySelector('.m-menu'), menuOpen = false;
  var menuBtn = M.querySelector('[data-onclick="openMenu"]');
  function setMenu(open) {
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    measure();
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(true); });
  M.querySelectorAll('.m-menu [aria-label="Close menu"]').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false); });

  /* ---------- mobile outlets accordion ---------- */
  M.querySelectorAll('.mo-row').forEach(function (row) {
    var b = row.querySelector('.mo-toggle');
    b.addEventListener('click', function () {
      var open = !row.classList.contains('is-open');
      M.querySelectorAll('.mo-row').forEach(function (r) { r.classList.remove('is-open'); r.querySelector('.mo-toggle').setAttribute('aria-expanded', 'false'); });
      if (open) { row.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- in-page links: smooth scroll ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    var top = (id === 'top' || id === 'm-top') ? 0 : el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
  });

  setSoundUI();
  syncVideo();
  measure();
  setTimeout(measure, 60);
  startAudio();
})();
