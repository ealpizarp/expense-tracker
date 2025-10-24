import { Expense } from '../types';

/**
 * Load expenses from localStorage
 */
export const loadExpensesFromStorage = (fallbackData: Expense[] = []): Expense[] => {
  try {
    const storedExpenses = localStorage.getItem("expenses");
    if (!storedExpenses) {
      localStorage.setItem("expenses", JSON.stringify(fallbackData));
      return fallbackData;
    }
    return JSON.parse(storedExpenses) as Expense[];
  } catch (error) {
    console.error("Failed to load expenses from localStorage:", error);
    return fallbackData;
  }
};

/**
 * Save expenses to localStorage
 */
export const saveExpensesToStorage = (expenses: Expense[]): void => {
  try {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  } catch (error) {
    console.error("Failed to save expenses to localStorage:", error);
  }
};
