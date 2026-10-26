/* main.js — estado global, navegação, AudioManager e Supabase */
(() => {
'use strict';

/* ===== Configuração (edite aqui) ===== */
const CONFIG = {
  SUPABASE_URL: 'https://vlgptjyukhdvhgipilwi.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_VRvE2fdP-t1VI4uzfZB-Mw_svTCuGGW',
  MIN_LOAD_MS: 1500,
  IMAGES: [],                       // URLs de imagens para pré-carregar
  // URLs opcionais de áudio. Vazio = som sintetizado via Web Audio API.
  AUDIO: { bgm: '', click: '', hit: '', miss: '', tap: '', win: '' }
};
const AVATARS = [
  { id: 0, emoji: '🧑‍🦱', name: 'Guerreiro' },
  { id: 1, emoji: '👩‍🦰', name: 'Guerreira' },
  { id: 2, emoji: '🧔', name: 'Profeta' }
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const store = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} }
};

const Hub = window.Hub = {
  CONFIG, AVATARS, $, $$, games: {}, current: null,
  state: { nickname: store.get('hub_nick') || '', characterId: Number(store.get('hub_char') ?? -1) }
};

/* Evita delay no celular: touchstart + mousedown, ignorando o clique fantasma. */
let lastTouch = 0;
Hub.onPress = (el, fn) => {
  el.addEventListener('touchstart', e => { lastTouch = Date.now(); e.preventDefault(); fn(e); }, { passive: false });
  el.addEventListener('mousedown', e => { if (Date.now() - lastTouch > 600) fn(e); });
};

/* Ajusta o canvas ao tamanho CSS com suporte a telas retina. */
Hub.fit = cv => {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = r.width * d; cv.height = r.height * d;
  cv.getContext('2d').setTransform(d, 0, 0, d, 0, 0);
  return { w: r.width, h: r.height };
};

/* ===== AudioManager ===== */
class AudioManager {
  constructor() { this.ctx = null; this.muted = store.get('hub_muted') === '1'; this.timer = null; this.step = 0; this.bgmEl = null; }
  unlock() { // precisa de um gesto do usuário (política dos navegadores)
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
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
    if (url) { const a = new Audio(url); a.play().catch(() => {}); return; }
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

/* ===== Supabase ===== */
let sb = null;
const getClient = () => {
  if (!sb && window.supabase && !CONFIG.SUPABASE_URL.includes('SEU-PROJETO'))
    sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  return sb;
};
const localScores = () => { try { return JSON.parse(store.get('hub_scores') || '[]'); } catch { return []; } };

/** INSERT na tabela scores. Sem Supabase configurado, guarda localmente (útil para testes). */
async function saveScore(gameId, nickname, characterId, score) {
  const c = getClient();
  if (!c) {
    const all = localScores(); all.push({ game_id: gameId, nickname, character_id: characterId, score });
    store.set('hub_scores', JSON.stringify(all.slice(-200)));
    return { ok: false, local: true };
  }
  const { error } = await c.from('scores').insert({ game_id: gameId, nickname, character_id: characterId, score });
  if (error) console.error('saveScore:', error.message);
  return { ok: !error };
}

/** SELECT do top 10 de um jogo. */
async function getTopScores(gameId) {
  const c = getClient();
  if (!c) return localScores().filter(s => s.game_id === gameId).sort((a, b) => b.score - a.score).slice(0, 10);
  const { data, error } = await c.from('scores').select('nickname, character_id, score')
    .eq('game_id', gameId).order('score', { ascending: false }).limit(10);
  if (error) { console.error('getTopScores:', error.message); return null; }
  return data;
}
Hub.saveScore = saveScore; Hub.getTopScores = getTopScores;

/* ===== Navegação ===== */
const go = id => {
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + id));
  if (id === 'menu') {
    const a = AVATARS[Math.max(0, Hub.state.characterId)];
    $('#menu-avatar').textContent = a.emoji; $('#menu-nick').textContent = Hub.state.nickname;
    $('#btn-mute').textContent = audio.muted ? '🔇' : '🔊';
  }
  if (id === 'name') $('#nick-input').value = Hub.state.nickname;
  if (id === 'character') markChar(Math.max(0, Hub.state.characterId), true);
};
const route = () => go(!Hub.state.nickname ? 'name' : Hub.state.characterId < 0 ? 'character' : 'menu');

function buildCarousel() {
  const box = $('#carousel');
  AVATARS.forEach(a => {
    const b = document.createElement('button');
    b.className = 'char-card'; b.dataset.id = a.id;
    b.innerHTML = `<span class="emoji">${a.emoji}</span>${a.name}`;
    b.addEventListener('click', () => { audio.unlock(); audio.sfx('click'); markChar(a.id); });
    box.appendChild(b);
  });
}
function markChar(id, scroll) {
  Hub.state.characterId = id;
  $$('.char-card').forEach(c => c.classList.toggle('sel', Number(c.dataset.id) === id));
  if (scroll) $(`.char-card[data-id="${id}"]`).scrollIntoView({ inline: 'center', block: 'nearest' });
}

async function openRanking(gameId) {
  go('ranking');
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.game === gameId));
  const list = $('#rank-list'); list.innerHTML = '<li class="empty">Carregando…</li>';
  const rows = await getTopScores(gameId);
  list.innerHTML = '';
  if (!rows || !rows.length) {
    list.innerHTML = `<li class="empty">${rows ? 'Ninguém jogou ainda. Seja o primeiro!' : 'Erro ao carregar o ranking.'}</li>`; return;
  }
  rows.forEach((r, i) => {
    const li = document.createElement('li');
    const parts = [['pos', i + 1], ['', (AVATARS[r.character_id] || AVATARS[0]).emoji], ['nm', r.nickname], ['sc', r.score]];
    parts.forEach(([cls, txt]) => { const s = document.createElement('span'); s.className = cls; s.textContent = txt; li.appendChild(s); });
    list.appendChild(li);
  });
}

/* ===== Ciclo de jogo ===== */
Hub.ui = {
  hud(left, right) { $('#hud-left').textContent = left; $('#hud-right').textContent = right; },
  shake() { const s = $('#screen-game'); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); }
};
function startGame(id) {
  if (!Hub.games[id]) return;
  if (Hub.current && Hub.games[Hub.current]) Hub.games[Hub.current].stop();
  Hub.current = id; go('game');
  $('#gameover').hidden = true; $('#force').hidden = id !== 'sansao';
  Hub.games[id].start();
}
function leaveGame() { if (Hub.current && Hub.games[Hub.current]) Hub.games[Hub.current].stop(); Hub.current = null; }

/** Chamado pelos jogos ao terminar: mostra a pontuação e salva no banco. */
Hub.endGame = async (id, score, detail = '') => {
  audio.sfx('win');
  $('#final-score').textContent = score; $('#final-detail').textContent = detail;
  $('#save-status').textContent = 'Salvando no ranking…'; $('#gameover').hidden = false;
  const r = await saveScore(id, Hub.state.nickname, Math.max(0, Hub.state.characterId), score);
  $('#save-status').textContent = r.ok ? 'Pontuação salva no ranking! 🏆'
    : r.local ? 'Salva só neste aparelho (Supabase não configurado).' : 'Não foi possível salvar. Tente de novo.';
};

/* ===== Ações dos botões ===== */
const actions = {
  enter() { audio.playBGM(); route(); },
  saveName() {
    const v = $('#nick-input').value.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16);
    if (v.length < 2) { $('#nick-error').textContent = 'Use de 2 a 16 caracteres.'; return; }
    $('#nick-error').textContent = ''; Hub.state.nickname = v; store.set('hub_nick', v); go('character');
  },
  confirmChar() { Hub.state.characterId = Math.max(0, Hub.state.characterId); store.set('hub_char', Hub.state.characterId); go('menu'); },
  play: b => startGame(b.dataset.game),
  ranking: () => openRanking('davi'),
  tab: b => openRanking(b.dataset.game),
  menu: () => go('menu'),
  changeAvatar: () => go('character'),
  mute: b => { b.textContent = audio.toggleMute() ? '🔇' : '🔊'; },
  again: () => startGame(Hub.current),
  exit: () => { leaveGame(); go('menu'); }
};
function bindButtons() {
  $$('[data-press]').forEach(b => {
    const run = () => { audio.unlock(); audio.sfx('click'); actions[b.dataset.press](b); };
    Hub.onPress(b, run);
    b.addEventListener('click', e => { if (e.detail === 0) run(); }); // teclado (Enter/Espaço)
  });
}

/* ===== Boot: loading com pré-carga ===== */
async function boot() {
  buildCarousel(); bindButtons();
  const t0 = Date.now(); let real = 0;
  const bar = $('#load-bar'), txt = $('#load-text');
  const paint = () => {
    const p = Math.min(real, (Date.now() - t0) / CONFIG.MIN_LOAD_MS);
    bar.style.width = (p * 100) + '%'; txt.textContent = `Carregando… ${Math.round(p * 100)}%`;
  };
  const iv = setInterval(paint, 60);
  const total = CONFIG.IMAGES.length + 1; let done = 0;
  const tick = () => { done++; real = done / total; };
  await Promise.all([
    ...CONFIG.IMAGES.map(src => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => { tick(); r(); }; i.src = src; })),
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(tick),
    sleep(CONFIG.MIN_LOAD_MS)
  ]);
  real = 1; paint(); clearInterval(iv);
  txt.textContent = 'Tudo pronto!'; $('#btn-enter').hidden = false; // o toque libera o áudio
}
window.addEventListener('load', boot);
})();
