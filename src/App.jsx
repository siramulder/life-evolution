import { initialState, gameReducer } from './game/gameState'

// เพิ่ม 2 บรรทัดนี้ชั่วคราว เพื่อให้ console เข้าถึงได้
window.gameReducer = gameReducer
window.initialState = initialState

function App() {
  return <h1>Life Evolution 🧬</h1>
}

export default App