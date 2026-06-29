# Life Evolution — Project Memory

> Claude Code reads this file automatically every session.
> Last updated: after Background animation (bubbles + particles)

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

**Background animation — bubbles + particles (primordial soup ambience)**
- `src/components/Background.jsx` — 15 bubbles + 25 particles, configs built with `useMemo([])` (random size/left/duration/delay/opacity); renders divs with inline style pulling from config
- `src/styles/background.css` — `.bubble` rises bottom→top via `@keyframes riseUp` (translateY -110vh + swaying translateX); `.particle` pale-blue mote drifting via `@keyframes drift` (translate + opacity fade); `.background-layer` fixed full-screen, `overflow:hidden`, `pointer-events:none`
- `App.jsx` — `<Background />` rendered first (before Stats/Universe)
- **useMemo is mandatory here**: App re-renders 10×/sec (TICK). Without `useMemo([])` the random configs regenerate every render → animations restart/jitter every 100ms, bubbles never finish rising. `useMemo([])` freezes the random values for the component's lifetime.
- **Particle opacity via CSS var**: inline `--base-opacity` per particle + `drift` keyframe fades to `calc(var(--base-opacity) * 0.35)` at 50% → each mote fades relative to its own base opacity (can't be done with a plain shared keyframe)
- ⚠️ **z-index deviation from naive spec**: `.universe` has an OPAQUE purple gradient filling the viewport. A `z-index:0` layer *behind* Universe (the literal brief) would be 100% hidden. Fix: `.background-layer` sits at `z-index:1` (ABOVE the gradient, BELOW Stats/UpgradeList at z-index 10) and is `pointer-events:none` → bubbles are visible over the soup, clicks still fall through to Universe (CLICK + `:active` flash both preserved). Did NOT move the gradient off Universe (would kill the click-flash).
- **Final stacking**: Universe gradient (auto) → Background z-index 1 → Stats + UpgradeList z-index 10 → floating +N (last in DOM, always on top)

**Phase D2 — Buy button (disabled when biomass < cost) + BUY_UPGRADE wiring**
- `UpgradeList.jsx` — new `onBuy` prop; per card `canAfford = state.biomass >= cost`; added `<button>` with `onClick={() => onBuy(upgrade.id)}`, `disabled={!canAfford}`, class `buy-btn` / `buy-btn disabled`
- `upgrades.css` — `.buy-btn` green (#22c55e, bold, radius 8, full-width); `:hover:not(:disabled)` darker (#16a34a); `:disabled` gray (#6b7280) + opacity 0.5 + cursor not-allowed
- `App.jsx` — `handleBuyUpgrade(upgradeId)` dispatches `{ type: 'BUY_UPGRADE', payload: { upgradeId } }`; passed as `onBuy` to `<UpgradeList>` (D3 wiring folded in here — reducer logic already existed since B3)
- **Two-layer affordability**: UI `disabled` = UX only (DOM attr, editable in DevTools, can lag behind perSec ticks). Real guard is `if (state.biomass < cost) return state` in `gameReducer` (single source of truth for the business rule). Both needed — UI for feedback, reducer for correctness.
- D5 (filter upgrades by unlocked scale) still pending — all 3 cards still shown regardless of scale

**Phase D1 — UpgradeList (display-only cards)**
- `src/components/UpgradeList.jsx` — takes `state` prop, `upgrades.map()` renders a card per upgrade
- Each card: name / effect / `Cost: cost.toFixed(0)` / `Owned: owned`, `key={upgrade.id}`
- `cost = baseCost × costMultiplier ^ owned` computed at render (derived state — NOT stored)
- `src/styles/upgrades.css` — `.upgrade-list` fixed bottom-center, flex+gap, z-index 10; `.upgrade-card` translucent glass; effect green (#4ade80), cost yellow (#fbbf24)
- `App.jsx` — renders `<UpgradeList state={state} />`
- **Decision**: import `upgrades.css` inside UpgradeList.jsx (co-located, matches Stats/Universe pattern) not App.jsx
- **Decision**: compute cost at render not in state — derived values shouldn't be duplicated in state (single source of truth = `owned`)
- No buy buttons yet (D2); all 3 cards shown regardless of scale (filter in D5)

**Phase C3 — Click feedback (floating +N bubbles)**
- `App.jsx` — added `useState([])` for `floatingNumbers` (transient UI, separate from useReducer game state)
- `handleClick(e)` — reads `e.clientX/clientY`, spawns bubble `{ id: Date.now()+Math.random(), x, y, value: perClick }`, `setTimeout(600ms)` removes it via `filter(b.id !== bubble.id)`
- Renders bubbles with `.map()` + `key={b.id}`, positioned `style={{ left: x, top: y }}`
- `Universe.jsx` — `onClick={(e) => onClick(e)}` forwards the event to App
- `src/styles/floating.css` — `.floating-number` fixed position, `pointer-events: none`, `transform: translate(-50%,-50%)` centers bubble on cursor; `@keyframes floatUp` (opacity 1→0, translateY 0→-50px), `animation: floatUp 0.6s ease-out forwards`
- **Design**: useState for bubbles (transient, simple add/remove) vs useReducer for biomass (core game state, complex actions) — don't mix transient UI into game state
- **Why setTimeout cleanup**: animation only hides (opacity 0), div stays in DOM+array → without removal, list grows forever = memory leak + slowdown. `id` must be unique to filter correct bubble on rapid clicks

**Phase C2 — Stats (biomass + rate readout)**
- `src/components/Stats.jsx` — presentational component, takes `biomass` + `perSec` props, shows `biomass.toFixed(1)` big + `+perSec.toFixed(1)/sec` small
- `src/styles/stats.css` — absolute top-center, white + text-shadow, z-index 10 (above Universe)
- **Key**: `pointer-events: none` on `.stats` so clicks pass THROUGH to Universe behind (otherwise clicking on the numbers wouldn't count)
- `App.jsx` — renders `<Stats>` above `<Universe>` in a fragment; removed temp `window.state`/`window.dispatch`
- Confirms the earlier "biomass=0" mystery resolved: clicking now increments live on screen (clean browser after restart, no stale HMR)

**Phase C1 — Universe (full-screen clickable area)**
- `src/components/Universe.jsx` — full-screen `<div>` with `onClick` prop; center content is `.pulse-circle` (was 🌊 emoji, swapped in C1 revision)
- `src/styles/universe.css` — 100vw × 100vh, position fixed, purple gradient, flex-center, `:active` flashes brighter (background change, not transform:scale — looks odd full-screen)
- **C1 revision**: replaced 🌊 emoji with `.pulse-circle` — 120px white translucent circle, `@keyframes pulse` (scale 1→1.15→1, opacity 0.6→1→0.6), `animation: pulse 2s ease-in-out infinite` (breathing effect). animate transform+opacity only (GPU-accelerated, no layout reflow)
- `App.jsx` — removed `<h1>`, renders `<Universe onClick={handleClick} />`, `handleClick = () => dispatch({ type: 'CLICK' })`
- **Decision**: prop named `onClick` not `onClimbing` (assumed typo) — conventional React naming
- **Note**: kept temp `window.state`/`window.dispatch` until C2 (Stats) shows biomass on screen — after h1 removed there's no visual readout
- **Bug fixed earlier (B4/B5)**: App.jsx lost its `import` lines + `export default App` during an edit → white screen + "does not provide an export named 'default'". Lesson: every module needs imports at top + export at bottom. Hard-refresh after fixing a crash to clear stale HMR state.

**Phase B4 — App.jsx wired up**
- `useReducer(gameReducer, initialState)` → `[state, dispatch]`
- `useEffect` with `setInterval(() => dispatch({ type: 'TICK' }), 100)` — fires 10×/sec
- Cleanup function `return () => clearInterval(interval)` — prevents double-tick in StrictMode + memory leak
- `[]` dependency array — effect runs once on mount only
- `window.appState` / `window.appDispatch` exposed temporarily for console verification
- Verified: CLICK dispatches correctly, BUY_UPGRADE deducts cost + updates perSec, TICK fires passively

**Phase B3 — gameState.js**
- `initialState`: biomass=0, perClick=1, perSec=0, currentScale=1, unlockedScales=[1], ownedUpgrades derived from upgrades.js
- `ownedUpgrades` built with `Object.fromEntries(upgrades.map(...))` — stays in sync with upgrades.js automatically
- `gameReducer(state, action)`: 4 cases — CLICK, TICK, BUY_UPGRADE, UNLOCK_SCALE
- CLICK: `biomass + perClick`
- TICK: `biomass + perSec/10` (fires every 100ms = 10×/sec)
- BUY_UPGRADE: checks cost (`baseCost × multiplier^owned`), deducts biomass, updates perSec/perClick based on type, increments owned count
- UNLOCK_SCALE: sets currentScale, pushes scaleId to unlockedScales
- All cases use spread (`...state`) — never mutates state directly
- Verified all 4 cases via console.log

**Phase B2 — upgrades.js**
- `src/game/upgrades.js` — array of 3 upgrade objects
- Fields: `id` (camelCase string), `name`, `type`, `effect` (display string), `increment` (number for math), `baseCost`, `costMultiplier`, `requireScale`
- Amino Acids (aminoAcids): auto-generator, +0.2/sec, cost 10, ×1.15, scale 1
- Cell Division (cellDivision): click-multiplier, +1/click, cost 50, ×1.3, scale 2
- Photosynthesis (photosynthesis): auto-generator, +5/sec, cost 500, ×1.2, scale 3
- **Design note**: `effect` (string for UI) vs `increment` (number for logic) kept separate — display decoupled from math
- **Design note**: string ids used as keys (will map to ownership counts in gameState)
- Cost formula: `baseCost × costMultiplier ^ owned` (2nd Amino Acids = 10 × 1.15¹ = 11.5)

**Font — Exo 2**
- `index.html` — added Google Fonts `<link>` for Exo 2 (weight 400 + 700)
- `src/index.css` — `font-family: 'Exo 2', sans-serif` on `*` selector → applies globally
- Choice: Exo 2 only (no font mixing) — clean and consistent throughout

### 🔜 Next up

**Phase D4** — Verify Amino Acids: buy → perSec +0.2; buy again → cost = 10 × 1.15¹ = 11.5 (awaiting user verify)
**Phase D5** — Show only upgrades unlocked at current scale
**Phase E** — Scale progression (unlock check, ScaleUnlockModal, visual change per scale)
**Phase E** — Scale progression (unlock check, ScaleUnlockModal, visual change per scale)

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
- [x] B3 — `src/game/gameState.js` — initial state + `gameReducer` (CLICK, BUY_UPGRADE, TICK, UNLOCK_SCALE)
- [x] B4 — Wire `useReducer` in `App.jsx` + `setInterval` tick every 100ms
- [x] B5 — Verify: biomass increments automatically each second (folded into C1 click test)

### Phase C: Click Mechanic
- [x] C1 — `src/components/Universe.jsx` — clickable area, dispatches CLICK
- [x] C2 — `src/components/Stats.jsx` — shows biomass + rate/sec
- [x] C3 — Click feedback: floating `+1` text at click coordinates, CSS fade-up animation
- [x] C4 — Verify: clicking increments biomass, Stats updates in real-time

### Phase D: Upgrade System
- [x] D1 — `src/components/UpgradeList.jsx` — upgrade cards (name / effect / cost / owned count)
- [x] D2 — Buy button per upgrade — disabled if biomass < cost
- [x] D3 — BUY_UPGRADE reducer: deduct biomass, increment owned, recalculate cost, update perSec/perClick (wired via App.handleBuyUpgrade; reducer logic from B3)
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
│   │   ├── Background.jsx       # ambient bubbles + particles (decorative)
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