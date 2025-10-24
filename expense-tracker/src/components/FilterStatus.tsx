import React from "react";
import { Expense } from "../types";

interface FilterStatusProps {
  selectedDay: number | null;
  selectedDateRange: { start: Date; end: Date } | null;
  viewingDate: Date;
  totalExpenses: number;
  filteredExpenses: number;
}

/**
 * Component to display current filter status and statistics
 */
const FilterStatus: React.FC<FilterStatusProps> = ({
  selectedDay,
  selectedDateRange,
  viewingDate,
  totalExpenses,
  filteredExpenses,
}) => {
  const getFilterDescription = () => {
    if (selectedDay) {
      return `Day ${selectedDay} of ${viewingDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })}`;
    }
    if (selectedDateRange) {
      return `${selectedDateRange.start.toLocaleDateString()} to ${selectedDateRange.end.toLocaleDateString()}`;
    }
    return `${viewingDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}`;
  };

  const isFiltered = selectedDay !== null || selectedDateRange !== null;

  if (!isFiltered) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900">
              Filtered View: {getFilterDescription()}
            </h4>
            <p className="text-xs text-blue-700">
              Showing {filteredExpenses} of {totalExpenses} transactions
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-900">
            {filteredExpenses}
          </div>
          <div className="text-xs text-blue-700">transactions</div>
        </div>
      </div>
    </div>
  );
};

export default FilterStatus;
