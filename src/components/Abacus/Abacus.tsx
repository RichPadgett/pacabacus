import { Rod } from './Rod'
import { useAbacusValue } from './useAbacusValue'

interface AbacusProps {
  rodCount: number
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  readOnly?: boolean
}

export function Abacus({
  rodCount,
  value,
  defaultValue,
  onChange,
  readOnly,
}: AbacusProps) {
  const { rods, setRod } = useAbacusValue({
    rodCount,
    value,
    defaultValue,
    onChange,
  })

  return (
    <div className="inline-flex rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      {rods.map((rod, i) => (
        <Rod
          key={i}
          rod={rod}
          onChange={(next) => setRod(i, next)}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}
