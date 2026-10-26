/* game_davi.js — A Funda de Davi (precisão) */
(() => {
'use strict';
const { $ } = Hub;
const cv = $('#game-canvas'), ctx = cv.getContext('2d');
// Ajustes de dificuldade
const CFG = { speed0: 0.9, speedMul: 1.10, zone0: 0.24, zoneMul: 0.94, zoneMin: 0.05, lives: 3, hitPts: 10 };
const C = { purple: '#a855f7', blue: '#38bdf8', green: '#4ade80', red: '#fb7185' };
let S = null, raf = 0, W = 0, H = 0;

function start() {
  stop();
  ({ w: W, h: H } = Hub.fit(cv));
  S = { run: true, lives: CFG.lives, score: 0, pos: 0, dir: 1, speed: CFG.speed0, zone: CFG.zone0, hp: 1,
        hitT: 0, flash: 0, shots: [], msg: '', msgT: 0, last: performance.now() };
  hud(); raf = requestAnimationFrame(loop);
}
function stop() { cancelAnimationFrame(raf); raf = 0; if (S) S.run = false; }
const hud = () => Hub.ui.hud(`Pontos ${S.score}`, '❤️'.repeat(S.lives) + '🖤'.repeat(CFG.lives - S.lives));

function press() {
  if (!S || !S.run) return;
  const inZone = Math.abs(S.pos - 0.5) <= S.zone / 2;
  if (inZone) {
    Hub.audio.sfx('hit');
    S.score += CFG.hitPts; S.hp = Math.max(0, S.hp - 0.2);
    S.speed *= CFG.speedMul;                                  // +10% de velocidade
    S.zone = Math.max(CFG.zoneMin, S.zone * CFG.zoneMul);     // zona diminui
    S.shots.push({ t: 0, from: S.pos }); S.msg = 'Perfect!'; S.msgT = 0.7; S.hitT = 0.3;
    if (S.hp <= 0) setTimeout(() => { if (S) S.hp = 1; }, 400); // novo gigante
  } else {
    Hub.audio.sfx('miss'); Hub.ui.shake();
    S.lives--; S.flash = 0.4; S.msg = 'Errou!'; S.msgT = 0.6;
    if (S.lives <= 0) { S.run = false; setTimeout(() => Hub.endGame('davi', S.score, `${S.score / CFG.hitPts} acertos`), 700); }
  }
  hud();
}
Hub.onPress(cv, press);
document.addEventListener('keydown', e => { if (e.code === 'Space' && Hub.current === 'davi') { e.preventDefault(); press(); } });
window.addEventListener('resize', () => { if (Hub.current === 'davi') ({ w: W, h: H } = Hub.fit(cv)); });

function loop(now) {
  const dt = Math.min(0.05, (now - S.last) / 1000); S.last = now;
  if (S.run) {                                                // ping-pong
    S.pos += S.dir * S.speed * dt;
    if (S.pos >= 1) { S.pos = 1; S.dir = -1; } else if (S.pos <= 0) { S.pos = 0; S.dir = 1; }
  }
  S.hitT = Math.max(0, S.hitT - dt); S.flash = Math.max(0, S.flash - dt); S.msgT = Math.max(0, S.msgT - dt);
  S.shots.forEach(s => s.t += dt / 0.3); S.shots = S.shots.filter(s => s.t < 1);
  draw(); raf = requestAnimationFrame(loop);
}

function glow(color, blur = 18) { ctx.shadowColor = color; ctx.shadowBlur = blur; }
function draw() {
  ctx.clearRect(0, 0, W, H); ctx.shadowBlur = 0;
  const bx = W * 0.08, bw = W * 0.84, bh = Math.max(24, H * 0.045), by = H * 0.8, cx = W / 2;
  const gx = cx + (S.hitT > 0 ? Math.sin(S.hitT * 80) * 8 : 0), gy = H * 0.3, gs = Math.min(W * 0.5, H * 0.3);

  // Gigante + barra de vida
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `${gs}px serif`; ctx.fillText('👹', gx, gy);
  ctx.fillStyle = '#2a2145'; ctx.fillRect(W * 0.25, H * 0.12, W * 0.5, 10);
  glow(C.red, 10); ctx.fillStyle = C.red; ctx.fillRect(W * 0.25, H * 0.12, W * 0.5 * S.hp, 10); ctx.shadowBlur = 0;

  // Barra e Zona Verde
  ctx.fillStyle = '#161029'; ctx.fillRect(bx, by, bw, bh);
  glow(C.blue, 12); ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
  const zw = S.zone * bw; glow(C.green, 22); ctx.fillStyle = C.green; ctx.fillRect(cx - zw / 2, by, zw, bh); ctx.shadowBlur = 0;

  // Cursor (pedra)
  glow(C.purple, 20); ctx.fillStyle = '#ece6ff'; ctx.beginPath();
  ctx.arc(bx + S.pos * bw, by + bh / 2, bh * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

  // Pedras lançadas ao gigante
  S.shots.forEach(s => {
    const x = bx + s.from * bw + (gx - (bx + s.from * bw)) * s.t, y = by + (gy - by) * s.t;
    glow(C.green, 14); ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  });

  // Texto flutuante e flash de erro
  if (S.msgT > 0) {
    ctx.globalAlpha = Math.min(1, S.msgT * 2); ctx.font = '800 32px Sora, sans-serif';
    const ok = S.msg === 'Perfect!'; glow(ok ? C.green : C.red, 16); ctx.fillStyle = ok ? C.green : C.red;
    ctx.fillText(S.msg, cx, by - 50 - (0.7 - S.msgT) * 30); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }
  if (S.flash > 0) { ctx.fillStyle = `rgba(251,113,133,${S.flash})`; ctx.fillRect(0, 0, W, H); }
  if (S.score === 0 && S.run) { ctx.fillStyle = '#9a8fbd'; ctx.font = '600 16px Sora, sans-serif'; ctx.fillText('Toque quando a pedra estiver na zona verde', cx, by + bh + 40); }
}

Hub.games.davi = { title: 'A Funda de Davi', start, stop };
})();
