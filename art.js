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
  davi:    { head: 'curly', hair: '#a8552a', skin: '#e3b48c', tunic: '#9a7a3a', trim: '#5a3f1e', sash: '#7a4a22', prop: 'sling' },
  ester:   { build: 'f', head: 'long', hair: '#2a1710', skin: '#d9a073', tunic: '#7a2fc0', trim: '#ffc94d', sash: '#ffc94d', crown: true, veil: '#f1e6ff', lips: '#d4506a' },
  daniel:  { head: 'turban', cloth: '#f2eadb', hair: '#2a1a10', beard: true, skin: '#c58a5c', tunic: '#2f6fb0', trim: '#ffc94d', long: true, sleeve: 'long', prop: 'scroll' },
  moises:  { head: 'hair', hair: '#e9e4dc', beard: 'long', skin: '#c58a5c', tunic: '#d8c7a4', trim: '#8a6a3a', cloak: '#8a5a32', sash: '#7a5a3a', long: true, sleeve: 'long', prop: 'staff' },
  debora:  { build: 'f', head: 'long', hair: '#1f130d', skin: '#9a6038', tunic: '#a02a5a', trim: '#ffc94d', sash: '#ffc94d', veil: '#ffe9c2', lips: '#c0405a' },
  jose:    { head: 'curly', hair: '#2a1a10', skin: '#c58a5c', stripes: true, tunic: '#e0553a', sleeve: 'long' },
  rute:    { build: 'f', head: 'braid', hair: '#4a2a18', skin: '#d9a073', tunic: '#3f8f5f', trim: '#e8c35a', sash: '#e8c35a', veil: '#f2e6c8', prop: 'wheat', lips: '#d4706a' },
  josue:   { head: 'helmet', hair: '#3b2414', beard: true, skin: '#b87a52', tunic: '#6a5a8a', armor: true, prop: 'sword' },
  gideao:  { head: 'hair', hair: '#3b2414', beard: true, skin: '#c98f63', tunic: '#9a6a2a', trim: '#5a3a1a', prop: 'torch' },
  paulo:   { head: 'bald', hair: '#4a3a30', beard: true, skin: '#d9a077', tunic: '#7a4a9a', trim: '#ffc94d', cloak: '#4a2a6a', long: true, sleeve: 'long', prop: 'scroll' },
  miria:   { build: 'f', head: 'curly', hair: '#1a0f0a', skin: '#8a5230', tunic: '#2a9aa8', trim: '#ffd9ec', sash: '#ffd9ec', veil: '#ffd9ec', prop: 'tambourine', lips: '#c0405a' },
  salomao: { head: 'hair', crown: true, hair: '#2a1608', beard: true, skin: '#c58a5c', tunic: '#6a2a9a', trim: '#ffc94d', sash: '#ffc94d', cloak: '#3a1560', long: true, sleeve: 'long', prop: 'scroll' },
  elias:   { head: 'hair', hair: '#3a2415', beard: 'long', skin: '#b87a52', tunic: '#7a5430', cloak: '#5a3a20', sash: '#3a2415', prop: 'staff' },
  neemias: { head: 'turban', cloth: '#efe7d2', hair: '#2a1a10', beard: true, skin: '#c58a5c', tunic: '#2f6fb0', trim: '#ffc94d', prop: 'trowel' },
  pedro:   { head: 'turban', cloth: '#d2b47c', hair: '#6a5a4a', beard: true, skin: '#b07a50', tunic: '#3b8f8a', trim: '#1a4a5e', prop: 'net' },
  golias:  { head: 'helmet', hair: '#2a1a10', beard: true, skin: '#b87a52', tunic: '#7a4a22', armor: true, prop: 'spear', shield: true, sash: '#b9833f' },
  sansao:  { bare: true, head: 'long', hair: '#2a1608', beard: true, skin: '#c98856', tunic: '#efe3c8', muscle: true }
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
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
const INK = '#150b18';
function taper(c, x1, y1, x2, y2, w1, w2, fill) { // membro/forma cônica com contorno
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  c.fillStyle = fill; c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath();
  c.moveTo(x1 + nx * w1, y1 + ny * w1); c.lineTo(x2 + nx * w2, y2 + ny * w2); c.lineTo(x2 - nx * w2, y2 - ny * w2); c.lineTo(x1 - nx * w1, y1 - ny * w1); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.arc(x2, y2, w2 * 0.98, 0, 7); c.fill(); c.beginPath(); c.arc(x1, y1, w1 * 0.98, 0, 7); c.fill();
}
/* Personagem v3. Corpo: build 'f' (vestido) ou masculino; cabelo (head): hair | long | braid | pony | bun | curly | bald | turban | helmet;
   barba (beard: true|'long'); veil (cor do véu); crown; headband; glasses/shades; roupa: tunic, trim, sash, cloak, stripes, armor, bare, muscle, long, sleeve;
   objetos (prop): staff spear trowel sling net sword scroll torch tambourine wheat; pose: stand run throw push up; armR/armL; mood 'strain'. */
function figure(c, key, o = {}) {
  const d = { ...(CHAR[key] || {}), ...o };
  if (d.head === 'veil') { d.head = 'long'; d.veil = d.veil || d.cloth; }
  if (d.head === 'crown') { d.head = 'hair'; d.crown = true; }
  const k = d.h / 100, ph = (d.ph || 0) * 6.283, sw = Math.sin(ph), pose = d.pose || 'stand', tm = performance.now() / 1000, run = pose === 'run';
  const fem = d.build === 'f', skin = d.skin || '#d9a077', hair = d.hair || '#2a1a10', tun = d.tunic || '#7a3fd1', trim = d.trim || shade(tun, -0.3);
  const hl = shade(hair, 0.32), hsh = shade(hair, -0.35), open = d.mood === 'strain' || run || pose === 'up' || pose === 'push', sway = run ? sw * 2.5 : Math.sin(tm * 1.6) * 0.9;
  const W1 = fem ? 11 : 13.5, WW = fem ? 8 : 11.5, hemY = d.bare ? -39 : fem ? -11 : d.long ? -12 : -19, hemW = d.bare ? 12.5 : fem ? 23 : d.long ? 19 : 17;
  const rim = fn => { c.shadowColor = PINK; c.shadowBlur = 7; fn(); c.shadowBlur = 0; };
  const fillStroke = (col, lw = 1.5) => { c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = lw; c.fill(); c.stroke(); };
  c.save(); c.translate(d.x, d.y - (run ? Math.abs(Math.cos(ph)) * 2.5 * k : 0)); c.scale(k * (d.dir || 1), k); c.lineCap = c.lineJoin = 'round';
  // ---- atrás do corpo: capa, cabelo comprido, véu
  if (d.cloak) { c.beginPath(); c.moveTo(-W1 - 2, -58); c.quadraticCurveTo(-27, -35, -24, -8 + sway); c.quadraticCurveTo(0, -3, 24, -8 + sway); c.quadraticCurveTo(27, -35, W1 + 2, -58); c.closePath(); rim(() => fillStroke(shade(d.cloak, -0.12))); }
  if (d.veil) { c.beginPath(); c.moveTo(-18, -82); c.quadraticCurveTo(-28, -58, -23, -36); c.lineTo(23, -36); c.quadraticCurveTo(28, -58, 18, -82); c.closePath(); fillStroke(shade(d.veil, -0.12)); }
  if (d.head === 'long' || d.head === 'braid' || d.head === 'bun') {
    const bot = d.head === 'long' ? -28 : -52, g = c.createLinearGradient(0, -80, 0, bot); g.addColorStop(0, hair); g.addColorStop(1, hsh);
    c.beginPath(); c.moveTo(-16, -84); c.bezierCurveTo(-27, -70, -25, -48, -20, bot); c.quadraticCurveTo(-10, bot + 5 + sway, 0, bot + 1); c.quadraticCurveTo(10, bot + 5 - sway, 20, bot); c.bezierCurveTo(25, -48, 27, -70, 16, -84); c.closePath();
    rim(() => fillStroke(g)); c.strokeStyle = hl; c.lineWidth = 1.1; c.globalAlpha = 0.55;
    if (d.head === 'long') [[-17, -66, -18, -38], [-12, -70, -12, -34], [14, -70, 13, -34], [18, -64, 18, -38]].forEach(([a, b, x, y]) => { c.beginPath(); c.moveTo(a, b); c.quadraticCurveTo(a + (x - a) * 1.6, (b + y) / 2, x, y); c.stroke(); }); c.globalAlpha = 1;
  }
  if (d.head === 'pony') { c.beginPath(); c.moveTo(-12, -86); c.bezierCurveTo(-30, -92, -34, -62, -22, -50); c.bezierCurveTo(-26, -66, -20, -76, -12, -78); c.closePath(); rim(() => fillStroke(hair)); }
  // ---- pernas e sandálias
  const lf = run ? sw * 13 : -5.5, rf = run ? -sw * 13 : 5.5, ll = run ? Math.max(0, sw) * 6 : 0, rl = run ? Math.max(0, -sw) * 6 : 0, leg = shade(skin, -0.12);
  taper(c, -5, -26, lf, -4 - ll, 4.4, 3.2, leg); taper(c, 5, -26, rf, -4 - rl, 4.4, 3.2, leg);
  [[lf, -ll], [rf, -rl]].forEach(([x, y]) => { c.fillStyle = '#5a3520'; c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x + 2, y - 2, 6.8, 3.4, 0, 0, 7); c.fill(); c.stroke(); c.strokeStyle = '#2a170c'; c.beginPath(); c.moveTo(x - 2, y - 5); c.lineTo(x + 3, y - 3.5); c.stroke(); });
  // ---- tronco: túnica / vestido
  const gr = c.createLinearGradient(-16, 0, 16, 0), base = d.bare ? skin : tun; gr.addColorStop(0, shade(base, 0.14)); gr.addColorStop(0.55, base); gr.addColorStop(1, shade(base, -0.28));
  c.beginPath(); c.moveTo(-5.5, -61); c.quadraticCurveTo(-W1 - 1, -61, -W1 - 1.5, -55); c.quadraticCurveTo(-W1 - 1, -47, -WW, -40);
  c.quadraticCurveTo(-WW - 2 - (fem ? 3 : 0), -30, -hemW, hemY + sway * 0.3);
  const n = 4; for (let i = 0; i < n; i++) c.quadraticCurveTo(-hemW + (i + 0.5) * hemW * 2 / n, hemY + (d.bare ? 0 : (i % 2 ? -1 : 1) * (fem ? 2.6 : 1.4)) + sway, -hemW + (i + 1) * hemW * 2 / n, hemY - sway * 0.3 * (i < 2 ? 1 : -1));
  c.quadraticCurveTo(WW + 2 + (fem ? 3 : 0), -30, WW, -40); c.quadraticCurveTo(W1 + 1, -47, W1 + 1.5, -55); c.quadraticCurveTo(W1 + 1, -61, 5.5, -61); c.quadraticCurveTo(0, -55, -5.5, -61); c.closePath();
  rim(() => fillStroke(gr));
  if (!d.bare) {                                                                                  // dobras do tecido + barra
    c.strokeStyle = shade(tun, -0.35); c.lineWidth = 1.1; c.globalAlpha = 0.6;
    [-0.55, -0.15, 0.3, 0.7].forEach(t => { c.beginPath(); c.moveTo(t * WW, -38); c.quadraticCurveTo(t * hemW * 0.9 + 2, -26, t * hemW * 1.05, hemY - 1); c.stroke(); }); c.globalAlpha = 1;
    c.strokeStyle = trim; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-hemW + 1, hemY - 3.5); c.quadraticCurveTo(0, hemY - 1.5 + sway, hemW - 1, hemY - 3.5); c.stroke();
  } else {                                                                                        // peito e abdômen + pano na cintura
    c.strokeStyle = shade(skin, -0.32); c.lineWidth = 1.2; c.beginPath(); c.arc(-5.2, -52, 5, 0.3, Math.PI - 0.5); c.moveTo(10.2, -52); c.arc(5.2, -52, 5, 0.5, Math.PI - 0.3); c.moveTo(0, -57); c.lineTo(0, -41); c.moveTo(-3, -47); c.lineTo(3, -47); c.stroke();
    c.beginPath(); c.moveTo(-WW - 1, -41); c.quadraticCurveTo(0, -38, WW + 1, -41); c.lineTo(hemW + 5, -19 + sway * 0.4); c.quadraticCurveTo(0, -16, -hemW - 5, -19 + sway * 0.4); c.closePath(); fillStroke(tun);
  }
  c.beginPath(); c.moveTo(-5.5, -61); c.quadraticCurveTo(0, fem ? -52 : -50, 5.5, -61); c.quadraticCurveTo(0, -56, -5.5, -61); fillStroke(skin, 1.1);       // decote
  c.strokeStyle = trim; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-5.5, -61); c.quadraticCurveTo(0, fem ? -51 : -49, 5.5, -61); c.stroke();
  if (d.stripes) ['#ffc94d', '#4aa8ff', '#5dffb0'].forEach((col, i) => { c.fillStyle = col; c.fillRect(-WW - 3, -54 + i * 8, WW * 2 + 6, 3.2); });
  if (d.armor) {                                                                                  // peitoral de bronze + tiras
    const ag = c.createLinearGradient(-12, 0, 12, 0); ag.addColorStop(0, '#e0b060'); ag.addColorStop(0.5, '#b9833f'); ag.addColorStop(1, '#7a5420');
    c.beginPath(); c.moveTo(-W1, -58); c.quadraticCurveTo(0, -52, W1, -58); c.lineTo(WW + 1, -41); c.lineTo(-WW - 1, -41); c.closePath(); fillStroke(ag);
    c.strokeStyle = '#6a4818'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(0, -55); c.lineTo(0, -42); c.moveTo(-8, -50); c.quadraticCurveTo(-4, -47, 0, -50); c.moveTo(8, -50); c.quadraticCurveTo(4, -47, 0, -50); c.stroke();
    for (let i = -3; i <= 3; i++) { c.beginPath(); c.roundRect ? c.roundRect(i * 4 - 2, -38, 4, 9, 1.5) : c.rect(i * 4 - 2, -38, 4, 9); fillStroke(i % 2 ? '#a07838' : '#8a6228', 1); }
  }
  if (d.cloak) { c.strokeStyle = shade(d.cloak, -0.1); c.lineWidth = 4.5; c.beginPath(); c.moveTo(-W1, -57); c.quadraticCurveTo(0, -52, W1, -57); c.stroke(); c.fillStyle = GOLD; c.beginPath(); c.arc(0, -53.5, 2.4, 0, 7); c.fill(); }
  const bY = -41; c.beginPath(); c.moveTo(-WW - 0.8, bY); c.quadraticCurveTo(0, bY + 2.2, WW + 0.8, bY); c.lineTo(WW + 0.8, bY + 4.6); c.quadraticCurveTo(0, bY + 6.8, -WW - 0.8, bY + 4.6); c.closePath(); fillStroke(d.sash || GOLD, 1.2);   // cinto
  c.fillStyle = '#fff1b8'; c.fillRect(-2.6, bY + 0.6, 5.2, 5.4);
  // ---- braços: mangas cônicas + antebraço + mão
  const A = [...({ run: [sw, -sw], throw: [0.2, 2.4], push: [-1.65, 1.65], up: [-2.7, 2.7], stand: [0.12, 0.12] }[pose] || [0.1, 0.1])];
  if (d.armL !== undefined) A[0] = d.armL; if (d.armR !== undefined) A[1] = d.armR;
  const hand = (sx, a) => [sx + Math.sin(a) * 24, -56 + Math.cos(a) * 24], hands = [];
  [-1, 1].forEach((out, i) => {
    const sx = out * (W1 - 1.5), h = hand(sx, A[i]), ex = (sx + h[0]) / 2 + out * 2, ey = (-56 + h[1]) / 2 + 1.5, wA = d.muscle || d.bare ? 5.4 : 4.6, longS = d.sleeve === 'long' || (fem && d.sleeve !== 'short');
    if (d.bare) { taper(c, sx, -56, ex, ey, wA, wA - 0.9, skin); taper(c, ex, ey, h[0], h[1], wA - 1, 3, skin); }
    else { taper(c, sx, -56, ex, ey, wA, wA - 0.3, tun); if (longS) taper(c, ex, ey, h[0], h[1], wA - 0.3, wA + (fem || d.long ? 0.8 : 0), tun); else taper(c, ex, ey, h[0], h[1], 3.4, 2.9, skin);
      c.strokeStyle = trim; c.lineWidth = 1.8; c.beginPath(); const px = longS ? h[0] : ex, py = longS ? h[1] : ey; c.arc(px, py, (longS ? wA + 0.2 : wA - 0.6), 0, 7); c.stroke(); }
    c.fillStyle = skin; c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.ellipse(h[0], h[1] + (longS ? 2 : 0), 3.6, 4.2, 0, 0, 7); c.fill(); c.stroke(); hands.push(h);
  });
  const hl_ = hands[0], hr = hands[1];
  // ---- mechas na frente (cabelo comprido de mulher) e trança
  if (d.head === 'long' && (fem || d.locks)) [-1, 1].forEach(s => { c.beginPath(); c.moveTo(s * 12, -72); c.bezierCurveTo(s * 20, -62, s * 19, -50, s * 15, -40 + sway * 0.5); c.quadraticCurveTo(s * 11, -46, s * 11, -58); c.quadraticCurveTo(s * 10, -66, s * 12, -72); c.closePath(); fillStroke(hair, 1.2); });
  if (d.head === 'braid') { for (let i = 0; i < 7; i++) { const t = i / 6, bx = 12 + Math.sin(t * 2) * 2.5 + t * 2, by = -64 + t * 26; c.save(); c.translate(bx, by); c.rotate(i % 2 ? 0.5 : -0.5); c.beginPath(); c.ellipse(0, 0, 4.2 - t * 1.2, 3, 0, 0, 7); fillStroke(i % 2 ? hair : shade(hair, 0.12), 1); c.restore(); } c.fillStyle = d.ribbon || PINK; c.beginPath(); c.arc(15, -37, 2.6, 0, 7); c.fill(); }
  // ---- pescoço e cabeça
  c.fillStyle = shade(skin, -0.16); c.fillRect(-4.5, -64, 9, 8);
  c.save(); c.translate(0, -76);
  const jw = fem ? 10 : 12, face = () => { c.beginPath(); c.moveTo(0, -17.5); c.bezierCurveTo(13, -17.5, 16, -5, 15, 3); c.bezierCurveTo(14.5, jw, 7, 17.5, 0, 17.5); c.bezierCurveTo(-7, 17.5, -14.5, jw, -15, 3); c.bezierCurveTo(-16, -5, -13, -17.5, 0, -17.5); c.closePath(); };
  [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s * 15.5, 2, 3, 4, 0, 0, 7); fillStroke(shade(skin, -0.06), 1.2); });
  const fg = c.createRadialGradient(-4, -5, 2, 0, 0, 21); fg.addColorStop(0, shade(skin, 0.1)); fg.addColorStop(0.6, skin); fg.addColorStop(1, shade(skin, -0.16));
  face(); rim(() => fillStroke(fg, 1.8));
  c.fillStyle = 'rgba(255,90,120,.22)'; [-9, 9].forEach(x => { c.beginPath(); c.ellipse(x, 5, 3.6, 2.6, 0, 0, 7); c.fill(); });
  if (d.beard) {
    const bl = d.beard === 'long'; c.beginPath(); c.moveTo(-15, 1); c.bezierCurveTo(-16, 13, -8, 19, 0, bl ? 37 : 22.5); c.bezierCurveTo(8, 19, 16, 13, 15, 1); c.bezierCurveTo(13, 8, 8, 9.5, 0, 9.5); c.bezierCurveTo(-8, 9.5, -13, 8, -15, 1); c.closePath(); fillStroke(hair, 1.3);
    c.strokeStyle = hl; c.lineWidth = 1; c.globalAlpha = 0.5; [-7, 0, 7].forEach(x => { c.beginPath(); c.moveTo(x, 12); c.quadraticCurveTo(x * 1.3, bl ? 24 : 17, x * 0.5, bl ? 33 : 20); c.stroke(); }); c.globalAlpha = 1;
  }
  const eyeCol = d.eyes || '#3a2616';
  [-6, 6].forEach(x => {
    const o2 = x < 0 ? -1 : 1;
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x, -1, 3.8, fem ? 4.6 : 4.2, 0, 0, 7); c.fill();
    c.fillStyle = eyeCol; c.beginPath(); c.arc(x + 1.1, -0.4, 2.6, 0, 7); c.fill(); c.fillStyle = '#0d0710'; c.beginPath(); c.arc(x + 1.1, -0.4, 1.3, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 2, -1.5, 0.9, 0, 7); c.fill();
    c.strokeStyle = INK; c.lineWidth = fem ? 1.9 : 1.4; c.beginPath(); c.moveTo(x - 4, -2); c.quadraticCurveTo(x, -5.8, x + 4, -2.4); c.stroke();
    if (fem) { c.lineWidth = 1.3; c.beginPath(); c.moveTo(x + 4 * o2, -2.3); c.lineTo(x + 6.2 * o2, -4.4); c.stroke(); }
    c.strokeStyle = d.hair === '#e9e4dc' ? '#9a948c' : shade(hair, -0.25); c.lineWidth = fem ? 1.5 : 2.3; c.beginPath();            // sobrancelha
    const inY = d.mood === 'strain' ? -6.8 : -9.4, outY = d.mood === 'strain' ? -10 : -8.6, ix = x - 4 * o2, ox = x + 4.4 * o2;
    c.moveTo(ix, inY); c.quadraticCurveTo(x, Math.min(inY, outY) - (fem ? 2.2 : 0.8), ox, outY); c.stroke();
  });
  c.strokeStyle = shade(skin, -0.34); c.lineWidth = 1.3; c.beginPath(); c.moveTo(1, 2); c.quadraticCurveTo(3.4, 5.2, 0.2, 6); c.stroke();
  if (open) { c.fillStyle = '#4a1020'; c.beginPath(); c.ellipse(1, 11.5, 3.5, 3.4, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.fillRect(-1.2, 8.6, 4.4, 1.5); }
  else if (fem) { c.fillStyle = d.lips || '#d4506a'; c.beginPath(); c.moveTo(-4.2, 9); c.quadraticCurveTo(-1.5, 7.4, 1, 8.4); c.quadraticCurveTo(3.5, 7.4, 5.8, 9); c.quadraticCurveTo(1, 13.2, -4.2, 9); c.fill(); }
  else { c.strokeStyle = d.beard ? '#e8a090' : '#7a2a2a'; c.lineWidth = 1.8; c.beginPath(); c.arc(1, 7.6, 5, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
  if (fem && d.earrings !== false) { c.fillStyle = GOLD; [-1, 1].forEach(s => { c.beginPath(); c.arc(s * 15.5, 7.5, 1.7, 0, 7); c.fill(); }); }
  // cabelo da frente
  const H = d.head, strands = (cx, cy, r, a0, a1) => { c.strokeStyle = hl; c.lineWidth = 1.2; c.globalAlpha = 0.6; c.beginPath(); c.arc(cx, cy, r, a0, a1); c.stroke(); c.globalAlpha = 1; };
  if (H === 'hair' || H === 'bald') {
    if (H === 'hair') { c.beginPath(); c.moveTo(-17, 0); c.bezierCurveTo(-20, -26, 20, -26, 17, 0); c.lineTo(15, -3); c.quadraticCurveTo(13, -9, 9, -8); c.quadraticCurveTo(6, -13, 1, -10); c.quadraticCurveTo(-4, -14, -8, -8); c.quadraticCurveTo(-13, -9, -15, -3); c.closePath(); fillStroke(hair, 1.4); strands(0, -5, 11, 3.7, 5.3); }
    else { c.fillStyle = hair; [-15.5, 15.5].forEach(x => { c.beginPath(); c.ellipse(x, -1, 2.6, 6, 0, 0, 7); c.fill(); }); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.ellipse(-4, -13, 5, 2.5, -0.4, 0, 7); c.fill(); }
  }
  if (H === 'long' || H === 'braid' || H === 'bun' || H === 'pony') {
    c.beginPath(); c.moveTo(-17.5, 7); c.bezierCurveTo(-22, -28, 22, -28, 17.5, 7); c.quadraticCurveTo(15.5, -3, 8, -9); c.quadraticCurveTo(0, -14.5, -9, -7); c.quadraticCurveTo(-14, -3, -17.5, 7); c.closePath(); fillStroke(hair, 1.4); strands(0, -5, 12, 3.7, 5.3);
    if (H === 'bun') { c.beginPath(); c.arc(0, -27, 7.5, 0, 7); fillStroke(hair, 1.3); c.fillStyle = d.ribbon || PINK; c.fillRect(-6, -21.5, 12, 2.6); }
  }
  if (H === 'curly') {
    for (let i = 0; i < 11; i++) { const a = Math.PI * 1.02 + i * Math.PI * 0.96 / 10; c.beginPath(); c.arc(Math.cos(a) * 17.5, -2 + Math.sin(a) * 20, 5.6, 0, 7); fillStroke(i % 2 ? hair : shade(hair, 0.1), 1.2); }
    c.beginPath(); c.ellipse(0, -9, 16, 12, 0, 0, 7); c.fillStyle = hair; c.fill(); [-1, 1].forEach(s => { c.beginPath(); c.arc(s * 17, 2, 4.2, 0, 7); fillStroke(hair, 1.2); });
    [[-6, -11], [0, -13.5], [6, -11]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 4, 0, 7); fillStroke(shade(hair, 0.08), 1.1); });
  }
  if (H === 'turban') { c.beginPath(); c.ellipse(0, -14, 19.5, 11.5, 0, 0, 7); fillStroke(d.cloth, 1.5); c.strokeStyle = shade(d.cloth, -0.26); c.lineWidth = 1.3; for (let i = -2; i <= 2; i++) { c.beginPath(); c.arc(i * 6.5, -14, 10, 0.25, Math.PI - 0.25); c.stroke(); } c.beginPath(); c.moveTo(13, -9); c.quadraticCurveTo(21, 0, 15, 12); c.quadraticCurveTo(13, 4, 11, -3); c.closePath(); fillStroke(shade(d.cloth, -0.1), 1.2); }
  if (H === 'helmet') { const hg = c.createLinearGradient(-18, 0, 18, 0); hg.addColorStop(0, '#e0b060'); hg.addColorStop(0.5, '#b9833f'); hg.addColorStop(1, '#6a4818');
    [-1, 1].forEach(s => { c.beginPath(); c.moveTo(s * 15, -8); c.lineTo(s * 18, 6); c.quadraticCurveTo(s * 15, 11, s * 11, 9); c.lineTo(s * 11, -6); c.closePath(); fillStroke('#a07838', 1.2); });
    c.beginPath(); c.moveTo(-18.5, -6); c.bezierCurveTo(-21, -33, 21, -33, 18.5, -6); c.lineTo(12, -9); c.quadraticCurveTo(0, -5, -12, -9); c.closePath(); fillStroke(hg, 1.5);
    c.fillStyle = '#8a6228'; c.fillRect(-1.6, -18, 3.2, 14); c.beginPath(); c.moveTo(-3.5, -30); c.quadraticCurveTo(0, -42, 3.5, -30); c.closePath(); fillStroke(PINK, 1.1); }
  if (d.veil) { c.beginPath(); c.moveTo(-19.5, 5); c.bezierCurveTo(-27, -32, 27, -32, 19.5, 5); c.quadraticCurveTo(15, -5, 7, -9); c.quadraticCurveTo(0, -12, -7, -9); c.quadraticCurveTo(-15, -5, -19.5, 5); c.closePath(); c.globalAlpha = 0.93; fillStroke(d.veil, 1.4); c.globalAlpha = 1; c.strokeStyle = shade(d.veil, -0.28); c.lineWidth = 1; [-8, 0, 8].forEach(x => { c.beginPath(); c.moveTo(x, -26); c.quadraticCurveTo(x * 1.4, -16, x * 1.7, -6); c.stroke(); }); }
  if (d.headband) { c.strokeStyle = INK; c.lineWidth = 4.6; c.beginPath(); c.moveTo(-16.5, -7); c.quadraticCurveTo(0, -13, 16.5, -7); c.stroke(); c.strokeStyle = d.headband; c.lineWidth = 3; c.stroke(); }
  if (d.crown || key === 'ester') crown(c, 0, d.veil ? -25 : -21, 0.3, GOLD);
  if (d.glasses || d.shades) { c.strokeStyle = '#1b1020'; c.lineWidth = 1.7; c.fillStyle = d.shades ? 'rgba(12,8,18,.88)' : 'rgba(255,255,255,.08)'; [-6, 6].forEach(x => { c.beginPath(); c.roundRect ? c.roundRect(x - 5.6, -5.4, 11.2, 9.6, 3) : c.rect(x - 5.6, -5.4, 11.2, 9.6); c.fill(); c.stroke(); }); c.beginPath(); c.moveTo(-0.4, -1.5); c.lineTo(0.4, -1.5); c.moveTo(-11.6, -1); c.lineTo(-16, 0); c.moveTo(11.6, -1); c.lineTo(16, 0); c.stroke(); }
  c.restore();
  // ---- objetos nas mãos
  const [hx, hy] = hr, stick = (x1, y1, x2, y2, w, col) => taper(c, x1, y1, x2, y2, w / 2, w / 2, col);
  if (d.prop === 'staff') stick(hx, hy + 24, hx + 3, hy - 52, 3.6, '#a07a44');
  if (d.prop === 'spear') { stick(hx - 4, hy + 40, hx + 8, hy - 70, 3, '#9a9aa8'); c.beginPath(); c.moveTo(hx + 8, hy - 86); c.lineTo(hx + 13, hy - 68); c.lineTo(hx + 3, hy - 68); c.closePath(); fillStroke('#cfd2dd', 1); }
  if (d.prop === 'trowel') { stick(hx, hy + 3, hx + 3, hy - 6, 3.4, '#7a5a34'); c.beginPath(); c.moveTo(hx + 3, hy - 6); c.lineTo(hx - 3, hy - 17); c.lineTo(hx + 9, hy - 17); c.closePath(); fillStroke('#cfd2dd', 1); }
  if (d.prop === 'sling') { c.strokeStyle = '#e8d7b0'; c.lineWidth = 1.5; c.beginPath(); c.arc(hx, hy - 14, 9, 0, 7); c.stroke(); c.fillStyle = '#ddd'; c.beginPath(); c.arc(hx + 9, hy - 14, 2.6, 0, 7); c.fill(); }
  if (d.prop === 'net') { stick(hx, hy + 6, hx + 3, hy - 10, 3, '#a07a44'); const nx = hx + 5, ny = hy - 22; c.save(); c.beginPath(); c.arc(nx, ny, 13, 0, 7); c.clip(); c.strokeStyle = '#d9e6ee'; c.lineWidth = 1; c.beginPath(); for (let i = -26; i <= 26; i += 6) { c.moveTo(nx + i - 14, ny - 14); c.lineTo(nx + i + 14, ny + 14); c.moveTo(nx + i + 14, ny - 14); c.lineTo(nx + i - 14, ny + 14); } c.stroke(); c.restore(); c.strokeStyle = '#a07a44'; c.lineWidth = 2; c.beginPath(); c.arc(nx, ny, 13, 0, 7); c.stroke(); }
  if (d.prop === 'sword') { stick(hx, hy + 6, hx + 4, hy - 46, 3.4, '#cfd2dd'); stick(hx - 6, hy - 2, hx + 8, hy - 2, 3, GOLD); }
  if (d.prop === 'scroll') { c.fillStyle = '#f3e3b5'; c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.rect(hx - 5, hy - 12, 10, 18); c.fill(); c.stroke(); c.fillStyle = '#c9a25a'; c.fillRect(hx - 6.5, hy - 13.5, 13, 3.2); c.fillRect(hx - 6.5, hy + 3, 13, 3.2); }
  if (d.prop === 'torch') {                                                                  // tocha de Gideão
    stick(hx + 1, hy + 12, hx + 2, hy - 18, 4, '#7a5a34'); const fy = hy - 25, fl = Math.sin(tm * 14) * 1.6, gg = c.createRadialGradient(hx + 2, fy, 1, hx + 2, fy, 22); gg.addColorStop(0, 'rgba(255,201,77,.55)'); gg.addColorStop(1, 'rgba(255,201,77,0)'); c.fillStyle = gg; c.fillRect(hx - 20, fy - 22, 44, 44);
    c.beginPath(); c.moveTo(hx + 2, fy - 14 + fl); c.quadraticCurveTo(hx + 11, fy - 2, hx + 2, fy + 5); c.quadraticCurveTo(hx - 7, fy - 2, hx + 2, fy - 14 + fl); c.closePath(); fillStroke(GOLD, 1.2);
    c.fillStyle = PINK; c.beginPath(); c.moveTo(hx + 2, fy - 6); c.quadraticCurveTo(hx + 6, fy, hx + 2, fy + 3); c.quadraticCurveTo(hx - 2, fy, hx + 2, fy - 6); c.fill();
  }
  if (d.prop === 'tambourine') { c.strokeStyle = GOLD; c.lineWidth = 3; c.beginPath(); c.arc(hx + 4, hy - 12, 10, 0, 7); c.stroke(); c.fillStyle = '#fff'; [0, 2, 4].forEach(q => { c.beginPath(); c.arc(hx + 4 + Math.cos(q) * 10, hy - 12 + Math.sin(q) * 10, 1.6, 0, 7); c.fill(); }); }
  if (d.prop === 'wheat') { c.strokeStyle = '#e8c35a'; c.lineWidth = 2; c.beginPath(); [-4, 0, 4].forEach(q => { c.moveTo(hx, hy + 6); c.lineTo(hx + q * 2, hy - 28); }); c.stroke(); c.fillStyle = '#e8c35a'; [-4, 0, 4].forEach(q => { c.beginPath(); c.ellipse(hx + q * 2, hy - 31, 2.4, 6, 0, 0, 7); c.fill(); }); }
  if (d.shield) { c.beginPath(); c.arc(hl_[0] - 4, hl_[1], 15, 0, 7); fillStroke('#b9833f', 1.5); c.strokeStyle = GOLD; c.lineWidth = 2; c.beginPath(); c.arc(hl_[0] - 4, hl_[1], 10, 0, 7); c.stroke(); }
  c.restore();
}
/* Arte personalizada (PNG de corpo inteiro) animada por código: pulo, inclinação, balanço */
function sprite(c, im, o) {
  const h = o.h, w = h * im.naturalWidth / im.naturalHeight, t = performance.now() / 1000, pose = o.pose || 'stand', ph = (o.ph || 0) * 6.283;
  c.save(); c.translate(o.x, o.y + (pose === 'run' ? -Math.abs(Math.sin(ph)) * h * 0.06 : Math.sin(t * 2) * h * 0.012)); c.scale(o.dir || 1, 1);
  c.rotate(pose === 'run' ? 0.08 : pose === 'push' ? 0.12 : pose === 'throw' ? -0.08 : 0); if (pose === 'up') c.scale(1.06, 1.06);
  c.shadowColor = PINK; c.shadowBlur = 10; c.drawImage(im, -w / 2, -h, w, h); c.restore();
}
/* Partículas simples (faíscas, poeira, gotas) */
function burst(arr, x, y, n, col, sp = 160, life = 0.6, g = 400) { for (let i = 0; i < n; i++) { const t = Math.random() * 6.283, v = sp * (0.3 + Math.random()); arr.push({ x, y, vx: Math.cos(t) * v, vy: Math.sin(t) * v - sp * 0.3, life, max: life, col, g, r: 1.5 + Math.random() * 2.5 }); } }
function fxStep(arr, dt) { for (let i = arr.length - 1; i >= 0; i--) { const p = arr[i]; p.life -= dt; if (p.life <= 0) { arr.splice(i, 1); continue; } p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; } }
function fxDraw(c, arr) { arr.forEach(p => { c.globalAlpha = Math.max(0, p.life / p.max); c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); }); c.globalAlpha = 1; }
function portrait(key, size, look) { // busto para avatar (data URL)
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size * 0.4, 4, size / 2, size / 2, size * 0.75); g.addColorStop(0, '#4a1240'); g.addColorStop(1, '#07060c');
  c.fillStyle = g; c.fillRect(0, 0, size, size);
  const h = size * 1.5; figure(c, key, { ...look, x: size / 2, y: size * 0.42 + 0.76 * h, h, prop: null, shield: false });
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
function poster(c, W, H, id, who = { key: 'davi' }) { // cena estática para miniaturas (com o personagem escolhido)
  bg(c, W, H, id, 3); const gy = H * 0.97;
  const me = o => who.img ? sprite(c, who.img, o) : figure(c, who.key, { ...who.look, ...o });
  if (id === 'corrida') me({ x: W * 0.45, y: gy, h: H * 0.6, pose: 'run', ph: 0.2 });
  if (id === 'muros') { [0, 1, 2].forEach(i => stone(c, W * 0.5 + i * 8, gy - (i + 1) * H * 0.1, W * 0.4 - i * 14, H * 0.1, 280 + i * 20)); me({ x: W * 0.28, y: gy, h: H * 0.58, prop: 'trowel' }); }
  if (id === 'pesca') { boat(c, W * 0.5, H * 0.8, W * 0.55); me({ x: W * 0.5, y: H * 0.78, h: H * 0.55, pose: 'throw', prop: 'net' }); }
  if (id === 'davi') { figure(c, 'golias', { x: W * 0.64, y: gy, h: H * 0.78 }); me({ x: W * 0.2, y: gy, h: H * 0.42, pose: 'throw', prop: 'sling' }); }
  if (id === 'sansao') { pillar(c, W * 0.2, H * 0.12, gy, W * 0.16); pillar(c, W * 0.8, H * 0.12, gy, W * 0.16); me({ x: W * 0.5, y: gy, h: H * 0.6, pose: 'push', mood: 'strain', prop: null }); }
}
function thumb(id, w, h, who) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; poster(cv.getContext('2d'), w, h, id, who); return cv.toDataURL(); }

window.Art = { PINK, GOLD, VIO, INFO, CHAR, sprite, burst, fxStep, fxDraw, figure, portrait, thumb, bg, verse, fish, rock, anchor, scroll, idol, boat, stone, pillar, crown, flame };
})();
