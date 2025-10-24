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
import { LineChartComponentProps } from "../../types";

const LineChartComponent: React.FC<LineChartComponentProps> = ({ data }) => {
  const hasData = data && data.length > 0 && data.some((d) => d.amount > 0);

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
            </h3>
            <p className="text-sm text-slate-500">Track your daily expenses</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 shadow-inner">
        {hasData ? (
          <div style={{ width: "100%", height: "100%" }}>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#34d399" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop
                      offset="100%"
                      stopColor="#10b981"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  strokeOpacity={0.6}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                  tickLine={{ stroke: "#cbd5e1" }}
                />
                <YAxis
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                  tickLine={{ stroke: "#cbd5e1" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                  formatter={(value: number) => [
                    `$${value.toFixed(2)}`,
                    "Amount Spent",
                  ]}
                  labelFormatter={(label) => `Day ${label}`}
                  labelStyle={{
                    color: "#374151",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="url(#lineGradient)"
                  strokeWidth={4}
                  dot={{
                    fill: "#10b981",
                    strokeWidth: 3,
                    r: 5,
                    stroke: "#ffffff",
                    filter: "drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))",
                  }}
                  activeDot={{
                    r: 8,
                    stroke: "#10b981",
                    strokeWidth: 3,
                    fill: "#ffffff",
                    filter: "drop-shadow(0 4px 8px rgba(16, 185, 129, 0.4))",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-slate-600 text-xl font-semibold mb-2">
              No spending data for this month
            </h3>
            <p className="text-slate-400 text-sm max-w-sm text-center">
              Start tracking your expenses to see your daily spending pattern
              and trends
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineChartComponent;
