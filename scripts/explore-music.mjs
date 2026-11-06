// A quiet generative score for the explore page: slow warm chords under sparse, high bell notes.
// Everything is synthesised in the browser, so there is no track to license or download, and it never repeats exactly.
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [
  [38, 57, 61, 64, 66], // Dmaj9
  [35, 54, 57, 61, 62], // Bm9
  [43, 54, 59, 61, 62], // Gmaj7(#11)
  [45, 52, 57, 59, 64]  // Asus2
];
const BELLS = [74, 76, 78, 81, 83, 86, 88];

function impulse(ac, seconds, decay) {
  const len = Math.floor(ac.sampleRate * seconds), buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
  return buf;
}

export function startMusic(ac, level = 0.13) {
  const master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  master.gain.setTargetAtTime(level, ac.currentTime, 2.2);
  const verb = ac.createConvolver(); verb.buffer = impulse(ac, 5, 2.6);
  const wet = ac.createGain(); wet.gain.value = 0.75; verb.connect(wet).connect(master);
  const dry = ac.createGain(); dry.gain.value = 0.45; dry.connect(master);
  const tone = ac.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 1100; tone.Q.value = 0.4;
  tone.connect(dry); tone.connect(verb);
  // the filter breathes very slowly
  const lfo = ac.createOscillator(), lfoGain = ac.createGain(); lfo.frequency.value = 0.035; lfoGain.gain.value = 380;
  lfo.connect(lfoGain).connect(tone.frequency); lfo.start();

  const timers = new Set(); let alive = true, step = 0;
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

  function pad(notes, at, len) {
    notes.forEach((m, i) => {
      [0, 1].forEach(k => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = k ? 'triangle' : 'sine'; o.frequency.value = mtof(m); o.detune.value = (k ? 7 : -6) + (Math.random() * 4 - 2);
        const peak = (i === 0 ? 0.11 : 0.05) * (k ? 0.45 : 1);
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(peak, at + 3.5);
        g.gain.setValueAtTime(peak, at + len - 1); g.gain.linearRampToValueAtTime(0, at + len + 5);
        o.connect(g).connect(tone); o.start(at); o.stop(at + len + 5.2);
      });
    });
  }
  function bell(at) {
    const m = BELLS[Math.floor(Math.random() * BELLS.length)], o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = mtof(m); o2.type = 'sine'; o2.frequency.value = mtof(m) * 2.01;
    const g2 = ac.createGain(); g2.gain.value = 0.18; o2.connect(g2).connect(g);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.045, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + 3.6);
    o.connect(g); g.connect(verb); g.connect(dry);
    o.start(at); o2.start(at); o.stop(at + 3.8); o2.stop(at + 3.8);
  }
  const BAR = 9;
  let t0 = ac.currentTime + 0.1, beat = 0; // bars sit on an absolute grid, so timer jitter never drifts them
  function bar() {
    let t = t0 + beat * BAR;
    if (t < ac.currentTime) { t0 = ac.currentTime + 0.1; beat = 0; t = t0; }      // fell behind (tab was asleep): restart the grid
    if (t > ac.currentTime + BAR * 2) { later(bar, BAR * 1000); return; }       // context paused: don't pile notes up
    beat++;
    pad(CHORDS[step % CHORDS.length], t, BAR);
    // two to four bell notes, loosely placed, sometimes none
    if (step > 0 && Math.random() > 0.15) { const n = 2 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) bell(t + 1.5 + Math.random() * (BAR - 2.5)); }
    step++; later(bar, Math.max(200, (t + BAR - 1.5 - ac.currentTime) * 1000));
  }
  bar();
  return {
    stop() {
      alive = false; timers.forEach(clearTimeout); timers.clear();
      master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0, ac.currentTime, 0.6);
      setTimeout(() => { try { lfo.stop(); master.disconnect(); } catch {} }, 4000);
    },
    duck(on) { master.gain.setTargetAtTime(on ? level * 0.35 : level, ac.currentTime, 0.4); }
  };
}
