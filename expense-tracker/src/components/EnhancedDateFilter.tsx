import React, { useState, useMemo } from "react";
import { Expense } from "../types";
import { formatCurrency } from "../utils/currencyUtils";

interface DateRange {
  start: Date;
  end: Date;
}

interface EnhancedDateFilterProps {
  selectedDay: number | null;
  onDaySelect: (day: number | null) => void;
  viewingDate: Date;
  onViewingDateChange: (date: Date) => void;
  expenses: Expense[];
  onDateRangeChange: (range: DateRange | null) => void;
  selectedDateRange: DateRange | null;
}

type QuickFilter =
  | "all"
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

/**
 * Enhanced date filter component with multiple filtering options
 */
const EnhancedDateFilter: React.FC<EnhancedDateFilterProps> = ({
  selectedDay,
  onDaySelect,
  viewingDate,
  onViewingDateChange,
  expenses,
  onDateRangeChange,
  selectedDateRange,
}) => {
  const [activeFilter, setActiveFilter] = useState<QuickFilter>("thisMonth");
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Get all days that have transactions in the current month
  const daysWithTransactions = useMemo(() => {
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

  // Calculate date ranges for quick filters
  const getDateRange = (filter: QuickFilter): DateRange | null => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case "today":
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        };

      case "yesterday":
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday,
          end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
        };

      case "thisWeek":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { start: startOfWeek, end: endOfWeek };

      case "lastWeek":
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        lastWeekEnd.setHours(23, 59, 59, 999);
        return { start: lastWeekStart, end: lastWeekEnd };

      case "thisMonth":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        return { start: startOfMonth, end: endOfMonth };

      case "lastMonth":
        const lastMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const lastMonthEnd = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999
        );
        return { start: lastMonthStart, end: lastMonthEnd };

      case "thisYear":
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return { start: startOfYear, end: endOfYear };

      case "custom":
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate),
            end: new Date(customEndDate),
          };
        }
        return null;

      default:
        return null;
    }
  };

  // Handle quick filter selection
  const handleQuickFilter = (filter: QuickFilter) => {
    setActiveFilter(filter);
    onDaySelect(null); // Clear day selection when using date ranges

    if (filter === "custom") {
      setShowCustomRange(true);
      return;
    }

    setShowCustomRange(false);
    const range = getDateRange(filter);
    onDateRangeChange(range);
  };

  // Handle custom date range submission
  const handleCustomRangeSubmit = () => {
    const range = getDateRange("custom");
    if (range) {
      onDateRangeChange(range);
      setShowCustomRange(false);
    }
  };

  // Handle day selection (for month view)
  const handleDayClick = (day: number) => {
    onDaySelect(day);
    setActiveFilter("all");
    onDateRangeChange(null);
  };

  // Get expenses for a specific day
  const getDayExpenses = (day: number) => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.createdAt);
      return expenseDate.getDate() === day;
    });
  };

  // Calculate total for a day
  const getDayTotal = (day: number) => {
    const dayExpenses = getDayExpenses(day);
    return dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Quick filter buttons
  const quickFilters = [
    { key: "all", label: "All Time", icon: "📅" },
    { key: "today", label: "Today", icon: "📆" },
    { key: "yesterday", label: "Yesterday", icon: "⏮️" },
    { key: "thisWeek", label: "This Week", icon: "📊" },
    { key: "lastWeek", label: "Last Week", icon: "📈" },
    { key: "thisMonth", label: "This Month", icon: "🗓️" },
    { key: "lastMonth", label: "Last Month", icon: "📋" },
    { key: "thisYear", label: "This Year", icon: "🗂️" },
    { key: "custom", label: "Custom Range", icon: "⚙️" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-semibold text-slate-800">Date Filters</h4>
        <div className="text-sm text-slate-500">
          {expenses.length} transactions found
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mb-6">
        <h5 className="text-sm font-medium text-slate-700 mb-3">
          Quick Filters
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleQuickFilter(filter.key as QuickFilter)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                activeFilter === filter.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{filter.icon}</span>
              <span className="hidden sm:inline">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {showCustomRange && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-slate-700 mb-3">
            Custom Date Range
          </h5>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs text-slate-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCustomRangeSubmit}
                disabled={!customStartDate || !customEndDate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Month View - Day Selection */}
      {activeFilter === "all" && daysWithTransactions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-slate-700">
              {viewingDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h5>
            {selectedDay && (
              <button
                onClick={() => onDaySelect(null)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Day Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-slate-500 py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const hasTransactions = daysWithTransactions.includes(day);
              const isSelected = selectedDay === day;
              const dayTotal = hasTransactions ? getDayTotal(day) : 0;

              return (
                <button
                  key={day}
                  onClick={() => hasTransactions && handleDayClick(day)}
                  disabled={!hasTransactions}
                  className={`p-2 rounded-lg text-sm transition-colors duration-200 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md"
                      : hasTransactions
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <div className="font-semibold">{day}</div>
                  {hasTransactions && (
                    <div className="text-xs opacity-75">
                      ${dayTotal.toFixed(0)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Filter Summary */}
      {(selectedDay || selectedDateRange) && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            {selectedDay ? (
              <>
                Showing transactions from <strong>Day {selectedDay}</strong> of{" "}
                {viewingDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </>
            ) : selectedDateRange ? (
              <>
                Showing transactions from{" "}
                <strong>
                  {selectedDateRange.start.toLocaleDateString()} to{" "}
                  {selectedDateRange.end.toLocaleDateString()}
                </strong>
              </>
            ) : null}
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedDateFilter;
