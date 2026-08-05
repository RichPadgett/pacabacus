import { useState } from 'react'
import { ArcadeGame } from '@/features/arcade/ArcadeGame'
import { SetupScreen } from '@/features/arcade/SetupScreen'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import { CharacterSelect } from '@/features/home/CharacterSelect'
import { HomeScreen } from '@/features/home/HomeScreen'
import { PreGameScreen } from '@/features/home/PreGameScreen'
import { RewardsScreen } from '@/features/home/RewardsScreen'
import { RainGame } from '@/features/rain/RainGame'

type Screen =
  | 'home'
  | 'characters'
  | 'rewards'
  | 'freeplay-setup'
  | 'pregame'
  | 'adventure'
  | 'free-game'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [characterBack, setCharacterBack] = useState<Screen>('home')
  const mode = useArcadeSettings((s) => s.mode)
  const goHome = () => setScreen('home')

  switch (screen) {
    case 'characters':
      return <CharacterSelect onBack={() => setScreen(characterBack)} />
    case 'rewards':
      return <RewardsScreen onBack={goHome} />
    case 'freeplay-setup':
      return <SetupScreen onStart={() => setScreen('free-game')} onHome={goHome} />
    case 'pregame':
      return (
        <PreGameScreen
          onStart={() => setScreen('adventure')}
          onLineup={() => {
            setCharacterBack('pregame')
            setScreen('characters')
          }}
          onBack={goHome}
        />
      )
    case 'adventure':
      return <ArcadeGame key="adventure" mode="adventure" onExit={goHome} />
    case 'free-game':
      return mode === 'rain' ? (
        <RainGame key="rain" onExit={() => setScreen('freeplay-setup')} />
      ) : (
        <ArcadeGame key="free" mode="free" onExit={() => setScreen('freeplay-setup')} />
      )
    default:
      return (
        <HomeScreen
          onPreGame={() => setScreen('pregame')}
          onCharacters={() => {
            setCharacterBack('home')
            setScreen('characters')
          }}
          onRewards={() => setScreen('rewards')}
          onFreePlay={() => setScreen('freeplay-setup')}
        />
      )
  }
}

export default App
