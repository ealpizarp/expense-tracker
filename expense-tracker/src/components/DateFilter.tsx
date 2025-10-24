import React from "react";
import { Expense } from "../types";
import { formatCurrency } from "../utils/currencyUtils";

interface DateFilterProps {
  selectedDay: number | null;
  onDaySelect: (day: number | null) => void;
  viewingDate: Date;
  expenses: Expense[];
}

/**
 * Date filter component for filtering transactions by specific day
 */
const DateFilter: React.FC<DateFilterProps> = ({
  selectedDay,
  onDaySelect,
  viewingDate,
  expenses,
}) => {
  // Get all days that have transactions in the current month
  const daysWithTransactions = React.useMemo(() => {
    const days = new Set<number>();
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.createdAt);
      if (
        expenseDate.getMonth() === viewingDate.getMonth() &&
        expenseDate.getFullYear() === viewingDate.getFullYear()
      ) {
        days.add(expenseDate.getDate());
      }
    });
    return Array.from(days).sort((a, b) => a - b);
  }, [expenses, viewingDate]);

  if (daysWithTransactions.length === 0 && !selectedDay) {
    return null; // Don't render if no transactions and no day selected
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-slate-800">Filter by Day</h4>
        {selectedDay && (
          <button
            onClick={() => onDaySelect(null)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onDaySelect(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            selectedDay === null
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Days
        </button>

        {daysWithTransactions.map((day) => {
          const dayExpenses = expenses.filter((expense) => {
            const expenseDate = new Date(expense.createdAt);
            return expenseDate.getDate() === day;
          });
          const dayTotal = dayExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          );

          return (
            <button
              key={day}
              onClick={() => onDaySelect(day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedDay === day
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">Day {day}</div>
                <div className="text-xs opacity-75">${dayTotal.toFixed(2)}</div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Showing transactions from <strong>Day {selectedDay}</strong> of{" "}
            {viewingDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default DateFilter;
