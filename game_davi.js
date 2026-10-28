/* game_davi.js — Funda de Davi: acerte o ponto fraco de Golias no Vale de Elá (1 Sm 17:47). Dourado = pedrada certeira; prateado = acerto leve. */
(() => {
'use strict';
const { PINK, GOLD } = Art, lerp = (a, b, t) => a + (b - a) * t;
const zoneW = s => Math.max(Hub.tier('davi') >= 1 ? 0.085 : 0.05, 0.16 * Math.pow(0.94, s.zhits)) * (1 + 0.08 * Hub.lvl('foco'));
const lay = g => { const { W, H } = g, gy = H * 0.66, gh = Math.min(H * 0.42, W * 0.62); return { W, H, gy, gh, dx: W * 0.14, dh: H * 0.2, by: H * 0.82, bh: Math.max(24, H * 0.045), bx: W * 0.08, bw: W * 0.84 }; };
const gX = (L, s) => lerp(L.W * 0.38, L.W * 0.8, s.gd);
Hub.registerGame('davi', {
  setup(g) {
    const ml = 3 + Hub.lvl('fe'); g.hud(0, Hub.hearts(ml, ml), 'Gigante 1');
    return { lives: ml, maxLives: ml, score: 0, hits: 0, kills: 0, pos: 0, dir: 1, spd: 0.9 * (1 - 0.06 * Hub.lvl('coragem')) * (Hub.tier('davi') >= 2 ? 0.85 : 1), zc: 0.5, zhits: 0, hp: 1, gd: 1, fall: 0, hitT: 0, flash: 0, shots: [], throwT: -1, spin: 0, parts: [], free: Hub.tier('davi') >= 3, msg: '', msgT: 0, started: false };
  },
  press(s, p, g) {
    if (s.fall > 0) return; s.started = true; const d = Math.abs(s.pos - s.zc), zw = zoneW(s), kind = d <= zw / 2 ? 'gold' : d <= zw * 1.5 ? 'silver' : 'miss'; let kill = false; g.sfx('whoosh'); s.throwT = 0;
    if (kind !== 'miss') {
      s.hits++; s.zhits++; s.spd = Math.min(2.4, s.spd * 1.05); const gold = kind === 'gold'; s.score += gold ? 15 : 5; s.hp -= gold ? 0.34 : 0.12; s.gd = Math.min(1, s.gd + (gold ? 0.2 : 0.07));
      s.msg = gold ? 'Em cheio!' : 'Pegou de raspão'; s.msgT = 0.7;
      if (s.hp <= 0.01) { s.hp = 0; s.fall = 1; s.score += 30; s.kills++; kill = true; s.msg = 'Golias caiu! +30'; g.coin(1, g.W / 2, g.H * 0.3); }
    } else if (s.free) { s.free = false; s.msg = 'Bênção! Sem dano'; s.msgT = 0.8; s.gd = Math.max(0.05, s.gd - 0.1); }
    else { g.sfx('miss'); g.shake(); s.lives--; s.flash = 0.4; s.msg = 'Errou!'; s.msgT = 0.6; s.gd = Math.max(0.05, s.gd - 0.12); if (s.lives <= 0) g.end(s.score, `${s.hits} pedradas · ${s.kills} gigantes`); }
    s.shots.push({ t: 0, kind, kill, done: false }); s.zc = Hub.rand(0.2, 0.8); g.hud(s.score, Hub.hearts(s.lives, s.maxLives), `Gigante ${s.kills + 1}`);
  },
  update(s, dt, g) {
    const L = lay(g);
    if (!s.over) { s.pos += s.dir * s.spd * dt; if (s.pos >= 1) { s.pos = 1; s.dir = -1; } else if (s.pos <= 0) { s.pos = 0; s.dir = 1; } }
    s.spin += dt * 12; if (s.throwT >= 0) { s.throwT += dt / 0.3; if (s.throwT > 1) s.throwT = -1; }
    if (s.fall > 0) { s.fall -= dt * 0.9; if (s.fall <= 0) { s.fall = 0; s.hp = 1; s.gd = 1; s.zhits = Math.max(0, s.zhits - 3); s.free = Hub.tier('davi') >= 3; } }
    else if (s.started && !s.over) {                                    // Golias avança; se alcançar Davi, tira uma vida
      s.gd -= 0.02 * (1 + 0.12 * s.kills) * (1 - 0.1 * Hub.lvl('vigor')) * dt;
      if (s.gd <= 0) { s.lives--; s.gd = 0.85; s.flash = 0.5; g.sfx('miss'); g.shake(); s.msg = 'Golias te alcançou!'; s.msgT = 0.9; g.hud(s.score, Hub.hearts(s.lives, s.maxLives), `Gigante ${s.kills + 1}`); if (s.lives <= 0) g.end(s.score, `${s.hits} pedradas · ${s.kills} gigantes`); }
    }
    s.hitT = Math.max(0, s.hitT - dt); s.flash = Math.max(0, s.flash - dt); s.msgT = Math.max(0, s.msgT - dt);
    s.shots.forEach(k => { k.t += dt / 0.28; if (k.t >= 1 && !k.done) { k.done = true; const hx = gX(L, s), hy = L.gy - L.gh * 0.86;
      if (k.kind !== 'miss') { Art.burst(s.parts, hx, hy, 14, PINK, 260); if (k.kind === 'gold') Art.burst(s.parts, hx, hy, 8, GOLD, 200); s.hitT = 0.3; g.sfx('hit'); if (k.kill) { Art.burst(s.parts, hx, L.gy, 30, '#c9a0ff', 300, 0.9); g.shake(); } }
      else Art.burst(s.parts, hx - L.gh * 0.4, L.gy - 6, 8, '#8a7a9a', 140); } });
    s.shots = s.shots.filter(k => k.t < 1.05); Art.fxStep(s.parts, dt);
  },
  draw(s, c, g) {
    const L = lay(g), { W, H, gy, gh, dx, dh, by, bh, bx, bw } = L, t = performance.now() / 1000, zw = zoneW(s);
    Art.bg(c, W, H, 'davi', t); Art.verse(c, W, H, 'davi', 0.14, 0.4); c.fillStyle = '#0b0612'; c.fillRect(0, gy, W, H - gy);
    const gx = gX(L, s) + (s.hitT > 0 ? Math.sin(s.hitT * 80) * 6 : 0);
    c.save(); c.translate(gx, gy); c.rotate(s.fall ? (1 - s.fall) * -1.5 : 0); Art.figure(c, HubData.NPC.golias, { x: 0, y: 0, h: gh, pose: 'stand', mood: 'strain', prop: 'spear' }); c.restore();
    c.fillStyle = '#2a1230'; c.fillRect(gx - 50, gy - gh - 14, 100, 7); c.fillStyle = PINK; c.fillRect(gx - 50, gy - gh - 14, 100 * Math.max(0, s.hp), 7);                    // vida do gigante
    const arm = s.throwT >= 0 ? 2.4 - Math.sin(s.throwT * Math.PI) * 1.5 : 2.4 + Math.sin(s.spin * 0.5) * 0.08, o = { x: dx, y: gy, h: dh, pose: 'throw', armR: arm };
    Hub.player(c, o); const hd = Hub.playerHand(o, 'R');
    if (s.throwT < 0) { const k = dh / 100, ox = Math.cos(s.spin) * 11 * k, oy = Math.sin(s.spin) * 11 * k; c.strokeStyle = '#e8d7b0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hd.x, hd.y); c.lineTo(hd.x + ox, hd.y - 12 * k + oy); c.stroke(); c.fillStyle = '#ddd'; c.beginPath(); c.arc(hd.x + ox, hd.y - 12 * k + oy, 5, 0, 7); c.fill(); }
    s.shots.forEach(q => { const tx = q.kind !== 'miss' ? gx : gx - gh * 0.4, ty = q.kind !== 'miss' ? gy - gh * 0.86 : gy - 6;
      for (let i = 0; i < 4; i++) { const tt = Math.max(0, Math.min(1, q.t - i * 0.05)), x = hd.x + (tx - hd.x) * tt, y = hd.y + (ty - hd.y) * tt - Math.sin(Math.PI * tt) * H * 0.06; c.globalAlpha = 1 - i * 0.22; c.fillStyle = i ? PINK : '#fff'; c.beginPath(); c.arc(x, y, 7 - i, 0, 7); c.fill(); } c.globalAlpha = 1; });
    c.fillStyle = '#0f0c16'; c.fillRect(bx, by, bw, bh); c.strokeStyle = PINK; c.lineWidth = 2; c.strokeRect(bx, by, bw, bh);
    c.fillStyle = 'rgba(220,220,235,.5)'; c.fillRect(bx + (s.zc - zw * 1.5) * bw, by, zw * 3 * bw, bh); c.fillStyle = GOLD; c.fillRect(bx + (s.zc - zw / 2) * bw, by, zw * bw, bh);   // prateado + dourado
    c.fillStyle = '#ece6ff'; c.beginPath(); c.arc(bx + s.pos * bw, by + bh / 2, bh * 0.8, 0, 7); c.fill();
    Art.fxDraw(c, s.parts); c.textAlign = 'center'; c.textBaseline = 'middle';
    if (s.msgT > 0) { c.globalAlpha = Math.min(1, s.msgT * 2); c.font = '30px "Kaushan Script", cursive'; c.fillStyle = s.msg.startsWith('Err') || s.msg.includes('alcançou') ? PINK : GOLD; c.fillText(s.msg, W / 2, by - 44 - (0.7 - s.msgT) * 30); c.globalAlpha = 1; }
    if (s.flash > 0) { c.fillStyle = `rgba(255,45,149,${s.flash})`; c.fillRect(0, 0, W, H); }
    if (!s.started) { c.fillStyle = '#a99bb8'; c.font = '600 13px Sora, sans-serif'; c.fillText('Toque quando a bolinha estiver na zona dourada · Golias avança!', W / 2, by + bh + 28); }
  }
});
})();
