/* game_muros.js — Muros de Neemias: solte as pedras e reconstrua a muralha em 52 dias (Ne 6:15). */
(() => {
'use strict';
const { GOLD } = Art, hue = i => 270 + (i * 9) % 70, yOf = (s, g, i) => g.H * 0.88 - (i + 1) * s.bh + s.cam;
const newCur = (s, g, w, dir) => ({ x: dir > 0 ? 0 : g.W - w, w, dir, gold: Math.random() < 0.05 * (1 + 0.25 * Hub.lvl('sorte')) });
Hub.registerGame('muros', {
  setup(g) {
    const w = Math.min(g.W * 0.5, 260), mm = 3 + Hub.lvl('fe') + (Hub.tier('muros') >= 3 ? 1 : 0);
    const s = { bh: Math.max(24, g.H * 0.05), startW: w, stack: [{ x: (g.W - w) / 2, w }], speed: g.W * 0.55 * (1 - 0.06 * Hub.lvl('coragem')) * (Hub.tier('muros') >= 3 ? 0.88 : 1), maxMiss: mm, score: 0, miss: 0, chips: [], cam: 0, msg: '', msgT: 0, parts: [], cheer: 0, streak: 0, day: 0, won: false };
    s.cur = newCur(s, g, w, 1); g.hud(0, `Falhas 0/${mm}`, 'Dia 0/52'); return s;
  },
  press(s, p, g) {
    const top = s.stack[s.stack.length - 1], c = s.cur, cy = yOf(s, g, s.stack.length), tier = Hub.tier('muros');
    const left = Math.max(c.x, top.x), right = Math.min(c.x + c.w, top.x + top.w), ov = right - left;
    if (ov <= 0) {                                                    // errou a base: a pedra cai
      s.miss++; s.streak = 0; s.chips.push({ x: c.x, w: c.w, y: cy, vy: 0, h: s.stack.length }); g.sfx('miss'); g.shake(); s.msg = 'Caiu!'; s.msgT = 0.6;
      s.cur = newCur(s, g, c.w, -c.dir); if (s.miss >= s.maxMiss) g.end(s.score, `${s.stack.length - 1} pedras na muralha`);
    } else {
      const pf = 7 * (1 + 0.08 * Hub.lvl('foco')) * (tier >= 1 ? 1.5 : 1) + (tier >= 2 ? 2 : 0), perfect = Math.abs(c.x - top.x) < pf; let nx = top.x, nw = top.w; s.msg = '';
      g.sfx('thud'); Art.burst(s.parts, left + ov / 2, cy + s.bh, 12, '#e0d4f0', 150, 0.5);
      if (perfect) {
        s.streak++; s.score += 2 + Math.min(s.streak, 5); s.msg = s.streak > 1 ? `Perfeito! x${s.streak}` : 'Perfeito!'; g.sfx('win'); s.cheer = 0.8; Art.burst(s.parts, left + ov / 2, cy + s.bh / 2, 22, GOLD, 260, 0.7);
        if (s.streak % (tier >= 2 ? 3 : 4) === 0) { nw = Math.min(s.startW, top.w * (tier >= 2 ? 1.14 : 1.08)); nx = Math.max(0, Math.min(g.W - nw, top.x - (nw - top.w) / 2)); }
      } else {
        s.streak = 0; nx = left; nw = Math.max(14, ov); s.score += 1; const cut = c.x < top.x ? { x: c.x, w: left - c.x } : { x: right, w: c.x + c.w - right }; s.chips.push({ ...cut, y: cy, vy: 0, h: s.stack.length });
      }
      if (c.gold) { s.score += 5; g.coin(1, left + ov / 2, cy - 14); }
      s.day++; if (s.day === 52 && !s.won) { s.won = true; s.score += 25; s.msg = 'Muralha pronta em 52 dias!'; }
      s.msgT = s.msg ? 1 : 0; s.stack.push({ x: nx, w: nw }); s.cur = newCur(s, g, nw, c.dir); s.speed = Math.min(g.W * 1.25, s.speed + g.W * 0.012 * (tier >= 3 ? 0.8 : 1));
    }
    g.hud(s.score, `Falhas ${s.miss}/${s.maxMiss}`, `Dia ${Math.min(52, s.day)}/52`);
  },
  update(s, dt, g) {
    if (!s.over) { const c = s.cur; c.x += c.dir * s.speed * dt; if (c.x <= 0) { c.x = 0; c.dir = 1; } else if (c.x >= g.W - c.w) { c.x = g.W - c.w; c.dir = -1; } }
    s.cam += (Math.max(0, s.stack.length - 8) * s.bh - s.cam) * Math.min(1, dt * 6); s.chips.forEach(k => { k.vy += 1800 * dt; k.y += k.vy * dt; }); s.chips = s.chips.filter(k => k.y < g.H + 60);
    s.msgT = Math.max(0, s.msgT - dt); s.cheer = Math.max(0, s.cheer - dt); Art.fxStep(s.parts, dt);
  },
  draw(s, c, g) {
    const { W, H } = g, bh = s.bh, t = performance.now() / 1000, ground = H * 0.88 + s.cam;
    Art.bg(c, W, H, 'muros', t); Art.verse(c, W, H, 'muros', 0.2, 0.4); c.fillStyle = '#0b0612'; c.fillRect(0, ground, W, H);
    Hub.player(c, { x: W * 0.11, y: ground + 2, h: H * 0.18, pose: s.cheer > 0 ? 'cheer' : 'stand', prop: 'trowel' });
    if (Hub.tier('muros') >= 1 && !s.over) { const tp = s.stack[s.stack.length - 1]; c.save(); c.setLineDash([5, 7]); c.strokeStyle = 'rgba(255,201,77,.55)'; c.lineWidth = 1.5; [tp.x, tp.x + tp.w].forEach(x => { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, yOf(s, g, s.stack.length - 1)); c.stroke(); }); c.restore(); }
    s.stack.forEach((b, i) => Art.stone(c, b.x, yOf(s, g, i), b.w, bh, hue(i))); s.chips.forEach(k => Art.stone(c, k.x, k.y, k.w, bh, hue(k.h)));
    if (!s.over) Art.stone(c, s.cur.x, yOf(s, g, s.stack.length) - 4, s.cur.w, bh, hue(s.stack.length), s.cur.gold);
    Art.fxDraw(c, s.parts); c.textAlign = 'center'; c.textBaseline = 'middle';
    if (s.msgT > 0 && s.msg) { c.globalAlpha = Math.min(1, s.msgT * 2); c.fillStyle = GOLD; c.font = '32px "Kaushan Script", cursive'; c.fillText(s.msg, W / 2, H * 0.4); c.globalAlpha = 1; }
    if (s.day === 0 && s.miss === 0) { c.fillStyle = '#a99bb8'; c.font = '600 14px Sora, sans-serif'; c.fillText('Toque para soltar a pedra · encaixe perfeito aumenta o combo', W / 2, H * 0.95); }
  }
});
})();
