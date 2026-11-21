# Life Evolution — Project Memory

> Claude Code reads this file automatically every session.
> Last updated: Phase H complete (H1–H4 done); background-click decision recorded 2026-11-21; 51 tests passing

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

**Phase E2 — ScaleUnlockModal (celebration popup on unlock, guards against re-trigger)**
- `gameState.js` — added `pendingModalScale: null` field to initialState; TICK unlock branch now also sets `pendingModalScale: nextScale.id`; new case `'DISMISS_MODAL'` clears it back to null
- `ScaleUnlockModal.jsx` — takes `scale` object + `onDismiss()` callback; renders nothing if `scale` is null (no modal to show); displays modal-overlay (dark dim) + glass card with scale name + flavor text + green Continue button
- `styles/modal.css` — `.modal-overlay` z-index 100 (above Stats/UpgradeList at 10), full-screen dim, flexbox center; `.modal-content` glass card (translucent); `.modal-continue` button green (#22c55e, darker on hover); `@keyframes modalPop` scale 0.8→1 + opacity 0→1 (0.3s ease-out pop-in)
- `App.jsx` — import scales + ScaleUnlockModal; derive `modalScale` by finding scale object from `pendingModalScale` id (null if no pending); render ScaleUnlockModal at the end (after UpgradeList + floating +N) so it renders on top
- **No re-trigger after dismiss**: (1) `DISMISS_MODAL` clears `pendingModalScale → null` (modal gone from render), (2) TICK won't re-set the flag because `currentScale` has advanced past the just-unlocked scale → TICK looks for `currentScale + 1` (the *next* scale), not the one that just unlocked (already in `unlockedScales` with includes guard)
- **Reducer state vs useState**: storing `pendingModalScale` in game state (not useState + useEffect) is cleaner because TICK *knows* the unlock happened (it caused it) — let it flag the modal directly, atomic with `currentScale` change. Effect-based "detect currentScale changed" adds coupling, state drift risk, and unnecessary re-detection logic.
- Single celebration popup per scale, gates behind Continue button

**Phase E1 — auto-unlock check in TICK (dispatch UNLOCK_SCALE when threshold reached)**
- `gameState.js` — added `import { scales }` to access threshold values (not hardcode 100/1000)
- TICK case: compute `newBiomass`, then check if `scales.find(s => s.id === currentScale + 1)` exists and `newBiomass >= nextScale.threshold`
- If yes → return new state with `currentScale` updated to `nextScale.id`, and `unlockedScales` appended (guard duplicate with `.includes()` check)
- If no → return new state with just the new biomass
- **Single source of truth**: threshold lives in `scales.js` only — reducer reads from there, not hardcoded. If balance changes, edit scales.js once.
- **Check one scale ahead only** (currentScale + 1): biomass grows in tiny steps (perSec/10 per tick), can't leap past 2 scales in a tick. Next-scale-only is fast + correct + future-proof (easy to add scale 4-6).
- **Result**: Amino Acids card (Amoeba, Volvox) auto-appear when threshold hit, no manual unlock needed. currentScale + unlockedScales stay in sync via the reducer.
- Phase E2 (ScaleUnlockModal) will wire up the visual "congratulations" popup on unlock

**Floating organisms — animated elements for all 3 upgrades (Amino Acids, Amoeba, Volvox)**
- `src/components/FloatingElements.jsx` — generic reusable component: `count` (owned), `variant` (CSS class), `seed` (RNG offset), `zoom` (scale-distance shrink, see the zoom-out entry below); renders N elements using deterministic seeding so existing ones keep identical configs when count grows → only new ones appear
- `src/styles/floating-elements.css` — 3 variants: `.float-amino` (~~green molecule + 2 satellite atoms~~ → **now an inline-SVG glycine skeleton, see the SVG entry above**), `.float-cell` (~~blue cell with 2 lobes overlapping mid-mitosis + nucleus~~ → **now an inline-SVG amoeba, see the Amoeba entry above**), `.float-photo` (~~yellow-green energy orb + sun mote + leaf mote~~ → **now an inline-SVG Volvox colony, see the Volvox entry above**); **all three are inline SVG now — no CSS-blob variants remain**; all share `@keyframes floatAround` drift path; negative delay → start moving immediately
- `src/App.jsx` — renders 3 FloatingElements (amino seed=0, cell seed=1000, photo seed=2000) so each type's RNG stream is offset → no overlap; counts tied to `state.ownedUpgrades` for each upgrade; each also gets a `zoom` from `zoomFor()` (see zoom-out entry below)
- **Config-driven design**: all 3 upgrade types share one component + one keyframe, differing only in `.float-*` class selector → single source of truth for RNG logic + drift behavior
- **Regression-safe**: Amino Acids elements **maintain exact same coordinates as before** (seed unchanged) — only added Cell + Photo layers

**Zoom-out on scale change — organisms from earlier scales shrink** (2026-09-26)
- Advancing a scale pulls the "camera" back: an amino acid next to a Volvox colony should read as a speck. Size multiplier = `ZOOM_PER_SCALE ** (currentScale − nativeScale)` with `ZOOM_PER_SCALE = 0.5`, so the **current** scale's own organism is always full size and each scale of distance behind it halves.
- `src/App.jsx` — `ZOOM_PER_SCALE` + `zoomFor(native, current)`; `nativeScale` map is **derived from `upgrades.js` `requireScale`** (`Object.fromEntries`), not hardcoded, so it can't drift. `Math.max(0, …)` guards against magnifying an organism from an unreached scale.
- `src/components/FloatingElements.jsx` — new `zoom` prop (default 1), multiplied into the inline `width`/`height`.
- ⚠️ **`zoom` is applied at RENDER, deliberately NOT inside the `useMemo` and NOT in its dep array.** Putting it in deps would recompute `items` on every scale change → every element re-rolls and teleports. Verified: across a scale change, `left`/`top`/`animationDuration`/`animationDelay`/rotation matrix are **byte-identical**; only width/height move.
- ⚠️ **Animates `width`/`height`, NOT `transform: scale()`** — the `floatAround` keyframe owns `transform` on that element, and a running animation outranks a normal declaration, so a `scale()` there silently no-ops (same trap as the rotation gotcha below). The SVG child is `width:100%/height:100%` so it follows for free.
- `transition: width 1.5s, height 1.5s` on `.float-molecule` — **1.5s matches the background gradient cross-fade** so the shrink and the colour shift read as one "the world changed" motion, not two events.
- Measured across a full playthrough: amino 63.92/69.15 → 31.96/34.58 → **15.97/17.29** (×1 → ×0.5 → ×0.25); amoeba 69.22 → 34.61 (×1 → ×0.5); Volvox 66.29 (×1). All ratios exact to 4 dp.
- 🔜 Not done: the `drop-shadow` glow is a fixed px value, so a 16px amino keeps a 7px halo (proportionally huge — reads as a soft dot). Scale the glow with `zoom` if it looks wrong.

**Amino Acid molecules — floating visual, one per owned Amino Acids upgrade (merged into FloatingElements)**
- `src/components/AminoAcids.jsx` — takes `count` prop; renders `count` green molecules drifting via `@keyframes floatAround`; uses **negative animation-delay** (`0..-30s`) so molecules start moving immediately on spawn (not a static pause) — each molecule phases into animation at a different point, creating visual spread without sync drift
- `src/styles/aminoacids.css` — `.amino-molecule` light-green translucent sphere + glow + 2 satellite atoms (`::before`/`::after`); `.amino-layer` fixed full-screen, `z-index:-1`, `pointer-events:none`, `overflow:hidden`
- `App.jsx` — `<AminoAcids count={state.ownedUpgrades.aminoAcids} />` rendered between `<Background />` and `<Stats>` (so DOM-after Background)
- **No new state**: molecule count is DERIVED from `state.ownedUpgrades.aminoAcids` (already maintained by BUY_UPGRADE). Passed as a prop — never duplicated into a separate `useState`, which would risk drifting out of sync. Single source of truth.
- ⚠️ **useMemo([count]) alone is NOT enough — needs DETERMINISTIC seeding**: `useMemo(() => Array.from({length: count}, () => rand()), [count])` rebuilds the WHOLE array when count grows → with `Math.random()` inside, the existing molecules re-randomize and TELEPORT. Fix: seed each molecule's position from its `id` (`pick(seed) = sin(seed) fractional`), so id N always yields the same config. On rebuild, ids 0..n-1 reproduce identical configs → React sees no style change → their running animation continues → only the new id appears. `key={m.id}` lets React match the existing DOM nodes.
- **z-index**: `.amino-layer` z-index -1 (same band as Background) but rendered AFTER Background in DOM → molecules paint above the bubbles yet behind the transparent Universe + pulse-circle. Layer is pointer-events:none so clicks still pass through.
- Not part of the PRD slice plan — extra visual-feedback feature requested ad hoc

**Phase D5 — upgrades filtered by unlocked scale**
- `UpgradeList.jsx` — before `.map()`, filter: `const unlocked = upgrades.filter((u) => u.requireScale <= state.currentScale)`; map over `unlocked` instead of `upgrades`. Card/button/cost internals unchanged.
- **filter-before-map** (not `return null` inside map): keeps the "which items show" rule (business logic) separate from "how they render" (presentation); avoids the `key`-on-null hassle and wasted loop passes
- At `currentScale: 1` (initial) → only Amino Acids shows (requireScale 1); Amoeba (2) + Volvox (3) hidden until their scale unlocks
- Verify note: no auto-unlock yet (that's Phase E) → to test scale 2/3 cards, temporarily set `currentScale` in `gameState.js` initialState, then revert to 1
- Completes Phase D. Next: Phase E (auto-unlock check in TICK + ScaleUnlockModal + per-scale visual)

**Background/Universe z-index restructure — bubbles now behind pulse-circle**
- Resolves the trade-off noted below (Background visibility tuning) — user wanted bubbles/particles visually BEHIND the pulse-circle, not in front of it
- `background.css` — the purple soup gradient MOVED here from `.universe` (`linear-gradient(135deg, #2e1065 0%, #6d28d9 100%)`); `.background-layer` z-index changed **1 → -1**
- `universe.css` — `.universe` background changed to `transparent` (gradient no longer lives here); `.universe:active` flash changed from a darker-purple gradient shift to `rgba(255, 255, 255, 0.08)` (a faint white veil) since there's no gradient left on this element to shift
- ⚠️ **z-index must be `-1`, not `0`**: in CSS paint order a positioned `z-index: 0` element paints ABOVE a `z-index: auto` sibling — so `0` would NOT have pushed the background behind Universe (auto). Only a negative value does. Don't repeat the `0` mistake if touching this stack again.
- **New final stacking**: Background (gradient + bubbles + particles) z-index **-1** → Universe (transparent, catches clicks, hosts pulse-circle) z-index auto → floating +N (DOM-order, auto) → Stats/UpgradeList z-index 10
- Click mechanic fully preserved: Universe still transparent-but-clickable, CLICK dispatch unaffected, flash still fires on `:active` (just a different visual)

**Background visibility tuning — brighter bubbles + particles**
- Complaint: bubbles/particles too faint on the purple gradient → hard to see
- `Background.jsx` — bumped the random ranges: bubble opacity 0.1-0.3 → **0.25-0.5**; particle size 2-6 → **3-8px**, opacity 0.2-0.5 → **0.4-0.7**
- `background.css` — bubble border 1px→**2px** + brighter `rgba(255,255,255,0.6)` + added `box-shadow: 0 0 8px rgba(255,255,255,0.3)` glow (reads as a real air bubble); particle color → brighter `rgba(200,230,255,0.9)`
- ⚠️ **opacity/size RANGES live in `Background.jsx` (inline style via `rand()`), NOT in `background.css`** — inline style wins over CSS, so tuning visibility means editing the JS configs, not the stylesheet. CSS only controls the constant bits (border, glow, base color).
- ~~Known trade-off surfaced (unresolved, user OK for now): bubbles render IN FRONT of the pulse-circle~~ — **RESOLVED**, see "Background/Universe z-index restructure" entry above (gradient moved off Universe, background z-index flipped to -1, click-flash reimplemented as a white veil)

**Background animation — bubbles + particles (primordial soup ambience)**
- `src/components/Background.jsx` — 15 bubbles + 25 particles, configs built with `useMemo([])` (random size/left/duration/delay/opacity); renders divs with inline style pulling from config
- `src/styles/background.css` — `.bubble` rises bottom→top via `@keyframes riseUp` (translateY -110vh + swaying translateX); `.particle` pale-blue mote drifting via `@keyframes drift` (translate + opacity fade); `.background-layer` fixed full-screen, `overflow:hidden`, `pointer-events:none`
- `App.jsx` — `<Background />` rendered first (before Stats/Universe)
- **useMemo is mandatory here**: App re-renders 10×/sec (TICK). Without `useMemo([])` the random configs regenerate every render → animations restart/jitter every 100ms, bubbles never finish rising. `useMemo([])` freezes the random values for the component's lifetime.
- **Particle opacity via CSS var**: inline `--base-opacity` per particle + `drift` keyframe fades to `calc(var(--base-opacity) * 0.35)` at 50% → each mote fades relative to its own base opacity (can't be done with a plain shared keyframe)
- ⚠️ **z-index deviation from naive spec (original approach, later superseded)**: `.universe` originally had an OPAQUE purple gradient filling the viewport, so `.background-layer` was first placed at `z-index:1` (above the gradient) just to be visible at all. This was later superseded — see "Background/Universe z-index restructure" entry above, which moved the gradient off Universe entirely and flipped background to `z-index:-1` so bubbles sit behind the pulse-circle.
- **Stacking at the time (now superseded — see restructure entry above for current order)**: Universe gradient (auto) → Background z-index 1 → Stats + UpgradeList z-index 10 → floating +N (last in DOM, always on top)

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
- Amoeba (cellDivision) — renamed from "Cell Division", id unchanged: click-multiplier, +1/click, cost 50, ×1.3, scale 2
- Volvox (photosynthesis) — renamed from "Photosynthesis", id unchanged: auto-generator, +5/sec, cost 500, ×1.2, scale 3
- **Design note**: `effect` (string for UI) vs `increment` (number for logic) kept separate — display decoupled from math
- **Design note**: string ids used as keys (will map to ownership counts in gameState)
- Cost formula: `baseCost × costMultiplier ^ owned` (2nd Amino Acids = 10 × 1.15¹ = 11.5)

**Font — Exo 2**
- `index.html` — added Google Fonts `<link>` for Exo 2 (weight 400 + 700)
- `src/index.css` — `font-family: 'Exo 2', sans-serif` on `*` selector → applies globally
- Choice: Exo 2 only (no font mixing) — clean and consistent throughout

**Volvox (upgrade display name) — inline SVG colony + Photosynthesis-to-Volvox rename**
- Display name only: `upgrades.js` `name: 'Photosynthesis'` → `'Volvox'`. **`id` stays `photosynthesis`** — it is the `ownedUpgrades` state key and the link to the `.float-photo` variant (same pattern as Amoeba rename). `effect`/`baseCost`/`costMultiplier`/`requireScale` untouched, so no save/balance impact.
- `src/components/shapes/VolvoxShape.jsx` (NEW) — translucent gel sphere (r=40) + 3 asymmetric daughter colonies + 18 rim cells (r=2.5) + 9 dimmer inner cells (r=2). Draw order back-to-front: sphere → daughters → inner ring → rim. The **dimmer inner ring at a smaller radius is what sells the sphere as 3D** rather than a flat disc.
- **Rim cells are computed, not hardcoded** — a `ring(count, radius, dotR, startDeg)` helper returns `{cx: 50 + r·cos θ, cy: 50 + r·sin θ}`; the inner ring is offset by half a step (`startDeg=20`) so the two rings don't line up spoke-on-spoke. 27 hand-written circles would have been unreadable and unmaintainable.
- `VolvoxShape` takes `rotation` like the other two — the shapes map passes it to *every* shape. It matters here despite near-radial symmetry because the daughter colonies are placed asymmetrically.
- **`DEFAULT_SIZE` is now only a fallback.** Every variant has its own `sizeRanges` entry, so the old comment ("the plain CSS blobs") was stale — there are no CSS-blob variants left.
- ⚠️ **Volvox is NOT the largest of the three, despite that being the stated intent.** Spec asked for "largest" *and* for `[55, 85]` — which is exactly the amoeba's range, so they tie (observed: amoeba 69.2–84px, volvox 59.2–73px). Shipped the explicit number rather than substituting a different one. To make it genuinely largest: `'float-photo': [70, 100]`.
- Verified: 31 circles (1 sphere + 3 daughters + 9 inner + 18 rim); all 18 rim cells on radius 40 within 0.02 units at uniform **20°** spacing; bbox 7.5–92.5 × 8.1–91.9 inside the viewBox; blob fully stripped (bg `rgba(0,0,0,0)`, box-shadow `none`, radius `0px`, both pseudo-elements `0px×0px`); `floatAround` + negative delay + `pointer-events: none` on container *and* svg; legible at the smallest instance (59.2px → rim 2.96px, inner 2.37px, smallest daughter 7.1px, all above the ~2px threshold); `.float-amino`/`.float-cell` produce **zero** diff lines and unchanged computed styles; no console errors

**"Cell Division" renamed to "Amoeba" + element redrawn as inline SVG**
- Display name only: `upgrades.js` `name: 'Cell Division'` → `'Amoeba'`. **`id` stays `cellDivision`** — it is the `ownedUpgrades` state key (`App.jsx` reads `state.ownedUpgrades.cellDivision`), the BUY_UPGRADE lookup key, and the link to the `.float-cell` variant. `effect`/`baseCost`/`costMultiplier`/`requireScale` untouched, so no save/balance impact.
- ⚠️ **Renaming an upgrade = change `name` ONLY.** `id` is load-bearing in 3+ places; changing it would silently reset owned counts and break the variant wiring. The CSS class stays `.float-cell` on purpose — renaming it too would be churn for zero gain.
- `src/components/shapes/AmoebaShape.jsx` (NEW) — irregular closed bezier `<path>` body (uneven bulges = pseudopods, deliberately asymmetric so it reads as something that crawls) + 3 vacuoles + off-centre nucleus (48,48 r=11) + 5 granules. Repeated circles live in `vacuoles`/`granules` arrays so coordinates read as data. Draw order outside-in (body → vacuoles → nucleus → granules) so organelles always paint over cytoplasm.
- ⚠️ **Converting a CSS-blob variant to SVG means STRIPPING the blob, not just re-tinting it.** `.float-cell` still had `background`, `box-shadow`, inherited `border-radius: 50%`, plus `::before` (second lobe) and `::after` (nucleus). Swapping only the glow would have left a blue circle + lobe + dot painting *behind* the green amoeba. Full strip needed: `background: none`, `border-radius: 0`, and delete both pseudo-element rules — same shape as the `.float-amino` conversion. Verified after: bg `rgba(0,0,0,0)`, box-shadow `none`, radius `0px`, both pseudo-elements `0px×0px` transparent.
- `AmoebaShape` takes `rotation` like `AminoShape` — the shapes map passes `rotation={m.rotation}` to *every* shape, so omitting the prop would have made all amoebas share one angle while amino acids varied.
- ✅ **Amoeba recolored blue** — repaleted from green to blue (MEMBRANE/CYTOPLASM/VACUOLE/NUCLEUS/GRANULE constants remapped in `AmoebaShape.jsx`). Same lightness/alpha steps preserve glow radius + visual hierarchy; also updated `.float-cell drop-shadow` in `floating-elements.css` to blue `rgba(150,200,230,0.5)` to match (otherwise amoeba would still glow green around blue body). Verified: no green left anywhere in the SVG, membrane/cytoplasm/nucleus/glow all blue, no console errors.
- ✅ **RESOLVED — amoeba was too small** (shipped at `DEFAULT_SIZE = [20, 35]`, user reported "ตัวจิ๋วเกินไป"). Now `'float-cell': [55, 85]`, giving 68–84px containers vs 27–34.5px before (~2.5× linear):

  | feature | at 20–35 | at 55–85 |
  |---|---|---|
  | body width | ~19.5px | **49–61px** |
  | nucleus (r=11) | ~6px | **15–18.5px** |
  | vacuoles (r=4–8) | 2.2–5.6px | **5.4–13.4px** |
  | granules (r=1.5–2.5) | **0.81–1.35px** (invisible) | **2.0–4.2px** (visible) |

- ⚠️ **Sizing an SVG variant: work backwards from its SMALLEST feature, not the body.** The granules are r=1.5 in a 100-unit viewBox, so rendered diameter is `3 × containerPx / 100` — needing ~2px means a container ≥65px. An intermediate `[40, 60]` was considered and rejected precisely because it still left granules at ~1.2px, i.e. the same bug again. Any future shape with fine interior detail needs the same check before picking a range.
- Amoeba deliberately out-sizes the amino acids (63.9–69.2px) — it is a whole organism, not a molecule.
- Size-range changes are safe w.r.t. seeding: the seed expression `pick(s * 93.98 + 5, …)` is untouched, only the output min/max remaps, so **positions stay put and each element keeps its relative size**. Verified: `.float-cell` left/top match the seeded formulas to ~1e-5 after the change.
- 🐛 **Verification gotcha**: comparing inline-style positions against recomputed seed values needs a tolerance ≥1e-4. The browser serialises `style.left` to **6 significant figures** (`15.6682%` for `15.668189…`), so a 1e-6 tolerance reports a false mismatch even when nothing changed.
- Verified: card reads "Amoeba" with `+1 biomass/click` / `Cost: 50` unchanged; `id` grep shows all 3 `cellDivision` references intact; SVG renders 1 `<path>` + 9 `<circle>`, bbox 11–83.3 × 19–86 inside the viewBox; `floatAround` + negative delay intact; `.float-amino`/`.float-photo` rules byte-identical read from CSSOM; no console errors

**Amino Acids element — real molecular structure via inline SVG (replaces CSS blob)**
- Was: a green circle + 2 satellite dots drawn with `::before`/`::after`. Now: a glycine ball-and-stick skeleton — 7 atoms + 7 bond lines, drawn as inline SVG.
- `src/components/shapes/AminoShape.jsx` (NEW) — `<svg viewBox="0 0 100 100">`, two `<g>` groups: **bonds first, atoms second** so the circles paint over the bond endpoints (standard ball-and-stick look). Atoms follow rough CPK convention: Cα/C grey-green, N blue, O red ×2, R bright green, H white. `aria-hidden` — purely decorative.
- **C=O double bond math** (worth keeping, it's easy to get wrong): bond runs (75,50)→(90,30), so unit vector = (0.6,−0.8), perpendicular = (0.8,0.6); scaled by 1.5 → offset (1.2, 0.9), giving two parallel lines 3px apart at `76.2,50.9→91.2,30.9` and `73.8,49.1→88.8,29.1`.
- `FloatingElements.jsx` — added a `shapes` map (`{'float-amino': AminoShape}`); a variant **absent** from the map renders a bare `<div>` exactly as before, so cell/photo take the unchanged code path. Also a `sizeRanges` map: amino **45–70px** (SVG detail needs room to be legible), everything else stays at `DEFAULT_SIZE = [20, 35]` — *(cell later got its own `[55, 85]` for the same reason; only `float-photo` still uses the default)*.
- ⚠️ **Size range changed but seeding did NOT** — the seed expression `pick(s * 93.98 + 5, …)` is byte-identical; only the output min/max is remapped, so each molecule keeps its *relative* size and its position/duration/delay are unchanged. Verified by recomputing with the pre-change formulas: left `66.7878%`, top `87.9415%`, duration `18.0012s`, delay `−29.2514s` all match the live DOM exactly.
- ⚠️ **`drop-shadow`, NOT `box-shadow`, for the glow on any SVG variant** — `box-shadow` traces the div's square box, which on a transparent container renders a glowing *rectangle* around the molecule. `filter: drop-shadow(...)` follows the SVG's actual alpha channel so the glow hugs the bonds/atoms.
- `.float-amino` also needs `border-radius: 0` to opt out of the base `.float-molecule { border-radius: 50% }`, and `background: none`. The base `.float-molecule::before/::after` rules still create pseudo-elements but they have no width/height/background → invisible, harmless.
- `.float-amino svg { display: block }` — avoids the inline baseline gap pushing the SVG a few px past the box.
- `minSize`/`maxSize` added to the `useMemo` dep array — constant per instance so behaviour is identical, but omitting them would be a latent stale-closure bug.
- **Why SVG over pseudo-elements**: `::before`/`::after` gives exactly 2 shapes and this needs 14; bonds are lines between two points (CSS would need hand-computed rotation + length per bond); `viewBox` gives free proportional scaling at any container size; paint order is explicit rather than z-index games.
- **Per-spawn rotation** (follow-up): each molecule spawns tilted at its own angle so copies don't all read as the same orientation. `rotation: pick(s * 56.41 + 6, 0, 360)` — new seed expression continuing the `+1..+5` pattern, so it cannot perturb position/duration/delay/size. Passed as `<Shape rotation={m.rotation} />`; `AminoShape` applies it as `style={{ transform: rotate(Ndeg) }}`.
- ⚠️ **Rotation must go on the `<svg>` CHILD, not the container div** — the container's `transform` is owned by the `floatAround` animation, and a running animation beats a normal declaration in the cascade, so `rotate()` there would silently do nothing (same trap as `.pulse-circle`, see the click-feedback entry). Child element = no conflict, and the drift path stays byte-identical.
- ⚠️ **Rotate the `<svg>` ELEMENT, not a `<g>` inside it** — an `<svg>` clips to its own viewport. The carbonyl O sits ~52 units from centre, further than the 50-unit half-width, so rotating the *contents* would slice atoms off at certain angles. Rotating the element happens after that clip → nothing is ever cut (verified: content bbox 12–97 × 14–83, inside the 0–100 viewBox).
- Rotation verified: 7 molecules, all angles distinct and each matching its seeded value to <0.05° (recovered from the rendered matrix via `atan2`); spawning a new molecule left all existing ones with **identical rotation + position + size + delay** (no re-roll); `.float-cell`/`.float-photo` still have no SVG child and `rotate: none`, computed styles byte-identical to the pre-SVG measurements
- Verified: 7 circles + 7 lines at the exact spec coords/radii/fills; `pointer-events: none` on both container and `<svg>`; **`.float-cell`/`.float-photo` computed styles byte-identical to before** (bg/box-shadow/::before/::after/radius/size 20-35, no SVG child) and `git diff` on the CSS touches neither selector

**Click-feedback accessibility fix — removed full-screen strobe flash**
- Problem: `.universe:active { background: rgba(255,255,255,0.08) }` veiled the **entire 100vw×100vh viewport** on every click. At idle-game click rates (5-10/sec), this created a 5-10 Hz strobe, inside the 3-30 Hz band [WCAG 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) flags as a photosensitive-seizure risk.
- Solution: Scoped feedback to the 120px core instead (~1.5% of screen):
  - Deleted `.universe:active` flash rule entirely (left a comment explaining why, so it doesn't get re-added by accident)
  - Added `.universe:active .pulse-circle { background: rgba(255,255,255,0.45) }` — a gentle press on the core only
  - Added `transition: background 0.18s ease-out` to `.pulse-circle` — the eased edge prevents a hard on/off square wave (which reads as flashing even at low volume); rapid clicks now blend into one steady glow
- Verified via CSSOM inspection: full-screen `.universe:active` rule confirmed gone, only one `:active` rule remains (core-scoped); click mechanic still works (0 → 3 biomass on 3 clicks)
- Overall feedback: floating **+N** bubble at cursor (primary) + gentle core glow (secondary)

**Phase E3 — Universe visual changes per scale (background color + scale-name label)**
- `Background.jsx` — new `currentScale` prop, applied as `className={`background-layer scale-${currentScale}`}`; bubbles/particles logic untouched
- `background.css` — gradient stops (`--bg-from`/`--bg-to`) declared as **registered custom properties** (`@property ... syntax: '<color>'`), then `.scale-1`/`.scale-2`/`.scale-3` each redefine the two vars (violet → ocean blue → green/turquoise); `.background-layer` transitions `--bg-from`/`--bg-to` over 1.5s
- `Universe.jsx` — new `scaleName` prop, rendered as `<div className="scale-label">{scaleName}</div>` inside `.universe`
- `universe.css` — `.scale-label` absolutely positioned under `.pulse-circle` (`top: calc(50% + 90px)`, `translateX(-50%)`), white 70% opacity, wide letter-spacing, uppercase, `pointer-events: none`
- `App.jsx` — derives `currentScaleObj = scales.find(s => s.id === state.currentScale)`; passes `currentScale`/`scaleName` down to `Background`/`Universe`
- ⚠️ **`transition: background` does NOT animate a gradient swap** — `background-image` (which a `linear-gradient` is) is not an animatable CSS property; a plain class-swap transition silently no-ops (verified: 0 `Animation` objects created on a naive test element). Fix: transition the gradient's **color stops**, not the gradient itself — `@property` gives each stop a real `<color>` type, and typed custom properties DO interpolate. Root cause to remember if another gradient-swap-with-transition is attempted anywhere in this project.
- **Browser support caveat**: `@property` needs Chrome 85+/Safari 16.4+/Firefox 128+ — fine for local dev, would need a fallback (e.g. stacked-layer opacity cross-fade) if ever shipped somewhere older
- Verified via computed styles (headless preview pane couldn't screenshot/composite frames — `visibility:hidden` freezes CSS transition clocks): scale-1 `#2e1065→#6d28d9`, scale-2 `#082f49→#0369a1`, scale-3 `#064e3b→#0d9488`, all three confirmed by reading `getComputedStyle(...).backgroundImage` after forcing frozen transitions to `.finish()`; label text confirmed "Primordial Soup"/"Single Cell"/"Multicellular Life" matching `state.currentScale`
- **Click-through regression check**: clicked at the label's exact bounding-box center — `elementFromPoint` resolved to `.universe` (not `.scale-label`), biomass incremented correctly (+5 for 5 clicks) → `pointer-events: none` on the label confirmed not to block the click mechanic
- User to eyeball the actual 1.5s cross-fade smoothness in a real (non-headless) browser — computed-style checks prove the transition fires and lands on the right end color, but not its visual smoothness

### ✅ Verified: Full playthrough 0 → Scale 3

**Phase D4 — Amino Acids cost scaling** ✅ VERIFIED
- Buy 1: cost 10 (biomass 0 → deducted immediately)
- Buy 2: cost displayed as 12 (10 × 1.15 ≈ 11.5, rounded display)
- Multiple purchases work correctly; cost multiplier scaling confirmed

**Phase E — Scale progression** ✅ VERIFIED
- Scale 1 (Primordial Soup, threshold 0): start here, Amino Acids available
- Scale 2 (Single Cell, threshold 100): modal triggers on unlock, Cell Division unlocked + visible
- Scale 3 (Multicellular Life, threshold 1000): modal triggers on unlock, Volvox unlocked + visible
- All modals dismiss cleanly, no re-triggers, scale progression smooth

**Phase F — Floating organisms + game loop** ✅ VERIFIED
- Amino Acids purchase: 1 green molecule spawns (position stable, drifts smoothly)
- Cell Division purchase: 1 blue cell molecule spawns (2-lobe split cell, nucleus)
- Volvox purchase: 1 translucent green Volvox colony spawns (sphere + daughter colonies + rim cells)
- All 3 elements coexist without overlap (seeded RNG prevents collision)
- Deterministic positioning: same `id` → same coordinates across rebuilds (no teleport)
- Drift animation begins immediately (negative delay applied)
- Visual feedback on purchase: element spawns + floats away in 4-point wandering loop

### 🔜 Next (Phase 2+, if desired)

**Phase G** — Balancing/tuning: upgrade costs, biomass per-click scaling, progression pacing

---

### 🏁 Phase H — End-game (ship the ending)

> ✅ **PHASE H COMPLETE — 2026-10-19.** H1 reducer (2026-09-07) → H2 modal +
> confetti (2026-09-28) → H3 wiring (2026-10-04) → H4 user visual pass
> (2026-10-19). MVP 1.0 has a real, playable ending.
>
> History worth keeping: the whole feature was built once on 2026-08-28 and
> **reverted at the user's request** — the design was agreed, the go-ahead to code
> never was. Each of H1–H4 was then rebuilt only on its own explicit instruction.

**Goal**: MVP 1.0 gets a real finish. Reach **5,000 biomass while at Scale 3** →
one-time ending modal → dismiss → **game continues completely normally**.
Full design + rationale in the `🏁 PLANNED — End-game condition` section below.

#### Decided ✅
- Ends at Scale 3. **No Scale 4+, no prestige** (see rejected list at the bottom).
- Trigger: biomass ≥ 5,000 while `currentScale === 3`.
- After dismissal, clicking / buying / idle ticking all keep working.

#### Resolved ✅ (were open until 2026-09-28)
- **Ending modal wording** → title is exactly **`ถึงเป้าหมายแล้ว!!`**, button reuses
  `Continue` (same label as ScaleUnlockModal). ⚠️ **User-approved copy — do not
  reword, do not add emoji, do not add extra sentences.** The earlier reverted
  attempt invented "You did it 🎉" / "Keep Playing"; that copy is dead.
- **Visual treatment** → distinct: its own `ending-modal.css`, gold/amber vs the
  scale modal's blue-green, card 1.4× larger, own entrance + slow glow animation.
- **Background clicks while the ending modal is open** (decided 2026-11-21) → **keep
  as is, no change.** Clicks on the background earn nothing; passive income keeps
  running. Reasons:
  - the modal blocks clicks so the player cannot miss the ending message by
    clicking straight through it;
  - passive income (`TICK`, a timer) keeps accruing, so the player loses nothing
    while it is open;
  - it matches `ScaleUnlockModal` exactly — verified, not assumed (see below).

#### Tasks

**H1 — Reducer: win-condition state** ([gameState.js](src/game/gameState.js)) ✅ DONE 2026-09-07
- `const ENDING_BIOMASS = 5000` — kept in `gameState.js`, **not** `scales.js`:
  it is a finish line *inside* Scale 3, not a 4th scale threshold.
- `initialState` gained `hasEnded: false`, `pendingEnding: false`.
- In `TICK`, after the existing scale-unlock branch (which returns early, so an
  unlock tick can never also fire the ending): if
  `!hasEnded && currentScale === 3 && newBiomass >= ENDING_BIOMASS` → set both flags.
  Uses `newBiomass` (post-tick) so the ending fires on the tick that crosses the line.
- New `DISMISS_ENDING` action clears `pendingEnding` only; `hasEnded` stays true.
- ⚠️ **Two flags, not one.** Buying upgrades after the ending can drop biomass back
  under 5,000 and climb over it again; a single flag re-shows the modal every time.
  `hasEnded` is one-way and never resets — that is what makes it fire exactly once.
  `pendingEnding` drives the modal so the two cannot drift apart.
- **Verified by automated test: 29 cases, all passing** (`npm test`, see the Testing
  section). Includes the re-fire regression the two-flag design exists to prevent,
  proven both with a hand-set biomass drop and through real `BUY_UPGRADE` dispatches.
  No UI exists yet — H1 is reducer-only, and nothing in `App.jsx` was touched.
- Observation, deliberately left as specced: `currentScale === 3` hardcodes the final
  scale. Correct today (Scale 4+ is rejected), but if that is ever revisited this
  line keeps firing at 3. `scales[scales.length - 1].id` would self-maintain.

**H2 — `EndingModal` component** (`src/components/EndingModal.jsx`, new) ✅ DONE 2026-09-28
- Props `{ show, onDismiss }`; `if (!show) return null` — same shape as
  `ScaleUnlockModal`, which is driven purely by whether its prop is set.
- Separate component rather than a flag on `ScaleUnlockModal`: its content is not
  a `scale` object, and dismissing it does not advance anything.
- ⚠️ **Does NOT reuse `modal.css`** (an earlier plan said it could). It has its own
  `src/styles/ending-modal.css` with **`ending-` prefixed selectors throughout**
  (`ending-overlay` / `ending-card` / `ending-title` / `ending-continue`), sharing
  no selector with `modal.css`. That isolation is the point: the scale-unlock modal
  is live and must never be restyled by accident from the ending's stylesheet.
- Keyframes are `endingRise` (entrance, 0.7s, once) and `endingGlow` (idle halo,
  3.6s, infinite) — **deliberately not named `modalPop`**, which exists in
  `modal.css`; duplicate `@keyframes` names would silently collide.
- ⚠️ **The 3.6s glow must stay slow.** 3.6s ≈ 0.28Hz, ~11× below the 3Hz floor of
  the WCAG 2.3.1 photosensitivity band, and the two keyframe states are close in
  intensity so it reads as a swell. Shortening it or widening the contrast turns it
  into a strobe — the same class of bug already fixed once on `.universe:active`.
- `@media (prefers-reduced-motion: reduce)` kills both animations; the card just
  appears, fully legible.
- 🇹🇭 **Thai text renders via per-glyph fallback, verified not assumed.** The global
  font is **Exo 2, which has no Thai glyphs**, so the title falls back to
  `sans-serif` (Windows → Leelawadee UI / Segoe UI). Tested with a tofu check:
  every glyph's advance width differs from a `U+E000` private-use box (24px), and
  the three combining tone marks correctly measure 0 width. **No font override was
  added** — none is needed, and changing the game font was explicitly out of scope.
- ⚠️ **Two Thai typography rules in `.ending-title`, do not "tidy" them away**:
  `line-height: 1.6` (tight line-height clips tone marks above/below the baseline)
  and `letter-spacing: normal` (the scale modal uses `0.1em`, which would detach
  Thai combining marks from their base character).
- Verified by **11 component tests** in `EndingModal.test.jsx` (see Testing section):
  empty render when `show=false`, title present when true, `onDismiss` fires exactly
  once, button label, no `5000` in rendered text, plus the 6 confetti cases below.

**Confetti celebration burst** (added 2026-10-16, on top of H2)
- `canvas-confetti` — **the project's first runtime dependency besides React**
  (~11 kB added to the bundle). User chose the library over a CSS-only effect.
- One gold burst (`#fbbf24 / #fcd34d / #f59e0b / #fde68a`, matching the card) fired
  from a `useEffect` in `EndingModal.jsx`. No change to the card markup, the
  approved copy, or `ending-modal.css`.
- ⚠️ **The dep array must be `[show]`.** `TICK` re-renders this modal **10×/sec**
  while it is open, so an empty/missing dep array would fire confetti continuously
  — a strobe, i.e. the exact class of bug already removed from `.universe:active`.
  There is a regression test for this (5 forced re-renders → still 1 call).
- ⚠️ **The reduced-motion guard must live in JS, not CSS.** The
  `@media (prefers-reduced-motion: reduce)` block in `ending-modal.css` only stops
  CSS animations and has **no effect on a canvas animation**. `EndingModal` checks
  `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before firing;
  `disableForReducedMotion: true` is passed as well, but the explicit guard is the
  one that is tested.
- The hook sits **above** `if (!show) return null` — rules of hooks.
- Browser-verified: canvas is `position: fixed`, `z-index: 100`,
  **`pointer-events: none`** so it never blocks the Continue button.
- 🐛 Reading pixels off that canvas throws *"Cannot get context from a canvas that
  has transferred its control to offscreen"* — `canvas-confetti` renders in an
  **OffscreenCanvas worker**. Its `width`/`height` also read `0` from the main
  thread after transfer. Neither is a bug; don't chase them.

**H3 — Wire into App** ([App.jsx](src/App.jsx)) ✅ DONE 2026-10-04
- Rendered after `<ScaleUnlockModal>`, `show={state.pendingEnding}`,
  `onDismiss={() => dispatch({ type: 'DISMISS_ENDING' })}`.
- Total change: 2 lines imported/rendered in `App.jsx` and nothing else — the
  reducer (H1) and component (H2) already did the work, they were simply not
  connected. Full suite still 34/34; no test needed updating.

**H4 — Verify** (all four were confirmed working in the reverted build)
1. Reach Scale 3, push past 5,000 → ending modal appears.
2. Dismiss → modal closes, biomass keeps climbing.
3. Buy an upgrade *after* the ending → purchase still works.
4. Stay well above 5,000 and spend down/up → modal never reappears.

✅ **DONE 2026-10-19 — user visual pass, all checks passed.** Two layers of proof:
- **Automated** (`src/App.test.jsx`, 2026-10-10): items 1–4 above are cases
  B2 / B3+B5 / B7 / B8, driving the real App with fake timers.
- **By eye in a real browser** (the user): the 4 items above, plus what tests
  cannot judge — the gold card reads as distinct from the blue-green
  *Scale Unlocked!* modal; the Thai title `ถึงเป้าหมายแล้ว!!` renders cleanly with
  its tone marks; the confetti burst looks right; reduced-motion behaviour.
- How the pass was staged: `initialState` was temporarily seeded to
  `biomass 4900 / perSec 20 / currentScale 3 / unlockedScales [1,2,3]` (each line
  tagged `// TEMP: H4`), then reverted with `git checkout` — `gameState.js` verified
  byte-identical to HEAD afterwards. ⚠️ While seeded, **`gameState.test.js` drops
  to 50/51** by design: `still has every pre-existing field` asserts those exact
  four fields. That is the expected cost of any future seeded visual pass, not a
  regression — `App.test.jsx` is immune because it mocks `initialState`.

**Clicking the background while the ending modal is open — verified behaviour**
(2026-10-19, hit-tested at 1280×720, five points at the corners and top-centre):
- **Clicks do NOT earn biomass.** All five points hit `.ending-overlay`; none reach
  `.universe`. Control with no modal: all five reach `.universe`. The overlay is
  full-viewport, `z-index: 100`, `pointer-events: auto`, so it absorbs every click.
- **Passive income keeps running** — `TICK` is a timer, not a click.
- The confetti canvas is `pointer-events: none`, so it never blocks anything.
- ✅ **Decision recorded** in *Resolved* above: keep as is.
- **Parity with `ScaleUnlockModal` — verified 2026-11-21 on the real modal** (not
  injected markup), viewport 1280×720:
  - same overlay rule in both stylesheets: `position: fixed`, full viewport,
    `z-index: 100`, no `pointer-events` override (so `auto`);
  - hit-test at the same 5 points → all land on `.modal-overlay`, none on `.universe`;
  - a **real click** (not scripted) on the background → **+0 biomass, no `+N`
    bubble**; control after dismissing, same spot → **+1 biomass, 1 bubble**, which
    proves the click itself was delivered;
  - passive income kept rising while the modal stayed open (111.4 → 116.9 at
    +0.2/sec).
  - ⚠️ If either overlay ever gains `pointer-events: none` or shrinks below full
    viewport, background clicks would start earning biomass for that modal only and
    the two would stop matching. Change both together or neither.
- 🐛 Hit-testing gotcha: the preview pane often reports a **0×0 viewport** when
  hidden, so `document.elementFromPoint` returns `null` and every probe "passes"
  vacuously. Set a real size (`resize_window`) and run a no-modal control first.

#### Cross-dependencies
- 🔗 **Save/load (backlog #4) must persist `hasEnded`** — otherwise every reload
  re-triggers the ending for a returning player. Whichever ships second has to
  account for the other.
- 🔗 **Compact formatting (backlog #3)** renders the threshold as `5.00K`. Harmless,
  but the ending copy should not hard-code the string "5000".
- 🔗 **Phase G balancing** — do not raise 5,000 without re-checking the pacing table
  below; the income curve is already flattening by then.

#### Rejected alternatives (do not re-propose without asking)
- **Scale 4+ expansion** — would need the flat-increment problem fixed first
  (income grows logarithmically; see pacing data below), i.e. a much larger job.
- **Prestige / reset loop** — deliberately out of scope for MVP 1.0.

---

### 📋 Minor improvements backlog (post-MVP 1.0)

Shortlist agreed with the user. Ordered by recommendation, not priority-of-value:

1. **Fix the `+N` bubble key collision** — one line, clears the open bug below (`useRef(0)` counter instead of `Date.now() + Math.random()`).
2. **Show `perClick` in Stats** — real information gap: buying Amoeba 5× makes each click worth 6, and **nothing on screen ever says so**. `Stats` shows biomass + `perSec` only.
3. **Compact number formatting** — SPEC AGREED, NOT YET BUILT. See below. (The ending itself is **Phase H** above, not part of this backlog.)
4. **Save/load to localStorage** — highest player value; a refresh currently wipes everything ([gameState.js](src/game/gameState.js) says so in its header comment). Prerequisite worth doing first: `perSec`/`perClick` are *stored* in state but also *derivable* from `ownedUpgrades`, so a save should persist only `biomass` + `ownedUpgrades` + `unlockedScales` and recompute the rest — otherwise a future `increment` tweak leaves old saves inconsistent.
5. **`prefers-reduced-motion`** — five simultaneous animation systems (`floatAround`, `pulse`, `riseUp`, `drift`, `+N` bubbles). Same class of concern as the full-screen strobe already removed for WCAG 2.3.1; pure CSS.

Also noted: **`UNLOCK_SCALE` in the reducer is dead code** — nothing dispatches it, `TICK` unlocks inline. Delete it with whichever item touches the reducer first (likely save/load).

---

### 📐 PLANNED — Compact number formatting (spec agreed, implementation NOT started)

> Requirements gathered from the user 2026-08-22. Display-only; `gameReducer` keeps
> operating on exact floats and is not touched.

**`src/game/format.js`** (new, pure, no deps) — one shared `compact()` core + four named
wrappers so each call site reads for itself:

| export | used by | rounding | below 1,000 |
|---|---|---|---|
| `fmtBiomass` | main counter | **floor** | 1 dec under 100, then integer |
| `fmtRate` | `+N/sec` | floor | 1 dec under 100, then integer |
| `fmtCost` | upgrade cards | **ceil** | integer |
| `fmtClick` | `+N` bubbles | — | integer |

**Tiers** (K/M/B/T, adaptive ~3 significant digits, trailing zeros KEPT for stable width):

| range | output | example |
|---|---|---|
| 0 – 99.9 | 1 dec *(fractional variants)* / integer *(whole)* | `7.8` / `7` |
| 100 – 999 | integer | `318` |
| 1,000 – 9,999 | `X.XXK` | `1.00K`, `9.99K` |
| 10,000 – 99,999 | `XX.XK` | `12.3K` |
| 100,000 – 999,999 | `XXXK` | `123K` |
| ≥ 1e6 | same 3-tier pattern, M → B → T | `1.23M` |

⚠️ **Floor/ceil apply at the DISPLAYED precision, not just to the raw number.**
Cost `1234.5` → `1.2345K` → ceil to 2dp → `1.24K`. Biomass `1239` → floor to 2dp → `1.23K`.
This is what makes the affordability guarantee hold *at every magnitude* rather than only
under 1,000: what you own is never overstated, what you owe is never understated, so **the
display can never show an affordable-looking purchase that the reducer then refuses.**

⚠️ **The decimal under 100 is load-bearing, not cosmetic.** Biomass ticks by `perSec/10`
every 100ms; with only Amino Acids (+0.2/sec) that is +0.02/tick. Round to integers below
1,000 and the counter freezes at `0` for five seconds then jumps — early-game passive income
stops *feeling* alive. Hence 1 decimal under 100 for biomass and rate.

⚠️ **Do NOT apply that decimal rule to costs or `+N` bubbles.** Those values are always
whole; the rule would render `Cost: 11.5` and `+6.0`, which is worse than today. Per-site
split is deliberate (user confirmed).

**Also replaces a real inconsistency**: [UpgradeList.jsx](src/components/UpgradeList.jsx)
currently uses `cost.toFixed(0)`, which rounds to *nearest* — so it can display a cost
*lower* than what is charged (2nd Amino Acids costs `10 × 1.15 = 11.5`). At 11.2 biomass the
card reads `Cost: 11` next to `11.2` with the button still disabled. `fmtCost` uses ceil.

**Files to touch**: `src/game/format.js` (new) · [Stats.jsx:8-9](src/components/Stats.jsx)
(2 sites) · [UpgradeList.jsx:23](src/components/UpgradeList.jsx) (1 site) ·
[App.jsx:84](src/App.jsx) (1 site) · [stats.css:19](src/styles/stats.css)
(`font-variant-numeric: tabular-nums` — the counter is centred at 3.5rem via
`translateX(-50%)`, so digit-width changes shift it sideways).

**Verification plan** — items 1–2 are now **Vitest cases** (`src/game/format.test.js`),
not eyeball checks; Vitest has been in the project since 2026-09-12 (see Testing section):
1. Boundaries: `0, 0.02, 99.9, 100, 999, 999.99, 1000, 1234.5, 9999, 10000, 99999, 100000, 999999, 1e6, 1e9`
   — one `it.each` table asserting the exact string from the tier table above.
2. **Affordability invariant as a real assertion** — sweep biomass/cost pairs and confirm
   `displayed-affordable === reducer-affordable` for every one. Write it as a Vitest test
   that imports `gameReducer` alongside the formatter: for each pair, compare
   `fmtBiomass(b) >= fmtCost(c)` (parsed back) against whether `BUY_UPGRADE` actually
   succeeds. This is the claim worth proving, and a loop of a few thousand pairs is free.
3. Early-game regression: with only Amino Acids, the counter still visibly moves every tick
   — testable too: `fmtBiomass(0.02) !== fmtBiomass(0.04)`.
4. Live browser check at scale 3 + confirm the centred counter no longer shifts as it climbs
   (the one item that genuinely needs eyes — width jitter is a rendering property).

---

### 📉 Pacing data — why the game plateaus (simulated 2026-08-28)

> Tasks and design for the ending live in **Phase H** above; this section is the
> supporting measurement, kept separate so there is only one place to update.

**⚠️ Read this before tuning the 5,000 ending threshold, touching upgrade costs
(Phase G), or proposing new scales.** Simulated against the real numbers in
`upgrades.js`:

| elapsed | perSec | owned (amino/amoeba/volvox) |
|---|---|---|
| 10 min | 79 | 45/18/14 |
| 30 min | 121 | 57/24/22 |
| 60 min | 148 | 63/28/27 |
| 110 min | 169 | 68/31/31 |

- Scale 3 is reached in **3–8 minutes** depending on click rate.
- From minute 10 to minute 110 — **11× the play time — income barely doubles.**
- **Cause: costs grow exponentially, income per purchase is flat.** The nth Amino
  Acids costs `10 × 1.15ⁿ` but always gives `+0.2/sec`, so the price of one extra
  biomass/sec explodes (owned 0 → 50; owned 20 → 818; owned 40 → 13.4K; owned 60 →
  219K). Income ends up growing like the *logarithm* of spending.
- **Consequence**: any win threshold much beyond ~5,000 becomes a long grind. 5,000
  sits comfortably inside the healthy part of the curve; do not raise it without
  first fixing the flat-increment problem.
- Zero clicking = the game never starts (perSec is 0 until the first Amino Acids
  purchase, which requires clicks).

---

## Known gotchas / lessons learned

### 🐛 OPEN BUG — floating "+N" bubble ids collide (`Date.now() + Math.random()`)
- `App.jsx` builds each click bubble's key as `id: Date.now() + Math.random()`. React logs *"Encountered two children with the same key"* when clicking fast.
- Cause: `Date.now()` is ~1.78×10¹² (13 digits) and float64 holds ~16 significant digits, so adding a 0–1 fraction leaves only ~2–3 usable fractional digits — the random part gets truncated away.
- Measured: **500 ids generated → 477 unique (23 collisions, ~4.6%)**.
- Harmless today (bubbles are transient decoration) but it's a real React key violation; duplicate keys mean bubbles can be duplicated or omitted.
- Fix when convenient: a monotonic counter (`useRef(0)`, `nextId.current++`) instead of timestamp+random.
- **NOT introduced by the SVG amino work** — pre-existing since Phase C3, just surfaced by rapid automated clicking during verification.

### Dev server must be running to view the game
- `ERR_CONNECTION_REFUSED` at `localhost:5173` does NOT mean a code error — it means no `npm run dev` process is running.
- ⚠️ **5173 is NOT guaranteed to be this project.** The user has other Vite projects (e.g. `glass-bead-game`); whichever starts first takes 5173 and Vite silently moves the next one to **5174**, printing `Port 5173 is in use, trying another one...`. A page that loads but shows the *wrong app* looks exactly like a broken build. **Always read the port off the `npm run dev` output and check the tab title says `life-evolution` before debugging anything.**
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
- [x] D4 — Verify Amino Acids: buy → perSec +0.2; buy again → cost = 10 × 1.15¹ = 11.5 ✅ VERIFIED
- [x] D5 — Show upgrades only when their scale is unlocked (filter `requireScale <= currentScale` before map)

### Phase E: Scale Progression
- [x] E1 — Unlock check inside TICK: biomass ≥ threshold → auto-dispatch UNLOCK_SCALE (reads threshold from scales.js, checks currentScale+1 only)
- [x] E2 — `src/components/ScaleUnlockModal.jsx` — modal with scale name + flavor text + dismiss button (no re-trigger; guarded by reducer state + nextScale-only check)
- [x] E3 — `Universe.jsx` visual changes per scale (color / label) ✅ background gradient (per-scale, 1.5s fade via `@property`) + scale-name label under pulse-circle
- [x] E4 — Verify Scale 2: 100 biomass → modal ✅, Cell Division available ✅, background fades to ocean-blue ✅, label "Single Cell" ✅
- [x] E5 — Verify Scale 3: 1,000 biomass → modal ✅, Volvox available ✅, background fades to green/turquoise ✅, label "Multicellular Life" ✅

### Phase F: Polish & End-to-End Test
- [x] F1 — Play full loop 0 → Scale 3 ✅ VERIFIED (no bugs found; smooth progression through all scales + all upgrades functional)
- [x] F2 — Verify all 3 upgrade cost scaling formulas ✅ re-verified 2026-10-19: real reducer, all 3 upgrades × owned 0/1/2/5/10 = 15/15 match `baseCost × multiplier^owned` (the Vitest suite only covers Amino Acids explicitly)
- [x] F3 — Modal must not re-trigger after dismiss (even if biomass stays above threshold) ✅ re-verified 2026-10-19: dismissed at 100 and at 1000, held above each for 300 ticks — never re-raised, `unlockedScales` never duplicated (6/6)
- [x] F4 — Final check: no console errors or warnings ✅ under normal play; `App.test.jsx` asserts zero `console.error`/`warn` across all 11 cases. ⚠️ **One known exception:** the OPEN `+N` bubble key-collision bug (see Known gotchas) still logs *"Encountered two children with the same key"* under **rapid** clicking. Not new, not fixed.

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
| Amoeba (id `cellDivision`) | Scale 2 | Click multiplier | +1 biomass/click | 50 | 1.30 |
| Volvox (photosynthesis) | Scale 3 | Auto-generator | +5 biomass/sec | 500 | 1.20 |

**Cost formula:** `cost = baseCost × (multiplier ^ owned)`

### Core loop
```
Click → +1 biomass
Buy Amino Acids → +0.2 biomass/sec
Reach 100 → unlock Scale 2 (Single Cell)
Buy Amoeba → +2 biomass/click
Reach 1,000 → unlock Scale 3 (Multicellular Life)
Buy Volvox → +5 biomass/sec
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
| Testing | **Vitest** + @testing-library/react + jsdom (see Testing section) |
| Runtime deps | React, **canvas-confetti** (ending burst — the only non-React dep) |

---

## Testing

The project has **Vitest** as a devDependency (added with H1, 2026-09-12), plus
**@testing-library/react + jsdom** for component tests (added with H2, 2026-09-28).

```bash
npm test            # run once (vitest run)  -> currently 51 tests in 3 files
npm run test:watch  # re-run on file change
```

⚠️ **jsdom is opted into PER FILE, not globally.** `EndingModal.test.jsx` and
`App.test.jsx` each carry a
`@vitest-environment jsdom` docblock pragma; `gameState.test.js` deliberately stays
on the default **node** environment (it tests a pure reducer and needs no DOM, and a
global jsdom would slow it down for nothing). There is **no `vitest.config.*`**, and
`vite.config.js` has no `test` key — so the defaults are what keep that split
working. If a global environment is ever set, re-check that the reducer tests still
run in node.

**`src/game/gameState.test.js`** — 29 cases against the real `gameReducer` (node env):

| group | covers |
|---|---|
| `initialState` | new ending flags present + false; every pre-existing field intact; `ownedUpgrades` derived from `upgrades.js` |
| ending trigger | fires on the tick that *crosses* 5,000 using post-tick biomass; `>=` not `>`; scale progression untouched when it fires; no mutation of input state |
| scale guard | 6,000 biomass on scale 1 / 2 → never fires |
| `DISMISS_ENDING` | clears `pendingEnding`, keeps `hasEnded`; safe to dispatch repeatedly |
| **never re-triggers** | 300 ticks above the line after dismiss; spend below 5,000 then climb back (hand-set **and** via real `BUY_UPGRADE`) → stays dismissed |
| other actions | `CLICK` crossing 5,000 and `BUY_UPGRADE` never touch the ending flags |
| regression | scale 2/3 unlocks + `pendingModalScale`; no duplicate `unlockedScales` over 300 ticks; `DISMISS_MODAL`; `CLICK` adds `perClick`; `BUY_UPGRADE` charges `baseCost × multiplier^owned`, refuses when short, click-multiplier raises `perClick` not `perSec` |

The test file builds state with its **own local `makeState()` factory** (not
imported), so each case sets up exactly the situation it needs.

**`src/components/EndingModal.test.jsx`** — 11 cases (jsdom env). Markup/behaviour:
renders empty when `show={false}`; shows the approved title when true; `onDismiss`
called **exactly once** on click; button label is `Continue`; no `5000` in rendered
text. Confetti: fires exactly once on open; never while hidden; **does not re-fire
across re-renders**; **does not fire under `prefers-reduced-motion`**; modal still
renders normally in that case; uses the gold palette rather than library defaults.

**`src/App.test.jsx`** — 11 integration cases (jsdom env), added with H3. Drives the
real `App` with `vi.useFakeTimers()` + `act()`, overriding **only** `initialState`
via `vi.mock` so a run can start mid-game:

| covers | |
|---|---|
| ending appears | no modal on first render; crossing 5,000 shows the approved title |
| dismissal | Continue hides it; 30,000ms more ticks never bring it back |
| game still live | biomass keeps rising; universe click earns; buying works (Owned +1, biomass −cost) |
| **no re-fire** | spend below 5,000 then idle back over → stays dismissed |
| scale modal intact | still fires at 100 and dismisses |
| invariants | never two modals mounted at once; no `window.__dispatch`/`__state`; **zero `console.error`/`console.warn` in every case** |

⚠️ **`vi.mock` overrides `initialState` through a getter + `vi.hoisted`**, not a
plain object. `vi.mock` factories are hoisted above normal declarations, so a
normal `const` would be in the temporal dead zone; and the factory runs **once**,
so a static value could not vary per test. The getter reads a hoisted holder that
each test sets before `render()`. `gameState.js` was not modified to make this work.

⚠️ **Every change to `gameReducer` must pass `npm test` before it is called done.**
This is the only automated safety net the project has; the reducer is the single
place game state changes, so a regression there breaks everything downstream.

🐛 **Gotcha — jsdom has neither `canvas` nor `matchMedia`.** `EndingModal` uses
both (confetti + the reduced-motion guard), so **every jsdom file that renders it**
must `vi.mock('canvas-confetti', () => ({ default: vi.fn() }))` and stub
`window.matchMedia`. Without the mock the real library errors on canvas and trips
the console-silence assertions. Both `EndingModal.test.jsx` and `App.test.jsx` do
this; a third file rendering the modal would need it too.

🐛 **Gotcha — driving timers needs `IS_REACT_ACT_ENVIRONMENT`.** Advancing fake
timers inside `act()` logs *"The current testing environment is not configured to
support act(...)"* on **every flush** unless the file sets
`globalThis.IS_REACT_ACT_ENVIRONMENT = true`. With a console spy asserting silence,
that is an instant cascade of failures. `App.test.jsx` sets it at the top.

🐛 **Gotcha — in `afterEach`, tear down BEFORE asserting.** Putting
`expect(errSpy).not.toHaveBeenCalled()` above `cleanup()` means a genuine failure
skips teardown, leaking that test's DOM into the next one. One real bug then
reports as many fake ones (it showed up here as *"expected 9 modals to be ≤ 1"*).
Capture the spy records, tear down unconditionally, then assert.

🐛 **Gotcha — jest-dom matchers are NOT registered.** `@testing-library/jest-dom` is
in `package.json` but nothing imports it, so matchers like `toBeEmptyDOMElement`
throw *"Invalid Chai property"*. Use plain assertions (`expect(container.innerHTML)
.toBe('')`) or add a setup file first. The dependency is currently **unused** and
could be dropped.

🐛 **Gotcha — don't try to unit-test the reducer with plain `node`.** The source uses
extensionless imports (`from './upgrades'`), which Vite resolves but bare node
rejects (`ERR_MODULE_NOT_FOUND`). Vitest uses Vite's resolver, so it just works.
An earlier ad-hoc node harness had to copy the modules to a scratch dir with
`.js` appended to every specifier — unnecessary now.

---

## Project structure (target per PRD 6.3)

```
life-evolution/
├── src/
│   ├── App.jsx
│   ├── App.test.jsx             # 11 integration tests (jsdom via file pragma)
│   ├── main.jsx
│   ├── components/
│   │   ├── Background.jsx       # ambient bubbles + particles; per-scale gradient
│   │   ├── FloatingElements.jsx # floating organisms, one per owned upgrade
│   │   ├── shapes/
│   │   │   ├── AminoShape.jsx   # inline-SVG glycine skeleton (float-amino)
│   │   │   ├── AmoebaShape.jsx  # inline-SVG amoeba (float-cell / id cellDivision)
│   │   │   └── VolvoxShape.jsx  # inline-SVG Volvox colony (float-photo)
│   │   ├── Universe.jsx         # clickable main area + scale-name label
│   │   ├── Stats.jsx            # biomass counter + rate/sec
│   │   ├── UpgradeList.jsx      # upgrade cards + buy buttons
│   │   ├── ScaleUnlockModal.jsx # popup on scale unlock
│   │   ├── EndingModal.jsx      # H2 — completion modal (wired into App, H3)
│   │   └── EndingModal.test.jsx # 11 component tests (jsdom via file pragma)
│   ├── game/
│   │   ├── gameState.js         # initial state + reducer
│   │   ├── gameState.test.js    # 29 reducer tests (node env)
│   │   ├── upgrades.js          # upgrade definitions
│   │   └── scales.js            # scale definitions
│   └── styles/
│       ├── modal.css            # scale-unlock modal (blue-green) — do not mix
│       ├── ending-modal.css     # ending modal (gold) — `ending-` selectors only
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