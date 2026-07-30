# Life Evolution — Project Memory

> Claude Code reads this file automatically every session.
> Last updated: Amino Acids element redrawn as a real molecule (inline SVG)

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
- **Result**: Amino Acids card (Cell Division, Photosynthesis) auto-appear when threshold hit, no manual unlock needed. currentScale + unlockedScales stay in sync via the reducer.
- Phase E2 (ScaleUnlockModal) will wire up the visual "congratulations" popup on unlock

**Floating organisms — animated elements for all 3 upgrades (Amino Acids, Cell Division, Photosynthesis)**
- `src/components/FloatingElements.jsx` — generic reusable component: `count` (owned), `variant` (CSS class), `seed` (RNG offset); renders N elements using deterministic seeding so existing ones keep identical configs when count grows → only new ones appear
- `src/styles/floating-elements.css` — 3 variants: `.float-amino` (~~green molecule + 2 satellite atoms~~ → **now an inline-SVG glycine skeleton, see the SVG entry above**), `.float-cell` (blue cell with 2 lobes overlapping mid-mitosis + nucleus), `.float-photo` (yellow-green energy orb + sun mote + leaf mote); all share `@keyframes floatAround` drift path; negative delay → start moving immediately
- `src/App.jsx` — renders 3 FloatingElements (amino seed=0, cell seed=1000, photo seed=2000) so each type's RNG stream is offset → no overlap; counts tied to `state.ownedUpgrades` for each upgrade
- **Config-driven design**: all 3 upgrade types share one component + one keyframe, differing only in `.float-*` class selector → single source of truth for RNG logic + drift behavior
- **Regression-safe**: Amino Acids elements **maintain exact same coordinates as before** (seed unchanged) — only added Cell + Photo layers

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
- At `currentScale: 1` (initial) → only Amino Acids shows (requireScale 1); Cell Division (2) + Photosynthesis (3) hidden until their scale unlocks
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
- Cell Division (cellDivision): click-multiplier, +1/click, cost 50, ×1.3, scale 2
- Photosynthesis (photosynthesis): auto-generator, +5/sec, cost 500, ×1.2, scale 3
- **Design note**: `effect` (string for UI) vs `increment` (number for logic) kept separate — display decoupled from math
- **Design note**: string ids used as keys (will map to ownership counts in gameState)
- Cost formula: `baseCost × costMultiplier ^ owned` (2nd Amino Acids = 10 × 1.15¹ = 11.5)

**Font — Exo 2**
- `index.html` — added Google Fonts `<link>` for Exo 2 (weight 400 + 700)
- `src/index.css` — `font-family: 'Exo 2', sans-serif` on `*` selector → applies globally
- Choice: Exo 2 only (no font mixing) — clean and consistent throughout

**Amino Acids element — real molecular structure via inline SVG (replaces CSS blob)**
- Was: a green circle + 2 satellite dots drawn with `::before`/`::after`. Now: a glycine ball-and-stick skeleton — 7 atoms + 7 bond lines, drawn as inline SVG.
- `src/components/shapes/AminoShape.jsx` (NEW) — `<svg viewBox="0 0 100 100">`, two `<g>` groups: **bonds first, atoms second** so the circles paint over the bond endpoints (standard ball-and-stick look). Atoms follow rough CPK convention: Cα/C grey-green, N blue, O red ×2, R bright green, H white. `aria-hidden` — purely decorative.
- **C=O double bond math** (worth keeping, it's easy to get wrong): bond runs (75,50)→(90,30), so unit vector = (0.6,−0.8), perpendicular = (0.8,0.6); scaled by 1.5 → offset (1.2, 0.9), giving two parallel lines 3px apart at `76.2,50.9→91.2,30.9` and `73.8,49.1→88.8,29.1`.
- `FloatingElements.jsx` — added a `shapes` map (`{'float-amino': AminoShape}`); a variant **absent** from the map renders a bare `<div>` exactly as before, so cell/photo take the unchanged code path. Also a `sizeRanges` map: amino **45–70px** (SVG detail needs room to be legible), everything else stays at `DEFAULT_SIZE = [20, 35]`.
- ⚠️ **Size range changed but seeding did NOT** — the seed expression `pick(s * 93.98 + 5, …)` is byte-identical; only the output min/max is remapped, so each molecule keeps its *relative* size and its position/duration/delay are unchanged. Verified by recomputing with the pre-change formulas: left `66.7878%`, top `87.9415%`, duration `18.0012s`, delay `−29.2514s` all match the live DOM exactly.
- ⚠️ **`drop-shadow`, NOT `box-shadow`, for the glow on any SVG variant** — `box-shadow` traces the div's square box, which on a transparent container renders a glowing *rectangle* around the molecule. `filter: drop-shadow(...)` follows the SVG's actual alpha channel so the glow hugs the bonds/atoms.
- `.float-amino` also needs `border-radius: 0` to opt out of the base `.float-molecule { border-radius: 50% }`, and `background: none`. The base `.float-molecule::before/::after` rules still create pseudo-elements but they have no width/height/background → invisible, harmless.
- `.float-amino svg { display: block }` — avoids the inline baseline gap pushing the SVG a few px past the box.
- `minSize`/`maxSize` added to the `useMemo` dep array — constant per instance so behaviour is identical, but omitting them would be a latent stale-closure bug.
- **Why SVG over pseudo-elements**: `::before`/`::after` gives exactly 2 shapes and this needs 14; bonds are lines between two points (CSS would need hand-computed rotation + length per bond); `viewBox` gives free proportional scaling at any container size; paint order is explicit rather than z-index games.
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
- Scale 3 (Multicellular Life, threshold 1000): modal triggers on unlock, Photosynthesis unlocked + visible
- All modals dismiss cleanly, no re-triggers, scale progression smooth

**Phase F — Floating organisms + game loop** ✅ VERIFIED
- Amino Acids purchase: 1 green molecule spawns (position stable, drifts smoothly)
- Cell Division purchase: 1 blue cell molecule spawns (2-lobe split cell, nucleus)
- Photosynthesis purchase: 1 yellow-green energy orb spawns (sun + leaf motes)
- All 3 elements coexist without overlap (seeded RNG prevents collision)
- Deterministic positioning: same `id` → same coordinates across rebuilds (no teleport)
- Drift animation begins immediately (negative delay applied)
- Visual feedback on purchase: element spawns + floats away in 4-point wandering loop

### 🔜 Next (Phase 2+, if desired)

**Phase G** — Balancing/tuning: upgrade costs, biomass per-click scaling, progression pacing
**Phase H** — End-game content (prestige / reset) or expansion to Scale 4+

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
- [x] E5 — Verify Scale 3: 1,000 biomass → modal ✅, Photosynthesis available ✅, background fades to green/turquoise ✅, label "Multicellular Life" ✅

### Phase F: Polish & End-to-End Test
- [x] F1 — Play full loop 0 → Scale 3 ✅ VERIFIED (no bugs found; smooth progression through all scales + all upgrades functional)
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
│   │   ├── Background.jsx       # ambient bubbles + particles; per-scale gradient
│   │   ├── FloatingElements.jsx # floating organisms, one per owned upgrade
│   │   ├── shapes/
│   │   │   └── AminoShape.jsx   # inline-SVG glycine skeleton (float-amino)
│   │   ├── Universe.jsx         # clickable main area + scale-name label
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