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
        : 'bg-amber-200 border-amber-400'
      : active
        ? 'bg-sky-500 border-sky-700'
        : 'bg-sky-300 border-sky-500'

  return (
    <button
      type="button"
      disabled={readOnly}
      onClick={onClick}
      aria-pressed={active}
      className={[
        'h-4 w-9 shrink-0 rounded-full border-b-2 transition-colors',
        toneClasses,
        readOnly ? 'cursor-default' : 'cursor-pointer hover:brightness-105',
      ].join(' ')}
    />
  )
}
