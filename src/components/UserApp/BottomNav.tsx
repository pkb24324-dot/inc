import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  Gift, 
  Zap, 
  Users, 
  User 
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const BottomNav: React.FC = () => {
  const { activeUserTab, setActiveUserTab, currentUser, userInvestments, theme } = useApp();
  const isLight = theme === 'light';

  const activeInvestmentsCount = userInvestments.filter(i => i.status === 'active' && i.canClaimToday).length;

  const handleTab = (tab: 'home' | 'spin' | 'treasure' | 'team' | 'profile') => {
    sounds.playClick();
    setActiveUserTab(tab);
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t transition-colors ${
      isLight 
        ? 'bg-white/95 border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]' 
        : 'bg-slate-900/95 border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]'
    }`}>
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between relative">
        
        {/* Home */}
        <button
          onClick={() => handleTab('home')}
          className={`flex-1 flex flex-col items-center justify-center transition-colors active:scale-95 cursor-pointer ${
            activeUserTab === 'home' 
              ? 'text-blue-600 font-bold' 
              : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-4.5 h-4.5" />
          <span className="text-[10px] font-semibold mt-0.5">Home</span>
        </button>

        {/* Spin / Lucky Wheel */}
        <button
          onClick={() => handleTab('spin')}
          className={`flex-1 flex flex-col items-center justify-center transition-colors active:scale-95 relative cursor-pointer ${
            activeUserTab === 'spin' 
              ? 'text-blue-600 font-bold' 
              : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {currentUser.spinChances > 0 && (
            <span className="absolute top-1 right-3.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
          <Gift className="w-4.5 h-4.5" />
          <span className="text-[10px] font-semibold mt-0.5">Spin</span>
        </button>

        {/* Center Floating Action: Treasure (Active Profit Vault) */}
        <div className="relative -top-4 flex-shrink-0 flex items-center justify-center px-2">
          <button
            onClick={() => handleTab('treasure')}
            className={`w-13 h-13 rounded-full btn-gem-orb flex flex-col items-center justify-center text-white border-4 transition-all active:scale-90 cursor-pointer ${
              isLight ? 'border-white ring-2 ring-blue-200' : 'border-slate-900 ring-1 ring-blue-500/50'
            } ${
              activeUserTab === 'treasure' ? 'ring-2 ring-blue-400 scale-110 shadow-blue-500/60' : 'hover:scale-105'
            }`}
          >
            <Zap className="w-5.5 h-5.5 fill-white text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
            {activeInvestmentsCount > 0 && (
              <span className={`absolute -top-1 -right-1 bg-emerald-400 text-slate-950 font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 shadow-md shadow-emerald-500/50 animate-pulse ${
                isLight ? 'border-white' : 'border-slate-900'
              }`}>
                {activeInvestmentsCount}
              </span>
            )}
          </button>
        </div>

        {/* Team */}
        <button
          onClick={() => handleTab('team')}
          className={`flex-1 flex flex-col items-center justify-center transition-colors active:scale-95 cursor-pointer ${
            activeUserTab === 'team' 
              ? 'text-blue-600 font-bold' 
              : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          <span className="text-[10px] font-semibold mt-0.5">Team</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => handleTab('profile')}
          className={`flex-1 flex flex-col items-center justify-center transition-colors active:scale-95 cursor-pointer ${
            activeUserTab === 'profile' 
              ? 'text-blue-600 font-bold' 
              : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4.5 h-4.5" />
          <span className="text-[10px] font-semibold mt-0.5">Profile</span>
        </button>

      </div>
    </nav>
  );
};
