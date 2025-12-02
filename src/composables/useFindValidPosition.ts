import { LAYOUT } from '~/constants'

/**
 * Finds a valid position for a new element that doesn't collide with existing positions.
 * Attempts to find a random position first, then falls back to a position below the last element.
 * 
 * @param textWidth - The width of the element to position
 * @param textHeight - The height of the element to position
 * @param existingPositions - Array of existing positioned elements with their coordinates and dimensions
 * @returns An object with x and y coordinates for the valid position
 * 
 * @example
 * ```typescript
 * const existing = [{ x: 100, y: 100, width: 50, height: 50 }];
 * const position = findValidPosition(164, 150, existing);
 * // Returns { x: number, y: number } that doesn't collide with existing positions
 * ```
 */
export const findValidPosition = (textWidth: number, textHeight: number, existingPositions: Array<{ x: number, y: number, width: number, height: number }>) => {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 };
  }

  const checkCollision = (x: number, y: number, width: number, height: number) => {
    for (const pos of existingPositions) {
      if (!(x + width + LAYOUT.COLLISION_PADDING < pos.x || 
            x > pos.x + pos.width + LAYOUT.COLLISION_PADDING || 
            y + height + LAYOUT.COLLISION_PADDING < pos.y || 
            y > pos.y + pos.height + LAYOUT.COLLISION_PADDING)) {
        return true;
      }
    }
    return false;
  };

  for (let i = 0; i < LAYOUT.MAX_POSITION_ATTEMPTS; i++) {
    const x = LAYOUT.POSITION_MARGIN + Math.random() * (window.innerWidth - textWidth - 2 * LAYOUT.POSITION_MARGIN);
    const y = LAYOUT.POSITION_MARGIN + Math.random() * (LAYOUT.PAGE_MIN_HEIGHT - textHeight - 2 * LAYOUT.POSITION_MARGIN);
    
    if (!checkCollision(x, y, textWidth, textHeight)) {
      return { x, y };
    }
  }
  
  const lastPosition = existingPositions[existingPositions.length - 1];
  const y = lastPosition ? lastPosition.y + lastPosition.height + LAYOUT.FALLBACK_SPACING : LAYOUT.POSITION_MARGIN;
  const x = LAYOUT.POSITION_MARGIN + Math.random() * (window.innerWidth - textWidth - 2 * LAYOUT.POSITION_MARGIN);
  
  return { x, y };
};
  