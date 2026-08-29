import { useEffect, useState } from 'react'
import { Twinkles } from '@/features/arcade/ArcadeGame'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import { THEMES } from '@/features/arcade/themes'
import { chiptune, SOUNDTRACK_CUES } from '@/features/audio/chiptune'

type PreviewBank = 'current' | 'scorebook'
type PlayingCue = { bank: PreviewBank; index: number }

export function SoundtrackPreview({ onBack }: { onBack: () => void }) {
  const settings = useArcadeSettings()
  const theme = THEMES[settings.theme] ?? THEMES.stars
  const [playing, setPlaying] = useState<PlayingCue | null>(null)

  useEffect(() => () => chiptune.stopMusic(), [])

  const toggleCue = (index: number, bank: PreviewBank) => {
    if (playing?.index === index && playing.bank === bank) {
      chiptune.stopMusic()
      setPlaying(null)
      return
    }
    const bpm = bank === 'scorebook'
      ? settings.scorebookBpm[String(index)]
      : settings.currentBpm[String(index)]
    if (bank === 'scorebook') chiptune.playScorebookSong(index, bpm)
    else chiptune.playSong(index, bpm)
    setPlaying({ bank, index })
  }

  const setCueBpm = (index: number, bank: PreviewBank, value: string) => {
    const bpm = Math.min(220, Math.max(80, Number(value) || 80))
    const key = String(index)
    if (bank === 'scorebook') settings.update({ scorebookBpm: { ...settings.scorebookBpm, [key]: bpm } })
    else settings.update({ currentBpm: { ...settings.currentBpm, [key]: bpm } })
    if (playing?.index === index && playing.bank === bank) {
      if (bank === 'scorebook') chiptune.playScorebookSong(index, bpm)
      else chiptune.playSong(index, bpm)
    }
  }

  const stopAndBack = () => {
    chiptune.stopMusic()
    onBack()
  }

  return (
    <div
      className="paged-shell relative flex min-h-svh flex-col items-center gap-4 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-4 text-slate-50 sm:p-6"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}
      <div className="paged-header">
        <h1 className="text-2xl font-black text-amber-300 sm:text-3xl">Soundtrack Preview</h1>
        <p className="text-xs font-bold text-[var(--c-soft)] sm:text-sm">
          Scorebook cue order · Game Boy style arrangement drafts
        </p>
      </div>

      <main className="soundtrack-main">
        {SOUNDTRACK_CUES.map((cue) => (
          <section
            key={cue.gameLevel}
            className={[
              'soundtrack-cue',
              playing?.index === cue.index ? 'soundtrack-cue--playing' : '',
            ].join(' ')}
          >
            <div className="min-w-0">
              <div className="soundtrack-cue__eyebrow">Level {cue.gameLevel}</div>
              <h2 className="soundtrack-cue__title">{cue.title}</h2>
              <p className="soundtrack-cue__meta">Key {cue.key} · source {cue.sourceBpm} BPM</p>
              <p className="soundtrack-cue__character">{cue.character}</p>
            </div>
            <div className="soundtrack-cue__buttons">
              <label className="soundtrack-bpm-control">
                <span>New BPM</span>
                <input
                  type="number"
                  min="80"
                  max="220"
                  step="1"
                  value={settings.currentBpm[String(cue.index)] ?? cue.arrangementBpm}
                  onChange={(event) => setCueBpm(cue.index, 'current', event.target.value)}
                  aria-label={`${cue.title} new arrangement BPM`}
                />
              </label>
              <label className="soundtrack-bpm-control soundtrack-bpm-control--score">
                <span>Score BPM</span>
                <input
                  type="number"
                  min="80"
                  max="220"
                  step="1"
                  value={settings.scorebookBpm[String(cue.index)] ?? cue.scorebookBpm}
                  onChange={(event) => setCueBpm(cue.index, 'scorebook', event.target.value)}
                  aria-label={`${cue.title} scorebook BPM`}
                />
              </label>
              <button
                type="button"
                onClick={() => toggleCue(cue.index, 'current')}
                className="soundtrack-play-button"
                aria-label={`${playing?.index === cue.index && playing.bank === 'current' ? 'Stop current mix' : 'Play current mix'} ${cue.title}`}
              >
                {playing?.index === cue.index && playing.bank === 'current' ? '■ Current' : '▶ Current'}
              </button>
              <button
                type="button"
                onClick={() => toggleCue(cue.index, 'scorebook')}
                className="soundtrack-play-button soundtrack-play-button--score"
                aria-label={`${playing?.index === cue.index && playing.bank === 'scorebook' ? 'Stop scorebook' : 'Play scorebook'} ${cue.title}`}
              >
                {playing?.index === cue.index && playing.bank === 'scorebook' ? '■ Score' : '▶ Score'}
              </button>
            </div>
          </section>
        ))}
      </main>

      <div className="soundtrack-footer">
        <button
          type="button"
          onClick={() => {
            chiptune.stopMusic()
            setPlaying(null)
          }}
          className="soundtrack-secondary-button"
        >
          Stop all
        </button>
        <button type="button" onClick={stopAndBack} className="soundtrack-primary-button">
          Home
        </button>
      </div>
    </div>
  )
}
