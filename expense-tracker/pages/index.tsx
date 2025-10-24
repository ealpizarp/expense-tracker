import React, { useState, useEffect, useMemo } from "react";
import { SessionProvider } from "next-auth/react";
import { CATEGORIES } from "../src/constants";
import { useExpenses, useExpenseData, useCategories } from "../src/hooks";
import { useViewData } from "../src/hooks/useViewData";
import {
  ErrorAlert,
  MonthlySummary,
  PieChartComponent,
  BarChartComponent,
  LineChartComponent,
  ExpenseList,
} from "../src/components";
import ViewSelector from "../src/components/ViewSelector";
import MonthlyTrendChart from "../src/components/charts/MonthlyTrendChart";
import EnhancedLineChartComponent from "../src/components/charts/EnhancedLineChartComponent";
import EnhancedMonthlyTrendChart from "../src/components/charts/EnhancedMonthlyTrendChart";
import GmailIntegration from "../src/components/GmailIntegration";
import AIInsights from "../src/components/AIInsights";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { getDailyAverage } from "../src/utils/expenseUtils";
import { ViewType } from "../src/utils/viewUtils";

// --- Authenticated Content Component ---
const AuthenticatedContent = () => {
  // --- State Management ---
  const [viewingDate, setViewingDate] = useState<Date>(
    new Date("2025-10-01T00:00:00")
  ); // Default to October 2025 to match the data
  const [currentView, setCurrentView] = useState<ViewType>("month");

  // Custom hooks
  const {
    expenses,
    error: expensesError,
    deleteExpense,
    setError,
    refreshExpenses,
  } = useExpenses();
  const { categories: databaseCategories, loading: categoriesLoading } =
    useCategories();

  // Use the new view system
  const viewData = useViewData(
    expenses,
    viewingDate,
    currentView,
    databaseCategories
  );
  const {
    filteredExpenses,
    totalAmount,
    categoryChartData,
    dailyTrendData,
    monthlyTrendData,
    metrics,
  } = viewData;

  // Debug: Log what data we have
  useEffect(() => {
    console.log("🔍 Debug - Current viewing date:", viewingDate);
    console.log("🔍 Debug - Total expenses loaded:", expenses.length);
    console.log(
      "🔍 Debug - Filtered expenses for current view:",
      filteredExpenses.length
    );
    console.log("🔍 Debug - Date range being used:", viewData.dateRange);

    // Show sample of all expenses with dates
    if (expenses.length > 0) {
      const sampleDates = expenses.slice(0, 5).map((exp) => ({
        merchant: exp.merchant,
        date: exp.createdAt,
        month: new Date(exp.createdAt).getMonth() + 1,
        year: new Date(exp.createdAt).getFullYear(),
      }));
      console.log("🔍 Debug - Sample expense dates:", sampleDates);

      // Show all available months/years
      const monthYearCounts = expenses.reduce((acc, exp) => {
        const date = new Date(exp.createdAt);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log("🔍 Debug - Available months with data:", monthYearCounts);
    }
  }, [
    viewingDate,
    expenses.length,
    filteredExpenses.length,
    viewData.dateRange,
  ]);

  // Use filtered expenses directly
  const displayExpenses = filteredExpenses;

  // Error state
  const error = expensesError;

  // --- Event Handlers ---

  const handleDelete = (id: number): void => {
    deleteExpense(id);
  };

  const handleDateChange = (newDate: Date): void => {
    setViewingDate(newDate);
  };

  const handleViewChange = (view: ViewType): void => {
    setCurrentView(view);
  };

  const handleErrorDismiss = (): void => {
    setError(null);
  };

  // Show loading state while categories are being fetched
  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  // --- UI Rendering ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans text-slate-800 transition-colors duration-300">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent truncate">
                  Expense Tracker
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  AI-Powered Financial Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs text-slate-500">Total This Month</p>
                <p className="text-sm sm:text-base font-bold text-slate-900">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <ErrorAlert error={error} onDismiss={handleErrorDismiss} />

        <MonthlySummary
          viewingDate={viewingDate}
          onDateChange={handleDateChange}
          totalForMonth={totalAmount}
          expenses={filteredExpenses}
          categoryChartData={categoryChartData}
          currentView={currentView}
        />

        <main className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
          {/* View Selector */}
          <ViewSelector
            currentView={currentView}
            onViewChange={handleViewChange}
            viewingDate={viewingDate}
            onDateChange={handleDateChange}
          />

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-600 truncate">
                    Total Spent
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    ${totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-600 truncate">
                    Transactions
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {metrics.transactionCount}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-600 truncate">
                    Daily Average
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    ${metrics.averagePerPeriod.toFixed(2)}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-600 truncate">
                    Top Category
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {metrics.topCategory?.name || "None"}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <PieChartComponent data={categoryChartData} />
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <AIInsights
                expenses={displayExpenses}
                categoryChartData={categoryChartData}
                totalSpent={totalAmount}
                dailyAverage={metrics.averagePerPeriod}
                transactionCount={metrics.transactionCount}
                topCategory={metrics.topCategory?.name || "Unknown"}
              />
            </div>
          </div>

          {/* Trend Chart - Different based on view */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            {currentView === "month" ? (
              <EnhancedLineChartComponent
                data={dailyTrendData}
                categoryChartData={categoryChartData}
                expenses={filteredExpenses}
              />
            ) : (
              <EnhancedMonthlyTrendChart
                data={monthlyTrendData}
                viewType={currentView}
                categoryChartData={categoryChartData}
                expenses={filteredExpenses}
              />
            )}
          </div>

          {/* Expenses Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <ExpenseList expenses={displayExpenses} onDelete={handleDelete} />
          </div>

          {/* Gmail Integration Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <GmailIntegration
              onExpensesImported={async (count) => {
                console.log(`Imported ${count} expenses from Gmail`);
                // Refresh expenses data by refetching instead of reloading page
                await refreshExpenses();
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Sign In Component ---
const SignInPrompt = () => {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Expense Tracker
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your personal expense tracking dashboard
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <button
              onClick={signIn}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </span>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
const HomePage = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignInPrompt />;
  }

  return <AuthenticatedContent />;
};

// --- App with Providers ---
const App = () => {
  return (
    <SessionProvider>
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    </SessionProvider>
  );
};

export default App;
