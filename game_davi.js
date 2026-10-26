/* game_davi.js — Funda de Davi: Davi contra Golias no Vale de Elá (1 Sm 17:47) */
(() => {
'use strict';
const CFG = { speed0: 0.9, speedMul: 1.10, zone0: 0.24, zoneMul: 0.94, zoneMin: 0.05, lives: 3, pts: 10 };
const { PINK, GOLD } = Art;

Hub.defineGame('davi', {
  setup(g) {
    g.hud('Pontos 0', Hub.hearts(CFG.lives));
    return { lives: CFG.lives, score: 0, hits: 0, pos: 0, dir: 1, speed: CFG.speed0, zone: CFG.zone0, hp: 1, fallT: 0, hitT: 0, flash: 0, shots: [], msg: '', msgT: 0 };
  },
  press(s, p, g) {
    if (Math.abs(s.pos - 0.5) <= s.zone / 2) {                 // Zona Verde (dourada)
      g.sfx('hit'); s.score += CFG.pts; s.hits++;
      s.speed *= CFG.speedMul; s.zone = Math.max(CFG.zoneMin, s.zone * CFG.zoneMul);
      s.shots.push({ t: 0, from: s.pos }); s.msg = 'Perfect!'; s.msgT = 0.7; s.hitT = 0.3;
      if (!s.fallT) { s.hp -= 0.2; if (s.hp <= 0.01) { s.hp = 0; s.fallT = 1; s.score += 20; s.msg = 'Golias caiu! +20'; } }
    } else {
      g.sfx('miss'); g.shake(); s.lives--; s.flash = 0.4; s.msg = 'Errou!'; s.msgT = 0.6;
      if (s.lives <= 0) g.end(s.score, `${s.hits} pedradas certeiras`);
    }
    g.hud(`Pontos ${s.score}`, Hub.hearts(s.lives, CFG.lives));
  },
  update(s, dt) {
    if (!s.over) { s.pos += s.dir * s.speed * dt; if (s.pos >= 1) { s.pos = 1; s.dir = -1; } else if (s.pos <= 0) { s.pos = 0; s.dir = 1; } }
    if (s.fallT > 0) { s.fallT -= dt * 0.9; if (s.fallT <= 0) { s.fallT = 0; s.hp = 1; } }   // novo gigante
    s.hitT = Math.max(0, s.hitT - dt); s.flash = Math.max(0, s.flash - dt); s.msgT = Math.max(0, s.msgT - dt);
    s.shots.forEach(k => k.t += dt / 0.3); s.shots = s.shots.filter(k => k.t < 1);
  },
  draw(s, c, g) {
    const { W, H } = g, bx = W * 0.08, bw = W * 0.84, bh = Math.max(24, H * 0.045), by = H * 0.82, cx = W / 2, t = performance.now() / 1000;
    Art.bg(c, W, H, 'davi', t); Art.verse(c, W, H, 'davi', 0.17);
    const gh = Math.min(H * 0.46, W * 0.85), feet = H * 0.68, gx = cx + (s.hitT > 0 ? Math.sin(s.hitT * 80) * 8 : 0), gy = feet - gh * 0.55;
    c.save(); c.translate(gx, feet); c.rotate(s.fallT ? (1 - s.fallT) * -1.5 : 0);
    Art.figure(c, 'golias', { x: 0, y: 0, h: gh }); c.restore();
    Art.figure(c, 'davi', { x: W * 0.13, y: by - 8, h: H * 0.17, pose: 'throw' });
    c.fillStyle = '#2a1230'; c.fillRect(W * 0.25, H * 0.095 + 62, W * 0.5, 8);                    // vida do gigante
    c.shadowColor = PINK; c.shadowBlur = 10; c.fillStyle = PINK; c.fillRect(W * 0.25, H * 0.095 + 62, W * 0.5 * Math.max(0, s.hp), 8); c.shadowBlur = 0;
    c.fillStyle = '#0f0c16'; c.fillRect(bx, by, bw, bh);
    c.shadowColor = PINK; c.shadowBlur = 12; c.strokeStyle = PINK; c.lineWidth = 2; c.strokeRect(bx, by, bw, bh);
    const zw = s.zone * bw; c.shadowColor = GOLD; c.shadowBlur = 22; c.fillStyle = GOLD; c.fillRect(cx - zw / 2, by, zw, bh); c.shadowBlur = 0;
    c.shadowColor = '#fff'; c.shadowBlur = 16; c.fillStyle = '#ece6ff'; c.beginPath(); c.arc(bx + s.pos * bw, by + bh / 2, bh * 0.8, 0, 7); c.fill(); c.shadowBlur = 0;
    s.shots.forEach(k => { const x0 = bx + k.from * bw, x = x0 + (gx - x0) * k.t, y = by + (gy - by) * k.t; c.fillStyle = '#ddd'; c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill(); });
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if (s.msgT > 0) { c.globalAlpha = Math.min(1, s.msgT * 2); c.font = '34px "Kaushan Script", cursive'; c.shadowColor = PINK; c.shadowBlur = 14; c.fillStyle = s.msg === 'Errou!' ? PINK : GOLD; c.fillText(s.msg, cx, by - 48 - (0.7 - s.msgT) * 30); c.globalAlpha = 1; c.shadowBlur = 0; }
    if (s.flash > 0) { c.fillStyle = `rgba(255,45,149,${s.flash})`; c.fillRect(0, 0, W, H); }
    if (s.score === 0 && !s.over) { c.fillStyle = '#a99bb8'; c.font = '600 14px Sora, sans-serif'; c.fillText('Toque quando a pedra estiver na zona dourada', cx, by + bh + 34); }
  }
});
})();
