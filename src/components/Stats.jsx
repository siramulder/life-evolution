import '../styles/stats.css'

// Stats — floating readout of current biomass + passive rate.
// Pure display: it only renders the numbers App hands it via props.
export function Stats({ biomass, perSec }) {
  return (
    <div className="stats">
      <div className="stats-biomass">{biomass.toFixed(1)}</div>
      <div className="stats-rate">+{perSec.toFixed(1)}/sec</div>
    </div>
  )
}
