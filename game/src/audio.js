// Original sound: tiny WebAudio synth blips, no audio files. Everything is
// generated at run time, so the game needs no network and no assets.
export function createGalleryAudio() {
  let ctx = null;
  let muted = false;
  let musicTimer = null;
  let musicStep = 0;

  function ensureContext() {
    if (!ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      ctx = new AudioContextClass();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, seconds, kind, volume, when = 0) {
    const ac = ensureContext();
    if (!ac || muted) return;
    const start = ac.currentTime + when;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = kind;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(start);
    osc.stop(start + seconds + 0.02);
  }

  // A low, tense bass pulse that walks a minor line while the heist runs.
  const bassLine = [110, 0, 103.8, 0, 98, 0, 116.5, 0, 110, 0, 98, 0, 87.3, 0, 98, 0];
  function startMusic() {
    if (musicTimer) return;
    musicTimer = setInterval(() => {
      if (muted) return;
      const freq = bassLine[musicStep % bassLine.length];
      musicStep += 1;
      if (freq > 0) tone(freq, 0.5, 'triangle', 0.05);
    }, 340);
  }

  return {
    unlock() { ensureContext(); },
    startMusic,
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() { return muted; },
    coin() { tone(1320, 0.09, 'sine', 0.12); tone(1760, 0.12, 'sine', 0.1, 0.07); },
    cut() { tone(240, 0.08, 'sawtooth', 0.06); },
    steal() { tone(523, 0.12, 'sine', 0.14); tone(659, 0.12, 'sine', 0.14, 0.1); tone(784, 0.2, 'sine', 0.14, 0.2); },
    spotted() { tone(220, 0.18, 'square', 0.1); tone(185, 0.22, 'square', 0.1, 0.12); },
    laser() { tone(1900, 0.07, 'square', 0.07); tone(1500, 0.09, 'square', 0.07, 0.06); },
    smoke() { tone(320, 0.3, 'sine', 0.08); tone(210, 0.4, 'sine', 0.06, 0.1); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'sine', 0.14, i * 0.13)); },
    caught() { [392, 311, 233, 175].forEach((f, i) => tone(f, 0.3, 'sawtooth', 0.09, i * 0.16)); },
  };
}
