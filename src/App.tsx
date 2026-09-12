import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/UserApp/HomeView';
import { SpinWheelView } from './components/UserApp/SpinWheelView';
import { TreasureView } from './components/UserApp/TreasureView';
import { TeamView } from './components/UserApp/TeamView';
import { ProfileView } from './components/UserApp/ProfileView';
import { BottomNav } from './components/UserApp/BottomNav';
import { AdminPanel } from './components/AdminPanel/AdminPanel';
import { FinancialRecordsModal } from './components/UserApp/FinancialRecordsModal';
import { Lock, ShieldCheck, KeyRound, Sparkles, ArrowRight } from 'lucide-react';
import { sounds } from './utils/audio';

const MainApp: React.FC = () => {
  const { 
    viewMode, 
    activeUserTab, 
    adminAuthenticated, 
    setAdminAuthenticated, 
    setViewMode,
    recordsModalOpen,
    recordsDefaultTab,
    closeRecordsModal,
    theme
  } = useApp();

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '8888' || pin === '1234') {
      sounds.playSuccess();
      setAdminAuthenticated(true);
      setPin('');
      setPinError('');
    } else {
      sounds.playError();
      setPinError('Incorrect Admin Passcode. Default master key is 8888');
    }
  };

  const handleQuickUnlock = () => {
    sounds.playSuccess();
    setAdminAuthenticated(true);
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'} flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-200`}>
      {/* Top Universal Navbar */}
      <Navbar />

      {/* View Router */}
      {viewMode === 'user' ? (
        <div className="flex-1 flex flex-col">
          {/* Main User App Container */}
          <main className="flex-1">
            {activeUserTab === 'home' && <HomeView />}
            {activeUserTab === 'spin' && <SpinWheelView />}
            {activeUserTab === 'treasure' && <TreasureView />}
            {activeUserTab === 'team' && <TeamView />}
            {activeUserTab === 'profile' && <ProfileView />}
          </main>

          {/* User Bottom Navigation Bar */}
          <BottomNav />

          {/* Scalable High-Performance Financial Records Modal */}
          <FinancialRecordsModal 
            isOpen={recordsModalOpen} 
            onClose={closeRecordsModal} 
            defaultTab={recordsDefaultTab} 
          />
        </div>
      ) : (
        /* Admin Mode */
        !adminAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95">
              
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-amber-500/20">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  Restricted Treasury Gateway
                </span>
                <h2 className="text-2xl font-black text-white font-['Outfit'] mt-2">
                  Admin Verification Required
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter master security key to clear pending transactions, manage liquid reserves & oversee accounts.
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    placeholder="Enter Master PIN (8888)"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-center text-lg font-mono text-white tracking-widest focus:outline-none focus:border-amber-500"
                  />
                </div>

                {pinError && (
                  <p className="text-xs text-red-400 font-semibold">{pinError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Open Admin Panel</span>
                </button>
              </form>

              {/* 1-Click Fast Pass */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <button
                  onClick={handleQuickUnlock}
                  className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center justify-center space-x-1 mx-auto font-bold py-1.5 px-3 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Test Access: Unlock with Master PIN 8888</span>
                </button>

                <div>
                  <button
                    onClick={() => setViewMode('user')}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    &larr; Return to Member App
                  </button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <AdminPanel />
        )
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
