let voice: SpeechSynthesisVoice | null = null;

function loadVoice() {
  try {
    const voices = speechSynthesis.getVoices();
    voice =
      voices.find((v) => /^en[-_]US/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      null;
  } catch {
    // ignore
  }
}

try {
  speechSynthesis.onvoiceschanged = loadVoice;
  loadVoice();
} catch {
  // ignore
}

export function initAudioOnFirstClick() {
  try {
    loadVoice();
  } catch {
    // ignore
  }
}

export function speak(text: string, opts: { enabled: boolean; slow?: boolean } = { enabled: true }) {
  if (!opts.enabled) return;
  if (!('speechSynthesis' in window)) return;
  try {
    const synth = speechSynthesis;
    synth.cancel();
    synth.resume();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    if (voice) utter.voice = voice;
    utter.rate = opts.slow ? 0.55 : 0.9;
    setTimeout(() => synth.speak(utter), 60);
  } catch {
    // ignore
  }
}
