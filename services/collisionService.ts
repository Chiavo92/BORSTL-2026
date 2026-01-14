import { Rental, COLLISION_RADIUS_PX } from '../types';
import { isDateRangeOverlapping } from './dateUtils';

export const checkCollision = (
  newX: number,
  newY: number,
  dateFrom: string,
  dateTo: string,
  existingRentals: Rental[],
  mapWidth: number,
  mapHeight: number
): { collision: boolean; conflict?: Rental } => {
  
  for (const rental of existingRentals) {
    // 1. Spatial Check (Pythagorean theorem)
    // Convert percentages back to pixels for distance check
    const p1x = (newX / 100) * mapWidth;
    const p1y = (newY / 100) * mapHeight;
    const p2x = (rental.x / 100) * mapWidth;
    const p2y = (rental.y / 100) * mapHeight;

    const distance = Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));

    if (distance < COLLISION_RADIUS_PX) {
      // 2. Temporal Check (Date Overlap)
      if (isDateRangeOverlapping(dateFrom, dateTo, rental.dateFrom, rental.dateTo)) {
        return { collision: true, conflict: rental };
      }
    }
  }

  return { collision: false };
};
