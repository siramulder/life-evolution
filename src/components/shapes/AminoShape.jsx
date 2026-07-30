// AminoShape — a real amino-acid skeleton drawn as inline SVG.
//
// Structure is glycine, the simplest amino acid: a central alpha-carbon with an
// amine group on one side, a carboxyl group on the other, plus an R-group and a
// hydrogen. Laid out on a 0-100 grid so it scales to whatever size the parent
// div is (see FloatingElements).
//
// Draw order matters: <line> bonds come FIRST so the <circle> atoms paint on top
// and hide the bond ends, the way a ball-and-stick diagram looks.

const BOND = 'rgba(255, 255, 255, 0.55)'
const ATOM_EDGE = 'rgba(255, 255, 255, 0.4)' // crisp rim on dark backgrounds

// Element colors, roughly following the usual CPK convention.
const C_GREY_GREEN = 'rgba(120, 180, 140, 0.85)' // carbon
const N_BLUE = 'rgba(110, 150, 255, 0.85)' // nitrogen
const O_RED = 'rgba(255, 120, 120, 0.85)' // oxygen
const R_GREEN = 'rgba(150, 255, 170, 0.85)' // R-group (side chain)
const H_WHITE = 'rgba(255, 255, 255, 0.75)' // hydrogen

export function AminoShape() {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      // Decorative only — hide it from the accessibility tree.
      aria-hidden="true"
      focusable="false"
    >
      {/* --- Bonds (drawn first, so atoms cover their endpoints) --- */}
      <g stroke={BOND} strokeWidth="2.5" strokeLinecap="round">
        {/* Ca -> N (amine) */}
        <line x1="50" y1="50" x2="20" y2="50" />
        {/* Ca -> C (carboxyl carbon) */}
        <line x1="50" y1="50" x2="75" y2="50" />
        {/* Ca -> R (side chain) */}
        <line x1="50" y1="50" x2="50" y2="22" />
        {/* Ca -> H */}
        <line x1="50" y1="50" x2="50" y2="78" />
        {/* C -> O (hydroxyl side, single bond) */}
        <line x1="75" y1="50" x2="90" y2="72" />

        {/* C=O double bond: two lines offset 1.5px either side of the C->O
            axis. The bond runs (75,50)->(90,30), so its unit vector is
            (0.6,-0.8) and the perpendicular is (0.8,0.6) — scaled by 1.5 that
            gives the (1.2, 0.9) offset used below, i.e. 3px total separation. */}
        <line x1="76.2" y1="50.9" x2="91.2" y2="30.9" />
        <line x1="73.8" y1="49.1" x2="88.8" y2="29.1" />
      </g>

      {/* --- Atoms (painted over the bonds) --- */}
      <g stroke={ATOM_EDGE} strokeWidth="1">
        <circle cx="20" cy="50" r="8" fill={N_BLUE} /> {/* N — amine */}
        <circle cx="90" cy="30" r="7" fill={O_RED} /> {/* O — carbonyl */}
        <circle cx="90" cy="72" r="7" fill={O_RED} /> {/* O — hydroxyl */}
        <circle cx="75" cy="50" r="8" fill={C_GREY_GREEN} /> {/* C — carboxyl */}
        <circle cx="50" cy="22" r="8" fill={R_GREEN} /> {/* R — side chain */}
        <circle cx="50" cy="78" r="5" fill={H_WHITE} /> {/* H */}
        <circle cx="50" cy="50" r="9" fill={C_GREY_GREEN} /> {/* Ca — center */}
      </g>
    </svg>
  )
}
