/**
 * Get the number of days in a given month and year
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Check if two dates are in the same month and year
 */
export const isSameMonthAndYear = (date1: Date, date2: Date): boolean => {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * Generate array of years for year selector
 */
export const generateYearRange = (currentYear: number, range: number = 10): number[] => {
  return Array.from(
    { length: range * 2 + 1 },
    (_, i) => currentYear + i - range
  );
};
