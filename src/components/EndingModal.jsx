import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import '../styles/ending-modal.css'

// Gold/amber, matching .ending-card's accent so the burst reads as part of the
// card rather than a generic party effect.
const CONFETTI_COLORS = ['#fbbf24', '#fcd34d', '#f59e0b', '#fde68a']

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
  // One celebratory burst when the modal opens.
  //
  // ⚠️ `[show]` — not an empty dep array and not dep-less. The effect must fire
  // on the transition into `show`, exactly once, and never again on the
  // re-renders that the 10x/sec TICK causes while the modal is open.
  //
  // ⚠️ The reduced-motion guard has to live HERE, in JS. The
  // `@media (prefers-reduced-motion: reduce)` block in ending-modal.css can
  // only stop CSS animations — it has no effect on a canvas animation, so
  // without this check the burst would still play for users who asked for less
  // motion.
  useEffect(() => {
    if (!show) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    confetti({
      particleCount: 90,
      spread: 75,
      startVelocity: 38,
      origin: { y: 0.55 }, // just above centre, so pieces fall past the card
      colors: CONFETTI_COLORS,
      disableForReducedMotion: true, // belt-and-braces; the guard above is the real one
    })
  }, [show])

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
