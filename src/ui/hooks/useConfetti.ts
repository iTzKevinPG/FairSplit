import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

/**
 * Fires a celebration confetti burst when `trigger` transitions from false → true.
 */
export function useConfetti(trigger: boolean) {
  const prevRef = useRef(false)

  useEffect(() => {
    if (trigger && !prevRef.current) {
      // Burst from both sides
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      confetti({
        ...defaults,
        particleCount: 50,
        origin: { x: 0.25, y: 0.6 },
        colors: ['#0f766e', '#14b8a6', '#FF6B6B', '#A78BFA', '#10b981'],
      })
      confetti({
        ...defaults,
        particleCount: 50,
        origin: { x: 0.75, y: 0.6 },
        colors: ['#0f766e', '#14b8a6', '#FF6B6B', '#A78BFA', '#10b981'],
      })
    }
    prevRef.current = trigger
  }, [trigger])
}
