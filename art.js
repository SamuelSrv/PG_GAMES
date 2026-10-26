/* art.js — arte vetorial desenhada em código (sem emojis): personagens bíblicos, cenários e miniaturas */
(() => {
'use strict';
const PINK = '#ff2d95', GOLD = '#ffc94d', VIO = '#b36bff';

/* Personagem, referência e versículo de cada jogo (confira se o texto bate com a versão da Bíblia da sua igreja) */
const INFO = {
  corrida: { name: 'Corrida da Fé', hero: 'Elias', ref: '1 Rs 18:46', verse: 'A mão do Senhor foi sobre Elias, e ele correu.' },
  muros:   { name: 'Muros de Neemias', hero: 'Neemias', ref: 'Ne 2:18', verse: 'Levantemo-nos e edifiquemos.' },
  pesca:   { name: 'Pescadores de Homens', hero: 'Pedro', ref: 'Mt 4:19', verse: 'Vinde após mim, e eu vos farei pescadores de homens.' },
  davi:    { name: 'Funda de Davi', hero: 'Davi', ref: '1 Sm 17:47', verse: 'Do Senhor é a guerra.' },
  sansao:  { name: 'Força de Sansão', hero: 'Sansão', ref: 'Jz 16:28', verse: 'Esforça-me só esta vez, ó Deus.' }
};
const CHAR = {
  davi:    { tunic: '#d94c8f', head: 'hair', hair: '#3b2414', prop: 'sling' },
  ester:   { tunic: '#8f45e0', head: 'veil', hair: '#2a1a14', skin: '#d9a073', cloth: '#f4e9ff' },
  daniel:  { tunic: '#2f7fd0', head: 'turban', cloth: '#f2eadb', beard: true },
  elias:   { tunic: '#8a5a32', head: 'hair', hair: '#2a1a10', beard: true, prop: 'staff' },
  neemias: { tunic: '#2f6fb0', head: 'turban', cloth: '#efe7d2', beard: true, prop: 'trowel' },
  pedro:   { tunic: '#3b8f8a', head: 'turban', cloth: '#d2b47c', beard: true, prop: 'net' },
  golias:  { tunic: '#7a4a22', head: 'helmet', beard: true, prop: 'spear', shield: true, skin: '#b87a52', sash: '#b9833f' },
  sansao:  { bare: true, tunic: '#efe3c8', head: 'long', hair: '#2a1608', beard: true, skin: '#c98856' },
  moises:  { tunic: '#c9b79a', head: 'hair', hair: '#e9e4dc', beard: 'long', prop: 'staff', skin: '#c58a5c', sash: '#7a5a3a' },
  debora:  { tunic: '#c2417a', head: 'veil', cloth: '#ffe9c2', hair: '#2a1a14', skin: '#b87a52' },
  jose:    { tunic: '#e0553a', stripes: true, head: 'hair', hair: '#2a1a10', skin: '#c58a5c' },
  rute:    { tunic: '#3f8f5f', head: 'veil', cloth: '#f2e6c8', skin: '#d9a073', prop: 'wheat' },
  josue:   { tunic: '#6a5a8a', head: 'helmet', beard: true, prop: 'sword', skin: '#b87a52' },
  gideao:  { tunic: '#9a6a2a', head: 'hair', hair: '#3b2414', beard: true, prop: 'shofar' },
  paulo:   { tunic: '#7a4a9a', head: 'bald', hair: '#4a3a30', beard: true, prop: 'scroll' },
  miria:   { tunic: '#2a9aa8', head: 'veil', cloth: '#ffd9ec', skin: '#c98856', prop: 'tambourine' },
  salomao: { tunic: '#6a2a9a', head: 'crown', hair: '#2a1608', beard: true, sash: '#ffc94d', prop: 'scroll' }
};
const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

/* ---------- Elementos ---------- */
function crown(c, x, y, s, col = PINK) { // coroa do logo do PG Jovem
  c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = c.fillStyle = col; c.lineWidth = 4; c.lineJoin = 'round'; c.shadowColor = col; c.shadowBlur = 12;
  c.beginPath(); c.moveTo(-30, 10); c.lineTo(-34, -18); c.lineTo(-14, -2); c.lineTo(0, -24); c.lineTo(14, -2); c.lineTo(34, -18); c.lineTo(30, 10); c.closePath(); c.stroke();
  [[-34, -22], [0, -28], [34, -22]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 4, 0, 7); c.fill(); });
  c.restore();
}
function flame(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.shadowColor = GOLD; c.shadowBlur = 14; const f = 1 + 0.15 * Math.sin(t * 14 + x);
  c.fillStyle = GOLD; c.beginPath(); c.ellipse(0, 0, 4 * s, 9 * s * f, 0, 0, 7); c.fill();
  c.fillStyle = PINK; c.beginPath(); c.ellipse(0, 2 * s, 2 * s, 5 * s * f, 0, 0, 7); c.fill(); c.restore();
}
function figure(c, key, o = {}) { // personagem em silhueta colorida com contorno neon
  const d = { ...CHAR[key], ...o }, k = d.h / 100, sw = Math.sin((d.ph || 0) * 6.283);
  const skin = d.skin || '#c98f63', hair = d.hair || '#2a1a10', pose = d.pose || 'stand';
  c.save(); c.translate(d.x, d.y); c.scale(k * (d.dir || 1), k); c.lineCap = c.lineJoin = 'round'; c.shadowColor = PINK; c.shadowBlur = 9;
  const line = (x1, y1, x2, y2, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };
  const run = pose === 'run';
  line(-3, -42, run ? sw * 17 : -6, -3, 8, '#2b1d22'); line(3, -42, run ? -sw * 17 : 6, -3, 8, '#2b1d22');
  c.fillStyle = d.head === 'long' ? hair : d.cloth || '#fff';                      // atrás da cabeça: cabelo longo / véu
  if (d.head === 'long') { c.beginPath(); c.moveTo(-9, -96); c.quadraticCurveTo(-18, -80, -13, -58); c.lineTo(13, -58); c.quadraticCurveTo(18, -80, 9, -96); c.fill(); }
  if (d.head === 'veil') { c.beginPath(); c.moveTo(-10, -94); c.lineTo(-16, -58); c.lineTo(16, -58); c.lineTo(10, -94); c.fill(); }
  c.fillStyle = d.bare ? skin : d.tunic; c.beginPath();                              // tronco
  c.moveTo(-11, -80); c.lineTo(11, -80); c.lineTo(d.bare ? 12 : 15, d.bare ? -56 : -36); c.lineTo(d.bare ? -12 : -15, d.bare ? -56 : -36); c.closePath(); c.fill();
  if (d.bare) { c.fillStyle = d.tunic; c.beginPath(); c.moveTo(-13, -58); c.lineTo(13, -58); c.lineTo(15, -36); c.lineTo(-15, -36); c.closePath(); c.fill(); }
  if (d.stripes) ['#ffc94d', '#4aa8ff', '#5dffb0'].forEach((col, i) => { c.fillStyle = col; c.fillRect(-12, -76 + i * 11, 24, 4); });   // túnica listrada
  c.fillStyle = d.sash || GOLD; c.fillRect(-13, -62, 26, 4);
  const A = { run: [sw, -sw], throw: [0.2, 2.4], push: [-1.65, 1.65], up: [-2.7, 2.7], stand: [0.12, 0.12] }[pose] || [0.1, 0.1];
  const hand = (sx, a) => [sx + Math.sin(a) * 27, -78 + Math.cos(a) * 27], hl = hand(-11, A[0]), hr = hand(11, A[1]);
  line(-11, -78, hl[0], hl[1], 7, skin); line(11, -78, hr[0], hr[1], 7, skin);
  c.fillStyle = skin; c.beginPath(); c.arc(0, -90, 9, 0, 7); c.fill();               // cabeça
  const cap = (col, r = 10) => { c.fillStyle = col; c.beginPath(); c.arc(0, -91, r, Math.PI, 0); c.fill(); };
  if (d.head === 'hair' || d.head === 'long') cap(hair);
  if (d.head === 'turban') { c.fillStyle = d.cloth; c.beginPath(); c.ellipse(0, -96, 12, 7, 0, 0, 7); c.fill(); }
  if (d.head === 'veil') { cap(d.cloth, 11); if (key === 'ester') crown(c, 0, -104, 0.2, GOLD); }
  if (d.head === 'crown') { cap(hair); crown(c, 0, -105, 0.26, GOLD); }
  if (d.head === 'bald') { c.fillStyle = hair; c.fillRect(-9, -92, 3, 6); c.fillRect(6, -92, 3, 6); }
  if (d.head === 'helmet') { cap('#b9833f', 11); c.fillRect(-11, -92, 4, 11); c.fillRect(7, -92, 4, 11); c.fillStyle = PINK; c.fillRect(-1.5, -106, 3, 8); }
  if (d.beard) { c.fillStyle = hair; c.beginPath(); c.arc(0, -87, 8, 0.15, Math.PI - 0.15); c.fill();
    if (d.beard === 'long') { c.beginPath(); c.moveTo(-8, -86); c.lineTo(0, -62); c.lineTo(8, -86); c.fill(); } }
  const [hx, hy] = hr;                                                               // objetos
  if (d.prop === 'staff') line(hx, hy + 24, hx + 3, hy - 52, 3.5, '#a07a44');
  if (d.prop === 'spear') { line(hx - 4, hy + 40, hx + 8, hy - 70, 3, '#9a9aa8'); c.fillStyle = '#cfd2dd'; c.beginPath(); c.moveTo(hx + 8, hy - 84); c.lineTo(hx + 13, hy - 68); c.lineTo(hx + 3, hy - 68); c.fill(); }
  if (d.prop === 'trowel') { c.fillStyle = '#cfd2dd'; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + 11, hy - 3); c.lineTo(hx + 2, hy - 11); c.fill(); }
  if (d.prop === 'sling') { c.strokeStyle = '#e8d7b0'; c.lineWidth = 1.5; c.beginPath(); c.arc(hx, hy - 14, 9, 0, 7); c.stroke(); c.fillStyle = '#ddd'; c.beginPath(); c.arc(hx + 9, hy - 14, 2.6, 0, 7); c.fill(); }
  if (d.prop === 'net') { c.strokeStyle = '#d9e6ee'; c.lineWidth = 1.4; c.beginPath(); c.arc(hx + 8, hy, 15, 0.1, Math.PI + 0.2); for (let i = -1; i <= 1; i++) { c.moveTo(hx + 8 + i * 8, hy + 1); c.lineTo(hx + 8 + i * 4, hy + 14); } c.stroke(); }
  if (d.prop === 'sword') { line(hx, hy + 6, hx + 4, hy - 46, 3, '#cfd2dd'); line(hx - 6, hy - 2, hx + 8, hy - 2, 3, GOLD); }
  if (d.prop === 'scroll') { c.fillStyle = '#f3e3b5'; c.fillRect(hx - 5, hy - 12, 10, 18); c.fillStyle = '#c9a25a'; c.fillRect(hx - 6, hy - 13, 12, 3); c.fillRect(hx - 6, hy + 3, 12, 3); }
  if (d.prop === 'shofar') { c.strokeStyle = '#d9b36a'; c.lineWidth = 5; c.beginPath(); c.moveTo(hx, hy - 4); c.quadraticCurveTo(hx + 16, hy - 8, hx + 14, hy - 26); c.stroke(); }
  if (d.prop === 'tambourine') { c.strokeStyle = GOLD; c.lineWidth = 3; c.beginPath(); c.arc(hx + 4, hy - 12, 10, 0, 7); c.stroke(); c.fillStyle = '#fff'; [0, 2, 4].forEach(k => { c.beginPath(); c.arc(hx + 4 + Math.cos(k) * 10, hy - 12 + Math.sin(k) * 10, 1.6, 0, 7); c.fill(); }); }
  if (d.prop === 'wheat') { c.strokeStyle = '#e8c35a'; c.lineWidth = 2; c.beginPath(); [-4, 0, 4].forEach(o => { c.moveTo(hx, hy + 6); c.lineTo(hx + o * 2, hy - 28); }); c.stroke(); c.fillStyle = '#e8c35a'; [-4, 0, 4].forEach(o => { c.beginPath(); c.ellipse(hx + o * 2, hy - 31, 2.4, 6, 0, 0, 7); c.fill(); }); }
  if (d.shield) { c.fillStyle = '#b9833f'; c.beginPath(); c.arc(hl[0] - 4, hl[1], 15, 0, 7); c.fill(); c.strokeStyle = GOLD; c.lineWidth = 2; c.stroke(); }
  c.restore();
}
function portrait(key, size) { // busto para avatar (data URL)
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size * 0.4, 4, size / 2, size / 2, size * 0.75); g.addColorStop(0, '#4a1240'); g.addColorStop(1, '#07060c');
  c.fillStyle = g; c.fillRect(0, 0, size, size);
  const h = size * 1.35; figure(c, key, { x: size / 2, y: size * 0.4 + 0.9 * h, h });
  return cv.toDataURL();
}
function fish(c, x, y, s, gold, ang = 0) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s); c.fillStyle = gold ? GOLD : '#cfe3f0'; c.shadowColor = gold ? GOLD : '#9fd3ff'; c.shadowBlur = 10;
  c.beginPath(); c.ellipse(0, 0, 16, 8, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(-13, 0); c.lineTo(-25, -9); c.lineTo(-25, 9); c.closePath(); c.fill();
  c.fillStyle = '#07060c'; c.beginPath(); c.arc(8, -2, 1.8, 0, 7); c.fill(); c.restore();
}
function rock(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#4a4560'; c.strokeStyle = PINK; c.lineWidth = 2; c.shadowColor = PINK; c.shadowBlur = 8;
  c.beginPath(); c.moveTo(-16, 10); c.lineTo(-12, -8); c.lineTo(2, -15); c.lineTo(15, -5); c.lineTo(17, 10); c.closePath(); c.fill(); c.stroke(); c.restore();
}
function anchor(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#b8c2d6'; c.lineWidth = 4; c.lineCap = 'round'; c.shadowColor = PINK; c.shadowBlur = 8;
  c.beginPath(); c.arc(0, -16, 4, 0, 7); c.moveTo(0, -12); c.lineTo(0, 16); c.moveTo(-9, -5); c.lineTo(9, -5);
  c.moveTo(-15, 6); c.quadraticCurveTo(-12, 18, 0, 17); c.quadraticCurveTo(12, 18, 15, 6); c.stroke(); c.restore();
}
function scroll(c, x, y, s) { // pergaminho
  c.save(); c.translate(x, y); c.scale(s, s); c.shadowColor = GOLD; c.shadowBlur = 14; c.fillStyle = '#f3e3b5'; c.fillRect(-11, -14, 22, 28);
  c.fillStyle = '#c9a25a'; c.fillRect(-14, -16, 28, 5); c.fillRect(-14, 11, 28, 5); c.fillStyle = '#a9772c'; for (let i = 0; i < 3; i++) c.fillRect(-7, -8 + i * 7, 14, 2); c.restore();
}
function idol(c, x, yTop, yBot, w, capAtBottom) { // coluna de ídolo de Baal (chifres na ponta)
  c.save(); c.shadowColor = PINK; c.shadowBlur = 12; const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, '#2a1230'); g.addColorStop(0.5, '#51235a'); g.addColorStop(1, '#2a1230'); c.fillStyle = g; c.fillRect(x - w / 2, yTop, w, yBot - yTop);
  c.strokeStyle = PINK; c.lineWidth = 2; c.strokeRect(x - w / 2, yTop, w, yBot - yTop);
  const hy = capAtBottom ? yBot : yTop, dir = capAtBottom ? 1 : -1;
  c.fillStyle = '#6a2a70'; c.fillRect(x - w / 2 - 6, capAtBottom ? yBot - 14 : yTop, w + 12, 14);
  c.strokeStyle = GOLD; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath();
  [-1, 1].forEach(sd => { c.moveTo(x + sd * (w / 2 + 3), hy - dir * 4); c.quadraticCurveTo(x + sd * (w / 2 + 20), hy - dir * 2, x + sd * (w / 2 + 14), hy - dir * 24); });
  c.stroke(); c.fillStyle = GOLD; [-1, 1].forEach(sd => { c.beginPath(); c.arc(x + sd * 9, hy - dir * 8, 2.5, 0, 7); c.fill(); }); c.restore();
}
function boat(c, x, y, w) {
  c.save(); c.translate(x, y); c.shadowColor = PINK; c.shadowBlur = 10; c.fillStyle = '#6b3b22'; c.beginPath(); c.moveTo(-w / 2, -8);
  c.quadraticCurveTo(-w / 2 + 6, 14, -w / 4, 16); c.lineTo(w / 4, 16); c.quadraticCurveTo(w / 2 - 6, 14, w / 2, -8); c.quadraticCurveTo(0, -2, -w / 2, -8); c.fill();
  c.strokeStyle = '#c98f5a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-w / 2 + 4, 2); c.lineTo(w / 2 - 4, 2); c.stroke(); c.restore();
}
function stone(c, x, y, w, h, hue) { // bloco de pedra da muralha
  c.save(); c.shadowColor = `hsl(${hue} 100% 60%)`; c.shadowBlur = 10; const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, `hsl(${hue} 70% 62%)`); g.addColorStop(1, `hsl(${hue} 70% 38%)`); c.fillStyle = g; c.fillRect(x, y, w, h - 2); c.shadowBlur = 0;
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 3); c.strokeStyle = 'rgba(0,0,0,.25)';
  for (let i = x + 36; i < x + w - 8; i += 36) { c.beginPath(); c.moveTo(i, y); c.lineTo(i, y + h - 2); c.stroke(); } c.restore();
}
function pillar(c, x, yTop, yBot, w) { // pilar do templo de Dagom
  c.save(); c.shadowColor = PINK; c.shadowBlur = 14; const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, '#2a1a3a'); g.addColorStop(0.45, '#6a4a7a'); g.addColorStop(1, '#251534'); c.fillStyle = g; c.fillRect(x - w / 2, yTop, w, yBot - yTop);
  c.shadowBlur = 0; c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x - w / 2 + i * w / 4, yTop); c.lineTo(x - w / 2 + i * w / 4, yBot); c.stroke(); }
  c.fillStyle = '#8a6a9a'; c.fillRect(x - w / 2 - 8, yTop, w + 16, 14); c.fillRect(x - w / 2 - 8, yBot - 12, w + 16, 12); c.restore();
}

/* ---------- Cenários ---------- */
function sky(c, W, H, stops) { const g = c.createLinearGradient(0, 0, 0, H); stops.forEach(([p, col]) => g.addColorStop(p, col)); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function stars(c, W, H, n, t = 0) { c.fillStyle = '#fff'; for (let i = 0; i < n; i++) { c.globalAlpha = 0.25 + 0.5 * Math.abs(Math.sin(t * 1.5 + i)); c.fillRect(hash(i) * W, hash(i + 99) * H * 0.55, 1.6, 1.6); } c.globalAlpha = 1; }
function ridge(c, W, H, y, amp, seed, col, off = 0) {
  c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
  for (let x = 0; x <= W; x += 8) { const u = x + off; c.lineTo(x, y - amp * (0.6 * Math.sin(u / 90 + seed) + 0.4 * Math.sin(u / 37 + seed * 2))); }
  c.lineTo(W, H); c.fill();
}
function bg(c, W, H, id, t = 0) {
  c.shadowBlur = 0; c.globalAlpha = 1;
  const S = {
    corrida() { // Monte Carmelo ao entardecer; a pequena nuvem cresce (1 Rs 18:44)
      sky(c, W, H, [[0, '#0d0518'], [0.55, '#4a1450'], [1, '#ff2d95']]); stars(c, W, H, 40, t);
      const r = 8 + Math.min(t, 40) * 0.9; c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(W * 0.8, H * 0.46, r * 1.7, r, 0, 0, 7); c.fill();
      ridge(c, W, H, H * 0.66, 55, 1, '#1a0a2a', t * 30); ridge(c, W, H, H * 0.82, 36, 3, '#09040f', t * 70);
    },
    muros() { // Jerusalém à noite, com tochas
      sky(c, W, H, [[0, '#06050a'], [0.7, '#2a0e3d'], [1, '#7a1a55']]); stars(c, W, H, 70, t);
      c.fillStyle = GOLD; c.shadowColor = GOLD; c.shadowBlur = 24; c.beginPath(); c.arc(W * 0.82, H * 0.15, 15, 0, 7); c.fill(); c.shadowBlur = 0;
      ridge(c, W, H, H * 0.6, 30, 2, '#150a24');
      for (let i = 0; i < 9; i++) {
        const x = i * W / 8.2, w = 26 + hash(i) * 26, h = H * (0.1 + hash(i + 5) * 0.12), y = H * 0.66 - h;
        c.fillStyle = '#0d0716'; c.fillRect(x, y, w, H); c.fillRect(x - 3, y - 6, w + 6, 6);
        c.fillStyle = PINK; c.globalAlpha = 0.5 + 0.4 * Math.sin(t * 3 + i); c.fillRect(x + w / 2 - 2, y + 12, 4, 7); c.globalAlpha = 1;
      }
      flame(c, W * 0.06, H * 0.58, 1, t); flame(c, W * 0.94, H * 0.58, 1, t);
    },
    pesca() { // Mar da Galileia ao pôr do sol
      sky(c, W, H, [[0, '#150828'], [0.5, '#c2386a'], [1, '#ff9a6a']]); stars(c, W, H, 25, t);
      c.fillStyle = GOLD; c.shadowColor = GOLD; c.shadowBlur = 30; c.beginPath(); c.arc(W * 0.5, H * 0.5, Math.min(W, H) * 0.09, 0, 7); c.fill(); c.shadowBlur = 0;
      ridge(c, W, H, H * 0.5, 26, 4, '#2a1040');
      const g = c.createLinearGradient(0, H * 0.5, 0, H); g.addColorStop(0, '#3a1456'); g.addColorStop(1, '#07040e'); c.fillStyle = g; c.fillRect(0, H * 0.5, W, H * 0.5);
      c.fillStyle = 'rgba(255,201,77,.25)'; for (let i = 0; i < 7; i++) { const w = 90 - i * 11; c.fillRect(W * 0.5 - w / 2, H * 0.5 + 8 + i * 14 + Math.sin(t * 2 + i) * 2, w, 3); }
    },
    davi() { // Vale de Elá: acampamento filisteu
      sky(c, W, H, [[0, '#1b0a2a'], [0.55, '#a2336c'], [1, '#ffb04d']]);
      c.fillStyle = '#ffe3a0'; c.beginPath(); c.arc(W * 0.3, H * 0.5, 24, 0, 7); c.fill();
      ridge(c, W, H, H * 0.58, 38, 5, '#2a0f3a'); ridge(c, W, H, H * 0.7, 26, 7, '#0e0616');
      c.fillStyle = '#0e0616'; [0.04, 0.14, 0.8, 0.9].forEach((p, i) => { const x = W * p, y = H * 0.74 + (i % 2) * 8; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 22, y - 34); c.lineTo(x + 44, y); c.fill(); });
    },
    sansao() { // templo de Dagom: arcos, plateia e tochas
      const g = c.createRadialGradient(W / 2, H * 0.4, 10, W / 2, H * 0.4, H * 0.8); g.addColorStop(0, '#3a0f3a'); g.addColorStop(1, '#09050f'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(255,45,149,.25)'; c.lineWidth = 3;
      for (let i = 0; i < 3; i++) { const x = W * (0.17 + i * 0.33); c.beginPath(); c.arc(x, H * 0.5, W * 0.14, Math.PI, 0); c.moveTo(x + W * 0.14, H * 0.5); c.lineTo(x + W * 0.14, H * 0.7); c.moveTo(x - W * 0.14, H * 0.5); c.lineTo(x - W * 0.14, H * 0.7); c.stroke(); }
      c.fillStyle = '#050308'; for (let i = 0; i < 14; i++) { const x = (i + 0.5) * W / 14, y = H * 0.3 + Math.sin(t * 2 + i) * 2; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.fillRect(x - 11, y + 8, 22, 26); }
      flame(c, W * 0.05, H * 0.42, 1.2, t); flame(c, W * 0.95, H * 0.42, 1.2, t);
    }
  };
  S[id](); c.shadowBlur = 0;
}
function verse(c, W, H, id, yf = 0.2, alpha = 0.55) { // versículo gravado no fundo
  const i = INFO[id], size = Math.max(16, Math.min(26, W / 16));
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = alpha; c.shadowColor = PINK; c.shadowBlur = 12; c.fillStyle = '#fff'; c.font = `${size}px "Kaushan Script", cursive`;
  const lines = ['']; i.verse.split(' ').forEach(w => { const l = lines[lines.length - 1]; if (l && c.measureText(l + ' ' + w).width > W * 0.8) lines.push(w); else lines[lines.length - 1] = l ? l + ' ' + w : w; });
  lines.forEach((l, k) => c.fillText(l, W / 2, H * yf + k * size * 1.25));
  c.shadowBlur = 0; c.fillStyle = PINK; c.font = `600 ${size * 0.6}px Sora, sans-serif`; c.fillText(i.ref, W / 2, H * yf + lines.length * size * 1.25 + 4); c.restore();
}
function poster(c, W, H, id) { // cena estática para miniaturas do menu
  bg(c, W, H, id, 3); const gy = H * 0.97;
  if (id === 'corrida') figure(c, 'elias', { x: W * 0.45, y: gy, h: H * 0.62, pose: 'run', ph: 0.2 });
  if (id === 'muros') { [0, 1, 2].forEach(i => stone(c, W * 0.5 + i * 8, gy - (i + 1) * H * 0.1, W * 0.4 - i * 14, H * 0.1, 280 + i * 20)); figure(c, 'neemias', { x: W * 0.28, y: gy, h: H * 0.6 }); }
  if (id === 'pesca') { boat(c, W * 0.5, H * 0.8, W * 0.55); figure(c, 'pedro', { x: W * 0.5, y: H * 0.78, h: H * 0.55, pose: 'throw' }); }
  if (id === 'davi') { figure(c, 'golias', { x: W * 0.64, y: gy, h: H * 0.78 }); figure(c, 'davi', { x: W * 0.2, y: gy, h: H * 0.4, pose: 'throw' }); }
  if (id === 'sansao') { pillar(c, W * 0.2, H * 0.12, gy, W * 0.16); pillar(c, W * 0.8, H * 0.12, gy, W * 0.16); figure(c, 'sansao', { x: W * 0.5, y: gy, h: H * 0.62, pose: 'push' }); }
}
function thumb(id, w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; poster(cv.getContext('2d'), w, h, id); return cv.toDataURL(); }

window.Art = { PINK, GOLD, VIO, INFO, CHAR, figure, portrait, thumb, bg, verse, fish, rock, anchor, scroll, idol, boat, stone, pillar, crown, flame };
})();
