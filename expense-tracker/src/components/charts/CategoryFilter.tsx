import React from "react";
import CategoryIcon from "../CategoryIcon";

interface CategoryFilterProps {
  categories: Array<{ name: string; value: number }>;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

/**
 * Category filter dropdown for trend charts
 */
const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    onCategoryChange(value === "all" ? null : value);
  };

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-slate-600 whitespace-nowrap">
        Filter by:
      </label>
      <div className="relative">
        <select
          value={selectedCategory || "all"}
          onChange={handleCategoryChange}
          className="appearance-none bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 text-sm text-slate-700 hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer transition-colors duration-200 min-w-[140px]"
        >
          <option value="all">All Categories</option>
          {categories
            .filter((cat) => cat.value > 0)
            .map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
