export interface ScorebookPattern {
  lead: string
  bass: string
}

// Draft transcription extracted from the vector noteheads in Sarasaland_8bit_Level_Scorebook.pdf.
export const SCOREBOOK_PATTERNS: ScorebookPattern[] = [
  {
    lead: `
      D5 F#4 A4 B4 A4 F#4 E4 F#4 A4 B4 D5 B4 A4 F#4 D4 F#4
      D4 F#4 A4 B4 A4 F#4 E4 F#4 A4 B4 D5 B4 A4 F#4 D4 F#4
      G4 B4 D5 E5 D5 B4 A4 B4 D5 E5 F#5 E5 D5 B4 G4 B4
      G4 B4 D5 E5 D5 B4 A4 B4 D5 E5 F#5 E5 D5 B4 G4 B4
      A4 C#5 E5 F#5 E5 C#5 B4 C#5 E5 F#5 G5 F#5 E5 C#5 A4 C#5
      C#5 B4 C#5 E5 F#5 E5 C#5 G5 C#5 A4 C#5 E5 F#5 G5 F#5 E5
      E4 G4 B4 C#5 B4 F#5 F#4 G4 B4 C#5 E5 C#5 B5 G4 E4 G4
      G4 F#4 G4 B5 C#5 B4 G4 E4 B4 C#5 D6 C#5 A4 F#4 E4 D4
    `,
    bass: `
      D2 . A2 . D3 . A2 . G2 . D3 . G3 . D3 .
      A2 . E3 . A3 . E3 . D2 . A2 . D3 . A2 .
      B2 . F#3 . B3 . F#3 . G2 . D3 . G3 . D3 .
      A2 . E3 . A3 . E3 . D2 . A2 . D3 . A2 .
      D2 . A2 . D3 . A2 . B2 . F#3 . B3 . F#3 .
      G2 . D3 . G3 . D3 . A2 . E3 . A3 . E3 .
      E2 . B2 . E3 . B2 . A2 . E3 . A3 . E3 .
      D2 . A2 . D3 . A2 . D2 . A2 . D3 . A2 .
    `,
  },
  {
    lead: `
      A4 E5 C#5 F#5 E5 G#5 F#5 E5 C#5 D5 F#5 G#5 F#5 D5 C#5 A4
      A4 E5 C#5 F#5 E5 G#5 F#5 E5 C#5 D5 F#5 G#5 F#5 D5 C#5 A4
      D5 G#5 F#5 B5 G#5 C#6 B5 G#5 F#5 G#5 B5 C#6 B5 G#5 F#5 D5
      D5 G#5 F#5 B5 G#5 C#6 B5 G#5 F#5 G#5 B5 C#6 B5 G#5 F#5 D5
      E5 B5 G#5 C#6 B5 D6 C#6 B5 G#5 G#5 C#6 C#6 C#6 G#5 G#5 D6
      B5 C#6 D6 B5 C#6 G#5 B5 E5 E5 G#5 G#5 C#6 C#6 C#6 G#5 G#5
      B4 F#5 D5 G#5 F#5 B5 G#5 F#5 D5 E5 G#5 G#5 G#5 E5 D5 B4
      F#5 G#5 B5 F#5 G#5 D5 F#5 B4 D5 D6 G#5 G#5 E5 C#5 B4 A4
    `,
    bass: `
      A2 . E3 . A3 . E3 . D3 . A3 . D3 . A3 .
      E3 . B3 . E3 . B3 . A2 . E3 . A3 . E3 .
      F#3 . C#4 . F#3 . C#4 . D3 . A3 . D3 . A3 .
      E3 . B3 . E3 . B3 . A2 . E3 . A3 . E3 .
      A2 . E3 . A3 . E3 . F#3 . C#4 . F#3 . C#4 .
      D3 . A3 . D3 . A3 . E3 . B3 . E3 . B3 .
      B2 . F#3 . B3 . F#3 . E3 . B3 . E3 . B3 .
      A2 . E3 . A3 . E3 . A2 . E3 . A3 . E3 .
    `,
  },
  {
    lead: `
      G4 A4 A#4 A4 D5 D5 A#4 A4 G4 D5 A#4 A4 A4 A#4 A4 G4
      G4 A4 A#4 A4 D5 D5 A#4 A4 G4 D5 A#4 A4 A4 A#4 A4 G4
      A#4 D5 D#5 D5 G5 F5 D#5 D5 A#4 G5 D#5 D5 D5 D#5 D5 A#4
      A#4 D5 D#5 D5 G5 F5 D#5 D5 A#4 G5 D#5 D5 D5 D#5 D5 A#4
      D5 D5 F5 D5 A5 G5 F5 D6 D5 A5 F5 D#5 D5 F5 . D5
      D5 F5 G5 A5 D5 F5 D5 D5 D5 D#5 F5 D5 . F5 A5 D5
      A4 A4 D5 A5 D#5 D5 D5 A4 A4 D#5 C6 A#4 A4 D5 A#4 A4
      A4 C6 D5 D#5 A4 D5 A4 A4 G5 D#5 D5 A#4 D5 A4 A4 G4
    `,
    bass: `
      G2 . D3 . G3 . D3 . C3 . G3 . C3 . G3 .
      D3 . A3 . D3 . A3 . G2 . D3 . G3 . D3 .
      D3 . A3 . D3 . A3 . C3 . G3 . C3 . G3 .
      D3 . A3 . D3 . A3 . G2 . D3 . G3 . D3 .
      G2 . D3 . G3 . D3 . D3 . A3 . D3 . A3 .
      C3 . G3 . C3 . G3 . D3 . A3 . D3 . A3 .
      A2 . D3 . A3 . D3 . D3 . A3 . D3 . A3 .
      G2 . D3 . G3 . D3 . G2 . D3 . G3 . D3 .
    `,
  },
  {
    lead: `
      F4 A4 A4 D5 A4 A4 F4 A4 D5 A#4 A4 A#4 E5 D5 A4 A4
      F4 A4 A4 D5 A4 A4 F4 A4 D5 A#4 A4 A#4 E5 D5 A4 A4
      A4 D5 E5 F5 E5 D5 A4 D5 F5 E5 D5 E5 G5 F5 E5 D5
      A4 D5 E5 F5 E5 D5 A4 D5 F5 E5 D5 E5 G5 F5 E5 C6
      A#4 E5 E5 G5 E5 E5 A#5 E5 G5 F5 E5 F5 A5 G5 E5 E5
      E5 A#4 E5 E5 G5 E5 E5 A#4 E5 E5 G5 A5 F5 E5 F5 G5
      G4 A4 A#5 E5 A#4 A4 G4 A4 E5 C6 A4 D5 E5 E5 A#4 A4
      A5 G4 A4 A#4 E5 A#4 A4 G4 E5 D5 A4 D5 A#4 A4 G4 F4
    `,
    bass: `
      F2 . C3 . F3 . C3 . A#2 . F3 . A3 . F3 .
      C3 . G3 . C3 . G3 . F2 . C3 . F3 . C3 .
      D3 . A3 . D3 . A3 . A#2 . F3 . A3 . F3 .
      C3 . G3 . C3 . G3 . F2 . C3 . F3 . C3 .
      F2 . C3 . F3 . C3 . D3 . A3 . D3 . A3 .
      A#2 . F3 . A3 . F3 . C3 . G3 . C3 . G3 .
      G2 . D3 . G3 . D3 . C3 . G3 . C3 . G3 .
      F2 . C3 . F3 . C3 . F2 . C3 . F3 . C3 .
    `,
  },
  {
    lead: `
      C4 F4 E4 G4 F4 A4 G4 E4 D4 F4 A4 B4 A4 G4 E4 C4
      C4 F4 E4 G4 F4 A4 G4 E4 D4 F4 A4 B4 A4 G4 E4 C4
      F4 B4 A4 B4 B4 D5 B4 A4 G4 B4 D5 E5 D5 B4 A4 F4
      F4 B4 A4 B4 B4 D5 B4 G5 G4 B4 D5 E5 D5 B4 G5 F4
      G4 B4 B4 D5 B4 D6 D5 B4 A4 B4 E5 E5 D6 D5 B4 G4
      B4 D5 E5 B5 D5 B4 B4 G4 G4 B4 C6 E5 E5 E5 B4 A4
      D4 F5 F4 A4 G4 B4 A4 F4 E5 G4 B4 B4 B4 A4 F4 D4
      F4 A4 B4 G4 A4 F4 G4 D4 E4 G4 B4 B4 G4 E4 D4 C4
    `,
    bass: `
      C2 . G2 . C3 . G2 . F2 . C3 . F3 . C3 .
      G2 . D3 . G3 . D3 . C2 . G2 . C3 . G2 .
      A2 . E3 . A3 . E3 . F2 . C3 . F3 . C3 .
      G2 . D3 . G3 . D3 . C2 . G2 . C3 . G2 .
      C2 . G2 . C3 . G2 . A2 . E3 . A3 . E3 .
      F2 . C3 . F3 . C3 . G2 . D3 . G3 . D3 .
      D2 . A2 . D3 . A2 . G2 . D3 . G3 . D3 .
      C2 . G2 . C3 . G2 . C2 . G2 . C3 . G2 .
    `,
  },
  {
    lead: `
      A4 D5 D#5 A5 G5 D#5 F5 A5 D#5 D5 F5 D5 G5 D#5 D5 A4
      A4 D5 D#5 A5 G5 D#5 F5 A5 D#5 D5 F5 D5 G5 D#5 D5 A4
      D5 F5 A5 D6 C6 A5 A#5 D6 A5 F5 A#5 G5 C6 A5 F5 D6
      D5 F5 A5 D6 C6 A5 A#5 D6 A5 F5 A#5 G5 C6 A5 F5 D5
      D#5 G5 A#5 . D6 A#5 C6 . A#5 G5 C6 A5 D6 A#5 G5 D#5
      . C6 A#5 D6 . A#5 G5 D#5 D#5 G5 A#5 D6 A5 C6 G5 A#5
      A#5 D5 F5 A#5 A5 F5 G5 A#5 F5 D5 G5 D#5 A5 F5 D5 A#4
      A#5 G5 F5 A5 A#5 F5 D5 A#4 F5 D5 G5 D#5 D#5 D5 A#4 A4
    `,
    bass: `
      A#2 . F3 . A3 . F3 . D3 . A3 . D3 . A3 .
      F3 . A#3 . F3 . A#3 . A#2 . F3 . A3 . F3 .
      G3 . D4 . G3 . D4 . D3 . A3 . D3 . A3 .
      F3 . A#3 . F3 . A#3 . A#2 . F3 . A3 . F3 .
      A#2 . F3 . A3 . F3 . G3 . D4 . G3 . D4 .
      D3 . A3 . D3 . A3 . F3 . A#3 . F3 . A#3 .
      C3 . G3 . C3 . G3 . F3 . A#3 . F3 . A#3 .
      A#2 . F3 . A3 . F3 . A#2 . F3 . A3 . F3 .
    `,
  },
  {
    lead: `
      E4 B4 C#5 B4 G#4 F#4 G#4 B4 D#5 C#5 B4 G#4 A4 B4 G#4 E4
      E4 B4 C#5 B4 G#4 F#4 G#4 B4 D#5 C#5 B4 G#4 A4 B4 G#4 E4
      A4 E5 F#5 E5 C#5 B4 C#5 D#6 G#5 F#5 E5 C#5 D#5 E5 C#6 A4
      A4 E5 F#5 E5 C#5 B5 C#5 E5 G#5 F#5 E5 C#5 D#6 E5 C#5 A4
      B4 F#5 G#5 F#5 D#5 C#5 D#5 F#5 G#5 G#5 F#5 D#5 E5 F#5 D#5 B4
      F#5 D#6 C#5 D#5 F#5 G#5 F#5 B4 B5 D#5 F#5 E5 D#5 F#5 G#5 G#5
      F#4 C#5 D#5 C#5 A4 G#4 A4 C#5 E5 D#5 C#5 A4 B4 C#5 A4 F#4
      C#5 A4 G#4 A4 C#5 D#5 C#5 F#4 E5 D#5 C#5 A4 B4 G#4 F#4 E4
    `,
    bass: `
      E2 . B2 . E3 . B2 . A2 . E3 . A3 . E3 .
      B2 . F#3 . B3 . F#3 . E2 . B2 . E3 . B2 .
      C#3 . G#3 . C#3 . G#3 . A2 . E3 . A3 . E3 .
      B2 . F#3 . B3 . F#3 . E2 . B2 . E3 . B2 .
      E2 . B2 . E3 . B2 . C#3 . G#3 . C#3 . G#3 .
      A2 . E3 . A3 . E3 . B2 . F#3 . B3 . F#3 .
      F#2 . C#3 . F#3 . C#3 . B2 . F#3 . B3 . F#3 .
      E2 . B2 . E3 . B2 . E2 . B2 . E3 . B2 .
    `,
  },
  {
    lead: `
      B4 D5 C#5 F#5 E5 C#5 F#5 F#5 D5 B4 E5 D5 G5 F#5 E5 C#5
      B4 D5 C#5 F#5 E5 C#5 F#5 F#5 D5 B4 E5 D5 G5 F#5 E5 C#6
      E5 F#5 F#5 B5 G5 F#5 C#6 B5 F#5 E5 G5 F#5 C#6 C#6 G5 F#5
      E5 F#5 F#5 B5 G5 F#5 C#6 B5 F#5 E5 G5 F#5 C#6 C#6 G5 F#5
      F#5 G5 F#5 C#6 B5 F#5 C#6 C#6 G5 F#5 B5 G5 D6 C#6 B5 F#5
      C#6 C#6 F#5 B5 C#6 F#5 G5 F#5 F#5 B5 C#6 D6 G5 B5 F#5 G5
      C#5 E5 D5 F#5 F#5 D5 G5 F#5 E5 C#5 F#5 E5 B5 G5 F#5 D5
      F#5 G5 D5 F#5 F#5 D5 E5 C#5 E5 C#5 F#5 E5 F#5 D5 C#5 B4
    `,
    bass: `
      B2 . F#3 . B3 . F#3 . E3 . B3 . E3 . B3 .
      F#3 . C#4 . F#3 . C#4 . B2 . F#3 . B3 . F#3 .
      G3 . D4 . G3 . D4 . E3 . B3 . E3 . B3 .
      F#3 . C#4 . F#3 . C#4 . B2 . F#3 . B3 . F#3 .
      B2 . F#3 . B3 . F#3 . G3 . D4 . G3 . D4 .
      E3 . B3 . E3 . B3 . F#3 . C#4 . F#3 . C#4 .
      C#3 . G3 . C#3 . G3 . F#3 . C#4 . F#3 . C#4 .
      B2 . F#3 . B3 . F#3 . B2 . F#3 . B3 . F#3 .
    `,
  },
  {
    lead: `
      D4 G4 A4 A4 A#4 A4 G4 F4 D4 F4 A4 G4 A4 D5 A#4 A4
      D4 G4 A4 A4 A#4 A4 G4 E5 D4 F4 A4 G4 A4 D5 A#5 A4
      G4 A#4 E5 D5 E5 D6 A#4 A4 G4 A4 D5 A#4 D6 F5 E5 D5
      G4 A#4 E5 C6 E5 E5 A#4 A4 G4 A4 C6 A#4 E5 F5 E5 D5
      A4 C6 E5 E5 F5 E5 D5 A#4 G5 A#4 E5 D5 E5 G5 F5 E5
      A#4 D5 E5 F5 E5 E5 D5 A4 E5 F5 G5 E5 D5 E5 A#4 A4
      E4 A4 A#4 A4 D5 A#4 A4 G4 E4 G4 A4 A4 A#4 E5 D5 A4
      G4 A4 A#4 D5 A4 A#4 A4 E4 E4 G4 A4 A4 A4 F4 E4 D4
    `,
    bass: `
      D2 . A2 . D3 . A2 . G2 . D3 . G3 . D3 .
      A2 . E3 . A3 . E3 . D2 . A2 . D3 . A2 .
      A#2 . F3 . A3 . F3 . G2 . D3 . G3 . D3 .
      A2 . E3 . A3 . E3 . D2 . A2 . D3 . A2 .
      D2 . A2 . D3 . A2 . A#2 . F3 . A3 . F3 .
      G2 . D3 . G3 . D3 . A2 . E3 . A3 . E3 .
      E2 . A#2 . E3 . A#2 . A2 . E3 . A3 . E3 .
      D2 . A2 . D3 . A2 . D2 . A2 . D3 . A2 .
    `,
  },
  {
    lead: `
      G4 B4 D5 B4 E5 D5 B4 G4 D5 F#5 E5 B4 B4 D5 B4 G5
      G4 B4 D5 B4 E5 D5 B5 G4 D5 F#5 E5 B4 B4 C6 B4 A4
      B4 E5 F#5 E5 G5 F#5 E5 B4 F#5 B5 G5 F#5 E5 F#5 F#5 D5
      B4 E5 F#5 E5 G5 F#5 E5 B4 F#5 B5 G5 F#5 E5 F#5 F#5 D5
      C6 F#5 G5 F#5 B5 G5 F#5 D5 G5 B5 B5 F#5 F#5 G5 F#5 E5
      D5 F#5 G5 B5 F#5 G5 F#5 D5 E5 F#5 G5 F#5 F#5 B5 B5 G5
      A4 B4 E5 B4 F#5 E5 B4 A4 E5 F#5 F#5 D5 B4 E5 D5 B4
      A4 B4 E5 F#5 B4 E5 B4 A4 E5 F#5 F#5 D5 D5 B4 A4 G4
    `,
    bass: `
      G2 . D3 . G3 . D3 . C3 . G3 . C3 . G3 .
      D3 . A3 . D3 . A3 . G2 . D3 . G3 . D3 .
      E3 . B3 . E3 . B3 . C3 . G3 . C3 . G3 .
      D3 . A3 . D3 . A3 . G2 . D3 . G3 . D3 .
      G2 . D3 . G3 . D3 . E3 . B3 . E3 . B3 .
      C3 . G3 . C3 . G3 . D3 . A3 . D3 . A3 .
      A2 . E3 . A3 . E3 . D3 . A3 . D3 . A3 .
      G2 . D3 . G3 . D3 . G2 . D3 . G3 . D3 .
    `,
  },
  {
    lead: `
      D4 A4 F#4 C#5 A4 D5 B4 F#5 F#4 B4 G4 C#5 B4 A4 F#5 D4
      D4 A4 F#4 C#5 A4 C#6 B4 G4 F#4 B4 G4 C#5 B5 A4 F#4 D4
      G4 D5 B4 F#5 D5 F#5 E5 C#5 B4 E5 C#6 F#5 E5 D5 B4 G4
      G4 C#6 B4 F#5 D5 F#5 E5 C#5 B5 E5 C#5 F#5 E5 D5 B4 G4
      A4 E5 C#5 F#5 E5 G5 F#5 D5 C#5 F#5 D5 F#5 F#5 E5 C#5 A4
      D5 F#5 G5 E5 F#5 C#5 E5 A4 A4 C#5 E5 F#5 F#5 D5 F#5 C#5
      E4 B4 G4 D5 B4 E5 C#5 A4 G4 C#5 A4 D5 C#5 B4 G4 E4
      A4 C#5 E5 B4 D5 G4 B4 E4 G4 C#5 A4 D5 A4 F#4 E4 D4
    `,
    bass: `
      D2 . A2 . D3 . A2 . G2 . D3 . G3 . D3 .
      A2 . E3 . A3 . E3 . D2 . A2 . D3 . A2 .
      B2 . F#3 . B3 . F#3 . G2 . D3 . G3 . D3 .
      A2 . E3 . A3 . E3 . D2 . A2 . D3 . A2 .
      D2 . A2 . D3 . A2 . B2 . F#3 . B3 . F#3 .
      G2 . D3 . G3 . D3 . A2 . E3 . A3 . E3 .
      E2 . B2 . E3 . B2 . A2 . E3 . A3 . E3 .
      D2 . A2 . D3 . A2 . D2 . A2 . D3 . A2 .
    `,
  },
  {
    lead: `
      C4 E4 A4 B4 G4 B4 E5 A4 B4 B4 G4 E4 A4 E5 D4 C4
      C4 E4 A4 B4 F5 B4 F4 A4 B4 B4 G4 E5 A4 F4 D4 C4
      F4 A4 C6 E5 B4 E5 B4 D5 E5 D6 B4 A4 D5 B4 G4 F4
      E5 A4 D5 E5 B4 E5 B4 D5 E5 E5 B4 A4 D5 B4 G4 F4
      G4 B4 E5 F5 D5 E5 B4 E5 F5 E5 D5 B4 E5 B4 A4 G4
      E5 B4 E5 D5 F5 E5 B4 G4 G4 A4 B4 E5 B4 D5 E5 F5
      D4 F4 B4 D5 A4 B4 G4 B4 D5 B4 A4 F4 B4 G4 E4 D4
      B4 G4 B4 A4 D5 B4 F4 D4 D5 B4 A4 F4 G4 E4 D4 C4
    `,
    bass: `
      C2 . G2 . C3 . G2 . F2 . C3 . F3 . C3 .
      G2 . D3 . G3 . D3 . C2 . G2 . C3 . G2 .
      A2 . E3 . A3 . E3 . F2 . C3 . F3 . C3 .
      G2 . D3 . G3 . D3 . C2 . G2 . C3 . G2 .
      C2 . G2 . C3 . G2 . A2 . E3 . A3 . E3 .
      F2 . C3 . F3 . C3 . G2 . D3 . G3 . D3 .
      D2 . A2 . D3 . A2 . G2 . D3 . G3 . D3 .
      C2 . G2 . C3 . G2 . C2 . G2 . C3 . G2 .
    `,
  },
]
