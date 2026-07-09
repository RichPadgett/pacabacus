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

// =====================================================================
// THE SCORE — 32 bars in C major, real song form that develops:
//   A  (8 bars)  main theme: bouncy rising arpeggios, call & answer
//   A' (8 bars)  theme again, but the back half climbs to a high peak
//   B  (8 bars)  lyrical minor-key section, long singing notes,
//                with a D7 secondary dominant for that classic lift
//   Br (4 bars)  quiet breakdown — sparse echoes, then a rising run
//   O  (4 bars)  fanfare turnaround that resolves back into A
// One token per 8th note, 8 tokens per bar.
// =====================================================================

const MEL_A = `
  C5 -  E5 -  G5 -  E5 C5   A5 -  G5 -  E5 -  C5 .
  F5 -  A5 -  C6 -  A5 F5   G5 -  B5 -  D6 -  B5 G5
  E5 -  G5 -  C6 -  G5 E5   A5 G5 A5 C6  A5 -  E5 .
  D5 -  F5 -  A5 -  F5 D5   G5 F5 E5 D5  G4 -  -  .
`
const MEL_A2 = `
  C5 -  E5 -  G5 -  E5 C5   A5 -  G5 -  E5 -  C5 .
  F5 -  A5 -  C6 -  A5 F5   G5 -  B5 -  D6 -  B5 G5
  E5 -  G5 -  C6 -  E6 -    D6 C6 B5 A5  G5 -  E5 .
  F5 A5 C6 A5  D6 -  B5 .   C6 -  -  .   G5 .  E5 .
`
const MEL_B = `
  E5 -  -  A5  -  -  C6 -   B5 -  -  G5  -  -  E5 -
  A5 -  -  C6  -  -  F6 -   E6 -  D6 -   C6 -  G5 -
  F5 -  A5 -   D6 -  C6 A5  E5 -  A5 -   C6 -  B5 A5
  F#5 - A5 -   D6 -  C6 -   B5 A5 G5 -   D5 -  B4 -
`
const MEL_BR = `
  C5 .  .  G5  .  .  E5 .   D5 .  .  A5  .  .  F5 .
  E5 .  .  B5  .  .  G5 .   C6 D6 E6 F6  G6 -  -  -
`
const MEL_O = `
  A5 -  F5 -   C6 -  A5 -   B5 -  G5 -   D6 -  B5 -
  C6 -  G5 E5  A5 -  G5 E5  D5 E5 F5 G5  B5 -  -  .
`

// off-beat "oom-pah" comping in A/outro, long held thirds in B
const HAR_A = `
  .  E4 .  G4  .  E4 .  G4  .  E4 .  A4  .  E4 .  A4
  .  F4 .  A4  .  F4 .  A4  .  G4 .  B4  .  G4 .  B4
  .  E4 .  G4  .  E4 .  G4  .  E4 .  A4  .  E4 .  A4
  .  F4 .  A4  .  F4 .  A4  .  G4 .  B4  .  D4 .  G4
`
const HAR_A2 = `
  .  E4 .  G4  .  E4 .  G4  .  E4 .  A4  .  E4 .  A4
  .  F4 .  A4  .  F4 .  A4  .  G4 .  B4  .  G4 .  B4
  .  E4 .  G4  .  E4 .  G4  .  G4 .  B4  .  G4 .  B4
  .  F4 .  A4  .  G4 .  B4  .  E4 .  G4  .  E4 .  G4
`
const HAR_B = `
  C5 -  -  -   -  -  -  -   G4 -  -  -   -  -  -  -
  A4 -  -  -   -  -  -  -   G4 -  -  -   -  -  -  -
  F4 -  -  -   -  -  -  -   C5 -  -  -   -  -  -  -
  F#4 - -  -   -  -  -  -   B4 -  -  -   -  -  -  -
`
const HAR_BR = `
  .  .  .  .   .  .  .  .   .  .  .  .   .  .  .  .
  .  .  .  .   .  .  .  .   E5 F5 G5 A5  B5 -  -  -
`
const HAR_O = `
  .  F4 .  A4  .  F4 .  A4  .  G4 .  B4  .  G4 .  B4
  .  E4 .  G4  .  E4 .  A4  .  F4 .  G4  .  B4 .  .
`

// root–fifth march bass with walkups; half-note feel under B
const BASS_A = `
  C3 .  G3 .   C3 .  G3 .   A2 .  E3 .   A2 .  E3 .
  F2 .  C3 .   F2 .  C3 .   G2 .  D3 .   G2 .  D3 .
  C3 .  G3 .   C3 .  G3 .   A2 .  E3 .   A2 .  E3 .
  D3 .  A3 .   D3 .  A3 .   G2 .  D3 .   G2 A2 B2 .
`
const BASS_A2 = `
  C3 .  G3 .   C3 .  G3 .   A2 .  E3 .   A2 .  E3 .
  F2 .  C3 .   F2 .  C3 .   G2 .  D3 .   G2 .  D3 .
  C3 .  G3 .   C3 .  G3 .   G2 .  D3 .   G2 .  D3 .
  F2 .  C3 .   G2 .  D3 .   C3 .  G3 .   C3 .  E3 .
`
const BASS_B = `
  A2 -  -  -   E3 -  -  -   E2 -  -  -   B2 -  -  -
  F2 -  -  -   C3 -  -  -   C3 -  -  -   G3 -  -  -
  D3 -  -  -   A3 -  -  -   A2 -  -  -   E3 -  -  -
  D3 -  -  -   F#3 - -  -   G2 -  A2 -   B2 -  D3 -
`
const BASS_BR = `
  C3 .  .  C3  .  .  C3 .   D3 .  .  D3  .  .  D3 .
  E3 .  .  E3  .  .  E3 .   F3 .  G3 .   A3 .  B3 .
`
const BASS_O = `
  F2 .  C3 .   F2 .  C3 .   G2 .  D3 .   G2 .  D3 .
  C3 .  G3 .   A2 .  E3 .   G2 .  G2 .   B2 .  D3 .
`

// k = kick, s = snare, h = hat, c = crash; fills close each phrase
const DR_A = `
  k h s h k h s h   k h s h k h s h   k h s h k h s h   k h s h k s s s
  k h s h k h s h   k h s h k h s h   k h s h k h s h   k h s h s s s s
`
const DR_A2 = DR_A
const DR_B = `
  k h h h s h h h   k h h h s h h h   k h h h s h h h   k h h h s h h h
  k h h h s h h h   k h h h s h h h   k h h h s h h h   k h s h s h s s
`
const DR_BR = `
  h . h . h . h .   h . h . h . h .   h . h . h . h .   s s s s s s s s
`
const DR_O = `
  c h s h k h s h   k h s h k h s h   k h s h k h s h   k h s h s s s s
`

interface Song {
  name: string
  bpm: number
  melody: string[]
  harmony: string[]
  bass: string[]
  drums: string[]
  leadWave?: OscillatorType
  harmonyWave?: OscillatorType
  bassWave?: OscillatorType
  leadVol?: number
  harmonyVol?: number
  bassVol?: number
  swing?: number
}

const SONG_MARCH: Song = {
  name: 'March of the Beads',
  bpm: 168,
  melody: parse(MEL_A + MEL_A2 + MEL_B + MEL_BR + MEL_O),
  harmony: parse(HAR_A + HAR_A2 + HAR_B + HAR_BR + HAR_O),
  bass: parse(BASS_A + BASS_A2 + BASS_B + BASS_BR + BASS_O),
  drums: parse(DR_A + DR_A2 + DR_B + DR_BR + DR_O),
}

// ---- Song 2: a gentle waltz in G (oom-pah-pah, 6 steps per bar) ----
// G Em C D | G Em Am D | G G7 C Cm | G D G —
// the borrowed C-minor bar is the wistful moment that makes it stick
const SONG_WALTZ: Song = {
  name: 'Waltz of Little Stars',
  bpm: 152,
  melody: parse(`
    B4 -  D5 -  G5 -    E5 -  -  D5 B4 -    C5 -  E5 -  G5 -    F#5 -  -  E5 D5 -
    B4 -  D5 -  G5 -    E5 -  G5 -  B5 -    A5 -  -  G5 E5 -    F#5 -  A5 -  D5 -
    G5 -  B5 -  D6 -    F5 -  -  D5 B4 -    E5 -  G5 -  C6 -    D#5 -  -  C5 G4 -
    D5 -  B4 -  G4 -    A4 -  C5 -  F#5 -   G5 -  D5 -  B4 -    G4 -  -  -  .  .
  `),
  harmony: parse(`
    .  .  B3 .  D4 .    .  .  G3 .  B3 .    .  .  E4 .  G4 .    .  .  F#4 .  A4 .
    .  .  B3 .  D4 .    .  .  G3 .  B3 .    .  .  C4 .  E4 .    .  .  F#4 .  A4 .
    .  .  B3 .  D4 .    .  .  B3 .  F4 .    .  .  E4 .  G4 .    .  .  D#4 .  G4 .
    .  .  B3 .  D4 .    .  .  F#4 .  A4 .   .  .  B3 .  D4 .    .  .  B3 .  D4 .
  `),
  bass: parse(`
    G2 -  .  .  .  .    E2 -  .  .  .  .    C3 -  .  .  .  .    D3 -  .  .  .  .
    G2 -  .  .  .  .    E2 -  .  .  .  .    A2 -  .  .  .  .    D3 -  .  .  .  .
    G2 -  .  .  .  .    G2 -  .  .  .  .    C3 -  .  .  .  .    C3 -  .  .  .  .
    G2 -  .  .  .  .    D3 -  .  .  .  .    G2 -  .  .  .  .    G2 -  D3 -  G2 -
  `),
  drums: parse(`
    k . h . h .    k . h . h .    k . h . h .    k . h . h .
    k . h . h .    k . h . h .    k . h . h .    k . s . s .
    k . h . h .    k . h . h .    k . h . h .    k . h . h .
    k . h . h .    k . h . h .    k . h . h .    k . s . s .
  `),
}

// ---- Song 3: a playful minor-key chase in Am (harmonic-minor sparkle) ----
const SONG_CHASE: Song = {
  name: 'Baddie Boogie',
  bpm: 176,
  melody: parse(`
    A4 A4 .  A4 C5 .  A4 .    E5 .  D5 .  C5 .  B4 .    F5 .  E5 .  D5 .  C5 .    E5 .  B4 .  E5 .  G#5 .
    A5 A5 .  A5 G5 .  E5 .    A4 C5 E5 A5 G5 .  E5 .    D5 .  F5 .  A5 .  F5 .    E5 .  G#5 .  B5 .  E5 .
    A5 .  G5 .  F5 .  E5 .    G5 .  F5 .  E5 .  D5 .    F5 .  E5 .  D5 .  C5 .    E5 -  -  .  G#4 .  B4 .
    A4 .  E5 .  A4 .  E5 .    G#4 .  E5 .  G#4 .  B4 .   A4 C5 E5 G5 A5 .  E5 .    A4 .  .  .  E4 .  .  .
  `),
  harmony: parse(`
    .  E4 .  A4 .  E4 .  A4   .  E4 .  A4 .  E4 .  A4   .  F4 .  A4 .  F4 .  A4   .  E4 .  G#4 .  E4 .  G#4
    .  E4 .  A4 .  E4 .  A4   .  E4 .  A4 .  E4 .  A4   .  F4 .  A4 .  F4 .  A4   .  E4 .  G#4 .  E4 .  G#4
    .  E4 .  A4 .  E4 .  A4   .  G4 .  B4 .  G4 .  B4   .  F4 .  A4 .  F4 .  A4   .  E4 .  G#4 .  E4 .  G#4
    .  E4 .  A4 .  E4 .  A4   .  E4 .  G#4 .  E4 .  G#4  .  E4 .  A4 .  E4 .  A4   .  E4 .  A4 .  .  .  .
  `),
  bass: parse(`
    A2 .  A2 .  E3 .  A2 .    A2 .  A2 .  E3 .  A2 .    F2 .  F2 .  C3 .  F2 .    E2 .  E2 .  B2 .  E2 .
    A2 .  A2 .  E3 .  A2 .    A2 .  A2 .  E3 .  A2 .    D3 .  D3 .  A3 .  D3 .    E2 .  E2 .  B2 .  E2 .
    A2 .  A2 .  E3 .  A2 .    G2 .  G2 .  D3 .  G2 .    F2 .  F2 .  C3 .  F2 .    E2 .  E2 .  B2 .  E2 .
    A2 .  A2 .  E3 .  A2 .    E2 .  E2 .  B2 .  E2 .    A2 .  A2 .  E3 .  A2 .    A2 .  E2 .  A2 .  .  .
  `),
  drums: parse(`
    k h s h k h s h    k h s h k h s h    k h s h k h s h    k h s h k s s s
    k h s h k h s h    k h s h k h s h    k h s h k h s h    k h s h k s s s
    k h s h k h s h    k h s h k h s h    k h s h k h s h    k h s h k s s s
    k h s h k h s h    k h s h k h s h    k h s h k h s h    k h s h s s s s
  `),
}

// ---- Song 4: a woody forest two-step with more rests and a plucky bass ----
const SONG_FOREST: Song = {
  name: 'Mossy Two-Step',
  bpm: 132,
  leadWave: 'triangle',
  harmonyWave: 'square',
  bassWave: 'triangle',
  leadVol: 0.62,
  harmonyVol: 0.16,
  bassVol: 0.68,
  swing: 0.18,
  melody: parse(`
    E5 .  G5 E5  D5 .  C5 .    G4 .  C5 D5  E5 -  .  .
    A4 .  C5 A4  G4 .  E4 .    D5 .  E5 G5  C5 -  .  .
    E5 G5 A5 .   G5 E5 D5 .    C5 .  E5 G5  A5 -  .  .
    G5 .  E5 C5  D5 .  G4 .    C5 -  .  .   G4 .  C5 .
  `),
  harmony: parse(`
    .  C4 .  E4  .  C4 .  E4   .  G3 .  C4  .  G3 .  C4
    .  F4 .  A4  .  F4 .  A4   .  G4 .  B4  .  G4 .  B4
    .  C4 .  E4  .  C4 .  E4   .  F4 .  A4  .  F4 .  A4
    .  G4 .  B4  .  G4 .  B4   .  C4 .  E4  .  C4 .  E4
  `),
  bass: parse(`
    C3 .  .  G2  C3 .  .  G2   C3 .  .  G2  C3 .  .  G2
    F2 .  .  C3  F2 .  .  C3   G2 .  .  D3  G2 .  .  D3
    C3 .  .  G2  C3 .  .  G2   F2 .  .  C3  F2 .  .  C3
    G2 .  .  D3  G2 .  .  D3   C3 .  G2 .   C3 .  .  .
  `),
  drums: parse(`
    k . h s . h k .    k . h s . h k .    k . h s . h k .    k . h s s h s .
    k . h s . h k .    k . h s . h k .    k . h s . h k .    k . h s s s s .
  `),
}

// ---- Song 5: a warm castle/sunset tune with a slower heroic feel ----
const SONG_CASTLE: Song = {
  name: 'Sunset Castle Parade',
  bpm: 118,
  leadWave: 'sawtooth',
  harmonyWave: 'triangle',
  bassWave: 'triangle',
  leadVol: 0.36,
  harmonyVol: 0.22,
  bassVol: 0.78,
  melody: parse(`
    C5 -  G4 -  A4 -  E4 -    F4 -  C5 -  B4 -  G4 -
    E5 -  C5 -  D5 -  B4 -    C5 -  -  .  G4 .  C5 .
    A4 -  E5 -  D5 -  C5 -    B4 -  G5 -  F5 -  D5 -
    E5 -  G5 -  C6 -  B5 -    C6 -  -  .  G5 .  E5 .
  `),
  harmony: parse(`
    C4 -  -  -   E4 -  -  -   F4 -  -  -   G4 -  -  -
    C4 -  -  -   E4 -  -  -   G4 -  -  -   C5 -  -  -
    A3 -  -  -   C4 -  -  -   G3 -  -  -   B3 -  -  -
    C4 -  -  -   E4 -  -  -   G4 -  -  -   C5 -  -  -
  `),
  bass: parse(`
    C2 .  C3 .   G2 .  G3 .   F2 .  F3 .   G2 .  G3 .
    C2 .  C3 .   A2 .  A3 .   G2 .  G3 .   C3 .  G2 .
    A2 .  A3 .   F2 .  F3 .   G2 .  G3 .   G2 .  D3 .
    C2 .  G2 .   E3 .  G3 .   C3 .  G2 .   C3 .  .  .
  `),
  drums: parse(`
    k . . h s . h .    k . . h s . h .    k . . h s . h .    k . s . c . s .
    k . . h s . h .    k . . h s . h .    k . . h s . h .    c . s . k s s .
  `),
}

export const SONGS: Song[] = [SONG_MARCH, SONG_WALTZ, SONG_CHASE, SONG_FOREST, SONG_CASTLE]

const LOOKAHEAD_SEC = 0.12
const TICK_MS = 30

class Chiptune {
  private ctx: AudioContext | null = null
  private musicGain: GainNode | null = null
  private echo: DelayNode | null = null
  private sfxGain: GainNode | null = null
  private timer: number | null = null
  private step = 0
  private nextTime = 0
  private song: Song = SONGS[0]
  playing = false

  private get stepSec(): number {
    return 60 / this.song.bpm / 2 // 8th notes
  }

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      const master = this.ctx.createGain()
      master.gain.value = 0.5
      master.connect(this.ctx.destination)
      this.musicGain = this.ctx.createGain()
      this.musicGain.gain.value = 0.32
      this.musicGain.connect(master)
      // a touch of echo makes the little square waves feel orchestral
      this.echo = this.ctx.createDelay()
      this.echo.delayTime.value = 0.22
      const echoGain = this.ctx.createGain()
      echoGain.gain.value = 0.22
      this.musicGain.connect(this.echo)
      this.echo.connect(echoGain)
      echoGain.connect(master)
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
    const { melody, harmony, bass, drums } = this.song
    const stepSec = this.stepSec
    const swingDelay = this.song.swing && step % 2 === 1 ? stepSec * this.song.swing : 0
    const noteTime = time + swingDelay
    const mel = melody[step % melody.length]
    if (mel !== '.' && mel !== '-') {
      const len = this.holdLength(melody, step % melody.length)
      this.tone(
        music,
        noteFreq(mel),
        noteTime,
        stepSec * len * 0.9,
        this.song.leadWave ?? 'square',
        this.song.leadVol ?? 0.5,
      )
    }
    const har = harmony[step % harmony.length]
    if (har !== '.' && har !== '-') {
      const len = this.holdLength(harmony, step % harmony.length)
      this.tone(
        music,
        noteFreq(har),
        noteTime,
        stepSec * len * 0.85,
        this.song.harmonyWave ?? 'square',
        this.song.harmonyVol ?? 0.22,
      )
    }
    const bs = bass[step % bass.length]
    if (bs !== '.' && bs !== '-') {
      const len = this.holdLength(bass, step % bass.length)
      this.tone(
        music,
        noteFreq(bs),
        noteTime,
        stepSec * len * 0.9,
        this.song.bassWave ?? 'triangle',
        this.song.bassVol ?? 0.75,
      )
    }
    const drum = drums[step % drums.length]
    if (drum === 'k') this.tone(music, 70, time, 0.09, 'square', 0.5)
    if (drum === 's') this.noise(music, time, 0.08, 0.45)
    if (drum === 'h') this.noise(music, time, 0.03, 0.15, true)
    if (drum === 'c') this.noise(music, time, 0.35, 0.4)
  }

  /** Play the song for a given level (songs cycle). Restarts if it changed. */
  playSong(index: number) {
    const next = SONGS[((index % SONGS.length) + SONGS.length) % SONGS.length]
    if (this.playing && next === this.song) return
    this.stopMusic()
    this.song = next
    this.startMusic()
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
        this.nextTime += this.stepSec
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
