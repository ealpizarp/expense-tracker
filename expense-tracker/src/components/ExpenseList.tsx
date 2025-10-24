import React, { useState, useMemo } from "react";
import { ExpenseListProps, Expense } from "../types";
import CategoryIcon from "./CategoryIcon";
import CategoryEditModal from "./CategoryEditModal";

type SortOption = "date" | "amount" | "category" | "description" | "location";
type SortDirection = "asc" | "desc";

/**
 * Enhanced expense list component with sorting and filtering
 */
const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [localExpenses, setLocalExpenses] = useState<Expense[]>(expenses);

  // Get unique categories for filter (from current expenses)
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(localExpenses.map((expense) => expense.category))
    );
    return uniqueCategories.sort();
  }, [localExpenses]);

  // Fetch all categories from database
  const fetchAllCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch("/api/categories", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const categoryNames = data.map(
          (cat: { id: number; name: string }) => cat.name
        );
        setAllCategories(categoryNames);
      } else {
        console.error("Failed to fetch categories from database");
        // Fallback to categories from current expenses
        setAllCategories(categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to categories from current expenses
      setAllCategories(categories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Update local expenses when props change
  React.useEffect(() => {
    setLocalExpenses(expenses);
  }, [expenses]);

  // Fetch categories when component mounts
  React.useEffect(() => {
    fetchAllCategories();
  }, []);

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = localExpenses;

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (expense) => expense.category === filterCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((expense) =>
        expense.merchant.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort expenses
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "category":
          aValue = a.category;
          bValue = b.category;
          break;
        case "description":
          aValue = a.merchant.toLowerCase();
          bValue = b.merchant.toLowerCase();
          break;
        case "location":
          aValue = a.location.toLowerCase();
          bValue = b.location.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [localExpenses, sortBy, sortDirection, filterCategory, searchTerm]);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(option);
      setSortDirection("asc");
    }
  };

  const handleEditCategory = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleSaveCategory = async (
    expenseId: number,
    newCategory: string
  ): Promise<Expense> => {
    try {
      const response = await fetch("/api/expenses/update-category", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          transactionId: expenseId,
          category: newCategory,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to update category";
        try {
          const errorData = await response.json();
          console.error("❌ API Error response:", errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error("❌ Failed to parse error response:", parseError);
          const errorText = await response.text();
          console.error("❌ Raw error response:", errorText);
          errorMessage = `Server error (${response.status}): ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Convert the updated transaction back to Expense format
      const updatedExpense: Expense = {
        id: result.transaction.transactionId,
        merchant:
          result.transaction.merchant?.merchantName || "Unknown Merchant",
        amount: parseFloat(result.transaction.amount), // This should be converted to USD
        category: result.transaction.category?.categoryName || "Uncategorized",
        location: result.transaction.location,
        currency: "USD", // Assuming it's converted to USD
        createdAt: result.transaction.transactionDate,
      };

      // Update local expenses state
      setLocalExpenses((prevExpenses) =>
        prevExpenses.map((expense) =>
          expense.id === expenseId ? updatedExpense : expense
        )
      );

      return updatedExpense;
    } catch (error) {
      console.error("❌ Error updating category:", error);
      throw error;
    }
  };

  const getSortIcon = (option: SortOption) => {
    if (sortBy !== option) {
      return <span className="text-slate-400 text-sm">↕</span>;
    }
    return sortDirection === "asc" ? (
      <span className="text-white text-sm font-bold">↑</span>
    ) : (
      <span className="text-white text-sm font-bold">↓</span>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Modern Header */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
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
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
              Recent Transactions
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              Manage and track your expenses
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-slate-800 placeholder-slate-500 shadow-sm transition-all duration-200 text-sm"
            />
            <svg
              className="absolute left-3 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-slate-800 font-medium shadow-sm transition-all duration-200 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        {[
          { key: "date", label: "Date", icon: "" },
          { key: "amount", label: "Amount", icon: "" },
          { key: "category", label: "Category", icon: "" },
          { key: "description", label: "Merchant", icon: "" },
          { key: "location", label: "Location", icon: "" },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => handleSort(key as SortOption)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
              sortBy === key
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "bg-white/70 backdrop-blur-sm text-slate-600 hover:bg-white hover:shadow-md border border-slate-200"
            }`}
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="text-xs ml-1">
              {getSortIcon(key as SortOption)}
            </span>
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-1 sm:space-y-0">
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-800">
            {filteredAndSortedExpenses.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">
            {localExpenses.length}
          </span>{" "}
          transactions
        </div>
        {filteredAndSortedExpenses.length > 0 && (
          <div className="text-xs text-slate-500">
            Total:{" "}
            <span className="font-bold text-slate-800">
              $
              {filteredAndSortedExpenses
                .reduce((sum, expense) => sum + expense.amount, 0)
                .toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Expense List */}
      <div className="flex-1 space-y-3 max-h-96 overflow-y-auto pr-2">
        {filteredAndSortedExpenses.length > 0 ? (
          filteredAndSortedExpenses.map((expense, index) => (
            <div
              key={expense.id}
              className="group flex items-center justify-between bg-white/80 backdrop-blur-sm p-3 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-slate-200/50 hover:border-slate-300/50 hover:scale-[1.005]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                {/* Enhanced Category Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl flex items-center justify-center shadow-md border border-blue-100 group-hover:shadow-lg transition-all duration-300">
                    <CategoryIcon
                      category={expense.category}
                      className="w-5 h-5 text-blue-600 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Enhanced Expense Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate text-sm group-hover:text-blue-600 transition-colors duration-200">
                    {expense.merchant}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-xs text-slate-500 mt-1">
                    <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold border border-blue-200 w-fit">
                      {expense.category}
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="flex items-center space-x-1">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="truncate max-w-32 sm:max-w-48">
                        {expense.location || "Unknown Location"}
                      </span>
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="flex items-center space-x-1">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-4 4m4-4l4 4m-4 0v10a2 2 0 002 2h4a2 2 0 002-2V11"
                        />
                      </svg>
                      <span>
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Amount and Actions */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="text-right">
                  <p className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                    ${expense.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500 font-medium hidden sm:block">
                    USD
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditCategory(expense)}
                    className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 p-2 rounded-xl hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
                    title="Edit category"
                  >
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 transition-all duration-200 transform hover:scale-105"
                    title="Delete expense"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-slate-600 text-xl font-semibold mb-2">
              {searchTerm || filterCategory !== "all"
                ? "No transactions found"
                : "No transactions this month"}
            </h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              {searchTerm || filterCategory !== "all"
                ? "Try adjusting your search or filter criteria to find what you're looking for"
                : "Start tracking your expenses to see them appear here"}
            </p>
          </div>
        )}
      </div>

      {/* Category Edit Modal */}
      <CategoryEditModal
        expense={editingExpense}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        availableCategories={allCategories}
        isLoading={categoriesLoading}
      />
    </div>
  );
};

export default ExpenseList;
