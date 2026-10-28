/* game_pesca.js — Pescadores de Homens: Pedro pesca no Mar da Galileia (Mt 4:19). Arraste o barco, junte peixes em sequência (combo) e fuja de pedras e âncoras. */
(() => {
'use strict';
const { GOLD } = Art, WATER = '#bfe6ff', halfOf = g => Math.max(36, g.W * 0.11) * (Hub.tier('pesca') >= 1 ? 1.2 : 1) * (1 + 0.04 * Hub.lvl('foco'));
const maxMult = () => Hub.tier('pesca') >= 3 ? 6 : 5, mult = s => 1 + Math.min(maxMult() - 1, Math.floor(s.combo / (Hub.tier('pesca') >= 3 ? 3 : 5)));
Hub.registerGame('pesca', {
  setup(g) { const ml = 3 + Hub.lvl('fe'); g.hud(0, Hub.hearts(ml, ml)); return { x: g.W / 2, tx: g.W / 2, lives: ml, maxLives: ml, score: 0, caught: 0, lost: 0, combo: 0, items: [], spawn: 0.6, t: 0, parts: [], ripples: [], castT: -1, tilt: 0 }; },
  move(s, p) { s.tx = p.x; }, press(s, p) { s.tx = p.x; }, key(s, code) { s.tx += code === 'ArrowLeft' ? -50 : code === 'ArrowRight' ? 50 : 0; },
  update(s, dt, g) {
    const { W, H } = g, by = H * 0.86, half = halfOf(g), wl = by + 20, lpl = 5 + Hub.lvl('vigor');
    s.tx = Math.max(half, Math.min(W - half, s.tx)); const dx = s.tx - s.x; s.x += dx * Math.min(1, dt * 14); s.tilt = Math.max(-0.14, Math.min(0.14, Math.sin(s.t * 2.2) * 0.03 + dx * 0.002));
    if (s.castT >= 0) { s.castT += dt / 0.35; if (s.castT > 1) s.castT = -1; } s.ripples.forEach(r => r.t += dt); s.ripples = s.ripples.filter(r => r.t < 0.9); Art.fxStep(s.parts, dt);
    if (s.over) return; s.t += dt; s.spawn -= dt;
    if (s.spawn <= 0) {
      s.spawn = Math.max(0.38, 0.95 - s.t * 0.009); const r = Math.random(), gp = 0.06 * (1 + 0.25 * Hub.lvl('sorte'));
      s.items.push({ type: r < gp ? 'gold' : r < 0.62 ? 'fish' : r < 0.78 ? 'rock' : 'anchor', x: 30 + Math.random() * (W - 60), y: -30, vy: Math.min(380, 150 + s.t * 3.5 + Math.random() * 60) * (1 - 0.06 * Hub.lvl('coragem')), ph: Math.random() * 6 });
    }
    s.items = s.items.filter(it => {
      it.y += it.vy * dt; const fishy = it.type === 'fish' || it.type === 'gold';
      if (fishy && Hub.tier('pesca') >= 2 && it.y > by - 230 && it.y < by && Math.abs(it.x - s.x) < 130) it.x += Math.sign(s.x - it.x) * 150 * dt;       // Barco do Mestre
      if (it.y > by - 26 && it.y < by + 18 && Math.abs(it.x - s.x) < half + 8) {
        if (fishy) { s.combo++; const pts = (it.type === 'gold' ? 40 : 10) * mult(s); s.score += pts; s.caught++; g.sfx('splash'); s.castT = 0; Art.burst(s.parts, it.x, by - 6, 14, WATER, 220, 0.6); g.pop('+' + pts, it.x, by - 34, it.type === 'gold' ? '#ffc94d' : '#fff'); if (it.type === 'gold') { g.coin(1, it.x, by - 60); Art.burst(s.parts, it.x, by - 6, 12, GOLD, 200, 0.7, 150); } }
        else { s.lives--; s.combo = 0; g.sfx('miss'); g.shake(); Art.burst(s.parts, it.x, by, 12, '#8a7a9a', 200, 0.5); }
        return false;
      }
      if (it.y > wl) { s.ripples.push({ x: it.x, y: wl + 4, t: 0 }); Art.burst(s.parts, it.x, wl, fishy ? 6 : 10, WATER, 160, 0.5); if (fishy) { s.lost++; s.combo = 0; if (s.lost % lpl === 0) { s.lives--; g.sfx('miss'); } } else g.sfx('splash'); return false; }
      return true;
    });
    g.hud(s.score, Hub.hearts(s.lives, s.maxLives), `x${mult(s)} · ${s.lost % lpl}/${lpl}`); if (s.lives <= 0) g.end(s.score, `${s.caught} peixes pescados`);
  },
  draw(s, c, g) {
    const { W, H } = g, by = H * 0.86, t = performance.now() / 1000, half = halfOf(g), wl = by + 20;
    Art.bg(c, W, H, 'pesca', t); Art.verse(c, W, H, 'pesca', 0.17, 0.4);
    const wave = (y, amp, sp, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 12) c.lineTo(x, y + Math.sin(x / 34 + t * sp) * amp); c.lineTo(W, H); c.fill(); };
    wave(wl - 6, 5, 1.6, 'rgba(90,40,130,.55)');
    s.items.forEach(it => { const a = Math.PI / 2 + Math.sin(t * 3 + it.ph) * 0.4; if (it.type === 'fish' || it.type === 'gold') Art.fish(c, it.x, it.y, 1.1, it.type === 'gold', a); else if (it.type === 'rock') Art.rock(c, it.x, it.y, 1.1); else Art.anchor(c, it.x, it.y, 1.1); });
    s.ripples.forEach(r => { c.globalAlpha = 1 - r.t / 0.9; c.strokeStyle = WATER; c.lineWidth = 2; c.beginPath(); c.ellipse(r.x, r.y, 6 + r.t * 44, 2 + r.t * 10, 0, 0, 7); c.stroke(); }); c.globalAlpha = 1;
    c.save(); c.translate(s.x, by + 4); c.rotate(s.tilt); Art.boat(c, 0, 0, half * 2.2); const arm = s.castT >= 0 ? 2.4 - Math.sin(s.castT * Math.PI) * 1.5 : 2.2; Hub.player(c, { x: 0, y: -4, h: 70, pose: 'throw', armR: arm, prop: 'net' }); c.restore();
    wave(wl, 5, 2.4, 'rgba(7,4,14,.8)'); Art.fxDraw(c, s.parts);
    if (s.t < 4) { c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '600 13px Sora, sans-serif'; c.fillText('Arraste para mover o barco · fuja das pedras e âncoras', W / 2, H * 0.4); }
  }
});
})();
