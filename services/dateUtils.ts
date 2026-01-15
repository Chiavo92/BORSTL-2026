import { WeekOption } from '../types';

export const generateWeeks2026 = (): WeekOption[] => {
  const weeks: WeekOption[] = [];
  // Starting strictly from the prompt example: Week 1: 29.12.2025 - 04.01.2026
  let currentDate = new Date(2025, 11, 29); // Month is 0-indexed (11 = Dec)

  for (let i = 1; i <= 53; i++) {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    end.setDate(end.getDate() + 6);

    const format = (d: Date) => d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    
    weeks.push({
      id: `week-${i}`,
      label: `Tydzień ${i}: ${format(start)} - ${format(end)}`,
      start: start,
      end: end
    });

    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
    
    // Break if we are way past 2026 (safety break)
    if (start.getFullYear() > 2026) break;
  }
  return weeks;
};

export const isDateRangeOverlapping = (startA: string, endA: string, startB: string, endB: string): boolean => {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  return sA <= eB && sB <= eA;
};

export const isDateInWeek = (dateFrom: string, dateTo: string, week: WeekOption): boolean => {
  const rentalStart = new Date(dateFrom).getTime();
  const rentalEnd = new Date(dateTo).getTime();
  const weekStart = week.start.getTime();
  const weekEnd = week.end.getTime();

  // Check if rental interval overlaps with week interval
  return rentalStart <= weekEnd && weekStart <= rentalEnd;
};
