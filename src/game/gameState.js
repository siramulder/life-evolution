// Game state — the single source of truth for everything the game tracks.
// `initialState` is the starting point (also what a refresh resets to, since
// MVP 1.0 has no save/load).

import { upgrades } from './upgrades'

// Ownership count for every upgrade, all starting at 0.
// Derived from upgrades.js so the keys never drift out of sync:
// add an upgrade there -> it shows up here automatically.
// Result: { aminoAcids: 0, cellDivision: 0, photosynthesis: 0 }
const ownedUpgrades = Object.fromEntries(upgrades.map((u) => [u.id, 0]))

export const initialState = {
  biomass: 0, // current biomass — the core currency, spent on upgrades
  perClick: 1, // biomass gained per manual click (base = 1)
  perSec: 0, // passive biomass per second from auto-generators
  currentScale: 1, // the scale the player is currently at (1–3)
  unlockedScales: [1], // scales reached so far; starts with Primordial Soup
  ownedUpgrades, // how many of each upgrade the player owns
}

// gameReducer — the ONLY place game state changes.
// Given the current state + an action, it returns a BRAND NEW state object.
// It never mutates `state` directly (see the spread-operator note in CLAUDE/chat).
export function gameReducer(state, action) {
  switch (action.type) {
    // Manual click: gain `perClick` biomass.
    case 'CLICK':
      return {
        ...state,
        biomass: state.biomass + state.perClick,
      }

    // Passive tick (fires every 100ms = 10×/sec), so add 1/10th of perSec.
    case 'TICK':
      return {
        ...state,
        biomass: state.biomass + state.perSec / 10,
      }

    // Buy one unit of an upgrade, if the player can afford it.
    case 'BUY_UPGRADE': {
      const { upgradeId } = action.payload
      const upgrade = upgrades.find((u) => u.id === upgradeId)

      // Unknown id — ignore (defensive guard, prevents a crash).
      if (!upgrade) return state

      const owned = state.ownedUpgrades[upgradeId]
      const cost = upgrade.baseCost * upgrade.costMultiplier ** owned

      // Can't afford it — nothing changes.
      if (state.biomass < cost) return state

      return {
        ...state,
        biomass: state.biomass - cost,
        // Auto-generator boosts passive income; click-multiplier boosts click yield.
        perSec:
          upgrade.type === 'auto-generator'
            ? state.perSec + upgrade.increment
            : state.perSec,
        perClick:
          upgrade.type === 'click-multiplier'
            ? state.perClick + upgrade.increment
            : state.perClick,
        // Nested object: spread it too, then bump just this one key.
        ownedUpgrades: {
          ...state.ownedUpgrades,
          [upgradeId]: owned + 1,
        },
      }
    }

    // Reach a new scale: advance currentScale + remember it in unlockedScales.
    case 'UNLOCK_SCALE': {
      const { scaleId } = action.payload
      return {
        ...state,
        currentScale: scaleId,
        unlockedScales: [...state.unlockedScales, scaleId],
      }
    }

    // Unknown action: return state untouched.
    default:
      return state
  }
}
