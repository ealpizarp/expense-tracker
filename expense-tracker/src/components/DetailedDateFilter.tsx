import React, { useState, useMemo } from "react";
import { Expense } from "../types";
import { formatCurrency } from "../utils/currencyUtils";
import CategoryIcon from "./CategoryIcon";

interface DetailedDateFilterProps {
  viewingDate: Date;
  expenses: Expense[];
  onDaySelect: (day: number | null) => void;
  selectedDay: number | null;
}

/**
 * Detailed date filter component for past months showing every day with transactions
 */
const DetailedDateFilter: React.FC<DetailedDateFilterProps> = ({
  viewingDate,
  expenses,
  onDaySelect,
  selectedDay,
}) => {
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Get all days in the month with their transactions and totals
  const daysWithData = useMemo(() => {
    const daysMap = new Map<
      number,
      { total: number; transactions: Expense[] }
    >();

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.createdAt);
      if (
        expenseDate.getMonth() === viewingDate.getMonth() &&
        expenseDate.getFullYear() === viewingDate.getFullYear()
      ) {
        const day = expenseDate.getDate();
        if (!daysMap.has(day)) {
          daysMap.set(day, { total: 0, transactions: [] });
        }
        const dayData = daysMap.get(day)!;
        dayData.total += expense.amount;
        dayData.transactions.push(expense);
      }
    });

    // Convert to array and sort
    const daysArray = Array.from(daysMap.entries()).map(([day, data]) => ({
      day,
      ...data,
    }));

    return daysArray.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc" ? a.day - b.day : b.day - a.day;
      } else {
        return sortOrder === "asc" ? a.total - b.total : b.total - a.total;
      }
    });
  }, [expenses, viewingDate, sortBy, sortOrder]);

  // Get total for the month
  const monthTotal = daysWithData.reduce((sum, day) => sum + day.total, 0);
  const totalTransactions = daysWithData.reduce(
    (sum, day) => sum + day.transactions.length,
    0
  );

  // Handle day selection
  const handleDayClick = (day: number) => {
    onDaySelect(selectedDay === day ? null : day);
  };

  // Handle sort change
  const handleSortChange = (newSortBy: "date" | "amount") => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  // Get sort icon
  const getSortIcon = (column: "date" | "amount") => {
    if (sortBy !== column) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-semibold text-slate-800">
            {viewingDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}{" "}
            - Daily Breakdown
          </h4>
          <p className="text-sm text-slate-600 mt-1">
            {daysWithData.length} days with transactions • {totalTransactions}{" "}
            total transactions
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-800">
            {formatCurrency(monthTotal, "USD")}
          </div>
          <div className="text-sm text-slate-600">Total for month</div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
        <span className="text-sm font-medium text-slate-700">Sort by:</span>
        <button
          onClick={() => handleSortChange("date")}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
            sortBy === "date"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          Date {getSortIcon("date")}
        </button>
        <button
          onClick={() => handleSortChange("amount")}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
            sortBy === "amount"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          Amount {getSortIcon("amount")}
        </button>
      </div>

      {/* Days List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {daysWithData.map(({ day, total, transactions }) => (
          <div
            key={day}
            className={`border rounded-lg transition-all duration-200 ${
              selectedDay === day
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <button
              onClick={() => handleDayClick(day)}
              className="w-full p-4 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                        selectedDay === day
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {day}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">
                      {new Date(
                        viewingDate.getFullYear(),
                        viewingDate.getMonth(),
                        day
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-sm text-slate-600">
                      {transactions.length} transaction
                      {transactions.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-800">
                    {formatCurrency(total, "USD")}
                  </div>
                  <div className="text-sm text-slate-600">
                    {transactions.length > 0 && (
                      <span>
                        Avg:{" "}
                        {formatCurrency(total / transactions.length, "USD")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded transactions for selected day */}
            {selectedDay === day && (
              <div className="border-t border-slate-200 bg-white">
                <div className="p-4">
                  <h5 className="font-semibold text-slate-800 mb-3">
                    Transactions for Day {day}
                  </h5>
                  <div className="space-y-2">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <CategoryIcon
                            category={transaction.category}
                            className="w-5 h-5 text-slate-600"
                          />
                          <div>
                            <div className="font-medium text-slate-800">
                              {transaction.merchant}
                            </div>
                            <div className="text-sm text-slate-600">
                              {transaction.category}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-800">
                            {formatCurrency(transaction.amount, "USD")}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(transaction.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {daysWithData.length}
            </div>
            <div className="text-sm text-slate-600">Active Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {totalTransactions}
            </div>
            <div className="text-sm text-slate-600">Transactions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {formatCurrency(monthTotal / daysWithData.length, "USD")}
            </div>
            <div className="text-sm text-slate-600">Daily Average</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {formatCurrency(monthTotal / totalTransactions, "USD")}
            </div>
            <div className="text-sm text-slate-600">Avg per Transaction</div>
          </div>
        </div>
      </div>

      {/* Clear Selection */}
      {selectedDay && (
        <div className="mt-4 text-center">
          <button
            onClick={() => onDaySelect(null)}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Day Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailedDateFilter;
