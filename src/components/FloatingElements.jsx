import { useMemo } from 'react'
import { AminoShape } from './shapes/AminoShape'
import { AmoebaShape } from './shapes/AmoebaShape'
import { VolvoxShape } from './shapes/VolvoxShape'
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
  'float-cell': AmoebaShape,
  'float-photo': VolvoxShape,
}

// SVG variants carry real internal detail (bonds, distinct atoms), so they need
// more room than a plain CSS blob before that detail is readable at a glance.
// Every variant is an SVG now, so DEFAULT_SIZE is only a fallback for any new
// variant added without its own entry.
const DEFAULT_SIZE = [20, 35] // px
const sizeRanges = {
  'float-amino': [45, 70],
  // An amoeba is a whole organism, not a molecule, so it out-sizes the amino
  // acids on purpose. It also carries the finest interior detail of any shape
  // (granules are r=1.5-2.5 in a 100-unit viewBox), which needs the room.
  'float-cell': [55, 85],
  // Volvox has the most pieces of any shape — 27 rim/interior cells at r=2-2.5
  // plus 3 daughter colonies — so it needs at least as much room as the amoeba.
  'float-photo': [55, 85],
}

// FloatingElements — decorative elements drifting in the soup, one per owned
// upgrade of a given type. Generic: `variant` is a CSS modifier class picking
// the look (amino / cell / photo); `seed` offsets the RNG so different upgrade
// types don't spawn at identical coordinates.
//
// `zoom` (1 = native size) shrinks this whole layer as the world zooms out on a
// scale-up — see zoomFor() in App.jsx. It is applied at RENDER time, deliberately
// NOT inside the useMemo below: `items` must not recompute when zoom changes, or
// every element would re-roll and teleport. Keeping it out also means the seeded
// position / rotation / duration / delay values are untouched by zooming.
export function FloatingElements({ count, variant, seed = 0, zoom = 1 }) {
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
          // Spawn angle. New seed expression (+6) so it can't disturb any of the
          // values above. Only SVG shapes use it — see the <Shape> call below.
          rotation: pick(s * 56.41 + 6, 0, 360), // deg
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
            width: `${m.size * zoom}px`,
            height: `${m.size * zoom}px`,
            animationDuration: `${m.duration}s`,
            animationDelay: `${m.delay}s`,
          }}
        >
          {Shape ? <Shape rotation={m.rotation} /> : null}
        </div>
      ))}
    </div>
  )
}
