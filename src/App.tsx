import { useState } from 'react'
import { ArcadeGame } from '@/features/arcade/ArcadeGame'
import { SetupScreen } from '@/features/arcade/SetupScreen'

function App() {
  const [playing, setPlaying] = useState(false)

  return playing ? (
    <ArcadeGame key="game" onExit={() => setPlaying(false)} />
  ) : (
    <SetupScreen onStart={() => setPlaying(true)} />
  )
}

export default App
