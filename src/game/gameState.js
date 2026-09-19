// Game state — the single source of truth for everything the game tracks.
// `initialState` is the starting point (also what a refresh resets to, since
// MVP 1.0 has no save/load).

import { upgrades } from './upgrades'
import { scales } from './scales'

// Ownership count for every upgrade, all starting at 0.
// Derived from upgrades.js so the keys never drift out of sync:
// add an upgrade there -> it shows up here automatically.
// Result: { aminoAcids: 0, cellDivision: 0, photosynthesis: 0 }
const ownedUpgrades = Object.fromEntries(upgrades.map((u) => [u.id, 0]))

// MVP 1.0's win condition: this much biomass while already at the final scale.
// Lives here rather than in scales.js on purpose -- it is a finish line INSIDE
// scale 3, not the threshold of a 4th scale, so it must not be walked by the
// scale-unlock logic that iterates `scales`.
const ENDING_BIOMASS = 5000

export const initialState = {
  biomass: 0, // current biomass — the core currency, spent on upgrades
  perClick: 1, // biomass gained per manual click (base = 1)
  perSec: 0, // passive biomass per second from auto-generators
  currentScale: 1, // the scale the player is currently at (1–3)
  unlockedScales: [1], // scales reached so far; starts with Primordial Soup
  ownedUpgrades, // how many of each upgrade the player owns
  pendingModalScale: null, // scale id awaiting a celebration modal (null = none)

  // Two flags, deliberately NOT collapsed into one (see the TICK branch below):
  hasEnded: false, // one-way latch — true forever once the ending has fired
  pendingEnding: false, // ending modal awaiting dismissal; cleared by DISMISS_ENDING
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
    case 'TICK': {
      const newBiomass = state.biomass + state.perSec / 10

      // Auto-unlock check: has biomass reached the NEXT scale's threshold?
      // Only ever look one scale ahead (currentScale + 1): biomass grows in tiny
      // steps, so it can't leap past two scales in a single 100ms tick.
      const nextScale = scales.find((s) => s.id === state.currentScale + 1)

      if (nextScale && newBiomass >= nextScale.threshold) {
        return {
          ...state,
          biomass: newBiomass,
          currentScale: nextScale.id,
          // Guard against duplicates in case a tick ever re-checks the same scale.
          unlockedScales: state.unlockedScales.includes(nextScale.id)
            ? state.unlockedScales
            : [...state.unlockedScales, nextScale.id],
          // Flag this scale for the celebration modal. TICK is the moment the
          // unlock happens, so it's the right place to raise the flag. Cleared
          // by DISMISS_MODAL; the includes-guard above means this fires once.
          pendingModalScale: nextScale.id,
        }
      }

      // Win condition — checked AFTER the scale-unlock branch above, which
      // returns early. Uses `newBiomass` (this tick's value), not state.biomass,
      // so the ending fires on the same tick the player crosses the line.
      //
      // ⚠️ TWO FLAGS, ON PURPOSE — do not collapse into one. Buying an upgrade
      // after the ending can drop biomass back under ENDING_BIOMASS and then
      // climb over it again; with a single flag the modal would re-fire on every
      // crossing. `hasEnded` is a one-way latch that never returns to false, and
      // it alone gates this branch — that is what makes the ending fire exactly
      // once. `pendingEnding` only drives the modal and is cleared by
      // DISMISS_ENDING, so dismissing can never re-arm the trigger.
      if (!state.hasEnded && state.currentScale === 3 && newBiomass >= ENDING_BIOMASS) {
        return {
          ...state,
          biomass: newBiomass,
          hasEnded: true,
          pendingEnding: true,
        }
      }

      // No unlock or ending this tick — just add the biomass.
      return {
        ...state,
        biomass: newBiomass,
      }
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

    // Player closed the scale-unlock celebration modal — clear the flag.
    // TICK won't re-raise it: the same scale is already in unlockedScales.
    case 'DISMISS_MODAL':
      return {
        ...state,
        pendingModalScale: null,
      }

    // Player closed the ending modal — clear ONLY pendingEnding.
    // `hasEnded` is deliberately left true: it is the latch that stops TICK
    // from ever re-raising the ending, so resetting it here would reintroduce
    // exactly the repeat-fire bug the two-flag split exists to prevent.
    case 'DISMISS_ENDING':
      return {
        ...state,
        pendingEnding: false,
      }

    // Unknown action: return state untouched.
    default:
      return state
  }
}
