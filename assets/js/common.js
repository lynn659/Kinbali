/* Kin Bali Massage — shared: page transition, background music, footer WhatsApp */
(function () {
  'use strict';
  /* ---------- page switching without reload (music keeps playing) ---------- */
  var KB = window.KB = window.KB || {};
  KB.hooks = [];
  var veil = document.querySelector('.pt-veil');
  var PG = { home: document.getElementById('pg-home'), treatments: document.getElementById('pg-tr') };
  function pageOf(url) { return /treatments(\.html)?$/i.test(url.pathname) ? 'treatments' : 'home'; }
  function current() { return PG.treatments && !PG.treatments.hidden ? 'treatments' : 'home'; }
  KB.page = current;
  function idle() { if (veil) { veil.classList.remove('is-leaving'); veil.classList.add('is-idle'); } }
  setTimeout(idle, 650);
  window.addEventListener('pageshow', function (e) { if (e.persisted) idle(); });
  function scrollTarget(hash) {
    var el = hash && document.getElementById(hash.slice(1));
    window.scrollTo(0, el && !/top$/.test(hash) ? el.getBoundingClientRect().top + window.scrollY : 0);
  }
  function show(name, hash) {
    Object.keys(PG).forEach(function (k) { if (PG[k]) PG[k].hidden = k !== name; });
    document.title = PG[name].getAttribute('data-title');
    var se = document.documentElement.style.scrollBehavior; document.documentElement.style.scrollBehavior = 'auto';
    scrollTarget(hash);
    document.documentElement.style.scrollBehavior = se;
    KB.hooks.forEach(function (f) { try { f(name); } catch (x) {} });
  }
  function go(url, push) {
    var name = pageOf(url);
    if (name === current()) {
      if (push) history.pushState({ p: name }, '', url.href);
      if (url.hash) { var el = document.getElementById(url.hash.slice(1)); if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; } }
      window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    if (KB.closeMenu) KB.closeMenu();
    if (veil) { veil.classList.remove('is-idle'); veil.classList.add('is-leaving'); }
    setTimeout(function () {
      if (push) history.pushState({ p: name }, '', url.href);
      show(name, url.hash);
      setTimeout(idle, 250);
    }, 600);
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.target === '_blank') return;
    var h = a.getAttribute('href');
    if (!/^(index|treatments)\.html/.test(h)) return;
    e.preventDefault(); e.stopPropagation();
    go(new URL(a.href), true);
  }, true);
  window.addEventListener('popstate', function () { go(new URL(location.href), false); });

  /* ---------- background music ---------- */
  var audio = document.getElementById('bgm');
  KB.soundOn = true; KB.playing = false;
  var armed = false, EVTS = ['pointerdown', 'mousedown', 'click', 'keydown', 'touchend'];
  function setUI() {
    document.querySelectorAll('.snd-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', KB.soundOn ? 'true' : 'false');
      b.setAttribute('aria-label', KB.soundOn ? 'Mute background music' : 'Play background music');
    });
  }
  function unlock(e) {
    if (e && e.target && e.target.closest && e.target.closest('.snd-btn')) return;
    disarm(); start();
  }
  function arm() { if (armed) return; armed = true; EVTS.forEach(function (t) { window.addEventListener(t, unlock, true); }); }
  function disarm() { if (!armed) return; armed = false; EVTS.forEach(function (t) { window.removeEventListener(t, unlock, true); }); }
  function start() {
    if (!audio || !KB.soundOn) return;
    audio.volume = 0.45;
    if (audio.error || audio.networkState === 3) { try { audio.load(); } catch (x) {} }
    var p = audio.play();
    if (p && p.then) p.then(function () { KB.playing = true; disarm(); }).catch(arm);
  }
  document.querySelectorAll('.snd-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      if (KB.soundOn && KB.playing) { audio.pause(); KB.playing = false; KB.soundOn = false; disarm(); }
      else { KB.soundOn = true; start(); }
      setUI();
    });
  });
  setUI(); start();

  /* ---------- footer WhatsApp: outlet chooser ---------- */
  document.querySelectorAll('.wa-wrap').forEach(function (w) {
    var b = w.querySelector('.wa-trigger');
    b.addEventListener('click', function () {
      var open = !w.classList.contains('is-open');
      w.classList.toggle('is-open', open); b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  function closeWa() { document.querySelectorAll('.wa-wrap.is-open').forEach(function (w) { w.classList.remove('is-open'); w.querySelector('.wa-trigger').setAttribute('aria-expanded', 'false'); }); }
  document.addEventListener('pointerdown', function (e) { if (!(e.target.closest && e.target.closest('.wa-wrap'))) closeWa(); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeWa(); });
})();
