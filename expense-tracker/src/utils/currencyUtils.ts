// Currency conversion utilities
// Note: In production, you should use a real-time exchange rate API

// Static exchange rates (update these regularly or use an API)
// Rates are relative to USD (1 USD = base rate)
const EXCHANGE_RATES: Record<string, number> = {
  // North American Currencies
  'USD': 1.0,      // US Dollar
  'CAD': 0.73,     // Canadian Dollar
  'MXN': 0.058,    // Mexican Peso
  
  // South American Currencies
  'CRC': 0.0018,   // Costa Rican Colón
  'BRL': 0.20,     // Brazilian Real
  'ARS': 0.0011,   // Argentine Peso
  'CLP': 0.0011,   // Chilean Peso
  'COP': 0.00025,  // Colombian Peso
  'PEN': 0.27,     // Peruvian Sol
  'UYU': 0.025,    // Uruguayan Peso
  'VES': 0.000028, // Venezuelan Bolívar
  'BOB': 0.14,     // Bolivian Boliviano
  'PYG': 0.00014,  // Paraguayan Guarani
  'GYD': 0.0048,   // Guyanese Dollar
  'SRD': 0.027,    // Surinamese Dollar
  
  // European Currencies
  'EUR': 1.08,     // Euro
  'GBP': 1.27,     // British Pound
  'CHF': 1.12,     // Swiss Franc
  'NOK': 0.095,    // Norwegian Krone
  'SEK': 0.095,    // Swedish Krona
  'DKK': 0.145,    // Danish Krone
  'PLN': 0.25,     // Polish Złoty
  'CZK': 0.043,    // Czech Koruna
  'HUF': 0.0028,   // Hungarian Forint
  'RON': 0.22,     // Romanian Leu
  'BGN': 0.55,     // Bulgarian Lev
  'HRK': 0.14,     // Croatian Kuna
  'RUB': 0.011,    // Russian Ruble
  'TRY': 0.033,    // Turkish Lira
  'UAH': 0.027,    // Ukrainian Hryvnia
};

/**
 * Convert an amount from one currency to another
 * @param amount - The amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code (defaults to USD)
 * @returns Converted amount in target currency
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string = 'USD'
): number => {
  // Validate input parameters
  if (!fromCurrency || !toCurrency) {
    console.warn('Currency parameters cannot be undefined or empty');
    return amount;
  }

  if (typeof fromCurrency !== 'string' || typeof toCurrency !== 'string') {
    console.warn('Currency parameters must be strings');
    return amount;
  }

  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = EXCHANGE_RATES[fromCurrency.toUpperCase()];
  const toRate = EXCHANGE_RATES[toCurrency.toUpperCase()];

  if (!fromRate || !toRate) {
    console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency}`);
    return amount; // Return original amount if rate not found
  }

  // Convert to USD first, then to target currency
  const usdAmount = amount * fromRate;
  return usdAmount / toRate;
};

/**
 * Format currency amount with proper symbol and decimals
 * @param amount - The amount to format
 * @param currency - Currency code
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  // Validate input parameters
  if (!currency || typeof currency !== 'string') {
    console.warn('Currency parameter must be a valid string');
    currency = 'USD'; // Default fallback
  }

  const currencySymbols: Record<string, string> = {
    // North American Currencies
    'USD': '$',     // US Dollar
    'CAD': 'C$',    // Canadian Dollar
    'MXN': '$',     // Mexican Peso
    
    // South American Currencies
    'CRC': '₡',     // Costa Rican Colón
    'BRL': 'R$',    // Brazilian Real
    'ARS': '$',     // Argentine Peso
    'CLP': '$',     // Chilean Peso
    'COP': '$',     // Colombian Peso
    'PEN': 'S/',    // Peruvian Sol
    'UYU': '$U',    // Uruguayan Peso
    'VES': 'Bs',    // Venezuelan Bolívar
    'BOB': 'Bs',    // Bolivian Boliviano
    'PYG': '₲',     // Paraguayan Guarani
    'GYD': 'G$',    // Guyanese Dollar
    'SRD': '$',     // Surinamese Dollar
    
    // European Currencies
    'EUR': '€',     // Euro
    'GBP': '£',     // British Pound
    'CHF': 'CHF',   // Swiss Franc
    'NOK': 'kr',    // Norwegian Krone
    'SEK': 'kr',    // Swedish Krona
    'DKK': 'kr',    // Danish Krone
    'PLN': 'zł',    // Polish Złoty
    'CZK': 'Kč',    // Czech Koruna
    'HUF': 'Ft',    // Hungarian Forint
    'RON': 'lei',   // Romanian Leu
    'BGN': 'лв',    // Bulgarian Lev
    'HRK': 'kn',    // Croatian Kuna
    'RUB': '₽',     // Russian Ruble
    'TRY': '₺',     // Turkish Lira
    'UAH': '₴',     // Ukrainian Hryvnia
  };

  const symbol = currencySymbols[currency.toUpperCase()] || currency;
  
  return `${symbol}${amount.toFixed(2)}`;
};

/**
 * Get the exchange rate for a currency pair
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @returns Exchange rate
 */
export const getExchangeRate = (fromCurrency: string, toCurrency: string = 'USD'): number => {
  // Validate input parameters
  if (!fromCurrency || !toCurrency) {
    console.warn('Currency parameters cannot be undefined or empty');
    return 1;
  }

  if (typeof fromCurrency !== 'string' || typeof toCurrency !== 'string') {
    console.warn('Currency parameters must be strings');
    return 1;
  }

  const fromRate = EXCHANGE_RATES[fromCurrency.toUpperCase()];
  const toRate = EXCHANGE_RATES[toCurrency.toUpperCase()];

  if (!fromRate || !toRate) {
    console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency}`);
    return 1; // Return 1 if rate not found
  }

  return fromRate / toRate;
};

/**
 * Get all available currencies with their information
 * @returns Array of currency objects with code, name, symbol, and rate
 */
export const getAvailableCurrencies = () => {
  const currencyNames: Record<string, string> = {
    // North American Currencies
    'USD': 'US Dollar',
    'CAD': 'Canadian Dollar',
    'MXN': 'Mexican Peso',
    
    // South American Currencies
    'CRC': 'Costa Rican Colón',
    'BRL': 'Brazilian Real',
    'ARS': 'Argentine Peso',
    'CLP': 'Chilean Peso',
    'COP': 'Colombian Peso',
    'PEN': 'Peruvian Sol',
    'UYU': 'Uruguayan Peso',
    'VES': 'Venezuelan Bolívar',
    'BOB': 'Bolivian Boliviano',
    'PYG': 'Paraguayan Guarani',
    'GYD': 'Guyanese Dollar',
    'SRD': 'Surinamese Dollar',
    
    // European Currencies
    'EUR': 'Euro',
    'GBP': 'British Pound',
    'CHF': 'Swiss Franc',
    'NOK': 'Norwegian Krone',
    'SEK': 'Swedish Krona',
    'DKK': 'Danish Krone',
    'PLN': 'Polish Złoty',
    'CZK': 'Czech Koruna',
    'HUF': 'Hungarian Forint',
    'RON': 'Romanian Leu',
    'BGN': 'Bulgarian Lev',
    'HRK': 'Croatian Kuna',
    'RUB': 'Russian Ruble',
    'TRY': 'Turkish Lira',
    'UAH': 'Ukrainian Hryvnia',
  };

  const currencySymbols: Record<string, string> = {
    // North American Currencies
    'USD': '$',
    'CAD': 'C$',
    'MXN': '$',
    
    // South American Currencies
    'CRC': '₡',
    'BRL': 'R$',
    'ARS': '$',
    'CLP': '$',
    'COP': '$',
    'PEN': 'S/',
    'UYU': '$U',
    'VES': 'Bs',
    'BOB': 'Bs',
    'PYG': '₲',
    'GYD': 'G$',
    'SRD': '$',
    
    // European Currencies
    'EUR': '€',
    'GBP': '£',
    'CHF': 'CHF',
    'NOK': 'kr',
    'SEK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'RON': 'lei',
    'BGN': 'лв',
    'HRK': 'kn',
    'RUB': '₽',
    'TRY': '₺',
    'UAH': '₴',
  };

  return Object.keys(EXCHANGE_RATES).map(code => ({
    code,
    name: currencyNames[code] || code,
    symbol: currencySymbols[code] || code,
    rate: EXCHANGE_RATES[code],
    rateToUSD: EXCHANGE_RATES[code]
  }));
};

/**
 * Get currencies by region
 * @returns Object with currencies grouped by region
 */
export const getCurrenciesByRegion = () => {
  const allCurrencies = getAvailableCurrencies();
  
  return {
    northAmerica: allCurrencies.filter(c => ['USD', 'CAD', 'MXN'].includes(c.code)),
    southAmerica: allCurrencies.filter(c => ['CRC', 'BRL', 'ARS', 'CLP', 'COP', 'PEN', 'UYU', 'VES', 'BOB', 'PYG', 'GYD', 'SRD'].includes(c.code)),
    europe: allCurrencies.filter(c => ['EUR', 'GBP', 'CHF', 'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'RUB', 'TRY', 'UAH'].includes(c.code))
  };
};
