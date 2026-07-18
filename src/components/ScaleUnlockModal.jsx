import '../styles/modal.css'

// ScaleUnlockModal — celebration popup shown when a new scale is unlocked.
// `scale` is a scale object from scales.js (or null when nothing to show).
// `onDismiss` closes it. Rendering is fully driven by whether `scale` is set,
// so there's no internal open/closed state to keep in sync.
export function ScaleUnlockModal({ scale, onDismiss }) {
  // Nothing pending → render nothing at all (no overlay in the DOM).
  if (!scale) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-title">Scale Unlocked!</div>
        <div className="modal-scale-name">{scale.name}</div>
        <div className="modal-scale-desc">{scale.description}</div>
        <button className="modal-continue" onClick={onDismiss}>
          Continue
        </button>
      </div>
    </div>
  )
}
