/* ══════════════════════════════════
   PROYECTOS.JS — Tabs de categorías
   ══════════════════════════════════ */

function showCat(cat, el) {
  document.querySelectorAll('.categoria-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('cat-' + cat).classList.add('active');
  el.classList.add('active');
}
