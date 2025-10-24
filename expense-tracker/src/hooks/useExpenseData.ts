import { useMemo } from "react";
import {
  filterExpensesByMonth,
  calculateTotal,
  generateCategoryChartData,
  generateDailyTrendData,
} from "../utils/expenseUtils";
import { UseExpenseDataReturn, Expense } from "../types";

/**
 * Custom hook for processing expense data for charts and summaries
 */
export const useExpenseData = (
  expenses: Expense[],
  viewingDate: Date,
  categories: readonly string[]
): UseExpenseDataReturn => {
  const filteredExpenses = useMemo(() => {
    return filterExpensesByMonth(expenses, viewingDate);
  }, [expenses, viewingDate]);

  const totalForMonth = useMemo(() => {
    return calculateTotal(filteredExpenses);
  }, [filteredExpenses]);

  const categoryChartData = useMemo(() => {
    return generateCategoryChartData(filteredExpenses, categories);
  }, [filteredExpenses, categories]);

  const dailyTrendData = useMemo(() => {
    return generateDailyTrendData(filteredExpenses, viewingDate);
  }, [filteredExpenses, viewingDate]);

  return {
    filteredExpenses,
    totalForMonth,
    categoryChartData,
    dailyTrendData,
  };
};
