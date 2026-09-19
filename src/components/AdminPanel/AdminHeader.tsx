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
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Search,
  Radio,
  Database,
  Activity,
  Zap,
  Globe,
  Landmark
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onOpenCommandPalette?: () => void;
  onOpenBroadcast?: () => void;
  onOpenBackup?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  onOpenMobileSidebar,
  isSidebarCollapsed = false,
  onOpenCommandPalette,
  onOpenBroadcast,
  onOpenBackup
}) => {
  const { 
    activeAdminTab, 
    setActiveAdminTab, 
    setViewMode, 
    transactions, 
    settings,
    fraudAlerts,
    giftCodes,
    exportDataToCsv,
    allUsers,
    theme
  } = useApp();

  const isLight = theme === 'light';
  const [showExportMenu, setShowExportMenu] = useState(false);

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length;
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length;
  const unresolvedAlerts = fraudAlerts.filter(a => !a.resolved).length;
  const activeGifts = giftCodes.filter(g => g.isActive).length;

  // Real-time Solvency calculation
  const completedDeposits = transactions
    .filter(t => t.type === 'deposit' && (t.status === 'approved' || t.status === 'completed'))
    .reduce((acc, t) => acc + t.amount, 0);
  const completedWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);
  const netReserve = completedDeposits - completedWithdrawals;
  const totalUserLiabilities = allUsers.reduce((sum, u) => sum + u.balance, 0);
  const solvencyRatio = totalUserLiabilities > 0 
    ? Math.round((netReserve / totalUserLiabilities) * 100) 
    : 100;

  const handleTab = (tab: typeof activeAdminTab) => {
    sounds.playClick();
    setActiveAdminTab(tab);
  };

  const handleExport = (type: 'transactions' | 'users' | 'audit') => {
    setShowExportMenu(false);
    exportDataToCsv(type);
  };

  return (
    <header className={`border-b sticky top-12 z-30 shadow-lg transition-colors ${
      isLight ? 'bg-white/95 border-slate-200 backdrop-blur-md' : 'bg-slate-900/95 border-slate-800 backdrop-blur-md'
    }`}>
      <div className="w-full px-3 sm:px-6 lg:px-8">
        
        {/* Top Control Bar */}
        <div className="py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80">
          
          {/* Left section: Sidebar toggle + Brand + Badges */}
          <div className="flex items-center space-x-2.5 min-w-0">
            {/* Mobile Drawer Trigger */}
            {onOpenMobileSidebar && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenMobileSidebar();
                }}
                className={`md:hidden p-2 rounded-xl border flex items-center justify-center cursor-pointer active:scale-95 transition-all ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Toggle Navigation Menu"
              >
                <Menu className="w-4 h-4 text-blue-500" />
              </button>
            )}

            {/* Desktop Sidebar Collapse Button */}
            {onToggleSidebar && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onToggleSidebar();
                }}
                className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                    : 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border-slate-700'
                }`}
                title={isSidebarCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Navigation Sidebar'}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-blue-400" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-[11px] font-mono font-bold hidden lg:inline">
                  {isSidebarCollapsed ? 'Expand' : 'Collapse'}
                </span>
              </button>
            )}

            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold flex-shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] truncate">
                  {settings.platformName || 'AM invest'} Admin
                </h1>
                
                {/* Live Solvency Indicator */}
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border flex items-center space-x-1 ${
                  solvencyRatio >= 100 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden xs:inline font-mono">Solvency: {solvencyRatio}%</span>
                </span>

                {/* Circuit Breaker Alerts */}
                {settings.globalFreezeDeposits && (
                  <span className="text-[9px] font-bold bg-red-500/20 text-red-500 border border-red-500/30 px-1.5 py-0.5 rounded-md animate-pulse">
                    Recharges Frozen
                  </span>
                )}
                {settings.globalFreezeWithdrawals && (
                  <span className="text-[9px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded-md animate-pulse">
                    Payouts Frozen
                  </span>
                )}
                {settings.maintenanceMode && (
                  <span className="text-[9px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded-md">
                    Maintenance
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right section: Command Search + Broadcast + Backup + Export + Mobile App Preview */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* Quick Command Palette Trigger (Desktop & Mobile) */}
            {onOpenCommandPalette && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenCommandPalette();
                }}
                className={`flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs transition-all ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Open Command Spotlight (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span className="hidden sm:inline font-medium">Quick Search / Cmd</span>
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono font-bold rounded border border-slate-300 dark:border-slate-600 text-slate-400">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Broadcast Notice Trigger */}
            {onOpenBroadcast && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenBroadcast();
                }}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  isLight 
                    ? 'bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200' 
                    : 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border-pink-500/30'
                }`}
                title="Live User App Broadcast Notice"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-pink-500" />
                <span className="hidden md:inline">Broadcast</span>
              </button>
            )}

            {/* Backup & Disaster Recovery Trigger */}
            {onOpenBackup && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenBackup();
                }}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  isLight 
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' 
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}
                title="System Database Backup & Restore JSON"
              >
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden md:inline">Backup JSON</span>
              </button>
            )}

            {/* CSV Quick Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Export Data to CSV"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">CSV</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showExportMenu && (
                <div className={`absolute right-0 mt-1 w-48 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in space-y-1 border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
                }`}>
                  <button
                    onClick={() => handleExport('transactions')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-blue-600 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Transactions Ledger</span>
                    <span className="text-[10px] font-mono opacity-70">CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('users')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-blue-600 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Users Directory</span>
                    <span className="text-[10px] font-mono opacity-70">CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('audit')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-blue-600 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Security Audit Logs</span>
                    <span className="text-[10px] font-mono opacity-70">CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* Preview User Mobile App Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setViewMode('user');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all"
              title="Open User Interface in Phone Frame"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">User App</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs Strip */}
        <div className="flex space-x-1 overflow-x-auto py-2.5 no-scrollbar text-xs font-semibold">
          <button
            onClick={() => handleTab('dashboard')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeAdminTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => handleTab('deposits')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all relative ${
              activeAdminTab === 'deposits'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all relative ${
              activeAdminTab === 'withdrawals'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
            onClick={() => handleTab('treasury')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all relative ${
              activeAdminTab === 'treasury'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Landmark className="w-4 h-4 text-emerald-400" />
            <span>Treasury & Liquidity</span>
          </button>

          <button
            onClick={() => handleTab('users')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeAdminTab === 'users'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>User Manager</span>
          </button>

          <button
            onClick={() => handleTab('plans')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeAdminTab === 'plans'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4 text-purple-400" />
            <span>Plans Manager</span>
          </button>

          <button
            onClick={() => handleTab('security')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all relative ${
              activeAdminTab === 'security'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all relative ${
              activeAdminTab === 'marketing'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeAdminTab === 'affiliate'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Network className="w-4 h-4 text-teal-400" />
            <span>Affiliate & Team</span>
          </button>

          <button
            onClick={() => handleTab('settings')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeAdminTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4 text-amber-300" />
            <span>Gateway & Config</span>
          </button>

          <button
            onClick={() => handleTab('audit')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeAdminTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>

      </div>
    </header>
  );
};
