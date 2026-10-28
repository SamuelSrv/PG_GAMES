/* main.js — estado, conta (Supabase), carteira/loja, telas e motor dos jogos */
(() => {
'use strict';
const { CONFIG, GAMES, ECON, VERSES, AVATARS, SHOP } = HubData, audio = HubAudio;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)], sleep = ms => new Promise(r => setTimeout(r, ms));
const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} }, del: k => { try { localStorage.removeItem(k); } catch {} } };
const Hub = window.Hub = { $, $$, audio, games: {}, current: null, run: null,
  state: { user: null, guest: store.get('hub_guest') === '1', nickname: store.get('hub_nick') || '', characterId: Number(store.get('hub_char') ?? -1) } };
Hub.hearts = (n, max = 3) => '♥\uFE0E'.repeat(Math.max(0, n)) + '♡\uFE0E'.repeat(Math.max(0, max - n));
Hub.rand = (a, b) => a + Math.random() * (b - a);
Hub.fit = cv => { const r = cv.getBoundingClientRect(), d = Art.dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); cv.getContext('2d').setTransform(d, 0, 0, d, 0, 0); return { w: r.width, h: r.height }; };

/* ===== Carteira (PG Coins, atributos, roupas) ===== */
const walletKey = () => 'hub_wallet_' + (Hub.state.user ? Hub.state.user.id : 'guest');
const blankWallet = () => ({ coins: 0, lv: { fe: 0, coragem: 0, sabedoria: 0, foco: 0, sorte: 0, vigor: 0 }, own: {}, outfit: '', acc: {}, aura: '', rev: 0 });
const Wallet = Hub.wallet = {
  d: blankWallet(), t: 0,
  load() {
    let loc = null; try { loc = JSON.parse(store.get(walletKey()) || 'null'); } catch {}
    const rem = Hub.state.user && Hub.state.user.user_metadata && Hub.state.user.user_metadata.wallet;
    const best = [loc, rem].filter(Boolean).sort((a, b) => (b.rev || 0) - (a.rev || 0))[0] || {};
    this.d = { ...blankWallet(), ...best }; this.d.lv = { ...blankWallet().lv, ...(best.lv || {}) }; this.d.own = { ...(best.own || {}) }; this.d.acc = { ...(best.acc || {}) };
  },
  save() { this.d.rev = Date.now(); store.set(walletKey(), JSON.stringify(this.d)); this.sync(); refreshCoins(); },
  sync() { const c = getClient(); if (!c || !Hub.state.user) return; clearTimeout(this.t); this.t = setTimeout(() => { c.auth.updateUser({ data: { nickname: Hub.state.nickname, wallet: this.d } }).catch(() => {}); }, 1500); },
  add(n) { this.d.coins += Math.max(0, Math.round(n)); this.save(); },
  look(base) {                                                        // visual final = personagem + roupa comprada (substitui a roupa inteira) + acessórios
    const L = { ...base, acc: { ...(base.acc || {}) } }, d = this.d, o = SHOP.outfit.find(x => x.id === d.outfit); if (o) L.outfit = { ...o.look };
    SHOP.acc.forEach(a => { if (d.acc[a.id]) Object.assign(L.acc, a.look); }); const au = SHOP.aura.find(x => x.id === d.aura); if (au) L.aura = au.color; return L;
  }
};
Hub.lvl = id => Wallet.d.lv[id] || 0; Hub.has = id => !!Wallet.d.own[id];
Hub.tier = game => { const g = SHOP.boost.find(b => b.game === game); let n = 0; if (g) for (const t of g.tiers) { if (Wallet.d.own[t.id]) n++; else break; } return n; };
Hub.payout = (id, score, pickups = 0) => Math.round((Math.min(ECON[id].cap, Math.floor(score / ECON[id].div)) + pickups) * (1 + 0.1 * Hub.lvl('sabedoria')));
const refreshCoins = () => { $$('#menu-coins, #shop-coins').forEach(e => { e.textContent = Wallet.d.coins; }); };

/* ===== Supabase: conta e ranking ===== */
let sb = null;
const getClient = () => { if (!sb && window.supabase && !CONFIG.SUPABASE_URL.includes('SEU-PROJETO')) sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY); return sb; };
const nickOf = u => (u && u.user_metadata && u.user_metadata.nickname) || '';
const applyUser = u => { Hub.state.user = u; Hub.state.guest = false; store.del('hub_guest'); Hub.state.nickname = nickOf(u) || (u.email || '').split('@')[0]; store.set('hub_nick', Hub.state.nickname); Wallet.load(); };
const authErr = e => {
  const m = (e && e.message) || String(e || ''), code = (e && e.code) || '';
  if (code === 'user_already_exists' || /already registered/i.test(m)) return 'Este e-mail já está cadastrado. Entre com a sua senha.';
  if (/invalid login/i.test(m)) return 'E-mail ou senha incorretos.'; if (/not confirmed/i.test(m)) return 'Este e-mail ainda não foi confirmado. Desative "Confirm email" no Supabase.';
  if (/rate limit|too many/i.test(m) || (e && e.status === 429)) return 'Muitas tentativas. Aguarde alguns minutos.'; if (/password/i.test(m)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/valid email|invalid.*email/i.test(m)) return 'Digite um e-mail válido.'; return m;
};
const isExists = e => !!e && (e.code === 'user_already_exists' || /already registered/i.test(e.message || ''));
const EMAIL_RE = /^[^\s@.][^\s@]*@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;
const EMAIL_FIX = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.co': 'gmail.com', 'hotmial.com': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'outlok.com': 'outlook.com', 'outlook.con': 'outlook.com', 'yaho.com': 'yahoo.com', 'yahoo.con': 'yahoo.com' };
const checkEmail = e => { if (e.length > 254 || e.includes('..') || !EMAIL_RE.test(e)) return 'Digite um e-mail válido.'; const [u, d] = e.toLowerCase().split('@'); return EMAIL_FIX[d] ? `Será que é ${u}@${EMAIL_FIX[d]}?` : ''; };
async function signUp(email, password, nickname) {
  const c = getClient(); if (!c) return { error: 'Supabase não configurado (config.js).' };
  const { data, error } = await c.auth.signUp({ email, password, options: { data: { nickname } } });
  if (error) return { error: authErr(error), exists: isExists(error) };
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) return { error: 'Este e-mail já está cadastrado. Entre com a sua senha.', exists: true };
  if (data.session) { applyUser(data.user); return {}; } return signIn(email, password);
}
async function signIn(email, password) { const c = getClient(); if (!c) return { error: 'Supabase não configurado (config.js).' }; const { data, error } = await c.auth.signInWithPassword({ email, password }); if (error) return { error: authErr(error) }; applyUser(data.user); return {}; }
async function signOut() { const c = getClient(); if (c) await c.auth.signOut(); Hub.state.user = null; Hub.state.guest = false; Hub.state.nickname = ''; ['hub_nick', 'hub_guest'].forEach(store.del); }
async function restoreSession() { const c = getClient(); if (!c) return; const { data } = await c.auth.getSession(); if (data && data.session) applyUser(data.session.user); }
const localScores = () => { try { return JSON.parse(store.get('hub_scores') || '[]'); } catch { return []; } };
async function saveScore(gameId, nickname, characterId, score) {
  const c = getClient();
  if (!c || !Hub.state.user) { const all = localScores(); all.push({ game_id: gameId, nickname, character_id: characterId, score }); store.set('hub_scores', JSON.stringify(all.slice(-200))); return { ok: false, local: true }; }
  const { error } = await c.from('scores').insert({ game_id: gameId, nickname, character_id: characterId, score }); if (error) console.error('saveScore:', error.message); return { ok: !error };
}
async function getTopScores(gameId) {
  const c = getClient(); let rows;
  if (!c) rows = localScores().filter(s => s.game_id === gameId);
  else { const { data, error } = await c.from('scores').select('nickname, character_id, score, user_id').eq('game_id', gameId).order('score', { ascending: false }).limit(200); if (error) { console.error('getTopScores:', error.message); return null; } rows = data; }
  rows.sort((a, b) => b.score - a.score); const seen = new Set();
  return rows.filter(r => { const k = r.user_id || r.nickname; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 10);
}

/* ===== Personagem escolhido ===== */
const findChar = id => AVATARS.find(x => x.id === id) || AVATARS[0], artImgs = {};
AVATARS.forEach(a => { if (a.art || a.img) { const im = new Image(); im.src = a.art || a.img; artImgs[a.id] = im; } });
const me = () => { const a = findChar(Hub.state.characterId), im = artImgs[a.id]; return { look: Wallet.look(a.look), img: im && im.complete && im.naturalWidth ? im : null, a }; };
Hub.player = (c, o) => { const w = me(); if (w.img) Art.sprite(c, w.img, o); else Art.figure(c, w.look, o); };       // usado pelos jogos
Hub.playerHand = (o, side) => Art.handPos(me().look, o, side);
const avatarSrc = (id, composed) => { const a = findChar(id); return a.img || Art.portrait(composed ? Wallet.look(a.look) : a.look, 96); };

/* ===== Navegação ===== */
let screen = 'loading';
const go = id => {
  screen = id; $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + id));
  if (id === 'menu') { $('#menu-avatar').src = avatarSrc(Math.max(0, Hub.state.characterId), true); $('#menu-nick').textContent = Hub.state.nickname; $('#btn-mute').classList.toggle('off', audio.muted); $('#verse').textContent = VERSES[Math.floor(Math.random() * VERSES.length)]; buildMenuArt(); refreshCoins(); $('#menu-scroll').scrollTop = 0; }
  if (id === 'name') $('#nick-input').value = Hub.state.nickname;
  if (id === 'shop') { $('#shop-msg').textContent = ''; renderShop(); startShopLoop(); }
  if (id === 'character') enterSelect();
};
const route = () => go(!(Hub.state.user || (Hub.state.guest && Hub.state.nickname)) ? 'auth' : Hub.state.characterId < 0 ? 'character' : 'menu');
function buildMenuArt() { const w = me(); $$('.card[data-game]').forEach(c => { $('.thumb', c).src = Art.thumb(c.dataset.game, 320, 240, w); }); }

/* ===== Seleção de personagem ===== */
const STAT_NAMES = ['Fé', 'Coragem', 'Sabedoria']; let selW = 0, selH = 0, flexT = 0, selRaf = 0, selLast = 0;
function buildSelect() {
  AVATARS.forEach(a => { const b = document.createElement('button'); b.className = 'tile'; b.dataset.id = a.id; b.setAttribute('aria-label', a.name); b.innerHTML = `<img alt="" src="${avatarSrc(a.id)}">`; b.addEventListener('click', () => { audio.unlock(); audio.sfx('click'); pick(a.id); }); $('#roster').appendChild(b); });
  $('#stats').innerHTML = STAT_NAMES.map(n => `<div class="stat"><span>${n}</span><b><em></em></b></div>`).join('');
}
function pick(id) {
  const a = findChar(id); Hub.state.characterId = a.id; flexT = 0.8; $$('.tile').forEach(t => t.classList.toggle('sel', Number(t.dataset.id) === a.id));
  $('#sel-name').textContent = a.name; $('#sel-role').textContent = a.role; $('#sel-bio').textContent = a.bio || ''; $$('#stats em').forEach((e, i) => { e.style.width = a.stats[i] + '%'; });
}
function enterSelect() { pick(Math.max(0, Hub.state.characterId)); selLast = performance.now(); selW = 0; if (!selRaf) selRaf = requestAnimationFrame(previewLoop); }
function previewLoop(now) {
  if (screen !== 'character') { selRaf = 0; return; }
  const cv = $('#select-canvas'), c = cv.getContext('2d');
  if (cv.clientWidth !== selW || cv.clientHeight !== selH) { const r = Hub.fit(cv); selW = cv.clientWidth; selH = cv.clientHeight; if (!r.w) { selRaf = requestAnimationFrame(previewLoop); return; } }
  const W = selW, H = selH, t = now / 1000, dt = Math.min(0.05, (now - selLast) / 1000), a = findChar(Hub.state.characterId); selLast = now; flexT = Math.max(0, flexT - dt); c.clearRect(0, 0, W, H);
  const g = c.createRadialGradient(W / 2, H * 0.55, 10, W / 2, H * 0.55, H * 0.85); g.addColorStop(0, 'rgba(255,45,149,.38)'); g.addColorStop(1, 'rgba(255,45,149,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.save(); c.translate(W / 2, H * 0.45); c.rotate(-0.12); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `${H * 0.5}px "Kaushan Script", cursive`; c.fillStyle = 'rgba(255,255,255,.07)'; c.fillText(a.name, 0, 0); c.restore();
  c.strokeStyle = Art.PINK; c.lineWidth = 2; c.beginPath(); c.ellipse(W / 2, H * 0.93, W * 0.26 + Math.sin(t * 3) * 4, 11, 0, 0, 7); c.stroke();
  const im = artImgs[a.id];
  if (im && im.complete && im.naturalWidth) { const h = H * 0.82, w = h * im.naturalWidth / im.naturalHeight; c.drawImage(im, W / 2 - w / 2, H * 0.93 - h + Math.sin(t * 2) * 3, w, h); }
  else Art.figure(c, a.look, { x: W / 2, y: H * 0.93, h: H * 0.8, t, pose: flexT > 0 ? 'cheer' : 'stand', prop: a.look.prop });
  selRaf = requestAnimationFrame(previewLoop);
}

/* ===== Conta ===== */
let authMode = 'login';
function setAuthMode(m) { authMode = m; $$('#screen-auth .tab').forEach(t => t.classList.toggle('on', t.dataset.mode === m)); $('#auth-nick').hidden = m !== 'signup'; $('#auth-submit').textContent = m === 'signup' ? 'Criar conta' : 'Entrar'; $('#auth-pass').autocomplete = m === 'signup' ? 'new-password' : 'current-password'; setMsg(''); }
const setMsg = (t, ok) => { const e = $('#auth-msg'); e.textContent = t; e.classList.toggle('ok', !!ok); };
async function submitAuth(e) {
  e.preventDefault(); audio.unlock(); const email = $('#auth-email').value.trim(), pass = $('#auth-pass').value, nick = $('#auth-nick').value.replace(/[\u0000-\u001f<>]/g, '').trim();
  const em = checkEmail(email); if (em) return setMsg(em); if (pass.length < 6) return setMsg('A senha precisa ter pelo menos 6 caracteres.');
  if (authMode === 'signup' && (nick.length < 2 || nick.length > 16)) return setMsg('O nickname deve ter de 2 a 16 caracteres.');
  const btn = $('#auth-submit'); btn.disabled = true; setMsg('Aguarde…', true); const r = authMode === 'signup' ? await signUp(email, pass, nick) : await signIn(email, pass); btn.disabled = false;
  if (r.error) { if (r.exists) setAuthMode('login'); return setMsg(r.error); } setMsg(''); $('#auth-pass').value = ''; audio.playTrack('menu'); route();
}

/* ===== Ranking ===== */
async function openRanking(gameId) {
  go('ranking'); $$('#rank-tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.game === gameId)); $('#rank-title').textContent = GAMES[gameId].name;
  const list = $('#rank-list'); list.innerHTML = '<li class="empty">Carregando…</li>'; const rows = await getTopScores(gameId); list.innerHTML = '';
  if (!rows || !rows.length) { list.innerHTML = `<li class="empty">${rows ? 'Ninguém jogou ainda. Seja o primeiro!' : 'Erro ao carregar o ranking.'}</li>`; return; }
  rows.forEach((r, i) => { const li = document.createElement('li'), mk = (cls, txt) => { const s = document.createElement('span'); s.className = cls; s.textContent = txt; li.appendChild(s); };
    mk('pos', i + 1); const im = new Image(); im.alt = ''; im.className = 'rk-av'; im.src = avatarSrc(r.character_id); li.appendChild(im); mk('nm', r.nickname); mk('sc', r.score); list.appendChild(li); });
}

/* ===== Loja ===== */
let shopTab = 'attr', shopRaf = 0;
function startShopLoop() {
  if (shopRaf) return; const cv = $('#shop-canvas'); let fw = 0;
  const loop = now => {
    if (screen !== 'shop') { shopRaf = 0; return; } if (!fw) { fw = Hub.fit(cv).w; }
    const c = cv.getContext('2d'), W = fw, w = me(); c.clearRect(0, 0, W, W);
    if (w.img) { const h = W * 0.86, ww = h * w.img.naturalWidth / w.img.naturalHeight; c.drawImage(w.img, W / 2 - ww / 2, W * 0.95 - h, ww, h); } else Art.figure(c, w.look, { x: W / 2, y: W * 0.94, h: W * 0.9, t: now / 1000 });
    shopRaf = requestAnimationFrame(loop);
  }; shopRaf = requestAnimationFrame(loop);
}
function renderShop() {
  const d = Wallet.d, a = findChar(Hub.state.characterId), list = $('#shop-list'), keep = list.scrollTop; list.innerHTML = ''; $$('#shop-tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === shopTab)); refreshCoins();
  const head = txt => { const h = document.createElement('li'); h.className = 'sub'; h.textContent = txt; list.appendChild(h); };
  const row = (img, title, sub, label, state, fn) => {
    const li = document.createElement('li'); li.className = 'item'; li.innerHTML = `${img ? `<img alt="" src="${img}">` : '<span class="ph"></span>'}<div class="tx"><b></b><small></small></div><button class="btn mini"></button>`;
    li.querySelector('b').textContent = title; li.querySelector('small').textContent = sub; const b = li.querySelector('button'); b.textContent = label; b.disabled = state === 'off'; b.classList.toggle('poor', state === 'poor');
    b.addEventListener('click', () => { audio.unlock(); fn(); }); list.appendChild(li);
  };
  const poor = c => d.coins < c ? 'poor' : '', base = a.look;
  if (shopTab === 'attr') SHOP.attr.forEach(it => { const lv = d.lv[it.id] || 0, mx = lv >= it.max; row(null, `${it.name}  ${'●'.repeat(lv)}${'○'.repeat(it.max - lv)}`, it.desc, mx ? 'Máx.' : `Melhorar · ${it.cost[lv]}`, mx ? 'off' : poor(it.cost[lv]), () => buy('attr', it)); });
  if (shopTab === 'outfit') {
    row(Art.portrait({ ...base, acc: base.acc }, 80), 'Roupa original', 'O visual do personagem', d.outfit === '' ? 'Em uso' : 'Usar', d.outfit === '' ? 'off' : '', () => { d.outfit = ''; Wallet.save(); renderShop(); });
    SHOP.outfit.forEach(it => { const own = d.own[it.id], on = d.outfit === it.id; row(Art.portrait({ ...base, outfit: it.look }, 80), it.name, 'Roupa completa', own ? (on ? 'Em uso' : 'Usar') : `Comprar · ${it.cost}`, own ? (on ? 'off' : '') : poor(it.cost), () => own ? (d.outfit = it.id, Wallet.save(), renderShop()) : buy('outfit', it)); });
  }
  if (shopTab === 'acc') {
    SHOP.acc.forEach(it => { const own = d.own[it.id]; row(Art.portrait({ ...base, acc: { ...(base.acc || {}), ...it.look } }, 80), it.name, 'Acessório', own ? (d.acc[it.id] ? 'Tirar' : 'Usar') : `Comprar · ${it.cost}`, own ? '' : poor(it.cost), () => own ? (d.acc[it.id] = !d.acc[it.id], Wallet.save(), renderShop()) : buy('acc', it)); });
    head('Auras');
    SHOP.aura.forEach(it => { const own = d.own[it.id], on = d.aura === it.id; row(Art.portrait({ ...base, aura: it.color }, 80), it.name, 'Brilho no chão', own ? (on ? 'Tirar' : 'Usar') : `Comprar · ${it.cost}`, own ? '' : poor(it.cost), () => own ? (d.aura = on ? '' : it.id, Wallet.save(), renderShop()) : buy('aura', it)); });
  }
  if (shopTab === 'boost') SHOP.boost.forEach(g => {
    head(GAMES[g.game].name);
    g.tiers.forEach((it, i) => { const own = d.own[it.id], prevOk = i === 0 || d.own[g.tiers[i - 1].id]; row(null, `${it.name}  ${'★'.repeat(i + 1)}`, it.desc, own ? 'Comprado' : !prevOk ? 'Bloqueado' : `Comprar · ${it.cost}`, own || !prevOk ? 'off' : poor(it.cost), () => buy('boost', it)); });
  });
  list.scrollTop = keep;
}
function buy(kind, it) {
  const d = Wallet.d, cost = kind === 'attr' ? it.cost[d.lv[it.id] || 0] : it.cost;
  if (d.coins < cost) { audio.sfx('miss'); $('#shop-msg').textContent = `Faltam ${cost - d.coins} PG Coins. Jogue mais para ganhar!`; return; }
  d.coins -= cost; $('#shop-msg').textContent = ''; if (kind === 'attr') d.lv[it.id] = (d.lv[it.id] || 0) + 1; else d.own[it.id] = 1;
  if (kind === 'outfit') d.outfit = it.id; if (kind === 'acc') d.acc[it.id] = 1; if (kind === 'aura') d.aura = it.id;
  audio.sfx('coin'); Wallet.save(); renderShop();
}

/* ===== Motor dos jogos ===== */
let active = null; const cvEl = $('#game-canvas');
Hub.registerGame = (id, def) => {
  const ctx = cvEl.getContext('2d'); let s = null, raf = 0, last = 0, pops = [], paused = false, el = 0;
  const g = {
    W: 0, H: 0, id, sfx: n => audio.sfx(n), shake() { const e = $('#screen-game'); e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); },
    hud(score, right, extra = '') { Hub.run.score = score; $('#hud-left').textContent = `Pontos ${score}${extra ? ' · ' + extra : ''}`; $('#hud-right').textContent = right || ''; $('#hud-coins b').textContent = Hub.payout(id, score, Hub.run.pickups); },
    coin(n, x, y) { if (Hub.run.pickups >= 6) return; Hub.run.pickups += n; g.pop('+' + n + ' PG', x, y, '#ffc94d'); audio.sfx('coin'); },       // moeda de item dourado (rara)
    pop(text, x, y, col = '#fff') { pops.push({ text, x, y, t: 0, col }); },
    end(score, detail) { if (!s || s.over) return; s.over = true; setTimeout(() => { if (active === game) Hub.finish(id, score, detail); }, def.endDelay || 700); }
  };
  const fit = () => { const r = Hub.fit(cvEl); g.W = r.w; g.H = r.h; };
  const frame = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; el += dt; g.t = el;
    def.update(s, dt, g); def.draw(s, ctx, g);
    pops.forEach(p => { p.t += dt; }); pops = pops.filter(p => p.t < 1);
    ctx.save(); ctx.textAlign = 'center'; ctx.font = '800 17px Sora, sans-serif'; pops.forEach(p => { ctx.globalAlpha = 1 - p.t; ctx.fillStyle = '#000'; ctx.fillText(p.text, p.x + 1, p.y - p.t * 40 + 1); ctx.fillStyle = p.col; ctx.fillText(p.text, p.x, p.y - p.t * 40); }); ctx.restore();
    raf = requestAnimationFrame(frame);
  };
  const game = {
    g, peek: () => s,
    start() { game.stop(); active = game; paused = false; el = 0; fit(); pops = []; s = def.setup(g); last = performance.now(); raf = requestAnimationFrame(frame); },
    stop() { cancelAnimationFrame(raf); raf = 0; if (active === game) active = null; s = null; },
    pause() { if (!s || s.over || paused) return false; paused = true; cancelAnimationFrame(raf); raf = 0; return true; },
    resume() { if (!paused) return; paused = false; last = performance.now(); raf = requestAnimationFrame(frame); },
    input(type, p) { if (s && !s.over && !paused && def[type]) def[type](s, p, g); },
    resize() { if (active === game) fit(); }
  };
  Hub.games[id] = game;
};
const pt = e => { const r = cvEl.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
cvEl.addEventListener('pointerdown', e => { e.preventDefault(); audio.unlock(); try { cvEl.setPointerCapture(e.pointerId); } catch {} active && active.input('press', pt(e)); });
cvEl.addEventListener('pointermove', e => active && active.input('move', pt(e)));
['pointerup', 'pointercancel'].forEach(n => cvEl.addEventListener(n, e => active && active.input('release', pt(e))));
document.addEventListener('keydown', e => { if (!active) return; if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) active.input('press', { x: active.g.W / 2, y: active.g.H / 2 }); } else if (e.code.startsWith('Arrow')) { e.preventDefault(); active.input('key', e.code); } else if (e.code === 'Escape' || e.code === 'KeyP') pauseGame(); });
document.addEventListener('keyup', e => { if (active && e.code === 'Space') active.input('release', { x: 0, y: 0 }); });
window.addEventListener('resize', () => active && active.resize()); window.addEventListener('orientationchange', () => setTimeout(() => active && active.resize(), 250));
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });
document.addEventListener('contextmenu', e => e.preventDefault());

function startGame(id) {
  if (!Hub.games[id]) return; if (Hub.current && Hub.games[Hub.current]) Hub.games[Hub.current].stop();
  Hub.current = id; go('game'); audio.playTrack(id); Hub.run = { id, pickups: 0, score: 0, done: false }; $('#hud-coins b').textContent = 0;
  $('#gameover').hidden = true; $('#pause').hidden = true; $('#force').hidden = id !== 'sansao'; requestAnimationFrame(() => Hub.games[id].start());
}
function pauseGame() { if (screen === 'game' && Hub.current && Hub.games[Hub.current] && Hub.games[Hub.current].pause()) $('#pause').hidden = false; }
function leaveGame() {
  if (Hub.run && !Hub.run.done) { Hub.run.done = true; const c = Math.floor(Hub.run.pickups / 2); if (c > 0) Wallet.add(c); }       // desistir: só metade das moedas douradas
  if (Hub.current && Hub.games[Hub.current]) Hub.games[Hub.current].stop(); Hub.current = null;
}
Hub.finish = async (id, score, detail = '') => {
  audio.sfx('win'); const bestKey = 'hub_best_' + id + '_' + walletKey(), prev = Number(store.get(bestKey) || 0), rec = score > prev; if (rec) store.set(bestKey, score);
  $('#go-title').textContent = rec && score > 0 ? 'Novo recorde!' : 'Fim de jogo'; $('#final-score').textContent = score; $('#final-detail').textContent = detail;
  $('#final-verse').textContent = `“${GAMES[id].verse}” — ${GAMES[id].ref}`;
  const gain = Hub.payout(id, score, Hub.run.pickups), e = ECON[id], capped = Math.floor(score / e.div) >= e.cap;
  if (Hub.run && !Hub.run.done) { Hub.run.done = true; Wallet.add(gain); }
  $('#final-coins').textContent = `+${gain} PG Coins` + (Hub.lvl('sabedoria') ? `\n(Sabedoria +${Hub.lvl('sabedoria') * 10}%)` : '') + (capped ? '\nlimite de moedas por partida' : '');
  $('#save-status').textContent = 'Salvando no ranking…'; $('#gameover').hidden = false;
  const r = await saveScore(id, Hub.state.nickname, Math.max(0, Hub.state.characterId), score);
  $('#save-status').textContent = r.ok ? 'Pontuação salva no ranking! 🏆' : r.local ? 'Salva só neste aparelho (entre com uma conta para o ranking global).' : 'Não foi possível salvar. Tente de novo.';
};

/* ===== Botões ===== */
const actions = {
  enter() { const v = $('#intro'); if (v) v.pause(); audio.playTrack('menu'); route(); },
  authTab: b => setAuthMode(b.dataset.mode), guest() { Hub.state.guest = true; store.set('hub_guest', '1'); go('name'); }, toAuth: () => go('auth'),
  saveName() { const v = $('#nick-input').value.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16); if (v.length < 2) { $('#nick-error').textContent = 'Use de 2 a 16 caracteres.'; return; } $('#nick-error').textContent = ''; Hub.state.nickname = v; store.set('hub_nick', v); route(); },
  confirmChar() { Hub.state.characterId = Math.max(0, Hub.state.characterId); store.set('hub_char', Hub.state.characterId); go('menu'); },
  play: b => startGame(b.dataset.game), ranking: () => openRanking('corrida'), rankTab: b => openRanking(b.dataset.game),
  shop: () => { shopTab = 'attr'; go('shop'); }, shopTab: b => { shopTab = b.dataset.tab; renderShop(); $('#shop-list').scrollTop = 0; },
  menu: () => go('menu'), changeAvatar: () => go('character'), mute: b => { b.classList.toggle('off', audio.toggleMute()); },
  async logout() { await signOut(); Wallet.load(); go('auth'); },
  pause: pauseGame, resume() { $('#pause').hidden = true; Hub.games[Hub.current] && Hub.games[Hub.current].resume(); },
  again: () => startGame(Hub.current), exit() { leaveGame(); audio.playTrack('menu'); go('menu'); }
};
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || b.disabled) return; audio.unlock(); const fn = actions[b.dataset.act]; if (fn) { if (!['pause', 'resume'].includes(b.dataset.act)) audio.sfx('click'); fn(b, e); } });
document.addEventListener('pointerdown', () => audio.unlock(), { once: true });
$('#auth-form').addEventListener('submit', submitAuth);

/* ===== Abertura (vídeo) e boot ===== */
let introEnded = true, loaded = false;
const refreshEnter = () => { if (!loaded) return; const b = $('#btn-enter'); b.hidden = false; b.textContent = introEnded ? 'Entrar' : 'Pular e entrar'; };
function setupIntro() {
  const v = $('#intro'), scr = $('#screen-loading'); if (!v) return; introEnded = false; const fail = () => { scr.classList.remove('has-video'); introEnded = true; refreshEnter(); };
  v.addEventListener('playing', () => scr.classList.add('has-video')); v.addEventListener('ended', () => { introEnded = true; refreshEnter(); }); v.addEventListener('error', fail);
  const src = v.querySelector('source'); if (src) src.addEventListener('error', fail); const p = v.play(); if (p && p.catch) p.catch(fail);
}
async function boot() {
  buildSelect(); setupIntro(); Hub.dpr = Art.dpr = Math.min(window.devicePixelRatio || 1, 2);
  const t0 = Date.now(); let real = 0; const bar = $('#load-bar'), txt = $('#load-text');
  const paint = () => { const p = Math.min(real, (Date.now() - t0) / CONFIG.MIN_LOAD_MS); bar.style.width = (p * 100) + '%'; txt.textContent = `Carregando… ${Math.round(p * 100)}%`; }; const iv = setInterval(paint, 60);
  let done = 0; const tick = () => { done++; real = done / 2; };
  await Promise.all([(document.fonts ? document.fonts.ready : Promise.resolve()).then(tick), restoreSession().catch(() => {}).then(tick), sleep(CONFIG.MIN_LOAD_MS), document.fonts && document.fonts.load ? document.fonts.load('20px "Kaushan Script"').catch(() => {}) : null]);
  real = 1; paint(); clearInterval(iv); if (!Hub.state.user) Wallet.load(); refreshCoins(); txt.textContent = 'Tudo pronto!'; loaded = true; refreshEnter();
}
window.addEventListener('load', () => setTimeout(boot, 0));
})();
