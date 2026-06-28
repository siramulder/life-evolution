import { useReducer, useEffect, useState } from 'react'
import { initialState, gameReducer } from './game/gameState'
import { Universe } from './components/Universe'
import { Stats } from './components/Stats'
import { UpgradeList } from './components/UpgradeList'
import './styles/floating.css'

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

  return (
    <>
      <Stats biomass={state.biomass} perSec={state.perSec} />
      <Universe onClick={handleClick} />
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
    </>
  )
}

export default App
