import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, User, Lock, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const LoginScreen: React.FC = () => {
  const { loginUser, setViewMode, setAdminAuthenticated, switchUserAccount, allUsers, theme } = useApp();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isLight = theme === 'light';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      sounds.playError();
      return;
    }

    sounds.playSuccess();
    const existing = allUsers.find(u => u.phone === cleanPhone);
    if (existing) {
      loginUser(existing.phone);
    } else {
      // Default to demo user
      loginUser('9876543210');
    }
  };

  const handleDemoUserLogin = () => {
    sounds.playSuccess();
    switchUserAccount('usr-001');
    setViewMode('user');
    loginUser('9876543210');
  };

  const handleAdminLogin = () => {
    sounds.playSuccess();
    setAdminAuthenticated(true);
    switchUserAccount('usr-admin-001');
    loginUser('9999999999');
    setViewMode('admin');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      <div className={`max-w-sm w-full rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight font-['Outfit']">ApexFund</h1>
          <p className="text-xs text-slate-500 font-medium">Institutional High-Yield Trading Network</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Mobile Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError('');
                }}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Password / Security PIN</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                maxLength={8}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Sign In to Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Fast Sign-In Options */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">
            Quick 1-Click Access
          </span>

          <button
            type="button"
            onClick={handleDemoUserLogin}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              isLight 
                ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100' 
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-500" />
            <span>Login as Member (Manish Pandey)</span>
          </button>

          <button
            type="button"
            onClick={handleAdminLogin}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              isLight 
                ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' 
                : 'bg-purple-950/30 border-purple-500/40 text-purple-300 hover:bg-purple-900/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Direct Admin Access (Master Admin)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
