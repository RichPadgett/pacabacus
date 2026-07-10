import { useRef } from 'react'

interface BeadProps {
  active: boolean
  onClick: () => void
  /** flick a bead toward/away from the beam, like a real soroban */
  onSwipe?: (dir: 'up' | 'down') => void
  readOnly?: boolean
  tone: 'heaven' | 'earth'
}

const SWIPE_MIN_PX = 10

export function Bead({ active, onClick, onSwipe, readOnly, tone }: BeadProps) {
  const touchStartY = useRef<number | null>(null)
  const touchHandled = useRef(false)

  const toneClasses =
    tone === 'heaven'
      ? active
        ? 'bg-amber-400 border-amber-600'
        : 'bg-amber-200/60 border-amber-400/60'
      : active
        ? 'bg-sky-400 border-sky-600'
        : 'bg-sky-300/50 border-sky-500/50'

  return (
    <button
      type="button"
      disabled={readOnly}
      onClick={() => {
        if (touchHandled.current) {
          touchHandled.current = false
          return
        }
        onClick()
      }}
      onTouchStart={(e) => {
        e.preventDefault()
        touchStartY.current = e.touches[0].clientY
      }}
      onTouchMove={(e) => e.preventDefault()}
      onTouchEnd={(e) => {
        e.preventDefault()
        if (touchStartY.current === null || readOnly) return
        const dy = e.changedTouches[0].clientY - touchStartY.current
        touchStartY.current = null
        touchHandled.current = true
        if (Math.abs(dy) >= SWIPE_MIN_PX && onSwipe) {
          onSwipe(dy < 0 ? 'up' : 'down')
        } else {
          onClick()
        }
      }}
      aria-pressed={active}
      className={[
        'abacus-bead h-7 w-16 shrink-0 touch-none rounded-full border-b-4 transition-colors',
        toneClasses,
        readOnly ? 'cursor-default' : 'cursor-pointer hover:brightness-110 active:scale-95',
      ].join(' ')}
    />
  )
}
