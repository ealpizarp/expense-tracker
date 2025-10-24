import React from "react";
import { MONTHS } from "../constants";
import { generateYearRange } from "../utils/dateUtils";
import { MonthYearSelectorProps } from "../types";

/**
 * Month and year selector component
 */
const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({
  viewingDate,
  onDateChange,
}) => {
  const years = generateYearRange(new Date().getFullYear());

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newDate = new Date(
      viewingDate.getFullYear(),
      parseInt(e.target.value, 10),
      1
    );
    onDateChange(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newDate = new Date(
      parseInt(e.target.value, 10),
      viewingDate.getMonth(),
      1
    );
    onDateChange(newDate);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Compact Header */}
      <div className="text-center">
        <h3 className="text-sm font-semibold text-slate-800">Select Period</h3>
      </div>

      {/* Compact Date Selector */}
      <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
        {/* Month Selector */}
        <div className="flex flex-col items-center space-y-1">
          <label className="text-xs font-medium text-slate-700">Month</label>
          <div className="relative">
            <select
              value={viewingDate.getMonth()}
              onChange={handleMonthChange}
              className="appearance-none bg-white border border-blue-200 rounded-lg px-3 py-2 pr-6 text-slate-800 font-medium text-sm hover:border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 cursor-pointer min-w-[120px]"
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Compact Divider */}
        <div className="flex items-center">
          <div className="w-4 h-0.5 bg-blue-300"></div>
          <div className="mx-1 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
          <div className="w-4 h-0.5 bg-blue-300"></div>
        </div>

        {/* Year Selector */}
        <div className="flex flex-col items-center space-y-1">
          <label className="text-xs font-medium text-slate-700">Year</label>
          <div className="relative">
            <select
              value={viewingDate.getFullYear()}
              onChange={handleYearChange}
              className="appearance-none bg-white border border-blue-200 rounded-lg px-3 py-2 pr-6 text-slate-800 font-medium text-sm hover:border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 cursor-pointer min-w-[80px]"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Current Selection Display */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="font-medium text-sm">
            {viewingDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthYearSelector;
