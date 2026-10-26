/* game_sansao.js — A Força de Sansão (tap spammer) */
(() => {
'use strict';
const { $ } = Hub;
const cv = $('#game-canvas'), ctx = cv.getContext('2d'), fill = $('#force-fill');
// Ajustes de jogo
const CFG = { duration: 10, gain: 3, drainPerSec: 5 };
const C = { purple: '#a855f7', blue: '#38bdf8', green: '#4ade80' };
let S = null, raf = 0, W = 0, H = 0;

function start() {
  stop();
  ({ w: W, h: H } = Hub.fit(cv));
  S = { run: true, started: false, time: CFG.duration, force: 0, score: 0, taps: 0, kick: 0, last: performance.now() };
  hud(); fill.style.height = '0%'; raf = requestAnimationFrame(loop);
}
function stop() { cancelAnimationFrame(raf); raf = 0; if (S) S.run = false; }
const hud = () => Hub.ui.hud(`Pontos ${S.score}`, `⏱ ${S.time.toFixed(1)}s`);

function tap() {
  if (!S || !S.run) return;
  S.started = true;                                  // o cronômetro começa no primeiro toque
  S.force = Math.min(100, S.force + CFG.gain);
  S.score += 1 + Math.floor(S.force / 34);           // bônus por manter a força alta
  S.taps++; S.kick = 1;
  Hub.audio.sfx('tap'); Hub.ui.shake(); hud();
}
Hub.onPress(cv, tap);
document.addEventListener('keydown', e => { if (e.code === 'Space' && Hub.current === 'sansao') { e.preventDefault(); if (!e.repeat) tap(); } });
window.addEventListener('resize', () => { if (Hub.current === 'sansao') ({ w: W, h: H } = Hub.fit(cv)); });

function loop(now) {
  const dt = Math.min(0.05, (now - S.last) / 1000); S.last = now;
  if (S.run && S.started) {
    S.force = Math.max(0, S.force - CFG.drainPerSec * dt);   // esvazia 5% por segundo
    S.time = Math.max(0, S.time - dt); hud();
    if (S.time <= 0) { S.run = false; Hub.endGame('sansao', S.score, `${S.taps} toques`); }
  }
  S.kick = Math.max(0, S.kick - dt * 8);
  fill.style.height = S.force + '%';
  draw(); raf = requestAnimationFrame(loop);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, ground = H * 0.78, ph = H * 0.42, pw = Math.min(54, W * 0.12);
  const ang = (S.force / 100) * 0.35 + S.kick * 0.03;      // pilares se afastam com a força

  // Chão
  ctx.shadowColor = C.purple; ctx.shadowBlur = 14; ctx.fillStyle = C.purple; ctx.fillRect(0, ground, W, 4); ctx.shadowBlur = 0;

  // Pilares
  [-1, 1].forEach(side => {
    ctx.save(); ctx.translate(cx + side * W * 0.3, ground); ctx.rotate(side * ang);
    ctx.shadowColor = C.blue; ctx.shadowBlur = 16; ctx.fillStyle = '#1b2547'; ctx.fillRect(-pw / 2, -ph, pw, ph);
    ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.strokeRect(-pw / 2, -ph, pw, ph);
    ctx.shadowBlur = 0; ctx.strokeStyle = '#38bdf855'; ctx.lineWidth = 2;
    for (let y = -ph + 30; y < 0; y += 40) { ctx.beginPath(); ctx.moveTo(-pw / 2, y); ctx.lineTo(pw / 2, y); ctx.stroke(); } // sulcos
    ctx.restore();
  });

  // Braços e personagem
  const size = Math.min(W * 0.3, 120), cy = ground - size * 0.55, av = Hub.AVATARS[Math.max(0, Hub.state.characterId)].emoji;
  ctx.strokeStyle = C.green; ctx.shadowColor = C.green; ctx.shadowBlur = 12; ctx.lineWidth = 8; ctx.lineCap = 'round';
  [-1, 1].forEach(side => {
    ctx.beginPath(); ctx.moveTo(cx + side * size * 0.3, cy);
    ctx.lineTo(cx + side * W * 0.3 - side * pw * 0.5, ground - ph * 0.5); ctx.stroke();
  });
  ctx.shadowBlur = 0; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${size}px serif`; ctx.fillText(av, cx + (Math.random() - 0.5) * S.force / 25, cy);

  if (!S.started) { ctx.fillStyle = C.green; ctx.font = '800 26px Sora, sans-serif'; ctx.fillText('Toque rápido para começar!', cx, H * 0.2); }
}

Hub.games.sansao = { title: 'A Força de Sansão', start, stop };
})();
