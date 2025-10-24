import React from "react";

export type ViewType = "month" | "quarter" | "year";

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  viewingDate: Date;
  onDateChange: (date: Date) => void;
}

/**
 * View selector component for switching between month, quarter, and year views
 */
const ViewSelector: React.FC<ViewSelectorProps> = ({
  currentView,
  onViewChange,
  viewingDate,
  onDateChange,
}) => {
  const getQuarterMonths = (date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();

    // Determine which quarter we're in
    const quarter = Math.floor(month / 3);
    const startMonth = quarter * 3;

    return [
      new Date(year, startMonth, 1),
      new Date(year, startMonth + 1, 1),
      new Date(year, startMonth + 2, 1),
    ];
  };

  const getLastThreeMonths = (date: Date) => {
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const monthDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
      months.push(monthDate);
    }
    return months;
  };

  const getYearMonths = (date: Date) => {
    const year = date.getFullYear();
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(new Date(year, i, 1));
    }
    return months;
  };

  const handleViewChange = (view: ViewType) => {
    onViewChange(view);

    // Adjust the viewing date based on the new view
    if (view === "quarter") {
      // Set to current quarter start
      const currentQuarter = Math.floor(viewingDate.getMonth() / 3);
      const quarterStart = new Date(
        viewingDate.getFullYear(),
        currentQuarter * 3,
        1
      );
      onDateChange(quarterStart);
    } else if (view === "year") {
      // Set to current year start
      const yearStart = new Date(viewingDate.getFullYear(), 0, 1);
      onDateChange(yearStart);
    }
    // For month view, keep the current date
  };

  const getViewTitle = () => {
    switch (currentView) {
      case "month":
        return viewingDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      case "quarter":
        const quarter = Math.floor(viewingDate.getMonth() / 3) + 1;
        return `Q${quarter} ${viewingDate.getFullYear()}`;
      case "year":
        return viewingDate.getFullYear().toString();
      default:
        return "";
    }
  };

  const getViewDescription = () => {
    switch (currentView) {
      case "month":
        return "Single month view";
      case "quarter":
        const quarter = Math.floor(viewingDate.getMonth() / 3) + 1;
        return `Q${quarter} ${viewingDate.getFullYear()} - Last 3 months`;
      case "year":
        return "Full year view";
      default:
        return "";
    }
  };

  const handleQuarterNavigation = (direction: "prev" | "next") => {
    if (currentView !== "quarter") return;

    const currentQuarter = Math.floor(viewingDate.getMonth() / 3);
    const currentYear = viewingDate.getFullYear();

    let newQuarter = currentQuarter;
    let newYear = currentYear;

    if (direction === "prev") {
      newQuarter = currentQuarter - 1;
      if (newQuarter < 0) {
        newQuarter = 3;
        newYear = currentYear - 1;
      }
    } else {
      newQuarter = currentQuarter + 1;
      if (newQuarter > 3) {
        newQuarter = 0;
        newYear = currentYear + 1;
      }
    }

    const newDate = new Date(newYear, newQuarter * 3, 1);
    onDateChange(newDate);
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* View Title and Description */}
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-slate-800">
              {getViewTitle()}
            </h3>
            {/* Quarter Navigation - Only show for quarter view */}
            {currentView === "quarter" && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleQuarterNavigation("prev")}
                  className="p-1.5 rounded-md hover:bg-slate-100 transition-colors duration-200"
                  title="Previous quarter"
                >
                  <svg
                    className="w-4 h-4 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleQuarterNavigation("next")}
                  className="p-1.5 rounded-md hover:bg-slate-100 transition-colors duration-200"
                  title="Next quarter"
                >
                  <svg
                    className="w-4 h-4 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-600">{getViewDescription()}</p>
        </div>

        {/* View Selector Buttons */}
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => handleViewChange("month")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentView === "month"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => handleViewChange("quarter")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentView === "quarter"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Last 3 Months
          </button>
          <button
            onClick={() => handleViewChange("year")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentView === "year"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Year
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSelector;
