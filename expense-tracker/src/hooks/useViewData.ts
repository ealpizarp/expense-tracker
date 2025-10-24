import { useMemo } from 'react';
import { getViewData, ViewType } from '../utils/viewUtils';
import { Expense } from '../types';

/**
 * Custom hook for managing different view types (month, quarter, year)
 */
export const useViewData = (
  expenses: Expense[],
  viewingDate: Date,
  viewType: ViewType,
  categories: readonly string[]
) => {
  const viewData = useMemo(() => {
    return getViewData(expenses, viewingDate, viewType, categories);
  }, [expenses, viewingDate, viewType, categories]);

  // Calculate additional metrics
  const metrics = useMemo(() => {
    const { filteredExpenses, totalAmount, categoryChartData } = viewData;
    
    // Calculate transaction count
    const transactionCount = filteredExpenses.length;
    
    // Calculate average per day/month
    let averagePerPeriod: number;
    if (viewType === 'month') {
      const daysInMonth = new Date(viewingDate.getFullYear(), viewingDate.getMonth() + 1, 0).getDate();
      averagePerPeriod = totalAmount / daysInMonth;
    } else if (viewType === 'quarter') {
      averagePerPeriod = totalAmount / 3; // 3 months
    } else {
      averagePerPeriod = totalAmount / 12; // 12 months
    }
    
    // Find top category
    const topCategory = categoryChartData.length > 0 
      ? categoryChartData.reduce((max, current) => 
          current.value > max.value ? current : max
        )
      : null;
    
    // Calculate days with transactions (for month view)
    const daysWithTransactions = viewType === 'month' 
      ? new Set(filteredExpenses.map(expense => new Date(expense.createdAt).getDate())).size
      : 0;
    
    return {
      transactionCount,
      averagePerPeriod,
      topCategory,
      daysWithTransactions,
    };
  }, [viewData, viewType, viewingDate]);

  return {
    ...viewData,
    metrics,
  };
};
