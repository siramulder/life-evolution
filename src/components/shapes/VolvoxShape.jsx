// VolvoxShape — a Volvox colony drawn as inline SVG.
//
// Volvox is a hollow sphere of many small algal cells, with daughter colonies
// growing inside it. That reads as a translucent ball with a beaded rim and a
// few smaller balls suspended within.
//
// Draw order is back-to-front: sphere -> daughter colonies -> inner ring of
// cells -> outer ring of cells. The inner ring is fainter and sits at a smaller
// radius, which is what sells the sphere as 3D rather than a flat circle.
//
// `rotation` (degrees) tilts each spawned copy, exactly as in AminoShape and
// AmoebaShape. It matters here despite the near-radial symmetry because the
// daughter colonies are placed asymmetrically. It is set on the <svg> ELEMENT
// rather than an inner <g>: an <svg> clips to its own viewport, so rotating the
// contents could swing the rim cells past the 0-100 box and slice them off.
// It also cannot collide with the parent's floatAround animation, which owns
// `transform` on the container div (a different element).

const MUCILAGE = 'rgba(120, 220, 140, 0.18)' // the clear gel sphere
const RIM = 'rgba(170, 245, 170, 0.7)'
const DAUGHTER_FILL = 'rgba(120, 220, 140, 0.3)'
const DAUGHTER_EDGE = 'rgba(170, 245, 170, 0.5)'
const CELL_FRONT = 'rgba(190, 255, 180, 0.85)'
const CELL_BACK = 'rgba(190, 255, 180, 0.5)' // dimmer = reads as far side

// Place `count` dots evenly around a circle of `radius` centred on (50,50).
// `startDeg` offsets a ring so the two rings don't line up spoke-on-spoke.
const ring = (count, radius, dotR, startDeg = 0) =>
  Array.from({ length: count }, (_, i) => {
    const theta = ((startDeg + (360 / count) * i) * Math.PI) / 180
    return {
      id: `${radius}-${i}`,
      cx: +(50 + radius * Math.cos(theta)).toFixed(2),
      cy: +(50 + radius * Math.sin(theta)).toFixed(2),
      r: dotR,
    }
  })

// 18 cells at 20° spacing on the rim; 9 more further in, offset by half a step.
const surfaceCells = ring(18, 40, 2.5)
const innerCells = ring(9, 32, 2, 20)

// Daughter colonies growing inside the parent sphere — deliberately off-centre
// and of differing sizes, so the colony doesn't look like a bullseye.
const daughters = [
  { cx: 36, cy: 40, r: 11, fill: DAUGHTER_FILL, stroke: DAUGHTER_EDGE, sw: 1.2 },
  { cx: 62, cy: 56, r: 9, fill: DAUGHTER_FILL, stroke: DAUGHTER_EDGE, sw: 1.2 },
  { cx: 45, cy: 66, r: 6, fill: 'rgba(120, 220, 140, 0.28)', stroke: 'rgba(170, 245, 170, 0.45)', sw: 1 },
]

export function VolvoxShape({ rotation = 0 }) {
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
      {/* The gel sphere holding the whole colony together. */}
      <circle cx="50" cy="50" r="40" fill={MUCILAGE} stroke={RIM} strokeWidth="2" />

      {/* Daughter colonies suspended inside. */}
      {daughters.map((d) => (
        <circle
          key={`d-${d.cx}-${d.cy}`}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          fill={d.fill}
          stroke={d.stroke}
          strokeWidth={d.sw}
        />
      ))}

      {/* Far-side cells — smaller radius and dimmer, giving the sphere depth. */}
      {innerCells.map((c) => (
        <circle key={`i-${c.id}`} cx={c.cx} cy={c.cy} r={c.r} fill={CELL_BACK} />
      ))}

      {/* Near-side cells beaded around the rim. */}
      {surfaceCells.map((c) => (
        <circle key={`s-${c.id}`} cx={c.cx} cy={c.cy} r={c.r} fill={CELL_FRONT} />
      ))}
    </svg>
  )
}
