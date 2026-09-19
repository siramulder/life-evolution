import { describe, it, expect } from 'vitest'
import { initialState, gameReducer } from './gameState'
import { upgrades } from './upgrades'

// Local state factory — deliberately NOT imported from gameState, so each test
// can construct exactly the situation it needs (mid-game, post-ending, etc.)
// without depending on whatever `initialState` happens to be.
const makeState = (overrides = {}) => ({
  biomass: 0,
  perClick: 1,
  perSec: 0,
  currentScale: 1,
  unlockedScales: [1],
  ownedUpgrades: { aminoAcids: 0, cellDivision: 0, photosynthesis: 0 },
  pendingModalScale: null,
  hasEnded: false,
  pendingEnding: false,
  ...overrides,
})

const tick = (state) => gameReducer(state, { type: 'TICK' })
const tickN = (state, n) => {
  let s = state
  for (let i = 0; i < n; i++) s = tick(s)
  return s
}

describe('initialState', () => {
  it('has the ending flags, both false', () => {
    expect(initialState.hasEnded).toBe(false)
    expect(initialState.pendingEnding).toBe(false)
  })

  it('still has every pre-existing field', () => {
    expect(initialState.biomass).toBe(0)
    expect(initialState.perClick).toBe(1)
    expect(initialState.perSec).toBe(0)
    expect(initialState.currentScale).toBe(1)
    expect(initialState.unlockedScales).toEqual([1])
    expect(initialState.pendingModalScale).toBeNull()
  })

  it('derives ownedUpgrades from upgrades.js with every id at 0', () => {
    // Asserted against upgrades.js rather than a hardcoded list, so adding an
    // upgrade there can't silently leave ownedUpgrades out of sync.
    expect(Object.keys(initialState.ownedUpgrades).sort()).toEqual(
      upgrades.map((u) => u.id).sort(),
    )
    expect(Object.values(initialState.ownedUpgrades).every((n) => n === 0)).toBe(true)
  })
})

describe('ending trigger', () => {
  it('does NOT trigger at 4900 biomass on scale 3', () => {
    const s = tick(makeState({ currentScale: 3, biomass: 4900, perSec: 5 }))
    expect(s.biomass).toBeCloseTo(4900.5)
    expect(s.hasEnded).toBe(false)
    expect(s.pendingEnding).toBe(false)
  })

  it('triggers when the tick carries biomass across 5000', () => {
    // 4999.9 + 5/10 = 5000.4 -> crosses on THIS tick.
    const s = tick(makeState({ currentScale: 3, biomass: 4999.9, perSec: 5 }))
    expect(s.hasEnded).toBe(true)
    expect(s.pendingEnding).toBe(true)
  })

  it('uses the post-tick biomass, not the pre-tick value', () => {
    // Pre-tick 4999.9 is BELOW the line; only newBiomass clears it. If the
    // reducer tested state.biomass this would not fire.
    const s = tick(makeState({ currentScale: 3, biomass: 4999.9, perSec: 5 }))
    expect(s.pendingEnding).toBe(true)
    expect(s.biomass).toBeCloseTo(5000.4)
  })

  it('fires at exactly 5000 (>= not >)', () => {
    const s = tick(makeState({ currentScale: 3, biomass: 5000, perSec: 0 }))
    expect(s.hasEnded).toBe(true)
  })

  it('leaves scale progression untouched when it fires', () => {
    const before = makeState({
      currentScale: 3,
      biomass: 4999.9,
      perSec: 5,
      unlockedScales: [1, 2, 3],
      pendingModalScale: null,
    })
    const s = tick(before)
    expect(s.pendingEnding).toBe(true)
    expect(s.currentScale).toBe(3)
    expect(s.unlockedScales).toEqual([1, 2, 3])
    expect(s.pendingModalScale).toBeNull()
  })

  it('does not mutate the state object passed in', () => {
    const before = makeState({ currentScale: 3, biomass: 4999.9, perSec: 5 })
    tick(before)
    expect(before.hasEnded).toBe(false)
    expect(before.pendingEnding).toBe(false)
    expect(before.biomass).toBe(4999.9)
  })
})

describe('scale guard', () => {
  it('does NOT trigger at 6000 biomass on scale 1', () => {
    const s = tick(makeState({ currentScale: 1, biomass: 6000, perSec: 5 }))
    expect(s.hasEnded).toBe(false)
    expect(s.pendingEnding).toBe(false)
  })

  it('does NOT trigger at 6000 biomass on scale 2', () => {
    const s = tick(makeState({ currentScale: 2, biomass: 6000, perSec: 5, unlockedScales: [1, 2] }))
    expect(s.hasEnded).toBe(false)
    expect(s.pendingEnding).toBe(false)
  })
})

describe('DISMISS_ENDING', () => {
  it('clears pendingEnding but keeps hasEnded latched', () => {
    const fired = tick(makeState({ currentScale: 3, biomass: 5000, perSec: 0 }))
    const s = gameReducer(fired, { type: 'DISMISS_ENDING' })
    expect(s.pendingEnding).toBe(false)
    expect(s.hasEnded).toBe(true)
  })

  it('survives being dispatched 3 times without corrupting state', () => {
    const fired = tick(
      makeState({ currentScale: 3, biomass: 5000, perSec: 5, unlockedScales: [1, 2, 3] }),
    )
    let s = fired
    for (let i = 0; i < 3; i++) s = gameReducer(s, { type: 'DISMISS_ENDING' })
    expect(s.pendingEnding).toBe(false)
    expect(s.hasEnded).toBe(true)
    expect(s.biomass).toBe(fired.biomass)
    expect(s.currentScale).toBe(3)
    expect(s.unlockedScales).toEqual([1, 2, 3])
    expect(s.ownedUpgrades).toEqual(fired.ownedUpgrades)
  })
})

describe('never re-triggers (the reason there are two flags)', () => {
  it('stays dismissed across 300 ticks above the threshold', () => {
    let s = tick(makeState({ currentScale: 3, biomass: 5000, perSec: 50, unlockedScales: [1, 2, 3] }))
    expect(s.pendingEnding).toBe(true)
    s = gameReducer(s, { type: 'DISMISS_ENDING' })
    s = tickN(s, 300)
    expect(s.pendingEnding).toBe(false)
    expect(s.hasEnded).toBe(true)
  })

  it('does not re-fire after spending back below 5000 and climbing over again', () => {
    // Fire, dismiss, drop to 4500 (as a purchase would), then idle back up.
    let s = tick(makeState({ currentScale: 3, biomass: 5000, perSec: 50, unlockedScales: [1, 2, 3] }))
    s = gameReducer(s, { type: 'DISMISS_ENDING' })
    s = { ...s, biomass: 4500 }
    expect(s.biomass).toBeLessThan(5000)

    s = tickN(s, 300) // 300 * 5 = +1500 -> well past 5000 again
    expect(s.biomass).toBeGreaterThan(5000)
    expect(s.pendingEnding).toBe(false) // <-- the one-flag bug would make this true
    expect(s.hasEnded).toBe(true)
  })

  it('does not re-fire when a real BUY_UPGRADE drops biomass below the line', () => {
    // Same scenario but spending through the actual reducer, not a hand-set value.
    let s = tick(makeState({ currentScale: 3, biomass: 5000, perSec: 50, unlockedScales: [1, 2, 3] }))
    s = gameReducer(s, { type: 'DISMISS_ENDING' })
    for (let i = 0; i < 2; i++) {
      s = gameReducer(s, { type: 'BUY_UPGRADE', payload: { upgradeId: 'photosynthesis' } })
    }
    expect(s.biomass).toBeLessThan(5000)
    expect(s.pendingEnding).toBe(false)

    s = tickN(s, 300)
    expect(s.biomass).toBeGreaterThan(5000)
    expect(s.pendingEnding).toBe(false)
  })
})

describe('other actions never trigger the ending', () => {
  it('CLICK crossing 5000 does not set the ending flags', () => {
    const s = gameReducer(
      makeState({ currentScale: 3, biomass: 4999, perClick: 10 }),
      { type: 'CLICK' },
    )
    expect(s.biomass).toBe(5009)
    expect(s.hasEnded).toBe(false)
    expect(s.pendingEnding).toBe(false)
  })

  it('BUY_UPGRADE leaves hasEnded/pendingEnding alone', () => {
    const s = gameReducer(
      makeState({ currentScale: 3, biomass: 9999 }),
      { type: 'BUY_UPGRADE', payload: { upgradeId: 'photosynthesis' } },
    )
    expect(s.ownedUpgrades.photosynthesis).toBe(1)
    expect(s.hasEnded).toBe(false)
    expect(s.pendingEnding).toBe(false)
  })

  it('an unknown action returns the same state object', () => {
    const before = makeState({ currentScale: 3, biomass: 9999 })
    expect(gameReducer(before, { type: 'NOT_A_REAL_ACTION' })).toBe(before)
  })
})

describe('regression — pre-existing behaviour still works', () => {
  it('crossing 100 on scale 1 unlocks scale 2 and queues its modal', () => {
    const s = tick(makeState({ currentScale: 1, biomass: 99.9, perSec: 5 }))
    expect(s.currentScale).toBe(2)
    expect(s.unlockedScales).toEqual([1, 2])
    expect(s.pendingModalScale).toBe(2)
  })

  it('crossing 1000 on scale 2 unlocks scale 3', () => {
    const s = tick(
      makeState({ currentScale: 2, biomass: 999.9, perSec: 5, unlockedScales: [1, 2] }),
    )
    expect(s.currentScale).toBe(3)
    expect(s.unlockedScales).toEqual([1, 2, 3])
    expect(s.pendingModalScale).toBe(3)
  })

  it('a scale-unlock tick does not also fire the ending', () => {
    const s = tick(
      makeState({ currentScale: 2, biomass: 999.9, perSec: 5, unlockedScales: [1, 2] }),
    )
    expect(s.currentScale).toBe(3)
    expect(s.pendingEnding).toBe(false)
    expect(s.hasEnded).toBe(false)
  })

  it('unlockedScales never accumulates duplicates over 300 ticks', () => {
    const s = tickN(makeState({ currentScale: 1, biomass: 99.9, perSec: 5 }), 300)
    expect(new Set(s.unlockedScales).size).toBe(s.unlockedScales.length)
    expect(s.unlockedScales).toEqual([...s.unlockedScales].sort((a, b) => a - b))
  })

  it('DISMISS_MODAL clears pendingModalScale and nothing else', () => {
    const s = gameReducer(
      makeState({ currentScale: 2, pendingModalScale: 2, unlockedScales: [1, 2] }),
      { type: 'DISMISS_MODAL' },
    )
    expect(s.pendingModalScale).toBeNull()
    expect(s.currentScale).toBe(2)
    expect(s.hasEnded).toBe(false)
    expect(s.pendingEnding).toBe(false)
  })

  it('TICK below a threshold just advances biomass', () => {
    const s = tick(makeState({ currentScale: 1, biomass: 50, perSec: 1 }))
    expect(s.biomass).toBeCloseTo(50.1)
    expect(s.currentScale).toBe(1)
    expect(s.pendingModalScale).toBeNull()
  })

  it('CLICK adds exactly perClick', () => {
    const s = gameReducer(makeState({ biomass: 10, perClick: 7 }), { type: 'CLICK' })
    expect(s.biomass).toBe(17)
  })

  it('BUY_UPGRADE charges baseCost * multiplier^owned', () => {
    const amino = upgrades.find((u) => u.id === 'aminoAcids')
    // 3 already owned -> 4th costs 10 * 1.15^3
    const expectedCost = amino.baseCost * amino.costMultiplier ** 3
    const s = gameReducer(
      makeState({
        biomass: 1000,
        ownedUpgrades: { aminoAcids: 3, cellDivision: 0, photosynthesis: 0 },
      }),
      { type: 'BUY_UPGRADE', payload: { upgradeId: 'aminoAcids' } },
    )
    expect(s.biomass).toBeCloseTo(1000 - expectedCost)
    expect(s.ownedUpgrades.aminoAcids).toBe(4)
    expect(s.perSec).toBeCloseTo(amino.increment)
  })

  it('BUY_UPGRADE is refused when biomass is short', () => {
    const before = makeState({ biomass: 9 }) // amino costs 10
    const s = gameReducer(before, { type: 'BUY_UPGRADE', payload: { upgradeId: 'aminoAcids' } })
    expect(s).toBe(before)
  })

  it('a click-multiplier upgrade raises perClick, not perSec', () => {
    const amoeba = upgrades.find((u) => u.id === 'cellDivision')
    const s = gameReducer(
      makeState({ biomass: 1000, currentScale: 2 }),
      { type: 'BUY_UPGRADE', payload: { upgradeId: 'cellDivision' } },
    )
    expect(s.perClick).toBe(1 + amoeba.increment)
    expect(s.perSec).toBe(0)
  })
})
