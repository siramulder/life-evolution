# Life Evolution — Project Memory

> Claude Code reads this file automatically every session.
> Last updated: after Phase B2 (upgrades.js)

---

## What this is

**Life Evolution** — an Idle/Clicker game built in React + Vite.
The player acts as a "creative force," generating Biomass by clicking and buying upgrades
to evolve life from Primordial Soup → Single Cell → Multicellular Life.

**Primary goal:** Learning project — practice Claude Code workflow + React fundamentals.
Fun is MVP 2.0's problem. Core loop functional = done.

Full requirements: see `PRD_MVP_1.0_Life_Evolution.md` (in user's Downloads).

---

## Current state

### ✅ Done

**Phase A1 — Project scaffold**
- `npm create vite@latest life-evolution -- --template react` run at `C:\Users\Sira\claude-game\`
- `npm install` complete — 135 packages, 0 vulnerabilities
- Vite dev server ready (`npm run dev`)

**Phase A2 — Boilerplate cleared**
- `App.jsx` → just `<h1>Life Evolution 🧬</h1>`
- `App.css` → empty (just comment)
- `index.css` → basic reset only
- `src/assets/react.svg` → deleted

**Phase A3 — Project tour**
- Explained all 5 key files: `index.html`, `main.jsx`, `App.jsx`, `package.json`, `vite.config.js`
- Understood React app flow: browser → index.html → main.jsx → App.jsx

**Phase A4 — Folder structure + stub files**
- Created `src/components/` with 4 stubs: `Universe.jsx`, `Stats.jsx`, `UpgradeList.jsx`, `ScaleUnlockModal.jsx`
- Created `src/game/` with 3 stubs: `gameState.js`, `upgrades.js`, `scales.js`
- Created empty `src/styles/` folder
- Dev server still running, no errors

**Phase B1 — scales.js**
- `src/game/scales.js` — array of 3 scale objects: `{ id, name, threshold, description }`
- Scale 1: Primordial Soup (threshold 0)
- Scale 2: Single Cell (threshold 100)
- Scale 3: Multicellular Life (threshold 1000)
- Verified via `console.log(scales)` in browser console — array of 3 objects confirmed

**Phase B2 — upgrades.js**
- `src/game/upgrades.js` — array of 3 upgrade objects
- Fields: `id` (camelCase string), `name`, `type`, `effect` (display string), `increment` (number for math), `baseCost`, `costMultiplier`, `requireScale`
- Amino Acids (aminoAcids): auto-generator, +0.2/sec, cost 10, ×1.15, scale 1
- Cell Division (cellDivision): click-multiplier, +1/click, cost 50, ×1.3, scale 2
- Photosynthesis (photosynthesis): auto-generator, +5/sec, cost 500, ×1.2, scale 3
- **Design note**: `effect` (string for UI) vs `increment` (number for logic) kept separate — display decoupled from math
- **Design note**: string ids used as keys (will map to ownership counts in gameState)
- Cost formula: `baseCost × costMultiplier ^ owned` (2nd Amino Acids = 10 × 1.15¹ = 11.5)

### 🔜 Next up

**Phase B3** — `src/game/gameState.js` — initial state + gameReducer (CLICK, BUY_UPGRADE, TICK, UNLOCK_SCALE)
**Phase B4** — Wire `useReducer` in `App.jsx` + tick every 100ms

---

## Known gotchas / lessons learned

### Dev server must be running to view the game
- `ERR_CONNECTION_REFUSED` at `localhost:5173` does NOT mean a code error — it means no `npm run dev` process is running.
- Vite only serves the page while `npm run dev` is alive. Close the terminal / stop the process → connection refused.
- Vite has **HMR (Hot Module Replacement)**: save a file → browser updates automatically, no manual refresh needed.
- Start it from the project folder: `cd C:\Users\Sira\claude-game\life-evolution && npm run dev`

---

## Task breakdown

### Phase A: Setup ✅ COMPLETE
- [x] A1 — Scaffold Vite + React project
- [x] A2 — Delete boilerplate
- [x] A3 — Tour the project: ask Claude Code to explain each remaining file (`index.html`, `main.jsx`, `App.jsx`, `package.json`) in beginner-friendly language. Goal: be able to explain the React app flow yourself
- [x] A4 — Create folder structure (`src/components/`, `src/game/`, `src/styles/`)
- [x] A5 — Verify: `npm run dev` opens blank page, no console errors

### Phase B: Core State
- [x] B1 — `src/game/scales.js` — 3 scale definitions
- [x] B2 — `src/game/upgrades.js` — 3 upgrade definitions
- [ ] B3 — `src/game/gameState.js` — initial state + `gameReducer` (CLICK, BUY_UPGRADE, TICK, UNLOCK_SCALE)
- [ ] B4 — Wire `useReducer` in `App.jsx` + `setInterval` tick every 100ms
- [ ] B5 — Verify: biomass increments automatically each second

### Phase C: Click Mechanic
- [ ] C1 — `src/components/Universe.jsx` — clickable area, dispatches CLICK
- [ ] C2 — `src/components/Stats.jsx` — shows biomass + rate/sec
- [ ] C3 — Click feedback: floating `+1` text at click coordinates, CSS fade-up animation
- [ ] C4 — Verify: clicking increments biomass, Stats updates in real-time

### Phase D: Upgrade System
- [ ] D1 — `src/components/UpgradeList.jsx` — upgrade cards (name / effect / cost / owned count)
- [ ] D2 — Buy button per upgrade — disabled if biomass < cost
- [ ] D3 — BUY_UPGRADE reducer: deduct biomass, increment owned, recalculate cost, update perSec/perClick
- [ ] D4 — Verify Amino Acids: buy → perSec +0.2; buy again → cost = 10 × 1.15¹ = 11.5
- [ ] D5 — Show upgrades only when their scale is unlocked

### Phase E: Scale Progression
- [ ] E1 — Unlock check inside TICK: biomass ≥ threshold → dispatch UNLOCK_SCALE
- [ ] E2 — `src/components/ScaleUnlockModal.jsx` — modal with scale name + flavor text + dismiss button
- [ ] E3 — `Universe.jsx` visual changes per scale (color / label)
- [ ] E4 — Verify Scale 2: 100 biomass → modal, visual changes, Cell Division available
- [ ] E5 — Verify Scale 3: 1,000 biomass → modal, visual changes, Photosynthesis available

### Phase F: Polish & End-to-End Test
- [ ] F1 — Play full loop 0 → Scale 3, fix bugs found
- [ ] F2 — Verify all 3 upgrade cost scaling formulas
- [ ] F3 — Modal must not re-trigger after dismiss (even if biomass stays above threshold)
- [ ] F4 — Final check: no console errors or warnings

---

## Game design (quick ref)

### Scales

| Scale | Name | Threshold |
|-------|------|-----------|
| 1 | Primordial Soup | 0 (start) |
| 2 | Single Cell | 100 biomass |
| 3 | Multicellular Life | 1,000 biomass |

### Upgrades

| Upgrade | Available at | Type | Effect | Base Cost | Multiplier |
|---------|-------------|------|--------|-----------|------------|
| Amino Acids | Scale 1 | Auto-generator | +0.2 biomass/sec | 10 | 1.15 |
| Cell Division | Scale 2 | Click multiplier | +1 biomass/click | 50 | 1.30 |
| Photosynthesis | Scale 3 | Auto-generator | +5 biomass/sec | 500 | 1.20 |

**Cost formula:** `cost = baseCost × (multiplier ^ owned)`

### Core loop
```
Click → +1 biomass
Buy Amino Acids → +0.2 biomass/sec
Reach 100 → unlock Scale 2 (Single Cell)
Buy Cell Division → +2 biomass/click
Reach 1,000 → unlock Scale 3 (Multicellular Life)
Buy Photosynthesis → +5 biomass/sec
→ End of MVP 1.0
```

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 (Vite scaffold) |
| Language | JavaScript (no TypeScript) |
| Styling | Plain CSS / CSS Modules |
| State | `useReducer` in App.jsx |
| Backend | None |
| Database | None (in-memory only, resets on refresh) |

---

## Project structure (target per PRD 6.3)

```
life-evolution/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── components/
│   │   ├── Universe.jsx         # clickable main area
│   │   ├── Stats.jsx            # biomass counter + rate/sec
│   │   ├── UpgradeList.jsx      # upgrade cards + buy buttons
│   │   └── ScaleUnlockModal.jsx # popup on scale unlock
│   ├── game/
│   │   ├── gameState.js         # initial state + reducer
│   │   ├── upgrades.js          # upgrade definitions
│   │   └── scales.js            # scale definitions
│   └── styles/
│       └── *.css
├── index.html
├── package.json
└── vite.config.js
```

---

## Out of scope (MVP 1.0)

- Save/Load (state resets on refresh — intentional)
- Sound effects
- Mobile responsive design
- Tutorial / onboarding
- Scale 4-6
- Prestige loop
- Achievement system

---

## Environment

- OS: Windows
- Node.js: v25.9.0
- npm: v11.12.1
- Project path: `C:\Users\Sira\claude-game\life-evolution\`
- Dev server: `npm run dev` → localhost (default Vite port 5173)