import React, { useState } from "react";
import { Expense, CategoryChartData } from "../types";

interface AIInsightsProps {
  expenses: Expense[];
  categoryChartData: CategoryChartData[];
  totalSpent: number;
  dailyAverage: number;
  transactionCount: number;
  topCategory: string;
}

interface Insight {
  type:
    | "spending_pattern"
    | "savings_opportunity"
    | "category_analysis"
    | "trend_analysis";
  title: string;
  description: string;
  recommendation?: string;
  severity: "low" | "medium" | "high";
  icon: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({
  expenses,
  categoryChartData,
  totalSpent,
  dailyAverage,
  transactionCount,
  topCategory,
}) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Prepare data for Gemini
      const analysisData = {
        totalSpent,
        dailyAverage,
        transactionCount,
        topCategory,
        categoryBreakdown: categoryChartData,
        recentExpenses: expenses.slice(0, 10).map((expense) => ({
          amount: expense.amount,
          category: expense.category,
          merchant: expense.merchant,
          date: expense.createdAt,
          currency: expense.currency,
        })),
      };

      const prompt = `Analyze this expense data and provide 3-5 actionable financial insights. Focus on spending patterns, potential savings opportunities, and category analysis.

Data:
- Total spent: $${totalSpent.toFixed(2)}
- Daily average: $${dailyAverage.toFixed(2)}
- Transaction count: ${transactionCount}
- Top category: ${topCategory}
- Category breakdown: ${JSON.stringify(categoryChartData, null, 2)}
- Recent expenses: ${JSON.stringify(analysisData.recentExpenses, null, 2)}

Please provide insights in this JSON format:
[
  {
    "type": "spending_pattern|savings_opportunity|category_analysis|trend_analysis",
    "title": "Brief title",
    "description": "Detailed explanation",
    "recommendation": "Actionable advice (optional)",
    "severity": "low|medium|high",
    "icon": "emoji or icon"
  }
]

Focus on:
1. Spending patterns and trends
2. Potential savings opportunities
3. Category-specific analysis
4. Budget recommendations
5. Financial health indicators`;

      const response = await fetch("/api/gemini-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate insights");
      }

      const result = await response.json();
      setInsights(result.insights || []);
    } catch (err) {
      console.error("Error generating insights:", err);
      setError("Failed to generate insights. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return "⚠️";
      case "medium":
        return "💡";
      case "low":
        return "✅";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800">
          AI Financial Insights
        </h3>
        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
      </div>

      {insights.length === 0 && !isGenerating && (
        <div className="text-center py-12">
          <div className="text-6xl mb-6">🤖</div>
          <h4 className="text-lg font-semibold text-slate-800 mb-2">
            Get AI-Powered Insights
          </h4>
          <p className="text-slate-600 mb-6 max-w-sm mx-auto">
            Discover spending patterns, savings opportunities, and personalized
            recommendations for your finances.
          </p>
          <button
            onClick={generateInsights}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              <span>✨</span>
              Generate Insights
            </span>
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
          </div>
          <h4 className="text-lg font-semibold text-slate-800 mb-2">
            Analyzing Your Data
          </h4>
          <p className="text-slate-600">
            Our AI is examining your spending patterns...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {insights.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-slate-800">
              Your Financial Insights
            </h4>
            <button
              onClick={generateInsights}
              disabled={isGenerating}
              className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span>🔄</span>
              Refresh
            </button>
          </div>

          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-l-4 ${getSeverityColor(
                  insight.severity
                )} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0">
                    {insight.icon || getSeverityIcon(insight.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold text-slate-800">
                        {insight.title}
                      </h5>
                      <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                        {insight.type.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-3 leading-relaxed">
                      {insight.description}
                    </p>
                    {insight.recommendation && (
                      <div className="bg-white bg-opacity-60 p-3 rounded-lg border border-white border-opacity-30">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">💡</span>
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">
                              Recommendation:
                            </p>
                            <p className="text-sm text-slate-600">
                              {insight.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
