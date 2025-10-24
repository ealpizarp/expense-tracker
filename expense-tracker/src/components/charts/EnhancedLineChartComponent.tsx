import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LineChartComponentProps } from "../../types";
import CategoryFilter from "./CategoryFilter";

interface EnhancedLineChartComponentProps extends LineChartComponentProps {
  categoryChartData?: Array<{ name: string; value: number }>;
  expenses?: Array<{
    amount: number;
    category: string;
    createdAt: string;
  }>;
}

/**
 * Enhanced line chart component with category filtering
 */
const EnhancedLineChartComponent: React.FC<EnhancedLineChartComponentProps> = ({
  data,
  categoryChartData = [],
  expenses = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter data based on selected category
  const filteredData = useMemo(() => {
    if (!selectedCategory || !expenses.length) {
      return data;
    }

    // Get expenses for the selected category
    const categoryExpenses = expenses.filter(
      (expense) => expense.category === selectedCategory
    );

    // Group by day and sum amounts
    const dailyTotals = new Map<number, number>();
    categoryExpenses.forEach((expense) => {
      const day = new Date(expense.createdAt).getDate();
      dailyTotals.set(day, (dailyTotals.get(day) || 0) + expense.amount);
    });

    // Convert to array format matching original data structure
    return data.map((dayData) => ({
      ...dayData,
      amount: dailyTotals.get(dayData.day) || 0,
    }));
  }, [data, selectedCategory, expenses]);

  const hasData =
    filteredData &&
    filteredData.length > 0 &&
    filteredData.some((d) => d.amount > 0);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
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
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Daily Spending Trend
              {selectedCategory && (
                <span className="text-sm font-normal text-slate-600 ml-2">
                  - {selectedCategory}
                </span>
              )}
            </h3>
            <p className="text-sm text-slate-500">
              {selectedCategory
                ? `Track your daily ${selectedCategory.toLowerCase()} expenses`
                : "Track your daily expenses"}
            </p>
          </div>
        </div>

        {/* Category Filter */}
        {categoryChartData.length > 0 && (
          <CategoryFilter
            categories={categoryChartData}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        )}
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 shadow-inner">
        {hasData ? (
          <div style={{ width: "100%", height: "100%" }}>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  strokeOpacity={0.6}
                />
                <XAxis
                  dataKey="day"
                  fontSize={12}
                  fill="#64748b"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `Day ${value}`}
                />
                <YAxis
                  fontSize={12}
                  fill="#64748b"
                  tickFormatter={(value) => `$${value}`}
                  width={60}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                  formatter={(value: number) => [
                    `$${value.toFixed(2)}`,
                    selectedCategory || "Amount",
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                  labelStyle={{
                    color: "#1e293b",
                    fontWeight: "600",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
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
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {selectedCategory
                  ? `No ${selectedCategory} expenses found`
                  : "No spending data"}
              </h3>
              <p className="text-slate-500 text-sm">
                {selectedCategory
                  ? `Try selecting a different category or time period`
                  : "Start tracking expenses to see your spending trends"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedLineChartComponent;
