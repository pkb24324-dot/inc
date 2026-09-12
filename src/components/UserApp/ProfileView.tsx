import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Wallet, 
  CreditCard, 
  Download, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  Building2, 
  Lock, 
  HelpCircle,
  LogOut,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  RotateCcw,
  Layers,
  Copy,
  Check,
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { RechargeModal } from './RechargeModal';
import { WithdrawModal } from './WithdrawModal';
import { TransactionType } from '../../types';
import { sounds } from '../../utils/audio';

export const ProfileView: React.FC = () => {
  const { 
    currentUser, 
    transactions, 
    setViewMode, 
    resetToDefaults,
    openRecordsModal,
    showNotification,
    theme
  } = useApp();

  const isLight = theme === 'light';

  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'dividend'>('all');
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  const userTxns = transactions.filter(t => t.userId === currentUser.id);
  const filteredTxns = historyFilter === 'all' 
    ? userTxns 
    : userTxns.filter(t => t.type === historyFilter);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(text);
    sounds.playClick();
    showNotification(`${label} copied!`, 'info');
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  return (
    <div className="pb-28 max-w-xl mx-auto px-4 pt-4 space-y-4">
      
      {/* User Header Profile Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-600/30">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-white font-['Outfit']">
                {currentUser.name}
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                VIP {currentUser.vipLevel}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              +91 {currentUser.phone}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Member ID: <span className="font-mono text-slate-400">{currentUser.id}</span> • Ref: <span className="font-mono text-amber-400 font-bold">{currentUser.referralCode}</span>
            </p>
          </div>
        </div>

        {/* Wallet Balance Cards */}
        <div className="mt-5 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[11px] text-slate-400 font-medium">Available Wallet Balance</span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                ₹{currentUser.balance.toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => openRecordsModal('all')}
              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Passbook</span>
            </button>
          </div>

          {/* Interactive Metric Gateways */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
            <button
              onClick={() => openRecordsModal('recharge')}
              className="p-1.5 rounded-xl hover:bg-slate-900/90 transition-all group text-center active:scale-95"
            >
              <span className="text-[10px] text-slate-400 block group-hover:text-blue-400">Total Recharge</span>
              <span className="font-mono font-bold text-xs text-white group-hover:text-blue-400">₹{currentUser.totalRecharge.toLocaleString()}</span>
              <span className="text-[9px] text-blue-400/80 font-bold block mt-0.5">Records &rarr;</span>
            </button>
            <button
              onClick={() => openRecordsModal('withdrawal')}
              className="p-1.5 rounded-xl hover:bg-slate-900/90 transition-all group text-center active:scale-95"
            >
              <span className="text-[10px] text-slate-400 block group-hover:text-amber-400">Total Withdrawn</span>
              <span className="font-mono font-bold text-xs text-amber-400">₹{currentUser.totalWithdrawn.toLocaleString()}</span>
              <span className="text-[9px] text-amber-400/80 font-bold block mt-0.5">Records &rarr;</span>
            </button>
            <button
              onClick={() => openRecordsModal('income')}
              className="p-1.5 rounded-xl hover:bg-slate-900/90 transition-all group text-center active:scale-95"
            >
              <span className="text-[10px] text-slate-400 block group-hover:text-emerald-400">Total Profit</span>
              <span className="font-mono font-bold text-xs text-emerald-400">₹{currentUser.totalEarned.toLocaleString()}</span>
              <span className="text-[9px] text-emerald-400/80 font-bold block mt-0.5">Records &rarr;</span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <button
              onClick={() => setIsRechargeOpen(true)}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center space-x-1.5 transition-all"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Recharge</span>
            </button>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

      </div>

      {/* Advance Records Hub (Recharge Record, Income Record, Withdrawal Record) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className={`text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 ${
            isLight ? 'text-slate-700' : 'text-slate-300'
          }`}>
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Advanced Financial Records</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">High Concurrency V2</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Recharge Record Card */}
          <button
            onClick={() => openRecordsModal('recharge')}
            className={`border rounded-2xl p-3 text-left transition-all group flex flex-col justify-between shadow-sm active:scale-98 ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-900' 
                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-blue-500/50 text-white'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black group-hover:text-blue-500 transition-colors">
                Recharge Record
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">रिचार्ज रिकॉर्ड</p>
              <div className="mt-2 text-[10px] font-mono text-blue-500 font-bold flex items-center space-x-1">
                <span>UTR & Slips</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </button>

          {/* Income Record Card */}
          <button
            onClick={() => openRecordsModal('income')}
            className={`border rounded-2xl p-3 text-left transition-all group flex flex-col justify-between shadow-sm active:scale-98 ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-400 text-slate-900' 
                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-emerald-500/50 text-white'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black group-hover:text-emerald-500 transition-colors">
                Income Record
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">इनकम रिकॉर्ड</p>
              <div className="mt-2 text-[10px] font-mono text-emerald-500 font-bold flex items-center space-x-1">
                <span>Dividends & Team</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </button>

          {/* Withdrawal Record Card */}
          <button
            onClick={() => openRecordsModal('withdrawal')}
            className={`border rounded-2xl p-3 text-left transition-all group flex flex-col justify-between shadow-sm active:scale-98 ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-400 text-slate-900' 
                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-amber-500/50 text-white'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h4 className="text-xs font-black group-hover:text-amber-500 transition-colors">
                Withdrawal Record
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">निकासी रिकॉर्ड</p>
              <div className="mt-2 text-[10px] font-mono text-amber-500 font-bold flex items-center space-x-1">
                <span>IMPS Clearance</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Account Shortcuts */}
      <div className={`border rounded-3xl p-3 shadow-md space-y-1 ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <button
          onClick={() => setIsWithdrawOpen(true)}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors text-left ${
            isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold">Bank Account / UPI</h4>
              <p className="text-[10px] text-slate-400">
                {currentUser.bankDetails ? `${currentUser.bankDetails.bankName || 'UPI'} Linked` : 'Add Payout Account'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setViewMode('admin')}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors text-left ${
            isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold">Open Advance Admin Console</h4>
              <p className="text-[10px] text-slate-400">Manage deposits, withdrawals, and users</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={resetToDefaults}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors text-left ${
            isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'
            }`}>
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Reset Demo Database</h4>
              <p className="text-[10px] text-slate-500">Restore factory sample transactions</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className={`text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 ${
            isLight ? 'text-slate-700' : 'text-slate-300'
          }`}>
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Transaction Ledger</span>
          </span>
          <button
            onClick={() => openRecordsModal(historyFilter === 'all' ? 'all' : historyFilter === 'deposit' ? 'recharge' : historyFilter === 'withdrawal' ? 'withdrawal' : 'income')}
            className="text-xs text-blue-500 hover:text-blue-600 font-bold flex items-center space-x-1"
          >
            <span>Advanced Search & Filter</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1">
          {(['all', 'deposit', 'withdrawal', 'dividend'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setHistoryFilter(filter)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all capitalize whitespace-nowrap ${
                historyFilter === filter
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isLight
                  ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter === 'deposit' ? 'Recharge' : filter === 'dividend' ? 'Income' : filter}
            </button>
          ))}
        </div>

        {/* Transaction records */}
        <div className="space-y-2">
          {filteredTxns.length === 0 ? (
            <div className={`p-6 text-center text-xs border rounded-2xl ${
              isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              No transactions in this category.
            </div>
          ) : (
            filteredTxns.map((t) => {
              const isCredit = t.type === 'deposit' || t.type === 'dividend' || t.type === 'spin_reward' || t.type === 'checkin';
              const targetTab = t.type === 'deposit' ? 'recharge' : t.type === 'withdrawal' ? 'withdrawal' : 'income';

              return (
                <div
                  key={t.id}
                  onClick={() => openRecordsModal(targetTab)}
                  className={`border rounded-2xl p-3.5 space-y-2 transition-all cursor-pointer group ${
                    isLight 
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCredit
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className={`text-xs font-bold capitalize group-hover:text-blue-500 transition-colors ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}>
                            {t.type === 'deposit' ? 'Recharge' : t.type === 'withdrawal' ? 'Withdrawal' : t.type.replace('_', ' ')}
                          </h4>
                          {t.channel && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                              isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {t.channel}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {t.description || t.id}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(t.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} • {t.id}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-mono font-bold block ${
                          isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isCredit ? '+' : '-'}₹{t.amount.toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          t.status === 'approved' || t.status === 'completed'
                            ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : t.status === 'pending'
                            ? isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>

                  {/* UTR badge if deposit */}
                  {t.type === 'deposit' && t.utrNumber && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(t.utrNumber!, 'UTR');
                      }}
                      className={`border rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] font-mono ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      <span className="text-slate-500">UTR: <span className="text-amber-600 dark:text-amber-300 font-bold">{t.utrNumber}</span></span>
                      <span className="text-blue-500 hover:text-blue-600 flex items-center space-x-1 text-[10px]">
                        {copiedUtr === t.utrNumber ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUtr === t.utrNumber ? 'Copied' : 'Copy'}</span>
                      </span>
                    </div>
                  )}

                  {/* Bank info if withdrawal */}
                  {t.type === 'withdrawal' && t.bankDetails && (
                    <div className={`border rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] font-mono ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/70 border-slate-800 text-slate-300'
                    }`}>
                      <span>Payout: <span className="font-bold">{t.bankDetails.bankName || 'IMPS Payout'} (•••• {t.bankDetails.accountNumber?.slice(-4) || 'UPI'})</span></span>
                      {t.rrn && <span className="text-amber-600 dark:text-amber-300 text-[10px]">RRN: {t.rrn}</span>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
      />
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
      />

    </div>
  );
};
