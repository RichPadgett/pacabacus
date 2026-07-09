import { useCallback, useState } from 'react'
import {
  abacusFromValue,
  abacusValue,
  type AbacusState,
  type RodState,
} from '@/types/abacus'

interface UseAbacusValueOptions {
  rodCount: number
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
}

export function useAbacusValue({
  rodCount,
  value,
  defaultValue,
  onChange,
}: UseAbacusValueOptions) {
  const isControlled = value !== undefined
  const [internalRods, setInternalRods] = useState<AbacusState>(() =>
    abacusFromValue(defaultValue ?? value ?? 0, rodCount),
  )

  const rods = isControlled ? abacusFromValue(value, rodCount) : internalRods

  const setRod = useCallback(
    (index: number, next: RodState) => {
      const nextRods = rods.map((rod, i) => (i === index ? next : rod))
      if (!isControlled) setInternalRods(nextRods)
      onChange?.(abacusValue(nextRods))
    },
    [rods, isControlled, onChange],
  )

  const setValue = useCallback(
    (next: number) => {
      const nextRods = abacusFromValue(next, rodCount)
      if (!isControlled) setInternalRods(nextRods)
      onChange?.(abacusValue(nextRods))
    },
    [rodCount, isControlled, onChange],
  )

  return { rods, setRod, setValue, value: abacusValue(rods) }
}
