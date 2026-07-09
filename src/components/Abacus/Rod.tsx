import type { RodState } from '@/types/abacus'
import { Bead } from './Bead'

interface RodProps {
  rod: RodState
  onChange: (next: RodState) => void
  readOnly?: boolean
  label?: string
}

export function Rod({ rod, onChange, readOnly, label }: RodProps) {
  const activeEarthCount = rod.earthUp
  const inactiveEarthCount = 4 - rod.earthUp

  return (
    <div className="relative flex w-20 flex-col items-center">
      <div className="absolute top-0 bottom-5 w-1 rounded bg-indigo-400/70" />

      {/* heaven deck: 1 bead, worth 5, active = pushed down toward beam */}
      <div className="flex h-24 w-full flex-col items-center pt-1 pb-1">
        {rod.heavenDown && <div className="flex-1" />}
        <Bead
          tone="heaven"
          active={rod.heavenDown}
          readOnly={readOnly}
          onClick={() => onChange({ ...rod, heavenDown: !rod.heavenDown })}
        />
        {!rod.heavenDown && <div className="flex-1" />}
      </div>

      <div className="z-10 h-1.5 w-full rounded bg-indigo-400" />

      {/* earth deck: 4 beads, worth 1 each, active = pushed up toward beam */}
      <div className="flex h-44 w-full flex-col items-center gap-1.5 pt-1.5">
        {Array.from({ length: activeEarthCount }).map((_, i) => (
          <Bead
            key={`active-${i}`}
            tone="earth"
            active
            readOnly={readOnly}
            onClick={() => onChange({ ...rod, earthUp: i })}
          />
        ))}
        <div className="flex-1" />
        {Array.from({ length: inactiveEarthCount }).map((_, i) => (
          <Bead
            key={`inactive-${i}`}
            tone="earth"
            active={false}
            readOnly={readOnly}
            onClick={() => onChange({ ...rod, earthUp: rod.earthUp + i + 1 })}
          />
        ))}
      </div>

      {label && <div className="h-5 text-xs text-indigo-300">{label}</div>}
    </div>
  )
}
