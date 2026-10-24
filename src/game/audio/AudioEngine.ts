/**
 * Procedural Audio Engine for "The World That Moves"
 * Generates dynamic music chords, wind, rain, footsteps, companion chirps,
 * combat sounds, and tectonic earthquake rumbles using Web Audio API.
 * Optimized with automatic node disconnection to prevent Web Audio graph memory leaks and audio thread lag.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  
  private ambientTimer: number | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.startAmbientMusicLoop();
    } catch {
      // AudioContext may be blocked until user gesture
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public setVolume(sfx: number, music: number) {
    if (this.ctx) {
      if (this.sfxGain) this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
      if (this.musicGain) this.musicGain.gain.setValueAtTime(music, this.ctx.currentTime);
    }
  }

  /**
   * Helper that connects nodes and guarantees immediate disconnection
   * when the sound stops. This completely eliminates node accumulation in the Web Audio graph.
   */
  private connectAndSchedule(osc: OscillatorNode, gain: GainNode, targetGain: GainNode, startTime: number, stopTime: number) {
    osc.connect(gain);
    gain.connect(targetGain);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Safe ignore
      }
    };

    osc.start(startTime);
    osc.stop(stopTime);
  }

  // Atmospheric background chord progression (Mysterious Pentatonic)
  private startAmbientMusicLoop() {
    const chords = [
      [220.0, 261.63, 329.63, 493.88], // Am9
      [174.61, 220.0, 261.63, 392.0],  // Fmaj7
      [196.0, 246.94, 293.66, 440.0],  // Gsus2
      [164.81, 196.0, 246.94, 329.63]  // Em
    ];
    let step = 0;

    const playNextChord = () => {
      if (!this.ctx || this.isMuted || !this.musicGain) {
        this.ambientTimer = window.setTimeout(playNextChord, 6000);
        return;
      }
      const notes = chords[step % chords.length];
      const now = this.ctx.currentTime;
      const duration = 6.0;

      notes.forEach((freq, i) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const noteVol = 0.035 * (1 / (i + 1));
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(noteVol, now + 1.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        this.connectAndSchedule(osc, gain, this.musicGain, now, now + duration + 0.1);
      });

      step++;
      this.ambientTimer = window.setTimeout(playNextChord, 6000);
    };

    playNextChord();
  }

  // Jump swoosh
  public playJump() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.14);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    this.connectAndSchedule(osc, gain, this.sfxGain, now, now + 0.15);
  }

  // Footstep rustle
  public playFootstep(isWater: boolean = false) {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isWater ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(isWater ? 240 : 80, now);
    osc.frequency.exponentialRampToValueAtTime(isWater ? 140 : 40, now + 0.07);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    this.connectAndSchedule(osc, gain, this.sfxGain, now, now + 0.08);
  }

  // Staff Attack Swing (light weapon arc)
  public playAttackSwing() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    this.connectAndSchedule(osc, gain, this.sfxGain, now, now + 0.16);
  }

  // Hit Impact
  public playHitImpact() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    this.connectAndSchedule(osc, gain, this.sfxGain, now, now + 0.19);
  }

  // Dodge Roll Dash
  public playDodge() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.22);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    this.connectAndSchedule(osc, gain, this.sfxGain, now, now + 0.23);
  }

  // Companion Kip Chirp
  public playCompanionChirp(excited: boolean = false) {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    if (excited) {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
    } else {
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(960, now + 0.12);
    }

    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    this.connectAndSchedule(osc, gain, this.sfxGain, now, now + 0.2);
  }

  // Ancient Discovery / Rune Chime
  public playDiscoveryChime() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      this.connectAndSchedule(osc, gain, this.sfxGain, now, now + 0.6);
    });
  }

  // Tectonic Tremor / The World Shifting Sound
  public playWorldTremor() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.linearRampToValueAtTime(35, now + 1.8);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    this.connectAndSchedule(osc, gain, this.sfxGain, now, now + 2.1);
  }

  // Glider deploy whoosh
  public playGliderOpen() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.28);

    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    this.connectAndSchedule(osc, gain, this.sfxGain, now, now + 0.31);
  }
}

export const soundEngine = new AudioEngine();
