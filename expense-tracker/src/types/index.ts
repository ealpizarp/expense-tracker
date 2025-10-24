// Core data types
export interface Merchant {
  merchantId: number;
  merchantName: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface Transaction {
  transactionId: number;
  merchantId: number;
  location: string;
  categoryId?: number;
  amount: string;
  currency: string;
  transactionDate: string;
  createdAt: string;
  merchant?: Merchant;
  category?: Category;
}

// Legacy interface for backward compatibility with existing components
export interface Expense {
  id: number;
  merchant: string;
  currency: string;
  amount: number;
  category: string;
  location: string;
  createdAt: string;
}

export interface CategoryChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface DailyTrendData {
  day: number;
  amount: number;
}


// Hook return types
export interface UseExpensesReturn {
  expenses: Expense[];
  error: string | null;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  updateExpense: (id: number, updatedExpense: Partial<Expense>) => Promise<void>;
  setError: (error: string | null) => void;
  refreshExpenses: () => Promise<void>;
}

export interface UseExpenseAnalysisReturn {
  isAnalyzing: boolean;
  analysis: string;
  error: string | null;
  analyzeExpenses: (expenses: Expense[]) => Promise<void>;
  clearAnalysis: () => void;
}

export interface UseExpenseDataReturn {
  filteredExpenses: Expense[];
  totalForMonth: number;
  categoryChartData: CategoryChartData[];
  dailyTrendData: DailyTrendData[];
}

// Component prop types
export interface ErrorAlertProps {
  error: string | null;
  onDismiss: () => void;
}

export interface MonthYearSelectorProps {
  viewingDate: Date;
  onDateChange: (date: Date) => void;
}

export interface MonthlySummaryProps {
  viewingDate: Date;
  onDateChange: (date: Date) => void;
  totalForMonth: number;
  expenses?: Expense[];
  categoryChartData?: CategoryChartData[];
  currentView?: "month" | "quarter" | "year";
}

export interface ChartComponentProps {
  data: CategoryChartData[];
}

export interface LineChartComponentProps {
  data: DailyTrendData[];
  onDayClick?: (day: number) => void;
  selectedDay?: number | null;
  isFiltered?: boolean;
  filterDescription?: string;
}

export interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: number) => void;
}

// Gmail Integration types
export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    body: {
      data?: string;
    };
    parts?: Array<{
      mimeType: string;
      body: {
        data?: string;
      };
    }>;
  };
}

export interface ParsedExpense {
  amount: number;
  merchant: string;
  date: string;
  category?: string;
  location?: string;
  subcategory?: string;
  confidence?: number;
  reasoning?: string;
  currency?: string;
}

export interface GmailIntegrationProps {
  onExpensesImported?: (count: number) => void;
}
