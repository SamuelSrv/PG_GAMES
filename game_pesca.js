/* game_pesca.js — Pescadores de Homens: o personagem escolhido pesca no Mar da Galileia (Mt 4:19) */
(() => {
'use strict';
const CFG = { lives: 3, lostPerLife: 5 };
const { GOLD } = Art, WATER = '#bfe6ff';

Hub.defineGame('pesca', {
  setup(g) { const ml = CFG.lives + Hub.lvl('fe'); g.hud('Pontos 0', Hub.hearts(ml)); return { x: g.W / 2, tx: g.W / 2, lives: ml, maxLives: ml, score: 0, caught: 0, lost: 0, items: [], spawn: 0.5, t: 0, parts: [], ripples: [], castT: -1, tilt: 0, foam: 0 }; },
  move(s, p) { s.tx = p.x; },                                  // arrastar o dedo / mover o mouse
  press(s, p) { s.tx = p.x; },
  key(s, code) { s.tx += code === 'ArrowLeft' ? -50 : code === 'ArrowRight' ? 50 : 0; },
  update(s, dt, g) {
    const { W, H } = g, by = H * 0.86, half = Math.max(36, W * 0.11) * (Hub.has('rede') ? 1.2 : 1), wl = by + 20;     // wl = linha d'água
    s.tx = Math.max(half, Math.min(W - half, s.tx)); const dx = s.tx - s.x; s.x += dx * Math.min(1, dt * 14);
    s.tilt = Math.max(-0.14, Math.min(0.14, Math.sin(s.t * 2.2) * 0.03 + dx * 0.002));   // o barco balança com as ondas e o movimento
    if (s.castT >= 0) { s.castT += dt / 0.35; if (s.castT > 1) s.castT = -1; }
    s.ripples.forEach(r => r.t += dt); s.ripples = s.ripples.filter(r => r.t < 0.9); Art.fxStep(s.parts, dt);
    if (Math.abs(dx) > 3 && Math.random() < 0.6) Art.burst(s.parts, s.x - Math.sign(dx) * half, wl, 1, 'rgba(255,255,255,.8)', 40, 0.5, 0);   // espuma
    if (s.over) return;
    s.t += dt; s.spawn -= dt;
    if (s.spawn <= 0) {
      s.spawn = Math.max(0.35, 0.9 - s.t * 0.01); const r = Math.random();
      s.items.push({ type: r < 0.62 ? 'fish' : r < 0.72 ? 'gold' : r < 0.88 ? 'rock' : 'anchor', x: 30 + Math.random() * (W - 60), y: -30, vy: (150 + s.t * 4 + Math.random() * 60) * (1 - 0.07 * Hub.lvl('coragem')), ph: Math.random() * 6 });
    }
    s.items = s.items.filter(it => {
      it.y += it.vy * dt; const isFish = it.type === 'fish' || it.type === 'gold';
      if (it.y > by - 22 && it.y < by + 22 && Math.abs(it.x - s.x) < half + 8) {      // pegou
        if (isFish) { s.score += it.type === 'gold' ? 30 : 10; s.caught++; g.sfx('splash'); g.coin(it.type === 'gold' ? 4 : 1, it.x, by - 26); s.castT = 0; Art.burst(s.parts, it.x, by - 6, 14, WATER, 220, 0.6); if (it.type === 'gold') Art.burst(s.parts, it.x, by - 6, 12, GOLD, 200, 0.7, 150); }
        else { s.lives--; g.sfx('miss'); g.shake(); Art.burst(s.parts, it.x, by, 12, '#8a7a9a', 200, 0.5); }
        return false;
      }
      if (it.y > wl) {                                                                  // caiu na água: respingo e ondas
        s.ripples.push({ x: it.x, y: wl + 4, t: 0 }); Art.burst(s.parts, it.x, wl, isFish ? 6 : 10, WATER, 160, 0.5);
        if (isFish) { s.lost++; if (s.lost % CFG.lostPerLife === 0) { s.lives--; g.sfx('miss'); } } else g.sfx('splash');
        return false;
      }
      return true;
    });
    g.hud(`Pontos ${s.score} · perdidos ${s.lost % CFG.lostPerLife}/${CFG.lostPerLife}`, Hub.hearts(s.lives, s.maxLives));
    if (s.lives <= 0) g.end(s.score, `${s.caught} peixes pescados`);
  },
  draw(s, c, g) {
    const { W, H } = g, by = H * 0.86, t = performance.now() / 1000, half = Math.max(36, W * 0.11) * (Hub.has('rede') ? 1.2 : 1), wl = by + 20;
    Art.bg(c, W, H, 'pesca', t); Art.verse(c, W, H, 'pesca', 0.17);
    c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 14; i++) { c.globalAlpha = 0.2 + 0.5 * Math.abs(Math.sin(t * 2 + i)); c.fillRect((i * 83) % W, H * 0.52 + (i * 41) % (H * 0.4), 2, 2); } c.globalAlpha = 1;   // brilhos na água
    const wave = (y, amp, sp, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 10) c.lineTo(x, y + Math.sin(x / 34 + t * sp) * amp); c.lineTo(W, H); c.fill(); };
    wave(wl - 6, 5, 1.6, 'rgba(90,40,130,.55)');                                       // onda de trás
    s.items.forEach(it => {
      const a = Math.PI / 2 + Math.sin(t * 3 + it.ph) * 0.4;
      if (it.type === 'fish' || it.type === 'gold') Art.fish(c, it.x, it.y, 1.1, it.type === 'gold', a);
      else if (it.type === 'rock') Art.rock(c, it.x, it.y, 1.1); else Art.anchor(c, it.x, it.y, 1.1);
    });
    s.ripples.forEach(r => { c.globalAlpha = 1 - r.t / 0.9; c.strokeStyle = WATER; c.lineWidth = 2; c.beginPath(); c.ellipse(r.x, r.y, 6 + r.t * 44, 2 + r.t * 10, 0, 0, 7); c.stroke(); }); c.globalAlpha = 1;
    c.save(); c.translate(s.x, by + 4); c.rotate(s.tilt);
    Art.boat(c, 0, 0, half * 2.2);
    const arm = s.castT >= 0 ? 2.4 - Math.sin(s.castT * Math.PI) * 1.5 : 2.2;       // Pedro lança a rede ao pegar um peixe
    Hub.player(c, { x: 0, y: -4, h: 70, pose: 'throw', armR: arm, prop: 'net' }); c.restore();
    wave(wl, 5, 2.4, 'rgba(7,4,14,.8)');                                               // onda da frente
    Art.fxDraw(c, s.parts);
    if (s.t < 3) { c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '600 14px Sora, sans-serif'; c.fillText('Arraste para mover o barco · fuja das pedras e âncoras', W / 2, H * 0.4); }
  }
});
})();
