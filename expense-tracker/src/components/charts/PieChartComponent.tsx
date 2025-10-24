import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../../constants";
import { ChartComponentProps } from "../../types";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";

/**
 * Pie chart component for spending breakdown
 */
const PieChartComponent: React.FC<ChartComponentProps> = ({ data }) => {
  // Filter out categories with zero values for both chart and legend
  const chartData = data.filter((item) => item.value > 0);
  const legendData = data.filter((item) => item.value > 0); // Only show categories with spending

  // Enhanced legend with percentages and amounts - only shows categories with spending
  const renderCustomLegend = () => {
    // Calculate total for percentage calculation
    const total = legendData.reduce((sum, item) => sum + item.value, 0);

    if (legendData.length === 0) {
      return null;
    }

    return (
      <div className="mt-6">
        {/* Desktop: Horizontal layout */}
        <div className="hidden md:flex flex-wrap justify-center gap-4">
          {legendData.map((category, index) => {
            const percentage =
              total > 0 ? ((category.value / total) * 100).toFixed(1) : "0.0";
            const color = CHART_COLORS[index % CHART_COLORS.length];
            return (
              <div
                key={index}
                className="group flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:border-slate-300/50 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: color }}
                />
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                    {category.name}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {percentage}% • ${category.value.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile: Vertical layout */}
        <div className="md:hidden space-y-3 max-h-48 overflow-y-auto pr-2">
          {legendData.map((category, index) => {
            const percentage =
              total > 0 ? ((category.value / total) * 100).toFixed(1) : "0.0";
            const color = CHART_COLORS[index % CHART_COLORS.length];
            return (
              <div
                key={index}
                className="group flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/80 backdrop-blur-sm transition-all duration-200 cursor-pointer"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                    {category.name}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {percentage}% • ${category.value.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Modern Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">
              Spending Breakdown
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
              Category distribution
            </p>
          </div>
        </div>
        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-lg flex-shrink-0"></div>
      </div>

      {chartData.length > 0 ? (
        <div className="flex-1 space-y-6 sm:space-y-8">
          {/* Enhanced Chart Container */}
          <div className="flex justify-center">
            <div
              style={{ width: "100%", height: 280, maxWidth: 350 }}
              className="relative sm:h-[350px]"
            >
              <ResponsiveContainer>
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={130}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    stroke="#fff"
                    strokeWidth={3}
                    paddingAngle={3}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `$${value.toFixed(2)}`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "16px",
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                    labelStyle={{
                      color: "#1e293b",
                      fontWeight: "600",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center total amount */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
                    $
                    {chartData
                      .reduce((sum, item) => sum + item.value, 0)
                      .toFixed(0)}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">
                    Total
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Legend */}
          {renderCustomLegend()}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            title="No expenses for this month"
            description="Start tracking to see your spending breakdown"
            className="h-96"
          />
        </div>
      )}
    </div>
  );
};

export default PieChartComponent;
