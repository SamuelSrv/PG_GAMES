/* game_sansao.js — Força de Sansão: o personagem escolhido empurra os pilares do templo de Dagom (Jz 16:28) */
(() => {
'use strict';
const CFG = { duration: 10, gain: 3, drainPerSec: 5 };
const fill = Hub.$('#force-fill'), { PINK } = Art;

Hub.defineGame('sansao', {
  endDelay: 1700,                                                                      // tempo para ver o templo desabar
  setup(g) { const dur = CFG.duration + Hub.lvl('fe'); g.hud('Pontos 0', `${dur.toFixed(1)}s`); fill.style.height = '0%'; return { started: false, time: dur, force: 0, score: 0, taps: 0, kick: 0, parts: [], cT: 0, dust: 0 }; },
  press(s, p, g) {
    s.started = true;                                  // o cronômetro começa no primeiro toque
    s.force = Math.min(100, s.force + CFG.gain * (1 + 0.15 * Hub.lvl('coragem')));
    s.score += 1 + Math.floor(s.force / 34);           // bônus por manter a força alta
    s.taps++; s.kick = 1; if (s.taps % 6 === 0) g.coin(1, g.W / 2, g.H * 0.5); g.sfx('tap'); g.shake(); g.hud(`Pontos ${s.score}`, `${s.time.toFixed(1)}s`);
    Art.burst(s.parts, g.W * 0.5 + (Math.random() - 0.5) * g.W * 0.7, g.H * 0.2, 4, '#b9a0c8', 60, 0.9, 200);   // poeira cai do teto
  },
  update(s, dt, g) {
    const { W, H } = g;
    if (s.started && !s.over) {
      s.force = Math.max(0, s.force - CFG.drainPerSec * (Hub.has('cinto') ? 0.6 : 1) * dt);   // esvazia 5% por segundo
      s.time = Math.max(0, s.time - dt); g.hud(`Pontos ${s.score}`, `${s.time.toFixed(1)}s`);
      if (s.time <= 0) { g.sfx('thud'); g.shake(); g.end(s.score, `${s.taps} toques`); }
    }
    if (s.over) { s.cT += dt; s.dust -= dt; if (s.dust <= 0) { s.dust = 0.08; Art.burst(s.parts, Math.random() * W, H * 0.7, 8, '#b9a0c8', 220, 1, 120); } }   // desabamento
    else if (s.force > 40 && Math.random() < s.force / 400) Art.burst(s.parts, W * (0.15 + Math.random() * 0.7), H * 0.2, 1, '#b9a0c8', 30, 1, 160);
    s.kick = Math.max(0, s.kick - dt * 8); fill.style.height = s.force + '%'; Art.fxStep(s.parts, dt);
  },
  draw(s, c, g) {
    const { W, H } = g, ground = H * 0.8, ph = H * 0.62, pw = Math.min(58, W * 0.13), t = performance.now() / 1000;
    const ang = (s.force / 100) * 0.3 + s.kick * 0.03 + (s.over ? Math.min(1.1, s.cT * 1.4) : 0);   // os pilares se afastam com a força e desabam no fim
    Art.bg(c, W, H, 'sansao', t); Art.verse(c, W, H, 'sansao', 0.14);
    [-1, 1].forEach(side => { c.save(); c.translate(W / 2 + side * W * 0.34, ground + (s.over ? s.cT * s.cT * 40 : 0)); c.rotate(side * ang); Art.pillar(c, 0, -ph, 0, pw); c.restore(); });
    c.shadowColor = PINK; c.shadowBlur = 14; c.fillStyle = PINK; c.fillRect(0, ground, W, 4); c.shadowBlur = 0;
    c.fillStyle = '#0b0612'; c.fillRect(0, ground + 4, W, H);
    Hub.player(c, { x: W / 2 + (Math.random() - 0.5) * s.force / 30, y: ground + 4, h: Math.min(H * 0.42, W * 0.7), pose: s.over ? 'up' : 'push', mood: 'strain', prop: null });
    Art.fxDraw(c, s.parts);
    if (!s.started) { c.fillStyle = '#fff'; c.shadowColor = PINK; c.shadowBlur = 14; c.textAlign = 'center'; c.font = '28px "Kaushan Script", cursive'; c.fillText('Toque rápido para começar!', W / 2, H * 0.9); c.shadowBlur = 0; }
  }
});
})();
