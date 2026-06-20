import { useReducer, useEffect } from 'react'
import { initialState, gameReducer } from './game/gameState'
import { Universe } from './components/Universe'

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Temp: expose for testing (removed once Stats shows biomass in C2)
  window.state = state
  window.dispatch = dispatch

  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 100)
    return () => clearInterval(interval)
  }, [])

  const handleClick = () => dispatch({ type: 'CLICK' })

  return <Universe onClick={handleClick} />
}

export default App
