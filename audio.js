/* audio.js — efeitos e trilhas sintetizadas (cada jogo tem a sua). Arquivos próprios: HubData.CONFIG.AUDIO */
(() => {
'use strict';
const A = HubData.CONFIG.AUDIO, store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
const TRACKS = {
  menu:    { bpm: 84,  root: 261.6, wave: 'triangle', chords: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], arp: 2, bass: [0, 8], kick: [], hat: [], vol: .06 },
  corrida: { bpm: 150, root: 220,   wave: 'square',   chords: [[0, 3, 7], [0, 3, 7], [-4, 0, 3], [-2, 2, 5]], arp: 1, bass: [0, 2, 4, 6, 8, 10, 12, 14], kick: [0, 4, 8, 12], hat: [2, 6, 10, 14], vol: .04, up: 12 },
  muros:   { bpm: 100, root: 146.8, wave: 'triangle', chords: [[0, 7, 12], [0, 7, 12], [5, 12, 17], [7, 14, 19]], arp: 4, bass: [0, 4, 8, 12], kick: [0, 8], hat: [4, 12], vol: .06 },
  pesca:   { bpm: 78,  root: 196,   wave: 'sine',     chords: [[0, 4, 7, 11], [5, 9, 12, 16], [2, 5, 9, 12], [7, 11, 14, 17]], arp: 2, bass: [0], kick: [], hat: [], vol: .08 },
  davi:    { bpm: 112, root: 164.8, wave: 'sawtooth', chords: [[0, 3, 7], [0, 3, 7], [-2, 2, 5], [-4, 0, 3]], arp: 4, bass: [0, 3, 6, 8, 11, 14], kick: [0, 6, 8, 14], hat: [4, 12], vol: .035 },
  sansao:  { bpm: 88,  root: 110,   wave: 'sawtooth', chords: [[0, 7, 12], [-2, 5, 10], [-4, 3, 8], [-5, 2, 7]], arp: 8, bass: [0, 6, 8, 14], kick: [0, 8], hat: [], vol: .045 }
};
class AudioManager {
  constructor() { this.ctx = null; this.muted = store.get('hub_muted') === '1'; this.timer = null; this.bgmEl = null; this.trackName = ''; }
  unlock() {
    if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 1; this.master.connect(this.ctx.destination); }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.pending) { const n = this.pending; this.pending = ''; this.playTrack(n); }
  }
  tone(f, d, { type = 'sine', vol = .2, slide = 0, delay = 0 } = {}) {
    if (!this.ctx) return; const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g).connect(this.master); o.start(t); o.stop(t + d + .02);
  }
  noise(d, vol = .15, hp = 4000) {
    if (!this.ctx) return; const n = Math.floor(this.ctx.sampleRate * d), buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol; s.buffer = buf; s.connect(f).connect(g).connect(this.master); s.start();
  }
  sfx(name) {
    if (this.muted) return; const url = A[name]; if (url) { new Audio(url).play().catch(() => {}); return; }
    const p = {
      click: () => this.tone(660, .08, { type: 'square', vol: .07 }), tap: () => this.tone(120, .1, { type: 'square', vol: .16, slide: -60 }),
      hit: () => { this.tone(180, .25, { type: 'sawtooth', vol: .22, slide: -120 }); this.tone(880, .12, { type: 'square', vol: .09, delay: .02 }); },
      miss: () => this.tone(200, .35, { type: 'sawtooth', vol: .18, slide: -150 }),
      coin: () => { this.tone(988, .07, { type: 'square', vol: .07 }); this.tone(1319, .14, { type: 'square', vol: .07, delay: .06 }); },
      whoosh: () => { this.noise(.25, .12, 1500); this.tone(500, .2, { vol: .06, slide: -300 }); }, splash: () => { this.noise(.3, .16, 2500); this.tone(300, .15, { vol: .05, slide: 200 }); },
      thud: () => { this.tone(90, .22, { vol: .32, slide: -50 }); this.noise(.08, .1, 800); }, jump: () => this.tone(330, .16, { type: 'square', vol: .09, slide: 260 }),
      win: () => [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .2, { type: 'triangle', vol: .14, delay: i * .1 }))
    }; (p[name] || (() => {}))();
  }
  playTrack(name) {
    if (this.trackName === name && (this.timer || this.bgmEl)) return;
    if (!this.ctx && !(A.music && A.music[name])) { this.pending = name; return; }
    this.stopTrack(); this.trackName = name; const url = A.music && A.music[name];
    if (url) { this.bgmEl = new Audio(url); this.bgmEl.loop = true; this.bgmEl.volume = .5; this.bgmEl.muted = this.muted; this.bgmEl.play().catch(() => {}); return; }
    const T = TRACKS[name] || TRACKS.menu, ms = 60000 / T.bpm / 4, sd = ms / 1000, f = n => T.root * Math.pow(2, n / 12); let step = 0;
    this.timer = setInterval(() => {
      if (this.muted || document.hidden) return; const k = step % 16, chord = T.chords[Math.floor(step / 16) % T.chords.length];
      if (k % T.arp === 0) { const i = (k / T.arp) | 0; this.tone(f(chord[i % chord.length] + (Math.floor(i / chord.length) % 2) * 12 + (T.up || 0)), sd * T.arp * 1.6, { type: T.wave, vol: T.vol }); }
      if (T.bass.includes(k)) this.tone(f(chord[0]) / 2, sd * 3, { type: 'triangle', vol: T.vol * 2.2 });
      if (T.kick.includes(k)) this.tone(130, .18, { vol: .28, slide: -95 }); if (T.hat.includes(k)) this.noise(.05, .05); step++;
    }, ms);
  }
  stopTrack() { clearInterval(this.timer); this.timer = null; if (this.bgmEl) { this.bgmEl.pause(); this.bgmEl = null; } this.trackName = ''; }
  toggleMute() { this.muted = !this.muted; store.set('hub_muted', this.muted ? '1' : '0'); if (this.master) this.master.gain.value = this.muted ? 0 : 1; if (this.bgmEl) this.bgmEl.muted = this.muted; return this.muted; }
}
window.HubAudio = new AudioManager();
})();
