export interface Rental {
  id: string;
  x: number; // Percentage X coordinate (0-100)
  y: number; // Percentage Y coordinate (0-100)
  tenantName: string;
  dateFrom: string; // ISO Date YYYY-MM-DD
  dateTo: string;   // ISO Date YYYY-MM-DD
  description: string;
}

export interface WeekOption {
  id: string;
  label: string;
  start: Date;
  end: Date;
}

export interface CollisionResult {
  hasCollision: boolean;
  conflictingRental?: Rental;
}

export const COLLISION_RADIUS_PX = 10; // Pixel tolerance for click (20px radius = 40px diameter)
