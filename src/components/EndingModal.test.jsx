/**
 * @vitest-environment jsdom
 *
 * jsdom is opted into PER FILE via the pragma above, not via vitest.config.
 * gameState.test.js stays on the default (node) environment that way — it tests
 * a pure reducer and has no need for a DOM.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { EndingModal } from './EndingModal'

// No globals enabled in this project, so RTL's auto-cleanup does not run.
// Unmount explicitly or the previous test's DOM leaks into the next one.
afterEach(cleanup)

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
