import React from "react";
import { getCurrenciesByRegion } from "../utils/currencyUtils";

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  className?: string;
  showRegionLabels?: boolean;
  placeholder?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  className = "",
  showRegionLabels = true,
  placeholder = "Select currency",
}) => {
  const currenciesByRegion = getCurrenciesByRegion();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    >
      <option value="" disabled>
        {placeholder}
      </option>

      {showRegionLabels && (
        <>
          <optgroup label="North America">
            {currenciesByRegion.northAmerica.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code} - {currency.name}
              </option>
            ))}
          </optgroup>

          <optgroup label="South America">
            {currenciesByRegion.southAmerica.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code} - {currency.name}
              </option>
            ))}
          </optgroup>

          <optgroup label="Europe">
            {currenciesByRegion.europe.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code} - {currency.name}
              </option>
            ))}
          </optgroup>
        </>
      )}

      {!showRegionLabels && (
        <>
          {currenciesByRegion.northAmerica.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} {currency.code} - {currency.name}
            </option>
          ))}
          {currenciesByRegion.southAmerica.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} {currency.code} - {currency.name}
            </option>
          ))}
          {currenciesByRegion.europe.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} {currency.code} - {currency.name}
            </option>
          ))}
        </>
      )}
    </select>
  );
};

export default CurrencySelector;
