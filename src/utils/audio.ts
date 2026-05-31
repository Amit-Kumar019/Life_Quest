class RetroSynth {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playTone(freq: number, type: OscillatorType, duration: number, startTime: number, volume: number = 0.1) {
    const ctx = this.init();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gainNode.gain.setValueAtTime(volume, startTime);
    // Exponential ramp to zero to prevent cracking/popping sounds
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  playQuestComplete() {
    const now = this.init()?.currentTime || 0;
    const tempo = 0.08;
    // Cheerful ascending C major triad
    this.playTone(523.25, 'square', 0.12, now, 0.08); // C5
    this.playTone(659.25, 'square', 0.12, now + tempo, 0.08); // E5
    this.playTone(783.99, 'square', 0.12, now + tempo * 2, 0.08); // G5
    this.playTone(1046.50, 'square', 0.25, now + tempo * 3, 0.08); // C6
  }

  playLevelUp() {
    const now = this.init()?.currentTime || 0;
    const tempo = 0.1;
    // Triumphant arpeggio
    this.playTone(261.63, 'sawtooth', 0.15, now, 0.06); // C4
    this.playTone(329.63, 'sawtooth', 0.15, now + tempo, 0.06); // E4
    this.playTone(392.00, 'sawtooth', 0.15, now + tempo * 2, 0.06); // G4
    this.playTone(523.25, 'sawtooth', 0.15, now + tempo * 3, 0.06); // C5
    this.playTone(659.25, 'sawtooth', 0.15, now + tempo * 4, 0.06); // E5
    this.playTone(783.99, 'sawtooth', 0.15, now + tempo * 5, 0.06); // G5
    this.playTone(1046.50, 'sawtooth', 0.4, now + tempo * 6, 0.08); // C6
  }

  playTimerEnd() {
    const now = this.init()?.currentTime || 0;
    // Retro repeating chime
    for (let i = 0; i < 3; i++) {
      const time = now + i * 0.4;
      this.playTone(880, 'triangle', 0.15, time, 0.12); // A5
      this.playTone(587.33, 'triangle', 0.15, time + 0.15, 0.12); // D5
    }
  }

  playShieldBuy() {
    const now = this.init()?.currentTime || 0;
    const tempo = 0.05;
    // Shimmering spell/shield sound
    for (let i = 0; i < 8; i++) {
      const freq = 440 + i * 120;
      this.playTone(freq, 'sine', 0.15, now + i * tempo, 0.06);
    }
  }

  playError() {
    const now = this.init()?.currentTime || 0;
    this.playTone(220, 'sawtooth', 0.15, now, 0.08);
    this.playTone(180, 'sawtooth', 0.25, now + 0.1, 0.08);
  }
}

export const retroAudio = new RetroSynth();
