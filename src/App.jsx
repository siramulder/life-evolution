import { useReducer, useEffect } from 'react'
import { initialState, gameReducer } from './game/gameState'
import { Universe } from './components/Universe'
import { Stats } from './components/Stats'

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 100)
    return () => clearInterval(interval)
  }, [])

  const handleClick = () => dispatch({ type: 'CLICK' })

  return (
    <>
      <Stats biomass={state.biomass} perSec={state.perSec} />
      <Universe onClick={handleClick} />
    </>
  )
}

export default App
