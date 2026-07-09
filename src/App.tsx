import { useState } from 'react'
import { Abacus } from '@/components/Abacus'

function App() {
  const [value, setValue] = useState(0)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-neutral-950 p-8 text-neutral-100">
      <h1 className="text-2xl font-semibold">PacAbacus</h1>
      <Abacus rodCount={4} value={value} onChange={setValue} />
      <p className="text-lg tabular-nums">{value}</p>
    </div>
  )
}

export default App
