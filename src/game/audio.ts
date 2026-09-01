type Bus = { ctx: AudioContext; master: GainNode; music: GainNode; sfx: GainNode };

let bus: Bus | null = null;
let musicNodes: AudioNode[] = [];
let musicTimer: number | null = null;
let currentBed = -1;
let musicOn = true;
let sfxOn = true;

function ctxNow() {
  return bus?.ctx.currentTime ?? 0;
}

export function unlockAudio() {
  if (!bus) {
    const ctx = new AudioContext({ latencyHint: "interactive" });
    const master = ctx.createGain();
    const music = ctx.createGain();
    const sfx = ctx.createGain();
    music.gain.value = musicOn ? 0.22 : 0;
    sfx.gain.value = sfxOn ? 0.4 : 0;
    master.gain.value = 0.85;
    music.connect(master);
    sfx.connect(master);
    master.connect(ctx.destination);
    bus = { ctx, master, music, sfx };
  }
  if (bus.ctx.state === "suspended") void bus.ctx.resume();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && bus?.ctx.state === "suspended") {
      void bus.ctx.resume();
    }
  });
}

export function setMusicEnabled(on: boolean) {
  musicOn = on;
  if (!bus) return;
  bus.music.gain.setTargetAtTime(on ? 0.22 : 0, ctxNow(), 0.04);
}

export function setSfxEnabled(on: boolean) {
  sfxOn = on;
  if (!bus) return;
  bus.sfx.gain.setTargetAtTime(on ? 0.4 : 0, ctxNow(), 0.02);
}

function stopMusic() {
  musicNodes.forEach((n) => {
    try {
      n.disconnect();
    } catch {
      /* already gone */
    }
  });
  musicNodes = [];
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}

function tone(
  dest: GainNode,
  type: OscillatorType,
  freq: number,
  dur: number,
  gain = 0.08,
  at = 0,
) {
  if (!bus) return;
  const t0 = bus.ctx.currentTime + at;
  const osc = bus.ctx.createOscillator();
  const g = bus.ctx.createGain();
  const f = bus.ctx.createBiquadFilter();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  f.type = "lowpass";
  f.frequency.value = 1400;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(f);
  f.connect(g);
  g.connect(dest);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
  osc.onended = () => {
    osc.disconnect();
    f.disconnect();
    g.disconnect();
  };
}

function noiseBurst(dest: GainNode, dur: number, gain = 0.05, at = 0) {
  if (!bus) return;
  const t0 = bus.ctx.currentTime + at;
  const len = Math.floor(bus.ctx.sampleRate * dur);
  const buffer = bus.ctx.createBuffer(1, len, bus.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = bus.ctx.createBufferSource();
  const g = bus.ctx.createGain();
  const f = bus.ctx.createBiquadFilter();
  src.buffer = buffer;
  f.type = "bandpass";
  f.frequency.value = 900;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f);
  f.connect(g);
  g.connect(dest);
  src.start(t0);
  src.stop(t0 + dur);
}

export function playSfx(
  kind: "jump" | "land" | "collect" | "hurt" | "stinger" | "whisper" | "click" | "type" | "stare",
) {
  if (!bus || !sfxOn) return;
  const dest = bus.sfx;
  const r = 0.94 + Math.random() * 0.12;
  switch (kind) {
    case "jump":
      tone(dest, "sine", 420 * r, 0.12, 0.07);
      tone(dest, "triangle", 680 * r, 0.08, 0.03);
      break;
    case "land":
      noiseBurst(dest, 0.08, 0.04);
      tone(dest, "sine", 90, 0.1, 0.06);
      break;
    case "collect":
      tone(dest, "sine", 660, 0.12, 0.06);
      tone(dest, "sine", 880, 0.16, 0.05, 0.05);
      break;
    case "hurt":
      tone(dest, "sawtooth", 140, 0.2, 0.07);
      noiseBurst(dest, 0.18, 0.06);
      break;
    case "stinger":
      tone(dest, "sawtooth", 55, 0.5, 0.12);
      tone(dest, "square", 220, 0.25, 0.05);
      noiseBurst(dest, 0.4, 0.1);
      break;
    case "whisper":
      noiseBurst(dest, 0.7, 0.045);
      tone(dest, "sine", 180, 0.8, 0.03);
      break;
    case "click":
      tone(dest, "square", 1400, 0.04, 0.03);
      break;
    case "type":
      tone(dest, "square", 900 + Math.random() * 400, 0.03, 0.02);
      break;
    case "stare":
      tone(dest, "sine", 90, 1.2, 0.08);
      tone(dest, "sawtooth", 40, 0.8, 0.05);
      noiseBurst(dest, 0.9, 0.07);
      break;
  }
}

export function setMusicBed(level: number) {
  if (!bus) return;
  if (currentBed === level) return;
  currentBed = level;
  stopMusic();
  const ctx = bus.ctx;
  const dest = bus.music;

  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.gain.setTargetAtTime(1, ctx.currentTime, 0.6);
  master.connect(dest);
  musicNodes.push(master);

  const pad = (freq: number, type: OscillatorType, gain: number) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    osc.type = type;
    osc.frequency.value = freq;
    f.type = "lowpass";
    f.frequency.value = level >= 4 ? 600 : 900;
    g.gain.value = gain;
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = 0.07 + level * 0.02;
    lg.gain.value = freq * 0.01;
    lfo.connect(lg);
    lg.connect(osc.frequency);
    osc.connect(f);
    f.connect(g);
    g.connect(master);
    osc.start();
    lfo.start();
    musicNodes.push(osc, g, f, lfo, lg);
  };

  if (level <= 1) {
    pad(196, "sine", 0.05);
    pad(247, "sine", 0.035);
    pad(294, "triangle", 0.02);
  } else if (level === 2) {
    pad(174, "sine", 0.05);
    pad(207, "triangle", 0.03);
    pad(110, "sine", 0.04);
  } else if (level === 3) {
    pad(98, "sine", 0.06);
    pad(147, "sawtooth", 0.015);
    musicTimer = window.setInterval(() => {
      tone(dest, "sine", 55, 0.18, 0.08);
    }, 920);
  } else if (level === 4) {
    pad(80, "square", 0.02);
    pad(120, "sawtooth", 0.012);
    musicTimer = window.setInterval(() => {
      if (Math.random() > 0.6) noiseBurst(dest, 0.12, 0.04);
    }, 700);
  } else if (level === 5) {
    pad(65, "sine", 0.04);
    musicTimer = window.setInterval(() => {
      tone(dest, "sine", 52, 0.12, 0.05);
    }, 780);
  } else {
    pad(49, "sawtooth", 0.03);
    pad(73, "square", 0.012);
    pad(155, "triangle", 0.02);
  }
}

export function hushMusic(seconds = 0.4) {
  if (!bus || !musicOn) return;
  bus.music.gain.setTargetAtTime(0.02, ctxNow(), seconds / 4);
  window.setTimeout(() => {
    if (bus && musicOn) bus.music.gain.setTargetAtTime(0.22, ctxNow(), 0.4);
  }, seconds * 1000);
}
