let ac: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  try {
    if (!ac) ac = new AudioContext();
    ac.resume();
    return ac;
  } catch {
    return null;
  }
}

function noteToFreq(n: number): number {
  return 261.63 * Math.pow(2, n / 12);
}

function tone(
  freq: number,
  delay: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  to?: number,
) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

function noise(delay: number, duration: number, volume = 0.1, freq = 3000) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const buffer = ctx.createBuffer(1, (ctx.sampleRate * duration) | 0, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  src.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  gain.gain.value = volume;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(ctx.currentTime + delay);
}

let fxEnabled = () => true;

export function setFxEnabled(fn: () => boolean) {
  fxEnabled = fn;
}

function vibrate(pattern: number | number[]) {
  try {
    if (fxEnabled() && navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}

export const sfx = {
  ok(combo: number) {
    if (!fxEnabled()) return;
    const k = (Math.min(combo, 8) - 1) * 2;
    [0, 4, 7, 12].forEach((x, i) => tone(noteToFreq(12 + k + x), i * 0.055, 0.3, 'triangle', 0.14));
    tone(noteToFreq(36 + k), 0.2, 0.25, 'sine', 0.05);
    tone(90, 0, 0.2, 'sine', 0.28, 45);
  },
  pair() {
    tone(noteToFreq(19), 0, 0.12, 'triangle', 0.12);
    tone(noteToFreq(26), 0.07, 0.16, 'triangle', 0.1);
  },
  bad() {
    tone(120, 0, 0.25, 'sine', 0.32, 40);
    tone(150, 0, 0.3, 'sawtooth', 0.08);
    tone(158, 0, 0.3, 'sawtooth', 0.08);
    tone(noteToFreq(-5), 0.14, 0.28, 'square', 0.06, noteToFreq(-9));
    tone(noteToFreq(-9), 0.34, 0.45, 'square', 0.06, noteToFreq(-14));
  },
  star(i: number) {
    tone(noteToFreq(19 + i * 4), 0, 0.4, 'triangle', 0.16);
    tone(noteToFreq(31 + i * 4), 0.04, 0.4, 'sine', 0.07);
  },
  nostar() {
    tone(100, 0, 0.22, 'sine', 0.28, 48);
  },
  fan() {
    [0, 4, 7, 12, 16, 19, 24].forEach((x, i) => tone(noteToFreq(12 + x), i * 0.09, 0.35, 'triangle', 0.15));
    [0, 4, 7, 12].forEach((x) => tone(noteToFreq(24 + x), 0.7, 1.5, 'sawtooth', 0.05));
    tone(noteToFreq(36), 0.75, 1.3, 'sine', 0.08);
    for (let i = 0; i < 16; i++) noise(0.8 + i * 0.1 + Math.random() * 0.1, 0.25, 0.12, 2500 + Math.random() * 3000);
    tone(70, 0.7, 0.6, 'sine', 0.32, 34);
  },
  mid() {
    [0, 2, 4, 7].forEach((x, i) => tone(noteToFreq(12 + x), i * 0.12, 0.42, 'triangle', 0.13));
    [0, 4, 7].forEach((x) => tone(noteToFreq(19 + x), 0.5, 0.8, 'sine', 0.07));
    for (let i = 0; i < 5; i++) noise(0.6 + i * 0.12, 0.2, 0.07, 3000);
  },
  sad() {
    [
      [-2, 0],
      [-3, 0.5],
      [-4, 1],
    ].forEach(([x, t]) => tone(noteToFreq(x), t, 0.42, 'sawtooth', 0.09, noteToFreq(x - 0.5)));
    tone(noteToFreq(-5), 1.5, 1.3, 'sawtooth', 0.1, noteToFreq(-12));
    tone(noteToFreq(-5) * 1.012, 1.5, 1.3, 'sawtooth', 0.06, noteToFreq(-12));
    noise(0.1, 2, 0.05, 400);
  },
  lvl() {
    for (let i = 0; i < 8; i++) tone(noteToFreq(12 + i * 3), i * 0.06, 0.3, 'square', 0.07);
  },
  vibrateOk(combo: number) {
    vibrate(combo >= 3 ? [25, 20, 45] : 30);
  },
  vibrateBad() {
    vibrate([140, 60, 140]);
  },
  vibrateFan() {
    vibrate([60, 40, 60, 40, 220]);
  },
  vibrateMid() {
    vibrate([50, 30, 90]);
  },
  vibrateSad() {
    vibrate([300, 100, 300]);
  },
};
