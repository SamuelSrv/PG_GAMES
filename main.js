/* main.js — estado, navegação, conta (Supabase Auth), AudioManager, ranking e motor dos jogos */
(() => {
  'use strict';

  /* ===== Configuração (edite aqui) ===== */
  const CONFIG = {
    SUPABASE_URL: 'https://vlgptjyukhdvhgipilwi.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_VRvE2fdP-t1VI4uzfZB-Mw_svTCuGGW',
    MIN_LOAD_MS: 1500,
    IMAGES: [],                       // URLs de imagens para pré-carregar
    AUDIO: { music: {}, click: '', hit: '', miss: '', tap: '', win: '' } // URLs opcionais (ex.: music: { menu: 'assets/music/menu.mp3', davi: '...' }); vazio = som sintetizado
  };
  /* Elenco da seleção (a ordem aqui é a ordem na tela). Para adicionar alguém, inclua uma linha com um id novo e único:
     { id: 18, name: 'Nome', role: 'Frase curta', bio: 'Biografia resumida.', stats: [80, 80, 80],
       look: { skin: '#d9a077', hair: '#3a2616', head: 'hair', tunic: '#2f6fb0' },      // visual desenhado em código
       img: 'assets/characters/nome.png', art: 'assets/characters/nome-corpo.png' }       // opcional: retrato quadrado + corpo inteiro (PNG) */
  const AVATARS = [
    {
      id: 12, name: 'Douglas', role: 'Líder de jovens', bio: 'Líder do PG Jovem. Aqui entra uma frase sobre ele (edite no main.js).', stats: [90, 90, 90],
      look: { skin: '#d9a077', hair: '#3a2616', head: 'hair', tunic: '#2f6fb0', sash: '#ff2d95' }
    },
    {
      id: 13, name: 'Thais', role: 'Líder de jovens', bio: 'Líder do PG Jovem. Aqui entra uma frase sobre ela (edite no main.js).', stats: [90, 90, 90],
      look: { build: 'f', skin: '#d9a077', hair: '#4a2a18', head: 'long', tunic: '#c2417a', sash: '#ffc94d', lips: '#d4506a' }
    },
    { id: 0, key: 'davi', name: 'Davi', role: 'O pastor que virou rei', bio: 'Pastor de ovelhas que enfrentou Golias com uma funda e fé. Foi rei e escreveu muitos salmos.', stats: [90, 95, 70] },
    { id: 1, key: 'ester', name: 'Ester', role: 'Coragem de rainha', bio: 'Jovem judia que virou rainha da Pérsia e arriscou a própria vida para salvar o seu povo.', stats: [85, 100, 80] },
    { id: 2, key: 'daniel', name: 'Daniel', role: 'Fiel na cova dos leões', bio: 'Levado cativo para a Babilônia, manteve-se fiel a Deus até na cova dos leões.', stats: [100, 80, 95] },
    { id: 3, key: 'moises', name: 'Moisés', role: 'Libertador do povo', bio: 'Tirou o povo de Israel do Egito e recebeu os Dez Mandamentos no monte Sinai.', stats: [95, 85, 90] },
    { id: 4, key: 'debora', name: 'Débora', role: 'Juíza e profetisa', bio: 'Juíza de Israel que liderou o povo com sabedoria e coragem, ao lado de Baraque.', stats: [90, 90, 100] },
    { id: 5, key: 'jose', name: 'José', role: 'Do poço ao palácio', bio: 'Vendido pelos irmãos, chegou a governador do Egito e escolheu perdoar a todos.', stats: [95, 70, 100] },
    { id: 6, key: 'rute', name: 'Rute', role: 'Lealdade que não solta', bio: 'Estrangeira que ficou ao lado da sogra Noemi e entrou na família do rei Davi.', stats: [100, 75, 85] },
    { id: 7, key: 'josue', name: 'Josué', role: 'Sê forte e corajoso', bio: 'Sucessor de Moisés. Conduziu Israel à terra prometida e viu as muralhas de Jericó caírem.', stats: [90, 100, 75] },
    { id: 8, key: 'gideao', name: 'Gideão', role: '300 homens e uma trombeta', bio: 'Com apenas 300 homens, trombetas e tochas, venceu o enorme exército de Midiã.', stats: [80, 90, 85] },
    { id: 9, key: 'paulo', name: 'Paulo', role: 'Corri a carreira', bio: 'Perseguia a Igreja, até encontrar Jesus. Depois levou o evangelho ao mundo e escreveu várias cartas.', stats: [100, 95, 90] },
    { id: 10, key: 'miria', name: 'Miriã', role: 'Louvor depois do mar', bio: 'Irmã de Moisés. Louvou a Deus com pandeiro depois de atravessar o mar Vermelho.', stats: [90, 80, 85] },
    { id: 11, key: 'salomao', name: 'Salomão', role: 'O rei mais sábio', bio: 'Filho de Davi. Pediu sabedoria a Deus, tornou-se o rei mais sábio e construiu o templo.', stats: [85, 70, 100] },
    { id: 14, key: 'elias', name: 'Elias', role: 'Fogo no Carmelo', bio: 'Profeta que desafiou os profetas de Baal no monte Carmelo e correu diante da carruagem do rei.', stats: [90, 100, 80] },
    { id: 15, key: 'neemias', name: 'Neemias', role: 'Construtor de muros', bio: 'Copeiro do rei que voltou a Jerusalém e reconstruiu a muralha em 52 dias.', stats: [90, 85, 95] },
    { id: 16, key: 'pedro', name: 'Pedro', role: 'Pescador de homens', bio: 'Pescador chamado por Jesus para pescar pessoas. Tornou-se líder da Igreja nascente.', stats: [80, 95, 75] },
    { id: 17, key: 'sansao', name: 'Sansão', role: 'Força de gigante', bio: 'Juiz de Israel com força extraordinária. No fim, derrubou o templo de Dagom.', stats: [70, 100, 60] }
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
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { } },
    del: k => { try { localStorage.removeItem(k); } catch { } }
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

  /* ===== Trilhas (sintetizadas): cada jogo tem a sua, no clima do tema ===== */
  const TRACKS = {
    menu: { bpm: 84, root: 261.6, wave: 'triangle', chords: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], arp: 2, bass: [0, 8], kick: [], hat: [], vol: .07 },                       // esperança / louvor
    corrida: { bpm: 150, root: 220, wave: 'square', chords: [[0, 3, 7], [0, 3, 7], [-4, 0, 3], [-2, 2, 5]], arp: 1, bass: [0, 2, 4, 6, 8, 10, 12, 14], kick: [0, 4, 8, 12], hat: [2, 6, 10, 14], vol: .045, up: 12 }, // corrida
    muros: { bpm: 100, root: 146.8, wave: 'triangle', chords: [[0, 7, 12], [0, 7, 12], [5, 12, 17], [7, 14, 19]], arp: 4, bass: [0, 4, 8, 12], kick: [0, 8], hat: [4, 12], vol: .07 },       // marcha de construção
    pesca: { bpm: 78, root: 196, wave: 'sine', chords: [[0, 4, 7, 11], [5, 9, 12, 16], [2, 5, 9, 12], [7, 11, 14, 17]], arp: 2, bass: [0], kick: [], hat: [], vol: .09 },       // ondas calmas
    davi: { bpm: 112, root: 164.8, wave: 'sawtooth', chords: [[0, 3, 7], [0, 3, 7], [-2, 2, 5], [-4, 0, 3]], arp: 4, bass: [0, 3, 6, 8, 11, 14], kick: [0, 6, 8, 14], hat: [4, 12], vol: .04 }, // batalha
    sansao: { bpm: 88, root: 110, wave: 'sawtooth', chords: [[0, 7, 12], [-2, 5, 10], [-4, 3, 8], [-5, 2, 7]], arp: 8, bass: [0, 6, 8, 14], kick: [0, 8], hat: [], vol: .05 }          // épico e pesado
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
      if (url) { new Audio(url).play().catch(() => { }); return; }
      const p = {
        click: () => this.tone(660, .08, { type: 'square', vol: .08 }),
        hit: () => { this.tone(180, .25, { type: 'sawtooth', vol: .25, slide: -120 }); this.tone(880, .12, { type: 'square', vol: .1, delay: .02 }); },
        miss: () => this.tone(200, .35, { type: 'sawtooth', vol: .2, slide: -150 }),
        tap: () => this.tone(120, .1, { type: 'square', vol: .18, slide: -60 }),
        coin: () => { this.tone(988, .07, { type: 'square', vol: .08 }); this.tone(1319, .14, { type: 'square', vol: .08, delay: .06 }); },
        whoosh: () => { this.noise(.25, .12, 1500); this.tone(500, .2, { vol: .06, slide: -300 }); },
        splash: () => { this.noise(.3, .16, 2500); this.tone(300, .15, { vol: .05, slide: 200 }); },
        thud: () => { this.tone(90, .22, { vol: .35, slide: -50 }); this.noise(.08, .1, 800); },
        win: () => [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .2, { type: 'triangle', vol: .15, delay: i * .1 }))
      };
      (p[name] || (() => { }))();
    }
    noise(d, vol = .15, hp = 4000) {
      if (!this.ctx) return;
      const n = Math.floor(this.ctx.sampleRate * d), buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), ch = buf.getChannelData(0);
      for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
      f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol; s.buffer = buf; s.connect(f).connect(g).connect(this.master); s.start();
    }
    playBGM() { this.playTrack('menu'); }
    playTrack(name) {   // troca a música (cada jogo tem a sua). Para usar arquivos: CONFIG.AUDIO.music[nome] = 'assets/music/x.mp3'
      if (this.trackName === name && (this.timer || this.bgmEl)) return;
      this.stopTrack(); this.trackName = name;
      const url = CONFIG.AUDIO.music && CONFIG.AUDIO.music[name];
      if (url) { this.bgmEl = new Audio(url); this.bgmEl.loop = true; this.bgmEl.volume = .5; this.bgmEl.muted = this.muted; this.bgmEl.play().catch(() => { }); return; }
      if (!this.ctx) return;
      const T = TRACKS[name] || TRACKS.menu, ms = 60000 / T.bpm / 4, sd = ms / 1000; let step = 0;
      this.timer = setInterval(() => {
        if (this.muted) return;
        const k = step % 16, chord = T.chords[Math.floor(step / 16) % T.chords.length], f = n => T.root * Math.pow(2, n / 12);
        if (k % T.arp === 0) { const i = (k / T.arp) | 0, n = chord[i % chord.length] + (Math.floor(i / chord.length) % 2) * 12 + (T.up || 0); this.tone(f(n), sd * T.arp * 1.6, { type: T.wave, vol: T.vol }); }
        if (T.bass.includes(k)) this.tone(f(chord[0]) / 2, sd * 3, { type: 'triangle', vol: T.vol * 2.2 });
        if (T.kick.includes(k)) this.tone(130, .18, { vol: .3, slide: -95 });
        if (T.hat.includes(k)) this.noise(.05, .06);
        step++;
      }, ms);
    }
    stopTrack() { clearInterval(this.timer); this.timer = null; if (this.bgmEl) { this.bgmEl.pause(); this.bgmEl = null; } this.trackName = ''; }
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
    Hub.state.nickname = nickOf(u) || (u.email || '').split('@')[0]; store.set('hub_nick', Hub.state.nickname); Wallet.load();
  };
  const authErr = e => {
    const m = (e && e.message) || String(e || ''), code = (e && e.code) || '';
    if (code === 'user_already_exists' || /already registered/i.test(m)) return 'Este e-mail já está cadastrado. Entre com a sua senha.';
    if (/invalid login/i.test(m)) return 'E-mail ou senha incorretos.';
    if (/not confirmed/i.test(m)) return 'Este e-mail ainda não foi confirmado. Desative "Confirm email" no Supabase (veja o passo a passo).';
    if (/rate limit|too many/i.test(m) || (e && e.status === 429)) return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
    if (/password/i.test(m)) return 'A senha precisa ter pelo menos 6 caracteres.';
    if (/valid email|invalid.*email/i.test(m)) return 'Digite um e-mail válido.';
    return m;
  };
  const isExists = e => !!e && (e.code === 'user_already_exists' || /already registered/i.test(e.message || ''));
  const EMAIL_RE = /^[^\s@.][^\s@]*@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;
  const EMAIL_FIX = {
    'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.co': 'gmail.com',
    'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'outlok.com': 'outlook.com', 'outlook.con': 'outlook.com', 'yaho.com': 'yahoo.com', 'yahoo.con': 'yahoo.com'
  };
  function checkEmail(e) {   // formato válido e erros comuns de digitação
    if (e.length > 254 || e.includes('..') || !EMAIL_RE.test(e)) return 'Digite um e-mail válido.';
    const [u, dom] = e.toLowerCase().split('@'); return EMAIL_FIX[dom] ? `Será que é ${u}@${EMAIL_FIX[dom]}?` : '';
  }

  async function signUp(email, password, nickname) {
    const c = getClient(); if (!c) return { error: 'Supabase não configurado em main.js.' };
    const { data, error } = await c.auth.signUp({ email, password, options: { data: { nickname } } });
    if (error) return { error: authErr(error), exists: isExists(error) };
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) return { error: 'Este e-mail já está cadastrado. Entre com a sua senha.', exists: true };
    if (data.session) { applyUser(data.user); return {}; }
    return signIn(email, password);                       // sem confirmar nada: criou, já entra
  }
  async function signIn(email, password) {
    const c = getClient(); if (!c) return { error: 'Supabase não configurado em main.js.' };
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error) return { error: authErr(error) };
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

  /* ===== Carteira (PG Coins) e Loja ===== */
  const SHOP = {
    attr: [
      { id: 'fe', name: 'Fé', desc: '+1 vida (ou escudo) por nível em todos os jogos; Sansão ganha +1 s', max: 2, cost: [80, 200] },
      { id: 'coragem', name: 'Coragem', desc: 'Os jogos começam 7% mais lentos por nível; Sansão ganha força no toque', max: 3, cost: [60, 150, 300] },
      { id: 'sabedoria', name: 'Sabedoria', desc: '+20% de PG Coins por nível ao fim de cada partida', max: 3, cost: [60, 150, 300] }
    ],
    outfit: [
      { id: 'neon', name: 'Túnica Neon', cost: 120, look: { tunic: '#ff2d95', trim: '#ffc94d', sash: '#ffffff' } },
      { id: 'real', name: 'Manto Real', cost: 250, look: { tunic: '#4b1e8a', cloak: '#7a1fa2', sash: '#ffc94d', trim: '#ffc94d' } },
      { id: 'jose', name: 'Túnica de José', cost: 180, look: { stripes: true, tunic: '#e0553a' } },
      { id: 'mar', name: 'Pescador', cost: 100, look: { tunic: '#2a7f9a', sash: '#d9c18a', trim: '#1a4a5e' } },
      { id: 'linho', name: 'Linho Branco', cost: 140, look: { tunic: '#f0ead8', trim: '#d4b46a', sash: '#c9a25a' } },
      { id: 'brasa', name: 'Fogo do Carmelo', cost: 200, look: { tunic: '#d4451f', cloak: '#8a1f10', sash: '#ffc94d', trim: '#ffb04d' } }
    ],
    acc: [
      { id: 'coroa', name: 'Coroa de Ouro', cost: 300, look: { crown: true } },
      { id: 'oculos', name: 'Óculos Escuros', cost: 90, look: { shades: true } },
      { id: 'faixa', name: 'Faixa PG', cost: 70, look: { headband: '#ff2d95' } }
    ],
    boost: [
      { id: 'asas', name: 'Asas de Fé', game: 'Corrida da Fé', desc: 'Pulo mais suave', cost: 200 },
      { id: 'prumo', name: 'Prumo de Neemias', game: 'Muros de Neemias', desc: 'Linha-guia e encaixe perfeito mais fácil', cost: 200 },
      { id: 'rede', name: 'Rede Reforçada', game: 'Pescadores de Homens', desc: 'Barco 20% mais largo para pegar peixes', cost: 200 },
      { id: 'pedra', name: 'Pedra Lisa', game: 'Funda de Davi', desc: 'A zona dourada nunca fica pequena demais', cost: 200 },
      { id: 'cinto', name: 'Cinto de Força', game: 'Força de Sansão', desc: 'A barra de força esvazia 40% mais devagar', cost: 200 }
    ]
  };
  const walletKey = () => 'hub_wallet_' + (Hub.state.user ? Hub.state.user.id : 'guest');
  const blankWallet = () => ({ coins: 0, lv: { fe: 0, coragem: 0, sabedoria: 0 }, own: {}, outfit: '', acc: {}, rev: 0 });
  const Wallet = Hub.wallet = {   // PG Coins, melhorias e roupas: salvo no aparelho e, com conta, também no perfil do Supabase
    d: blankWallet(), t: 0,
    load() {
      let loc = null; try { loc = JSON.parse(store.get(walletKey()) || 'null'); } catch { }
      const rem = Hub.state.user && Hub.state.user.user_metadata && Hub.state.user.user_metadata.wallet;
      const best = [loc, rem].filter(Boolean).sort((a, b) => (b.rev || 0) - (a.rev || 0))[0] || {};
      this.d = { ...blankWallet(), ...best }; this.d.lv = { ...blankWallet().lv, ...(best.lv || {}) };
    },
    save() { this.d.rev = Date.now(); store.set(walletKey(), JSON.stringify(this.d)); this.sync(); refreshCoins(); },
    sync() { const c = getClient(); if (!c || !Hub.state.user) return; clearTimeout(this.t); this.t = setTimeout(() => { c.auth.updateUser({ data: { nickname: Hub.state.nickname, wallet: this.d } }).catch(() => { }); }, 1500); },
    add(n) { this.d.coins += Math.max(0, Math.round(n)); this.save(); },
    lvl(id) { return this.d.lv[id] || 0; },
    has(id) { return !!this.d.own[id]; },
    look() { const o = {}, it = SHOP.outfit.find(x => x.id === this.d.outfit); if (it) Object.assign(o, it.look); SHOP.acc.forEach(a => { if (this.d.acc[a.id]) Object.assign(o, a.look); }); return o; }
  };
  Hub.lvl = id => Wallet.lvl(id); Hub.has = id => Wallet.has(id);
  const refreshCoins = () => { $$('#menu-coins, #shop-coins').forEach(e => { e.textContent = Wallet.d.coins; }); };
  let shopTab = 'attr'; const shopImgs = {};
  function renderShop() {
    const d = Wallet.d, a = findChar(Hub.state.characterId), who = whoAmI(), list = $('#shop-list'); list.innerHTML = '';
    $$('#shop-tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === shopTab));
    $('#shop-me').src = who.img ? who.img.src : Art.portrait(who.key, 96, who.look); refreshCoins();
    const row = (img, title, sub, label, state, fn) => {
      const li = document.createElement('li'); li.className = 'item';
      li.innerHTML = `${img ? `<img alt="" src="${img}">` : '<span class="ph"></span>'}<div><b></b><small></small></div><button class="btn mini"></button>`;
      li.querySelector('b').textContent = title; li.querySelector('small').textContent = sub;
      const b = li.querySelector('button'); b.textContent = label; b.disabled = state === 'off'; b.classList.toggle('poor', state === 'poor');
      b.addEventListener('click', () => { audio.unlock(); fn(); }); list.appendChild(li);
    };
    const pic = it => { const k = it.id + '|' + a.id; return shopImgs[k] || (shopImgs[k] = Art.portrait(a.key, 80, { ...a.look, ...it.look })); };
    const price = c => d.coins < c ? 'poor' : '';
    if (shopTab === 'attr') SHOP.attr.forEach(it => { const lv = d.lv[it.id], mx = lv >= it.max; row(null, `${it.name}  ${'●'.repeat(lv)}${'○'.repeat(it.max - lv)}`, it.desc, mx ? 'Nível máx.' : `Melhorar · ${it.cost[lv]}`, mx ? 'off' : price(it.cost[lv]), () => buy('attr', it)); });
    if (shopTab === 'outfit') {
      row(Art.portrait(a.key, 80, a.look), 'Roupa original', 'O visual do personagem', d.outfit === '' ? 'Em uso' : 'Usar', d.outfit === '' ? 'off' : '', () => { d.outfit = ''; Wallet.save(); renderShop(); });
      SHOP.outfit.forEach(it => { const own = d.own[it.id]; row(pic(it), it.name, 'Roupa', own ? (d.outfit === it.id ? 'Em uso' : 'Usar') : `Comprar · ${it.cost}`, own ? (d.outfit === it.id ? 'off' : '') : price(it.cost), () => own ? (d.outfit = it.id, Wallet.save(), renderShop()) : buy('outfit', it)); });
      SHOP.acc.forEach(it => { const own = d.own[it.id]; row(pic(it), it.name, 'Acessório', own ? (d.acc[it.id] ? 'Tirar' : 'Usar') : `Comprar · ${it.cost}`, own ? '' : price(it.cost), () => own ? (d.acc[it.id] = !d.acc[it.id], Wallet.save(), renderShop()) : buy('acc', it)); });
    }
    if (shopTab === 'boost') SHOP.boost.forEach(it => { const own = d.own[it.id]; row(null, `${it.name} · ${it.game}`, it.desc, own ? 'Comprado' : `Comprar · ${it.cost}`, own ? 'off' : price(it.cost), () => buy('boost', it)); });
  }
  function buy(kind, it) {
    const d = Wallet.d, cost = kind === 'attr' ? it.cost[d.lv[it.id]] : it.cost;
    if (d.coins < cost) { audio.sfx('miss'); $('#shop-msg').textContent = `Faltam ${cost - d.coins} PG Coins. Jogue mais para ganhar!`; return; }
    d.coins -= cost; $('#shop-msg').textContent = '';
    if (kind === 'attr') d.lv[it.id]++; else d.own[it.id] = 1;
    if (kind === 'outfit') d.outfit = it.id; if (kind === 'acc') d.acc[it.id] = 1;
    audio.sfx('coin'); Wallet.save(); renderShop();
  }

  /* ===== Navegação ===== */
  const go = id => {
    $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + id));
    if (id === 'menu') {
      $('#menu-avatar').src = avatarSrc(Math.max(0, Hub.state.characterId));
      $('#menu-nick').textContent = Hub.state.nickname; $('#btn-mute').classList.toggle('off', audio.muted);
      $('#verse').textContent = VERSES[Math.floor(Math.random() * VERSES.length)]; buildMenuArt(); refreshCoins();
    }
    if (id === 'name') $('#nick-input').value = Hub.state.nickname;
    if (id === 'shop') { $('#shop-msg').textContent = ''; renderShop(); }
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
    $('#sel-name').textContent = a.name; $('#sel-role').textContent = a.role; $('#sel-bio').textContent = a.bio || '';
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
    else Art.figure(c, a.key, { ...a.look, ...Wallet.look(), x: W / 2, y: H * 0.93 + bob, h: H * 0.8, pose: flexT > 0 ? 'up' : 'stand' });
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
    const em = checkEmail(email); if (em) return setMsg(em);
    if (pass.length < 6) return setMsg('A senha precisa ter pelo menos 6 caracteres.');
    if (authMode === 'signup' && (nick.length < 2 || nick.length > 16)) return setMsg('O nickname deve ter de 2 a 16 caracteres.');
    const btn = $('#auth-submit'); btn.disabled = true; setMsg('Aguarde…', true);
    const r = authMode === 'signup' ? await signUp(email, pass, nick) : await signIn(email, pass);
    btn.disabled = false;
    if (r.error) { if (r.exists) setAuthMode('login'); return setMsg(r.error); }
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
    coins(n) { $('#hud-coins b').textContent = n; },
    shake() { const s = $('#screen-game'); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); }
  };
  Hub.defineGame = (id, def) => {
    const cv = $('#game-canvas'), ctx = cv.getContext('2d');
    let s = null, raf = 0, last = 0, fl = [];
    const g = {
      W: 0, H: 0, hud: Hub.ui.hud, shake: Hub.ui.shake, sfx: n => audio.sfx(n),
      coin(n, x, y) { Hub.run.coins += n; Hub.ui.coins(Hub.run.coins); fl.push({ x, y, t: 0, text: '+' + n }); audio.sfx('coin'); },   // PG Coins ganhas durante a fase
      end(score, detail) {   // encerra o jogo e salva a pontuação
        if (!s || s.over) return; s.over = true;
        setTimeout(() => { if (active === game) Hub.endGame(id, score, detail); }, def.endDelay || 600);
      }
    };
    const fit = () => { const r = Hub.fit(cv); g.W = r.w; g.H = r.h; };
    const frame = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      def.update(s, dt, g); def.draw(s, ctx, g);
      fl.forEach(f => { f.t += dt; }); fl = fl.filter(f => f.t < 1);
      ctx.save(); ctx.textAlign = 'center'; ctx.font = '800 18px Sora, sans-serif'; ctx.shadowColor = '#ffc94d'; ctx.shadowBlur = 10; ctx.fillStyle = '#ffc94d';
      fl.forEach(f => { ctx.globalAlpha = 1 - f.t; ctx.fillText(f.text + ' PG', f.x, f.y - f.t * 40); }); ctx.restore();
      raf = requestAnimationFrame(frame);
    };
    const game = {
      g,
      start() { game.stop(); active = game; fit(); fl = []; s = def.setup(g); last = performance.now(); raf = requestAnimationFrame(frame); },
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
    Hub.current = id; go('game'); audio.playTrack(id); Hub.run = { coins: 0, done: false }; Hub.ui.coins(0);
    $('#gameover').hidden = true; $('#force').hidden = id !== 'sansao';
    Hub.games[id].start();
  }
  function leaveGame() {
    if (Hub.run && !Hub.run.done && Hub.run.coins > 0) { Hub.run.done = true; Wallet.add(Hub.run.coins * (1 + 0.2 * Wallet.lvl('sabedoria'))); }   // saiu no meio: leva as moedas já coletadas
    if (Hub.current && Hub.games[Hub.current]) Hub.games[Hub.current].stop(); Hub.current = null;
  }

  /** Chamado ao fim de cada jogo: mostra a pontuação e salva no banco. */
  Hub.endGame = async (id, score, detail = '') => {
    audio.sfx('win');
    $('#final-score').textContent = score; $('#final-detail').textContent = detail;
    const inf = Art.INFO[id]; $('#final-verse').textContent = inf ? `“${inf.verse}” — ${inf.ref}` : '';
    const mult = 1 + 0.2 * Wallet.lvl('sabedoria'), gain = Math.round(((Hub.run ? Hub.run.coins : 0) + Math.floor(score / 25)) * mult);
    if (Hub.run && !Hub.run.done) { Hub.run.done = true; Wallet.add(gain); }
    $('#final-coins').textContent = `+${gain} PG Coins` + (mult > 1 ? ` (Sabedoria +${Math.round((mult - 1) * 100)}%)` : '');
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
    shop: () => { shopTab = 'attr'; go('shop'); },
    shopTab: b => { shopTab = b.dataset.tab; renderShop(); },
    tab: b => openRanking(b.dataset.game),
    menu: () => go('menu'),
    changeAvatar: () => go('character'),
    mute: b => { b.classList.toggle('off', audio.toggleMute()); },
    async logout() { await signOut(); Wallet.load(); go('auth'); },
    again: () => startGame(Hub.current),
    exit: () => { leaveGame(); audio.playTrack('menu'); go('menu'); }
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
  const avatarSrc = id => { const a = findChar(id); return a.img || avatarCache[a.id] || (avatarCache[a.id] = Art.portrait(a.key, 96, a.look)); };
  const whoAmI = () => { const a = findChar(Hub.state.characterId), im = artImgs[a.id]; return { key: a.key, look: { ...a.look, ...Wallet.look() }, img: im && im.complete && im.naturalWidth ? im : null }; };
  Hub.player = (c, o) => { const w = whoAmI(); if (w.img) Art.sprite(c, w.img, o); else Art.figure(c, w.key, { ...w.look, ...o }); };   // personagem escolhido, usado nos jogos
  function buildMenuArt() { const w = whoAmI(); $$('.card[data-game]').forEach(c => { $('.thumb', c).src = Art.thumb(c.dataset.game, 320, 240, w); }); }
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
      restoreSession().catch(() => { }).then(tick),
      sleep(CONFIG.MIN_LOAD_MS),
      document.fonts && document.fonts.load ? document.fonts.load('20px "Kaushan Script"').catch(() => { }) : null
    ]);
    real = 1; paint(); clearInterval(iv); if (!Hub.state.user) Wallet.load(); refreshCoins();
    txt.textContent = 'Tudo pronto!'; loaded = true; refreshEnter();
  }
  window.addEventListener('load', boot);
})();
