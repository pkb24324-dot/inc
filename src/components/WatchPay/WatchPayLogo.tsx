import React from 'react';

interface Props {
  className?: string;
  variant?: 'full' | 'compact' | 'icon-only';
  theme?: 'light' | 'dark';
}

export const WatchPayLogo: React.FC<Props> = ({
  className = '',
  variant = 'full',
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* Emblem Icon */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={variant === 'compact' ? 'w-6 h-6' : 'w-8 h-8'}
        >
          <defs>
            <linearGradient id="wpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="wpInner" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter id="wpGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10B981" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Hexagonal Shield Background */}
          <path
            d="M22 2L39 11.5V32.5L22 42L5 32.5V11.5L22 2Z"
            fill="url(#wpGradient)"
            filter="url(#wpGlow)"
          />
          {/* Inner Geometric Shield */}
          <path
            d="M22 6L35 13.5V30.5L22 38L9 30.5V13.5L22 6Z"
            fill={isLight ? '#0F172A' : '#0B1120'}
          />

          {/* Stylized 'W' & Tick Motif */}
          <path
            d="M14 16L18 29L22 21L26 29L30 16"
            stroke="url(#wpInner)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Central Security Core */}
          <circle cx="22" cy="21" r="2" fill="#34D399" />
        </svg>
      </div>

      {/* Typography */}
      {variant !== 'icon-only' && (
        <div className="ml-2.5 flex flex-col justify-center leading-none">
          <div className="flex items-baseline space-x-0.5">
            <span
              className={`font-black tracking-tight ${
                variant === 'compact' ? 'text-sm' : 'text-base'
              } ${isLight ? 'text-slate-900' : 'text-white'}`}
              style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
            >
              Watch
            </span>
            <span
              className={`font-black tracking-tight ${
                variant === 'compact' ? 'text-sm' : 'text-base'
              } text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400`}
              style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
            >
              Pay
            </span>
          </div>
          {variant === 'full' && (
            <span className="text-[9px] font-bold tracking-widest uppercase text-emerald-500/90 mt-0.5">
              Secure Gateway
            </span>
          )}
        </div>
      )}
    </div>
  );
};
