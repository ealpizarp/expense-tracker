import React, { useState } from "react";
import { CATEGORIES } from "./constants";
import { useExpenses, useExpenseData } from "./hooks";
import {
  ErrorAlert,
  MonthlySummary,
  PieChartComponent,
  BarChartComponent,
  LineChartComponent,
  ExpenseList,
} from "./components";

// --- Main App Component ---
const App: React.FC = () => {
  // --- State Management ---
  const [viewingDate, setViewingDate] = useState<Date>(
    new Date("2025-10-05T19:30:00")
  ); // Default to Oct 2025

  // Custom hooks
  const {
    expenses,
    error: expensesError,
    deleteExpense,
    setError,
  } = useExpenses();
  const { filteredExpenses, totalForMonth, categoryChartData, dailyTrendData } =
    useExpenseData(expenses, viewingDate, CATEGORIES);

  // Error state
  const error = expensesError;

  // --- Event Handlers ---

  const handleDelete = (id: number): void => {
    deleteExpense(id);
  };

  const handleDateChange = (newDate: Date): void => {
    setViewingDate(newDate);
  };

  const handleErrorDismiss = (): void => {
    setError(null);
  };

  // --- UI Rendering ---
  return (
    <div className="bg-slate-50 h-screen w-screen overflow-y-auto font-sans text-slate-800">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            Monthly Expense Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Your AI-powered financial overview
          </p>
        </header>

        <ErrorAlert error={error} onDismiss={handleErrorDismiss} />

        <MonthlySummary
          viewingDate={viewingDate}
          onDateChange={handleDateChange}
          totalForMonth={totalForMonth}
        />

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PieChartComponent data={categoryChartData} />
          <BarChartComponent data={categoryChartData} />
          <LineChartComponent data={dailyTrendData} />
          <ExpenseList expenses={filteredExpenses} onDelete={handleDelete} />
        </main>
      </div>
    </div>
  );
};

export default App;
