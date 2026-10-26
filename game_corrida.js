/* game_corrida.js — Corrida da Fé: o personagem escolhido corre diante dos ídolos de Baal (1 Rs 18:46) */
(() => {
'use strict';
const CFG = { gravity: 1400, jump: -460, pw: 56, r: 16, rollValue: 5 };
const { PINK, GOLD } = Art;

Hub.defineGame('corrida', {
  endDelay: 900,
  setup(g) { g.hud('Pontos 0', 'Rolos 0'); return { y: g.H / 2, vy: 0, started: false, score: 0, rolls: 0, obs: [], spawn: 0, t: 0, parts: [], spin: 0, trail: 0 }; },
  press(s, p, g) { s.started = true; s.vy = CFG.jump; g.sfx('tap'); Art.burst(s.parts, g.W * 0.25, s.y + 26, 8, PINK, 120, 0.4, 300); },
  update(s, dt, g) {
    const { W, H } = g, cx = W * 0.25;
    Art.fxStep(s.parts, dt);
    if (s.over) { s.spin += dt * 7; s.vy += CFG.gravity * dt; s.y = Math.min(s.y + s.vy * dt, H - CFG.r); return; }
    if (!s.started) { s.y = H / 2 + Math.sin(performance.now() / 250) * 8; return; }
    s.vy += CFG.gravity * dt; s.y += s.vy * dt; s.t += dt;
    const speed = Math.min(380, 190 + s.score * 3);
    s.trail -= dt; if (s.trail <= 0) { s.trail = 0.03; s.parts.push({ x: cx - 12, y: s.y + 8, vx: -120, vy: 0, g: 0, life: 0.35, max: 0.35, col: PINK, r: 3 }); }   // rastro neon
    s.spawn -= dt;
    if (s.spawn <= 0) {                                       // novo par de ídolos
      s.spawn = 340 / speed; const gap = Math.max(150, H * 0.3 - s.score * 2);
      s.obs.push({ x: W + 40, gap, gapY: gap / 2 + 70 + Math.random() * (H - gap - 140), passed: false, roll: Math.random() < 0.6 });
    }
    let dead = s.y < CFG.r || s.y > H - CFG.r;
    s.obs.forEach(o => {
      o.x -= speed * dt;
      if (Math.abs(cx - o.x) < CFG.pw / 2 + CFG.r * 0.8 && Math.abs(s.y - o.gapY) > o.gap / 2 - CFG.r * 0.8) dead = true;
      if (o.roll && Math.hypot(cx - o.x, s.y - o.gapY) < 34) { o.roll = false; s.rolls++; s.score += CFG.rollValue; g.sfx('hit'); Art.burst(s.parts, o.x, o.gapY, 16, GOLD, 220, 0.6, 200); }
      if (!o.passed && o.x + CFG.pw / 2 < cx) { o.passed = true; s.score++; }
    });
    s.obs = s.obs.filter(o => o.x > -CFG.pw);
    g.hud(`Pontos ${s.score}`, `Rolos ${s.rolls}`);
    if (dead) { g.sfx('miss'); g.shake(); Art.burst(s.parts, cx, s.y, 30, PINK, 320, 0.8); Art.burst(s.parts, cx, s.y, 12, GOLD, 240, 0.8); g.end(s.score, `${s.rolls} rolos da Palavra coletados`); }
  },
  draw(s, c, g) {
    const { W, H } = g, cx = W * 0.25, now = performance.now() / 200;
    Art.bg(c, W, H, 'corrida', s.t); Art.verse(c, W, H, 'corrida', 0.17);
    c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1.5;                                  // linhas de velocidade
    for (let i = 0; i < 8; i++) { const y = (i * 97) % H, x = (((i * 173 - s.t * 420) % W) + W) % W; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 46, y); c.stroke(); }
    s.obs.forEach(o => {
      Art.idol(c, o.x, -4, o.gapY - o.gap / 2, CFG.pw, true);
      Art.idol(c, o.x, o.gapY + o.gap / 2, H + 4, CFG.pw, false);
      if (o.roll) Art.scroll(c, o.x, o.gapY + Math.sin(now) * 4, 1.1);
    });
    Art.fxDraw(c, s.parts);
    c.save(); c.translate(cx, s.y); c.rotate(s.over ? s.spin : Math.max(-0.4, Math.min(0.5, s.vy / 900)));
    Hub.player(c, { x: 0, y: 34, h: 70, pose: 'run', ph: s.t * 2.2 }); c.restore();
    if (!s.started) { c.fillStyle = '#fff'; c.shadowColor = PINK; c.shadowBlur = 14; c.textAlign = 'center'; c.font = '30px "Kaushan Script", cursive'; c.fillText('Toque para correr!', W / 2, H * 0.72); c.shadowBlur = 0; }
  }
});
})();
