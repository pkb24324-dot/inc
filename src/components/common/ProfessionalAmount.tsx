import React from 'react';
import { splitCurrencyParts } from '../../utils/currencyFormatter';

interface ProfessionalAmountProps {
  amount: number | string | undefined | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  color?: 'emerald' | 'white' | 'amber' | 'blue' | 'slate' | 'default';
  showDecimals?: boolean;
  currencyPrefix?: string;
  currencySuffix?: string;
  className?: string;
  showCurrencyBadge?: boolean;
  mono?: boolean;
}

export const ProfessionalAmount: React.FC<ProfessionalAmountProps> = ({
  amount,
  size = 'md',
  color = 'default',
  showDecimals = true,
  currencyPrefix,
  currencySuffix,
  className = '',
  showCurrencyBadge = false,
  mono = true,
}) => {
  const parts = splitCurrencyParts(amount, showDecimals ? 2 : 0);

  const sizeClasses = {
    xs: {
      symbol: 'text-[9.5px]',
      integer: 'text-[11px] font-bold',
      decimal: 'text-[8.5px]',
      badge: 'text-[7.5px] px-1 py-0.2',
    },
    sm: {
      symbol: 'text-[10.5px]',
      integer: 'text-xs sm:text-[13px] font-bold',
      decimal: 'text-[9.5px]',
      badge: 'text-[8.5px] px-1.5 py-0.5',
    },
    md: {
      symbol: 'text-xs font-semibold',
      integer: 'text-sm sm:text-base font-extrabold',
      decimal: 'text-[10.5px]',
      badge: 'text-[9px] px-1.5 py-0.5',
    },
    lg: {
      symbol: 'text-sm font-bold',
      integer: 'text-lg sm:text-xl font-black',
      decimal: 'text-xs sm:text-[13px] font-semibold',
      badge: 'text-[9.5px] px-2 py-0.5',
    },
    xl: {
      symbol: 'text-base font-bold',
      integer: 'text-xl sm:text-2xl font-black',
      decimal: 'text-xs sm:text-sm font-semibold',
      badge: 'text-[10px] px-2 py-0.5',
    },
    '2xl': {
      symbol: 'text-lg sm:text-xl font-extrabold',
      integer: 'text-2xl sm:text-3xl font-black tracking-tight',
      decimal: 'text-sm sm:text-base font-bold',
      badge: 'text-xs px-2.5 py-0.5',
    },
    '3xl': {
      symbol: 'text-xl sm:text-2xl font-black',
      integer: 'text-3xl sm:text-4xl font-black tracking-tight',
      decimal: 'text-base sm:text-lg font-bold',
      badge: 'text-xs px-2.5 py-1',
    },
  }[size];

  const colorClasses = {
    default: 'text-white',
    white: 'text-white',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    slate: 'text-slate-200',
  }[color];

  return (
    <span
      className={`inline-flex items-baseline space-x-0.5 tracking-tight ${colorClasses} ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
    >
      {/* Currency Symbol */}
      <span
        className={`font-semibold opacity-90 select-none ${sizeClasses.symbol} ${
          mono ? 'font-mono' : "font-['Plus_Jakarta_Sans']"
        }`}
      >
        {currencyPrefix || parts.symbol}
      </span>

      {/* Integer formatted part */}
      <span
        className={`font-black ${sizeClasses.integer} ${
          mono ? 'font-mono' : "font-['Outfit']"
        }`}
      >
        {parts.integer}
      </span>

      {/* Decimal part */}
      {showDecimals && (
        <span
          className={`opacity-70 font-semibold ${sizeClasses.decimal} ${
            mono ? 'font-mono' : "font-['Plus_Jakarta_Sans']"
          }`}
        >
          .{parts.decimal}
        </span>
      )}

      {/* Optional currency badge (e.g., INR) */}
      {showCurrencyBadge && (
        <span
          className={`ml-1.5 font-bold uppercase rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 select-none ${sizeClasses.badge}`}
        >
          INR
        </span>
      )}

      {currencySuffix && (
        <span className="ml-1 text-xs opacity-70 font-normal select-none">
          {currencySuffix}
        </span>
      )}
    </span>
  );
};
