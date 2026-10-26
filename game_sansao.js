/* game_sansao.js — Força de Sansão: o templo de Dagom (Jz 16:28) */
(() => {
'use strict';
const CFG = { duration: 10, gain: 3, drainPerSec: 5 };
const fill = Hub.$('#force-fill');

Hub.defineGame('sansao', {
  setup(g) { g.hud('Pontos 0', `${CFG.duration.toFixed(1)}s`); fill.style.height = '0%'; return { started: false, time: CFG.duration, force: 0, score: 0, taps: 0, kick: 0 }; },
  press(s, p, g) {
    s.started = true;                                  // o cronômetro começa no primeiro toque
    s.force = Math.min(100, s.force + CFG.gain);
    s.score += 1 + Math.floor(s.force / 34);           // bônus por manter a força alta
    s.taps++; s.kick = 1; g.sfx('tap'); g.shake(); g.hud(`Pontos ${s.score}`, `${s.time.toFixed(1)}s`);
  },
  update(s, dt, g) {
    if (s.started && !s.over) {
      s.force = Math.max(0, s.force - CFG.drainPerSec * dt);   // esvazia 5% por segundo
      s.time = Math.max(0, s.time - dt); g.hud(`Pontos ${s.score}`, `${s.time.toFixed(1)}s`);
      if (s.time <= 0) g.end(s.score, `${s.taps} toques`);
    }
    s.kick = Math.max(0, s.kick - dt * 8); fill.style.height = s.force + '%';
  },
  draw(s, c, g) {
    const { W, H } = g, ground = H * 0.8, ph = H * 0.62, pw = Math.min(58, W * 0.13), t = performance.now() / 1000;
    const ang = (s.force / 100) * 0.3 + s.kick * 0.03;         // os pilares se afastam com a força
    Art.bg(c, W, H, 'sansao', t); Art.verse(c, W, H, 'sansao', 0.14);
    [-1, 1].forEach(side => { c.save(); c.translate(W / 2 + side * W * 0.34, ground); c.rotate(side * ang); Art.pillar(c, 0, -ph, 0, pw); c.restore(); });
    c.shadowColor = Art.PINK; c.shadowBlur = 14; c.fillStyle = Art.PINK; c.fillRect(0, ground, W, 4); c.shadowBlur = 0;
    c.fillStyle = '#0b0612'; c.fillRect(0, ground + 4, W, H);
    Art.figure(c, 'sansao', { x: W / 2 + (Math.random() - 0.5) * s.force / 30, y: ground + 4, h: Math.min(H * 0.42, W * 0.7), pose: 'push' });
    if (!s.started) { c.fillStyle = '#fff'; c.shadowColor = Art.PINK; c.shadowBlur = 14; c.textAlign = 'center'; c.font = '28px "Kaushan Script", cursive'; c.fillText('Toque rápido para começar!', W / 2, H * 0.9); c.shadowBlur = 0; }
  }
});
})();
