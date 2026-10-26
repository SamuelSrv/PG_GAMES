/* game_pesca.js — Pescadores de Homens: Pedro no Mar da Galileia (Mt 4:19) */
(() => {
'use strict';
const CFG = { lives: 3, lostPerLife: 5 };

Hub.defineGame('pesca', {
  setup(g) { g.hud('Pontos 0', Hub.hearts(CFG.lives)); return { x: g.W / 2, tx: g.W / 2, lives: CFG.lives, score: 0, caught: 0, lost: 0, items: [], spawn: 0.5, t: 0 }; },
  move(s, p) { s.tx = p.x; },                                  // arrastar o dedo / mover o mouse
  press(s, p) { s.tx = p.x; },
  key(s, code) { s.tx += code === 'ArrowLeft' ? -50 : code === 'ArrowRight' ? 50 : 0; },
  update(s, dt, g) {
    const { W, H } = g, by = H * 0.86, half = Math.max(36, W * 0.11);
    s.tx = Math.max(half, Math.min(W - half, s.tx)); s.x += (s.tx - s.x) * Math.min(1, dt * 14);
    if (s.over) return;
    s.t += dt; s.spawn -= dt;
    if (s.spawn <= 0) {
      s.spawn = Math.max(0.35, 0.9 - s.t * 0.01); const r = Math.random();
      s.items.push({ type: r < 0.62 ? 'fish' : r < 0.72 ? 'gold' : r < 0.88 ? 'rock' : 'anchor', x: 30 + Math.random() * (W - 60), y: -30, vy: 150 + s.t * 4 + Math.random() * 60, ph: Math.random() * 6 });
    }
    s.items = s.items.filter(it => {
      it.y += it.vy * dt;
      if (it.y > by - 22 && it.y < by + 22 && Math.abs(it.x - s.x) < half + 8) {
        if (it.type === 'fish' || it.type === 'gold') { s.score += it.type === 'gold' ? 30 : 10; s.caught++; g.sfx('hit'); }
        else { s.lives--; g.sfx('miss'); g.shake(); }
        return false;
      }
      if (it.y > H + 30) {
        if (it.type === 'fish' || it.type === 'gold') { s.lost++; if (s.lost % CFG.lostPerLife === 0) { s.lives--; g.sfx('miss'); } }
        return false;
      }
      return true;
    });
    g.hud(`Pontos ${s.score} · perdidos ${s.lost % CFG.lostPerLife}/${CFG.lostPerLife}`, Hub.hearts(s.lives, CFG.lives));
    if (s.lives <= 0) g.end(s.score, `${s.caught} peixes pescados`);
  },
  draw(s, c, g) {
    const { W, H } = g, by = H * 0.86, t = performance.now() / 1000, half = Math.max(36, W * 0.11);
    Art.bg(c, W, H, 'pesca', t); Art.verse(c, W, H, 'pesca', 0.17);
    s.items.forEach(it => {
      const a = Math.PI / 2 + Math.sin(t * 3 + it.ph) * 0.4;
      if (it.type === 'fish' || it.type === 'gold') Art.fish(c, it.x, it.y, 1.1, it.type === 'gold', a);
      else if (it.type === 'rock') Art.rock(c, it.x, it.y, 1.1); else Art.anchor(c, it.x, it.y, 1.1);
    });
    Art.boat(c, s.x, by + 4, half * 2.2); Art.figure(c, 'pedro', { x: s.x, y: by - 4, h: 62, pose: 'stand' });
    c.fillStyle = '#07040eaa'; c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W; x += 10) c.lineTo(x, by + 20 + Math.sin(x / 30 + t * 2.5) * 5);
    c.lineTo(W, H); c.fill();
    if (s.t < 3) { c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '600 14px Sora, sans-serif'; c.fillText('Arraste para mover o barco · fuja das pedras e âncoras', W / 2, H * 0.4); }
  }
});
})();
