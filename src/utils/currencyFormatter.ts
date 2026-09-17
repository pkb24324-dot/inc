/**
 * Professional Indian Currency & Financial Number Formatter
 * Compliant with standard banking, fintech, and Indian numbering (lakhs & crores)
 */

export interface FormatOptions {
  showCurrency?: boolean;
  showDecimals?: boolean;
  decimalPlaces?: number;
  useIndianFormat?: boolean;
  currencySymbol?: string;
}

/**
 * Format a number into standard Indian numbering format (e.g. 1,00,000.00)
 */
export function formatCurrencyINR(
  amount: number | string | undefined | null,
  options: FormatOptions = {}
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === undefined || num === null || isNaN(num)) {
    return options.showCurrency !== false ? '₹0.00' : '0.00';
  }

  const {
    showCurrency = true,
    showDecimals = true,
    decimalPlaces = 2,
  } = options;

  const symbol = showCurrency ? '₹' : '';

  try {
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: showDecimals ? decimalPlaces : 0,
      maximumFractionDigits: showDecimals ? decimalPlaces : 0,
    }).format(num);

    return `${symbol}${formatted}`;
  } catch {
    const fixed = showDecimals ? num.toFixed(decimalPlaces) : Math.round(num).toString();
    return `${symbol}${fixed}`;
  }
}

/**
 * Returns integer and decimal parts separately for crisp financial typography styling
 * e.g. amount: 15000 -> { symbol: '₹', integer: '15,000', decimal: '00' }
 */
export function splitCurrencyParts(
  amount: number | string | undefined | null,
  decimals: number = 2
): { symbol: string; integer: string; decimal: string; full: string } {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === undefined || num === null || isNaN(num)) {
    return { symbol: '₹', integer: '0', decimal: '00', full: '₹0.00' };
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);

  const parts = formatted.split('.');
  return {
    symbol: '₹',
    integer: parts[0] || '0',
    decimal: parts[1] || '00',
    full: `₹${formatted}`,
  };
}

/**
 * Converts numeric amount to Indian English Words (e.g. 5000 -> "Five Thousand Rupees Only")
 * standard banking practice in checkbooks and bank payment vouchers
 */
export function amountInIndianWords(amount: number): string {
  if (amount <= 0 || isNaN(amount)) return 'Zero Rupees Only';

  const singleDigits = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 20) return singleDigits[n];
    const unit = n % 10;
    const ten = Math.floor(n / 10);
    return tens[ten] + (unit > 0 ? ' ' + singleDigits[unit] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    let str = '';
    if (hundred > 0) {
      str += singleDigits[hundred] + ' Hundred';
    }
    if (remainder > 0) {
      str += (str ? ' and ' : '') + convertTwoDigits(remainder);
    }
    return str;
  }

  const rounded = Math.floor(amount);
  if (rounded === 0) return 'Zero Rupees Only';

  let remaining = rounded;
  let words = '';

  // Crores (1,00,00,000)
  const crores = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  if (crores > 0) {
    words += convertTwoDigits(crores) + ' Crore ';
  }

  // Lakhs (1,00,000)
  const lakhs = Math.floor(remaining / 100000);
  remaining %= 100000;
  if (lakhs > 0) {
    words += convertTwoDigits(lakhs) + ' Lakh ';
  }

  // Thousands (1,000)
  const thousands = Math.floor(remaining / 1000);
  remaining %= 1000;
  if (thousands > 0) {
    words += convertTwoDigits(thousands) + ' Thousand ';
  }

  // Hundreds & rest
  if (remaining > 0) {
    words += convertThreeDigits(remaining);
  }

  return words.trim() + ' Rupees Only';
}
