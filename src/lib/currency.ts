/**
 * Currency Utilities
 * 
 * Provides helper functions for formatting currency based on tenant settings
 */

export interface CurrencyConfig {
  code: string // ISO 4217 code like 'LKR', 'INR', 'USD'
  symbol: string
  name: string
  decimals: number
}

// Currency configuration mapping
const CURRENCY_MAP: Record<string, CurrencyConfig> = {
  LKR: {
    code: 'LKR',
    symbol: 'Rs',
    name: 'Sri Lankan Rupee',
    decimals: 2,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimals: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
  },
}

/**
 * Get currency configuration by code
 */
export function getCurrencyConfig(code: string): CurrencyConfig {
  return CURRENCY_MAP[code] || CURRENCY_MAP['LKR'] // Default to LKR
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(
  amount: number | string,
  currencyCode: string = 'LKR',
  options: {
    showSymbol?: boolean
    decimals?: number
  } = {}
): string {
  const {
    showSymbol = true,
    decimals,
  } = options

  const config = getCurrencyConfig(currencyCode)
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  const finalDecimals = decimals !== undefined ? decimals : config.decimals

  const formatted = numAmount.toFixed(finalDecimals)
  
  if (showSymbol) {
    return `${config.symbol} ${formatted}`
  }
  
  return formatted
}

/**
 * Format amount with localized number formatting
 */
export function formatCurrencyLocalized(
  amount: number | string,
  currencyCode: string = 'LKR',
  locale: string = 'en-US'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  const config = getCurrencyConfig(currencyCode)

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(numAmount)
}

/**
 * Get currency symbol only
 */
export function getCurrencySymbol(currencyCode: string = 'LKR'): string {
  return getCurrencyConfig(currencyCode).symbol
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except decimal point and minus sign
  const cleaned = value.replace(/[^\d.-]/g, '')
  return parseFloat(cleaned) || 0
}

/**
 * Validate currency code
 */
export function isValidCurrencyCode(code: string): boolean {
  return code in CURRENCY_MAP
}

/**
 * Get all available currencies
 */
export function getAvailableCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCY_MAP)
}
