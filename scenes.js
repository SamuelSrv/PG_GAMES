/* scenes.js — cenários (pré-renderizados para rodar leve no celular) e objetos dos jogos */
(() => {
'use strict';
const { PINK, GOLD, TAU, hexA } = Art;
const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const cache = {};
function layer(key, W, H, fn) {                                       // desenha uma vez num canvas fora da tela
  const k = key + '|' + W + 'x' + H + '|' + Art.dpr;
  if (!cache[k]) { const cv = document.createElement('canvas'); cv.width = Math.ceil(W * Art.dpr); cv.height = Math.ceil(H * Art.dpr); const c = cv.getContext('2d'); c.scale(Art.dpr, Art.dpr); fn(c, W, H); cache[k] = cv; }
  return cache[k];
}
const sky = (c, W, H, stops) => { const g = c.createLinearGradient(0, 0, 0, H); stops.forEach(([p, col]) => g.addColorStop(p, col)); c.fillStyle = g; c.fillRect(0, 0, W, H); };
function ridge(c, W, H, y, amp, seed, col) {                          // serra periódica (emenda perfeita para rolar)
  c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
  for (let x = 0; x <= W; x += 6) c.lineTo(x, y - amp * (0.6 * Math.sin(TAU * x / W + seed) + 0.4 * Math.sin(TAU * 3 * x / W + seed * 2)));
  c.lineTo(W, H); c.fill();
}
function flame(c, x, y, s, t) {
  const f = 1 + 0.15 * Math.sin(t * 14 + x); c.fillStyle = GOLD; c.beginPath(); c.ellipse(x, y, 4 * s, 9 * s * f, 0, 0, TAU); c.fill();
  c.fillStyle = PINK; c.beginPath(); c.ellipse(x, y + 2 * s, 2 * s, 5 * s * f, 0, 0, TAU); c.fill();
}
function stars(c, W, H, n, t) { c.fillStyle = '#fff'; for (let i = 0; i < n; i++) { c.globalAlpha = 0.25 + 0.5 * Math.abs(Math.sin(t * 1.5 + i)); c.fillRect(hash(i) * W, hash(i + 99) * H * 0.5, 1.6, 1.6); } c.globalAlpha = 1; }

/* Fundo estático por jogo */
const STATIC = {
  corrida: (c, W, H) => sky(c, W, H, [[0, '#0d0518'], [0.55, '#4a1450'], [1, '#ff2d95']]),
  muros: (c, W, H) => {
    sky(c, W, H, [[0, '#06050a'], [0.7, '#2a0e3d'], [1, '#7a1a55']]); c.fillStyle = GOLD; c.beginPath(); c.arc(W * 0.82, H * 0.15, 15, 0, TAU); c.fill();
    ridge(c, W, H, H * 0.6, 30, 2, '#150a24');
    for (let i = 0; i < 9; i++) { const x = i * W / 8.2, w = 26 + hash(i) * 26, h = H * (0.1 + hash(i + 5) * 0.12), y = H * 0.66 - h; c.fillStyle = '#0d0716'; c.fillRect(x, y, w, H); c.fillRect(x - 3, y - 6, w + 6, 6); c.fillStyle = 'rgba(255,45,149,.7)'; c.fillRect(x + w / 2 - 2, y + 12, 4, 7); }
  },
  pesca: (c, W, H) => {
    sky(c, W, H, [[0, '#150828'], [0.5, '#c2386a'], [1, '#ff9a6a']]); c.fillStyle = GOLD; c.beginPath(); c.arc(W * 0.5, H * 0.5, Math.min(W, H) * 0.09, 0, TAU); c.fill();
    ridge(c, W, H, H * 0.5, 26, 4, '#2a1040'); const g = c.createLinearGradient(0, H * 0.5, 0, H); g.addColorStop(0, '#3a1456'); g.addColorStop(1, '#07040e'); c.fillStyle = g; c.fillRect(0, H * 0.5, W, H * 0.5);
    c.fillStyle = 'rgba(255,201,77,.25)'; for (let i = 0; i < 7; i++) { const w = 90 - i * 11; c.fillRect(W * 0.5 - w / 2, H * 0.5 + 8 + i * 14, w, 3); }
  },
  davi: (c, W, H) => {
    sky(c, W, H, [[0, '#1b0a2a'], [0.55, '#a2336c'], [1, '#ffb04d']]); c.fillStyle = '#ffe3a0'; c.beginPath(); c.arc(W * 0.3, H * 0.4, 24, 0, TAU); c.fill();
    ridge(c, W, H, H * 0.58, 38, 5, '#2a0f3a'); ridge(c, W, H, H * 0.7, 26, 7, '#0e0616');
    c.fillStyle = '#0e0616'; [0.04, 0.14, 0.8, 0.9].forEach((p, i) => { const x = W * p, y = H * 0.74 + (i % 2) * 8; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 22, y - 34); c.lineTo(x + 44, y); c.fill(); });
  },
  sansao: (c, W, H) => {
    const g = c.createRadialGradient(W / 2, H * 0.4, 10, W / 2, H * 0.4, H * 0.8); g.addColorStop(0, '#3a0f3a'); g.addColorStop(1, '#09050f'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,45,149,.25)'; c.lineWidth = 3;
    for (let i = 0; i < 3; i++) { const x = W * (0.17 + i * 0.33); c.beginPath(); c.arc(x, H * 0.5, W * 0.14, Math.PI, 0); c.moveTo(x + W * 0.14, H * 0.5); c.lineTo(x + W * 0.14, H * 0.7); c.moveTo(x - W * 0.14, H * 0.5); c.lineTo(x - W * 0.14, H * 0.7); c.stroke(); }
    c.fillStyle = '#050308'; for (let i = 0; i < 14; i++) { const x = (i + 0.5) * W / 14, y = H * 0.3; c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill(); c.fillRect(x - 11, y + 8, 22, 26); }
  }
};
function bg(c, W, H, id, t = 0) {
  c.drawImage(layer('bg-' + id, W, H, STATIC[id]), 0, 0, W, H);
  if (id === 'muros') { stars(c, W, H, 40, t); flame(c, W * 0.06, H * 0.58, 1, t); flame(c, W * 0.94, H * 0.58, 1, t); }
  if (id === 'sansao') { flame(c, W * 0.05, H * 0.42, 1.2, t); flame(c, W * 0.95, H * 0.42, 1.2, t); }
  if (id === 'pesca' || id === 'corrida') stars(c, W, H, 20, t);
}
/* Fundo da corrida: céu + nuvem que cresce + 2 serras rolando */
function runnerBg(c, W, H, dist, t, rain) {
  c.drawImage(layer('bg-corrida', W, H, STATIC.corrida), 0, 0, W, H); stars(c, W, H, 30, t);
  const r = 8 + Math.min(t, 60) * 0.7; c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(W * 0.78, H * 0.3, r * 1.7, r, 0, 0, TAU); c.fill();
  [['far', H * 0.62, 55, 1, '#1a0a2a', 0.15], ['near', H * 0.74, 36, 3, '#09040f', 0.4]].forEach(([n, y, a, s, col, sp]) => {
    const img = layer('rg-' + n, W, H, (cc, w, h) => ridge(cc, w, h, y, a, s, col)), off = -((dist * sp) % W);
    c.drawImage(img, off, 0, W, H); c.drawImage(img, off + W, 0, W, H);
  });
  if (rain) { c.strokeStyle = 'rgba(190,210,255,.35)'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i < 26; i++) { const x = (hash(i) * W + t * 120) % W, y = (hash(i + 40) * H + t * 520) % H; c.moveTo(x, y); c.lineTo(x - 4, y + 14); } c.stroke(); }
}
function verse(c, W, H, id, yf = 0.2, alpha = 0.5) {
  const i = HubData.GAMES[id], size = Math.max(16, Math.min(24, W / 16));
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = alpha; c.fillStyle = '#fff'; c.font = `${size}px "Kaushan Script", cursive`;
  const lines = ['']; i.verse.split(' ').forEach(w => { const l = lines[lines.length - 1]; if (l && c.measureText(l + ' ' + w).width > W * 0.8) lines.push(w); else lines[lines.length - 1] = l ? l + ' ' + w : w; });
  lines.forEach((l, k) => c.fillText(l, W / 2, H * yf + k * size * 1.25));
  c.fillStyle = PINK; c.font = `600 ${size * 0.6}px Sora, sans-serif`; c.fillText(i.ref, W / 2, H * yf + lines.length * size * 1.25 + 4); c.restore();
}

/* ---------- Objetos ---------- */
function fish(c, x, y, s, gold, ang = 0) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s); c.fillStyle = gold ? GOLD : '#cfe3f0';
  c.beginPath(); c.ellipse(0, 0, 16, 8, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-13, 0); c.lineTo(-25, -9); c.lineTo(-25, 9); c.closePath(); c.fill();
  if (gold) { c.strokeStyle = '#fff6c0'; c.lineWidth = 1.5; c.stroke(); } c.fillStyle = '#07060c'; c.beginPath(); c.arc(8, -2, 1.8, 0, TAU); c.fill(); c.restore();
}
function rock(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#4a4560'; c.strokeStyle = PINK; c.lineWidth = 2; c.beginPath(); c.moveTo(-16, 10); c.lineTo(-12, -8); c.lineTo(2, -15); c.lineTo(15, -5); c.lineTo(17, 10); c.closePath(); c.fill(); c.stroke(); c.restore(); }
function anchor(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#b8c2d6'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.arc(0, -16, 4, 0, TAU); c.moveTo(0, -12); c.lineTo(0, 16); c.moveTo(-9, -5); c.lineTo(9, -5);
  c.moveTo(-15, 6); c.quadraticCurveTo(-12, 18, 0, 17); c.quadraticCurveTo(12, 18, 15, 6); c.stroke(); c.restore();
}
function scroll(c, x, y, s, gold) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = gold ? '#ffe28a' : '#f3e3b5'; c.fillRect(-11, -14, 22, 28); c.fillStyle = gold ? '#e0a418' : '#c9a25a'; c.fillRect(-14, -16, 28, 5); c.fillRect(-14, 11, 28, 5);
  c.fillStyle = '#a9772c'; for (let i = 0; i < 3; i++) c.fillRect(-7, -8 + i * 7, 14, 2); if (gold) { c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.strokeRect(-11, -14, 22, 28); } c.restore();
}
function idol(c, x, y, w, h) {                                        // ídolo de Baal em pé no chão (y = chão)
  c.save(); const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#2a1230'); g.addColorStop(0.5, '#5a2766'); g.addColorStop(1, '#2a1230');
  c.fillStyle = g; c.fillRect(x - w / 2, y - h, w, h); c.strokeStyle = PINK; c.lineWidth = 2; c.strokeRect(x - w / 2, y - h, w, h);
  c.fillStyle = '#6a2a70'; c.fillRect(x - w / 2 - 5, y - h - 2, w + 10, 12);
  c.strokeStyle = GOLD; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); [-1, 1].forEach(s => { c.moveTo(x + s * (w / 2 + 2), y - h + 2); c.quadraticCurveTo(x + s * (w / 2 + 18), y - h, x + s * (w / 2 + 12), y - h - 22); }); c.stroke();
  c.fillStyle = GOLD; [-1, 1].forEach(s => { c.beginPath(); c.arc(x + s * 8, y - h * 0.55, 2.6, 0, TAU); c.fill(); }); c.restore();
}
function altar(c, x, y, w, h, t) {                                    // altar de Baal baixo e largo, com fogo
  c.save(); c.fillStyle = '#3a1a44'; c.fillRect(x - w / 2, y - h, w, h); c.strokeStyle = PINK; c.lineWidth = 2; c.strokeRect(x - w / 2, y - h, w, h);
  c.fillStyle = '#5a2766'; c.fillRect(x - w / 2 - 4, y - h - 6, w + 8, 8); flame(c, x, y - h - 14, 1.1, t); c.restore();
}
function raven(c, x, y, t) {
  c.save(); c.translate(x, y); const f = Math.sin(t * 16) * 9; c.fillStyle = '#16101e'; c.strokeStyle = '#6a4a8a'; c.lineWidth = 1;
  c.beginPath(); c.ellipse(0, 0, 14, 7, 0, 0, TAU); c.fill(); c.stroke();
  [-1, 1].forEach(s => { c.beginPath(); c.moveTo(s * 2, -2); c.quadraticCurveTo(s * 14, -16 - f * s * s, s * 24, -4 + f); c.quadraticCurveTo(s * 12, -2, s * 2, 3); c.closePath(); c.fill(); c.stroke(); });
  c.fillStyle = '#16101e'; c.beginPath(); c.arc(-14, -2, 5, 0, TAU); c.fill(); c.fillStyle = GOLD; c.beginPath(); c.moveTo(-18, -2); c.lineTo(-25, 0); c.lineTo(-18, 1.5); c.fill(); c.fillStyle = PINK; c.fillRect(-16, -4, 2, 2); c.restore();
}
function boat(c, x, y, w) {
  c.save(); c.translate(x, y); c.fillStyle = '#6b3b22'; c.beginPath(); c.moveTo(-w / 2, -8); c.quadraticCurveTo(-w / 2 + 6, 14, -w / 4, 16); c.lineTo(w / 4, 16); c.quadraticCurveTo(w / 2 - 6, 14, w / 2, -8); c.quadraticCurveTo(0, -2, -w / 2, -8); c.fill();
  c.strokeStyle = '#c98f5a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-w / 2 + 4, 2); c.lineTo(w / 2 - 4, 2); c.stroke(); c.restore();
}
function stone(c, x, y, w, h, hue, gold) {
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, `hsl(${hue} 70% 62%)`); g.addColorStop(1, `hsl(${hue} 70% 38%)`); c.fillStyle = gold ? '#ffd35a' : g; c.fillRect(x, y, w, h - 2);
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 3); c.strokeStyle = 'rgba(0,0,0,.25)';
  for (let i = x + 36; i < x + w - 8; i += 36) { c.beginPath(); c.moveTo(i, y); c.lineTo(i, y + h - 2); c.stroke(); }
}
function pillar(c, x, yTop, yBot, w) {
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#2a1a3a'); g.addColorStop(0.45, '#6a4a7a'); g.addColorStop(1, '#251534'); c.fillStyle = g; c.fillRect(x - w / 2, yTop, w, yBot - yTop);
  c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x - w / 2 + i * w / 4, yTop); c.lineTo(x - w / 2 + i * w / 4, yBot); c.stroke(); }
  c.fillStyle = '#8a6a9a'; c.fillRect(x - w / 2 - 8, yTop, w + 16, 14); c.fillRect(x - w / 2 - 8, yBot - 12, w + 16, 12);
}

/* Cenas estáticas para as miniaturas do menu (com o personagem escolhido) */
const tcache = {};
function thumb(id, w, h, who) {
  const key = id + w + JSON.stringify(who.look) + (who.img ? 'i' : ''); if (tcache[key]) return tcache[key];
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'), od = Art.dpr; Art.dpr = 1;
  bg(c, w, h, id, 3); const gy = h * 0.97, me = o => who.img ? Art.sprite(c, who.img, o) : Art.figure(c, who.look, { t: 0, ...o });
  if (id === 'corrida') { idol(c, w * 0.85, gy, 26, h * 0.3); me({ x: w * 0.38, y: gy, h: h * 0.62, pose: 'run', ph: 0.2 }); }
  if (id === 'muros') { [0, 1, 2].forEach(i => stone(c, w * 0.5 + i * 8, gy - (i + 1) * h * 0.1, w * 0.4 - i * 14, h * 0.1, 280 + i * 20)); me({ x: w * 0.27, y: gy, h: h * 0.6, prop: 'trowel' }); }
  if (id === 'pesca') { boat(c, w * 0.5, h * 0.8, w * 0.55); me({ x: w * 0.5, y: h * 0.78, h: h * 0.55, pose: 'throw', prop: 'net' }); }
  if (id === 'davi') { Art.figure(c, HubData.NPC.golias, { x: w * 0.66, y: gy, h: h * 0.8, t: 0, prop: 'spear' }); me({ x: w * 0.2, y: gy, h: h * 0.45, pose: 'throw', prop: 'sling' }); }
  if (id === 'sansao') { pillar(c, w * 0.2, h * 0.12, gy, w * 0.16); pillar(c, w * 0.8, h * 0.12, gy, w * 0.16); me({ x: w * 0.5, y: gy, h: h * 0.62, pose: 'push', mood: 'strain' }); }
  Art.dpr = od; return (tcache[key] = cv.toDataURL());
}
Object.assign(Art, { bg, runnerBg, verse, flame, fish, rock, anchor, scroll, idol, altar, raven, boat, stone, pillar, thumb, layer });
})();
