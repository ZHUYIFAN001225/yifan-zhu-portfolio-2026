// Light background music for the explore page, synthesised in the browser (no track to license or download).
// I – V – vi – IV in C, a simple tune on top, three voicings to choose from: kalimba, piano, music box.
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[60, 64, 67], [59, 62, 67], [60, 64, 69], [60, 65, 69]];   // C  G  Am  F
const BASS = [48, 43, 45, 41];
// the tune: [eighth-note position in the bar, midi]
const TUNE = [
  [[0, 76], [2, 79], [4, 84], [7, 83]],
  [[0, 83], [2, 79], [4, 74], [6, 79]],
  [[0, 81], [2, 76], [4, 72], [6, 76]],
  [[0, 77], [2, 81], [5, 79], [6, 76]]
];
const STYLES = {
  kalimba: { bpm: 96, voice: 'kalimba', arp: [0, 1, 2, 1, 0, 2, 1, 2], arpOct: 0, tuneOct: 0, bass: 0.5, verb: 0.28 },
  piano: { bpm: 74, voice: 'piano', arp: [0, 2, 1, 2, 0, 2, 1, 2], arpOct: -12, tuneOct: 0, bass: 0.7, verb: 0.32 },
  musicbox: { bpm: 84, voice: 'box', arp: [0, -1, 2, -1, 1, -1, 2, -1], arpOct: 12, tuneOct: 12, bass: 0.35, verb: 0.4 }
};

function impulse(ac, seconds, decay) {
  const len = Math.floor(ac.sampleRate * seconds), buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
  return buf;
}

export function startMusic(ac, styleName = 'kalimba', level = 0.42, { offline = false, seconds = 0 } = {}) {
  const st = STYLES[styleName] || STYLES.kalimba;
  const master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  master.gain.setTargetAtTime(level, ac.currentTime, 1.2);
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; comp.connect(master);
  const verb = ac.createConvolver(); verb.buffer = impulse(ac, 2.4, 3);
  const wet = ac.createGain(); wet.gain.value = st.verb; verb.connect(wet).connect(comp);
  const bus = ac.createGain(); bus.connect(comp); bus.connect(verb);
  const air = ac.createBiquadFilter(); air.type = 'highshelf'; air.frequency.value = 5000; air.gain.value = -6; air.connect(bus);

  function partial(f, at, peak, decay, type = 'sine', pan = 0) {
    const o = ac.createOscillator(), g = ac.createGain(), p = ac.createStereoPanner ? ac.createStereoPanner() : null;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(peak, at + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    o.connect(g); if (p) { p.pan.value = pan; g.connect(p).connect(air); } else g.connect(air);
    o.start(at); o.stop(at + decay + 0.05);
  }
  function note(m, at, vel, pan) {
    const f = mtof(m);
    if (st.voice === 'kalimba') { partial(f, at, 0.22 * vel, 1.4, 'sine', pan); partial(f * 5.4, at, 0.05 * vel, 0.12, 'sine', pan); partial(f * 2, at, 0.04 * vel, 0.5, 'sine', pan); }
    else if (st.voice === 'piano') { [[1, .2], [2, .08], [3, .04], [4, .02]].forEach(([h, a], i) => partial(f * h * (1 + i * 0.0007), at, a * vel, 2.6 - i * 0.45, 'sine', pan)); partial(f, at, 0.03 * vel, 0.05, 'triangle', pan); }
    else { partial(f, at, 0.16 * vel, 2.2, 'sine', pan); partial(f * 3.01, at, 0.05 * vel, 0.9, 'sine', pan); partial(f * 6.2, at, 0.02 * vel, 0.3, 'sine', pan); }
  }
  function soft(m, at, len, vel) { // a quiet sustained bass under everything
    const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = mtof(m);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.12 * vel, at + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(g).connect(bus); o.start(at); o.stop(at + len + 0.05);
  }

  const eighth = 60 / st.bpm / 2, barLen = eighth * 8;
  const t0 = ac.currentTime + 0.15;
  let nextBar = 0;
  function scheduleBar(b) {
    const at = t0 + b * barLen, c = b % 4, chord = CHORDS[c], round = Math.floor(b / 4);
    soft(BASS[c], at, barLen * 0.95, st.bass);
    st.arp.forEach((k, i) => { if (k < 0) return; const swing = i % 2 ? eighth * 0.06 : 0; note(chord[k] + st.arpOct, at + i * eighth + swing, i === 0 ? 0.55 : 0.38, (k - 1) * 0.35); });
    // the tune comes in on the second round, and rests every fourth round so it never wears out
    if (round > 0 && round % 4 !== 3) TUNE[c].forEach(([pos, m]) => note(m + st.tuneOct + (round % 2 ? 0 : 0), at + pos * eighth, 0.7, 0.1));
  }
  let timer = null, alive = true;
  if (offline) { for (let b = 0; t0 + b * barLen < seconds; b++) scheduleBar(b); }
  else {
    const pump = () => { if (!alive) return; while (t0 + nextBar * barLen < ac.currentTime + 1.2) { if (t0 + nextBar * barLen >= ac.currentTime - 0.05) scheduleBar(nextBar); nextBar++; } timer = setTimeout(pump, 250); };
    pump();
  }
  return {
    stop() { alive = false; clearTimeout(timer); master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0, ac.currentTime, 0.4); setTimeout(() => { try { master.disconnect(); } catch {} }, 3000); },
    duck(on) { master.gain.setTargetAtTime(on ? level * 0.45 : level, ac.currentTime, 0.4); }
  };
}
