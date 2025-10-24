import React from "react";
import { useAuth } from "../contexts/AuthContext";
import MetricsCard from "./MetricsCard";
import CategoryIcon from "./CategoryIcon";
import { getDailyAverage } from "../utils/expenseUtils";
import { MonthlySummaryProps } from "../types";
import { ViewType } from "../utils/viewUtils";
import Card from "./ui/Card";
import Button from "./ui/Button";

/**
 * Monthly summary component with enhanced metrics
 */
const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  viewingDate,
  onDateChange,
  totalForMonth,
  expenses = [],
  categoryChartData = [],
  currentView = "month",
}) => {
  const { user, signOut } = useAuth();

  // Calculate daily average based on actual transaction dates
  const averageDaily = getDailyAverage(expenses, viewingDate);

  // Calculate days with transactions for subtitle
  const uniqueDays = new Set(
    expenses.map((expense) => {
      const expenseDate = new Date(expense.createdAt);
      return expenseDate.getDate();
    })
  );
  const daysWithTransactions = uniqueDays.size;

  // Find top category
  const topCategory =
    categoryChartData.length > 0
      ? categoryChartData.reduce((max, current) =>
          current.value > max.value ? current : max
        )
      : null;

  // Calculate transaction count
  const transactionCount = expenses.length;

  return (
    <div className="mb-6">
      {/* Enhanced Compact Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-2xl p-6 shadow-xl mb-6 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/3 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/3 rounded-full translate-y-12 -translate-x-12"></div>

        <div className="relative z-10">
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
            {/* Left Section: Title and Date Selector */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Financial Dashboard
                  </h1>
                  <p className="text-blue-100 text-sm font-medium">
                    {viewingDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Conditional Date Selector - Only show for month view */}
              {currentView === "month" && (
                <div className="max-w-md">
                  <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center space-x-2 flex-1">
                      <label className="text-xs font-medium text-blue-100 whitespace-nowrap">
                        Month
                      </label>
                      <select
                        value={viewingDate.getMonth()}
                        onChange={(e) => {
                          const newDate = new Date(
                            viewingDate.getFullYear(),
                            parseInt(e.target.value, 10),
                            1
                          );
                          onDateChange(newDate);
                        }}
                        className="appearance-none bg-white/20 border border-white/30 rounded-md px-3 py-1.5 text-xs text-white font-medium hover:bg-white/30 focus:bg-white/30 focus:outline-none cursor-pointer w-full transition-colors duration-200"
                      >
                        {[
                          "January",
                          "February",
                          "March",
                          "April",
                          "May",
                          "June",
                          "July",
                          "August",
                          "September",
                          "October",
                          "November",
                          "December",
                        ].map((month, index) => (
                          <option
                            key={month}
                            value={index}
                            className="text-slate-800"
                          >
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-px h-6 bg-white/30"></div>

                    <div className="flex items-center space-x-2 flex-1">
                      <label className="text-xs font-medium text-blue-100 whitespace-nowrap">
                        Year
                      </label>
                      <select
                        value={viewingDate.getFullYear()}
                        onChange={(e) => {
                          const newDate = new Date(
                            parseInt(e.target.value, 10),
                            viewingDate.getMonth(),
                            1
                          );
                          onDateChange(newDate);
                        }}
                        className="appearance-none bg-white/20 border border-white/30 rounded-md px-3 py-1.5 text-xs text-white font-medium hover:bg-white/30 focus:bg-white/30 focus:outline-none cursor-pointer w-full transition-colors duration-200"
                      >
                        {Array.from(
                          { length: 21 },
                          (_, i) => new Date().getFullYear() - 10 + i
                        ).map((year) => (
                          <option
                            key={year}
                            value={year}
                            className="text-slate-800"
                          >
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Section: User Info and Actions */}
            <div className="flex flex-col items-end space-y-3 flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center space-x-2 border border-white/20">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </span>
                  </div>
                )}

                <div className="text-left min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-blue-100 text-xs truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 transition-all duration-200 text-xs border border-white/20 hover:border-white/30"
              >
                <svg
                  className="w-3 h-3 mr-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="whitespace-nowrap">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Grid - This will be replaced by the stats cards in the main layout */}
      <div className="hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Spent"
            value={`$${totalForMonth.toFixed(2)}`}
            subtitle={`${daysWithTransactions} days with transactions`}
            icon="💰"
          />

          <MetricsCard
            title="Daily Average"
            value={`$${averageDaily.toFixed(2)}`}
            subtitle="Per active day"
            icon="📊"
          />

          <MetricsCard
            title="Transactions"
            value={transactionCount.toString()}
            subtitle="This month"
            icon="📝"
          />

          <MetricsCard
            title="Top Category"
            value={topCategory?.name || "None"}
            subtitle={`$${topCategory?.value.toFixed(2) || "0"}`}
            icon={<CategoryIcon category={topCategory?.name} />}
          />
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;
