/**
 * @vitest-environment jsdom
 *
 * jsdom is opted into PER FILE via the pragma above, not via vitest.config.
 * gameState.test.js stays on the default (node) environment that way — it tests
 * a pure reducer and has no need for a DOM.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

// jsdom implements no canvas, so the real canvas-confetti errors on render.
// Mock it: these tests are about the modal's markup and behaviour, not the
// library's rendering.
vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

import confetti from 'canvas-confetti'
import { EndingModal } from './EndingModal'

// No globals enabled in this project, so RTL's auto-cleanup does not run.
// Unmount explicitly or the previous test's DOM leaks into the next one.
afterEach(cleanup)

// matchMedia does not exist in jsdom; the component calls it for the
// reduced-motion guard. Default to "motion is fine" and let individual tests
// override.
const setReducedMotion = (reduce) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce })
}

beforeEach(() => {
  vi.clearAllMocks()
  setReducedMotion(false)
})

// The single approved string, kept in one place so a typo in a test cannot
// quietly disagree with the component.
const APPROVED_TITLE = 'ถึงเป้าหมายแล้ว!!'

describe('EndingModal', () => {
  it('renders nothing when show is false', () => {
    const { container } = render(<EndingModal show={false} onDismiss={() => {}} />)
    // Plain assertion rather than jest-dom's toBeEmptyDOMElement, so this file
    // needs no matcher-registration setup file.
    expect(container.innerHTML).toBe('')
    expect(screen.queryByText(APPROVED_TITLE)).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('shows the approved title when show is true', () => {
    render(<EndingModal show onDismiss={() => {}} />)
    expect(screen.getByText(APPROVED_TITLE)).toBeTruthy()
  })

  it('calls onDismiss exactly once when the button is clicked', () => {
    const onDismiss = vi.fn()
    render(<EndingModal show onDismiss={onDismiss} />)
    screen.getByRole('button').click()
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('labels the button "Continue"', () => {
    render(<EndingModal show onDismiss={() => {}} />)
    expect(screen.getByRole('button').textContent.trim()).toBe('Continue')
  })

  it('renders no "5000" / "5,000" anywhere in its text', () => {
    const { container } = render(<EndingModal show onDismiss={() => {}} />)
    const text = container.textContent
    expect(text).not.toMatch(/5000/)
    expect(text).not.toMatch(/5,000/)
  })
})

describe('EndingModal — confetti', () => {
  it('fires exactly one burst when it opens', () => {
    render(<EndingModal show onDismiss={() => {}} />)
    expect(confetti).toHaveBeenCalledTimes(1)
  })

  it('does not fire while hidden', () => {
    render(<EndingModal show={false} onDismiss={() => {}} />)
    expect(confetti).not.toHaveBeenCalled()
  })

  it('does not re-fire on re-render while already open', () => {
    const { rerender } = render(<EndingModal show onDismiss={() => {}} />)
    expect(confetti).toHaveBeenCalledTimes(1)

    // The 10x/sec TICK re-renders App (and this modal) constantly while open.
    for (let i = 0; i < 5; i++) rerender(<EndingModal show onDismiss={() => {}} />)

    expect(confetti).toHaveBeenCalledTimes(1)
  })

  it('does NOT fire when the user prefers reduced motion', () => {
    setReducedMotion(true)
    render(<EndingModal show onDismiss={() => {}} />)
    expect(confetti).not.toHaveBeenCalled()
  })

  it('still renders the modal normally under reduced motion', () => {
    setReducedMotion(true)
    render(<EndingModal show onDismiss={() => {}} />)
    expect(screen.getByText(APPROVED_TITLE)).toBeTruthy()
    expect(screen.getByRole('button').textContent.trim()).toBe('Continue')
  })

  it('uses the gold palette, not library defaults', () => {
    render(<EndingModal show onDismiss={() => {}} />)
    const opts = confetti.mock.calls[0][0]
    expect(opts.colors).toEqual(['#fbbf24', '#fcd34d', '#f59e0b', '#fde68a'])
    expect(opts.disableForReducedMotion).toBe(true)
  })
})
