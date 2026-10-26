/* game_corrida.js — Corrida da Fé: Elias corre diante dos ídolos de Baal (1 Rs 18:46) */
(() => {
'use strict';
const CFG = { gravity: 1400, jump: -460, pw: 56, r: 16, rollValue: 5 };

Hub.defineGame('corrida', {
  setup(g) { g.hud('Pontos 0', 'Rolos 0'); return { y: g.H / 2, vy: 0, started: false, score: 0, rolls: 0, obs: [], spawn: 0, t: 0 }; },
  press(s, p, g) { s.started = true; s.vy = CFG.jump; g.sfx('tap'); },
  update(s, dt, g) {
    const { W, H } = g, cx = W * 0.25;
    if (!s.started) { s.y = H / 2 + Math.sin(performance.now() / 250) * 8; return; }
    s.vy += CFG.gravity * dt; s.y += s.vy * dt;
    if (s.over) { s.y = Math.min(s.y, H - CFG.r); return; }
    s.t += dt; const speed = Math.min(380, 190 + s.score * 3);
    s.spawn -= dt;
    if (s.spawn <= 0) {                                       // novo par de ídolos
      s.spawn = 340 / speed; const gap = Math.max(150, H * 0.3 - s.score * 2);
      s.obs.push({ x: W + 40, gap, gapY: gap / 2 + 70 + Math.random() * (H - gap - 140), passed: false, roll: Math.random() < 0.6 });
    }
    let dead = s.y < CFG.r || s.y > H - CFG.r;
    s.obs.forEach(o => {
      o.x -= speed * dt;
      if (Math.abs(cx - o.x) < CFG.pw / 2 + CFG.r * 0.8 && Math.abs(s.y - o.gapY) > o.gap / 2 - CFG.r * 0.8) dead = true;
      if (o.roll && Math.hypot(cx - o.x, s.y - o.gapY) < 32) { o.roll = false; s.rolls++; s.score += CFG.rollValue; g.sfx('hit'); }
      if (!o.passed && o.x + CFG.pw / 2 < cx) { o.passed = true; s.score++; }
    });
    s.obs = s.obs.filter(o => o.x > -CFG.pw);
    g.hud(`Pontos ${s.score}`, `Rolos ${s.rolls}`);
    if (dead) { g.sfx('miss'); g.shake(); g.end(s.score, `${s.rolls} rolos da Palavra coletados`); }
  },
  draw(s, c, g) {
    const { W, H } = g, cx = W * 0.25, now = performance.now() / 200;
    Art.bg(c, W, H, 'corrida', s.t); Art.verse(c, W, H, 'corrida', 0.17);
    s.obs.forEach(o => {
      Art.idol(c, o.x, -4, o.gapY - o.gap / 2, CFG.pw, true);
      Art.idol(c, o.x, o.gapY + o.gap / 2, H + 4, CFG.pw, false);
      if (o.roll) Art.scroll(c, o.x, o.gapY + Math.sin(now) * 4, 1.1);
    });
    c.save(); c.translate(cx, s.y); c.rotate(Math.max(-0.4, Math.min(0.5, s.vy / 900)));
    Art.figure(c, 'elias', { x: 0, y: 32, h: 64, pose: 'run', ph: s.t * 2.2 }); c.restore();
    if (!s.started) { c.fillStyle = '#fff'; c.shadowColor = Art.PINK; c.shadowBlur = 14; c.textAlign = 'center'; c.font = '30px "Kaushan Script", cursive'; c.fillText('Toque para correr!', W / 2, H * 0.72); c.shadowBlur = 0; }
  }
});
})();
