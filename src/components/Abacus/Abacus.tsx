import { Rod } from './Rod'
import { useAbacusValue } from './useAbacusValue'

const PLACE_LABELS = ['ones', 'tens', 'hundreds', 'thousands']

interface AbacusProps {
  rodCount: number
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  readOnly?: boolean
  showLabels?: boolean
}

export function Abacus({
  rodCount,
  value,
  defaultValue,
  onChange,
  readOnly,
  showLabels,
}: AbacusProps) {
  const { rods, setRod } = useAbacusValue({
    rodCount,
    value,
    defaultValue,
    onChange,
  })

  return (
    <div className="inline-flex touch-none gap-2 rounded-2xl border-2 border-indigo-500 bg-indigo-950 p-4 overscroll-contain">
      {rods.map((rod, i) => (
        <Rod
          key={i}
          rod={rod}
          onChange={(next) => setRod(i, next)}
          readOnly={readOnly}
          label={showLabels ? PLACE_LABELS[rodCount - 1 - i] : undefined}
        />
      ))}
    </div>
  )
}
