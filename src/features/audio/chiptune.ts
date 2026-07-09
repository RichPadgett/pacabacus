/**
 * 8-bit orchestral chiptune engine — everything synthesized with Web Audio,
 * no audio files. Original composition in the spirit of Game Boy-era
 * marching-band tunes: two pulse-wave voices, triangle bass, noise drums.
 */

type SfxName = 'correct' | 'wrong' | 'eat' | 'caught' | 'fanfare' | 'challenge'

const NOTE_OFFSETS: Record<string, number> = {
  C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11,
}

function noteFreq(note: string): number {
  // e.g. "C5", "F#4"
  const name = note.slice(0, -1)
  const octave = Number(note.slice(-1))
  const midi = 12 * (octave + 1) + NOTE_OFFSETS[name]
  return 440 * 2 ** ((midi - 69) / 12)
}

/** '.' = rest, '-' = hold previous note. One token per 8th-note step. */
const parse = (pattern: string) => pattern.trim().split(/\s+/)

// ---- the tune: 8 bars, 8 eighth-note steps per bar, loops forever ----
// bright 2/4 march in C: I vi IV V | IV I V I
const MELODY = parse(`
  E5 .  G5 .  C6 .  G5 E5  A5 .  G5 .  E5 .  C5 .
  D5 .  E5 .  F5 .  A5 F5  G5 -  -  .  E5 .  C5 .
  F5 .  A5 .  C6 .  A5 F5  E5 .  G5 .  C6 -  -  .
  D6 .  C6 .  B5 .  G5 B5  C6 -  -  .  .  .  G4 .
`)
const HARMONY = parse(`
  C5 .  E5 .  E5 .  E5 C5  E5 .  E5 .  C5 .  A4 .
  B4 .  C5 .  D5 .  F5 D5  D5 -  -  .  C5 .  A4 .
  D5 .  F5 .  A5 .  F5 D5  C5 .  E5 .  G5 -  -  .
  B5 .  A5 .  G5 .  F5 G5  E5 -  -  .  .  .  E4 .
`)
const BASS = parse(`
  C3 .  G3 .  C3 .  G3 .  A2 .  E3 .  A2 .  E3 .
  F2 .  C3 .  F2 .  C3 .  G2 .  D3 .  G2 .  B2 .
  F2 .  C3 .  F2 .  C3 .  C3 .  G3 .  C3 .  G3 .
  G2 .  D3 .  G2 .  D3 .  C3 .  G3 .  E3 .  C3 .
`)
// k = kick, s = snare, h = hat
const DRUMS = parse(`
  k h s h k h s h  k h s h k h s h  k h s h k h s h  k h s h k h s h
  k h s h k h s h  k h s h k h s h  k h s h k h s h  k h s h k s s s
`)

const STEP_SEC = 60 / 168 / 2 // 168 bpm, 8th notes
const LOOKAHEAD_SEC = 0.12
const TICK_MS = 30

class Chiptune {
  private ctx: AudioContext | null = null
  private musicGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private timer: number | null = null
  private step = 0
  private nextTime = 0
  playing = false

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      const master = this.ctx.createGain()
      master.gain.value = 0.5
      master.connect(this.ctx.destination)
      this.musicGain = this.ctx.createGain()
      this.musicGain.gain.value = 0.32
      this.musicGain.connect(master)
      this.sfxGain = this.ctx.createGain()
      this.sfxGain.gain.value = 0.8
      this.sfxGain.connect(master)
    }
    return this.ctx
  }

  private tone(
    dest: AudioNode,
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType,
    vol: number,
  ) {
    const ctx = this.ensureCtx()
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(vol, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur)
    osc.connect(gain)
    gain.connect(dest)
    osc.start(start)
    osc.stop(start + dur + 0.02)
  }

  private noise(dest: AudioNode, start: number, dur: number, vol: number, high = false) {
    const ctx = this.ensureCtx()
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur))
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = high ? 'highpass' : 'bandpass'
    filter.frequency.value = high ? 6000 : 1800
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(vol, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur)
    src.connect(filter)
    filter.connect(gain)
    gain.connect(dest)
    src.start(start)
  }

  /** length in steps of a note starting at index i (counts '-' holds) */
  private holdLength(track: string[], i: number): number {
    let len = 1
    while (track[(i + len) % track.length] === '-' && len < 8) len++
    return len
  }

  private scheduleStep(step: number, time: number) {
    const music = this.musicGain!
    const mel = MELODY[step % MELODY.length]
    if (mel !== '.' && mel !== '-') {
      const len = this.holdLength(MELODY, step % MELODY.length)
      this.tone(music, noteFreq(mel), time, STEP_SEC * len * 0.9, 'square', 0.5)
    }
    const har = HARMONY[step % HARMONY.length]
    if (har !== '.' && har !== '-') {
      const len = this.holdLength(HARMONY, step % HARMONY.length)
      this.tone(music, noteFreq(har), time, STEP_SEC * len * 0.85, 'square', 0.22)
    }
    const bass = BASS[step % BASS.length]
    if (bass !== '.' && bass !== '-') {
      this.tone(music, noteFreq(bass), time, STEP_SEC * 0.9, 'triangle', 0.75)
    }
    const drum = DRUMS[step % DRUMS.length]
    if (drum === 'k') this.tone(music, 70, time, 0.09, 'square', 0.5)
    if (drum === 's') this.noise(music, time, 0.08, 0.45)
    if (drum === 'h') this.noise(music, time, 0.03, 0.15, true)
  }

  startMusic() {
    const ctx = this.ensureCtx()
    void ctx.resume()
    if (this.playing) return
    this.playing = true
    this.step = 0
    this.nextTime = ctx.currentTime + 0.06
    this.timer = window.setInterval(() => {
      while (this.nextTime < ctx.currentTime + LOOKAHEAD_SEC) {
        this.scheduleStep(this.step, this.nextTime)
        this.step++
        this.nextTime += STEP_SEC
      }
    }, TICK_MS)
  }

  stopMusic() {
    this.playing = false
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  sfx(name: SfxName) {
    const ctx = this.ensureCtx()
    void ctx.resume()
    const dest = this.sfxGain!
    const t = ctx.currentTime + 0.01
    const q = 0.07
    switch (name) {
      case 'correct':
        ;['C5', 'E5', 'G5', 'C6'].forEach((n, i) =>
          this.tone(dest, noteFreq(n), t + i * q, q * 1.4, 'square', 0.4),
        )
        break
      case 'challenge':
        ;['C5', 'E5', 'G5', 'C6', 'E6', 'G6'].forEach((n, i) =>
          this.tone(dest, noteFreq(n), t + i * q * 0.8, q * 1.4, 'square', 0.4),
        )
        break
      case 'wrong':
        this.tone(dest, noteFreq('E3'), t, 0.16, 'square', 0.35)
        this.tone(dest, noteFreq('C3'), t + 0.14, 0.24, 'square', 0.35)
        break
      case 'eat':
        this.tone(dest, 900, t, 0.04, 'square', 0.18)
        break
      case 'caught': {
        // sad downward slide
        const osc = ctx.createOscillator()
        osc.type = 'square'
        osc.frequency.setValueAtTime(600, t)
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.5)
        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.35, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
        osc.connect(gain)
        gain.connect(dest)
        osc.start(t)
        osc.stop(t + 0.6)
        break
      }
      case 'fanfare':
        ;['G5', 'G5', 'G5', 'C6', 'E6', 'G6', 'E6', 'G6'].forEach((n, i) =>
          this.tone(dest, noteFreq(n), t + i * 0.09, 0.14, 'square', 0.4),
        )
        ;['C3', 'G3', 'C4', 'E4'].forEach((n, i) =>
          this.tone(dest, noteFreq(n), t + i * 0.18, 0.22, 'triangle', 0.6),
        )
        break
    }
  }
}

export const chiptune = new Chiptune()
