/**
 * 8-bit orchestral chiptune engine — everything synthesized with Web Audio,
 * no audio files. Original composition in the spirit of Game Boy-era
 * marching-band tunes: two pulse-wave voices, triangle bass, noise drums.
 */

import { SCOREBOOK_PATTERNS } from './scorebookPatterns'

type SfxName = 'correct' | 'wrong' | 'eat' | 'caught' | 'fanfare' | 'challenge'

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
}

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

const DANCE_LEAD_D = `
  .  F#5 A5 .  B5 A5 F#5 .   E5 .  F#5 A5 .  E5 D5 .
  .  F#5 A5 .  B5 C#6 B5 A5  F#5 . E5 D5 .  A4 D5 .
  .  G5 B5 .  A5 G5 E5 .     F#5 . A5 D6 .  C#6 A5 .
  B5 .  A5 F#5 E5 .  D5 .    E5 F#5 G5 A5 C#6 . A5 .

  .  F#5 A5 .  D6 C#6 A5 .   B5 .  A5 F#5 .  E5 D5 .
  .  E5 F#5 A5 B5 .  C#6 .   D6 .  A5 F#5 E5 . D5 .
  .  G5 B5 .  D6 B5 A5 .     F#5 . A5 C#6 .  A5 F#5 .
  E5 .  G5 B5 .  A5 G5 .     F#5 E5 D5 .  A4 . D5 .
`

const DANCE_COUNTER_D = `
  D5 .  .  A4  .  D5 .  F#5   B4 .  .  F#4 .  B4 .  D5
  G4 .  .  D5  .  G5 .  B4    A4 .  E5 .  A5 .  E5 .
  F#4 . A4 .  D5 . A4 .       E4 .  G4 .  B4 .  G4 .
  G4 .  B4 .  D5 . B4 .       A4 .  C#5 . E5 .  C#5 .

  D5 .  A4 .  F#4 . A4 .      B4 .  F#4 . D4 .  F#4 .
  G4 .  D5 .  B4 .  D5 .      A4 .  E5 .  C#5 . E5 .
  F#5 . D5 .  A4 .  F#4 .     E5 .  C#5 . A4 .  E4 .
  G4 B4 D5 .  A4 C#5 E5 .     D5 .  A4 .  D4 .  .  .
`

const DANCE_HARMONY_D = `
  .  D4 .  F#4 .  A4 .  F#4   .  B3 .  D4  .  F#4 .  D4
  .  G3 .  B3  .  D4 .  B3    .  A3 .  C#4 .  E4 .  C#4
  .  D4 .  F#4 .  A4 .  F#4   .  E4 .  G4  .  B4 .  G4
  .  G3 .  B3  .  D4 .  B3    .  A3 .  C#4 .  E4 .  C#4

  .  D4 .  F#4 .  A4 .  F#4   .  B3 .  D4  .  F#4 .  D4
  .  G3 .  B3  .  D4 .  B3    .  A3 .  C#4 .  E4 .  C#4
  .  F#4 . A4  .  D5 .  A4    .  E4 .  G4  .  B4 .  G4
  .  G3 .  B3  .  D4 .  B3    .  A3 .  C#4 .  E4 .  C#4
`

const DANCE_BASS_D = `
  D2 .  A2 D3  .  F#3 A2 .    B1 .  F#2 B2 .  D3 F#2 .
  G2 .  D3 G2  .  B2 D3 .     A1 .  E2 A2  .  C#3 E3 .
  D2 .  A2 D3  F#3 . A2 .     E2 .  B2 E3  .  G3 B2 .
  G2 .  D3 G2  B2 .  D3 .     A1 .  E2 A2  C#3 E3 A2 .

  D2 .  A2 D3  .  F#3 A2 .    B1 .  F#2 B2 .  D3 F#2 .
  G2 .  D3 G2  .  B2 D3 .     A1 .  E2 A2  C#3 . E3 .
  F#2 . C#3 F#2 A2 . C#3 .    E2 .  B2 E3  G3 .  B2 .
  G2 .  D3 G2  B2 .  D3 .     A1 .  E2 A2  .  .  A2 .
`

const DANCE_DRUMS = `
  kh h ks h kh h kso h   kh h ks h kh h kso h
  kh h ks h kh h kso h   kh h ks h kh h kso h
  kh h ks h kh h kso h   kh h ks h kh h kso h
  kh h ks h kh h kso h   kh h ks h kh s kso h

  ch h ks h kh h kso h   kh h ks h kh h kso h
  kh h ks h kh h kso h   kh h ks h kh h kso h
  kh h ks h kh h kso h   kh h ks h kh h kso h
  kh h ks h kh h kso h   kh h ks h kh s sso h
`

const SCOREBOOK_DRUMS = `
  k h . h s h . h   k h . h s h . h   k h . h s h . h   k h . h s h s h
  k h . h s h . h   k h . h s h . h   k h . h s h . h   k h . h s s s
  k h . h s h . h   k h . h s h . h   k h . h s h . h   k h . h s h s h
  k h . h s h . h   k h . h s h . h   k h . h s h . h   c h s h k s s h
`

interface Song {
  name: string
  bpm: number
  melody: string[]
  counter?: string[]
  harmony: string[]
  bass: string[]
  drums: string[]
  leadWave?: OscillatorType
  counterWave?: OscillatorType
  harmonyWave?: OscillatorType
  bassWave?: OscillatorType
  leadVol?: number
  counterVol?: number
  harmonyVol?: number
  bassVol?: number
  leadDetune?: number
  counterDetune?: number
  harmonyDetune?: number
  bassDetune?: number
  leadVoice?: ToneVoice
  counterVoice?: ToneVoice
  harmonyVoice?: ToneVoice
  bassVoice?: ToneVoice
  swing?: number
}

type ToneVoice = 'bright' | 'soft' | 'hollow' | 'brass' | 'deep' | 'rounded' | 'pluck' | 'reed' | 'flute' | 'bell'

interface SoundtrackSourceCue {
  gameLevel: string
  title: string
  key: string
  sourceBpm: number
  character: string
}

const SCOREBOOK_CUES: SoundtrackSourceCue[] = [
  { gameLevel: '1-1', title: 'Dune Hop', key: 'D', sourceBpm: 164, character: 'bright desert opener' },
  { gameLevel: '1-2', title: 'Pyramid Parade', key: 'A', sourceBpm: 170, character: 'bouncy desert run' },
  { gameLevel: '1-3', title: 'Stone Chamber', key: 'Gm', sourceBpm: 148, character: 'mysterious ruin' },
  { gameLevel: '2-1', title: 'Coral Skip', key: 'F', sourceBpm: 156, character: 'watery island' },
  { gameLevel: '2-2', title: 'Bubble Current', key: 'C', sourceBpm: 160, character: 'undersea momentum' },
  { gameLevel: '2-3', title: 'Marine Pop Run', key: 'Bb', sourceBpm: 176, character: 'submarine shooter' },
  { gameLevel: '3-1', title: 'Idol Trail', key: 'E', sourceBpm: 158, character: 'open-air stone island' },
  { gameLevel: '3-2', title: 'Echoing Moai', key: 'Bm', sourceBpm: 150, character: 'ruin interior' },
  { gameLevel: '3-3', title: 'Boulder Sprint', key: 'Dm', sourceBpm: 172, character: 'tense ruin finale' },
  { gameLevel: '4-1', title: 'Bamboo Bounce', key: 'G', sourceBpm: 166, character: 'eastern-inspired platforming' },
  { gameLevel: '4-2', title: 'Lantern Leap', key: 'D', sourceBpm: 174, character: 'fast final-world platforming' },
  { gameLevel: '4-3', title: 'Sky Pop Scramble', key: 'C', sourceBpm: 184, character: 'airplane finale' },
]

const SONG_MARCH: Song = {
  name: 'Dune Hop',
  bpm: 140,
  leadWave: 'square',
  counterWave: 'triangle',
  harmonyWave: 'square',
  bassWave: 'triangle',
  leadVol: 0.42,
  counterVol: 0.13,
  harmonyVol: 0.14,
  bassVol: 0.88,
  melody: parse(DANCE_LEAD_D),
  counter: parse(DANCE_COUNTER_D),
  harmony: parse(DANCE_HARMONY_D),
  bass: parse(DANCE_BASS_D),
  drums: parse(DANCE_DRUMS),
}

// ---- Song 2: a gentle waltz in G (oom-pah-pah, 6 steps per bar) ----
// G Em C D | G Em Am D | G G7 C Cm | G D G —
// the borrowed C-minor bar is the wistful moment that makes it stick
const SONG_WALTZ: Song = {
  name: 'Waltz of Little Stars',
  bpm: 152,
  swing: 0.08,
  melody: parse(`
    B4 -  D5 -  G5 -    E5 -  -  D5 B4 -    C5 -  E5 -  G5 -    F#5 -  -  E5 D5 -
    B4 -  D5 -  G5 -    E5 -  G5 -  B5 -    A5 -  -  G5 E5 -    F#5 -  A5 -  D5 -
    G5 -  B5 -  D6 -    F5 -  -  D5 B4 -    E5 -  G5 -  C6 -    D#5 -  -  C5 G4 -
    D5 -  B4 -  G4 -    A4 -  C5 -  F#5 -   G5 -  D5 -  B4 -    G4 -  -  -  .  .
  `),
  counter: parse(`
    .  .  .  .  .  .    G4 .  B4 .  D5 .    E5 .  D5 .  B4 .    A4 .  C5 .  D5 .
    .  .  .  .  .  .    B4 .  D5 .  G5 .    C5 .  E5 .  A5 .    D5 .  F#5 . A5 .
    B4 .  D5 .  G5 .    B4 .  D5 .  F5 .    G4 .  C5 .  E5 .    G4 .  C5 .  D#5 .
    B4 .  G4 .  D4 .    A4 .  C5 .  F#5 .   B4 .  D5 .  G5 .    D5 .  B4 .  G4 .
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
  swing: 0.1,
  melody: parse(`
    A4 A4 .  A4 C5 .  A4 .    E5 .  D5 .  C5 .  B4 .    F5 .  E5 .  D5 .  C5 .    E5 .  B4 .  E5 .  G#5 .
    A5 A5 .  A5 G5 .  E5 .    A4 C5 E5 A5 G5 .  E5 .    D5 .  F5 .  A5 .  F5 .    E5 .  G#5 .  B5 .  E5 .
    A5 .  G5 .  F5 .  E5 .    G5 .  F5 .  E5 .  D5 .    F5 .  E5 .  D5 .  C5 .    E5 -  -  .  G#4 .  B4 .
    A4 .  E5 .  A4 .  E5 .    G#4 .  E5 .  G#4 .  B4 .   A4 C5 E5 G5 A5 .  E5 .    A4 .  .  .  E4 .  .  .
  `),
  counter: parse(`
    .  .  E4 .  A4 .  E4 .    C5 .  B4 .  A4 .  G#4 .   A4 .  C5 .  F5 .  C5 .    B4 .  G#4 . B4 .  E5 .
    E5 .  C5 .  A4 .  C5 .    E4 A4 C5 E5 D5 .  C5 .    F4 .  A4 .  D5 .  A4 .    G#4 . B4 .  E5 .  B4 .
    C5 .  A4 .  F4 .  A4 .    B4 .  G4 .  E4 .  G4 .    A4 .  F4 .  D4 .  F4 .    G#4 A4 B4 . E5 .  B4 .
    C5 .  A4 .  E4 .  A4 .    B4 .  G#4 . E4 .  G#4 .   A4 C5 E5 A5 G5 .  E5 .    A4 .  E4 .  A3 .  .  .
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
  counter: parse(`
    .  .  C5 .  G4 .  C5 .    E4 .  G4 .  C5 .  G4 .
    F4 .  A4 .  C5 .  A4 .    G4 .  B4 .  D5 .  B4 .
    C5 .  E5 .  G5 .  E5 .    A4 .  C5 .  F5 .  C5 .
    B4 .  D5 .  G5 .  D5 .    E5 D5 C5 .  G4 .  C5 .
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
  swing: 0.08,
  melody: parse(`
    C5 -  G4 -  A4 -  E4 -    F4 -  C5 -  B4 -  G4 -
    E5 -  C5 -  D5 -  B4 -    C5 -  -  .  G4 .  C5 .
    A4 -  E5 -  D5 -  C5 -    B4 -  G5 -  F5 -  D5 -
    E5 -  G5 -  C6 -  B5 -    C6 -  -  .  G5 .  E5 .
  `),
  counter: parse(`
    .  E4 .  G4  .  C5 .  G4    .  A4 .  C5  .  B4 .  D5
    .  G4 .  C5  .  E5 .  C5    G5 .  E5 .   C5 .  G4 .
    .  C5 .  E5  .  A5 .  E5    .  G4 .  B4  .  G5 .  B4
    .  E5 .  G5  .  C6 .  G5    E5 G5 C6 G5  C5 .  .  .
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

const SONG_MENU: Song = {
  name: 'PacAbacus Welcome Groove',
  bpm: 134,
  leadWave: 'triangle',
  harmonyWave: 'square',
  bassWave: 'triangle',
  leadVol: 0.42,
  counterVol: 0.12,
  harmonyVol: 0.11,
  bassVol: 0.72,
  melody: parse(DANCE_LEAD_D),
  counter: parse(DANCE_COUNTER_D),
  harmony: parse(DANCE_HARMONY_D),
  bass: parse(DANCE_BASS_D),
  drums: parse(DANCE_DRUMS),
}

type Timbre = Pick<Song, 'leadWave' | 'counterWave' | 'harmonyWave' | 'bassWave' | 'leadDetune' | 'counterDetune' | 'harmonyDetune' | 'bassDetune' | 'leadVoice' | 'counterVoice' | 'harmonyVoice' | 'bassVoice'>

function withTimbre(song: Song, timbre: Timbre): Song {
  return { ...song, ...timbre }
}

function transposeToken(token: string, semitones: number): string {
  if (token === '.' || token === '-') return token
  const name = token.slice(0, -1)
  const octave = Number(token.slice(-1))
  const midi = 12 * (octave + 1) + NOTE_OFFSETS[name] + semitones
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  return `${noteNames[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`
}

function variant(song: Song, name: string, semitones: number, bpmShift = 0): Song {
  const transposeTrack = (track?: string[]) => track?.map((token) => transposeToken(token, semitones))
  return {
    ...song,
    name,
    bpm: song.bpm + bpmShift,
    melody: transposeTrack(song.melody) ?? song.melody,
    counter: transposeTrack(song.counter),
    harmony: transposeTrack(song.harmony) ?? song.harmony,
    bass: transposeTrack(song.bass) ?? song.bass,
  }
}

export const SONGS: Song[] = [
  withTimbre(SONG_MARCH, { leadWave: 'square', counterWave: 'triangle', harmonyWave: 'square', bassWave: 'triangle', leadVoice: 'bright', counterVoice: 'soft', bassVoice: 'rounded', leadDetune: 0, bassDetune: -4 }),
  withTimbre(variant(SONG_MARCH, 'Pyramid Parade', 7, 4), { leadWave: 'sawtooth', counterWave: 'square', harmonyWave: 'triangle', bassWave: 'triangle', leadVoice: 'reed', counterVoice: 'bright', bassVoice: 'deep', leadDetune: -7, counterDetune: 5, bassDetune: -9 }),
  withTimbre(variant(SONG_CHASE, 'Stone Chamber', -2, -18), { leadWave: 'triangle', counterWave: 'sine', harmonyWave: 'triangle', bassWave: 'sawtooth', leadVoice: 'hollow', harmonyVoice: 'bell', bassVoice: 'deep', leadDetune: -12, harmonyDetune: 7, bassDetune: -4 }),
  withTimbre(variant(SONG_WALTZ, 'Coral Skip', -2, 4), { leadWave: 'sine', counterWave: 'triangle', harmonyWave: 'square', bassWave: 'triangle', leadVoice: 'flute', counterVoice: 'rounded', bassVoice: 'rounded', leadDetune: 8, counterDetune: -5, bassDetune: -7 }),
  withTimbre(variant(SONG_MARCH, 'Bubble Current', -2, 0), { leadWave: 'triangle', counterWave: 'sine', harmonyWave: 'square', bassWave: 'sine', leadVoice: 'bell', counterVoice: 'hollow', bassVoice: 'deep', leadDetune: 5, counterDetune: -8, bassDetune: -12 }),
  withTimbre(variant(SONG_CHASE, 'Marine Pop Run', 1, 0), { leadWave: 'square', counterWave: 'sawtooth', harmonyWave: 'square', bassWave: 'sawtooth', leadVoice: 'bright', counterVoice: 'brass', bassVoice: 'deep', leadDetune: 4, counterDetune: -6, bassDetune: -5 }),
  withTimbre(variant(SONG_FOREST, 'Idol Trail', 4, 8), { leadWave: 'sawtooth', counterWave: 'triangle', harmonyWave: 'sine', bassWave: 'triangle', leadVoice: 'reed', counterVoice: 'soft', bassVoice: 'rounded', leadDetune: -5, counterDetune: 9, bassDetune: -8 }),
  withTimbre(variant(SONG_CHASE, 'Echoing Moai', 2, -20), { leadWave: 'sine', counterWave: 'triangle', harmonyWave: 'sawtooth', bassWave: 'triangle', leadVoice: 'hollow', harmonyVoice: 'bell', bassVoice: 'rounded', leadDetune: -15, harmonyDetune: 12, bassDetune: -6 }),
  withTimbre(variant(SONG_CHASE, 'Boulder Sprint', 5, -2), { leadWave: 'sawtooth', counterWave: 'square', harmonyWave: 'square', bassWave: 'sawtooth', leadVoice: 'brass', counterVoice: 'bright', bassVoice: 'deep', leadDetune: 10, counterDetune: -4, bassDetune: -3 }),
  withTimbre(variant(SONG_FOREST, 'Bamboo Bounce', 7, 10), { leadWave: 'triangle', counterWave: 'square', harmonyWave: 'sine', bassWave: 'triangle', leadVoice: 'pluck', counterVoice: 'bright', bassVoice: 'rounded', leadDetune: 7, counterDetune: -10, bassDetune: -9 }),
  withTimbre(variant(SONG_MARCH, 'Lantern Leap', 0, 8), { leadWave: 'square', counterWave: 'sawtooth', harmonyWave: 'triangle', bassWave: 'triangle', leadVoice: 'pluck', counterVoice: 'brass', bassVoice: 'rounded', leadDetune: -3, counterDetune: 6, bassDetune: -5 }),
  withTimbre(variant(SONG_CASTLE, 'Sky Pop Scramble', 0, 16), { leadWave: 'sawtooth', counterWave: 'square', harmonyWave: 'sine', bassWave: 'sawtooth', leadVoice: 'brass', counterVoice: 'bright', bassVoice: 'deep', leadDetune: 12, counterDetune: -7, bassDetune: -2 }),
]

const SCOREBOOK_SONGS: Song[] = SCOREBOOK_CUES.map((cue, index) => {
  const pattern = SCOREBOOK_PATTERNS[index]
  return {
    name: `${cue.title} Scorebook`,
    bpm: cue.sourceBpm,
    melody: parse(pattern.lead),
    harmony: parse(pattern.lead).map((note, noteIndex) => (noteIndex % 4 === 2 ? note : '.')),
    bass: parse(pattern.bass),
    drums: parse(SCOREBOOK_DRUMS),
    leadWave: 'square',
    harmonyWave: 'square',
    bassWave: 'triangle',
    leadDetune: index % 3 === 0 ? -6 : index % 3 === 1 ? 5 : 0,
    harmonyDetune: index % 2 === 0 ? 7 : -5,
    bassDetune: -8,
    leadVoice: index % 4 === 0 ? 'bright' : index % 4 === 1 ? 'hollow' : index % 4 === 2 ? 'flute' : 'reed',
    bassVoice: index % 2 === 0 ? 'rounded' : 'deep',
    leadVol: 0.42,
    harmonyVol: 0.1,
    bassVol: 0.72,
  }
})

export const SOUNDTRACK_CUES = SCOREBOOK_CUES.map((cue, index) => ({
  ...cue,
  index,
  arrangementBpm: SONGS[index]?.bpm ?? cue.sourceBpm,
  scorebookBpm: SCOREBOOK_SONGS[index]?.bpm ?? cue.sourceBpm,
}))

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
      const AudioContextCtor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext
      if (!AudioContextCtor) throw new Error('Web Audio is not available in this browser.')
      this.ctx = new AudioContextCtor()
      const master = this.ctx.createGain()
      master.gain.value = 0.75
      master.connect(this.ctx.destination)
      this.musicGain = this.ctx.createGain()
      this.musicGain.gain.value = 0.42
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

  private resumeCtx(ctx = this.ensureCtx()) {
    return ctx.resume().catch((error: unknown) => {
      console.warn('PacAbacus audio could not start.', error)
    })
  }

  private tone(
    dest: AudioNode,
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    detune = 0,
    voice: ToneVoice = 'bright',
  ) {
    const ctx = this.ensureCtx()
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    osc.detune.value = detune
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    const voiceSettings: Record<ToneVoice, [BiquadFilterType, number, number, number]> = {
      bright: ['highpass', 420, 0.7, 0.9],
      soft: ['lowpass', 1800, 0.7, 1.05],
      hollow: ['bandpass', 1100, 3.2, 1.15],
      brass: ['lowpass', 3200, 1.1, 0.82],
      deep: ['lowpass', 900, 1.2, 0.96],
      rounded: ['lowpass', 1500, 0.8, 1.08],
      pluck: ['highpass', 700, 0.9, 0.52],
      reed: ['bandpass', 1650, 1.8, 0.72],
      flute: ['lowpass', 2400, 0.65, 1.2],
      bell: ['highpass', 900, 1.4, 0.7],
    }
    const [filterType, cutoff, q, release] = voiceSettings[voice]
    filter.type = filterType
    filter.frequency.value = cutoff
    filter.Q.value = q
    gain.gain.setValueAtTime(vol, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur * release)
    osc.connect(gain)
    gain.connect(filter)
    filter.connect(dest)
    osc.start(start)
    osc.stop(start + dur * release + 0.02)
    if (voice === 'brass' || voice === 'reed' || voice === 'bell') {
      const harmonic = ctx.createOscillator()
      harmonic.type = voice === 'bell' ? 'sine' : 'triangle'
      harmonic.frequency.value = freq * (voice === 'bell' ? 2.5 : 2)
      harmonic.detune.value = detune + 3
      const harmonicGain = ctx.createGain()
      harmonicGain.gain.setValueAtTime(vol * (voice === 'bell' ? 0.24 : 0.16), start)
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, start + dur * release)
      harmonic.connect(harmonicGain)
      harmonicGain.connect(filter)
      harmonic.start(start)
      harmonic.stop(start + dur * release + 0.02)
    }
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

  private pump(start: number) {
    if (!this.musicGain) return
    this.musicGain.gain.cancelScheduledValues(start)
    this.musicGain.gain.setValueAtTime(0.28, start)
    this.musicGain.gain.linearRampToValueAtTime(0.42, start + this.stepSec * 0.72)
  }

  /** length in steps of a note starting at index i (counts '-' holds) */
  private holdLength(track: string[], i: number): number {
    let len = 1
    while (track[(i + len) % track.length] === '-' && len < 8) len++
    return len
  }

  private scheduleStep(step: number, time: number) {
    const music = this.musicGain!
    const drumsOut = this.sfxGain ?? music
    const { melody, counter, harmony, bass, drums } = this.song
    const stepSec = this.stepSec
    const stepInBar = step % 16
    const downbeat = stepInBar === 0 || stepInBar === 8
    const backbeat = stepInBar === 4 || stepInBar === 12
    const swingDelay = this.song.swing && step % 2 === 1 ? stepSec * this.song.swing : 0
    const noteTime = time + swingDelay
    const mel = melody[step % melody.length]
    if (mel !== '.' && mel !== '-') {
      const len = this.holdLength(melody, step % melody.length)
      this.tone(
        music,
        noteFreq(mel),
        noteTime,
        stepSec * len * (this.song.swing ? 0.78 : 0.9),
        this.song.leadWave ?? 'square',
        (this.song.leadVol ?? 0.5) * (downbeat ? 1.08 : 1),
        this.song.leadDetune ?? 0,
        this.song.leadVoice,
      )
    }
    if (counter) {
      const cnt = counter[step % counter.length]
      if (cnt !== '.' && cnt !== '-') {
        const len = this.holdLength(counter, step % counter.length)
        this.tone(
          music,
          noteFreq(cnt),
          noteTime,
          stepSec * len * 0.72,
          this.song.counterWave ?? 'triangle',
          (this.song.counterVol ?? 0.16) * (backbeat ? 1.15 : 1),
          this.song.counterDetune ?? 0,
          this.song.counterVoice,
        )
      }
    }
    const har = harmony[step % harmony.length]
    if (har !== '.' && har !== '-') {
      const len = this.holdLength(harmony, step % harmony.length)
      this.tone(
        music,
        noteFreq(har),
        noteTime,
        stepSec * len * (this.song.swing ? 0.62 : 0.85),
        this.song.harmonyWave ?? 'square',
        this.song.harmonyVol ?? 0.22,
        this.song.harmonyDetune ?? 0,
        this.song.harmonyVoice,
      )
    }
    const bs = bass[step % bass.length]
    if (bs !== '.' && bs !== '-') {
      const len = this.holdLength(bass, step % bass.length)
      this.tone(
        music,
        noteFreq(bs),
        noteTime,
        stepSec * len * (this.song.swing ? 0.66 : 0.9),
        this.song.bassWave ?? 'triangle',
        (this.song.bassVol ?? 0.75) * (downbeat ? 1.08 : stepInBar % 2 === 1 ? 0.92 : 1),
        this.song.bassDetune ?? 0,
        this.song.bassVoice,
      )
    }
    const drum = drums[step % drums.length]
    const drumTime = drum.includes('h') || drum.includes('p') || drum.includes('o') ? noteTime : time
    if (drum.includes('k')) {
      this.pump(time)
      this.tone(drumsOut, downbeat ? 66 : 78, time, 0.08, 'square', downbeat ? 0.52 : 0.38)
    }
    if (drum.includes('s')) this.noise(drumsOut, time, 0.075, backbeat ? 0.44 : 0.32)
    if (drum.includes('p')) this.noise(drumsOut, drumTime, 0.035, 0.12)
    if (drum.includes('h')) this.noise(drumsOut, drumTime, 0.025, stepInBar % 2 === 1 ? 0.12 : 0.08, true)
    if (drum.includes('o')) this.noise(drumsOut, drumTime, 0.14, 0.22, true)
    if (drum.includes('c')) this.noise(drumsOut, time, 0.35, 0.4)
  }

  /** Play the song for a given level (songs cycle). Restarts if it changed. */
  playSong(index: number, bpm?: number) {
    const base = SONGS[((index % SONGS.length) + SONGS.length) % SONGS.length]
    const next = bpm ? { ...base, bpm } : base
    if (this.playing && next === this.song) {
      void this.resumeCtx()
      return
    }
    this.stopMusic()
    this.song = next
    this.startMusic()
  }

  playScorebookSong(index: number, bpm?: number) {
    const base = SCOREBOOK_SONGS[((index % SCOREBOOK_SONGS.length) + SCOREBOOK_SONGS.length) % SCOREBOOK_SONGS.length]
    const next = bpm ? { ...base, bpm } : base
    if (this.playing && next === this.song) {
      void this.resumeCtx()
      return
    }
    this.stopMusic()
    this.song = next
    this.startMusic()
  }

  playMenuSong() {
    if (this.playing && this.song === SONG_MENU) {
      void this.resumeCtx()
      return
    }
    this.stopMusic()
    this.song = SONG_MENU
    this.startMusic()
  }

  startMusic() {
    const ctx = this.ensureCtx()
    void this.resumeCtx(ctx).then(() => {
      if (this.playing && this.nextTime < ctx.currentTime) {
        this.nextTime = ctx.currentTime + 0.06
      }
    })
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
    void this.resumeCtx(ctx)
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

  previewSound() {
    const ctx = this.ensureCtx()
    void this.resumeCtx(ctx)
    const dest = this.sfxGain!
    const t = ctx.currentTime + 0.01
    this.tone(dest, noteFreq('C5'), t, 0.08, 'square', 0.36)
    this.tone(dest, noteFreq('G5'), t + 0.08, 0.12, 'square', 0.32)
  }
}

export const chiptune = new Chiptune()
