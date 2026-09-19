import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  X, 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Package, 
  ShieldAlert, 
  Gift, 
  Network, 
  Settings, 
  FileText, 
  LayoutDashboard, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  Smartphone, 
  DollarSign, 
  UserCheck, 
  Check, 
  Copy,
  ChevronRight,
  Radio
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBroadcast?: () => void;
  onOpenBackup?: () => void;
}

export const AdminCommandPalette: React.FC<AdminCommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenBroadcast,
  onOpenBackup
}) => {
  const { 
    setActiveAdminTab, 
    setViewMode, 
    allUsers, 
    transactions, 
    plans,
    settings, 
    saveSettings,
    triggerGlobalDividendRun, 
    triggerGlobalCommissionRebateRun, 
    exportDataToCsv, 
    showNotification,
    switchUserAccount,
    toggleUserFrozen,
    adjustUserBalance,
    theme
  } = useApp();

  const isLight = theme === 'light';
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  // Search results
  const navItems = [
    { id: 'dashboard', label: 'Executive Cockpit / Overview', icon: LayoutDashboard, category: 'Navigation' },
    { id: 'deposits', label: 'Deposit Recharges & UTR Clearance', icon: ArrowDownLeft, category: 'Navigation' },
    { id: 'withdrawals', label: 'Withdrawal Approvals & IMPS Payouts', icon: ArrowUpRight, category: 'Navigation' },
    { id: 'users', label: 'User Directory & Account Balances', icon: Users, category: 'Navigation' },
    { id: 'plans', label: 'Investment Plans & ROI Configuration', icon: Package, category: 'Navigation' },
    { id: 'security', label: 'Security & Anti-Fraud Surveillance', icon: ShieldAlert, category: 'Navigation' },
    { id: 'marketing', label: 'Gift Vouchers & Promotions', icon: Gift, category: 'Navigation' },
    { id: 'affiliate', label: 'Affiliate Multipliers & Promoters', icon: Network, category: 'Navigation' },
    { id: 'settings', label: 'Payment Gateways (Sunpays & WatchPay)', icon: Settings, category: 'Navigation' },
    { id: 'audit', label: 'System Compliance & Audit Trail', icon: FileText, category: 'Navigation' }
  ].filter(item => !cleanQuery || item.label.toLowerCase().includes(cleanQuery));

  const matchedUsers = allUsers.filter(u => 
    !cleanQuery ? false : (
      u.name.toLowerCase().includes(cleanQuery) ||
      u.phone.includes(cleanQuery) ||
      u.id.toLowerCase().includes(cleanQuery) ||
      u.referralCode.toLowerCase().includes(cleanQuery)
    )
  ).slice(0, 5);

  const matchedTxns = transactions.filter(t => 
    !cleanQuery ? false : (
      (t.utrNumber && t.utrNumber.toLowerCase().includes(cleanQuery)) ||
      (t.orderId && t.orderId.toLowerCase().includes(cleanQuery)) ||
      (t.rrn && t.rrn.toLowerCase().includes(cleanQuery)) ||
      t.userPhone.includes(cleanQuery)
    )
  ).slice(0, 4);

  const handleSelectTab = (tabId: any) => {
    sounds.playClick();
    setActiveAdminTab(tabId);
    onClose();
  };

  const handleLoginAsUser = (userId: string) => {
    sounds.playClick();
    switchUserAccount(userId);
    setViewMode('user');
    onClose();
  };

  return (
    <div 
      id="admin-command-palette-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 sm:pt-20 animate-in fade-in duration-150"
    >
      <div 
        id="admin-command-palette-modal"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all animate-in zoom-in-95 duration-150 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Search Header */}
        <div className={`p-4 border-b flex items-center space-x-3 ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/70'
        }`}>
          <Search className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search user by phone/name, or search UTR..."
            className="flex-1 bg-transparent text-sm sm:text-base outline-hidden font-medium placeholder:text-slate-400"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 no-scrollbar text-xs">
          
          {/* Quick Actions Bar */}
          {!cleanQuery && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                ⚡ Instant Administrative Powers
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    sounds.playCash();
                    const res = triggerGlobalDividendRun();
                    showNotification(`⚡ Settled ${res.processedCount} user contracts (+₹${res.totalDistributed.toLocaleString()})`, 'success');
                    onClose();
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2.5 transition-all hover:border-emerald-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:bg-emerald-50' : 'bg-slate-950 border-slate-800 hover:bg-emerald-950/20'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Force Dividend Run</div>
                    <div className="text-[10px] text-slate-400">Credit all active daily returns</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    sounds.playCash();
                    const res = triggerGlobalCommissionRebateRun();
                    showNotification(`⚡ Disbursed agency rebate to ${res.processedCount} promoters (+₹${res.totalDistributed.toLocaleString()})`, 'success');
                    onClose();
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2.5 transition-all hover:border-indigo-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:bg-indigo-50' : 'bg-slate-950 border-slate-800 hover:bg-indigo-950/20'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Network className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Sweep Team Rebates</div>
                    <div className="text-[10px] text-slate-400">Process multi-tier commissions</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    sounds.playClick();
                    saveSettings({ globalFreezeDeposits: !settings.globalFreezeDeposits });
                    showNotification(`Recharges ${!settings.globalFreezeDeposits ? 'FROZEN' : 'ACTIVE'}`, 'info');
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                    settings.globalFreezeDeposits 
                      ? 'border-red-500 bg-red-500/10' 
                      : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${settings.globalFreezeDeposits ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400'}`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {settings.globalFreezeDeposits ? 'Unfreeze Recharges' : 'Emergency Freeze Recharges'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {settings.globalFreezeDeposits ? 'Recharges are currently paused' : 'Halt all member deposits'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    sounds.playClick();
                    saveSettings({ globalFreezeWithdrawals: !settings.globalFreezeWithdrawals });
                    showNotification(`Withdrawals ${!settings.globalFreezeWithdrawals ? 'FROZEN' : 'ACTIVE'}`, 'info');
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                    settings.globalFreezeWithdrawals 
                      ? 'border-amber-500 bg-amber-500/10' 
                      : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${settings.globalFreezeWithdrawals ? 'bg-amber-500 text-slate-950' : 'bg-amber-500/20 text-amber-400'}`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {settings.globalFreezeWithdrawals ? 'Unfreeze Payouts' : 'Emergency Freeze Payouts'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {settings.globalFreezeWithdrawals ? 'Payouts are currently paused' : 'Lock outgoing withdrawals'}
                    </div>
                  </div>
                </button>

                {onOpenBroadcast && (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onClose();
                      onOpenBroadcast();
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2.5 transition-all hover:border-pink-500 ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-pink-50' : 'bg-slate-950 border-slate-800 hover:bg-pink-950/20'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                      <Radio className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Broadcast Notice</div>
                      <div className="text-[10px] text-slate-400">Post banner notice to all user apps</div>
                    </div>
                  </button>
                )}

                {onOpenBackup && (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onClose();
                      onOpenBackup();
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2.5 transition-all hover:border-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-blue-50' : 'bg-slate-950 border-slate-800 hover:bg-blue-950/20'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Download className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Database Backup / Restore</div>
                      <div className="text-[10px] text-slate-400">Export or import full JSON snapshot</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Matched Users Section */}
          {matchedUsers.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
                <span>Matched Users ({matchedUsers.length})</span>
                <span className="text-[9px]">Tap to inspect or preview</span>
              </div>
              <div className="space-y-1">
                {matchedUsers.map(user => (
                  <div
                    key={user.id}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-900 dark:text-white truncate">{user.name}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            VIP {user.vipLevel}
                          </span>
                          {user.isFrozen && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400">
                              FROZEN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {user.phone} • Balance: ₹{user.balance.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setActiveAdminTab('users');
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => handleLoginAsUser(user.id)}
                        className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center space-x-1 shadow-xs"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Login As</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Transactions Section */}
          {matchedTxns.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Matched Transactions ({matchedTxns.length})
              </div>
              <div className="space-y-1">
                {matchedTxns.map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      sounds.playClick();
                      setActiveAdminTab(t.type === 'deposit' ? 'deposits' : 'withdrawals');
                      onClose();
                    }}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        t.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {t.type === 'deposit' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {t.type.toUpperCase()}: ₹{t.amount.toLocaleString()} ({t.userName})
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          UTR: {t.utrNumber || t.orderId || t.id}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      t.status === 'completed' || t.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : t.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
              Console Navigation Modules
            </div>
            <div className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                      isLight 
                        ? 'bg-slate-50 hover:bg-blue-50 border-slate-200 hover:border-blue-300' 
                        : 'bg-slate-950/40 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className={`p-3 border-t text-[11px] text-slate-400 flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
        }`}>
          <span>⚡ AM invest Command Deck • Instant Platform Telemetry</span>
          <span className="hidden sm:inline font-mono">Press Esc to exit</span>
        </div>
      </div>
    </div>
  );
};
