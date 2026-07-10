import { useState } from 'react'
import { ArcadeGame } from '@/features/arcade/ArcadeGame'
import { SetupScreen } from '@/features/arcade/SetupScreen'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import { AdventureMap } from '@/features/home/AdventureMap'
import { CharacterSelect } from '@/features/home/CharacterSelect'
import { HomeScreen } from '@/features/home/HomeScreen'
import { RewardsScreen } from '@/features/home/RewardsScreen'
import { RainGame } from '@/features/rain/RainGame'

type Screen =
  | 'home'
  | 'characters'
  | 'rewards'
  | 'freeplay-setup'
  | 'adventure-map'
  | 'adventure'
  | 'free-game'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const mode = useArcadeSettings((s) => s.mode)
  const goHome = () => setScreen('home')

  switch (screen) {
    case 'characters':
      return <CharacterSelect onBack={goHome} />
    case 'rewards':
      return <RewardsScreen onBack={goHome} />
    case 'freeplay-setup':
      return <SetupScreen onStart={() => setScreen('free-game')} onHome={goHome} />
    case 'adventure-map':
      return <AdventureMap onStart={() => setScreen('adventure')} onBack={goHome} />
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
          onAdventure={() => setScreen('adventure')}
          onCharacters={() => setScreen('characters')}
          onRewards={() => setScreen('rewards')}
          onFreePlay={() => setScreen('freeplay-setup')}
        />
      )
  }
}

export default App
