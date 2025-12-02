import { describe, it, expect, beforeEach } from 'vitest'
import { findValidPosition } from '../src/composables/useFindValidPosition'

describe('findValidPosition', () => {
  beforeEach(() => {
    // Provide a deterministic window size for tests
    globalThis.window = { innerWidth: 1200, innerHeight: 800 }
  })

  it('returns {0, 0} when window is undefined (SSR safety)', () => {
    globalThis.window = undefined
    const result = findValidPosition(100, 100, [])
    expect(result).toEqual({ x: 0, y: 0 })
  })

  it('returns a position within viewport bounds when there are no existing positions', () => {
    const width = 164
    const height = 150
    const result = findValidPosition(width, height, [])

    expect(result.x).toBeGreaterThanOrEqual(0)
    expect(result.y).toBeGreaterThanOrEqual(0)
  })

  it('returns a non-colliding position when existing positions are provided', () => {
    const width = 164
    const height = 150

    const existingPositions = [
      { x: 100, y: 100, width, height },
      { x: 400, y: 400, width, height },
    ]

    const result = findValidPosition(width, height, existingPositions)

    // Very loose assertion: result should not be exactly on top of any existing position
    const collidesWithExisting = existingPositions.some(pos => {
      const horizontallyOverlaps =
        result.x < pos.x + pos.width && result.x + width > pos.x
      const verticallyOverlaps =
        result.y < pos.y + pos.height && result.y + height > pos.y
      return horizontallyOverlaps && verticallyOverlaps
    })

    expect(collidesWithExisting).toBe(false)
  })
})


