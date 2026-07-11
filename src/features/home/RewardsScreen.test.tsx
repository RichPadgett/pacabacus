import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DEFAULT_WORLD_LEVELS } from '@/features/learning/learningWorlds'
import { useProfile } from '@/features/profile/profileStore'
import { RewardsScreen } from './RewardsScreen'

describe('RewardsScreen', () => {
  beforeEach(() => {
    localStorage.clear()
    useProfile.setState({
      activeProfileId: null,
      profiles: [],
      username: null,
      worldLevels: { ...DEFAULT_WORLD_LEVELS },
      playWorldLevels: { ...DEFAULT_WORLD_LEVELS },
      worldStars: {},
      treasureCoins: 0,
      ownedCharacters: [],
      ownedBuddies: [],
      buddies: [],
      buddyUseCounts: {},
    })
  })

  it('shows progress written by the current per-world game flow', async () => {
    const user = userEvent.setup()
    useProfile.getState().createProfile('Ada', 'dog')
    useProfile.getState().completeWorldLevel('pacabacus', 1, 3)
    render(<RewardsScreen onBack={() => undefined} />)

    expect(screen.getByText(/1 levels · 3 ⭐ · 25 gold/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Badges' }))
    expect(screen.getByText('BADGES (1/9)')).toBeInTheDocument()
  })
})
