import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  Package, 
  Settings, 
  FileText, 
  Smartphone, 
  AlertTriangle, 
  ShieldAlert, 
  Gift, 
  Download, 
  ChevronDown,
  Network
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const AdminHeader: React.FC = () => {
  const { 
    activeAdminTab, 
    setActiveAdminTab, 
    setViewMode, 
    transactions, 
    settings,
    fraudAlerts,
    giftCodes,
    exportDataToCsv
  } = useApp();

  const [showExportMenu, setShowExportMenu] = useState(false);

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length;
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length;
  const unresolvedAlerts = fraudAlerts.filter(a => !a.resolved).length;
  const activeGifts = giftCodes.filter(g => g.isActive).length;

  const handleTab = (tab: typeof activeAdminTab) => {
    sounds.playClick();
    setActiveAdminTab(tab);
  };

  const handleExport = (type: 'transactions' | 'users' | 'audit') => {
    setShowExportMenu(false);
    exportDataToCsv(type);
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 sticky top-16 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top bar info */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white font-['Outfit']">
                  Apex Treasury Admin Console
                </h1>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Real-Time Clearance Live
                </span>
                {settings.globalFreezeDeposits && (
                  <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full animate-pulse">
                    Deposits Frozen
                  </span>
                )}
                {settings.globalFreezeWithdrawals && (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
                    Payouts Frozen
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Secure financial transaction clearing, user management & investment plan supervisor
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 relative">
            {/* CSV Quick Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export CSV</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in space-y-1">
                  <button
                    onClick={() => handleExport('transactions')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Transactions Ledger</span>
                    <span className="text-[10px] font-mono text-slate-400">CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('users')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Users Directory</span>
                    <span className="text-[10px] font-mono text-slate-400">CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('audit')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Security Audit Logs</span>
                    <span className="text-[10px] font-mono text-slate-400">CSV</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setViewMode('user')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Preview User Mobile App</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2.5 no-scrollbar text-xs font-semibold">
          <button
            onClick={() => handleTab('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeAdminTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => handleTab('deposits')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all relative ${
              activeAdminTab === 'deposits'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>Deposit Approvals</span>
            {pendingDeposits > 0 && (
              <span className="ml-1 bg-emerald-500 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingDeposits}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTab('withdrawals')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all relative ${
              activeAdminTab === 'withdrawals'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
            <span>Withdrawal Approvals</span>
            {pendingWithdrawals > 0 && (
              <span className="ml-1 bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingWithdrawals}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTab('users')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeAdminTab === 'users'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Manager</span>
          </button>

          <button
            onClick={() => handleTab('plans')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeAdminTab === 'plans'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Plans Manager</span>
          </button>

          <button
            onClick={() => handleTab('security')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all relative ${
              activeAdminTab === 'security'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Security & Risk</span>
            {unresolvedAlerts > 0 && (
              <span className="ml-1 bg-red-500 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                {unresolvedAlerts}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTab('marketing')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all relative ${
              activeAdminTab === 'marketing'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gift className="w-4 h-4 text-pink-400" />
            <span>Marketing & Vouchers</span>
            {activeGifts > 0 && (
              <span className="ml-1 bg-pink-500/30 text-pink-300 font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                {activeGifts}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTab('affiliate')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeAdminTab === 'affiliate'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Network className="w-4 h-4 text-emerald-400" />
            <span>Affiliate & Team</span>
          </button>

          <button
            onClick={() => handleTab('settings')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeAdminTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Payment & Gateway</span>
          </button>

          <button
            onClick={() => handleTab('audit')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeAdminTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Logs</span>
          </button>
        </div>

      </div>
    </div>
  );
};
