import { useState } from "react";
import { UseExpenseAnalysisReturn, Expense } from "../types";

/**
 * Custom hook for managing AI expense analysis
 */
export const useExpenseAnalysis = (): UseExpenseAnalysisReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const analyzeExpenses = async (expenses: Expense[]): Promise<void> => {
    setIsAnalyzing(true);
    setAnalysis("");
    setError(null);

    // Simulate analysis delay
    setTimeout(() => {
      setAnalysis("AI analysis feature has been removed from this application.");
      setIsAnalyzing(false);
    }, 1000);
  };

  const clearAnalysis = (): void => {
    setAnalysis("");
    setError(null);
  };

  return {
    isAnalyzing,
    analysis,
    error,
    analyzeExpenses,
    clearAnalysis,
  };
};
