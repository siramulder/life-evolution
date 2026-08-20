// Upgrade definitions — the 3 purchasable upgrades of MVP 1.0.
// Cost grows exponentially: cost = baseCost * (costMultiplier ^ owned).
//
// Two value fields per upgrade, on purpose:
//   - `effect`    : human-readable string for the UI (e.g. '+0.2 biomass/sec')
//   - `increment` : the raw number the game logic adds (0.2) to perSec or perClick
//
// `type` decides where `increment` is applied:
//   - 'auto-generator'  -> adds to perSec  (passive income)
//   - 'click-multiplier' -> adds to perClick (manual click yield)
//
// `requireScale` links to scales.js id — upgrade is hidden until that scale unlocks.

export const upgrades = [
  {
    id: 'aminoAcids',
    name: 'Amino Acids',
    type: 'auto-generator',
    effect: '+0.2 biomass/sec',
    increment: 0.2,
    baseCost: 10,
    costMultiplier: 1.15,
    requireScale: 1,
  },
  {
    // id stays 'cellDivision' — it is the state key in ownedUpgrades and the
    // link to the .float-cell variant. Only the displayed `name` changed.
    id: 'cellDivision',
    name: 'Amoeba',
    type: 'click-multiplier',
    effect: '+1 biomass/click',
    increment: 1,
    baseCost: 50,
    costMultiplier: 1.3,
    requireScale: 2,
  },
  {
    // id stays 'photosynthesis' — it is the state key in ownedUpgrades and the
    // link to the .float-photo variant. Only the displayed `name` changed.
    id: 'photosynthesis',
    name: 'Volvox',
    type: 'auto-generator',
    effect: '+5 biomass/sec',
    increment: 5,
    baseCost: 500,
    costMultiplier: 1.2,
    requireScale: 3,
  },
]
