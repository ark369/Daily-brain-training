/**
 * Gentle synthesized Web Audio marimba chimes + Web Speech read-aloud helper.
 * Zero external audio assets; gracefully degrades if blocked or unavailable.
 */

let audioCtx = null;
let soundEnabled = true;
let speechEnabled = false;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    try {
      audioCtx = new Ctx();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq, duration = 0.16, delay = 0, type = 'sine', gainPeak = 0.14) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function setSoundEnabled(val) {
  soundEnabled = Boolean(val);
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSpeechEnabled(val) {
  speechEnabled = Boolean(val);
  if (!speechEnabled) stopSpeaking();
}

export function isSpeechEnabled() {
  return speechEnabled;
}

export function playClick() {
  playTone(440, 0.06, 0, 'triangle', 0.08);
}

export function playCorrect() {
  // Warm major triad chime (C5 -> E5 -> G5)
  playTone(523.25, 0.14, 0, 'triangle', 0.14);
  playTone(659.25, 0.16, 0.07, 'triangle', 0.14);
  playTone(783.99, 0.24, 0.14, 'sine', 0.13);
}

export function playRetry() {
  // Soft, non-punitive wooden marimba knock (no harsh buzzer!)
  playTone(310, 0.12, 0, 'sine', 0.1);
  playTone(260, 0.16, 0.09, 'sine', 0.09);
}

export function playSwitch() {
  // Bright attention bell for rule switches
  playTone(587.33, 0.12, 0, 'triangle', 0.12);
  playTone(880, 0.18, 0.08, 'sine', 0.12);
}

export function playCelebrate() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, idx) => {
    playTone(n, 0.28, idx * 0.09, 'triangle', 0.15);
  });
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

export function speakText(text, force = false) {
  if (!text) return;
  if (!force && !speechEnabled) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.94;
    utter.pitch = 1.05;
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  } catch {
    // ignore speech failures gracefully
  }
}
