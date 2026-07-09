import { useMemo } from 'react'
import '../styles/aminoacids.css'

// Deterministic pseudo-random in [min, max) derived from a seed number.
// Same seed → same value, ALWAYS. This is the key to "old molecules stay put":
// molecule #2's position is a function of its id, not of Math.random(), so when
// `count` grows and useMemo rebuilds the array, molecule #2 reproduces the exact
// same config it had before — only the brand-new id yields a new spot.
const seeded = (seed) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x) // fractional part → stable 0..1 for a given seed
}
const pick = (seed, min, max) => min + seeded(seed) * (max - min)

// AminoAcids — floating amino-acid molecules, one per owned Amino Acids upgrade.
// `count` comes straight from state.ownedUpgrades.aminoAcids — no separate state.
export function AminoAcids({ count }) {
  // Rebuilds only when `count` changes (a purchase). Because each molecule's
  // config is seeded by its id, the existing molecules get identical values on
  // rebuild → their running animation is untouched → only the new one appears.
  const molecules = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        startX: pick(i * 12.99 + 1, 10, 90), // % of viewport
        startY: pick(i * 78.23 + 2, 10, 90), // %
        duration: pick(i * 37.71 + 3, 15, 30), // s
        delay: pick(i * 4.27 + 4, 0, 5), // s
        size: pick(i * 93.98 + 5, 20, 35), // px
      })),
    [count],
  )

  return (
    <div className="amino-layer">
      {molecules.map((m) => (
        <div
          key={m.id}
          className="amino-molecule"
          style={{
            left: `${m.startX}%`,
            top: `${m.startY}%`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            animationDuration: `${m.duration}s`,
            animationDelay: `${m.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
