export const findValidPosition = (textWidth: number, textHeight: number, existingPositions: Array<{ x: number, y: number, width: number, height: number }>) => {
  const margin = 100;
  const maxAttempts = 50;
  
  const checkCollision = (x: number, y: number, width: number, height: number) => {
    const padding = 50;
    
    for (const pos of existingPositions) {
      if (!(x + width + padding < pos.x || 
            x > pos.x + pos.width + padding || 
            y + height + padding < pos.y || 
            y > pos.y + pos.height + padding)) {
        return true;
      }
    }
    return false;
  };

  const maxYHeight = 2300

  for (let i = 0; i < maxAttempts; i++) {
    const x = margin + Math.random() * (window.innerWidth - textWidth - 2 * margin);
    const y = margin + Math.random() * (maxYHeight - textHeight - 2 * margin);
    
    if (!checkCollision(x, y, textWidth, textHeight)) {
      return { x, y };
    }
  }
  
  const lastPosition = existingPositions[existingPositions.length - 1];
  const y = lastPosition ? lastPosition.y + lastPosition.height + 50 : margin;
  const x = margin + Math.random() * (window.innerWidth - textWidth - 2 * margin);
  
  return { x, y };
};
  