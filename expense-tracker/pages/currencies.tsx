import React from "react";
import {
  getAvailableCurrencies,
  getCurrenciesByRegion,
  convertCurrency,
  formatCurrency,
} from "../src/utils/currencyUtils";
import { CurrencySelector, CurrencyDisplay } from "../src/components";
import { useState } from "react";

const CurrenciesPage = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [amount, setAmount] = useState(100);
  const [convertTo, setConvertTo] = useState("EUR");

  const currenciesByRegion = getCurrenciesByRegion();
  const convertedAmount = convertCurrency(amount, selectedCurrency, convertTo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Currency Support
          </h1>
          <p className="text-slate-600 mb-8">
            Your expense tracker now supports {getAvailableCurrencies().length}{" "}
            currencies from North America, South America, and Europe.
          </p>

          {/* Currency Converter Demo */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Currency Converter Demo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  From
                </label>
                <CurrencySelector
                  value={selectedCurrency}
                  onChange={setSelectedCurrency}
                  showRegionLabels={false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  To
                </label>
                <CurrencySelector
                  value={convertTo}
                  onChange={setConvertTo}
                  showRegionLabels={false}
                />
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-sm text-slate-600">Result</div>
                <div className="text-lg font-semibold">
                  <CurrencyDisplay
                    amount={amount}
                    currency={selectedCurrency}
                    convertTo={convertTo}
                    showConverted={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Currencies by Region */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* North America */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                🇺🇸 North America
                <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {currenciesByRegion.northAmerica.length} currencies
                </span>
              </h3>
              <div className="space-y-2">
                {currenciesByRegion.northAmerica.map((currency) => (
                  <div
                    key={currency.code}
                    className="flex justify-between items-center py-2 px-3 bg-white rounded-md"
                  >
                    <div>
                      <span className="font-medium">
                        {currency.symbol} {currency.code}
                      </span>
                      <div className="text-sm text-slate-600">
                        {currency.name}
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      1 USD ={" "}
                      {formatCurrency(1 / currency.rateToUSD, currency.code)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* South America */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                🌎 South America
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {currenciesByRegion.southAmerica.length} currencies
                </span>
              </h3>
              <div className="space-y-2">
                {currenciesByRegion.southAmerica.map((currency) => (
                  <div
                    key={currency.code}
                    className="flex justify-between items-center py-2 px-3 bg-white rounded-md"
                  >
                    <div>
                      <span className="font-medium">
                        {currency.symbol} {currency.code}
                      </span>
                      <div className="text-sm text-slate-600">
                        {currency.name}
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      1 USD ={" "}
                      {formatCurrency(1 / currency.rateToUSD, currency.code)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Europe */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                🇪🇺 Europe
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {currenciesByRegion.europe.length} currencies
                </span>
              </h3>
              <div className="space-y-2">
                {currenciesByRegion.europe.map((currency) => (
                  <div
                    key={currency.code}
                    className="flex justify-between items-center py-2 px-3 bg-white rounded-md"
                  >
                    <div>
                      <span className="font-medium">
                        {currency.symbol} {currency.code}
                      </span>
                      <div className="text-sm text-slate-600">
                        {currency.name}
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      1 USD ={" "}
                      {formatCurrency(1 / currency.rateToUSD, currency.code)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="mt-8 bg-slate-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Usage Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  Currency Selector Component
                </h4>
                <div className="bg-white p-4 rounded-md border">
                  <CurrencySelector
                    value={selectedCurrency}
                    onChange={setSelectedCurrency}
                    placeholder="Choose a currency"
                  />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  Currency Display Component
                </h4>
                <div className="bg-white p-4 rounded-md border">
                  <CurrencyDisplay
                    amount={1500}
                    currency="BRL"
                    convertTo="USD"
                    showConverted={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrenciesPage;
