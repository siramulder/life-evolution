/**
 * @vitest-environment jsdom
 *
 * Integration tests for App — the H3 wiring (reducer flag -> EndingModal).
 * jsdom is opted into PER FILE via the pragma above, exactly like
 * EndingModal.test.jsx; gameState.test.js stays on the node environment.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import { act } from 'react'

// jsdom has no canvas, so the real canvas-confetti errors when EndingModal
// renders — which would trip the console assertions below. These tests are
// about App's wiring, not the library.
vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

// Holder for the per-test starting state. `vi.hoisted` is required: vi.mock
// factories are hoisted above normal declarations, so a plain const would be
// in the temporal dead zone when the factory runs.
const h = vi.hoisted(() => ({ initial: null }))

// Override ONLY `initialState`; the real reducer is kept. Exposed as a getter so
// each test can swap the starting state before render without re-importing the
// module (the factory itself runs only once).
vi.mock('./game/gameState', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    get initialState() {
      return h.initial ?? actual.initialState
    },
  }
})

import App from './App'

// Required when driving React updates through `act` manually (fake timers here).
// Without it React logs "The current testing environment is not configured to
// support act(...)" on every flush.
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const ENDING_TITLE = 'ถึงเป้าหมายแล้ว!!'

// Full state shapes, written out here rather than imported, so a change to the
// real initialState can't silently alter what these tests exercise.
const atScale3 = (over = {}) => ({
  biomass: 4900,
  perClick: 1,
  perSec: 20, // -> +2 biomass per 100ms tick
  currentScale: 3,
  unlockedScales: [1, 2, 3],
  ownedUpgrades: { aminoAcids: 0, cellDivision: 0, photosynthesis: 0 },
  pendingModalScale: null,
  hasEnded: false,
  pendingEnding: false,
  ...over,
})

const atScale1 = (over = {}) => ({
  ...atScale3(),
  biomass: 95,
  currentScale: 1,
  unlockedScales: [1],
  ...over,
})

// --- helpers -----------------------------------------------------------------

const advance = async (ms) => {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

const endingShown = () => screen.queryByText(ENDING_TITLE) !== null
const scaleModalShown = () => screen.queryByText('Scale Unlocked!') !== null

// B10: both modals share z-index 100; only one may ever be mounted at a time.
const openModals = () =>
  document.querySelectorAll('.modal-overlay, .ending-overlay').length
const expectAtMostOneModal = () => expect(openModals()).toBeLessThanOrEqual(1)

const biomass = () => parseFloat(document.querySelector('.stats-biomass').textContent)

const card = (name) => screen.getByText(name).closest('.upgrade-card')
const ownedCount = (name) => Number(/Owned:\s*(\d+)/.exec(card(name).textContent)[1])
const buy = (name) => fireEvent.click(within(card(name)).getByRole('button', { name: 'Buy' }))

let errSpy
let warnSpy

beforeEach(() => {
  vi.useFakeTimers()
  // EndingModal's reduced-motion guard calls matchMedia, which jsdom lacks.
  window.matchMedia = vi.fn().mockReturnValue({ matches: false })
  // B12 — any React warning (duplicate keys, act() violations, bad props) must
  // fail the test rather than scroll past in the output.
  errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  // Capture the call records first, then tear down UNCONDITIONALLY, then assert.
  // Asserting before cleanup() would skip teardown whenever the assertion fails,
  // leaking the previous test's DOM into the next one and turning one real
  // failure into a cascade of fake ones.
  const errCalls = errSpy.mock.calls
  const warnCalls = warnSpy.mock.calls

  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  h.initial = null

  // B12 — surface the actual message, not just a count.
  expect(errCalls).toEqual([])
  expect(warnCalls).toEqual([])
})

// --- tests -------------------------------------------------------------------

describe('App — ending modal wiring (H3)', () => {
  it('B1: does not show the ending on first render', () => {
    h.initial = atScale3()
    render(<App />)
    expect(endingShown()).toBe(false)
    expectAtMostOneModal()
  })

  it('B2: shows the ending once biomass crosses the threshold', async () => {
    h.initial = atScale3()
    render(<App />)
    expect(endingShown()).toBe(false)

    await advance(6000) // 60 ticks * 2 = +120 -> 5020
    expect(biomass()).toBeGreaterThanOrEqual(5000)
    expect(endingShown()).toBe(true)
    expectAtMostOneModal()
  })

  it('B3: dismissing via Continue hides it', async () => {
    h.initial = atScale3()
    render(<App />)
    await advance(6000)
    expect(endingShown()).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(endingShown()).toBe(false)
    expect(openModals()).toBe(0)
  })

  it('B4: stays dismissed across 30,000ms of further ticks', async () => {
    h.initial = atScale3()
    render(<App />)
    await advance(6000)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await advance(30000)
    expect(endingShown()).toBe(false)
    expectAtMostOneModal()
  })

  it('B5: biomass keeps rising after dismissal', async () => {
    h.initial = atScale3()
    render(<App />)
    await advance(6000)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    const before = biomass()
    await advance(5000)
    expect(biomass()).toBeGreaterThan(before)
  })

  it('B6: clicking the universe still earns biomass after dismissal', async () => {
    h.initial = atScale3()
    render(<App />)
    await advance(6000)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    const before = biomass()
    // A single click is enough to prove clicking earns after dismissal; rapid
    // clicking and bubble-key uniqueness are covered by B12b below.
    fireEvent.click(document.querySelector('.universe'))
    expect(biomass()).toBeGreaterThan(before)
  })

  it('B7: buying an upgrade after dismissal still works', async () => {
    h.initial = atScale3()
    render(<App />)
    await advance(6000)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    const beforeBiomass = biomass()
    expect(ownedCount('Amino Acids')).toBe(0)

    buy('Amino Acids')

    expect(ownedCount('Amino Acids')).toBe(1)
    expect(biomass()).toBeLessThan(beforeBiomass)
    expectAtMostOneModal()
  })

  it('B8: spending below the threshold then climbing back does NOT re-fire it', async () => {
    h.initial = atScale3()
    render(<App />)
    await advance(6000)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(endingShown()).toBe(false)

    // Volvox costs 500 then 600 -> drops ~5020 to ~3920, under the line.
    buy('Volvox')
    buy('Volvox')
    expect(biomass()).toBeLessThan(5000)
    expect(endingShown()).toBe(false)

    // perSec is now 20 + 10 = 30 -> +3/tick. 40,000ms = 400 ticks = +1200.
    await advance(40000)
    expect(biomass()).toBeGreaterThan(5000)
    expect(endingShown()).toBe(false) // the one-flag bug would show it again
    expectAtMostOneModal()
  })

  it('B9: the scale-unlock modal still works and is dismissable', async () => {
    h.initial = atScale1()
    render(<App />)
    expect(scaleModalShown()).toBe(false)

    await advance(1000) // 10 ticks * 2 = +20 -> 115, past the 100 threshold
    expect(scaleModalShown()).toBe(true)
    expect(endingShown()).toBe(false)
    expectAtMostOneModal()

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(scaleModalShown()).toBe(false)
    expect(openModals()).toBe(0)
  })

  it('B10: never mounts two modals at once, sampled across a full run', async () => {
    h.initial = atScale1()
    render(<App />)

    // Walk from scale 1 (95 biomass, +20/sec) all the way past the 5,000 ending,
    // checking at every step. That needs ~245s of game time, so the bound is
    // generous; the loop exits as soon as the ending has been seen and dismissed.
    let sawScaleModal = false
    let sawEnding = false

    for (let i = 0; i < 300 && !sawEnding; i++) {
      await advance(1000)
      expectAtMostOneModal()

      if (scaleModalShown()) sawScaleModal = true
      if (endingShown()) sawEnding = true

      // Dismiss whatever is open so progression continues.
      const btn = screen.queryByRole('button', { name: 'Continue' })
      if (btn) {
        fireEvent.click(btn)
        expectAtMostOneModal()
      }
    }

    // Sanity: the walk really did pass through both modal types, so the
    // "never two at once" assertions above were actually exercised.
    expect(sawScaleModal).toBe(true)
    expect(sawEnding).toBe(true)
    expect(biomass()).toBeGreaterThan(5000)
  })

  it('B11: does not leak window.__dispatch / window.__state', () => {
    h.initial = atScale3()
    render(<App />)
    expect(window.__dispatch).toBeUndefined()
    expect(window.__state).toBeUndefined()
  })
})

describe('App — +N click bubbles', () => {
  // Regression for the duplicate-key bug: ids were Date.now() + Math.random().
  // Date.now() is ~1.8e12, so float64 keeps only ~3 fractional digits of the
  // random part, and under fake timers Date.now() is frozen too — rapid clicks
  // collide. React then logs "Encountered two children with the same key"
  // (caught by the console assertion in afterEach) and can orphan DOM nodes.
  it('B12b: 200 rapid clicks give 200 distinct bubbles, all cleaned up', async () => {
    h.initial = atScale3({ biomass: 0 })
    render(<App />)
    const universe = document.querySelector('.universe')

    for (let i = 0; i < 200; i++) fireEvent.click(universe)

    // One bubble per click — none merged, none dropped.
    expect(document.querySelectorAll('.floating-number').length).toBe(200)

    // Each removal targets its own bubble: after the 600ms lifetime, all gone.
    // (With colliding ids, one timeout's filter removed BOTH bubbles and React
    // could leave orphaned nodes behind — observed as stuck bubbles in-browser.)
    await advance(700)
    expect(document.querySelectorAll('.floating-number').length).toBe(0)
  })
})
