import '../styles/universe.css'

// Universe — the full-screen clickable area. Clicking anywhere fires onClick,
// which the parent (App) wires to dispatch a CLICK action.
// `scaleName` is just display text (e.g. "Single Cell") shown under the core.
export function Universe({ onClick, scaleName }) {
  return (
    <div className="universe" onClick={(e) => onClick(e)}>
      <div className="pulse-circle"></div>
      <div className="scale-label">{scaleName}</div>
    </div>
  )
}
