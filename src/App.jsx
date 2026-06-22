import { useReducer, useEffect, useState } from 'react'
import { initialState, gameReducer } from './game/gameState'
import { Universe } from './components/Universe'
import { Stats } from './components/Stats'
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

  return (
    <>
      <Stats biomass={state.biomass} perSec={state.perSec} />
      <Universe onClick={handleClick} />
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
