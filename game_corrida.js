/* game_corrida.js — Corrida da Fé: Elias corre pelo Carmelo (1 Rs 18:46). Toque para pular (segure = mais alto). Ídolos, altares e corvos. */
(() => {
'use strict';
const { PINK, GOLD } = Art, GRAV = 2300, JUMP = -760,
  tryJump = (s, g) => {                                                // pulo + segundo pulo (Asas de Fé)
    const max = 2 + (Hub.tier('corrida') >= 1 ? 1 : 0); if (s.air && s.jumps >= max) return false;
    s.vy = JUMP * (s.air ? 0.88 : 1); s.jumps = s.air ? s.jumps + 1 : 1; s.air = true; s.jt = 0; s.buf = 0; g.sfx('jump'); Art.burst(s.parts, g.W * 0.24, s.y, 8, PINK, 120, 0.35, 300); return true;
  }, plh = g => Math.max(64, Math.min(104, g.H * 0.17));
Hub.registerGame('corrida', {
  endDelay: 900,
  setup(g) {
    const sh = Hub.lvl('fe') + (Hub.tier('corrida') >= 3 ? 1 : 0);
    const s = { gy: g.H * 0.8, y: g.H * 0.8, vy: 0, jumps: 0, air: false, hold: false, started: false, dist: 0, bonus: 0, score: 0, obs: [], pk: [], nextObs: 360, nextPk: 200, t: 0, parts: [], shield: sh, inv: 0, ph: 0, scrolls: 0, jt: 0, buf: 0 };
    g.hud(0, sh ? `Escudo ${sh}` : ''); return s;
  },
  press(s, p, g) {
    s.started = true; s.hold = true; s.buf = 0.14; tryJump(s, g);
  },
  release(s) { s.hold = false; },
  update(s, dt, g) {
    const { W, H } = g, ph = plh(g), px = W * 0.24; s.gy = H * 0.8; Art.fxStep(s.parts, dt);
    if (s.over) { s.vy += GRAV * dt; s.y = Math.min(s.gy, s.y + s.vy * dt); return; }
    if (!s.started) { s.y = s.gy; return; }
    s.t += dt; s.inv = Math.max(0, s.inv - dt);
    const m = s.dist / 50, speed = Math.min(720, (300 + m * 2.2) * (1 - 0.06 * Hub.lvl('coragem')));
    s.dist += speed * dt; s.ph += speed * dt / (ph * 2.4);
    s.jt += dt; s.buf = Math.max(0, s.buf - dt); let gr = GRAV;
    if (!s.hold && s.vy < 0 && s.jt > 0.14) gr = GRAV * 2.4;                                    // soltou: pulo mais curto (toque rápido ainda passa de 100 px)
    if (s.hold && s.vy > 0 && Hub.tier('corrida') >= 2) { gr = GRAV * 0.3; s.vy = Math.min(s.vy, 170); }     // Manto de Elias: plana
    s.vy += gr * dt; s.y += s.vy * dt;
    if (s.y >= s.gy) { if (s.air) Art.burst(s.parts, px, s.gy, 6, '#b9a0c8', 90, 0.4, 200); s.y = s.gy; s.vy = 0; s.air = false; s.jumps = 0; if (s.buf > 0) tryJump(s, g); }
    s.nextObs -= speed * dt;
    if (s.nextObs <= 0) {
      const r = Math.random(); let o, gap = speed * 0.62 * Hub.rand(1.25, 1.8) + 80;
      if (m > 18 && r > 0.86) { s.obs.push({ type: 'idol', w: 34, h: 82, x: W + 60 }, { type: 'idol', w: 34, h: 100, x: W + 190 }); gap += 190; }          // dupla de ídolos: exige pulo duplo
      else {
        if (r < 0.38 || m < 8) o = { type: 'idol', w: 34, h: Hub.rand(70, 105) }; else if (r < 0.58) o = { type: 'altar', w: 80, h: Hub.rand(42, 56) };
        else if (r < 0.8 || m < 20) o = { type: 'raven', w: 38, h: 20, cy: Hub.rand(46, 72) }; else o = { type: 'raven', w: 38, h: 20, cy: 125 };
        o.x = W + 60; s.obs.push(o); gap += o.w;
      }
      s.nextObs = gap;
    }
    s.nextPk -= speed * dt;
    if (s.nextPk <= 0) {
      const gold = Math.random() < 0.06 * (1 + 0.25 * Hub.lvl('sorte')), base = Hub.rand(70, 160);
      for (let i = 0; i < 3; i++) s.pk.push({ x: W + 40 + i * 80, y: base, gold: gold && i === 1 });                  // 3 pergaminhos bem espaçados
      s.nextPk = Hub.rand(480, 760);
    }
    const f = 1 - (0.12 + 0.04 * Hub.lvl('foco') + (Hub.tier('corrida') >= 2 ? 0.08 : 0)), hw = ph * 0.26 * f, top = s.y - ph * 0.85 * f, bot = s.y - 4;
    let hit = false;
    s.obs.forEach(o => {
      o.x -= speed * dt; const l = o.x - o.w / 2, r = o.x + o.w / 2, t = o.type === 'raven' ? s.gy - o.cy - o.h / 2 : s.gy - o.h, b = o.type === 'raven' ? s.gy - o.cy + o.h / 2 : s.gy;
      if (px + hw > l && px - hw < r && bot > t && top < b) hit = true;
    });
    s.obs = s.obs.filter(o => o.x > -80);
    s.pk.forEach(k => {
      k.x -= speed * dt; if (Hub.tier('corrida') >= 3 && Math.abs(k.x - px) < 150) { k.x += (px - k.x) * Math.min(1, dt * 6); k.y += ((s.gy - s.y + ph * 0.5) - k.y) * Math.min(1, dt * 6); }
      if (Math.hypot(k.x - px, (s.gy - k.y) - (s.y - ph * 0.5)) < 30) { k.dead = true; s.scrolls++; s.bonus += k.gold ? 15 : 5; g.sfx('hit'); Art.burst(s.parts, k.x, s.gy - k.y, 8, GOLD, 160, 0.4); if (k.gold) g.coin(1, k.x, s.gy - k.y - 20); }
    });
    s.pk = s.pk.filter(k => !k.dead && k.x > -40);
    if (hit && s.inv <= 0) {
      if (s.shield > 0) { s.shield--; s.inv = 1.4 + 0.3 * Hub.lvl('vigor'); g.sfx('hit'); g.shake(); Art.burst(s.parts, px, s.y - ph * 0.5, 18, GOLD, 240, 0.6); s.obs = s.obs.filter(o => Math.abs(o.x - px) > 70); }
      else { s.vy = -260; g.sfx('miss'); g.shake(); Art.burst(s.parts, px, s.y - ph * 0.5, 28, PINK, 300, 0.8); g.end(s.score, `${Math.floor(m)} m corridos · ${s.scrolls} pergaminhos`); return; }
    }
    s.score = Math.floor(m) + s.bonus; g.hud(s.score, s.shield ? `Escudo ${s.shield}` : '');
  },
  draw(s, c, g) {
    const { W, H } = g, ph = plh(g), px = W * 0.24, now = performance.now() / 1000;
    Art.runnerBg(c, W, H, s.dist, now, s.score > 120); Art.verse(c, W, H, 'corrida', 0.2, 0.4);
    c.fillStyle = '#0b0612'; c.fillRect(0, s.gy, W, H - s.gy); c.fillStyle = PINK; c.fillRect(0, s.gy, W, 3);
    c.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 12; i++) c.fillRect((((i * 90 - s.dist) % (W + 90)) + W + 90) % (W + 90) - 40, s.gy + 14 + (i % 3) * 14, 40, 3);
    s.obs.forEach(o => { if (o.type === 'idol') Art.idol(c, o.x, s.gy, o.w, o.h); else if (o.type === 'altar') Art.altar(c, o.x, s.gy, o.w, o.h, now); else Art.raven(c, o.x, s.gy - o.cy, now); });
    s.pk.forEach(k => Art.scroll(c, k.x, s.gy - k.y + Math.sin(now * 5 + k.x) * 3, 0.9, k.gold));
    Art.fxDraw(c, s.parts);
    const hgt = Math.max(0, s.gy - s.y); c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(px, s.gy + 2, 22 * (1 - Math.min(0.5, hgt / 300)), 5, 0, 0, 7); c.fill();
    c.save(); c.translate(px, s.y); c.globalAlpha = s.inv > 0 && Math.floor(s.inv * 12) % 2 ? 0.35 : 1;
    Hub.player(c, { x: 0, y: 0, h: ph, pose: s.over ? 'stand' : s.air ? 'cheer' : 'run', mood: s.over ? 'hurt' : 'normal', ph: s.ph }); c.restore();
    if (!s.started) { c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '24px "Kaushan Script", cursive'; c.fillText('Toque para pular · toque de novo no ar = pulo duplo!', W / 2, H * 0.55); c.font = '600 13px Sora, sans-serif'; c.fillStyle = '#a99bb8'; c.fillText('Segure para pular mais alto · acelera com o tempo', W / 2, H * 0.55 + 26); }
  }
});
})();
