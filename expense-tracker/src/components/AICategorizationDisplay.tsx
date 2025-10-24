import React from "react";
import { ParsedExpense } from "../types";

interface AICategorizationDisplayProps {
  expenses: ParsedExpense[];
}

const AICategorizationDisplay: React.FC<AICategorizationDisplayProps> = ({
  expenses,
}) => {
  if (!expenses || expenses.length === 0) {
    return null;
  }

  const aiCategorizedExpenses = expenses.filter(
    (expense) => expense.confidence !== undefined && expense.reasoning
  );

  if (aiCategorizedExpenses.length === 0) {
    return null;
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 bg-green-100";
    if (confidence >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return "High";
    if (confidence >= 60) return "Medium";
    return "Low";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          AI Categorization Results
        </h3>
        <span className="text-sm text-gray-500">
          {aiCategorizedExpenses.length} expenses analyzed
        </span>
      </div>

      <div className="space-y-4">
        {aiCategorizedExpenses.map((expense, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {expense.merchant}
                </h4>
                <p className="text-sm text-gray-600">
                  ${expense.amount.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {expense.category}
                </span>
                {expense.subcategory && (
                  <span className="text-xs text-gray-500">
                    ({expense.subcategory})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(
                    expense.confidence || 0
                  )}`}
                >
                  {getConfidenceLabel(expense.confidence || 0)} Confidence
                </span>
                <span className="text-xs text-gray-500">
                  {expense.confidence}%
                </span>
              </div>
            </div>

            {expense.reasoning && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 italic">
                  "{expense.reasoning}"
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {
                aiCategorizedExpenses.filter((e) => (e.confidence || 0) >= 80)
                  .length
              }
            </div>
            <div className="text-gray-500">High Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-600">
              {
                aiCategorizedExpenses.filter(
                  (e) => (e.confidence || 0) >= 60 && (e.confidence || 0) < 80
                ).length
              }
            </div>
            <div className="text-gray-500">Medium Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">
              {
                aiCategorizedExpenses.filter((e) => (e.confidence || 0) < 60)
                  .length
              }
            </div>
            <div className="text-gray-500">Low Confidence</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICategorizationDisplay;
