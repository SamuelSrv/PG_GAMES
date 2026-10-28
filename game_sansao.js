/* game_sansao.js — Força de Sansão: toque rápido para empurrar os pilares do templo de Dagom (Jz 16:28). Acerte os anéis dourados e entre em Fúria! */
(() => {
'use strict';
const { PINK, GOLD } = Art, fill = Hub.$('#force-fill');
Hub.registerGame('sansao', {
  endDelay: 1800,
  setup(g) {
    const dur = 10 + 1.5 * Hub.lvl('vigor') + (Hub.tier('sansao') >= 2 ? 2 : 0); g.hud(0, `${dur.toFixed(1)}s`); fill.style.height = '0%';
    return { started: false, time: dur, force: 0, score: 0, taps: 0, kick: 0, parts: [], cT: 0, dust: 0, surge: 0, surgeCd: 0, ring: null, ringCd: 1.2, rings: 0 };
  },
  press(s, p, g) {
    s.started = true; const k = Hub.tier('sansao') >= 3 ? 1.25 : 1, m = (s.surge > 0 ? 2 : 1) * k;
    s.force = Math.min(100, s.force + 3 * (1 + 0.15 * Hub.lvl('coragem') + 0.04 * Hub.lvl('foco'))); s.score += Math.round((1 + Math.floor(s.force / 34)) * m); s.taps++; s.kick = 1; g.sfx('tap'); g.shake();
    if (s.ring) { s.score += Math.round(12 * m); s.force = Math.min(100, s.force + 12); s.rings++; g.pop(s.ring.gold ? 'Anel de ouro!' : 'Acertou!', s.ring.x, s.ring.y, '#ffc94d'); if (s.ring.gold) g.coin(1, s.ring.x, s.ring.y - 24); Art.burst(s.parts, s.ring.x, s.ring.y, 16, GOLD, 240, 0.6); g.sfx('hit'); s.ring = null; }
    Art.burst(s.parts, g.W * 0.5 + (Math.random() - 0.5) * g.W * 0.7, g.H * 0.2, 4, '#b9a0c8', 60, 0.9, 200); g.hud(s.score, `${s.time.toFixed(1)}s`, s.surge > 0 ? 'FÚRIA!' : '');
  },
  update(s, dt, g) {
    const { W, H } = g;
    if (s.started && !s.over) {
      s.surge = Math.max(0, s.surge - dt); s.surgeCd = Math.max(0, s.surgeCd - dt);
      if (s.force >= 85 && s.surge <= 0 && s.surgeCd <= 0) { s.surge = 2.5; s.surgeCd = 6; g.sfx('win'); g.pop('FÚRIA!', W / 2, H * 0.3, '#ff2d95'); }
      s.force = Math.max(0, s.force - (s.surge > 0 ? 0 : 5 * (Hub.tier('sansao') >= 1 ? 0.6 : 1)) * dt); s.time = Math.max(0, s.time - dt);
      s.ringCd -= dt; if (s.ring) { s.ring.t -= dt; if (s.ring.t <= 0) s.ring = null; }
      if (!s.ring && s.ringCd <= 0) { const left = Math.random() < 0.5; s.ring = { x: W * (left ? 0.22 : 0.78), y: H * Hub.rand(0.38, 0.55), t: 1.05, max: 1.05, gold: Math.random() < 0.12 * (1 + 0.25 * Hub.lvl('sorte')) }; s.ringCd = Hub.rand(1.4, 2.4); }
      g.hud(s.score, `${s.time.toFixed(1)}s`, s.surge > 0 ? 'FÚRIA!' : '');
      if (s.time <= 0) { g.sfx('thud'); g.shake(); g.end(s.score, `${s.taps} toques · ${s.rings} anéis`); }
    }
    if (s.over) { s.cT += dt; s.dust -= dt; if (s.dust <= 0) { s.dust = 0.08; Art.burst(s.parts, Math.random() * W, H * 0.7, 8, '#b9a0c8', 220, 1, 120); } }
    else if (s.force > 40 && Math.random() < s.force / 400) Art.burst(s.parts, W * (0.15 + Math.random() * 0.7), H * 0.2, 1, '#b9a0c8', 30, 1, 160);
    s.kick = Math.max(0, s.kick - dt * 8); fill.style.height = s.force + '%'; Art.fxStep(s.parts, dt);
  },
  draw(s, c, g) {
    const { W, H } = g, ground = H * 0.8, ph = H * 0.62, pw = Math.min(58, W * 0.13), t = performance.now() / 1000, ang = (s.force / 100) * 0.3 + s.kick * 0.03 + (s.over ? Math.min(1.1, s.cT * 1.4) : 0);
    Art.bg(c, W, H, 'sansao', t); Art.verse(c, W, H, 'sansao', 0.14, 0.35);
    [-1, 1].forEach(side => { c.save(); c.translate(W / 2 + side * W * 0.34, ground + (s.over ? s.cT * s.cT * 40 : 0)); c.rotate(side * ang); Art.pillar(c, 0, -ph, 0, pw); c.restore(); });
    c.fillStyle = PINK; c.fillRect(0, ground, W, 4); c.fillStyle = '#0b0612'; c.fillRect(0, ground + 4, W, H);
    if (s.surge > 0) { c.fillStyle = `rgba(255,45,149,${0.12 + 0.08 * Math.sin(t * 20)})`; c.fillRect(0, 0, W, H); }
    Hub.player(c, { x: W / 2 + (Math.random() - 0.5) * s.force / 30, y: ground + 4, h: Math.min(H * 0.42, W * 0.7), pose: s.over ? 'up' : 'push', mood: 'strain' });
    if (s.ring) { const r = s.ring, k = r.t / r.max; c.strokeStyle = r.gold ? GOLD : '#fff'; c.lineWidth = 5; c.beginPath(); c.arc(r.x, r.y, 26, 0, 7); c.stroke(); c.strokeStyle = PINK; c.lineWidth = 3; c.beginPath(); c.arc(r.x, r.y, 26 + k * 26, 0, 7); c.stroke(); }
    Art.fxDraw(c, s.parts);
    if (!s.started) { c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '28px "Kaushan Script", cursive'; c.fillText('Toque rápido para começar!', W / 2, H * 0.9); c.font = '600 12px Sora, sans-serif'; c.fillStyle = '#a99bb8'; c.fillText('Toque quando aparecer um anel para ganhar bônus', W / 2, H * 0.9 + 22); }
  }
});
})();
