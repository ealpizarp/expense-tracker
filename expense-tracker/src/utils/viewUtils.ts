import { Expense } from '../types';

export type ViewType = 'month' | 'quarter' | 'year';

export interface ViewData {
  filteredExpenses: Expense[];
  totalAmount: number;
  categoryChartData: Array<{ name: string; value: number }>;
  dailyTrendData: Array<{ day: number; amount: number }>;
  monthlyTrendData: Array<{ month: number; amount: number }>;
  viewType: ViewType;
  dateRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Get date range for different view types
 */
export const getDateRange = (viewingDate: Date, viewType: ViewType) => {
  const now = new Date();
  
  switch (viewType) {
    case 'month':
      return {
        start: new Date(viewingDate.getFullYear(), viewingDate.getMonth(), 1),
        end: new Date(viewingDate.getFullYear(), viewingDate.getMonth() + 1, 0, 23, 59, 59, 999),
      };
    
    case 'quarter':
      // Get the actual quarter (Q1, Q2, Q3, Q4) based on the viewing date
      const quarter = Math.floor(viewingDate.getMonth() / 3);
      const quarterStart = new Date(viewingDate.getFullYear(), quarter * 3, 1);
      const quarterEnd = new Date(viewingDate.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
      return { start: quarterStart, end: quarterEnd };
    
    case 'year':
      return {
        start: new Date(viewingDate.getFullYear(), 0, 1),
        end: new Date(viewingDate.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
    
    default:
      return {
        start: new Date(viewingDate.getFullYear(), viewingDate.getMonth(), 1),
        end: new Date(viewingDate.getFullYear(), viewingDate.getMonth() + 1, 0, 23, 59, 59, 999),
      };
  }
};

/**
 * Filter expenses by date range
 */
export const filterExpensesByDateRange = (expenses: Expense[], startDate: Date, endDate: Date): Expense[] => {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.createdAt);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
};

/**
 * Generate category chart data for different view types
 */
export const generateCategoryChartData = (
  expenses: Expense[], 
  categories: readonly string[]
): Array<{ name: string; value: number }> => {
  const dataMap = new Map<string, number>();
  categories.forEach(cat => dataMap.set(cat, 0));

  expenses.forEach(expense => {
    if (dataMap.has(expense.category)) {
      dataMap.set(expense.category, dataMap.get(expense.category)! + expense.amount);
    }
  });

  return Array.from(dataMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Generate daily trend data for month view
 */
export const generateDailyTrendData = (expenses: Expense[], viewingDate: Date): Array<{ day: number; amount: number }> => {
  const daysInMonth = new Date(viewingDate.getFullYear(), viewingDate.getMonth() + 1, 0).getDate();
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    amount: 0,
  }));

  expenses.forEach(expense => {
    const expenseDate = new Date(expense.createdAt);
    const dayOfMonth = expenseDate.getDate();
    if (dayOfMonth >= 1 && dayOfMonth <= daysInMonth) {
      dailyData[dayOfMonth - 1].amount += expense.amount;
    }
  });

  return dailyData;
};

/**
 * Generate monthly trend data for quarter and year views
 */
export const generateMonthlyTrendData = (
  expenses: Expense[], 
  viewingDate: Date, 
  viewType: ViewType
): Array<{ month: number; amount: number }> => {
  let monthsToShow: number[];
  
  if (viewType === 'quarter') {
    // Get the 3 months in the current quarter
    const quarter = Math.floor(viewingDate.getMonth() / 3);
    monthsToShow = [
      quarter * 3,
      quarter * 3 + 1,
      quarter * 3 + 2,
    ];
  } else {
    // All 12 months of the year
    monthsToShow = Array.from({ length: 12 }, (_, i) => i);
  }

  const monthlyData = monthsToShow.map(month => ({
    month: month + 1, // 1-based month
    amount: 0,
  }));

  expenses.forEach(expense => {
    const expenseDate = new Date(expense.createdAt);
    const expenseMonth = expenseDate.getMonth();
    const expenseYear = expenseDate.getFullYear();
    
    // Check if expense is in the current viewing year
    if (expenseYear === viewingDate.getFullYear()) {
      const monthIndex = monthsToShow.indexOf(expenseMonth);
      if (monthIndex !== -1) {
        monthlyData[monthIndex].amount += expense.amount;
      }
    }
  });

  return monthlyData;
};

/**
 * Calculate total amount for expenses
 */
export const calculateTotal = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

/**
 * Get view-specific data
 */
export const getViewData = (
  expenses: Expense[],
  viewingDate: Date,
  viewType: ViewType,
  categories: readonly string[]
): ViewData => {
  const dateRange = getDateRange(viewingDate, viewType);
  const filteredExpenses = filterExpensesByDateRange(expenses, dateRange.start, dateRange.end);
  const totalAmount = calculateTotal(filteredExpenses);
  const categoryChartData = generateCategoryChartData(filteredExpenses, categories);
  
  let dailyTrendData: Array<{ day: number; amount: number }> = [];
  let monthlyTrendData: Array<{ month: number; amount: number }> = [];

  if (viewType === 'month') {
    dailyTrendData = generateDailyTrendData(filteredExpenses, viewingDate);
  } else {
    monthlyTrendData = generateMonthlyTrendData(filteredExpenses, viewingDate, viewType);
  }

  return {
    filteredExpenses,
    totalAmount,
    categoryChartData,
    dailyTrendData,
    monthlyTrendData,
    viewType,
    dateRange,
  };
};

/**
 * Get month name from month number
 */
export const getMonthName = (monthNumber: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || 'Unknown';
};

/**
 * Get quarter name from month number
 */
export const getQuarterName = (monthNumber: number): string => {
  const quarter = Math.ceil(monthNumber / 3);
  return `Q${quarter}`;
};
