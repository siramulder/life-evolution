import { useReducer, useEffect } from 'react'
import { initialState, gameReducer } from './game/gameState'

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Passive income: fire TICK every 100ms (= 10x per second).
  // Cleanup clears the interval when App unmounts — prevents a memory leak
  // and double-ticking if React mounts the component twice (StrictMode).
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK' })
    }, 100)

    return () => clearInterval(interval)
  }, []) // [] = run once on mount, never re-run

  // Temporary: expose state + dispatch to browser console for verification.
  // Remove after B4 is confirmed.
  window.appState = state
  window.appDispatch = dispatch

  return <h1>Life Evolution 🧬</h1>
}

export default App
