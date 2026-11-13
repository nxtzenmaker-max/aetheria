/**
 * AETHERIA // Procedural Web Audio API Sound Synthesizer
 * Zero-asset audio engine for interface feedback and ambient soundscapes.
 */

class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('aetheria_muted') === 'true';
    this.ambientGain = null;
    this.masterGain = null;
    this.isAmbientPlaying = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.initContext();
    this.isMuted = !this.isMuted;
    localStorage.setItem('aetheria_muted', this.isMuted);

    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
    }

    return !this.isMuted;
  }

  // Soft futuristic UI hover chirp
  playHover() {
    if (this.isMuted) return;
    this.initContext();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Futuristic click trigger
  playClick() {
    if (this.isMuted) return;
    this.initContext();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  // Cyber soundboard note trigger
  playNote(frequency = 440, type = 'sine') {
    if (this.isMuted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Subtle lowpass filter for warmth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    // Warm envelope (attack & decay)
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Success celebration chord
  playSuccess() {
    if (this.isMuted) return;
    this.initContext();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 Major chord
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playNote(freq, 'triangle');
      }, idx * 75);
    });
  }

  // Ambient background synth drone toggle
  toggleAmbientDrone() {
    this.initContext();

    if (this.isAmbientPlaying) {
      if (this.ambientGain) {
        this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      }
      this.isAmbientPlaying = false;
      return false;
    } else {
      const now = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.05, now + 1.5);

      // Low drone osc 1
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(65.41, now); // C2

      // Low drone osc 2 (detuned)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(98.0, now); // G2

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);

      this.isAmbientPlaying = true;
      return true;
    }
  }
}

window.audioSynthesizer = new AudioSynthesizer();
