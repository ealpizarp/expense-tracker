import React from "react";

interface CategoryIconProps {
  category?: string;
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  className = "w-5 h-5",
}) => {
  const getIcon = (category: string) => {
    if (!category) {
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" />
        </svg>
      );
    }

    switch (category.toLowerCase()) {
      case "groceries":
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
            <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z" />
          </svg>
        );
      case "transportation":
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 6.5H17.5L19 12H5L6.5 6.5ZM7 13.5C7.83 13.5 8.5 14.17 8.5 15S7.83 16.5 7 16.5 5.5 15.83 5.5 15 6.17 13.5 7 13.5ZM17 13.5C17.83 13.5 18.5 14.17 18.5 15S17.83 16.5 17 16.5 15.5 15.83 15.5 15 16.17 13.5 17 13.5Z" />
          </svg>
        );
      case "food":
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.1 13.34L10.93 16.17L9.52 17.58L6.69 14.75L8.1 13.34ZM18.67 3C18.41 3 18.16 3.1 17.96 3.29L9.54 11.71L13.12 15.29L21.54 6.87C21.83 6.58 21.83 6.1 21.54 5.81L19.38 3.65C19.18 3.45 18.93 3.35 18.67 3.35V3ZM8.1 1L2 7.1V9.9L8.1 3.8L8.1 1ZM14.5 4L13 5.5L16.5 9L18 7.5L14.5 4ZM4.5 4L1 7.5L2.5 9L6 5.5L4.5 4Z" />
          </svg>
        );
      case "shopping":
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
            <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z" />
            <path d="M12 8.5C12.83 8.5 13.5 9.17 13.5 10S12.83 11.5 12 11.5 10.5 10.83 10.5 10 11.17 8.5 12 8.5Z" />
          </svg>
        );
      case "services & utilities":
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2ZM12 4.5L11.5 7.5L8.5 8L11.5 8.5L12 11.5L12.5 8.5L15.5 8L12.5 7.5L12 4.5Z" />
            <path d="M19 15L20.09 21.26L29 22L20.09 22.74L19 29L17.91 22.74L9 22L17.91 21.26L19 15ZM19 17.5L18.5 20.5L15.5 21L18.5 21.5L19 24.5L19.5 21.5L22.5 21L19.5 20.5L19 17.5Z" />
            <path d="M5 15L6.09 21.26L15 22L6.09 22.74L5 29L3.91 22.74L-5 22L3.91 21.26L5 15ZM5 17.5L4.5 20.5L1.5 21L4.5 21.5L5 24.5L5.5 21.5L8.5 21L5.5 20.5L5 17.5Z" />
          </svg>
        );
      case "entertainment":
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM10 17.5V6.5L16 12L10 17.5Z" />
          </svg>
        );
      case "other":
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" />
          </svg>
        );
      default:
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" />
          </svg>
        );
    }
  };

  return getIcon(category || 'Other');
};

export default CategoryIcon;
