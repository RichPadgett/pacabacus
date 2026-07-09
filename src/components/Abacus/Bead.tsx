interface BeadProps {
  active: boolean
  onClick: () => void
  readOnly?: boolean
  tone: 'heaven' | 'earth'
}

export function Bead({ active, onClick, readOnly, tone }: BeadProps) {
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
      onClick={onClick}
      aria-pressed={active}
      className={[
        'h-7 w-16 shrink-0 rounded-full border-b-4 transition-colors',
        toneClasses,
        readOnly ? 'cursor-default' : 'cursor-pointer hover:brightness-110 active:scale-95',
      ].join(' ')}
    />
  )
}
