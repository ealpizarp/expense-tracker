import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../../constants";
import { getMonthName } from "../../utils/viewUtils";

interface MonthlyTrendChartProps {
  data: Array<{ month: number; amount: number }>;
  viewType: "quarter" | "year";
}

/**
 * Monthly trend chart component for quarter and year views
 */
const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  data,
  viewType,
}) => {
  // Format data for display
  const chartData = data.map((item) => ({
    month: item.month,
    amount: item.amount,
    monthName: getMonthName(item.month),
    displayName:
      viewType === "quarter"
        ? getMonthName(item.month).substring(0, 3) // Short names for quarter
        : getMonthName(item.month).substring(0, 3), // Short names for year
  }));

  const hasData = data.some((item) => item.amount > 0);

  if (!hasData) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
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
              No Spending Data
            </h3>
            <p className="text-slate-500 text-sm">
              {viewType === "quarter"
                ? "No expenses found for the last 3 months"
                : "No expenses found for this year"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            {viewType === "quarter"
              ? "Last 3 Months Trend"
              : "Monthly Spending Trend"}
          </h3>
          <p className="text-sm text-slate-600">
            {viewType === "quarter"
              ? "Spending pattern over the last 3 months"
              : "Monthly spending throughout the year"}
          </p>
        </div>
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="displayName"
              fontSize={12}
              fill="#64748b"
              tickLine={false}
              axisLine={false}
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
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
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
              stroke={CHART_COLORS[0]}
              strokeWidth={3}
              dot={{ fill: CHART_COLORS[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: CHART_COLORS[0], strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyTrendChart;
