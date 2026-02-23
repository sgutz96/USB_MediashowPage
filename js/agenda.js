/* ══════════════════════════════════
   AGENDA.JS — Tabs de días
   ══════════════════════════════════ */

function showDay(day, el) {
  document.getElementById('agenda-day1').style.display = day === 1 ? 'block' : 'none';
  document.getElementById('agenda-day2').style.display = day === 2 ? 'block' : 'none';
  document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}
