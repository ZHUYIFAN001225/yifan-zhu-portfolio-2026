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

export function startMusic(ac, styleName = 'kalimba', level = 0.42, opts = {}) {
  if (styleName === 'tech' || styleName === 'tech-ambient') return startTech(ac, styleName === 'tech', level, opts);
  if (styleName === 'deep') return startDeep(ac, level, opts);
  const { offline = false, seconds = 0 } = opts;
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

// ---- tech: a light electronic piece. Plucked synth arpeggios through a ping-pong delay, a soft side-chained pad,
// and (optionally) a gentle kick and hi-hat. Am – F – C – G.
function startTech(ac, drums, level, { offline = false, seconds = 0 } = {}) {
  const bpm = 104, s16 = 60 / bpm / 4, barLen = s16 * 16;
  const CH = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 67], [48, 55, 60, 64, 67], [55, 59, 62, 67, 69]]; // Am9 Fmaj9 Cadd9 G6
  const BS = [33, 29, 36, 31];
  const master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  master.gain.setTargetAtTime(level, ac.currentTime, 1);
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; comp.connect(master);
  // ping-pong delay, dotted eighth
  const dL = ac.createDelay(2), dR = ac.createDelay(2), fb = ac.createGain(), dIn = ac.createGain(), dOut = ac.createGain();
  dL.delayTime.value = s16 * 3; dR.delayTime.value = s16 * 3; fb.gain.value = 0.38; dOut.gain.value = 0.32;
  const mL = ac.createChannelMerger(2); const dTone = ac.createBiquadFilter(); dTone.type = 'lowpass'; dTone.frequency.value = 3200;
  dIn.connect(dTone).connect(dL); dL.connect(dR); dR.connect(fb).connect(dL);
  dL.connect(mL, 0, 0); dR.connect(mL, 0, 1); mL.connect(dOut).connect(comp);
  const verb = ac.createConvolver(); verb.buffer = impulse(ac, 2.2, 3.2); const wet = ac.createGain(); wet.gain.value = 0.22; verb.connect(wet).connect(comp);
  // pad bus with side-chain style pumping on every beat
  const padBus = ac.createGain(); padBus.gain.value = 1; const padLP = ac.createBiquadFilter(); padLP.type = 'lowpass'; padLP.frequency.value = 900; padLP.Q.value = 0.7;
  padBus.connect(padLP); padLP.connect(comp); padLP.connect(verb);
  const pluckBus = ac.createGain(); pluckBus.connect(comp); pluckBus.connect(dIn); pluckBus.connect(verb);
  // the arp filter opens and closes over eight bars
  const sweep = ac.createOscillator(), sweepAmt = ac.createGain(); sweep.frequency.value = 1 / (barLen * 8); sweepAmt.gain.value = 1300; sweep.connect(sweepAmt);
  sweep.start();

  function pluck(m, at, vel, pan) {
    const f = 440 * Math.pow(2, (m - 69) / 12), o = ac.createOscillator(), o2 = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth'; o2.type = 'square'; o.frequency.value = f; o2.frequency.value = f * 1.003;
    lp.type = 'lowpass'; lp.Q.value = 6; lp.frequency.setValueAtTime(2200, at); lp.frequency.exponentialRampToValueAtTime(500, at + 0.22); sweepAmt.connect(lp.detune);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.07 * vel, at + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.32);
    const p = ac.createStereoPanner(); p.pan.value = pan;
    const g2 = ac.createGain(); g2.gain.value = 0.5; o2.connect(g2).connect(lp); o.connect(lp); lp.connect(g).connect(p).connect(pluckBus);
    o.start(at); o2.start(at); o.stop(at + 0.36); o2.stop(at + 0.36);
    setTimeout(() => { try { sweepAmt.disconnect(lp.detune); } catch {} }, offline ? 0 : Math.max(0, (at - ac.currentTime + 0.5) * 1000));
  }
  function pad(notes, at, len) {
    notes.slice(0, 4).forEach((m, i) => [-8, 8].forEach(dt => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = 440 * Math.pow(2, (m - 12 * (i === 0 ? 1 : 0) - 69) / 12); o.detune.value = dt;
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.018, at + 0.6); g.gain.setValueAtTime(0.018, at + len - 0.3); g.gain.linearRampToValueAtTime(0, at + len + 0.4);
      o.connect(g).connect(padBus); o.start(at); o.stop(at + len + 0.5);
    }));
    for (let b = 0; b < 4; b++) { const t = at + b * s16 * 4; padBus.gain.setValueAtTime(0.25, t); padBus.gain.linearRampToValueAtTime(1, t + s16 * 3); }
  }
  function bass(m, at) {
    const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
    lp.type = 'lowpass'; lp.frequency.value = 400;
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.16, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + s16 * 3.5);
    o.connect(lp).connect(g).connect(comp); o.start(at); o.stop(at + s16 * 4);
  }
  let noise = null;
  function hat(at, vel) {
    if (!noise) { noise = ac.createBuffer(1, ac.sampleRate * 0.1, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ac.createBufferSource(), hp = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noise; hp.type = 'highpass'; hp.frequency.value = 8000;
    g.gain.setValueAtTime(0.05 * vel, at); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.04);
    s.connect(hp).connect(g).connect(comp); s.start(at); s.stop(at + 0.06);
  }
  function kick(at) {
    const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(110, at); o.frequency.exponentialRampToValueAtTime(42, at + 0.12);
    g.gain.setValueAtTime(0.32, at); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
    o.connect(g).connect(comp); o.start(at); o.stop(at + 0.3);
  }
  function blip(at) {
    const o = ac.createOscillator(), g = ac.createGain(), p = ac.createStereoPanner(); o.type = 'sine'; o.frequency.setValueAtTime(1800 + Math.random() * 1600, at);
    g.gain.setValueAtTime(0.025, at); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.07); p.pan.value = Math.random() * 1.6 - 0.8;
    o.connect(g).connect(p).connect(dIn); o.start(at); o.stop(at + 0.08);
  }
  const ARP = [0, 2, 4, 2, 1, 3, 4, 3, 0, 2, 4, 2, 3, 1, 4, 2];
  const t0 = ac.currentTime + 0.15;
  function scheduleBar(b) {
    const at = t0 + b * barLen, c = b % 4, ch = CH[c], round = Math.floor(b / 4);
    pad(ch, at, barLen);
    ARP.forEach((k, i) => { if (round === 0 && i % 2) return; pluck(ch[k] + (i >= 8 && round % 2 ? 12 : 0), at + i * s16, i % 4 === 0 ? 1 : 0.7, ((i % 4) - 1.5) * 0.3); });
    if (b >= 2) [0, 6, 10].forEach(i => bass(BS[c] + 12, at + i * s16));
    if (drums && b >= 4 && round % 4 !== 3) { [0, 8].forEach(i => kick(at + i * s16)); for (let i = 2; i < 16; i += 4) hat(at + i * s16, 1); if (round % 2) [5, 13].forEach(i => hat(at + i * s16, 0.5)); }
    if (Math.random() < 0.5) blip(at + s16 * (3 + Math.floor(Math.random() * 12)));
  }
  let next = 0, timer = null, alive = true;
  if (offline) { for (let b = 0; t0 + b * barLen < seconds; b++) scheduleBar(b); }
  else { const pump = () => { if (!alive) return; while (t0 + next * barLen < ac.currentTime + 1.2) { if (t0 + next * barLen >= ac.currentTime - 0.05) scheduleBar(next); next++; } timer = setTimeout(pump, 250); }; pump(); }
  return {
    stop() { alive = false; clearTimeout(timer); master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0, ac.currentTime, 0.4); setTimeout(() => { try { sweep.stop(); master.disconnect(); } catch {} }, 3000); },
    duck(on) { master.gain.setTargetAtTime(on ? level * 0.45 : level, ac.currentTime, 0.4); }
  };
}

// ---- deep: slow, spacious and cinematic. A pipe-organ voice built from stacked harmonics, a low drone,
// a patient ostinato that gathers layer by layer, a faint clock tick, and a very long hall. Original material in A minor.
function startDeep(ac, level, { offline = false, seconds = 0 } = {}) {
  const bpm = 66, beat = 60 / bpm, barLen = beat * 4;
  const CH = [[45, 57, 60, 64, 71], [41, 57, 60, 64, 69], [36, 55, 60, 64, 67], [43, 55, 59, 62, 67]]; // Am(add9)  Fmaj7  C  G
  const LINE = [[76, 74], [72, 76], [79, 76], [74, 71]];   // two long notes per bar, high
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  master.gain.setTargetAtTime(level, ac.currentTime, 3);
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -22; comp.ratio.value = 3; comp.connect(master);
  const hall = ac.createConvolver(); hall.buffer = impulse(ac, 7, 2.2); const wet = ac.createGain(); wet.gain.value = 0.9; hall.connect(wet).connect(comp);
  const dry = ac.createGain(); dry.gain.value = 0.35; dry.connect(comp);
  const body = ac.createBiquadFilter(); body.type = 'lowpass'; body.frequency.value = 2600; body.connect(dry); body.connect(hall);
  // tremulant: a slow shared vibrato, like air moving through pipes
  const trem = ac.createOscillator(), tremAmt = ac.createGain(); trem.frequency.value = 4.8; tremAmt.gain.value = 3; trem.connect(tremAmt); trem.start();
  const STOPS = [[1, 1], [2, 0.5], [3, 0.18], [4, 0.22], [6, 0.06], [8, 0.08]];
  function organ(m, at, len, vel, bright = 1) {
    const f = mtof(m), g = ac.createGain();
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vel, at + 0.12); g.gain.setValueAtTime(vel, at + len); g.gain.linearRampToValueAtTime(0, at + len + 0.9);
    g.connect(body);
    STOPS.forEach(([h, a]) => { if (h > 4 && bright < 1) return; const o = ac.createOscillator(); o.frequency.value = f * h; tremAmt.connect(o.detune);
      const ga = ac.createGain(); ga.gain.value = a; o.connect(ga).connect(g); o.start(at); o.stop(at + len + 1); });
  }
  function drone(m, at, len) {
    [0, 0.12].forEach((dt, k) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = k ? 'triangle' : 'sine'; o.frequency.value = mtof(m) * (1 + dt / 100);
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.09, at + 2.5); g.gain.setValueAtTime(0.09, at + len - 1); g.gain.linearRampToValueAtTime(0, at + len + 2);
      o.connect(g).connect(hall); o.connect(g).connect(dry); o.start(at); o.stop(at + len + 2.2); });
  }
  let noise = null;
  function tick(at, vel) {
    if (!noise) { noise = ac.createBuffer(1, ac.sampleRate * 0.03, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 6); }
    const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noise; bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 4;
    g.gain.value = 0.22 * vel; s.connect(bp).connect(g); g.connect(dry); g.connect(hall); s.start(at);
  }
  // a twenty-bar arc: open quietly, gather, swell, then thin back out
  const ARC = 20;
  const t0 = ac.currentTime + 0.2;
  function scheduleBar(b) {
    const at = t0 + b * barLen, c = b % 4, ch = CH[c], sec = b % ARC;
    const swell = sec < 4 ? 0.55 : sec < 8 ? 0.7 : sec < 16 ? 0.7 + (sec - 8) * 0.04 : 0.85 - (sec - 16) * 0.12;
    drone(ch[0] - 12, at, barLen);
    // held chord, the root an octave down
    ch.slice(1, 4).forEach(m => organ(m, at, barLen - 0.15, 0.035 * swell, 0));
    organ(ch[0], at, barLen - 0.15, 0.05 * swell, 0);
    // the ostinato: patient eighth notes rocking between chord tones
    if (sec >= 4) { const pat = [ch[1], ch[3], ch[2], ch[3], ch[1], ch[3], ch[2], ch[4]];
      pat.forEach((m, i) => organ(m + 12, at + i * beat / 2, beat / 2 - 0.05, (i % 2 ? 0.018 : 0.026) * swell)); }
    // the line above, long and slow
    if (sec >= 8 && sec < 18) LINE[c].forEach((m, i) => organ(m, at + i * beat * 2, beat * 2 - 0.1, 0.03 * swell));
    if (sec >= 6 && sec < 17) for (let i = 0; i < 4; i++) tick(at + i * beat, i === 0 ? 1 : 0.6);
  }
  let next = 0, timer = null, alive = true;
  if (offline) { for (let b = 0; t0 + b * barLen < seconds; b++) scheduleBar(b); }
  else { const pump = () => { if (!alive) return; while (t0 + next * barLen < ac.currentTime + 1.5) { if (t0 + next * barLen >= ac.currentTime - 0.05) scheduleBar(next); next++; } timer = setTimeout(pump, 300); }; pump(); }
  return {
    stop() { alive = false; clearTimeout(timer); master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0, ac.currentTime, 0.6); setTimeout(() => { try { trem.stop(); master.disconnect(); } catch {} }, 4000); },
    duck(on) { master.gain.setTargetAtTime(on ? level * 0.45 : level, ac.currentTime, 0.5); }
  };
}
