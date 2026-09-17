import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Smartphone, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  TrendingUp
} from 'lucide-react';
import { ProfessionalAmount } from './common/ProfessionalAmount';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    viewMode, 
    setViewMode, 
    notification,
    settings
  } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-13">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-xs tracking-tighter flex-shrink-0 font-['Outfit'] border border-white/20">
              AM
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm sm:text-[15px] tracking-tight text-white font-['Outfit']">
                  {settings.platformName}
                </span>
                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {viewMode === 'admin' ? 'ADMIN' : 'INVEST'}
                </span>
              </div>
              <p className="text-[8.5px] text-slate-400 hidden md:block -mt-0.5 leading-tight">
                {viewMode === 'admin' ? 'Financial Clearing Desk' : 'Verified Capital Platform'}
              </p>
            </div>
          </div>

          {/* Center Info / User Balance in user mode */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {viewMode === 'user' ? (
              <div className="flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700/60 rounded-full px-2.5 py-1 shadow-inner">
                <Wallet className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <div className="text-[10.5px] font-medium text-slate-300 flex items-center space-x-1">
                  <span>Balance:</span>
                  <ProfessionalAmount
                    amount={currentUser.balance}
                    size="xs"
                    color="emerald"
                    showDecimals={true}
                  />
                </div>
                <div className="h-2.5 w-px bg-slate-700" />
                <span className="text-[9px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded-full">
                  VIP {currentUser.vipLevel}
                </span>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-full px-2.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-medium text-emerald-300">Gateway Online</span>
              </div>
            )}

            {/* Back to User App Button (Visible ONLY when in Admin Mode) */}
            {viewMode === 'admin' && (
              <button
                id="role-switch-btn"
                onClick={() => setViewMode('user')}
                className="relative flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 active:scale-95 transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">User App</span>
                <span className="sm:hidden">App</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Real-time Notification Banner */}
      {notification && (
        <div 
          className={`px-4 py-2.5 text-xs font-medium flex items-center justify-between transition-all duration-300 border-b ${
            notification.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800' 
              : notification.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-800'
              : 'bg-blue-950/90 text-blue-200 border-blue-800'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center space-x-2 w-full">
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />}
            <span className="truncate">{notification.message}</span>
          </div>
        </div>
      )}
    </header>
  );
};
