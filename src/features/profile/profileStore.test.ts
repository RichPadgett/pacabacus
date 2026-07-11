import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_WORLD_LEVELS } from '@/features/learning/learningWorlds'
import { useProfile } from './profileStore'

describe('per-world profile progress', () => {
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

  it('records a clear in the active world and synchronizes the player profile', () => {
    useProfile.getState().createProfile('Ada', 'dog')
    const result = useProfile.getState().completeWorldLevel('pacwords', 1, 3)
    const state = useProfile.getState()

    expect(state.worldLevels.pacwords).toBe(2)
    expect(state.playWorldLevels.pacwords).toBe(2)
    expect(state.worldStars['pacwords:1']).toBe(3)
    expect(state.profiles[0].worldStars['pacwords:1']).toBe(3)
    expect(result.coinsEarned).toBe(25)
  })

  it('does not award first-clear coins twice', () => {
    useProfile.getState().createProfile('Ada', 'dog')
    useProfile.getState().completeWorldLevel('pacabacus', 1, 2)
    const replay = useProfile.getState().completeWorldLevel('pacabacus', 1, 3)

    expect(replay.coinsEarned).toBe(2)
    expect(useProfile.getState().worldStars['pacabacus:1']).toBe(3)
  })
})
