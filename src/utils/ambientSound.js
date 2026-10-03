// src/utils/ambientSound.js
// Procedural Soundscape Engine using HTML5 Web Audio API
// High quality, 100% offline, zero-latency, seamless continuous loops for rain, wind, water, night ambience.

class AmbientSoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.activeNodes = {}; // { rain: { gainNode, stop() }, wind: ... }
    this.masterVolume = 0.5;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  // Generates 5 seconds of looping Pink Noise buffer
  createPinkNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Generates 5 seconds of looping Brown Noise buffer (deeper, warmer)
  createBrownNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 2.5; // Gain compensation
    }
    return buffer;
  }

  // --- 1. Sound Generator: RAIN (Hujan) ---
  startRain(volume = 0.5) {
    this.init();
    if (!this.ctx || this.activeNodes.rain) return;

    const noiseBuffer = this.createPinkNoiseBuffer();
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filters for steady rain texture
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(320, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.7, this.ctx.currentTime);

    // Droplet simulator (periodic soft impulses)
    let isDropletActive = true;
    const scheduleDroplet = () => {
      if (!isDropletActive || !this.ctx) return;
      try {
        const dropOsc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        dropOsc.type = "sine";
        const startFreq = 1600 + Math.random() * 800;
        dropOsc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        dropOsc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.04);

        dropGain.gain.setValueAtTime(volume * 0.04, this.ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

        dropOsc.connect(dropGain);
        dropGain.connect(this.masterGain);

        dropOsc.start();
        dropOsc.stop(this.ctx.currentTime + 0.05);
      } catch (e) {
        // ignore
      }
      const nextTime = 120 + Math.random() * 300;
      setTimeout(scheduleDroplet, nextTime);
    };

    noiseSource.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(this.masterGain);

    noiseSource.start();
    scheduleDroplet();

    this.activeNodes.rain = {
      gainNode,
      stop: () => {
        isDropletActive = false;
        try {
          noiseSource.stop();
          noiseSource.disconnect();
        } catch (e) {}
      },
    };
  }

  // --- 2. Sound Generator: WIND (Angin Semilir) ---
  startWind(volume = 0.5) {
    this.init();
    if (!this.ctx || this.activeNodes.wind) return;

    const noiseBuffer = this.createBrownNoiseBuffer();
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Resonant bandpass filter modulated by LFO to simulate gusts
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(380, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(2.2, this.ctx.currentTime);

    // LFO for gentle wind swaying
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime); // ~5.5s cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(160, this.ctx.currentTime); // sweep range ±160Hz
    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.85, this.ctx.currentTime);

    noiseSource.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(this.masterGain);

    lfo.start();
    noiseSource.start();

    this.activeNodes.wind = {
      gainNode,
      stop: () => {
        try {
          lfo.stop();
          noiseSource.stop();
          noiseSource.disconnect();
          lfo.disconnect();
        } catch (e) {}
      },
    };
  }

  // --- 3. Sound Generator: WAVES (Ombak / Air Mengalir) ---
  startWaves(volume = 0.5) {
    this.init();
    if (!this.ctx || this.activeNodes.waves) return;

    const noiseBuffer = this.createPinkNoiseBuffer();
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(450, this.ctx.currentTime);

    // Slow swell LFO for wave ebb & flow
    const waveLfo = this.ctx.createOscillator();
    waveLfo.type = "sine";
    waveLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8s cycle

    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(volume * 0.5, this.ctx.currentTime);

    // Dynamic wave modulation
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(volume * 0.35, this.ctx.currentTime);
    waveLfo.connect(lfoGain);
    lfoGain.connect(swellGain.gain);

    noiseSource.connect(lowpass);
    lowpass.connect(swellGain);
    swellGain.connect(this.masterGain);

    waveLfo.start();
    noiseSource.start();

    this.activeNodes.waves = {
      gainNode: swellGain,
      stop: () => {
        try {
          waveLfo.stop();
          noiseSource.stop();
          noiseSource.disconnect();
        } catch (e) {}
      },
    };
  }

  // --- 4. Sound Generator: NIGHT (Malam & Jangkrik) ---
  startNight(volume = 0.5) {
    this.init();
    if (!this.ctx || this.activeNodes.night) return;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);
    gainNode.connect(this.masterGain);

    let isCricketActive = true;
    const scheduleCricketChirp = () => {
      if (!isCricketActive || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const chirpGain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(4600 + Math.random() * 200, this.ctx.currentTime);

        chirpGain.gain.setValueAtTime(volume * 0.05, this.ctx.currentTime);
        chirpGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

        osc.connect(chirpGain);
        chirpGain.connect(gainNode);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.09);
      } catch (e) {}

      const next = 200 + Math.random() * 600;
      setTimeout(scheduleCricketChirp, next);
    };

    scheduleCricketChirp();

    this.activeNodes.night = {
      gainNode,
      stop: () => {
        isCricketActive = false;
      },
    };
  }

  // --- Sound Control Methods ---
  toggleSound(type, volume = 0.5) {
    if (this.activeNodes[type]) {
      this.stopSound(type);
      return false;
    } else {
      if (type === "rain") this.startRain(volume);
      else if (type === "wind") this.startWind(volume);
      else if (type === "waves") this.startWaves(volume);
      else if (type === "night") this.startNight(volume);
      return true;
    }
  }

  stopSound(type) {
    if (this.activeNodes[type]) {
      this.activeNodes[type].stop();
      delete this.activeNodes[type];
    }
  }

  stopAll() {
    Object.keys(this.activeNodes).forEach((type) => {
      this.stopSound(type);
    });
  }

  setVolume(type, volume) {
    if (this.activeNodes[type]?.gainNode && this.ctx) {
      this.activeNodes[type].gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  setMasterVolume(val) {
    this.masterVolume = val;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : val, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.masterVolume,
        this.ctx.currentTime
      );
    }
    return this.isMuted;
  }
}

// Global Singleton Instance
const ambientEngine = typeof window !== "undefined" ? new AmbientSoundEngine() : null;

export default ambientEngine;
