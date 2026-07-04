import { upgrades } from '../game/upgrades'
import '../styles/upgrades.css'

// UpgradeList — shows a card per upgrade with its name, effect, owned count,
// and current cost. Cost is computed fresh on every render (see CLAUDE notes).
// onBuy(upgradeId) is called when the player clicks an affordable Buy button.
// Only upgrades whose requireScale has been reached are shown (D5).
export function UpgradeList({ state, onBuy }) {
  // Filter FIRST, then map — only render upgrades unlocked at the current scale.
  const unlocked = upgrades.filter((u) => u.requireScale <= state.currentScale)

  return (
    <div className="upgrade-list">
      {unlocked.map((upgrade) => {
        const owned = state.ownedUpgrades[upgrade.id]
        const cost = upgrade.baseCost * upgrade.costMultiplier ** owned
        const canAfford = state.biomass >= cost

        return (
          <div className="upgrade-card" key={upgrade.id}>
            <div className="upgrade-name">{upgrade.name}</div>
            <div className="upgrade-effect">{upgrade.effect}</div>
            <div className="upgrade-cost">Cost: {cost.toFixed(0)}</div>
            <div className="upgrade-owned">Owned: {owned}</div>
            <button
              className={canAfford ? 'buy-btn' : 'buy-btn disabled'}
              onClick={() => onBuy(upgrade.id)}
              disabled={!canAfford}
            >
              Buy
            </button>
          </div>
        )
      })}
    </div>
  )
}
