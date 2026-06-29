import { useMemo } from 'react'
import '../styles/background.css'

// Random float in [min, max).
const rand = (min, max) => Math.random() * (max - min) + min

// Background — ambient bubbles rising + particles drifting in the soup.
// Pure decoration: every element is pointer-events:none so it never blocks a click.
export function Background() {
  // useMemo([]) → build these random configs ONCE on mount and reuse them on
  // every re-render. The TICK action re-renders App 10×/sec; without useMemo we'd
  // re-randomize size/left/delay each tick and the animations would jump constantly.
  const bubbles = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        size: rand(8, 35), // px
        left: rand(0, 100), // %
        duration: rand(8, 20), // s
        delay: rand(0, 10), // s
        opacity: rand(0.1, 0.3),
      })),
    [],
  )

  const particles = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        size: rand(2, 6), // px
        left: rand(0, 100), // %
        top: rand(0, 100), // %
        duration: rand(4, 10), // s
        delay: rand(0, 8), // s
        opacity: rand(0.2, 0.5),
      })),
    [],
  )

  return (
    <div className="background-layer">
      {bubbles.map((b) => (
        <div
          key={`bubble-${b.id}`}
          className="bubble"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}%`,
            opacity: b.opacity,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
      {particles.map((p) => (
        <div
          key={`particle-${p.id}`}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            // base opacity exposed as a CSS var so the drift keyframe can fade
            // relative to each particle's own value (see background.css).
            '--base-opacity': p.opacity,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
