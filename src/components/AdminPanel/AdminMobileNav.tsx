import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  Sliders, 
  X, 
  Package, 
  ShieldAlert, 
  Gift, 
  Network, 
  Settings, 
  FileText, 
  Search, 
  Radio, 
  Download, 
  Smartphone,
  ChevronUp,
  Zap,
  TrendingUp,
  Landmark
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface AdminMobileNavProps {
  onOpenCommandPalette: () => void;
  onOpenBroadcast: () => void;
  onOpenBackup: () => void;
}

export const AdminMobileNav: React.FC<AdminMobileNavProps> = ({
  onOpenCommandPalette,
  onOpenBroadcast,
  onOpenBackup
}) => {
  const { 
    activeAdminTab, 
    setActiveAdminTab, 
    setViewMode, 
    transactions, 
    fraudAlerts, 
    giftCodes,
    theme 
  } = useApp();

  const isLight = theme === 'light';
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length;
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length;
  const unresolvedAlerts = fraudAlerts.filter(a => !a.resolved).length;
  const activeGifts = giftCodes.filter(g => g.isActive).length;

  const handleNav = (tab: any) => {
    sounds.playClick();
    setActiveAdminTab(tab);
    setIsMoreSheetOpen(false);
  };

  const moreModules = [
    { id: 'treasury', label: 'Treasury & Liquidity', icon: Landmark, color: 'text-emerald-400' },
    { id: 'plans', label: 'Plans & Returns', icon: Package, color: 'text-purple-400' },
    { 
      id: 'security', 
      label: 'Security & Risk', 
      icon: ShieldAlert, 
      color: 'text-rose-400', 
      badge: unresolvedAlerts > 0 ? unresolvedAlerts : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    { 
      id: 'marketing', 
      label: 'Vouchers & Gifts', 
      icon: Gift, 
      color: 'text-pink-400',
      badge: activeGifts > 0 ? activeGifts : undefined,
      badgeColor: 'bg-pink-500 text-white'
    },
    { id: 'affiliate', label: 'Affiliates & Team', icon: Network, color: 'text-teal-400' },
    { id: 'settings', label: 'Gateways & Settings', icon: Settings, color: 'text-amber-400' },
    { id: 'audit', label: 'Audit Trail', icon: FileText, color: 'text-slate-400' },
  ];

  return (
    <>
      {/* Backdrop for More Sheet */}
      {isMoreSheetOpen && (
        <div 
          onClick={() => setIsMoreSheetOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      {/* Slide-up "More Admin Modules" Bottom Sheet */}
      <div 
        className={`fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl border-t shadow-2xl p-5 md:hidden transition-transform duration-300 ease-out ${
          isMoreSheetOpen ? 'translate-y-0' : 'translate-y-full'
        } ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'}`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm font-['Outfit']">Administrative Modules</h3>
              <p className="text-[10px] text-slate-400">Select an executive tool or fast action</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMoreSheetOpen(false)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search & Actions Strip */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <button
            onClick={() => {
              setIsMoreSheetOpen(false);
              onOpenCommandPalette();
            }}
            className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex flex-col items-center justify-center text-center text-blue-500 active:scale-95 transition-transform"
          >
            <Search className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-bold">Command (⌘K)</span>
          </button>

          <button
            onClick={() => {
              setIsMoreSheetOpen(false);
              onOpenBroadcast();
            }}
            className="p-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/25 flex flex-col items-center justify-center text-center text-pink-500 active:scale-95 transition-transform"
          >
            <Radio className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-bold">Broadcast</span>
          </button>

          <button
            onClick={() => {
              setIsMoreSheetOpen(false);
              onOpenBackup();
            }}
            className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col items-center justify-center text-center text-emerald-500 active:scale-95 transition-transform"
          >
            <Download className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-bold">Backup JSON</span>
          </button>
        </div>

        {/* Grid of Secondary Modules */}
        <div className="grid grid-cols-2 gap-2 max-h-[45vh] overflow-y-auto no-scrollbar pb-3">
          {moreModules.map(mod => {
            const Icon = mod.icon;
            const isActive = activeAdminTab === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => handleNav(mod.id)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-md shadow-blue-600/30' 
                    : isLight 
                    ? 'bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : mod.color}`} />
                  <span className="text-xs">{mod.label}</span>
                </div>
                {mod.badge !== undefined && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Switch to User View Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setViewMode('user');
          }}
          className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2"
        >
          <Smartphone className="w-4 h-4" />
          <span>Exit to User Mobile App Preview</span>
        </button>
      </div>

      {/* Main Bottom Dock (Mobile Only) */}
      <nav 
        id="admin-mobile-dock"
        className={`fixed bottom-0 left-0 right-0 z-30 md:hidden border-t px-2 py-2 flex items-center justify-around backdrop-blur-md transition-colors ${
          isLight 
            ? 'bg-white/95 border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]' 
            : 'bg-slate-900/95 border-slate-800 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Overview / Dashboard */}
        <button
          onClick={() => handleNav('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
            activeAdminTab === 'dashboard'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Overview</span>
        </button>

        {/* Deposits */}
        <button
          onClick={() => handleNav('deposits')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
            activeAdminTab === 'deposits'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] mt-0.5">Deposits</span>
          {pendingDeposits > 0 && (
            <span className="absolute -top-0.5 right-3 bg-emerald-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {pendingDeposits > 99 ? '99+' : pendingDeposits}
            </span>
          )}
        </button>

        {/* Withdrawals */}
        <button
          onClick={() => handleNav('withdrawals')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
            activeAdminTab === 'withdrawals'
              ? 'text-amber-500 dark:text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpRight className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] mt-0.5">Payouts</span>
          {pendingWithdrawals > 0 && (
            <span className="absolute -top-0.5 right-3 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {pendingWithdrawals > 99 ? '99+' : pendingWithdrawals}
            </span>
          )}
        </button>

        {/* Users */}
        <button
          onClick={() => handleNav('users')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
            activeAdminTab === 'users'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5 text-indigo-400" />
          <span className="text-[10px] mt-0.5">Users</span>
        </button>

        {/* More Menu */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsMoreSheetOpen(true);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
            isMoreSheetOpen || !['dashboard', 'deposits', 'withdrawals', 'users'].includes(activeAdminTab)
              ? 'text-purple-600 dark:text-purple-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-5 h-5 text-purple-400" />
          <span className="text-[10px] mt-0.5">More</span>
          {unresolvedAlerts > 0 && (
            <span className="absolute top-0 right-4 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>
      </nav>
    </>
  );
};
