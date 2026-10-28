/* art.js — personagens v4 (desenhados em código). Regras que evitam bugs visuais:
   1) o cabelo e tudo que fica na cabeça são recortados com uma "zona dos olhos" (nunca cobrem olhos/sobrancelhas);
   2) olhos e boca são desenhados DEPOIS do cabelo;
   3) a roupa da loja SUBSTITUI a roupa inteira (nada de mistura de cores/peças). */
(() => {
'use strict';
const PINK = '#ff2d95', GOLD = '#ffc94d', INK = '#1a0d1c', TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function shade(hex, k) {
  hex = String(hex || '#888888').replace('#', ''); if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const n = parseInt(hex, 16), f = v => Math.round(clamp(k > 0 ? v + (255 - v) * k : v * (1 + k), 0, 255)).toString(16).padStart(2, '0');
  return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255);
}
const hexA = (hex, a) => { const n = parseInt(hex.replace('#', ''), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

function heart(c, x, y, s, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.6, y - s * 0.2, x - s * 0.9, y - s * 1.3, x, y - s * 0.4); c.bezierCurveTo(x + s * 0.9, y - s * 1.3, x + s * 1.6, y - s * 0.2, x, y + s * 0.9); c.fill(); }
function limb(c, x1, y1, x2, y2, w1, w2, fill) {
  const a = Math.atan2(y2 - y1, x2 - x1), nx = Math.sin(a), ny = -Math.cos(a);
  c.beginPath(); c.moveTo(x1 + nx * w1, y1 + ny * w1); c.lineTo(x2 + nx * w2, y2 + ny * w2); c.arc(x2, y2, w2, a - Math.PI / 2, a + Math.PI / 2);
  c.lineTo(x1 - nx * w1, y1 - ny * w1); c.arc(x1, y1, w1, a + Math.PI / 2, a + Math.PI * 1.5); c.closePath();
  c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.5; c.stroke();
}
const fs = (c, fill, lw = 1.5) => { c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = lw; c.stroke(); };

/* ---------- Poses ---------- */
function armAngles(pose, ph, o) {
  const sn = Math.sin(ph);
  const A = { stand: [0.2, 0.2], run: [0.7 + sn * 0.7, 0.7 - sn * 0.7], throw: [0.5, 2.2], push: [-1.6, 1.6], up: [-2.7, 2.7], cheer: [0.3, 2.8], hold: [0.3, 0.9] }[pose] || [0.2, 0.2];
  const r = [A[0], A[1]]; if (o.armL !== undefined) r[0] = o.armL; if (o.armR !== undefined) r[1] = o.armR; return r;
}
const dims = L => ({ shW: L.build === 'strong' ? 15.5 : L.build === 'kid' ? 10.5 : L.body === 'f' ? 11 : 13, wW: L.build === 'strong' ? 12 : L.build === 'kid' ? 8.5 : L.body === 'f' ? 8 : 11 });
const kidK = L => L.build === 'kid' ? 0.7 : 1;
/** Posição da mão (em px, no canvas) — para prender funda, rede etc. side: 'R' | 'L' */
function handPos(L, o, side = 'R') {
  const k = o.h / 100 * kidK(L), dir = o.dir || 1, A = armAngles(o.pose || 'stand', (o.ph || 0) * TAU, o), s = side === 'L' ? -1 : 1, a = A[side === 'L' ? 0 : 1], { shW } = dims(L);
  const sx = s * (shW - 1.5), hx = sx + s * Math.sin(a) * 22, hy = -54 + Math.cos(a) * 22;
  return { x: o.x + hx * k * dir, y: o.y + hy * k };
}

/* ---------- Personagem ---------- */
function figure(c, L, o) {
  const kid = L.build === 'kid', animal = L.animal === 'capy', k = o.h / 100 * kidK(L), dir = o.dir || 1, t = o.t != null ? o.t : performance.now() / 1000, pose = o.pose || 'stand', run = pose === 'run', ph = (o.ph || 0) * TAU, sn = Math.sin(ph);
  const fem = L.body === 'f', strong = L.build === 'strong', out = L.outfit || {}, kind = out.kind || 'tunic', acc = L.acc || {}, mood = o.mood || 'normal';
  const skin = L.skin || '#d9a077', hairC = L.hair || '#2a1a10', col = out.color || '#7a3fd1', trim = out.trim || shade(col, -0.3), sash = out.sash || trim;
  const bob = run ? Math.abs(Math.cos(ph)) * 3 : Math.sin(t * 2) * 0.7, sway = run ? sn * 2 : Math.sin(t * 1.7) * 0.8;
  const { shW, wW } = dims(L), style = L.style || 'short', hd = L.head || null, prop = o.prop !== undefined ? o.prop : null;
  let hemY, hemW;
  if (kind === 'bare') { hemY = -26; hemW = 13.5; } else if (kind === 'robe') { hemY = -7; hemW = fem ? 21 : 19; }
  else if (kind === 'armor') { hemY = fem ? -20 : -23; hemW = fem ? 18 : 15.5; } else { hemY = fem ? -18 : -23; hemW = fem ? 20 : 15.5; }
  if (strong) hemW += 1.5; if (kid) hemW = Math.min(hemW, 13);

  c.save(); c.translate(o.x, o.y); c.scale(k * dir, k); c.lineCap = c.lineJoin = 'round';
  if (L.aura) {                                                       // aura no chão
    c.save(); c.translate(0, -1); c.scale(1, 0.26); const g = c.createRadialGradient(0, 0, 4, 0, 0, 40 + Math.sin(t * 3) * 2);
    g.addColorStop(0, hexA(L.aura, 0.85)); g.addColorStop(1, hexA(L.aura, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 44, 0, TAU); c.fill(); c.restore();
  }
  c.translate(0, -bob);

  /* ===== camada de trás ===== */
  if (acc.wings) [-1, 1].forEach(s => {
    c.save(); c.translate(s * 7, -52); c.rotate(s * Math.sin(t * 3) * 0.07); c.scale(s, 1);
    const g = c.createLinearGradient(0, 0, 36, -30); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#ffb6dc');
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(16, -14, 30, -34, 44, -36); c.bezierCurveTo(40, -24, 38, -18, 34, -10); c.bezierCurveTo(30, -2, 24, 8, 10, 14); c.closePath(); fs(c, g, 1.2);
    c.strokeStyle = 'rgba(255,45,149,.35)'; c.lineWidth = 1; [[10, -6, 30, -26], [10, 0, 32, -14], [8, 6, 26, -4]].forEach(([a, b, x, y]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(x, y); c.stroke(); }); c.restore();
  });
  if (out.cloak) { c.beginPath(); c.moveTo(-shW - 2, -58); c.quadraticCurveTo(-28, -34, -25, -6 + sway); c.quadraticCurveTo(0, -2, 25, -6 + sway); c.quadraticCurveTo(28, -34, shW + 2, -58); c.closePath(); fs(c, shade(out.cloak, -0.1)); }
  if (hd && hd.type === 'veil') { c.beginPath(); c.moveTo(-18, -88); c.quadraticCurveTo(-30, -60, -24, -36); c.lineTo(24, -36); c.quadraticCurveTo(30, -60, 18, -88); c.closePath(); fs(c, shade(hd.color, -0.1)); }
  const back = c.createLinearGradient(0, -90, 0, -34); back.addColorStop(0, hairC); back.addColorStop(1, shade(hairC, -0.3));
  if (style === 'long' || style === 'wavy') {
    const bot = fem ? -30 : -46, w = style === 'wavy' ? 3 : 0;
    c.beginPath(); c.moveTo(-17, -90); c.bezierCurveTo(-27 - w, -78, -26 - w, -54, -21 - w, bot); c.quadraticCurveTo(-11, bot + 5 + sway, 0, bot + 1);
    c.quadraticCurveTo(11, bot + 5 - sway, 21 + w, bot); c.bezierCurveTo(26 + w, -54, 27 + w, -78, 17, -90); c.closePath(); fs(c, back);
  }
  if (style === 'braid' || style === 'bun') { c.beginPath(); c.moveTo(-16, -88); c.bezierCurveTo(-23, -76, -22, -62, -17, -56); c.lineTo(17, -56); c.bezierCurveTo(22, -62, 23, -76, 16, -88); c.closePath(); fs(c, back); }
  if (style === 'curly') for (let i = 0; i < 9; i++) { const a = Math.PI * 0.85 + i * (Math.PI * 1.3 / 8); c.beginPath(); c.arc(Math.cos(a) * 19, -76 + Math.sin(a) * 19 + 4, 8, 0, TAU); fs(c, i % 2 ? hairC : shade(hairC, 0.08), 1.3); }

  /* ===== pernas e sandálias ===== */
  const lf = run ? sn * 12 : -5.5, rf = run ? -sn * 12 : 5.5, ll = run ? Math.max(0, sn) * 7 : 0, rl = run ? Math.max(0, -sn) * 7 : 0, leg = shade(skin, -0.1);
  limb(c, -5, -28, lf, -5 - ll, 4.2, 3.4, leg); limb(c, 5, -28, rf, -5 - rl, 4.2, 3.4, leg);
  [[lf, ll], [rf, rl]].forEach(([x, l]) => { c.beginPath(); c.ellipse(x + 1.5, -2.5 - l, 6.6, 3.3, 0, 0, TAU); fs(c, '#5a3520', 1.2); });

  /* ===== pescoço e tronco ===== */
  c.fillStyle = shade(skin, -0.16); c.fillRect(-4.5, -63, 9, 9);
  const torso = () => {
    c.beginPath(); c.moveTo(-5, -60); c.quadraticCurveTo(-shW - 1, -60, -shW - 1.5, -53); c.quadraticCurveTo(-shW - 1, -45, -wW, -38);
    c.quadraticCurveTo(-wW - (hemW - wW) * 0.4, (-38 + hemY) / 2, -hemW, hemY);
    for (let i = 0; i < 4; i++) c.quadraticCurveTo(-hemW + (i + 0.5) * hemW / 2, hemY + (i % 2 ? -1.4 : 1.4) + sway * 0.5, -hemW + (i + 1) * hemW / 2, hemY);
    c.quadraticCurveTo(wW + (hemW - wW) * 0.4, (-38 + hemY) / 2, wW, -38); c.quadraticCurveTo(shW + 1, -45, shW + 1.5, -53); c.quadraticCurveTo(shW + 1, -60, 5, -60);
    c.quadraticCurveTo(0, -55.5, -5, -60); c.closePath();
  };
  const base = kind === 'bare' ? skin : col, gr = c.createLinearGradient(-16, 0, 16, 0); gr.addColorStop(0, shade(base, 0.15)); gr.addColorStop(0.55, base); gr.addColorStop(1, shade(base, -0.28));
  torso(); fs(c, gr);
  if (kind === 'bare') {                                              // peito + saiote
    c.strokeStyle = shade(skin, -0.32); c.lineWidth = 1.1; c.beginPath(); c.arc(-5, -51, 5, 0.3, Math.PI - 0.4); c.moveTo(10, -51); c.arc(5, -51, 5, 0.4, Math.PI - 0.3); c.moveTo(0, -56); c.lineTo(0, -41); c.moveTo(-3, -46); c.lineTo(3, -46); c.stroke();
    c.beginPath(); c.moveTo(-wW - 1, -39); c.lineTo(wW + 1, -39); c.lineTo(hemW + 3, -25 + sway * 0.4); c.quadraticCurveTo(0, -22, -hemW - 3, -25 + sway * 0.4); c.closePath(); fs(c, col);
    c.strokeStyle = trim; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-hemW - 2, -27); c.quadraticCurveTo(0, -24, hemW + 2, -27); c.stroke();
  } else {
    c.save(); torso(); c.clip();
    if (out.stripes) ['#ffc94d', '#4aa8ff', '#5dffb0', '#ff7ab8'].forEach((cc, i) => { c.fillStyle = cc; c.fillRect(-30, -56 + i * 9, 60, 4); });
    c.strokeStyle = shade(col, -0.35); c.lineWidth = 1; c.globalAlpha = 0.55;                      // dobras
    [-0.6, -0.2, 0.25, 0.65].forEach(f => { c.beginPath(); c.moveTo(f * wW, -36); c.quadraticCurveTo(f * hemW * 0.9 + 1, (-36 + hemY) / 2, f * hemW * 1.05, hemY); c.stroke(); }); c.globalAlpha = 1; c.restore();
    c.strokeStyle = trim; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-hemW + 0.5, hemY - 3); c.quadraticCurveTo(0, hemY - 1.6 + sway, hemW - 0.5, hemY - 3); c.stroke();     // barra
  }
  if (kind === 'armor') {                                             // peitoral + tiras de couro
    const ag = c.createLinearGradient(-12, 0, 12, 0); ag.addColorStop(0, '#e0b060'); ag.addColorStop(0.5, '#b9833f'); ag.addColorStop(1, '#7a5420');
    c.beginPath(); c.moveTo(-shW, -57); c.quadraticCurveTo(0, -52, shW, -57); c.lineTo(wW + 1, -39); c.lineTo(-wW - 1, -39); c.closePath(); fs(c, ag);
    c.strokeStyle = '#6a4818'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(0, -54); c.lineTo(0, -40); c.moveTo(-8, -49); c.quadraticCurveTo(-4, -46, 0, -49); c.moveTo(8, -49); c.quadraticCurveTo(4, -46, 0, -49); c.stroke();
    for (let i = -3; i <= 3; i++) { c.beginPath(); c.rect(i * 4.2 - 2.1, -37, 4.2, 9); fs(c, i % 2 ? '#a07838' : '#8a6228', 1); }
  }
  c.beginPath(); c.moveTo(-5, -60); c.quadraticCurveTo(0, fem ? -52 : -50, 5, -60); c.quadraticCurveTo(0, -56, -5, -60); fs(c, skin, 1.1);      // decote
  if (kind !== 'bare') { c.strokeStyle = trim; c.lineWidth = 1.7; c.beginPath(); c.moveTo(-5.2, -60); c.quadraticCurveTo(0, fem ? -51 : -49, 5.2, -60); c.stroke(); }
  if (out.cloak) { c.strokeStyle = shade(out.cloak, -0.05); c.lineWidth = 4.5; c.beginPath(); c.moveTo(-shW, -57); c.quadraticCurveTo(0, -52, shW, -57); c.stroke(); c.beginPath(); c.arc(0, -53, 2.4, 0, TAU); fs(c, GOLD, 1); }
  c.beginPath(); c.moveTo(-wW - 0.8, -41); c.quadraticCurveTo(0, -38.6, wW + 0.8, -41); c.lineTo(wW + 0.8, -36); c.quadraticCurveTo(0, -33.6, -wW - 0.8, -36); c.closePath(); fs(c, sash, 1.2);   // cinto
  c.fillStyle = '#fff1b8'; c.fillRect(-2.4, -40, 4.8, 4.8);
  if (acc.amulet) { c.strokeStyle = GOLD; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-5, -59); c.lineTo(0, -46); c.lineTo(5, -59); c.stroke(); c.fillStyle = GOLD; c.strokeStyle = INK; c.lineWidth = 0.9; c.beginPath(); c.rect(-1, -50, 2, 8); c.rect(-3.5, -48.5, 7, 2); c.fill(); c.stroke(); }

  if (acc.camera) { c.strokeStyle = '#2a2a33'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-6, -59); c.lineTo(-8.5, -47); c.moveTo(6, -59); c.lineTo(8.5, -47); c.stroke();
    c.beginPath(); c.roundRect ? c.roundRect(-9.5, -48, 19, 11.5, 2.2) : c.rect(-9.5, -48, 19, 11.5); fs(c, '#23232c', 1.2); c.fillStyle = PINK; c.fillRect(-9, -48, 18, 2.6); c.fillStyle = '#d8dbe6'; c.fillRect(5, -50.2, 3.6, 2.2);
    c.beginPath(); c.arc(0, -41.8, 4.4, 0, TAU); fs(c, '#4a4d5e', 1); c.beginPath(); c.arc(0, -41.8, 2.4, 0, TAU); c.fillStyle = '#9ad4ff'; c.fill(); c.fillStyle = '#fff'; c.fillRect(-1.6, -43.4, 1.4, 1.4); }
  /* ===== braços ===== */
  const A = armAngles(pose, ph, o), hands = [], sl = out.sleeves || (kind === 'robe' ? 'long' : kind === 'bare' ? 'none' : 'short'), wA = strong ? 5.6 : fem ? 3.8 : 4.6;
  [-1, 1].forEach((s, i) => {
    const sx = s * (shW - 1.5), a = A[i], hx = sx + s * Math.sin(a) * 22, hy = -54 + Math.cos(a) * 22, ex = (sx + hx) / 2 + s * 1.5, ey = (-54 + hy) / 2 + 1;
    const sleeveC = sl === 'none' ? skin : col;
    limb(c, sx, -54, ex, ey, wA, wA - 0.4, sleeveC);
    if (sl === 'long') { limb(c, ex, ey, hx, hy, wA - 0.4, wA, sleeveC); c.strokeStyle = trim; c.lineWidth = 1.8; c.beginPath(); c.arc(hx, hy, wA + 0.1, 0, TAU); c.stroke(); }
    else limb(c, ex, ey, hx, hy, 3.5, 3, skin);
    c.beginPath(); c.arc(hx, hy + (sl === 'long' ? 1.5 : 0), 3.8, 0, TAU); fs(c, skin, 1.2); hands.push([hx, hy]);
  });
  if (style === 'long' && fem) [-1, 1].forEach(s => { c.beginPath(); c.moveTo(s * 14, -70); c.bezierCurveTo(s * 21, -62, s * 20, -50, s * 16, -40 + sway * 0.5); c.quadraticCurveTo(s * 12, -46, s * 12, -58); c.closePath(); fs(c, hairC, 1.2); });
  if (style === 'braid') { for (let i = 0; i < 7; i++) { const u = i / 6, bx = 13 + Math.sin(u * 2) * 2.5 + u * 2, by = -66 + u * 28; c.save(); c.translate(bx, by); c.rotate(i % 2 ? 0.5 : -0.5); c.beginPath(); c.ellipse(0, 0, 4.2 - u * 1.2, 3, 0, 0, TAU); fs(c, i % 2 ? hairC : shade(hairC, 0.12), 1); c.restore(); } c.beginPath(); c.arc(15.5, -37, 2.6, 0, TAU); fs(c, PINK, 1); }

  /* ===== cabeça (centro em y=-74) ===== */
  c.save(); if (kid) { c.translate(0, -58); c.scale(1.2, 1.2); c.translate(0, 58); } c.translate(0, -74);
  const jw = fem ? 10 : 12;
  const face = () => { c.beginPath(); c.moveTo(0, -17.5); c.bezierCurveTo(13, -17.5, 16, -5, 15, 3); c.bezierCurveTo(14.5, jw, 7, 17.5, 0, 17.5); c.bezierCurveTo(-7, 17.5, -14.5, jw, -15, 3); c.bezierCurveTo(-16, -5, -13, -17.5, 0, -17.5); c.closePath(); };
  if (!animal) [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s * 15.5, 2, 3, 4, 0, 0, TAU); fs(c, shade(skin, -0.06), 1.2); });
  const fg = c.createRadialGradient(-4, -5, 2, 0, 0, 21); fg.addColorStop(0, shade(skin, 0.1)); fg.addColorStop(0.6, skin); fg.addColorStop(1, shade(skin, -0.16)); face(); fs(c, fg, 1.7);
  c.fillStyle = 'rgba(255,90,120,.2)'; [-9, 9].forEach(x => { c.beginPath(); c.ellipse(x, 6, 3.4, 2.4, 0, 0, TAU); c.fill(); });
  if (L.beard) {                                                      // barba (embaixo dos olhos, antes do cabelo)
    const bl = L.beard === 'long'; c.beginPath(); c.moveTo(-15, 3); c.bezierCurveTo(-16, 13, -8, 19, 0, bl ? 36 : 22.5); c.bezierCurveTo(8, 19, 16, 13, 15, 3); c.bezierCurveTo(13, 9, 8, 9.5, 0, 9.5); c.bezierCurveTo(-8, 9.5, -13, 9, -15, 3); c.closePath(); fs(c, hairC, 1.3);
    c.strokeStyle = shade(hairC, 0.3); c.lineWidth = 1; c.globalAlpha = 0.5; [-7, 0, 7].forEach(x => { c.beginPath(); c.moveTo(x, 12); c.quadraticCurveTo(x * 1.3, bl ? 24 : 17, x * 0.5, bl ? 31 : 20); c.stroke(); }); c.globalAlpha = 1;
  }
  if (animal) {                                                       // capivara: focinho largo + narinas
    c.beginPath(); c.ellipse(0, 8.5, 10.5, 7.6, 0, 0, TAU); fs(c, shade(skin, 0.16), 1.4); c.fillStyle = '#3a2216'; [-3.4, 3.4].forEach(x => { c.beginPath(); c.ellipse(x, 5.6, 1.5, 1.1, 0, 0, TAU); c.fill(); });
  } else { c.strokeStyle = shade(skin, -0.34); c.lineWidth = 1.2; c.beginPath(); c.moveTo(1, 3); c.quadraticCurveTo(3.2, 6, 0.4, 6.6); c.stroke(); }      // nariz

  /* --- cabelo, chapéus e enfeites: RECORTADOS fora da zona dos olhos --- */
  c.save(); c.beginPath(); c.rect(-70, -70, 140, 140); c.rect(-12.5, -11.5, 25, 18); c.clip('evenodd');
  const hl = shade(hairC, 0.3);
  const cap = fringe => {
    c.beginPath(); c.moveTo(-17.5, -2); c.bezierCurveTo(-22, -32, 22, -32, 17.5, -2); c.lineTo(16, -6); c.quadraticCurveTo(15, -10, 11, -12.2); fringe(); c.quadraticCurveTo(-15, -10, -16, -6); c.closePath(); fs(c, hairC, 1.5);
    c.strokeStyle = hl; c.lineWidth = 1.1; c.globalAlpha = 0.55; c.beginPath(); c.arc(-1, -6, 13, 3.9, 5.2); c.stroke(); c.globalAlpha = 1;
  };
  if (style === 'short') cap(() => { [[8, -13.8], [5, -12.8], [2, -14.6], [-2, -13], [-5, -14.4], [-8, -13], [-11, -12.2]].forEach(p => c.lineTo(p[0], p[1])); });
  if (style === 'long' || style === 'bun' || style === 'braid') cap(() => c.quadraticCurveTo(1, -19, -11, -12.2));
  if (style === 'wavy') { cap(() => c.quadraticCurveTo(-2, -19, -11, -12.4)); }
  if (style === 'curly') {
    for (let i = 0; i < 9; i++) { const a = Math.PI * 1.03 + i * (Math.PI * 0.94 / 8); c.beginPath(); c.arc(Math.cos(a) * 15.5, -2 + Math.sin(a) * 18, 5.6, 0, TAU); fs(c, i % 2 ? hairC : shade(hairC, 0.1), 1.2); }
    c.beginPath(); c.ellipse(0, -15, 14, 6.5, 0, 0, TAU); fs(c, hairC, 0.1);
    [-1, 1].forEach(s => { c.beginPath(); c.arc(s * 17, -3, 4.2, 0, TAU); fs(c, hairC, 1.2); });
  }
  if (style === 'bun') { c.beginPath(); c.arc(0, -28, 7.2, 0, TAU); fs(c, hairC, 1.3); c.fillStyle = PINK; c.fillRect(-5.5, -23, 11, 2.4); }
  if (animal) [-1, 1].forEach(s => { c.beginPath(); c.arc(s * 11.5, -16.5, 4.6, 0, TAU); fs(c, shade(skin, -0.08), 1.3); c.beginPath(); c.arc(s * 11.5, -16.5, 2.2, 0, TAU); c.fillStyle = '#d99a8a'; c.fill(); });
  if (style === 'bald') { c.fillStyle = hairC; [-15.5, 15.5].forEach(x => { c.beginPath(); c.ellipse(x, -2, 2.4, 5.5, 0, 0, TAU); c.fill(); }); c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.ellipse(-4, -14, 5, 2.4, -0.4, 0, TAU); c.fill(); }
  let topY = { bald: -17.5, none: -17.5, bun: -35, curly: -22 }[style] || -24.5;
  if (hd && hd.type === 'turban') {
    topY = -29; c.beginPath(); c.ellipse(0, -20, 19.5, 8.6, 0, 0, TAU); fs(c, hd.color, 1.5); c.save(); c.beginPath(); c.ellipse(0, -20, 19, 8.2, 0, 0, TAU); c.clip(); c.strokeStyle = shade(hd.color, -0.26); c.lineWidth = 1.2;
    for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 6 - 4, -29); c.quadraticCurveTo(i * 6 + 2, -20, i * 6 - 3, -11); c.stroke(); } c.restore();
    c.beginPath(); c.moveTo(13, -16); c.quadraticCurveTo(21, -6, 16, 6); c.quadraticCurveTo(13, -2, 11, -9); c.closePath(); fs(c, shade(hd.color, -0.1), 1.2);
  }
  if (hd && hd.type === 'helmet') {
    topY = -30; const hg = c.createLinearGradient(-18, 0, 18, 0); hg.addColorStop(0, '#e0b060'); hg.addColorStop(0.5, '#b9833f'); hg.addColorStop(1, '#6a4818');
    [-1, 1].forEach(s => { c.beginPath(); c.moveTo(s * 14, -9); c.lineTo(s * 18, 6); c.quadraticCurveTo(s * 15, 11, s * 12.8, 9); c.lineTo(s * 12.8, -8); c.closePath(); fs(c, '#a07838', 1.2); });
    c.beginPath(); c.moveTo(-18.5, -5); c.bezierCurveTo(-21, -35, 21, -35, 18.5, -5); c.lineTo(13, -8); c.quadraticCurveTo(0, -15, -13, -8); c.closePath(); fs(c, hg, 1.5);
    c.beginPath(); c.moveTo(-3.5, -31); c.quadraticCurveTo(0, -43, 3.5, -31); c.closePath(); fs(c, PINK, 1.1);
  }
  if (hd && hd.type === 'veil') {
    topY = -27; c.beginPath(); c.moveTo(-20, 6); c.bezierCurveTo(-28, -36, 28, -36, 20, 6); c.quadraticCurveTo(15, -4, 11.5, -12); c.quadraticCurveTo(0, -17, -11.5, -12); c.quadraticCurveTo(-15, -4, -20, 6); c.closePath(); c.globalAlpha = 0.95; fs(c, hd.color, 1.4); c.globalAlpha = 1;
    c.strokeStyle = shade(hd.color, -0.28); c.lineWidth = 1; [-8, 0, 8].forEach(x => { c.beginPath(); c.moveTo(x, -26); c.quadraticCurveTo(x * 1.4, -20, x * 1.6, -14); c.stroke(); });
  }
  if (acc.headband) { c.beginPath(); c.moveTo(-17.5, -7); c.lineTo(-12.8, -12.6); c.quadraticCurveTo(0, -15.2, 12.8, -12.6); c.lineTo(17.5, -7); c.strokeStyle = INK; c.lineWidth = 4.4; c.stroke(); c.strokeStyle = acc.headband; c.lineWidth = 2.8; c.stroke(); }
  if (acc.laurel) for (let i = 0; i < 11; i++) { const a = Math.PI * 1.08 + i * (Math.PI * 0.84 / 10), x = Math.cos(a) * 19, y = -4 + Math.sin(a) * 19; c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2); c.beginPath(); c.ellipse(0, 0, 4.2, 2, 0, 0, TAU); fs(c, i % 2 ? '#d9b13a' : '#f0d060', 0.9); c.restore(); }
  if (acc.crown) { const y = topY + 3; c.beginPath(); c.moveTo(-13, y + 3); c.lineTo(-15, y - 8); c.lineTo(-6, y - 2); c.lineTo(0, y - 11); c.lineTo(6, y - 2); c.lineTo(15, y - 8); c.lineTo(13, y + 3); c.closePath(); fs(c, GOLD, 1.3); [[-15, -8], [0, -11], [15, -8]].forEach(([x, yy]) => { c.beginPath(); c.arc(x, y + yy - 1.5, 1.7, 0, TAU); fs(c, PINK, 0.8); }); }
  if (acc.halo) { c.strokeStyle = INK; c.lineWidth = 4.2; c.beginPath(); c.ellipse(0, topY - 7, 12, 3.4, 0, 0, TAU); c.stroke(); c.strokeStyle = '#fff0a0'; c.lineWidth = 2.4; c.stroke(); }
  c.restore();                                                        // fim do recorte

  /* --- olhos, sobrancelhas, boca: SEMPRE por cima do cabelo --- */
  const eyeCol = L.eyes || '#3a2616';
  [-1, 1].forEach(s => {
    const x = s * 6.5, happy = mood === 'happy';
    if (happy) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(x, 1, 3.6, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    else {
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x, -0.5, 3.8, fem ? 4.6 : 4.2, 0, 0, TAU); c.fill(); c.strokeStyle = INK; c.lineWidth = 0.9; c.stroke();
      if (L.love) heart(c, x, 0.2, 3.3, '#ff2d95');
      else { c.fillStyle = eyeCol; c.beginPath(); c.arc(x + s * 0.3 + 0.5, 0, 2.6, 0, TAU); c.fill(); c.fillStyle = '#0d0710'; c.beginPath(); c.arc(x + s * 0.3 + 0.5, 0, 1.3, 0, TAU); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(x + s * 0.3 + 1.4, -1.1, 0.9, 0, TAU); c.fill(); }
      c.strokeStyle = INK; c.lineWidth = fem ? 1.8 : 1.4; c.beginPath(); c.moveTo(x - 4, -2.6); c.quadraticCurveTo(x, -6, x + 4, -2.6); c.stroke();
      if (fem) { c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + s * 4, -2.8); c.lineTo(x + s * 6, -4.6); c.stroke(); }
    }
    const strain = mood === 'strain', hurt = mood === 'hurt', inY = strain ? -7.2 : hurt ? -10 : -8.4, outY = strain ? -10.4 : hurt ? -8 : -9.2;      // sobrancelha sempre acima do olho
    c.strokeStyle = hairC === '#e9e4dc' ? '#9a948c' : shade(hairC, -0.2); c.lineWidth = fem ? 1.5 : 2.2; c.beginPath(); c.moveTo(x - s * 3.8, inY - 2.4); c.quadraticCurveTo(x, Math.min(inY, outY) - 3.4, x + s * 4.2, outY - 2.2); c.stroke();
  });
  const open = mood === 'strain' || run || pose === 'up' || pose === 'push' || pose === 'cheer';
  if (open) { c.fillStyle = '#4a1020'; c.beginPath(); c.ellipse(0, 11, 3.4, 3.2, 0, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.fillRect(-2.4, 8.4, 4.8, 1.5); }
  else if (fem) { c.fillStyle = L.lips || '#d4506a'; c.beginPath(); c.moveTo(-4.2, 9); c.quadraticCurveTo(-1.5, 7.4, 0, 8.4); c.quadraticCurveTo(1.5, 7.4, 4.2, 9); c.quadraticCurveTo(0, 13, -4.2, 9); c.fill(); }
  else { c.strokeStyle = L.beard ? '#e8a090' : '#7a2a2a'; c.lineWidth = 1.7; c.beginPath(); c.arc(0, 7, 4.6, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
  if (animal) { c.fillStyle = '#fff'; c.strokeStyle = INK; c.lineWidth = 0.8; c.beginPath(); c.rect(-1.9, 9.6, 3.8, 3.4); c.fill(); c.stroke(); c.beginPath(); c.moveTo(0, 9.8); c.lineTo(0, 13); c.stroke(); }
  if (acc.glasses) { c.strokeStyle = '#2b1d33'; c.lineWidth = 1.5; c.fillStyle = 'rgba(190,230,255,.18)'; [-6.5, 6.5].forEach(x => { c.beginPath(); c.arc(x, -0.5, 5.6, 0, TAU); c.fill(); c.stroke(); }); c.beginPath(); c.moveTo(-0.9, -1); c.lineTo(0.9, -1); c.moveTo(-12, -1); c.lineTo(-15.5, 0); c.moveTo(12, -1); c.lineTo(15.5, 0); c.stroke(); }
  if (acc.shades) { c.strokeStyle = '#120a18'; c.lineWidth = 1.6; c.fillStyle = 'rgba(14,8,22,.93)'; [-6.5, 6.5].forEach(x => { c.beginPath(); c.roundRect ? c.roundRect(x - 5.8, -5, 11.6, 9.4, 3) : c.rect(x - 5.8, -5, 11.6, 9.4); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,45,149,.55)'; c.fillRect(x - 3.5, -3.6, 3, 1.4); c.fillStyle = 'rgba(14,8,22,.93)'; }); c.beginPath(); c.moveTo(-0.7, -1.5); c.lineTo(0.7, -1.5); c.moveTo(-12.4, -1.5); c.lineTo(-15.5, 0); c.moveTo(12.4, -1.5); c.lineTo(15.5, 0); c.stroke(); }
  c.restore();                                                        // fim da cabeça
  if (L.love && !o.still) for (let i = 0; i < 3; i++) { const u = ((t * 0.5 + i / 3) % 1), x = Math.sin(t * 1.3 + i * 2.1) * 20, y = -104 - u * 26; c.globalAlpha = 1 - u; if (i % 2 === 0) heart(c, x, y, 3.4, '#ff2d95'); else { c.fillStyle = GOLD; c.font = '800 12px Sora, sans-serif'; c.textAlign = 'center'; c.fillText('♪', x, y); } c.globalAlpha = 1; }

  /* ===== objetos nas mãos ===== */
  const [hx, hy] = hands[1], stick = (x1, y1, x2, y2, w, cc) => limb(c, x1, y1, x2, y2, w / 2, w / 2, cc);
  if (prop === 'staff') stick(hx, hy + 24, hx + 3, hy - 52, 3.6, '#a07a44');
  if (prop === 'spear') { stick(hx - 4, hy + 40, hx + 8, hy - 70, 3, '#9a9aa8'); c.beginPath(); c.moveTo(hx + 8, hy - 86); c.lineTo(hx + 13, hy - 68); c.lineTo(hx + 3, hy - 68); c.closePath(); fs(c, '#cfd2dd', 1); }
  if (prop === 'trowel') { stick(hx, hy + 3, hx + 3, hy - 6, 3.4, '#7a5a34'); c.beginPath(); c.moveTo(hx + 3, hy - 6); c.lineTo(hx - 3, hy - 17); c.lineTo(hx + 9, hy - 17); c.closePath(); fs(c, '#cfd2dd', 1); }
  if (prop === 'net') { stick(hx, hy + 6, hx + 3, hy - 10, 3, '#a07a44'); const nx = hx + 5, ny = hy - 22; c.save(); c.beginPath(); c.arc(nx, ny, 13, 0, TAU); c.clip(); c.strokeStyle = '#d9e6ee'; c.lineWidth = 1; c.beginPath(); for (let i = -26; i <= 26; i += 6) { c.moveTo(nx + i - 14, ny - 14); c.lineTo(nx + i + 14, ny + 14); c.moveTo(nx + i + 14, ny - 14); c.lineTo(nx + i - 14, ny + 14); } c.stroke(); c.restore(); c.strokeStyle = '#a07a44'; c.lineWidth = 2; c.beginPath(); c.arc(nx, ny, 13, 0, TAU); c.stroke(); }
  if (prop === 'guitar') { c.save(); c.translate(hx - 12, hy + 2); c.rotate(-0.55); stick(0, -14, 0, -46, 3.2, '#3a2415'); c.beginPath(); c.rect(-2.6, -52, 5.2, 8); fs(c, '#3a2415', 1);
    c.beginPath(); c.ellipse(0, -6, 8.5, 9.5, 0, 0, TAU); fs(c, '#d08a48', 1.3); c.beginPath(); c.ellipse(0, 10, 11.5, 12.5, 0, 0, TAU); fs(c, '#c27a3a', 1.3); c.beginPath(); c.arc(0, 3, 3.8, 0, TAU); c.fillStyle = '#1a0d1c'; c.fill();
    c.strokeStyle = '#f0e6c8'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-0.8, -46); c.lineTo(-0.8, 14); c.moveTo(0.8, -46); c.lineTo(0.8, 14); c.stroke(); c.restore(); }
  if (prop === 'drumstick') { stick(hx, hy + 8, hx + 5, hy - 22, 2.8, '#e8d7b0'); c.beginPath(); c.arc(hx + 5.2, hy - 23.5, 3.1, 0, TAU); fs(c, '#f3e6c4', 1); }
  if (prop === 'megaphone') { c.save(); c.translate(hx + 3, hy - 2); c.rotate(0.6); c.scale(0.85, 0.85); c.beginPath(); c.rect(-3, -2, 6, 10); fs(c, '#2a2a33', 1); c.beginPath(); c.moveTo(-4, -2); c.lineTo(-11, -22); c.lineTo(11, -22); c.lineTo(4, -2); c.closePath(); fs(c, PINK, 1.3); c.beginPath(); c.ellipse(0, -22, 11, 3.2, 0, 0, TAU); fs(c, '#ffd0e6', 1); c.restore(); }
  if (prop === 'sword') { stick(hx, hy + 6, hx + 4, hy - 46, 3.4, '#cfd2dd'); stick(hx - 6, hy - 2, hx + 8, hy - 2, 3, GOLD); }
  if (prop === 'scroll') { c.beginPath(); c.rect(hx - 5, hy - 12, 10, 18); fs(c, '#f3e3b5', 1); c.fillStyle = '#c9a25a'; c.fillRect(hx - 6.5, hy - 13.5, 13, 3.2); c.fillRect(hx - 6.5, hy + 3, 13, 3.2); }
  if (prop === 'sling') { c.strokeStyle = '#e8d7b0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(hx + 8, hy - 10, hx + 4, hy - 20); c.stroke(); c.beginPath(); c.arc(hx + 4, hy - 20, 2.8, 0, TAU); fs(c, '#ddd', 0.8); }
  if (prop === 'torch') { stick(hx + 1, hy + 12, hx + 2, hy - 18, 4, '#7a5a34'); const fy = hy - 25, fl = Math.sin(t * 14) * 1.6; c.beginPath(); c.moveTo(hx + 2, fy - 14 + fl); c.quadraticCurveTo(hx + 11, fy - 2, hx + 2, fy + 5); c.quadraticCurveTo(hx - 7, fy - 2, hx + 2, fy - 14 + fl); c.closePath(); fs(c, GOLD, 1.2); c.fillStyle = PINK; c.beginPath(); c.moveTo(hx + 2, fy - 6); c.quadraticCurveTo(hx + 6, fy, hx + 2, fy + 3); c.quadraticCurveTo(hx - 2, fy, hx + 2, fy - 6); c.fill(); }
  if (prop === 'tambourine') { c.strokeStyle = GOLD; c.lineWidth = 3; c.beginPath(); c.arc(hx + 4, hy - 12, 10, 0, TAU); c.stroke(); c.fillStyle = '#fff'; [0, 2, 4].forEach(q => { c.beginPath(); c.arc(hx + 4 + Math.cos(q) * 10, hy - 12 + Math.sin(q) * 10, 1.6, 0, TAU); c.fill(); }); }
  if (prop === 'wheat') { c.strokeStyle = '#e8c35a'; c.lineWidth = 2; c.beginPath(); [-4, 0, 4].forEach(q => { c.moveTo(hx, hy + 6); c.lineTo(hx + q * 2, hy - 28); }); c.stroke(); c.fillStyle = '#e8c35a'; [-4, 0, 4].forEach(q => { c.beginPath(); c.ellipse(hx + q * 2, hy - 31, 2.4, 6, 0, 0, TAU); c.fill(); }); }
  if (L.shield) { c.beginPath(); c.arc(hands[0][0] - 4, hands[0][1], 15, 0, TAU); fs(c, '#b9833f', 1.5); c.strokeStyle = GOLD; c.lineWidth = 2; c.beginPath(); c.arc(hands[0][0] - 4, hands[0][1], 10, 0, TAU); c.stroke(); }
  c.restore();
}

/* PNG de corpo inteiro (arte própria) animado por código */
function sprite(c, im, o) {
  const h = o.h, w = h * im.naturalWidth / im.naturalHeight, t = performance.now() / 1000, pose = o.pose || 'stand', ph = (o.ph || 0) * TAU;
  c.save(); c.translate(o.x, o.y + (pose === 'run' ? -Math.abs(Math.sin(ph)) * h * 0.06 : Math.sin(t * 2) * h * 0.012)); c.scale(o.dir || 1, 1);
  c.rotate(pose === 'run' ? 0.08 : pose === 'push' ? 0.12 : pose === 'throw' ? -0.08 : 0); if (pose === 'up') c.scale(1.06, 1.06);
  c.drawImage(im, -w / 2, -h, w, h); c.restore();
}

/* Retrato (busto) em data URL, com cache */
const pcache = {};
function portrait(L, size) {
  const key = size + JSON.stringify(L); if (pcache[key]) return pcache[key];
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size * 0.4, 4, size / 2, size / 2, size * 0.75); g.addColorStop(0, '#4a1240'); g.addColorStop(1, '#07060c'); c.fillStyle = g; c.fillRect(0, 0, size, size);
  const h = size * 1.5, kid = L.build === 'kid'; figure(c, L, { x: size / 2, y: size * 0.46 + (kid ? 0.772 : 0.74) * h, h: kid ? h / 0.7 : h, t: 0, still: true, mood: 'normal' });
  return (pcache[key] = cv.toDataURL());
}

/* Partículas */
function burst(arr, x, y, n, col, sp = 160, life = 0.6, g = 400) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = sp * (0.3 + Math.random()); arr.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * 0.3, life, max: life, col, g, r: 1.5 + Math.random() * 2.5 }); } }
function fxStep(arr, dt) { for (let i = arr.length - 1; i >= 0; i--) { const p = arr[i]; p.life -= dt; if (p.life <= 0) { arr.splice(i, 1); continue; } p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; } }
function fxDraw(c, arr) { arr.forEach(p => { c.globalAlpha = Math.max(0, p.life / p.max); c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.fill(); }); c.globalAlpha = 1; }

window.Art = { PINK, GOLD, INK, TAU, shade, hexA, clamp, figure, handPos, sprite, portrait, burst, fxStep, fxDraw, limb, fs, dpr: 1 };
})();
