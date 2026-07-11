/** Renders an 8-bit sprite map as a crisp SVG grid. */
export function PixelSprite({
  map,
  palette,
  size,
  style,
  className,
}: {
  map: string[]
  palette: Record<string, string>
  size: number
  style?: React.CSSProperties
  className?: string
}) {
  const rows = map.length
  const cols = map[0].length
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      style={style}
      className={className}
    >
      {map.flatMap((row, rowIndex) =>
        [...row].map((character, columnIndex) =>
          character !== '.' && palette[character] ? (
            <rect
              key={`${rowIndex}-${columnIndex}`}
              x={columnIndex}
              y={rowIndex}
              width={1}
              height={1}
              fill={palette[character]}
            />
          ) : null,
        ),
      )}
    </svg>
  )
}
