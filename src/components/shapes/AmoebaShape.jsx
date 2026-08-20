// AmoebaShape — a single-celled amoeba drawn as inline SVG.
//
// Deliberately NOT symmetrical: the outline is a closed bezier path with
// uneven bulges standing in for pseudopods, so it reads as something that
// crawls rather than a geometric blob. Interior structure (nucleus, vacuoles,
// granules) is placed off-centre for the same reason.
//
// Draw order is outside-in: body -> vacuoles -> nucleus -> granules, so the
// smaller organelles always paint on top of the cytoplasm.
//
// `rotation` (degrees) tilts each spawned copy, exactly as in AminoShape.
// It is set on the <svg> ELEMENT rather than an inner <g> because an <svg>
// clips to its own viewport — rotating the contents could swing a pseudopod
// past the 0-100 box and slice it off. Rotating the element happens after
// that clip. It also cannot collide with the parent's floatAround animation,
// which owns `transform` on the container div (a different element).

// Blue palette — same lightness/alpha steps as the original green, so the
// glow radius and layering still read correctly, only the hue changed.
const MEMBRANE = 'rgba(150, 200, 230, 0.75)'
const CYTOPLASM = 'rgba(120, 160, 200, 0.3)'
const VACUOLE = 'rgba(200, 225, 245, 0.35)'
const NUCLEUS = 'rgba(90, 130, 170, 0.7)'
const NUCLEUS_EDGE = 'rgba(180, 210, 240, 0.5)'
const GRANULE = 'rgba(180, 210, 240, 0.4)'

// Water vacuoles — varied sizes, scattered asymmetrically.
const vacuoles = [
  { cx: 30, cy: 62, r: 7 },
  { cx: 62, cy: 40, r: 5 },
  { cx: 58, cy: 66, r: 4 },
]

// Small organelles suspended in the cytoplasm.
const granules = [
  { cx: 33, cy: 38, r: 2 },
  { cx: 66, cy: 55, r: 1.8 },
  { cx: 42, cy: 72, r: 2.2 },
  { cx: 25, cy: 50, r: 1.5 },
  { cx: 55, cy: 28, r: 2.5 },
]

export function AmoebaShape({ rotation = 0 }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{ transform: `rotate(${rotation}deg)` }}
      // Decorative only — hide it from the accessibility tree.
      aria-hidden="true"
      focusable="false"
    >
      {/* Cell body — irregular outline, bulges acting as pseudopods. */}
      <path
        d="M50,20 Q75,25 78,45 Q90,55 75,70 Q65,90 45,85
           Q20,88 15,65 Q5,50 20,35 Q25,15 50,20 Z"
        fill={CYTOPLASM}
        stroke={MEMBRANE}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Vacuoles — lighter than the cytoplasm, so they read as empty space. */}
      {vacuoles.map((v) => (
        <circle key={`v-${v.cx}-${v.cy}`} cx={v.cx} cy={v.cy} r={v.r} fill={VACUOLE} />
      ))}

      {/* Nucleus — near the middle but intentionally not dead centre. */}
      <circle
        cx="48"
        cy="48"
        r="11"
        fill={NUCLEUS}
        stroke={NUCLEUS_EDGE}
        strokeWidth="1"
      />

      {/* Granules — small organelles dotted through the cytoplasm. */}
      {granules.map((g) => (
        <circle key={`g-${g.cx}-${g.cy}`} cx={g.cx} cy={g.cy} r={g.r} fill={GRANULE} />
      ))}
    </svg>
  )
}
