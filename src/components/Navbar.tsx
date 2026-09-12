import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Smartphone, 
  Bell, 
  Wallet, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  TrendingUp,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    viewMode, 
    setViewMode, 
    transactions, 
    notification,
    settings,
    theme,
    toggleTheme 
  } = useApp();

  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length;
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length;
  const totalPending = pendingDeposits + pendingWithdrawals;

  const handleAdminClick = () => {
    if (viewMode === 'admin') {
      setViewMode('user');
    } else {
      // Toggle to admin
      setViewMode('admin');
    }
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '8888' || pinInput === '1234') {
      setShowAdminPinModal(false);
      setViewMode('admin');
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Invalid Admin Key. Default is 8888');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-['Outfit']">
                  {settings.platformName.split(' ')[0]}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {viewMode === 'admin' ? 'ADMIN CONSOLE' : 'INVEST'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                {viewMode === 'admin' ? 'Real-Time Financial Clearing Desk' : 'Verified Income & Capital Platform'}
              </p>
            </div>
          </div>

          {/* Center Info / User Balance in user mode */}
          <div className="flex items-center space-x-3">
            {viewMode === 'user' ? (
              <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-full px-3.5 py-1.5 shadow-inner">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <div className="text-xs font-medium text-slate-300">
                  Balance: <span className="font-bold text-emerald-400 font-mono text-sm">₹{currentUser.balance.toLocaleString()}</span>
                </div>
                <div className="h-3 w-px bg-slate-700" />
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                  VIP {currentUser.vipLevel}
                </span>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2 bg-emerald-950/40 border border-emerald-500/30 rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-300">Live Gateway Online</span>
              </div>
            )}

            {/* Dark / Light Theme Mode Toggle Button */}
            <button
              id="theme-toggle-navbar"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700/80 shadow-inner'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200 shadow-sm'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 animate-[spin_10s_linear_infinite]" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Mode Switcher Toggle Button */}
            <button
              id="role-switch-btn"
              onClick={handleAdminClick}
              className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                viewMode === 'admin'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-orange-500/20'
              }`}
            >
              {viewMode === 'admin' ? (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">User App View</span>
                  <span className="sm:hidden">User App</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Advance Admin Panel</span>
                  <span className="sm:hidden">Admin</span>
                  {totalPending > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-slate-900 animate-bounce">
                      {totalPending}
                    </span>
                  )}
                </>
              )}
            </button>
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

      {/* Admin PIN Dialog (If required) */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Admin Security Access</h3>
                <p className="text-xs text-slate-400">Enter master passcode to unlock</p>
              </div>
            </div>

            <form onSubmit={verifyPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  placeholder="Master PIN (Default: 8888)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-lg font-mono text-white tracking-widest focus:outline-none focus:border-amber-500"
                />
                {pinError && <p className="text-xs text-red-400 mt-1.5">{pinError}</p>}
                <p className="text-[11px] text-slate-500 mt-2 text-center">Demo key: <code className="text-amber-400">8888</code></p>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAdminPinModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
                >
                  Unlock Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
