/* main.js — estado, navegação, conta (Supabase Auth), AudioManager, ranking e motor dos jogos */
(() => {
'use strict';

/* ===== Configuração (edite aqui) ===== */
const CONFIG = {
  SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
  SUPABASE_ANON_KEY: 'SUA_ANON_KEY',
  MIN_LOAD_MS: 1500,
  IMAGES: [],                       // URLs de imagens para pré-carregar
  AUDIO: { bgm: '', click: '', hit: '', miss: '', tap: '', win: '' } // URLs opcionais; vazio = som sintetizado
};
/* Elenco da seleção de personagens. Para adicionar um personalizado (foto/arte do PG), inclua uma linha com o próximo id:
   { id: 12, name: 'Nome', role: 'Frase curta', stats: [80, 80, 80], img: 'assets/characters/nome.png', art: 'assets/characters/nome-corpo.png' }
   img = retrato quadrado (avatar); art = corpo inteiro para o palco (opcional). */
const AVATARS = [
  { id: 0,  key: 'davi',    name: 'Davi',    role: 'O pastor que virou rei',     stats: [90, 95, 70] },
  { id: 1,  key: 'ester',   name: 'Ester',   role: 'Coragem de rainha',          stats: [85, 100, 80] },
  { id: 2,  key: 'daniel',  name: 'Daniel',  role: 'Fiel na cova dos leões',     stats: [100, 80, 95] },
  { id: 3,  key: 'moises',  name: 'Moisés',  role: 'Libertador do povo',         stats: [95, 85, 90] },
  { id: 4,  key: 'debora',  name: 'Débora',  role: 'Juíza e profetisa',          stats: [90, 90, 100] },
  { id: 5,  key: 'jose',    name: 'José',    role: 'Do poço ao palácio',         stats: [95, 70, 100] },
  { id: 6,  key: 'rute',    name: 'Rute',    role: 'Lealdade que não solta',     stats: [100, 75, 85] },
  { id: 7,  key: 'josue',   name: 'Josué',   role: 'Sê forte e corajoso',        stats: [90, 100, 75] },
  { id: 8,  key: 'gideao',  name: 'Gideão',  role: '300 homens e uma trombeta',  stats: [80, 90, 85] },
  { id: 9,  key: 'paulo',   name: 'Paulo',   role: 'Corri a carreira',           stats: [100, 95, 90] },
  { id: 10, key: 'miria',   name: 'Miriã',   role: 'Louvor depois do mar',       stats: [90, 80, 85] },
  { id: 11, key: 'salomao', name: 'Salomão', role: 'O rei mais sábio',           stats: [85, 70, 100] }
];
const GAMES = { corrida: 'Corrida da Fé', muros: 'Muros de Neemias', pesca: 'Pescadores de Homens', davi: 'Funda de Davi', sansao: 'Força de Sansão' };
const VERSES = [
  'Tudo posso naquele que me fortalece. — Fp 4:13', 'O Senhor é o meu pastor; nada me faltará. — Sl 23:1',
  'Sê forte e corajoso. — Js 1:9', 'Se Deus é por nós, quem será contra nós? — Rm 8:31',
  'Lança sobre o Senhor o teu cuidado. — Sl 55:22', 'Não temas, porque eu sou contigo. — Is 41:10'
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const store = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  del: k => { try { localStorage.removeItem(k); } catch {} }
};

const Hub = window.Hub = {
  CONFIG, AVATARS, GAMES, $, $$, games: {}, current: null,
  state: { user: null, guest: store.get('hub_guest') === '1', nickname: store.get('hub_nick') || '', characterId: Number(store.get('hub_char') ?? -1) }
};
Hub.hearts = (n, max = 3) => '♥\uFE0E'.repeat(Math.max(0, n)) + '♡\uFE0E'.repeat(Math.max(0, max - n));  // texto, não emoji

/* Evita delay no celular: touchstart + mousedown, ignorando o clique fantasma. */
let lastTouch = 0;
Hub.onPress = (el, fn) => {
  el.addEventListener('touchstart', e => { lastTouch = Date.now(); e.preventDefault(); fn(e); }, { passive: false });
  el.addEventListener('mousedown', e => { if (Date.now() - lastTouch > 600) fn(e); });
};
Hub.fit = cv => { // ajusta o canvas ao tamanho CSS (retina)
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = r.width * d; cv.height = r.height * d;
  cv.getContext('2d').setTransform(d, 0, 0, d, 0, 0);
  return { w: r.width, h: r.height };
};

/* ===== AudioManager ===== */
class AudioManager {
  constructor() { this.ctx = null; this.muted = store.get('hub_muted') === '1'; this.timer = null; this.step = 0; this.bgmEl = null; }
  unlock() { // precisa de um gesto do usuário
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC(); this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1; this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  tone(f, d, { type = 'sine', vol = .2, slide = 0, delay = 0 } = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + d);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + d + .02);
  }
  sfx(name) {
    if (this.muted) return;
    const url = CONFIG.AUDIO[name];
    if (url) { new Audio(url).play().catch(() => {}); return; }
    const p = {
      click: () => this.tone(660, .08, { type: 'square', vol: .08 }),
      hit:   () => { this.tone(180, .25, { type: 'sawtooth', vol: .25, slide: -120 }); this.tone(880, .12, { type: 'square', vol: .1, delay: .02 }); },
      miss:  () => this.tone(200, .35, { type: 'sawtooth', vol: .2, slide: -150 }),
      tap:   () => this.tone(120, .1, { type: 'square', vol: .18, slide: -60 }),
      win:   () => [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .2, { type: 'triangle', vol: .15, delay: i * .1 }))
    };
    (p[name] || (() => {}))();
  }
  playBGM() {
    if (CONFIG.AUDIO.bgm) {
      if (!this.bgmEl) { this.bgmEl = new Audio(CONFIG.AUDIO.bgm); this.bgmEl.loop = true; this.bgmEl.volume = .4; }
      this.bgmEl.muted = this.muted; this.bgmEl.play().catch(() => {}); return;
    }
    if (this.timer || !this.ctx) return;
    const n = [220, 261.6, 329.6, 392, 329.6, 261.6, 293.7, 349.2];
    this.timer = setInterval(() => {
      if (this.muted) return;
      this.tone(n[this.step % n.length], .5, { type: 'triangle', vol: .06 });
      if (this.step % 4 === 0) this.tone(n[0] / 2, 1.8, { vol: .08 });
      this.step++;
    }, 450);
  }
  toggleMute() {
    this.muted = !this.muted; store.set('hub_muted', this.muted ? '1' : '0');
    if (this.master) this.master.gain.value = this.muted ? 0 : 1;
    if (this.bgmEl) this.bgmEl.muted = this.muted;
    return this.muted;
  }
}
const audio = Hub.audio = new AudioManager();

/* ===== Supabase: conta e ranking ===== */
let sb = null;
const getClient = () => {
  if (!sb && window.supabase && !CONFIG.SUPABASE_URL.includes('SEU-PROJETO'))
    sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  return sb;
};
const nickOf = u => (u && u.user_metadata && u.user_metadata.nickname) || '';
const applyUser = u => {
  Hub.state.user = u; Hub.state.guest = false; store.del('hub_guest');
  Hub.state.nickname = nickOf(u) || (u.email || '').split('@')[0]; store.set('hub_nick', Hub.state.nickname);
};
const authErr = m => ({
  'Invalid login credentials': 'E-mail ou senha incorretos.', 'User already registered': 'Este e-mail já tem conta. Use "Entrar".'
}[m] || m);

async function signUp(email, password, nickname) {
  const c = getClient(); if (!c) return { error: 'Supabase não configurado em main.js.' };
  const { data, error } = await c.auth.signUp({ email, password, options: { data: { nickname } } });
  if (error) return { error: authErr(error.message) };
  if (!data.session) return { info: 'Conta criada! Confirme o e-mail que enviamos e depois entre.' };
  applyUser(data.user); return {};
}
async function signIn(email, password) {
  const c = getClient(); if (!c) return { error: 'Supabase não configurado em main.js.' };
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) return { error: authErr(error.message) };
  applyUser(data.user); return {};
}
async function signOut() {
  const c = getClient(); if (c) await c.auth.signOut();
  Hub.state.user = null; Hub.state.guest = false; Hub.state.nickname = '';
  ['hub_nick', 'hub_guest'].forEach(store.del);
}
async function restoreSession() {
  const c = getClient(); if (!c) return;
  const { data } = await c.auth.getSession();
  if (data && data.session) applyUser(data.session.user);
}

const localScores = () => { try { return JSON.parse(store.get('hub_scores') || '[]'); } catch { return []; } };

/** INSERT em scores. Conta logada grava no Supabase; visitante grava só no aparelho. */
async function saveScore(gameId, nickname, characterId, score) {
  const c = getClient();
  if (!c || !Hub.state.user) {
    const all = localScores(); all.push({ game_id: gameId, nickname, character_id: characterId, score });
    store.set('hub_scores', JSON.stringify(all.slice(-200)));
    return { ok: false, local: true };
  }
  const { error } = await c.from('scores').insert({ game_id: gameId, nickname, character_id: characterId, score });
  if (error) console.error('saveScore:', error.message);
  return { ok: !error };
}

/** SELECT do top 10: a melhor pontuação de cada jogador. */
async function getTopScores(gameId) {
  const c = getClient();
  let rows;
  if (!c) rows = localScores().filter(s => s.game_id === gameId);
  else {
    const { data, error } = await c.from('scores').select('nickname, character_id, score, user_id')
      .eq('game_id', gameId).order('score', { ascending: false }).limit(200);
    if (error) { console.error('getTopScores:', error.message); return null; }
    rows = data;
  }
  rows.sort((a, b) => b.score - a.score);
  const seen = new Set();
  return rows.filter(r => { const k = r.user_id || r.nickname; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 10);
}
Hub.saveScore = saveScore; Hub.getTopScores = getTopScores;

/* ===== Navegação ===== */
const go = id => {
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + id));
  if (id === 'menu') {
    $('#menu-avatar').src = avatarSrc(Math.max(0, Hub.state.characterId));
    $('#menu-nick').textContent = Hub.state.nickname; $('#btn-mute').classList.toggle('off', audio.muted);
    $('#verse').textContent = VERSES[Math.floor(Math.random() * VERSES.length)];
  }
  if (id === 'name') $('#nick-input').value = Hub.state.nickname;
  if (id === 'character') enterSelect();
};
const route = () => go(!(Hub.state.user || (Hub.state.guest && Hub.state.nickname)) ? 'auth' : Hub.state.characterId < 0 ? 'character' : 'menu');

/* ===== Seleção de personagem (estilo jogo de luta) ===== */
const STAT_NAMES = ['Fé', 'Coragem', 'Sabedoria'], artImgs = {};
let selW = 0, selH = 0, flexT = 0, selRaf = 0, selLast = 0;
const findChar = id => AVATARS.find(x => x.id === id) || AVATARS[0];
function buildSelect() {
  AVATARS.forEach(a => {
    const b = document.createElement('button');
    b.className = 'tile'; b.dataset.id = a.id; b.setAttribute('aria-label', a.name);
    b.innerHTML = `<img alt="" src="${avatarSrc(a.id)}"><i>P1</i>`;
    b.addEventListener('click', () => { audio.unlock(); audio.sfx('click'); pick(a.id); });
    $('#roster').appendChild(b);
    if (a.art || a.img) { const im = new Image(); im.src = a.art || a.img; artImgs[a.id] = im; }   // arte personalizada
  });
  $('#stats').innerHTML = STAT_NAMES.map(n => `<div class="stat"><span>${n}</span><b><em></em></b></div>`).join('');
}
function pick(id) {
  const a = findChar(id); Hub.state.characterId = a.id; flexT = 0.7;
  $$('.tile').forEach(t => t.classList.toggle('sel', Number(t.dataset.id) === a.id));
  $('#sel-name').textContent = a.name; $('#sel-role').textContent = a.role;
  $$('#stats em').forEach((e, i) => { e.style.width = a.stats[i] + '%'; });
}
function enterSelect() {
  pick(Math.max(0, Hub.state.characterId)); selLast = performance.now();
  if (!selRaf) selRaf = requestAnimationFrame(previewLoop);
}
function previewLoop(now) {
  const scr = $('#screen-character'); if (!scr.classList.contains('active')) { selRaf = 0; return; }
  const cv = $('#select-canvas'), c = cv.getContext('2d');
  if (cv.clientWidth !== selW || cv.clientHeight !== selH) { const r = Hub.fit(cv); selW = cv.clientWidth; selH = cv.clientHeight; if (!r.w) { selRaf = requestAnimationFrame(previewLoop); return; } }
  const W = selW, H = selH, t = now / 1000, dt = Math.min(0.05, (now - selLast) / 1000), a = findChar(Hub.state.characterId); selLast = now;
  flexT = Math.max(0, flexT - dt); c.clearRect(0, 0, W, H);
  const g = c.createRadialGradient(W / 2, H * 0.55, 10, W / 2, H * 0.55, H * 0.85); g.addColorStop(0, 'rgba(255,45,149,.38)'); g.addColorStop(1, 'rgba(255,45,149,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.save(); c.translate(W / 2, H * 0.45); c.rotate(-0.12); c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `${H * 0.55}px "Kaushan Script", cursive`; c.fillStyle = 'rgba(255,255,255,.07)'; c.fillText(a.name, 0, 0); c.restore();       // nome gigante ao fundo
  c.strokeStyle = Art.PINK; c.shadowColor = Art.PINK; c.shadowBlur = 14; c.lineWidth = 2; c.beginPath();
  c.ellipse(W / 2, H * 0.93, W * 0.28 + Math.sin(t * 3) * 4, 12, 0, 0, 7); c.stroke(); c.shadowBlur = 0;                              // anel no chão
  const bob = Math.sin(t * 2) * 3, im = artImgs[a.id];
  if (im && im.complete && im.naturalWidth) { const h = H * 0.82, w = h * im.naturalWidth / im.naturalHeight; c.drawImage(im, W / 2 - w / 2, H * 0.93 + bob - h, w, h); }
  else Art.figure(c, a.key || 'davi', { x: W / 2, y: H * 0.93 + bob, h: H * 0.8, pose: flexT > 0 ? 'up' : 'stand' });
  selRaf = requestAnimationFrame(previewLoop);
}

let authMode = 'login';
function setAuthMode(m) {
  authMode = m;
  $$('#screen-auth .tab').forEach(t => t.classList.toggle('on', t.dataset.mode === m));
  $('#auth-nick').hidden = m !== 'signup'; $('#auth-submit').textContent = m === 'signup' ? 'Criar conta' : 'Entrar';
  $('#auth-pass').autocomplete = m === 'signup' ? 'new-password' : 'current-password'; setMsg('');
}
const setMsg = (t, ok) => { const e = $('#auth-msg'); e.textContent = t; e.classList.toggle('ok', !!ok); };

async function submitAuth(e) {
  e.preventDefault(); audio.unlock();
  const email = $('#auth-email').value.trim(), pass = $('#auth-pass').value;
  const nick = $('#auth-nick').value.replace(/[\u0000-\u001f<>]/g, '').trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return setMsg('Digite um e-mail válido.');
  if (pass.length < 6) return setMsg('A senha precisa ter pelo menos 6 caracteres.');
  if (authMode === 'signup' && (nick.length < 2 || nick.length > 16)) return setMsg('O nickname deve ter de 2 a 16 caracteres.');
  const btn = $('#auth-submit'); btn.disabled = true; setMsg('Aguarde…', true);
  const r = authMode === 'signup' ? await signUp(email, pass, nick) : await signIn(email, pass);
  btn.disabled = false;
  if (r.error) return setMsg(r.error);
  if (r.info) { setAuthMode('login'); return setMsg(r.info, true); }
  setMsg(''); $('#auth-pass').value = ''; audio.playBGM(); route();
}

async function openRanking(gameId) {
  go('ranking');
  $$('#rank-tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.game === gameId));
  $('#rank-title').textContent = GAMES[gameId];
  const list = $('#rank-list'); list.innerHTML = '<li class="empty">Carregando…</li>';
  const rows = await getTopScores(gameId);
  list.innerHTML = '';
  if (!rows || !rows.length) { list.innerHTML = `<li class="empty">${rows ? 'Ninguém jogou ainda. Seja o primeiro!' : 'Erro ao carregar o ranking.'}</li>`; return; }
  rows.forEach((r, i) => {
    const li = document.createElement('li');
    const mk = (cls, txt) => { const s = document.createElement('span'); s.className = cls; s.textContent = txt; li.appendChild(s); };
    mk('pos', i + 1);
    const im = new Image(); im.alt = ''; im.className = 'rk-av'; im.src = avatarSrc(r.character_id); li.appendChild(im);
    mk('nm', r.nickname); mk('sc', r.score);
    list.appendChild(li);
  });
}

/* ===== Motor dos jogos =====
   Cada game_*.js chama Hub.defineGame(id, { setup, update, draw, press, move, key }).
   O motor cuida do canvas, loop, entrada (toque/mouse/teclado), HUD e fim de jogo. */
let active = null;
Hub.ui = {
  hud(l, r) { $('#hud-left').textContent = l; $('#hud-right').textContent = r; },
  shake() { const s = $('#screen-game'); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); }
};
Hub.defineGame = (id, def) => {
  const cv = $('#game-canvas'), ctx = cv.getContext('2d');
  let s = null, raf = 0, last = 0;
  const g = {
    W: 0, H: 0, hud: Hub.ui.hud, shake: Hub.ui.shake, sfx: n => audio.sfx(n),
    end(score, detail) {   // encerra o jogo e salva a pontuação
      if (!s || s.over) return; s.over = true;
      setTimeout(() => { if (active === game) Hub.endGame(id, score, detail); }, def.endDelay || 600);
    }
  };
  const fit = () => { const r = Hub.fit(cv); g.W = r.w; g.H = r.h; };
  const frame = now => {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    def.update(s, dt, g); def.draw(s, ctx, g); raf = requestAnimationFrame(frame);
  };
  const game = {
    g,
    start() { game.stop(); active = game; fit(); s = def.setup(g); last = performance.now(); raf = requestAnimationFrame(frame); },
    stop() { cancelAnimationFrame(raf); if (active === game) active = null; s = null; },
    input(type, p) { if (s && !s.over && def[type]) def[type](s, p, g); },
    resize() { if (active === game) fit(); }
  };
  Hub.games[id] = game;
};
const point = e => { const t = e.touches ? e.touches[0] : e, r = $('#game-canvas').getBoundingClientRect(); return { x: t.clientX - r.left, y: t.clientY - r.top }; };
const cvEl = $('#game-canvas');
Hub.onPress(cvEl, e => active && active.input('press', point(e)));
cvEl.addEventListener('touchmove', e => { e.preventDefault(); active && active.input('move', point(e)); }, { passive: false });
cvEl.addEventListener('mousemove', e => active && active.input('move', point(e)));
document.addEventListener('keydown', e => {
  if (!active) return;
  if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) active.input('press', { x: active.g.W / 2, y: active.g.H / 2 }); }
  else if (e.code.startsWith('Arrow')) { e.preventDefault(); active.input('key', e.code); }
});
window.addEventListener('resize', () => active && active.resize());

function startGame(id) {
  if (!Hub.games[id]) return;
  if (Hub.current && Hub.games[Hub.current]) Hub.games[Hub.current].stop();
  Hub.current = id; go('game');
  $('#gameover').hidden = true; $('#force').hidden = id !== 'sansao';
  Hub.games[id].start();
}
function leaveGame() { if (Hub.current && Hub.games[Hub.current]) Hub.games[Hub.current].stop(); Hub.current = null; }

/** Chamado ao fim de cada jogo: mostra a pontuação e salva no banco. */
Hub.endGame = async (id, score, detail = '') => {
  audio.sfx('win');
  $('#final-score').textContent = score; $('#final-detail').textContent = detail;
  const inf = Art.INFO[id]; $('#final-verse').textContent = inf ? `“${inf.verse}” — ${inf.ref}` : '';
  $('#save-status').textContent = 'Salvando no ranking…'; $('#gameover').hidden = false;
  const r = await saveScore(id, Hub.state.nickname, Math.max(0, Hub.state.characterId), score);
  $('#save-status').textContent = r.ok ? 'Pontuação salva no ranking! 🏆'
    : r.local ? 'Salva só neste aparelho (entre com uma conta para o ranking global).' : 'Não foi possível salvar. Tente de novo.';
};

/* ===== Ações dos botões ===== */
const actions = {
  enter() { const v = $('#intro'); if (v) v.pause(); audio.playBGM(); route(); },
  authTab: b => setAuthMode(b.dataset.mode),
  guest() { Hub.state.guest = true; store.set('hub_guest', '1'); go('name'); },
  toAuth: () => go('auth'),
  saveName() {
    const v = $('#nick-input').value.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16);
    if (v.length < 2) { $('#nick-error').textContent = 'Use de 2 a 16 caracteres.'; return; }
    $('#nick-error').textContent = ''; Hub.state.nickname = v; store.set('hub_nick', v); route();
  },
  confirmChar() { Hub.state.characterId = Math.max(0, Hub.state.characterId); store.set('hub_char', Hub.state.characterId); go('menu'); },
  play: b => startGame(b.dataset.game),
  ranking: () => openRanking('corrida'),
  tab: b => openRanking(b.dataset.game),
  menu: () => go('menu'),
  changeAvatar: () => go('character'),
  mute: b => { b.classList.toggle('off', audio.toggleMute()); },
  async logout() { await signOut(); go('auth'); },
  again: () => startGame(Hub.current),
  exit: () => { leaveGame(); go('menu'); }
};
function bindButtons() {
  $$('[data-press]').forEach(b => {
    const run = () => { audio.unlock(); audio.sfx('click'); actions[b.dataset.press](b); };
    Hub.onPress(b, run);
    b.addEventListener('click', e => { if (e.detail === 0) run(); }); // teclado
  });
  $('#auth-form').addEventListener('submit', submitAuth);
}

/* ===== Arte, vídeo de abertura e miniaturas ===== */
const avatarCache = {};
const avatarSrc = id => { const a = findChar(id); return a.img || avatarCache[a.id] || (avatarCache[a.id] = Art.portrait(a.key || 'davi', 96)); };
function buildMenuArt() { $$('.card[data-game]').forEach(c => { $('.thumb', c).src = Art.thumb(c.dataset.game, 320, 240); }); }
let introEnded = true, loaded = false;
function refreshEnter() { if (!loaded) return; const b = $('#btn-enter'); b.hidden = false; b.textContent = introEnded ? 'Entrar' : 'Pular e entrar'; }
function setupIntro() { // vídeo assets/intro.mp4 (mudo, sem loop); sem o arquivo, mostra o logo
  const v = $('#intro'), scr = $('#screen-loading'); if (!v) return;
  introEnded = false;
  const fail = () => { scr.classList.remove('has-video'); introEnded = true; refreshEnter(); };
  v.addEventListener('playing', () => scr.classList.add('has-video'));
  v.addEventListener('ended', () => { introEnded = true; refreshEnter(); });
  v.addEventListener('error', fail);
  const src = v.querySelector('source'); if (src) src.addEventListener('error', fail);
  const p = v.play(); if (p && p.catch) p.catch(fail);
}

/* ===== Boot ===== */
async function boot() {
  buildSelect(); bindButtons(); buildMenuArt(); setupIntro();
  const t0 = Date.now(); let real = 0;
  const bar = $('#load-bar'), txt = $('#load-text');
  const paint = () => {
    const p = Math.min(real, (Date.now() - t0) / CONFIG.MIN_LOAD_MS);
    bar.style.width = (p * 100) + '%'; txt.textContent = `Carregando… ${Math.round(p * 100)}%`;
  };
  const iv = setInterval(paint, 60);
  const total = CONFIG.IMAGES.length + 2; let done = 0;
  const tick = () => { done++; real = done / total; };
  await Promise.all([
    ...CONFIG.IMAGES.map(src => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => { tick(); r(); }; i.src = src; })),
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(tick),
    restoreSession().catch(() => {}).then(tick),
    sleep(CONFIG.MIN_LOAD_MS),
    document.fonts && document.fonts.load ? document.fonts.load('20px "Kaushan Script"').catch(() => {}) : null
  ]);
  real = 1; paint(); clearInterval(iv);
  txt.textContent = 'Tudo pronto!'; loaded = true; refreshEnter();
}
window.addEventListener('load', boot);
})();
