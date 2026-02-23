/* ══════════════════════════════════
   ANIMATIONS.JS — Fade-up + Aliados fireworks
   ══════════════════════════════════ */

/* ── SCROLL FADE IN ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ── ALIADOS FIREWORKS ── */
(function () {
  const canvas = document.getElementById('fw-canvas');
  const scene  = document.getElementById('aliados-scene');
  if (!canvas || !scene) return;
  const ctx    = canvas.getContext('2d');

  const PALETTE = ['#F2911B','#04BFBF','#037F8C','#ffd166','#06d6a0','#ef476f','#ffffff','#F2911B','#04BFBF'];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = scene.offsetWidth  * dpr;
    canvas.height = scene.offsetHeight * dpr;
    canvas.style.width  = scene.offsetWidth  + 'px';
    canvas.style.height = scene.offsetHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function rgba(hex, a) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  class Spark {
    constructor(x, y, color) {
      this.x = x; this.y = y;
      this.color = color;
      const angle = rand(0, Math.PI * 2);
      const spd   = rand(1.5, 7);
      this.vx = Math.cos(angle) * spd;
      this.vy = Math.sin(angle) * spd;
      this.life  = 1;
      this.decay = rand(0.012, 0.022);
      this.r     = rand(1.5, 3.5);
      this.grav  = rand(0.06, 0.12);
      this.trail = [];
    }
    update() {
      this.trail.push({x: this.x, y: this.y});
      if (this.trail.length > 7) this.trail.shift();
      this.vx *= 0.975;
      this.vy  = this.vy * 0.975 + this.grav;
      this.x  += this.vx;
      this.y  += this.vy;
      this.life -= this.decay;
    }
    draw() {
      for (let i = 0; i < this.trail.length; i++) {
        const p  = this.trail[i];
        const ta = (i / this.trail.length) * this.life * 0.35;
        const tr = this.r * (i / this.trail.length) * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, tr, 0, Math.PI*2);
        ctx.fillStyle = rgba(this.color, ta);
        ctx.fill();
      }
      ctx.shadowBlur   = 10;
      ctx.shadowColor  = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = rgba(this.color, this.life);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    dead() { return this.life <= 0; }
  }

  class Rocket {
    constructor(x, color) {
      this.x    = x;
      this.y    = canvas.height + 5;
      this.tx   = x + rand(-40, 40);
      this.ty   = rand(canvas.height * 0.08, canvas.height * 0.45);
      this.color = color;
      const dy  = this.ty - this.y;
      const dx  = this.tx - this.x;
      const spd = rand(10, 14);
      const dist = Math.sqrt(dx*dx + dy*dy);
      this.vx = (dx / dist) * spd;
      this.vy = (dy / dist) * spd;
      this.done  = false;
      this.trail = [];
    }
    update() {
      this.trail.push({x: this.x, y: this.y});
      if (this.trail.length > 14) this.trail.shift();
      this.vy += 0.18;
      this.x  += this.vx;
      this.y  += this.vy;
      if (this.vy >= -0.5 || this.y <= this.ty) this.done = true;
    }
    draw() {
      for (let i = 0; i < this.trail.length; i++) {
        const p = this.trail[i];
        const a = (i / this.trail.length) * 0.6;
        const r = 2 * (i / this.trail.length);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI*2);
        ctx.fillStyle = rgba(this.color, a);
        ctx.fill();
      }
      ctx.shadowBlur  = 18;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2.8, 0, Math.PI*2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    explode(sparks) {
      if (sparks.length > MAX_SPARKS) return;
      const n    = Math.floor(rand(80, 140));
      const type = Math.floor(rand(0, 5));
      for (let i = 0; i < n; i++) {
        const s = new Spark(this.x, this.y, Math.random() < 0.2 ? '#ffffff' : this.color);
        if (type === 1) {
          const base = (i / n) * Math.PI * 2;
          const spd  = i % 2 === 0 ? rand(5,9) : rand(1,3);
          s.vx = Math.cos(base) * spd;
          s.vy = Math.sin(base) * spd;
        } else if (type === 2) {
          const base = (i / n) * Math.PI * 2;
          const spd  = rand(4, 6);
          s.vx = Math.cos(base) * spd;
          s.vy = Math.sin(base) * spd;
        } else if (type === 3) {
          const base = (i / n) * Math.PI * 2;
          const spd  = i % 2 === 0 ? rand(3,4.5) : rand(6,8);
          s.vx = Math.cos(base) * spd;
          s.vy = Math.sin(base) * spd;
        } else if (type === 4) {
          const base = (i / n) * Math.PI * 2;
          const spd  = rand(5, 8);
          s.vx = Math.cos(base) * spd;
          s.vy = Math.sin(base) * spd;
          s.color = '#F2911B';
        }
        sparks.push(s);
      }
      for (let i = 0; i < 15; i++) {
        const s = new Spark(this.x, this.y, '#fff');
        s.vx = rand(-1.5, 1.5);
        s.vy = rand(-1.5, 1.5);
        s.decay = rand(0.03, 0.06);
        s.grav  = 0.01;
        sparks.push(s);
      }
    }
  }

  const MAX_SPARKS = 1200;
  let rockets = [], sparks = [];

  function launch(x) {
    rockets.push(new Rocket(x ?? rand(80, canvas.width - 80), pick(PALETTE)));
  }

  document.querySelectorAll('.al-card').forEach(card => {
    card.addEventListener('click', () => {
      const rect = card.getBoundingClientRect();
      const srect = scene.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2 - srect.left;
      launch(cx);
      launch(cx + rand(-60, 60));
      card.classList.add('fired');
      setTimeout(() => card.classList.remove('fired'), 600);
    });
  });

  setInterval(() => launch(), 2200);
  setTimeout(() => { launch(); launch(rand(100, canvas.width - 100)); }, 600);

  function tick() {
    requestAnimationFrame(tick);
    ctx.fillStyle = 'rgba(5,8,16,0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = rockets.length - 1; i >= 0; i--) {
      rockets[i].update();
      rockets[i].draw();
      if (rockets[i].done) {
        rockets[i].explode(sparks);
        rockets.splice(i, 1);
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      sparks[i].update();
      sparks[i].draw();
      if (sparks[i].dead()) sparks.splice(i, 1);
    }
  }

  tick();
})();
