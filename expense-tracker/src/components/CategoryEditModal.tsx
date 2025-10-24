import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Expense } from "../types";
import CategoryIcon from "./CategoryIcon";

interface CategoryEditModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseId: number, newCategory: string) => Promise<Expense>;
  availableCategories: string[];
  isLoading?: boolean;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
  expense,
  isOpen,
  onClose,
  onSave,
  availableCategories,
  isLoading = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");

  // Update selected category when expense changes
  React.useEffect(() => {
    if (expense) {
      setSelectedCategory(expense.category);
      setError(""); // Clear any previous errors
    }
  }, [expense]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !expense) return null;

  // Ensure we're in a browser environment
  if (typeof window === "undefined") return null;

  const handleSave = async () => {
    if (!selectedCategory || selectedCategory === expense.category) {
      onClose();
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      await onSave(expense.id, selectedCategory);
      onClose();
    } catch (error) {
      console.error("Error updating category:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update category"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] overflow-y-auto"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-slate-200/50 relative my-8"
          onKeyDown={handleKeyPress}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
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
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Edit Category
                  </h2>
                  <p className="text-sm text-slate-600">
                    Choose a new category for this transaction
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-200 group"
              >
                <svg
                  className="w-5 h-5 text-slate-500 group-hover:text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current Transaction Info */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center shadow-md border border-blue-100">
                    <CategoryIcon
                      category={expense.category}
                      className="w-6 h-6 text-blue-600"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-lg truncate">
                      {expense.merchant}
                    </h3>
                    <p className="text-slate-600 font-semibold">
                      ${expense.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Current category:</span>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-blue-200">
                    {expense.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="text-lg font-semibold text-slate-800">
                  Choose New Category
                </label>
                <span className="text-sm text-slate-500">
                  {availableCategories.length} categories available
                </span>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center space-y-3 text-slate-500">
                    <svg
                      className="animate-spin w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="font-medium">Loading categories...</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                  {availableCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`group flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                        selectedCategory === category
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                          selectedCategory === category
                            ? "bg-blue-100"
                            : "bg-slate-100 group-hover:bg-slate-200"
                        }`}
                      >
                        <CategoryIcon
                          category={category}
                          className={`w-5 h-5 ${
                            selectedCategory === category
                              ? "text-blue-600"
                              : "text-slate-500 group-hover:text-slate-600"
                          }`}
                        />
                      </div>
                      <span className="font-medium truncate flex-1 text-left">
                        {category}
                      </span>
                      {selectedCategory === category && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-red-700 font-medium">
                    {error}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4 pt-4 border-t border-slate-200">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  isSaving ||
                  isLoading ||
                  !selectedCategory ||
                  selectedCategory === expense.category
                }
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Update Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body || document.documentElement
  );
};

export default CategoryEditModal;
