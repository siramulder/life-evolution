import { useMemo } from 'react'
import { AminoShape } from './shapes/AminoShape'
import '../styles/floating-elements.css'

// Deterministic pseudo-random in [min, max) from a seed — same seed → same value.
// Keeps existing elements from teleporting when `count` grows (see CLAUDE notes).
const seeded = (n) => {
  const x = Math.sin(n) * 10000
  return x - Math.floor(x)
}
const pick = (n, min, max) => min + seeded(n) * (max - min)

// Variants whose look is an SVG drawing rather than plain CSS. A variant absent
// from this map renders as a bare styled div, exactly as before.
const shapes = {
  'float-amino': AminoShape,
}

// SVG variants carry real internal detail (bonds, distinct atoms), so they need
// more room than the CSS blobs before that detail is readable at a glance.
const DEFAULT_SIZE = [20, 35] // px — unchanged for float-cell / float-photo
const sizeRanges = {
  'float-amino': [45, 70],
}

// FloatingElements — decorative elements drifting in the soup, one per owned
// upgrade of a given type. Generic: `variant` is a CSS modifier class picking
// the look (amino / cell / photo); `seed` offsets the RNG so different upgrade
// types don't spawn at identical coordinates.
export function FloatingElements({ count, variant, seed = 0 }) {
  const Shape = shapes[variant] // undefined → plain div, same as before
  const [minSize, maxSize] = sizeRanges[variant] ?? DEFAULT_SIZE

  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const s = seed + i // per-type offset so variants don't overlap exactly
        return {
          id: i,
          startX: pick(s * 12.99 + 1, 10, 90), // % of viewport
          startY: pick(s * 78.23 + 2, 10, 90), // %
          duration: pick(s * 37.71 + 3, 15, 30), // s
          // NEGATIVE delay → starts mid-animation, moving immediately, no pause.
          delay: -pick(s * 4.27 + 4, 0, 30), // s
          // Same seed expression as always — only the output RANGE is per-variant,
          // so each molecule keeps its relative size, just remapped.
          size: pick(s * 93.98 + 5, minSize, maxSize), // px
        }
      }),
    [count, seed, minSize, maxSize],
  )

  return (
    <div className="float-layer">
      {items.map((m) => (
        <div
          key={m.id}
          className={`float-molecule ${variant}`}
          style={{
            left: `${m.startX}%`,
            top: `${m.startY}%`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            animationDuration: `${m.duration}s`,
            animationDelay: `${m.delay}s`,
          }}
        >
          {Shape ? <Shape /> : null}
        </div>
      ))}
    </div>
  )
}
