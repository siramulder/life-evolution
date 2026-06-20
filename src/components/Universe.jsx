import '../styles/universe.css'

// Universe — the full-screen clickable area. Clicking anywhere fires onClick,
// which the parent (App) wires to dispatch a CLICK action.
export function Universe({ onClick }) {
  return (
    <div className="universe" onClick={onClick}>
      <span className="universe-icon">🌊</span>
    </div>
  )
}
