import React from 'react';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SunpaysLogo: React.FC<Props> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 text-xs',
    md: 'h-8 text-sm',
    lg: 'h-10 text-base',
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20">
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
          {/* Sun symbol */}
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-400 fill-current">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <div className="flex items-center space-x-1">
          <span className="font-black tracking-tight text-white font-sans text-sm">Sunpays</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            API
          </span>
        </div>
        <span className="text-[9px] text-slate-400 font-mono tracking-wider">ttpay.business</span>
      </div>
    </div>
  );
};
