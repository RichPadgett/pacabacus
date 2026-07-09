import { useState } from 'react'
import { ArcadeGame } from '@/features/arcade/ArcadeGame'
import { SetupScreen } from '@/features/arcade/SetupScreen'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import { RainGame } from '@/features/rain/RainGame'

function App() {
  const [playing, setPlaying] = useState(false)
  const mode = useArcadeSettings((s) => s.mode)

  if (!playing) return <SetupScreen onStart={() => setPlaying(true)} />
  return mode === 'rain' ? (
    <RainGame key="rain" onExit={() => setPlaying(false)} />
  ) : (
    <ArcadeGame key="maze" onExit={() => setPlaying(false)} />
  )
}

export default App
