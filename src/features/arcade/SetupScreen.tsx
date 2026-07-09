import type { MathLevel, OpsChoice } from '@/features/drills/problemGenerator'
import { Twinkles } from './ArcadeGame'
import {
  useArcadeSettings,
  type GameMode,
  type GameSpeed,
  type GhostDifficulty,
  type MaxAnswer,
} from './settingsStore'
import { THEMES, type ThemeId } from './themes'

interface OptionProps<T extends string | number> {
  title: string
  options: { value: T; label: string; sub?: string; icon?: React.ReactNode }[]
  current: T
  onPick: (value: T) => void
}

function OptionGroup<T extends string | number>({
  title,
  options,
  current,
  onPick,
}: OptionProps<T>) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold tracking-wide text-[var(--c-soft)]">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onPick(opt.value)}
            className={[
              'flex items-center gap-2 rounded-2xl border-2 px-4 py-2 text-left transition',
              current === opt.value
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                : 'border-[var(--c-border)] bg-[var(--c-panel)] text-slate-100 hover:brightness-125',
            ].join(' ')}
          >
            {opt.icon}
            <span>
              <span className="block font-bold">{opt.label}</span>
              {opt.sub && <span className="block text-xs opacity-75">{opt.sub}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function SetupScreen({ onStart, onHome }: { onStart: () => void; onHome?: () => void }) {
  const settings = useArcadeSettings()
  const theme = THEMES[settings.theme] ?? THEMES.stars

  return (
    <div
      className="relative flex min-h-svh flex-col items-center gap-6 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-6 text-slate-50"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}
      <header className="text-center">
        <h1 className="text-4xl font-black tracking-wide text-amber-300 [text-shadow:0_2px_0_#7a5a00]">
          PacAbacus
        </h1>
        <p className="mt-2 max-w-md text-[var(--c-soft)]">
          Solve problems on your abacus to earn moves. Steer through the maze,
          collect treasures, and stay ahead of the baddies!
        </p>
      </header>

      <div className="flex w-full max-w-xl flex-col gap-5 rounded-3xl border-2 border-[var(--c-border)] bg-black/20 p-6">
        <OptionGroup<GameMode>
          title="GAME"
          current={settings.mode}
          onPick={(mode) => settings.update({ mode })}
          options={[
            { value: 'maze', label: '👾 Maze Chase', sub: 'collect treasures' },
            { value: 'rain', label: '🧱 Number Rain', sub: 'pop falling math blocks' },
          ]}
        />
        <OptionGroup<ThemeId>
          title="YOUR COLORS"
          current={settings.theme}
          onPick={(t) => settings.update({ theme: t })}
          options={Object.values(THEMES).map((t) => ({
            value: t.id,
            label: `${t.emoji} ${t.name}`,
            icon: (
              <span
                className="inline-block h-6 w-6 rounded-full border-2"
                style={{
                  background: t.vars['--c-wall'],
                  borderColor: t.vars['--c-border'],
                }}
              />
            ),
          }))}
        />
        <OptionGroup<MathLevel>
          title="MATH LEVEL"
          current={settings.mathLevel}
          onPick={(mathLevel) => settings.update({ mathLevel })}
          options={[
            { value: 1, label: '1 · Bead slides', sub: '2+2, 6+3' },
            { value: 2, label: '2 · Making 5s', sub: '4+3, 6−2' },
            { value: 3, label: '3 · Making 10s', sub: '8+6, 12−7' },
            { value: 4, label: '4 · Two-digit', sub: '24+8, 31−6' },
            { value: 5, label: '5 · Mix it all', sub: 'everything!' },
          ]}
        />
        <OptionGroup<OpsChoice>
          title="MATH TYPE"
          current={settings.ops}
          onPick={(ops) => settings.update({ ops })}
          options={[
            { value: 'add', label: 'Adding' },
            { value: 'sub', label: 'Taking away' },
            { value: 'mixed', label: 'Both' },
          ]}
        />
        <OptionGroup<MaxAnswer>
          title="NUMBERS UP TO"
          current={settings.maxAnswer}
          onPick={(maxAnswer) => settings.update({ maxAnswer })}
          options={[
            { value: 10, label: '10' },
            { value: 20, label: '20' },
            { value: 50, label: '50' },
          ]}
        />
        <OptionGroup<GhostDifficulty>
          title="BADDIES"
          current={settings.ghosts}
          onPick={(ghosts) => settings.update({ ghosts })}
          options={[
            { value: 'off', label: 'Off', sub: 'practice mode' },
            { value: 'chill', label: '1 · Chill', sub: 'slow chaser' },
            { value: 'spooky', label: '2 · Spooky', sub: 'they team up' },
            { value: 'scary', label: '3 · Scary', sub: 'fast pack!' },
          ]}
        />
        <OptionGroup<GameSpeed>
          title="SPEED"
          current={settings.speed}
          onPick={(speed) => settings.update({ speed })}
          options={[
            { value: 'relaxed', label: 'Relaxed' },
            { value: 'normal', label: 'Normal' },
            { value: 'speedy', label: 'Speedy' },
          ]}
        />
      </div>

      <div className="flex items-center gap-3">
        {onHome && (
          <button
            type="button"
            onClick={onHome}
            className="rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-6 py-4 text-lg font-bold hover:brightness-125"
          >
            🏠
          </button>
        )}
        <button
          type="button"
          onClick={onStart}
          className="rounded-2xl border-4 border-emerald-600 bg-emerald-400 px-12 py-4 text-2xl font-black text-emerald-950 transition hover:brightness-110 active:scale-95"
        >
          Play! ▶
        </button>
      </div>
    </div>
  )
}
