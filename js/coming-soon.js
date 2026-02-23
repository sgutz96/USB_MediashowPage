/* ══════════════════════════════════
   COMING-SOON.JS — Canvas partículas
   ══════════════════════════════════ */

(function () {
  var csCanvas = document.getElementById('cs-canvas');
  if (!csCanvas) return;
  var ctx = csCanvas.getContext('2d');
  var W, H, pts = [];
  function csResize() { W = csCanvas.width = window.innerWidth; H = csCanvas.height = window.innerHeight; }
  csResize();
  window.addEventListener('resize', csResize);
  for (var i = 0; i < 90; i++) {
    pts.push({ x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
      r: Math.random()*1.5+.5, c: Math.random()<.5 ? '#F2911B' : '#04BFBF', a: Math.random()*.4+.1 });
  }
  (function csFrame() {
    requestAnimationFrame(csFrame);
    ctx.clearRect(0, 0, W, H);
    pts.forEach(function(p, i) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.c + Math.floor(p.a*255).toString(16).padStart(2,'0');
      ctx.fill();
      for (var j = i+1; j < pts.length; j++) {
        var q = pts[j], dx = p.x-q.x, dy = p.y-q.y, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 130) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
          ctx.strokeStyle = 'rgba(4,191,191,'+(1-d/130)*.12+')'; ctx.lineWidth = .6; ctx.stroke(); }
      }
    });
  })();
})();
