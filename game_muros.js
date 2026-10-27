/* game_muros.js — Muros de Neemias: o personagem escolhido reconstrói a muralha de Jerusalém (Ne 2:18) */
(() => {
'use strict';
const CFG = { maxMiss: 3, perfectPx: 7, minW: 14 };
const { GOLD } = Art;
const hue = i => 270 + (i * 9) % 70;                         // violeta → rosa
const yOf = (s, g, i) => g.H * 0.88 - (i + 1) * s.bh + s.cam; // posição vertical do bloco i

Hub.defineGame('muros', {
  setup(g) {
    const w = g.W * 0.45; const mm = CFG.maxMiss + Hub.lvl('fe'); g.hud('Pontos 0', `Falhas 0/${mm}`);
    return { bh: Math.max(22, g.H * 0.045), stack: [{ x: (g.W - w) / 2, w }], cur: { x: 0, w, dir: 1 }, speed: g.W * 0.5 * (1 - 0.07 * Hub.lvl('coragem')), maxMiss: mm, score: 0, miss: 0, chips: [], cam: 0, msg: '', msgT: 0, parts: [], cheer: 0 };
  },
  press(s, p, g) {
    const top = s.stack[s.stack.length - 1], c = s.cur, cy = yOf(s, g, s.stack.length);
    const left = Math.max(c.x, top.x), right = Math.min(c.x + c.w, top.x + top.w), ov = right - left;
    if (ov <= 0) {                                            // errou a base: o bloco cai
      s.miss++; s.chips.push({ x: c.x, w: c.w, y: cy, vy: 0, h: s.stack.length }); g.sfx('miss'); g.shake();
      s.msg = 'Caiu!'; s.msgT = 0.6; c.x = c.dir > 0 ? 0 : g.W - c.w; Art.burst(s.parts, c.x + c.w / 2, cy + s.bh, 14, '#9a8aa8', 180, 0.6);
      if (s.miss >= s.maxMiss) g.end(s.score, `${s.stack.length - 1} pedras na muralha`);
    } else {
      const perfect = Math.abs(c.x - top.x) < CFG.perfectPx + (Hub.has('prumo') ? 4 : 0); let nx = top.x, nw = top.w;
      g.sfx('thud'); Art.burst(s.parts, left + ov / 2, cy + s.bh, 12, '#e0d4f0', 150, 0.5);   // poeira da pedra assentando
      if (perfect) { s.score += 3; s.msg = 'Perfeito! +3'; g.coin(3, left + ov / 2, cy - 10); g.sfx('win'); s.cheer = 0.8; Art.burst(s.parts, left + ov / 2, cy + s.bh / 2, 24, GOLD, 260, 0.7); }
      else {                                                  // imperfeito: a largura diminui
        nx = left; nw = Math.max(CFG.minW, ov); s.score += 1; s.msg = ''; g.coin(1, left + ov / 2, cy - 10);
        const cut = c.x < top.x ? { x: c.x, w: left - c.x } : { x: right, w: c.x + c.w - right };
        s.chips.push({ ...cut, y: cy, vy: 0, h: s.stack.length });
      }
      s.msgT = s.msg ? 0.7 : 0; s.stack.push({ x: nx, w: nw });
      s.cur = { x: c.dir > 0 ? 0 : g.W - nw, w: nw, dir: c.dir }; s.speed = Math.min(g.W * 1.3, s.speed + g.W * 0.012);
    }
    g.hud(`Pontos ${s.score}`, `Falhas ${s.miss}/${s.maxMiss}`);
  },
  update(s, dt, g) {
    if (!s.over) { s.cur.x += s.cur.dir * s.speed * dt; if (s.cur.x <= 0) { s.cur.x = 0; s.cur.dir = 1; } else if (s.cur.x >= g.W - s.cur.w) { s.cur.x = g.W - s.cur.w; s.cur.dir = -1; } }
    s.cam += (Math.max(0, s.stack.length - 8) * s.bh - s.cam) * Math.min(1, dt * 6);
    s.chips.forEach(k => { k.vy += 1800 * dt; k.y += k.vy * dt; }); s.chips = s.chips.filter(k => k.y < g.H + 60);
    s.msgT = Math.max(0, s.msgT - dt); s.cheer = Math.max(0, s.cheer - dt); Art.fxStep(s.parts, dt);
  },
  draw(s, c, g) {
    const { W, H } = g, bh = s.bh, t = performance.now() / 1000, ground = H * 0.88 + s.cam;
    Art.bg(c, W, H, 'muros', t); Art.verse(c, W, H, 'muros', 0.17);
    c.fillStyle = '#0b0612'; c.fillRect(0, ground, W, H);
    Hub.player(c, { x: W * 0.11, y: ground + 2, h: H * 0.18, pose: s.cheer > 0 ? 'up' : 'stand', prop: 'trowel' });   // o construtor comemora
    if (Hub.has('prumo') && !s.over) { const tp = s.stack[s.stack.length - 1]; c.save(); c.setLineDash([5, 7]); c.strokeStyle = 'rgba(255,201,77,.55)'; c.lineWidth = 1.5;   // prumo de Neemias: linha-guia
      [tp.x, tp.x + tp.w].forEach(x => { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, yOf(s, g, s.stack.length - 1)); c.stroke(); }); c.restore(); }
    s.stack.forEach((b, i) => Art.stone(c, b.x, yOf(s, g, i), b.w, bh, hue(i)));
    s.chips.forEach(k => Art.stone(c, k.x, k.y, k.w, bh, hue(k.h)));
    if (!s.over) Art.stone(c, s.cur.x, yOf(s, g, s.stack.length) - 4, s.cur.w, bh, hue(s.stack.length));
    Art.fxDraw(c, s.parts); c.textAlign = 'center'; c.textBaseline = 'middle';
    if (s.msgT > 0 && s.msg) { c.globalAlpha = Math.min(1, s.msgT * 2); c.fillStyle = GOLD; c.font = '34px "Kaushan Script", cursive'; c.fillText(s.msg, W / 2, H * 0.4); c.globalAlpha = 1; }
    if (s.score === 0 && s.miss === 0) { c.fillStyle = '#a99bb8'; c.font = '600 14px Sora, sans-serif'; c.fillText('Toque para soltar a pedra', W / 2, H * 0.95); }
  }
});
})();
