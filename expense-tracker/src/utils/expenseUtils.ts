import { Expense, CategoryChartData, DailyTrendData, Transaction } from '../types';
import { convertCurrency } from './currencyUtils';

/**
 * Filter expenses by month and year
 */
export const filterExpensesByMonth = (expenses: Expense[], viewingDate: Date): Expense[] => {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.createdAt);
    return (
      expenseDate.getMonth() === viewingDate.getMonth() &&
      expenseDate.getFullYear() === viewingDate.getFullYear()
    );
  });
};

/**
 * Calculate total amount for expenses
 */
export const calculateTotal = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

/**
 * Generate category chart data from expenses
 */
export const generateCategoryChartData = (expenses: Expense[], categories: readonly string[]): CategoryChartData[] => {
  const dataMap = new Map<string, number>();
  categories.forEach((cat) => dataMap.set(cat, 0));

  expenses.forEach((expense) => {
    if (dataMap.has(expense.category)) {
      dataMap.set(
        expense.category,
        dataMap.get(expense.category)! + expense.amount
      );
    }
  });

  return Array.from(dataMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort by value descending (highest first)
};

/**
 * Generate daily trend data for a month
 */
export const generateDailyTrendData = (expenses: Expense[], viewingDate: Date): DailyTrendData[] => {
  const daysInMonth = new Date(
    viewingDate.getFullYear(),
    viewingDate.getMonth() + 1,
    0
  ).getDate();
  const dailyData: DailyTrendData[] = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    amount: 0,
  }));

  expenses.forEach((expense) => {
    const dayOfMonth = new Date(expense.createdAt).getDate();
    dailyData[dayOfMonth - 1].amount += expense.amount;
  });

  return dailyData;
};

/**
 * Sort expenses by creation date (newest first)
 */
export const sortExpensesByDate = (expenses: Expense[]): Expense[] => {
  return [...expenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Convert transactions to expenses with USD amounts
 */
export const convertTransactionsToExpenses = (transactions: Transaction[]): Expense[] => {
  return transactions.map((transaction, index) => {

    const amountInUSD = convertCurrency(
      parseFloat(transaction.amount),
      transaction.currency || 'USD', // Default to USD if currency is undefined/null
      'USD'
    );

    // Safely convert transactionDate to ISO string for createdAt field
    let createdAt: string;
    try {
      const date = new Date(transaction.transactionDate);
      if (isNaN(date.getTime())) {
        console.warn('Invalid transactionDate for transaction:', transaction.transactionId, transaction.transactionDate);
        createdAt = new Date().toISOString();
      } else {
        createdAt = date.toISOString();
      }
    } catch (error) {
      console.error('Date conversion error:', error);
      createdAt = new Date().toISOString();
    }

    const expense = {
      id: transaction.transactionId,
      merchant: transaction.merchant?.merchantName || 'Unknown Merchant',
      amount: amountInUSD,
      category: transaction.category?.categoryName || 'Uncategorized',
      location: transaction.location,
      currency: 'USD', // Always USD after conversion
      createdAt, // This is now based on transactionDate, not the database createdAt
    };


    return expense;
  });
};

/**
 * Calculate total amount for transactions (converted to USD)
 */
export const calculateTotalFromTransactions = (transactions: Transaction[]): number => {
  return transactions.reduce((sum, transaction) => {
    const amountInUSD = convertCurrency(
      parseFloat(transaction.amount),
      transaction.currency || 'USD', // Default to USD if currency is undefined/null
      'USD'
    );
    return sum + amountInUSD;
  }, 0);
};

/**
 * Generate category chart data from transactions (converted to USD)
 */
export const generateCategoryChartDataFromTransactions = (
  transactions: Transaction[],
  categories: readonly string[]
): CategoryChartData[] => {
  const dataMap = new Map<string, number>();
  categories.forEach((cat) => dataMap.set(cat, 0));

  transactions.forEach((transaction) => {
    const categoryName = transaction.category?.categoryName || 'Uncategorized';
    if (dataMap.has(categoryName)) {
      const amountInUSD = convertCurrency(
        parseFloat(transaction.amount),
        transaction.currency || 'USD', // Default to USD if currency is undefined/null
        'USD'
      );
      dataMap.set(categoryName, dataMap.get(categoryName)! + amountInUSD);
    }
  });

  return Array.from(dataMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort by value descending (highest first)
};

/**
 * Generate daily trend data from transactions (converted to USD)
 */
export const generateDailyTrendDataFromTransactions = (
  transactions: Transaction[],
  viewingDate: Date
): DailyTrendData[] => {
  const daysInMonth = new Date(
    viewingDate.getFullYear(),
    viewingDate.getMonth() + 1,
    0
  ).getDate();
  const dailyData: DailyTrendData[] = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    amount: 0,
  }));

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.transactionDate);
    if (
      transactionDate.getMonth() === viewingDate.getMonth() &&
      transactionDate.getFullYear() === viewingDate.getFullYear()
    ) {
      const dayOfMonth = transactionDate.getDate();
      const amountInUSD = convertCurrency(
        parseFloat(transaction.amount),
        transaction.currency || 'USD', // Default to USD if currency is undefined/null
        'USD'
      );
      dailyData[dayOfMonth - 1].amount += amountInUSD;
    }
  });

  return dailyData;
};

/**
 * Calculate daily average based on actual transaction dates
 */
export const getDailyAverage = (expenses: Expense[], viewingDate: Date): number => {
  if (expenses.length === 0) return 0;

  // Get unique days that have transactions
  const uniqueDays = new Set(
    expenses.map(expense => {
      const expenseDate = new Date(expense.createdAt);
      return expenseDate.getDate();
    })
  );

  const daysWithTransactions = uniqueDays.size;
  const totalAmount = calculateTotal(expenses);

  return daysWithTransactions > 0 ? totalAmount / daysWithTransactions : 0;
};
