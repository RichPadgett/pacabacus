export type ThemeId = 'stars' | 'ocean' | 'bubblegum' | 'forest' | 'sunset'

export interface Theme {
  id: ThemeId
  name: string
  emoji: string
  /** CSS custom properties applied to the game wrapper */
  vars: Record<string, string>
}

export const THEMES: Record<ThemeId, Theme> = {
  stars: {
    id: 'stars',
    name: 'Stars',
    emoji: '⭐',
    vars: {
      '--c-bg1': '#2b2070',
      '--c-bg2': '#1a1440',
      '--c-panel': '#241b5e',
      '--c-border': '#6a58e8',
      '--c-wall': '#4433aa',
      '--c-wall-edge': '#6a58e8',
      '--maze-floor': '#17103a',
      '--c-soft': '#b9aef5',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    vars: {
      '--c-bg1': '#0e4a6e',
      '--c-bg2': '#07243d',
      '--c-panel': '#0f3d5c',
      '--c-border': '#3aa6d9',
      '--c-wall': '#1b6ca8',
      '--c-wall-edge': '#4db8e8',
      '--maze-floor': '#062a42',
      '--c-soft': '#9dd3ef',
    },
  },
  bubblegum: {
    id: 'bubblegum',
    name: 'Bubblegum',
    emoji: '🍬',
    vars: {
      '--c-bg1': '#8a2b6b',
      '--c-bg2': '#4d1140',
      '--c-panel': '#75255c',
      '--c-border': '#ff8ac2',
      '--c-wall': '#c2508f',
      '--c-wall-edge': '#ff9ccb',
      '--maze-floor': '#3b0c30',
      '--c-soft': '#ffc2e0',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    vars: {
      '--c-bg1': '#1d5c33',
      '--c-bg2': '#0d2f1a',
      '--c-panel': '#1a4d2c',
      '--c-border': '#58c77e',
      '--c-wall': '#2f8f52',
      '--c-wall-edge': '#6cd992',
      '--maze-floor': '#0a2413',
      '--c-soft': '#a9e8c0',
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    vars: {
      '--c-bg1': '#8a3a1d',
      '--c-bg2': '#471106',
      '--c-panel': '#763019',
      '--c-border': '#ff9b57',
      '--c-wall': '#c05a26',
      '--c-wall-edge': '#ffa96b',
      '--maze-floor': '#38100a',
      '--c-soft': '#ffcda8',
    },
  },
}
