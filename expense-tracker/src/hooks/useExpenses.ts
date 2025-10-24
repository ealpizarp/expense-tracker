import { useState, useEffect } from "react";
import { UseExpensesReturn, Expense, Transaction } from "../types";
import { convertTransactionsToExpenses } from "../utils/expenseUtils";
import { useAuth } from "../contexts/AuthContext";

/**
 * Custom hook for managing expenses data
 */
export const useExpenses = (): UseExpensesReturn => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load expenses from API
  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error('Failed to fetch expenses');
      }
      
      // Check if response has content
      const text = await response.text();
      
      if (!text) {
        setExpenses([]);
        return;
      }
      
      const transactions: Transaction[] = JSON.parse(text);
      
      // Convert transactions to expenses with USD amounts
      const convertedExpenses = convertTransactionsToExpenses(transactions);
      setExpenses(convertedExpenses);
    } catch (err) {
      console.error("Failed to load expenses:", err);
      setError("Could not load your saved data.");
      setExpenses([]);
    }
  };

  // Load expenses from API on mount
  useEffect(() => {
    if (user) {
      fetchExpenses();
    } else {
    }
  }, [user]);

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<void> => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(expense),
      });

      if (!response.ok) {
        throw new Error('Failed to create expense');
      }

      const newTransaction: Transaction = await response.json();
      // Convert the new transaction to expense format
      const newExpense = convertTransactionsToExpenses([newTransaction])[0];
      setExpenses((prev) => [newExpense, ...prev]);
    } catch (err) {
      console.error("Failed to create expense:", err);
      setError("Failed to create expense");
    }
  };

  const deleteExpense = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    } catch (err) {
      console.error("Failed to delete expense:", err);
      setError("Failed to delete expense");
    }
  };

  const updateExpense = async (id: number, updatedExpense: Partial<Expense>): Promise<void> => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedExpense),
      });

      if (!response.ok) {
        throw new Error('Failed to update expense');
      }

      const updated = await response.json();
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === id ? updated : expense
        )
      );
    } catch (err) {
      console.error("Failed to update expense:", err);
      setError("Failed to update expense");
    }
  };

  return {
    expenses,
    error,
    addExpense,
    deleteExpense,
    updateExpense,
    setError,
    refreshExpenses: fetchExpenses,
  };
};
