import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { CHART_COLORS } from "../../constants";
import { ChartComponentProps } from "../../types";
import CategoryIcon from "../CategoryIcon";

/**
 * Enhanced bar chart component for category totals
 */
const BarChartComponent: React.FC<ChartComponentProps> = ({ data }) => {
  // Custom legend with icons
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <CategoryIcon
              category={entry.value}
              className="w-4 h-4 text-slate-600"
            />
            <span className="text-sm text-slate-600 font-medium">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800">
          Category Totals
        </h3>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      </div>
      <div style={{ width: "100%", height: 400 }}>
        {data.length > 0 ? (
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
                fill="#64748b"
                interval={0}
              />
              <YAxis
                fontSize={12}
                fill="#64748b"
                tickFormatter={(value) => `$${value}`}
                width={60}
              />
              <Tooltip
                cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                formatter={(value: number) => [
                  `$${value.toFixed(2)}`,
                  "Amount",
                ]}
                contentStyle={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#1e293b", fontWeight: "600" }}
              />
              <Bar dataKey="value" name="Total Spent" radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
              <Legend content={renderCustomLegend} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8"
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
            <p className="text-lg font-medium">No expenses for this month</p>
            <p className="text-sm">
              Start tracking to see your category breakdown
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarChartComponent;
