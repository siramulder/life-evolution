import '../styles/ending-modal.css'

// EndingModal — the MVP 1.0 completion screen, shown once when the win
// condition fires (see `pendingEnding` in gameState.js).
//
// Same shape as ScaleUnlockModal — rendering is driven purely by whether
// `show` is set, so there is no internal open/closed state to keep in sync.
// It is a separate component rather than a flag on ScaleUnlockModal because
// its content is not a `scale` object and dismissing it advances nothing.
//
// Styling is deliberately its own file with `ending-` prefixed classes: it must
// not share selectors with modal.css, so the scale-unlock modal can never be
// restyled by accident from here.
export function EndingModal({ show, onDismiss }) {
  // Nothing to show → render nothing at all (no overlay in the DOM).
  if (!show) return null

  return (
    <div className="ending-overlay">
      <div className="ending-card">
        <div className="ending-title">ถึงเป้าหมายแล้ว!!</div>
        <button className="ending-continue" onClick={onDismiss}>
          Continue
        </button>
      </div>
    </div>
  )
}
