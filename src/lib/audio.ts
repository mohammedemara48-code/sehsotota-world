type Bus = {
  ctx: AudioContext;
  master: GainNode;
  sfx: GainNode;
  music: GainNode;
};

let bus: Bus | null = null;
let masterGain = 0.85;

function ensure(): Bus | null {
  if (typeof window === "undefined") return null;
  if (bus) return bus;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx({ latencyHint: "interactive" });
  const master = ctx.createGain();
  const sfx = ctx.createGain();
  const music = ctx.createGain();
  sfx.gain.value = 0.9;
  music.gain.value = 0.5;
  master.gain.value = masterGain * masterGain;
  sfx.connect(master);
  music.connect(master);
  master.connect(ctx.destination);
  bus = { ctx, master, sfx, music };
  return bus;
}

export function unlockAudio() {
  const b = ensure();
  if (!b) return;
  if (b.ctx.state === "suspended") {
    void b.ctx.resume();
  }
}

export function setMasterVolume(v: number, muted: boolean) {
  masterGain = muted ? 0 : Math.max(0, Math.min(1, v));
  const b = bus;
  if (!b) return;
  b.master.gain.setTargetAtTime(masterGain * masterGain, b.ctx.currentTime, 0.03);
}

function envGain(b: Bus, dest: AudioNode, peak: number, attack: number, release: number) {
  const g = b.ctx.createGain();
  g.gain.setValueAtTime(0.0001, b.ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(peak, b.ctx.currentTime + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, b.ctx.currentTime + attack + release);
  g.connect(dest);
  return g;
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "sine",
  peak = 0.22,
  dest?: AudioNode,
) {
  const b = ensure();
  if (!b) return;
  const osc = b.ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, b.ctx.currentTime);
  const g = envGain(b, dest ?? b.sfx, peak, 0.012, dur);
  osc.connect(g);
  osc.start();
  osc.stop(b.ctx.currentTime + dur + 0.05);
}

function noiseBurst(dur: number, peak: number, hp = 800, lp = 4000) {
  const b = ensure();
  if (!b) return;
  const n = b.ctx.createBuffer(1, Math.floor(b.ctx.sampleRate * dur), b.ctx.sampleRate);
  const data = n.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = b.ctx.createBufferSource();
  src.buffer = n;
  const filter = b.ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = (hp + lp) / 2;
  filter.Q.value = 0.8;
  const g = envGain(b, b.sfx, peak, 0.005, dur * 0.9);
  src.connect(filter);
  filter.connect(g);
  src.start();
}

export function playPop() {
  const b = ensure();
  if (!b) return;
  const osc = b.ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(720, b.ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, b.ctx.currentTime + 0.12);
  const g = envGain(b, b.sfx, 0.28, 0.004, 0.14);
  osc.connect(g);
  osc.start();
  osc.stop(b.ctx.currentTime + 0.16);
  noiseBurst(0.05, 0.08, 1200, 5000);
}

export function playNote(freq: number) {
  const b = ensure();
  if (!b) return;
  const t = b.ctx.currentTime;
  const osc = b.ctx.createOscillator();
  const osc2 = b.ctx.createOscillator();
  osc.type = "sine";
  osc2.type = "triangle";
  osc.frequency.setValueAtTime(freq, t);
  osc2.frequency.setValueAtTime(freq * 2, t);
  const g = b.ctx.createGain();
  const g2 = b.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.32, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.05);
  g2.gain.setValueAtTime(0.0001, t);
  g2.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  osc.connect(g);
  osc2.connect(g2);
  g.connect(b.sfx);
  g2.connect(b.sfx);
  osc.start(t);
  osc2.start(t);
  osc.stop(t + 1.1);
  osc2.stop(t + 0.5);
}

export function playSuccess() {
  const b = ensure();
  if (!b) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => {
    const t = b.ctx.currentTime + i * 0.11;
    const osc = b.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f, t);
    const g = b.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    osc.connect(g);
    g.connect(b.sfx);
    osc.start(t);
    osc.stop(t + 0.32);
  });
}

export function playClap() {
  noiseBurst(0.09, 0.28, 600, 2500);
  window.setTimeout(() => noiseBurst(0.07, 0.2, 800, 3200), 90);
  window.setTimeout(() => noiseBurst(0.06, 0.16, 900, 3600), 170);
}

export function playWhoosh() {
  const b = ensure();
  if (!b) return;
  const osc = b.ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, b.ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(520, b.ctx.currentTime + 0.22);
  const g = envGain(b, b.sfx, 0.12, 0.02, 0.22);
  osc.connect(g);
  osc.start();
  osc.stop(b.ctx.currentTime + 0.26);
}

export function playWrong() {
  tone(180, 0.16, "square", 0.1);
  window.setTimeout(() => tone(140, 0.2, "square", 0.08), 120);
}

export function playChew() {
  tone(180, 0.08, "sine", 0.12);
  window.setTimeout(() => tone(150, 0.1, "sine", 0.1), 90);
}

export function playBrush() {
  noiseBurst(0.12, 0.1, 2000, 6000);
}

export function playSparkle() {
  tone(1200, 0.12, "sine", 0.1);
  window.setTimeout(() => tone(1600, 0.1, "sine", 0.08), 50);
}

export function playHonk() {
  const b = ensure();
  if (!b) return;
  const t = b.ctx.currentTime;
  const osc = b.ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(310, t);
  osc.frequency.setValueAtTime(240, t + 0.12);
  const g = envGain(b, b.sfx, 0.16, 0.01, 0.22);
  osc.connect(g);
  osc.start(t);
  osc.stop(t + 0.28);
}

export function playSplash() {
  noiseBurst(0.18, 0.2, 400, 1800);
  tone(420, 0.12, "sine", 0.1);
}

export function playBoing() {
  const b = ensure();
  if (!b) return;
  const osc = b.ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, b.ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(520, b.ctx.currentTime + 0.16);
  const g = envGain(b, b.sfx, 0.22, 0.008, 0.2);
  osc.connect(g);
  osc.start();
  osc.stop(b.ctx.currentTime + 0.24);
}

export function playChug() {
  tone(90, 0.08, "square", 0.1);
  window.setTimeout(() => tone(70, 0.08, "square", 0.08), 90);
  window.setTimeout(() => tone(90, 0.08, "square", 0.1), 180);
}

export function playBloom() {
  tone(660, 0.14, "sine", 0.12);
  window.setTimeout(() => tone(880, 0.16, "sine", 0.1), 80);
}

export function playDrum(freq = 110) {
  tone(freq, 0.22, "triangle", 0.28);
  noiseBurst(0.1, 0.14, 60, 700);
}

export function playRain() {
  noiseBurst(0.4, 0.12, 1400, 7800);
}

export type AnimalKind = "cat" | "dog" | "cow" | "bird" | "frog" | "elephant";

export function playAnimal(kind: AnimalKind) {
  const b = ensure();
  if (!b) return;
  const t = b.ctx.currentTime;
  if (kind === "cat") {
    [0, 0.28].forEach((off) => {
      const osc = b.ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, t + off);
      osc.frequency.exponentialRampToValueAtTime(380, t + off + 0.28);
      const g = b.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + off);
      g.gain.exponentialRampToValueAtTime(0.22, t + off + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.32);
      osc.connect(g);
      g.connect(b.sfx);
      osc.start(t + off);
      osc.stop(t + off + 0.34);
    });
  } else if (kind === "dog") {
    [0, 0.16, 0.34].forEach((off) => {
      const osc = b.ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(220, t + off);
      osc.frequency.exponentialRampToValueAtTime(140, t + off + 0.1);
      const g = b.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + off);
      g.gain.exponentialRampToValueAtTime(0.12, t + off + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.11);
      osc.connect(g);
      g.connect(b.sfx);
      osc.start(t + off);
      osc.stop(t + off + 0.13);
    });
  } else if (kind === "cow") {
    const osc = b.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.55);
    const g = b.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    const filter = b.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    osc.connect(filter);
    filter.connect(g);
    g.connect(b.sfx);
    osc.start(t);
    osc.stop(t + 0.75);
  } else if (kind === "bird") {
    [0, 0.12, 0.24, 0.4].forEach((off, i) => {
      const osc = b.ctx.createOscillator();
      osc.type = "sine";
      const f = 1800 + i * 220;
      osc.frequency.setValueAtTime(f, t + off);
      osc.frequency.exponentialRampToValueAtTime(f * 1.3, t + off + 0.08);
      const g = b.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + off);
      g.gain.exponentialRampToValueAtTime(0.16, t + off + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.09);
      osc.connect(g);
      g.connect(b.sfx);
      osc.start(t + off);
      osc.stop(t + off + 0.1);
    });
  } else if (kind === "frog") {
    [0, 0.22].forEach((off) => {
      const osc = b.ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(340, t + off);
      osc.frequency.exponentialRampToValueAtTime(90, t + off + 0.16);
      const g = b.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + off);
      g.gain.exponentialRampToValueAtTime(0.14, t + off + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.18);
      osc.connect(g);
      g.connect(b.sfx);
      osc.start(t + off);
      osc.stop(t + off + 0.2);
    });
  } else {
    const osc = b.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.7);
    const g = b.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
    const filter = b.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 480;
    osc.connect(filter);
    filter.connect(g);
    g.connect(b.sfx);
    osc.start(t);
    osc.stop(t + 0.9);
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && bus?.ctx.state === "suspended") {
      void bus.ctx.resume();
    }
  });
}
