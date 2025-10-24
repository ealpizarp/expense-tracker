/**
 * Card - Reusable card component
 */

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  shadow?: "sm" | "md" | "lg";
  border?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
  shadow = "md",
  border = true,
}) => {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const shadowClasses = {
    sm: "shadow-sm",
    md: "shadow-lg",
    lg: "shadow-xl",
  };

  const borderClass = border ? "border border-slate-200" : "";

  const classes = `bg-white rounded-2xl ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClass} ${className}`;

  return <div className={classes}>{children}</div>;
};

export default Card;
