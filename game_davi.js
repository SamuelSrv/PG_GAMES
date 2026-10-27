/* game_davi.js — Funda de Davi: o personagem escolhido enfrenta Golias no Vale de Elá (1 Sm 17:47) */
(() => {
'use strict';
const CFG = { speed0: 0.9, speedMul: 1.10, zone0: 0.24, zoneMul: 0.94, zoneMin: 0.05, lives: 3, pts: 10 };
const { PINK, GOLD } = Art;
const lay = g => { const { W, H } = g, by = H * 0.82, feet = H * 0.68, gh = Math.min(H * 0.46, W * 0.85);
  return { W, H, bx: W * 0.08, bw: W * 0.84, bh: Math.max(24, H * 0.045), by, cx: W / 2, feet, gh, gx: W / 2, gy: feet - gh * 0.55, dx: W * 0.15, dh: H * 0.2, dfeet: by - 10 }; };
const hand = (L, a) => { const k = L.dh / 100; return [L.dx + (12 + Math.sin(a) * 23) * k, L.dfeet + (-56 + Math.cos(a) * 23) * k]; };

Hub.defineGame('davi', {
  setup(g) {
    const ml = CFG.lives + Hub.lvl('fe'); g.hud('Pontos 0', Hub.hearts(ml));
    return { lives: ml, maxLives: ml, score: 0, hits: 0, pos: 0, dir: 1, speed: CFG.speed0 * (1 - 0.07 * Hub.lvl('coragem')), zone: CFG.zone0, hp: 1, fallT: 0, hitT: 0, flash: 0, shots: [], msg: '', msgT: 0, parts: [], spin: 0, throwT: -1 };
  },
  press(s, p, g) {
    const hit = Math.abs(s.pos - 0.5) <= s.zone / 2; let kill = false;
    g.sfx('whoosh'); s.throwT = 0;                                                      // Davi gira a funda e arremessa
    if (hit) {
      s.score += CFG.pts; s.hits++; g.coin(2, g.W / 2, g.H * 0.45); s.speed *= CFG.speedMul; s.zone = Math.max(Hub.has('pedra') ? 0.09 : CFG.zoneMin, s.zone * CFG.zoneMul); s.msg = 'Perfect!'; s.msgT = 0.7;
      if (!s.fallT) { s.hp -= 0.2; if (s.hp <= 0.01) { s.hp = 0; s.fallT = 1; s.score += 20; s.msg = 'Golias caiu! +20'; kill = true; g.coin(10, g.W / 2, g.H * 0.35); } }
    } else {
      g.sfx('miss'); g.shake(); s.lives--; s.flash = 0.4; s.msg = 'Errou!'; s.msgT = 0.6;
      if (s.lives <= 0) g.end(s.score, `${s.hits} pedradas certeiras`);
    }
    s.shots.push({ t: 0, hit, kill, done: false });
    g.hud(`Pontos ${s.score}`, Hub.hearts(s.lives, s.maxLives));
  },
  update(s, dt, g) {
    const L = lay(g);
    if (!s.over) { s.pos += s.dir * s.speed * dt; if (s.pos >= 1) { s.pos = 1; s.dir = -1; } else if (s.pos <= 0) { s.pos = 0; s.dir = 1; } }
    s.spin += dt * 12; if (s.throwT >= 0) { s.throwT += dt / 0.3; if (s.throwT > 1) s.throwT = -1; }
    if (s.fallT > 0) { s.fallT -= dt * 0.9; if (s.fallT <= 0) { s.fallT = 0; s.hp = 1; } }   // novo gigante
    s.hitT = Math.max(0, s.hitT - dt); s.flash = Math.max(0, s.flash - dt); s.msgT = Math.max(0, s.msgT - dt);
    s.shots.forEach(k => {
      k.t += dt / 0.3;
      if (k.t >= 1 && !k.done) {                                                        // a pedra chegou
        k.done = true;
        if (k.hit) { Art.burst(s.parts, L.gx, L.gy, 16, PINK, 260); Art.burst(s.parts, L.gx, L.gy, 8, GOLD, 200); s.hitT = 0.3; g.sfx('hit'); if (k.kill) { Art.burst(s.parts, L.gx, L.feet, 34, '#c9a0ff', 300, 0.9); g.shake(); } }
        else Art.burst(s.parts, L.gx - L.gh * 0.45, L.feet - 6, 10, '#8a7a9a', 140);
      }
    });
    s.shots = s.shots.filter(k => k.t < 1.05); Art.fxStep(s.parts, dt);
  },
  draw(s, c, g) {
    const L = lay(g), { W, H, bx, bw, bh, by, cx, feet, gh, gy, dx, dh, dfeet } = L, t = performance.now() / 1000, k = dh / 100;
    Art.bg(c, W, H, 'davi', t); Art.verse(c, W, H, 'davi', 0.17);
    const gx = cx + (s.hitT > 0 ? Math.sin(s.hitT * 80) * 8 : 0);                      // Golias: respira, recua ao ser atingido, cai ao perder a vida
    c.save(); c.translate(gx, feet + Math.sin(t * 2) * 2); c.rotate(s.fallT ? (1 - s.fallT) * -1.5 : s.hitT > 0 ? -0.05 : 0);
    Art.figure(c, 'golias', { x: 0, y: 0, h: gh }); c.restore();
    const arm = s.throwT >= 0 ? 2.4 - Math.sin(s.throwT * Math.PI) * 1.5 : 2.4 + Math.sin(s.spin * 0.5) * 0.08, hd = hand(L, arm);
    Hub.player(c, { x: dx, y: dfeet, h: dh, pose: 'throw', armR: arm, prop: 'sling' });
    if (s.throwT < 0) {                                                                  // a funda girando
      const sx = hd[0], sy = hd[1] - 12 * k, ox = Math.cos(s.spin) * 11 * k, oy = Math.sin(s.spin) * 11 * k;
      c.strokeStyle = '#e8d7b0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hd[0], hd[1]); c.lineTo(sx + ox, sy + oy); c.stroke();
      c.fillStyle = '#ddd'; c.beginPath(); c.arc(sx + ox, sy + oy, 3.2 * k * 2, 0, 7); c.fill();
    }
    const from = hand(L, 2.4);
    s.shots.forEach(q => {                                                               // a pedra voando (com rastro)
      const tx = q.hit ? L.gx : L.gx - gh * 0.45, ty = q.hit ? gy : feet - 6;
      for (let i = 0; i < 4; i++) { const tt = Math.max(0, Math.min(1, q.t - i * 0.05)), x = from[0] + (tx - from[0]) * tt, y = from[1] + (ty - from[1]) * tt - Math.sin(Math.PI * tt) * H * 0.07;
        c.globalAlpha = 1 - i * 0.22; c.fillStyle = i ? PINK : '#fff'; c.beginPath(); c.arc(x, y, 7 - i, 0, 7); c.fill(); } c.globalAlpha = 1;
    });
    c.fillStyle = '#2a1230'; c.fillRect(W * 0.25, H * 0.095 + 62, W * 0.5, 8);          // vida do gigante
    c.shadowColor = PINK; c.shadowBlur = 10; c.fillStyle = PINK; c.fillRect(W * 0.25, H * 0.095 + 62, W * 0.5 * Math.max(0, s.hp), 8); c.shadowBlur = 0;
    c.fillStyle = '#0f0c16'; c.fillRect(bx, by, bw, bh);
    c.shadowColor = PINK; c.shadowBlur = 12; c.strokeStyle = PINK; c.lineWidth = 2; c.strokeRect(bx, by, bw, bh);
    const zw = s.zone * bw; c.shadowColor = GOLD; c.shadowBlur = 22; c.fillStyle = GOLD; c.fillRect(cx - zw / 2, by, zw, bh); c.shadowBlur = 0;
    c.shadowColor = '#fff'; c.shadowBlur = 16; c.fillStyle = '#ece6ff'; c.beginPath(); c.arc(bx + s.pos * bw, by + bh / 2, bh * 0.8, 0, 7); c.fill(); c.shadowBlur = 0;
    Art.fxDraw(c, s.parts); c.textAlign = 'center'; c.textBaseline = 'middle';
    if (s.msgT > 0) { c.globalAlpha = Math.min(1, s.msgT * 2); c.font = '34px "Kaushan Script", cursive'; c.shadowColor = PINK; c.shadowBlur = 14; c.fillStyle = s.msg === 'Errou!' ? PINK : GOLD; c.fillText(s.msg, cx, by - 48 - (0.7 - s.msgT) * 30); c.globalAlpha = 1; c.shadowBlur = 0; }
    if (s.flash > 0) { c.fillStyle = `rgba(255,45,149,${s.flash})`; c.fillRect(0, 0, W, H); }
    if (s.score === 0 && !s.over) { c.fillStyle = '#a99bb8'; c.font = '600 14px Sora, sans-serif'; c.fillText('Toque quando a pedra estiver na zona dourada', cx, by + bh + 34); }
  }
});
})();
