import { useReducer, useEffect, useState } from 'react'
import { initialState, gameReducer } from './game/gameState'
import { scales } from './game/scales'
import { upgrades } from './game/upgrades'
import { Background } from './components/Background'
import { FloatingElements } from './components/FloatingElements'
import { Universe } from './components/Universe'
import { Stats } from './components/Stats'
import { UpgradeList } from './components/UpgradeList'
import { ScaleUnlockModal } from './components/ScaleUnlockModal'
import { EndingModal } from './components/EndingModal'
import './styles/floating.css'

// --- Zoom-out on scale change -------------------------------------------------
// Advancing a scale pulls the camera back, so organisms introduced at EARLIER
// scales shrink: next to a Volvox colony, an amino acid should read as a speck.
// 0.5 = each new scale is twice as zoomed out as the last.
const ZOOM_PER_SCALE = 0.5

// The scale each upgrade belongs to, derived from upgrades.js so it can't drift
// out of sync. Result: { aminoAcids: 1, cellDivision: 2, photosynthesis: 3 }
const nativeScale = Object.fromEntries(upgrades.map((u) => [u.id, u.requireScale]))

// Size multiplier for an organism native to `native`, viewed from `current`.
// The current scale's own organism always renders full size; each scale of
// distance behind it halves. Math.max(0, …) guards the impossible case of an
// organism from a scale we have not reached yet (would otherwise magnify it).
const zoomFor = (native, current) => ZOOM_PER_SCALE ** Math.max(0, current - native)

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Transient click animations — NOT game state, just short-lived UI bubbles.
  const [floatingNumbers, setFloatingNumbers] = useState([])

  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 100)
    return () => clearInterval(interval)
  }, [])

  const handleClick = (e) => {
    // Spawn a floating "+N" bubble at the cursor position.
    const bubble = {
      id: Date.now() + Math.random(), // unique even on rapid clicks
      x: e.clientX,
      y: e.clientY,
      value: state.perClick,
    }
    setFloatingNumbers((prev) => [...prev, bubble])

    // Remove it after the animation finishes (600ms) so the list never grows forever.
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((b) => b.id !== bubble.id))
    }, 600)

    dispatch({ type: 'CLICK' })
  }

  // Buy an upgrade. The reducer re-checks affordability before deducting,
  // so this stays safe even if the button's disabled state lags behind.
  const handleBuyUpgrade = (upgradeId) => {
    dispatch({ type: 'BUY_UPGRADE', payload: { upgradeId } })
  }

  // Resolve the pending scale id (set by TICK on unlock) to its scale object.
  // null when no modal is due → ScaleUnlockModal renders nothing.
  const modalScale = state.pendingModalScale
    ? scales.find((s) => s.id === state.pendingModalScale)
    : null

  // The scale the player is currently on — drives the background palette and
  // the label under the core. Derived from state, never stored separately.
  const currentScaleObj = scales.find((s) => s.id === state.currentScale)

  return (
    <>
      <Background currentScale={state.currentScale} />
      <FloatingElements
        count={state.ownedUpgrades.aminoAcids}
        variant="float-amino"
        seed={0}
        zoom={zoomFor(nativeScale.aminoAcids, state.currentScale)}
      />
      <FloatingElements
        count={state.ownedUpgrades.cellDivision}
        variant="float-cell"
        seed={1000}
        zoom={zoomFor(nativeScale.cellDivision, state.currentScale)}
      />
      <FloatingElements
        count={state.ownedUpgrades.photosynthesis}
        variant="float-photo"
        seed={2000}
        zoom={zoomFor(nativeScale.photosynthesis, state.currentScale)}
      />
      <Stats biomass={state.biomass} perSec={state.perSec} />
      <Universe onClick={handleClick} scaleName={currentScaleObj.name} />
      <UpgradeList state={state} onBuy={handleBuyUpgrade} />
      {floatingNumbers.map((b) => (
        <div
          key={b.id}
          className="floating-number"
          style={{ left: b.x, top: b.y }}
        >
          +{b.value}
        </div>
      ))}
      <ScaleUnlockModal
        scale={modalScale}
        onDismiss={() => dispatch({ type: 'DISMISS_MODAL' })}
      />
      <EndingModal
        show={state.pendingEnding}
        onDismiss={() => dispatch({ type: 'DISMISS_ENDING' })}
      />
    </>
  )
}

export default App
