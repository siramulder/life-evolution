import { upgrades } from '../game/upgrades'
import '../styles/upgrades.css'

// UpgradeList — shows a card per upgrade with its name, effect, owned count,
// and current cost. Cost is computed fresh on every render (see CLAUDE notes).
// Buy buttons come in D2.
export function UpgradeList({ state }) {
  return (
    <div className="upgrade-list">
      {upgrades.map((upgrade) => {
        const owned = state.ownedUpgrades[upgrade.id]
        const cost = upgrade.baseCost * upgrade.costMultiplier ** owned

        return (
          <div className="upgrade-card" key={upgrade.id}>
            <div className="upgrade-name">{upgrade.name}</div>
            <div className="upgrade-effect">{upgrade.effect}</div>
            <div className="upgrade-cost">Cost: {cost.toFixed(0)}</div>
            <div className="upgrade-owned">Owned: {owned}</div>
          </div>
        )
      })}
    </div>
  )
}
