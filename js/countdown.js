/* ══════════════════════════════════
   COUNTDOWN.JS — Lógica Coming Soon
   ══════════════════════════════════ */

(function () {
  /* === FECHA DEL EVENTO — editar aquí === */
  var REAL_EVENT_DATE = new Date('2026-05-04T10:00:00');
  /* ======================================= */

  var overlay  = document.getElementById('coming-soon');
  var mainSite = document.getElementById('main-site');
  var daysEl   = document.getElementById('cs-days');
  var hoursEl  = document.getElementById('cs-hours');
  var minsEl   = document.getElementById('cs-mins');
  var secsEl   = document.getElementById('cs-secs');
  var devState = document.getElementById('dev-state');
  var devNow   = document.getElementById('dev-now');
  var devEvt   = document.getElementById('dev-event-date');

  var EVENT_DATE = new Date(REAL_EVENT_DATE);
  var timer;

  function pad(n) { return String(n).padStart(2, '0'); }
  function fmt(d) { return d.toLocaleString('es-CO', { dateStyle:'short', timeStyle:'short' }); }

  function showLanding() {
    overlay.style.display = 'none';
    mainSite.style.display = 'block';
    if (devState) devState.textContent = 'Landing ✓';
  }

  function showComing() {
    overlay.style.display = 'flex';
    mainSite.style.display = 'none';
    if (devState) devState.textContent = 'Coming Soon';
  }

  function tickEl(el, val) {
    if (!el || el.textContent === val) return;
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
    el.textContent = val;
    setTimeout(function(){ el.classList.remove('tick'); }, 200);
  }

  function update() {
    var now  = new Date();
    var diff = EVENT_DATE - now;
    if (devNow) devNow.textContent = fmt(now);

    if (diff <= 0) {
      showLanding();
      clearInterval(timer);
      return;
    }
    showComing();
    tickEl(daysEl,  pad(Math.floor(diff / 86400000)));
    tickEl(hoursEl, pad(Math.floor((diff % 86400000) / 3600000)));
    tickEl(minsEl,  pad(Math.floor((diff % 3600000)  / 60000)));
    tickEl(secsEl,  pad(Math.floor((diff % 60000)    / 1000)));
  }

  function startTimer() {
    clearInterval(timer);
    update();
    timer = setInterval(update, 1000);
  }

  startTimer();
  if (devEvt) devEvt.textContent = fmt(REAL_EVENT_DATE);

  /* -- DEV PANEL -- */
  var devToggle = document.getElementById('dev-toggle');
  var devBody   = document.getElementById('dev-body');
  var devInput  = document.getElementById('dev-date-input');

  if (devToggle) {
    devToggle.addEventListener('click', function(){ devBody.classList.toggle('open'); });
    var iso = new Date(REAL_EVENT_DATE.getTime() - REAL_EVENT_DATE.getTimezoneOffset()*60000).toISOString().slice(0,16);
    if (devInput) devInput.value = iso;

    document.getElementById('dev-show-cs').addEventListener('click', function() {
      EVENT_DATE = new Date(Date.now() + 9999999999999);
      startTimer();
    });
    document.getElementById('dev-show-landing').addEventListener('click', function() {
      EVENT_DATE = new Date(Date.now() - 1000);
      startTimer();
    });
    document.getElementById('dev-apply-date').addEventListener('click', function() {
      var val = devInput.value;
      if (!val) return;
      EVENT_DATE = new Date(val);
      startTimer();
    });
    document.getElementById('dev-reset-date').addEventListener('click', function() {
      EVENT_DATE = new Date(REAL_EVENT_DATE);
      startTimer();
    });
  }
})();
