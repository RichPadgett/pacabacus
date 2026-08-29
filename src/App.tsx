import { useState } from 'react'
import { ArcadeGame } from '@/features/arcade/ArcadeGame'
import { CharacterSelect } from '@/features/home/CharacterSelect'
import { HomeScreen } from '@/features/home/HomeScreen'
import { PreGameScreen } from '@/features/home/PreGameScreen'
import { RewardsScreen } from '@/features/home/RewardsScreen'
import { SoundtrackPreview } from '@/features/home/SoundtrackPreview'

type Screen =
  | 'home'
  | 'characters'
  | 'rewards'
  | 'soundtrack'
  | 'pregame'
  | 'adventure'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [characterBack, setCharacterBack] = useState<Screen>('home')
  const goHome = () => setScreen('home')

  switch (screen) {
    case 'characters':
      return <CharacterSelect onBack={() => setScreen(characterBack)} />
    case 'rewards':
      return <RewardsScreen onBack={goHome} />
    case 'soundtrack':
      return <SoundtrackPreview onBack={goHome} />
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
      return <ArcadeGame key="adventure" mode="adventure" learningWorld="pacabacus" onExit={goHome} />
    default:
      return (
        <HomeScreen
          onPreGame={() => setScreen('pregame')}
          onCharacters={() => {
            setCharacterBack('home')
            setScreen('characters')
          }}
          onRewards={() => setScreen('rewards')}
          onSoundtrack={() => setScreen('soundtrack')}
        />
      )
  }
}

export default App
