import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, User, Lock, Phone, ArrowRight, Sparkles, X } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const LoginScreen: React.FC = () => {
  const { loginUser, setViewMode, setAdminAuthenticated, switchUserAccount, allUsers, theme } = useApp();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Staff passcode modal state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffPasscode, setStaffPasscode] = useState('');
  const [staffError, setStaffError] = useState('');

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
    if (existing && existing.role === 'admin') {
      loginUser(existing.phone);
      switchUserAccount(existing.id);
      setAdminAuthenticated(true);
      setViewMode('admin');
    } else if (cleanPhone === '9999999999') {
      loginUser('9999999999');
      switchUserAccount('usr-admin-001');
      setAdminAuthenticated(true);
      setViewMode('admin');
    } else if (existing) {
      loginUser(existing.phone);
      switchUserAccount(existing.id);
      setAdminAuthenticated(false);
      setViewMode('user');
    } else {
      // New or demo user
      loginUser(cleanPhone);
      switchUserAccount('usr-001');
      setAdminAuthenticated(false);
      setViewMode('user');
    }
  };

  const handleDemoUserLogin = () => {
    sounds.playSuccess();
    switchUserAccount('usr-001');
    setAdminAuthenticated(false);
    setViewMode('user');
    loginUser('9876543210');
  };

  const handleStaffAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (staffPasscode === '8888' || staffPasscode === '1234') {
      sounds.playSuccess();
      setAdminAuthenticated(true);
      switchUserAccount('usr-admin-001');
      loginUser('9999999999');
      setViewMode('admin');
      setIsStaffModalOpen(false);
      setStaffPasscode('');
      setStaffError('');
    } else {
      sounds.playError();
      setStaffError('Invalid Administrator Passcode. Access Denied.');
    }
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
          <h1 className="text-2xl font-black tracking-tight font-['Outfit']">AM invest</h1>
          <p className="text-xs text-slate-500 font-medium">Institutional Smart Investment Network</p>
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

        {/* 1-Click Fast Member Sign-In */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">
            Quick Member Access
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
        </div>

        {/* Discreet Staff Portal Trigger in Footer */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsStaffModalOpen(true);
              setStaffPasscode('');
              setStaffError('');
            }}
            className="text-[9.5px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 inline-flex items-center space-x-1 transition-colors cursor-pointer opacity-60 hover:opacity-100"
          >
            <Lock className="w-2.5 h-2.5" />
            <span>Internal Staff Clearing</span>
          </button>
        </div>
      </div>

      {/* Discreet Staff Authentication Passcode Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className={`border rounded-2xl max-w-xs w-full p-4 shadow-2xl space-y-3 relative ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Staff Clearing Gateway</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Enter Administrator Security Passcode:
            </p>

            <form onSubmit={handleStaffAuthSubmit} className="space-y-3">
              <input
                type="password"
                maxLength={8}
                value={staffPasscode}
                onChange={(e) => {
                  setStaffPasscode(e.target.value);
                  setStaffError('');
                }}
                placeholder="Passcode"
                autoFocus
                className={`w-full border rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest focus:outline-none focus:border-purple-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />

              {staffError && (
                <p className="text-[10px] text-red-500 text-center font-medium">
                  {staffError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Verify & Enter Clearing Desk
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
