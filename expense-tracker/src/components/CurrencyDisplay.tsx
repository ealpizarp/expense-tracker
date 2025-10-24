import React from "react";
import { formatCurrency, convertCurrency } from "../utils/currencyUtils";

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  convertTo?: string;
  showConverted?: boolean;
  className?: string;
  precision?: number;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency,
  convertTo = "USD",
  showConverted = false,
  className = "",
  precision = 2,
}) => {
  const formattedAmount = formatCurrency(amount, currency);

  if (!showConverted || currency === convertTo) {
    return <span className={className}>{formattedAmount}</span>;
  }

  const convertedAmount = convertCurrency(amount, currency, convertTo);
  const convertedFormatted = formatCurrency(convertedAmount, convertTo);

  return (
    <span className={className}>
      <span className="font-medium">{formattedAmount}</span>
      <span className="text-gray-500 text-sm ml-1">({convertedFormatted})</span>
    </span>
  );
};

export default CurrencyDisplay;
