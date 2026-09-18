import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  CreditCard, 
  Building2, 
  Smartphone, 
  ShieldCheck, 
  Share2, 
  FileText, 
  Layers, 
  ChevronRight,
  Zap,
  Users,
  Gift,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
  Table as TableIcon,
  LayoutList,
  BarChart3,
  HelpCircle,
  Percent,
  CalendarRange,
  ArrowRight,
  Printer
} from 'lucide-react';
import { Transaction, RecordCategory } from '../../types';
import { sounds } from '../../utils/audio';
import { TransactionSlipModal } from './records/TransactionSlipModal';
import { OfficialStatementModal } from './records/OfficialStatementModal';
import { RecordsAnalytics } from './records/RecordsAnalytics';
import { PassbookTableView } from './records/PassbookTableView';
import { DelayedUtrAssistant } from './records/DelayedUtrAssistant';
import { DepositTrendsChart } from './records/DepositTrendsChart';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: RecordCategory;
}

export const FinancialRecordsModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'recharge' 
}) => {
  const { 
    currentUser, 
    transactions, 
    showNotification,
    theme 
  } = useApp();

  const isLight = theme === 'light';

  // Active Category Tab: 'recharge' | 'income' | 'withdrawal' | 'all'
  const [activeTab, setActiveTab] = useState<RecordCategory>(defaultTab);

  // View mode: 'stream' (cards) | 'passbook' (bank table) | 'analytics' (cashflow insights)
  const [viewMode, setViewMode] = useState<'stream' | 'passbook' | 'analytics'>('stream');

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'rejected'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | '7days' | '30days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);

  const [incomeTypeFilter, setIncomeTypeFilter] = useState<'all' | 'dividend' | 'flash' | 'referral' | 'reward'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');

  // Modals & UI States
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [showUtrHelper, setShowUtrHelper] = useState(false);
  const [showTrendChart, setShowTrendChart] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // 1. Calculate Chronological Running Ledger Balances
  const userTransactionsWithBalance = useMemo(() => {
    // Sort transactions chronologically (oldest to newest) to accumulate balance
    const userTxns = transactions
      .filter(t => t.userId === currentUser.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let accumulatedBal = 0;
    const enriched = userTxns.map(t => {
      const isDeposit = t.type === 'deposit';
      const isWithdrawal = t.type === 'withdrawal';
      const isIncome = !isDeposit && !isWithdrawal && t.type !== 'investment';
      const isInvestment = t.type === 'investment';

      const isSuccess = t.status === 'completed' || t.status === 'approved';

      if (isSuccess || t.status === 'pending') {
        if (isDeposit) accumulatedBal += t.amount;
        else if (isWithdrawal) accumulatedBal -= (t.netAmount || t.amount);
        else if (isIncome) accumulatedBal += t.amount;
        else if (isInvestment) accumulatedBal -= t.amount;
      }

      return {
        ...t,
        runningBalance: Math.max(0, accumulatedBal)
      };
    });

    // Default newest first for presentation
    return enriched.reverse();
  }, [transactions, currentUser.id]);

  // 2. Tab-Specific Transaction Base List
  const tabTransactions = useMemo(() => {
    switch (activeTab) {
      case 'recharge':
        return userTransactionsWithBalance.filter(t => t.type === 'deposit');
      case 'withdrawal':
        return userTransactionsWithBalance.filter(t => t.type === 'withdrawal');
      case 'income':
        return userTransactionsWithBalance.filter(t => 
          t.type === 'dividend' || 
          t.type === 'referral' || 
          t.type === 'checkin' || 
          t.type === 'spin_reward' ||
          t.type === 'bonus' ||
          (t.type as string).includes('reward') ||
          (t.type as string).includes('income')
        );
      case 'investment':
        return userTransactionsWithBalance.filter(t => t.type === 'investment');
      case 'all':
      default:
        return userTransactionsWithBalance;
    }
  }, [userTransactionsWithBalance, activeTab]);

  // 3. Compute Live Financial Metrics
  const metrics = useMemo(() => {
    const deposits = userTransactionsWithBalance.filter(t => t.type === 'deposit');
    const totalRechargeSuccess = deposits
      .filter(t => t.status === 'completed' || t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingRecharges = deposits
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const withdrawals = userTransactionsWithBalance.filter(t => t.type === 'withdrawal');
    const totalWithdrawalSuccess = withdrawals
      .filter(t => t.status === 'completed' || t.status === 'approved')
      .reduce((sum, t) => sum + (t.netAmount || t.amount), 0);
    const pendingWithdrawals = withdrawals
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeTxns = userTransactionsWithBalance.filter(t => 
      t.type === 'dividend' || 
      t.type === 'referral' || 
      t.type === 'checkin' || 
      t.type === 'spin_reward' ||
      t.type === 'bonus'
    );
    const totalProfitEarned = incomeTxns
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayIncome = incomeTxns
      .filter(t => t.status === 'completed' && new Date(t.createdAt).getTime() >= startOfToday)
      .reduce((sum, t) => sum + t.amount, 0);

    const plantDividends = userTransactionsWithBalance
      .filter(t => t.type === 'dividend' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const teamCommission = userTransactionsWithBalance
      .filter(t => t.type === 'referral' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalRechargeSuccess,
      pendingRecharges,
      rechargeCount: deposits.length,
      totalWithdrawalSuccess,
      pendingWithdrawals,
      withdrawalCount: withdrawals.length,
      totalProfitEarned,
      todayIncome,
      plantDividends,
      teamCommission,
      totalCount: userTransactionsWithBalance.length,
    };
  }, [userTransactionsWithBalance]);

  // 4. Apply Filters, Search & Sorting
  const filteredTransactions = useMemo(() => {
    let result = [...tabTransactions];

    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(t => {
        if (statusFilter === 'completed') return t.status === 'completed' || t.status === 'approved';
        return t.status === statusFilter;
      });
    }

    // Income Type Sub-filter (for income tab)
    if (activeTab === 'income' && incomeTypeFilter !== 'all') {
      result = result.filter(t => {
        if (incomeTypeFilter === 'dividend') {
          return t.type === 'dividend' && !t.description.toLowerCase().includes('flash');
        }
        if (incomeTypeFilter === 'flash') {
          return t.type === 'dividend' && t.description.toLowerCase().includes('flash');
        }
        if (incomeTypeFilter === 'referral') return t.type === 'referral';
        if (incomeTypeFilter === 'reward') {
          return t.type === 'checkin' || t.type === 'spin_reward' || t.type === 'bonus';
        }
        return true;
      });
    }

    // Date Filter
    if (dateFilter !== 'all') {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (dateFilter === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate).setHours(0, 0, 0, 0);
          result = result.filter(t => new Date(t.createdAt).getTime() >= start);
        }
        if (customEndDate) {
          const end = new Date(customEndDate).setHours(23, 59, 59, 999);
          result = result.filter(t => new Date(t.createdAt).getTime() <= end);
        }
      } else {
        result = result.filter(t => {
          const txnTime = new Date(t.createdAt).getTime();
          const diff = now - txnTime;
          if (dateFilter === 'today') return diff <= oneDay;
          if (dateFilter === 'yesterday') return diff > oneDay && diff <= oneDay * 2;
          if (dateFilter === '7days') return diff <= oneDay * 7;
          if (dateFilter === '30days') return diff <= oneDay * 30;
          return true;
        });
      }
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.id.toLowerCase().includes(q) ||
        (t.orderId && t.orderId.toLowerCase().includes(q)) ||
        (t.utrNumber && t.utrNumber.toLowerCase().includes(q)) ||
        (t.rrn && t.rrn.toLowerCase().includes(q)) ||
        (t.channel && t.channel.toLowerCase().includes(q)) ||
        t.description.toLowerCase().includes(q) ||
        (t.bankDetails?.accountNumber && t.bankDetails.accountNumber.includes(q)) ||
        (t.bankDetails?.upiId && t.bankDetails.upiId.toLowerCase().includes(q)) ||
        t.amount.toString().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'amount_high') return b.amount - a.amount;
      if (sortBy === 'amount_low') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [tabTransactions, statusFilter, incomeTypeFilter, dateFilter, customStartDate, customEndDate, searchQuery, sortBy, activeTab]);

  // Paginated records
  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice(0, currentPage * pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const hasMore = paginatedTransactions.length < filteredTransactions.length;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    sounds.playClick();
    showNotification(`${label} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    sounds.playClick();
    setTimeout(() => {
      setIsRefreshing(false);
      sounds.playSuccess();
      showNotification('Ledger synchronized with banking clearing servers.', 'success');
    }, 500);
  };

  const handleExportCsv = () => {
    sounds.playSuccess();
    const rows = [
      ['Transaction ID', 'Order Ref', 'Type', 'Channel / Gateway', 'Gross Amount (INR)', 'Fee / TDS', 'Net Disbursed', 'Running Balance (INR)', 'Status', 'UTR / RRN', 'Date & Time', 'Particulars'],
      ...filteredTransactions.map(t => [
        t.id,
        t.orderId || 'N/A',
        t.type,
        t.channel || t.method || 'UPI FastPay',
        t.amount.toString(),
        (t.fee || 0).toString(),
        (t.netAmount || t.amount).toString(),
        (t.runningBalance !== undefined ? t.runningBalance.toString() : 'N/A'),
        t.status,
        t.utrNumber || t.rrn || 'N/A',
        new Date(t.createdAt).toLocaleString(),
        `"${t.description.replace(/"/g, '""')}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentUser.name.replace(/\s+/g, '_')}_${activeTab}_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Official financial statement downloaded!', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className={`${
        isLight 
          ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' 
          : 'bg-slate-950 border-slate-800 text-slate-100 shadow-2xl'
      } border rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden transition-colors`}>
        
        {/* Mobile Swipe Handle */}
        <div className={`w-12 h-1.5 ${isLight ? 'bg-slate-300' : 'bg-slate-700'} rounded-full mx-auto my-2 sm:hidden flex-shrink-0`} />

        {/* Top Header */}
        <div className={`${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        } border-b px-3.5 py-2 flex items-center justify-between flex-shrink-0 gap-2`}>
          <div className="flex items-center space-x-2 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isLight ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <h2 className="text-xs sm:text-sm font-bold flex items-center space-x-1.5 font-['Outfit'] truncate">
                  <span>Financial Records</span>
                </h2>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                  isLight ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  NPCI 24×7
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block truncate">
                Recharge, Income, Withdrawal & Passbook Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {/* View Switcher: Cards, Passbook Table, Analytics */}
            <div className={`flex rounded-lg p-0.5 border ${
              isLight ? 'bg-slate-200/70 border-slate-300' : 'bg-slate-800 border-slate-700'
            }`}>
              <button
                onClick={() => { setViewMode('stream'); sounds.playClick(); }}
                title="Cards Stream"
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'stream' 
                    ? isLight ? 'bg-white text-blue-600 shadow-sm' : 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setViewMode('passbook'); sounds.playClick(); }}
                title="Bank Table Passbook"
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'passbook' 
                    ? isLight ? 'bg-white text-blue-600 shadow-sm' : 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setViewMode('analytics'); sounds.playClick(); }}
                title="Cashflow Analytics"
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'analytics' 
                    ? isLight ? 'bg-white text-blue-600 shadow-sm' : 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setIsStatementOpen(true)}
              title="Official Statement"
              className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-blue-500" />
            </button>

            <button
              onClick={handleRefresh}
              title="Refresh ledger"
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-800' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Dedicated Category Tabs: Recharge, Income, Withdrawal, All Passbook */}
        <div className={`${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        } border-b px-3 py-1.5 flex-shrink-0 overflow-x-auto scrollbar-none`}>
          <div className="flex space-x-1.5 min-w-max">
            
            {/* 1. Recharge Record Tab */}
            <button
              onClick={() => {
                setActiveTab('recharge');
                setCurrentPage(1);
                sounds.playClick();
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'recharge'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : isLight 
                    ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200' 
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <CreditCard className="w-3 h-3" />
              <span>Recharge Record (रिचार्ज)</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'recharge' ? 'bg-white/20 text-white' : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
              }`}>
                {metrics.rechargeCount}
              </span>
            </button>

            {/* 2. Income Record Tab */}
            <button
              onClick={() => {
                setActiveTab('income');
                setCurrentPage(1);
                sounds.playClick();
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : isLight 
                    ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200' 
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Income Record (इनकम)</span>
              {metrics.todayIncome > 0 ? (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-black">
                  +₹{metrics.todayIncome}
                </span>
              ) : (
                <span className="text-[8.5px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  Auto
                </span>
              )}
            </button>

            {/* 3. Withdrawal Record Tab */}
            <button
              onClick={() => {
                setActiveTab('withdrawal');
                setCurrentPage(1);
                sounds.playClick();
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'withdrawal'
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                  : isLight 
                    ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200' 
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Download className="w-3 h-3" />
              <span>Withdrawal Record (निकासी)</span>
              {metrics.pendingWithdrawals > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-600 font-mono font-bold">
                  Pending
                </span>
              )}
            </button>

            {/* 4. All Passbook Tab */}
            <button
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
                sounds.playClick();
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : isLight 
                    ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200' 
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>All Passbook</span>
            </button>
          </div>
        </div>

        {/* Tab-Specific KPI Banner & Running Balances Summary */}
        <div className="px-3 py-1.5 flex-shrink-0">
          <div className={`grid grid-cols-3 gap-2 p-2 rounded-xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800/80'
          }`}>
            {activeTab === 'recharge' && (
              <>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Total Recharged</span>
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{metrics.totalRechargeSuccess.toLocaleString()}
                  </span>
                </div>
                <div className={`border-x px-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">In Verification</span>
                  <span className={`text-xs font-bold font-mono ${metrics.pendingRecharges > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}>
                    ₹{metrics.pendingRecharges.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">30D Trend Chart</span>
                  <button
                    onClick={() => {
                      setShowTrendChart(!showTrendChart);
                      sounds.playClick();
                    }}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1 mt-0.5 hover:underline"
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>{showTrendChart ? 'Hide Line' : 'View Line'}</span>
                  </button>
                </div>
                <div className={`border-l pl-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Self-Service</span>
                  <button
                    onClick={() => setShowUtrHelper(!showUtrHelper)}
                    className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1 mt-0.5 hover:underline"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>{showUtrHelper ? 'Hide' : 'UTR Desk'}</span>
                  </button>
                </div>
              </>
            )}

            {activeTab === 'income' && (
              <>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Total Profit</span>
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{metrics.totalProfitEarned.toLocaleString()}
                  </span>
                </div>
                <div className={`border-x px-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Today's Accrual</span>
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    +₹{metrics.todayIncome.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Team Rebate</span>
                  <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">
                    ₹{metrics.teamCommission.toLocaleString()}
                  </span>
                </div>
              </>
            )}

            {activeTab === 'withdrawal' && (
              <>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Total Withdrawn</span>
                  <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
                    ₹{metrics.totalWithdrawalSuccess.toLocaleString()}
                  </span>
                </div>
                <div className={`border-x px-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">In Bank Clearing</span>
                  <span className={`text-xs font-bold font-mono ${metrics.pendingWithdrawals > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}>
                    ₹{metrics.pendingWithdrawals.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Payout Route</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>IMPS Instant</span>
                  </span>
                </div>
              </>
            )}

            {activeTab === 'all' && (
              <>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Ledger Entries</span>
                  <span className="text-sm font-black font-mono text-slate-800 dark:text-white">
                    {metrics.totalCount}
                  </span>
                </div>
                <div className={`border-x px-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Live Wallet Balance</span>
                  <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{currentUser.balance.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Cert. E-Statement</span>
                  <button
                    onClick={() => setIsStatementOpen(true)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1 mt-0.5 hover:underline"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View / Print</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Expandable Delayed UTR Assistant */}
        {showUtrHelper && activeTab === 'recharge' && (
          <div className="px-3 pb-2 flex-shrink-0 animate-in slide-in-from-top-2">
            <DelayedUtrAssistant
              transactions={userTransactionsWithBalance}
              isLight={isLight}
              onSelectTxn={(t) => setSelectedTxn(t)}
              onNotify={showNotification}
            />
          </div>
        )}

        {/* Filter Suite & Fast Search Bar */}
        <div className="px-3 pb-2 flex-shrink-0 space-y-2">
          
          {/* Search Row */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'recharge' 
                    ? 'Search 12-digit UTR, Order ID, UPI...' 
                    : activeTab === 'withdrawal'
                    ? 'Search Bank A/C, RRN, IFSC...'
                    : 'Search transaction ledger...'
                }
                className={`w-full rounded-xl pl-9 pr-8 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isLight 
                    ? 'bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400' 
                    : 'bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status Filter Pills */}
            <div className={`flex rounded-xl p-1 border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              {(['all', 'completed', 'pending', 'rejected'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                    sounds.playClick();
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                    statusFilter === st
                      ? isLight ? 'bg-white text-blue-600 shadow-sm' : 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {st === 'completed' ? 'Success' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Filters: Date Presets, Income Streams, Sorting */}
          <div className="flex items-center justify-between overflow-x-auto scrollbar-none text-[11px] gap-2 pt-0.5">
            
            {/* Income Streams sub-filter */}
            {activeTab === 'income' && (
              <div className="flex space-x-1 min-w-max">
                {(['all', 'dividend', 'flash', 'referral', 'reward'] as const).map(sub => (
                  <button
                    key={sub}
                    onClick={() => {
                      setIncomeTypeFilter(sub);
                      setCurrentPage(1);
                      sounds.playClick();
                    }}
                    className={`px-2 py-1 rounded-lg font-bold capitalize whitespace-nowrap border ${
                      incomeTypeFilter === sub
                        ? isLight 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isLight
                          ? 'bg-white text-slate-600 border-slate-200'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {sub === 'dividend' ? 'Dividends' : sub === 'flash' ? '⚡ Flash' : sub === 'referral' ? 'Team Rebate' : sub === 'reward' ? 'Spins & Bonus' : 'All Streams'}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-1.5 ml-auto min-w-max">
              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setDateFilter(val);
                  setShowCustomDateInputs(val === 'custom');
                  setCurrentPage(1);
                  sounds.playClick();
                }}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold border focus:outline-none ${
                  isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">📅 Custom Date Range</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  sounds.playClick();
                }}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold border focus:outline-none ${
                  isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Highest Amount</option>
                <option value="amount_low">Lowest Amount</option>
              </select>
            </div>

          </div>

          {/* Custom Date Range Pickers (shown when Custom is selected) */}
          {showCustomDateInputs && (
            <div className={`p-2.5 rounded-xl border flex flex-col sm:flex-row items-center gap-2 text-xs ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-700'
            }`}>
              <div className="flex items-center space-x-1.5 w-full sm:w-auto">
                <span className="text-slate-500 font-bold">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className={`rounded-lg px-2 py-1 text-xs border focus:outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-1.5 w-full sm:w-auto">
                <span className="text-slate-500 font-bold">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className={`rounded-lg px-2 py-1 text-xs border focus:outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <button
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                  setDateFilter('all');
                  setShowCustomDateInputs(false);
                }}
                className="text-[11px] text-blue-500 hover:underline font-bold ml-auto"
              >
                Reset Dates
              </button>
            </div>
          )}

        </div>

        {/* Scrollable Records Content Body */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5">
          
          {/* View Mode 1: Cash Flow Analytics */}
          {viewMode === 'analytics' && (
            <RecordsAnalytics 
              transactions={userTransactionsWithBalance} 
              isLight={isLight} 
            />
          )}

          {/* View Mode 2: Authentic Bank Passbook Table */}
          {viewMode === 'passbook' && (
            <>
              {activeTab === 'recharge' && showTrendChart && (
                <div className="mb-3 animate-in fade-in-50 duration-200">
                  <DepositTrendsChart
                    transactions={userTransactionsWithBalance}
                    isLight={isLight}
                  />
                </div>
              )}
              {filteredTransactions.length === 0 ? (
                <div className="py-16 px-4 text-center space-y-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                    isLight ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}>
                    <TableIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">No records found</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      No transactions match the selected filters or search parameters.
                    </p>
                  </div>
                </div>
              ) : (
                <PassbookTableView
                  transactions={paginatedTransactions}
                  isLight={isLight}
                  onSelectTxn={(txn) => setSelectedTxn(txn)}
                  onCopy={handleCopy}
                  copiedText={copiedText}
                />
              )}
            </>
          )}

          {/* View Mode 3: Detailed Interactive Stream Cards */}
          {viewMode === 'stream' && (
            <>
              {activeTab === 'recharge' && showTrendChart && (
                <div className="mb-3 animate-in fade-in-50 duration-200">
                  <DepositTrendsChart
                    transactions={userTransactionsWithBalance}
                    isLight={isLight}
                  />
                </div>
              )}
              {filteredTransactions.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                  isLight ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">No records found</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    No transactions match the selected criteria or search term.
                  </p>
                </div>
                {(statusFilter !== 'all' || dateFilter !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setDateFilter('all');
                      setSearchQuery('');
                      setShowCustomDateInputs(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                      isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
                  <span>Showing {paginatedTransactions.length} of {filteredTransactions.length} entries</span>
                  <span className="text-[10px] font-mono flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>256-Bit Cryptographic Ledger</span>
                  </span>
                </div>

                {paginatedTransactions.map((txn) => {
                  const isDeposit = txn.type === 'deposit';
                  const isWithdrawal = txn.type === 'withdrawal';
                  const isIncome = !isDeposit && !isWithdrawal && txn.type !== 'investment';
                  const isInvestment = txn.type === 'investment';

                  const isCredit = isDeposit || isIncome;
                  const isSuccess = txn.status === 'completed' || txn.status === 'approved';
                  const isPending = txn.status === 'pending';
                  const isRejected = txn.status === 'rejected';

                  return (
                    <div
                      key={txn.id}
                      onClick={() => {
                        setSelectedTxn(txn);
                        sounds.playClick();
                      }}
                      className={`rounded-2xl p-3.5 transition-all cursor-pointer space-y-2.5 active:scale-[0.99] border ${
                        isLight 
                          ? 'bg-white border-slate-200 hover:border-blue-400 shadow-sm hover:shadow' 
                          : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800/90 hover:border-slate-700 shadow-sm'
                      }`}
                    >
                      {/* Upper Row: Type, Status, Amount */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isDeposit
                                ? isLight ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : isWithdrawal
                                ? isLight ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : isIncome
                                ? isLight ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}
                          >
                            {isDeposit && <ArrowDownLeft className="w-5 h-5" />}
                            {isWithdrawal && <ArrowUpRight className="w-5 h-5" />}
                            {isIncome && <TrendingUp className="w-5 h-5" />}
                            {isInvestment && <Zap className="w-5 h-5" />}
                          </div>

                            <div>
                            <div className="flex items-center space-x-1.5">
                              <h4 className="text-[11px] font-bold capitalize">
                                {txn.type === 'deposit'
                                  ? 'Wallet Recharge'
                                  : txn.type === 'withdrawal'
                                  ? 'Bank Withdrawal'
                                  : txn.type === 'dividend'
                                  ? txn.description.toLowerCase().includes('flash') ? 'Flash Plan Profit' : 'Daily Equipment Return'
                                  : txn.type === 'referral'
                                  ? 'Team Agency Rebate'
                                  : txn.type === 'spin_reward'
                                  ? 'Lucky Wheel Reward'
                                  : txn.type === 'checkin'
                                  ? 'Daily Sign-in Streak'
                                  : txn.type.replace('_', ' ')}
                              </h4>

                              {txn.channel && (
                                <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded border font-mono ${
                                  isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700/60'
                                }`}>
                                  {txn.channel}
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                              {txn.description}
                            </p>

                            <div className="text-[9px] text-slate-400 font-mono flex items-center space-x-1 mt-0.5">
                              <span>{new Date(txn.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <span>•</span>
                              <span>{new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {txn.runningBalance !== undefined && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600 dark:text-blue-400 font-semibold">Bal: ₹{txn.runningBalance.toLocaleString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Amount & Status */}
                        <div className="text-right flex-shrink-0">
                          <div className={`text-sm font-black font-mono ${
                            isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {isCredit ? '+' : '-'}₹{txn.amount.toLocaleString()}
                          </div>

                          {txn.netAmount !== undefined && txn.fee !== undefined && txn.fee > 0 && (
                            <div className="text-[8.5px] text-slate-400 font-mono">
                              Net: ₹{txn.netAmount.toLocaleString()}
                            </div>
                          )}

                          <span className={`inline-flex items-center space-x-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 capitalize ${
                            isSuccess
                              ? isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : isPending
                              ? isLight ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : isLight ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}>
                            {isSuccess && <CheckCircle2 className="w-2 h-2" />}
                            {isPending && <Clock className="w-2 h-2 animate-spin" />}
                            {isRejected && <AlertCircle className="w-2 h-2" />}
                            <span>{isSuccess ? 'Success' : isPending ? 'In Verification' : 'Declined / Refunded'}</span>
                          </span>
                        </div>
                      </div>

                      {/* For Deposits: 12-Digit UTR Information & Copy */}
                      {isDeposit && txn.utrNumber && (
                        <div className={`rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[10px] border ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                        }`}>
                          <div className="flex items-center space-x-1.5 font-mono">
                            <span className="text-slate-500 text-[10px]">UTR:</span>
                            <span className="text-amber-600 dark:text-amber-300 font-bold tracking-wider">{txn.utrNumber}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(txn.utrNumber!, 'UTR');
                            }}
                            className="text-slate-500 hover:text-blue-600 dark:hover:text-white flex items-center space-x-1 text-[10px]"
                          >
                            {copiedText === txn.utrNumber ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>Copy UTR</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* For Withdrawals: Bank Destination & Bank RRN */}
                      {isWithdrawal && (
                        <div className={`rounded-xl px-2.5 py-1.5 space-y-1 text-[10px] font-mono border ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                        }`}>
                          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                            <div className="flex items-center space-x-1 font-sans">
                              {txn.bankDetails?.upiId ? (
                                <>
                                  <Smartphone className="w-2.5 h-2.5 text-blue-500" />
                                  <span className="font-bold">{txn.bankDetails.upiId}</span>
                                </>
                              ) : (
                                <>
                                  <Building2 className="w-2.5 h-2.5 text-amber-500" />
                                  <span className="font-bold">{txn.bankDetails?.bankName || 'Bank IMPS Payout'}</span>
                                </>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-500">
                              {txn.bankDetails?.accountNumber ? `A/C •••• ${txn.bankDetails.accountNumber.slice(-4)}` : 'UPI VPA'}
                            </span>
                          </div>
                          {txn.rrn && (
                            <div className={`text-[9px] text-slate-500 flex items-center justify-between pt-1 border-t ${
                              isLight ? 'border-slate-200' : 'border-slate-800/60'
                            }`}>
                              <span>Bank RRN Reference:</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{txn.rrn}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Rejection notice with refund guarantee */}
                      {isRejected && (
                        <div className={`rounded-xl p-2 text-[10px] space-y-1 border ${
                          isLight ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-950/30 border-red-500/30 text-red-300'
                        }`}>
                          <div className="flex items-center space-x-1 font-bold">
                            <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                            <span>Audit Remark:</span>
                          </div>
                          <p className="text-[9.5px] pl-4">
                            {txn.rejectionReason || 'Transaction could not be cleared by the receiver banking network.'}
                          </p>
                          {isWithdrawal && (
                            <div className="text-[9px] pl-4 font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 mt-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Full amount has been 100% refunded back to your wallet balance.</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Card Footer: View Official Slip CTA */}
                      <div className={`flex items-center justify-between pt-1 border-t text-[9.5px] ${
                        isLight ? 'border-slate-100' : 'border-slate-800/60'
                      }`}>
                        <span className="text-slate-400 flex items-center space-x-1">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                          <span>Cryptographic Proof Attached</span>
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center space-x-0.5">
                          <span>View Official Slip</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      </div>

                    </div>
                  );
                })}

                {/* Load More Pagination */}
                {hasMore && (
                  <div className="pt-2 pb-4 text-center">
                    <button
                      onClick={() => {
                        setCurrentPage(prev => prev + 1);
                        sounds.playClick();
                      }}
                      className={`px-6 py-2.5 rounded-2xl border text-xs font-bold transition-all shadow-sm inline-flex items-center space-x-2 ${
                        isLight 
                          ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800' 
                          : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <span>Load More Records (+{pageSize})</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        </div>

        {/* Footer info bar */}
        <div className={`${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        } border-t px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-500 flex-shrink-0`}>
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>256-Bit SSL Encrypted Financial Gateway</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsStatementOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center space-x-1"
            >
              <FileText className="w-3 h-3" />
              <span>Statement View</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

      </div>

      {/* Official Transaction Voucher / Receipt Slip Modal */}
      <TransactionSlipModal
        txn={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        isLight={isLight}
        userName={currentUser.name}
        userPhone={currentUser.phone}
        onNotify={showNotification}
      />

      {/* Official Financial Statement Modal */}
      <OfficialStatementModal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        transactions={userTransactionsWithBalance}
        currentUser={currentUser}
        isLight={isLight}
        onExportCsv={handleExportCsv}
        onNotify={showNotification}
      />

    </div>
  );
};
