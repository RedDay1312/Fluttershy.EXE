type Bus = { ctx: AudioContext; master: GainNode; music: GainNode; sfx: GainNode };

let bus: Bus | null = null;
let musicNodes: AudioNode[] = [];
let musicTimer: number | null = null;
let currentBed = -1;
let musicOn = true;
let sfxOn = true;
let visibilityBound = false;
let visibilityHandler: (() => void) | null = null;
let hushToken = 0;
let hushTimer: number | null = null;

function ctxNow() { return bus?.ctx.currentTime ?? 0; }

export function unlockAudio() {
  try {
    if (!bus) {
      const AudioContextCtor = window.AudioContext ?? (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return false;
      const ctx = new AudioContextCtor({ latencyHint: "interactive" });
      const master = ctx.createGain(); const music = ctx.createGain(); const sfx = ctx.createGain();
      music.gain.value = musicOn ? 0.22 : 0; sfx.gain.value = sfxOn ? 0.4 : 0; master.gain.value = 0.85;
      music.connect(master); sfx.connect(master); master.connect(ctx.destination); bus = { ctx, master, music, sfx };
    }
    if (bus.ctx.state === "suspended") void bus.ctx.resume().catch(() => undefined);
    if (!visibilityBound) {
      visibilityBound = true;
      visibilityHandler = () => {
        if (document.visibilityState === "visible" && bus?.ctx.state === "suspended") {
          void bus.ctx.resume().catch(() => undefined);
        }
      };
      document.addEventListener("visibilitychange", visibilityHandler);
    }
    return true;
  } catch (error) {
    console.warn("[Fluttershy.EXE] Audio unavailable:", error);
    return false;
  }
}

export function setMusicEnabled(on: boolean) { musicOn = on; if (!bus) return; bus.music.gain.setTargetAtTime(on ? 0.22 : 0, ctxNow(), 0.04); }
export function setSfxEnabled(on: boolean) { sfxOn = on; if (!bus) return; bus.sfx.gain.setTargetAtTime(on ? 0.4 : 0, ctxNow(), 0.02); }

function stopMusic() {
  hushToken++;
  if (hushTimer !== null) { window.clearTimeout(hushTimer); hushTimer = null; }
  musicNodes.forEach((n) => { try { n.disconnect(); } catch { /* already gone */ } }); musicNodes = [];
  if (musicTimer) { window.clearInterval(musicTimer); musicTimer = null; }
}

function tone(dest: GainNode, type: OscillatorType, freq: number, dur: number, gain = 0.08, at = 0) {
  if (!bus) return;
  try {
    const t0 = bus.ctx.currentTime + at; const osc = bus.ctx.createOscillator(); const g = bus.ctx.createGain(); const f = bus.ctx.createBiquadFilter();
    osc.type = type; osc.frequency.setValueAtTime(freq, t0); f.type = "lowpass"; f.frequency.value = 1400;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(f); f.connect(g); g.connect(dest); osc.start(t0); osc.stop(t0 + dur + 0.05); osc.onended = () => { try { osc.disconnect(); f.disconnect(); g.disconnect(); } catch { /* already ended */ } };
  } catch { /* audio must never break gameplay */ }
}

function noiseBurst(dest: GainNode, dur: number, gain = 0.05, at = 0) {
  if (!bus) return;
  try {
    const t0 = bus.ctx.currentTime + at; const len = Math.floor(bus.ctx.sampleRate * dur); const buffer = bus.ctx.createBuffer(1, len, bus.ctx.sampleRate); const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = bus.ctx.createBufferSource(); const g = bus.ctx.createGain(); const f = bus.ctx.createBiquadFilter(); src.buffer = buffer; f.type = "bandpass"; f.frequency.value = 900;
    g.gain.setValueAtTime(gain, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); src.connect(f); f.connect(g); g.connect(dest); src.start(t0); src.stop(t0 + dur);
  } catch { /* audio must never break gameplay */ }
}

function filteredNoise(dest: GainNode, dur: number, gain: number, frequency: number, at = 0) {
  if (!bus) return;
  try {
    const t0 = bus.ctx.currentTime + at; const len = Math.max(1, Math.floor(bus.ctx.sampleRate * dur)); const buffer = bus.ctx.createBuffer(1, len, bus.ctx.sampleRate); const data = buffer.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { last = last * 0.82 + (Math.random() * 2 - 1) * 0.18; data[i] = last; }
    const src = bus.ctx.createBufferSource(); const f = bus.ctx.createBiquadFilter(); const g = bus.ctx.createGain(); src.buffer = buffer; f.type = "bandpass"; f.frequency.value = frequency; f.Q.value = 0.8;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(gain, t0 + Math.min(0.08, dur * 0.25)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(dest); src.start(t0); src.stop(t0 + dur + 0.03);
  } catch { /* audio must never break gameplay */ }
}

function organicHorror(kind: "knock" | "rustle" | "steps" | "breath" | "snap" | "drone" | "sting" | "heartbeat" | "impact" | "scream") {
  if (!bus || !sfxOn) return;
  const dest = bus.sfx;
  switch (kind) {
    case "knock": tone(dest, "sine", 92 + Math.random() * 10, 0.09, 0.055); tone(dest, "triangle", 185, 0.05, 0.025, 0.045); break;
    case "rustle": filteredNoise(dest, 0.34 + Math.random() * 0.22, 0.045, 520 + Math.random() * 280); break;
    case "steps": tone(dest, "sine", 72, 0.09, 0.035); noiseBurst(dest, 0.06, 0.018, 0.025); tone(dest, "sine", 58, 0.085, 0.028, 0.22); noiseBurst(dest, 0.05, 0.014, 0.245); break;
    case "breath": filteredNoise(dest, 0.95, 0.038, 720); tone(dest, "sine", 155, 0.9, 0.012); break;
    case "snap": noiseBurst(dest, 0.055, 0.07); tone(dest, "triangle", 150, 0.12, 0.045); break;
    case "drone": tone(dest, "sine", 43, 1.6, 0.055); tone(dest, "sawtooth", 86, 0.9, 0.012); break;
    case "sting": tone(dest, "sawtooth", 48, 0.32, 0.085); tone(dest, "square", 132, 0.18, 0.035, 0.025); noiseBurst(dest, 0.16, 0.05); break;
    case "heartbeat":
      tone(dest, "sine", 52, 0.11, 0.09); tone(dest, "sine", 46, 0.12, 0.075, 0.14); tone(dest, "sine", 52, 0.1, 0.09, 0.62); tone(dest, "sine", 46, 0.11, 0.075, 0.76); break;
    case "impact":
      noiseBurst(dest, 0.09, 0.11); tone(dest, "sine", 48, 0.22, 0.11); tone(dest, "triangle", 96, 0.13, 0.05, 0.02); break;
    case "scream":
      filteredNoise(dest, 0.62, 0.085, 1800); tone(dest, "sawtooth", 510, 0.5, 0.035); tone(dest, "sawtooth", 680, 0.42, 0.025, 0.06); break;
  }
}

export function playHorrorSfx(kind: "knock" | "rustle" | "steps" | "breath" | "snap" | "drone" | "sting" | "heartbeat" | "impact" | "scream") { if (!bus || !sfxOn) return; organicHorror(kind); }

export function playSfx(kind: "jump" | "land" | "collect" | "hurt" | "stinger" | "whisper" | "click" | "type" | "stare" | "checkpoint" | "respawn") {
  if (!bus || !sfxOn) return; const dest = bus.sfx; const r = 0.94 + Math.random() * 0.12;
  switch (kind) {
    case "jump": tone(dest, "sine", 420 * r, 0.12, 0.07); tone(dest, "triangle", 680 * r, 0.08, 0.03); break;
    case "land": noiseBurst(dest, 0.08, 0.04); tone(dest, "sine", 90, 0.1, 0.06); break;
    case "collect": tone(dest, "sine", 660, 0.12, 0.06); tone(dest, "sine", 880, 0.16, 0.05, 0.05); break;
    case "hurt": tone(dest, "sawtooth", 140, 0.2, 0.07); noiseBurst(dest, 0.18, 0.06); break;
    case "stinger": tone(dest, "sawtooth", 55, 0.5, 0.12); tone(dest, "square", 220, 0.25, 0.05); noiseBurst(dest, 0.4, 0.1); break;
    case "whisper": noiseBurst(dest, 0.7, 0.045); tone(dest, "sine", 180, 0.8, 0.03); break;
    case "click": tone(dest, "square", 1400, 0.04, 0.03); break;
    case "type": tone(dest, "square", 900 + Math.random() * 400, 0.03, 0.02); break;
    case "stare": tone(dest, "sine", 90, 1.2, 0.08); tone(dest, "sawtooth", 40, 0.8, 0.05); noiseBurst(dest, 0.9, 0.07); break;
    case "checkpoint": tone(dest, "sine", 520, 0.14, 0.055); tone(dest, "sine", 780, 0.18, 0.045, 0.08); tone(dest, "triangle", 1040, 0.24, 0.035, 0.16); break;
    case "respawn": tone(dest, "sine", 220, 0.35, 0.04); tone(dest, "triangle", 330, 0.45, 0.035, 0.08); tone(dest, "sine", 440, 0.55, 0.025, 0.18); break;
  }
}

export function setMusicBed(level: number) {
  if (!bus) return; if (currentBed === level) return; currentBed = level; stopMusic(); const ctx = bus.ctx; const dest = bus.music; const master = ctx.createGain();
  master.gain.value = 0.0001; master.gain.setTargetAtTime(1, ctx.currentTime, 0.6); master.connect(dest); musicNodes.push(master);
  const pad = (freq: number, type: OscillatorType, gain: number) => { const osc = ctx.createOscillator(); const g = ctx.createGain(); const f = ctx.createBiquadFilter(); osc.type = type; osc.frequency.value = freq; f.type = "lowpass"; f.frequency.value = level >= 4 ? 600 : 900; g.gain.value = gain; const lfo = ctx.createOscillator(); const lg = ctx.createGain(); lfo.frequency.value = 0.07 + level * 0.02; lg.gain.value = freq * 0.01; lfo.connect(lg); lg.connect(osc.frequency); osc.connect(f); f.connect(g); g.connect(master); osc.start(); lfo.start(); musicNodes.push(osc, g, f, lfo, lg); };
  if (level <= 1) { pad(196, "sine", 0.05); pad(247, "sine", 0.035); pad(294, "triangle", 0.02); }
  else if (level === 2) { pad(174, "sine", 0.05); pad(207, "triangle", 0.03); pad(110, "sine", 0.04); }
  else if (level === 3) { pad(98, "sine", 0.06); pad(147, "sawtooth", 0.015); musicTimer = window.setInterval(() => tone(dest, "sine", 55, 0.18, 0.08), 920); }
  else if (level === 4) { pad(80, "square", 0.02); pad(120, "sawtooth", 0.012); musicTimer = window.setInterval(() => { if (Math.random() > 0.6) noiseBurst(dest, 0.12, 0.04); }, 700); }
  else if (level === 5) { pad(65, "sine", 0.04); musicTimer = window.setInterval(() => tone(dest, "sine", 52, 0.12, 0.05), 780); }
  else { pad(49, "sawtooth", 0.03); pad(73, "square", 0.012); pad(155, "triangle", 0.02); }
}

export function hushMusic(seconds = 0.4) {
  if (!bus || !musicOn) return;
  const token = ++hushToken;
  if (hushTimer !== null) window.clearTimeout(hushTimer);
  bus.music.gain.setTargetAtTime(0.02, ctxNow(), Math.max(0.02, seconds / 4));
  hushTimer = window.setTimeout(() => {
    hushTimer = null;
    if (token !== hushToken || !bus || !musicOn) return;
    bus.music.gain.setTargetAtTime(0.22, ctxNow(), 0.4);
  }, Math.max(0, seconds * 1000));
}
