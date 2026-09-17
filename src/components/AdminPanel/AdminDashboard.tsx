import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  Wallet, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign,
  Activity,
  Layers,
  Download,
  Zap,
  Sliders,
  ShieldCheck,
  Percent,
  CheckCheck,
  ShieldAlert,
  Gift
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const AdminDashboard: React.FC = () => {
  const { 
    transactions, 
    allUsers, 
    userInvestments, 
    plans,
    settings,
    saveSettings,
    setActiveAdminTab,
    exportDataToCsv,
    batchApproveDeposits,
    batchApproveWithdrawals,
    triggerGlobalDividendRun,
    triggerGlobalCommissionRebateRun,
    distributePromoterAirdrop,
    showNotification,
    fraudAlerts,
    giftCodes,
    theme
  } = useApp();

  const isLight = theme === 'light';

  const unresolvedAlerts = fraudAlerts.filter(a => !a.resolved);
  const activeGiftCodes = giftCodes.filter(g => g.isActive);

  // Stream filter state
  const [streamFilter, setStreamFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'dividend'>('all');
  
  // Stress test simulation slider (% of user balance withdrawn simultaneously)
  const [stressTestPercent, setStressTestPercent] = useState<number>(30);

  // Metrics calculations
  const completedDeposits = transactions
    .filter(t => t.type === 'deposit' && (t.status === 'approved' || t.status === 'completed'))
    .reduce((acc, t) => acc + t.amount, 0);

  const completedWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const netReserve = completedDeposits - completedWithdrawals;

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');

  const activeInvestmentsTotal = userInvestments
    .filter(i => i.status === 'active')
    .reduce((acc, i) => acc + i.investedAmount, 0);

  const totalUserLiabilities = allUsers.reduce((sum, u) => sum + u.balance, 0);
  const solvencyRatio = totalUserLiabilities > 0 
    ? Math.round((netReserve / totalUserLiabilities) * 100) 
    : 100;

  // Stress-test dynamic simulation values
  const simulatedRunOutflow = Math.round((totalUserLiabilities * stressTestPercent) / 100);
  const projectedRemainingReserve = netReserve - simulatedRunOutflow;
  const isStressTestSafe = projectedRemainingReserve >= 0;

  // 7-Day Trend Mock Data for chart
  const days = ['Sep 03', 'Sep 04', 'Sep 05', 'Sep 06', 'Sep 07', 'Sep 08', 'Sep 09'];
  const depositTrend = [12000, 18500, 15000, 24000, 32000, 28500, 39500];
  const withdrawalTrend = [4500, 6200, 8100, 11000, 14500, 16200, 19800];
  const maxVal = 42000;

  const filteredTransactions = transactions.filter(t => {
    if (streamFilter === 'all') return true;
    return t.type === streamFilter;
  });

  const handleQuickBatchApproveDeposits = () => {
    sounds.playSuccess();
    batchApproveDeposits(pendingDeposits.map(d => d.id));
  };

  const handleQuickBatchApproveWithdrawals = () => {
    sounds.playSuccess();
    batchApproveWithdrawals(pendingWithdrawals.map(w => w.id));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Toolbar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-3xl p-4 shadow-sm transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-extrabold font-['Outfit']">
              Executive Financial Oversight Cockpit
            </h2>
            <p className="text-xs text-slate-500">
              Real-time solvency surveillance, liquidity stress-testing & clearance management
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportDataToCsv('transactions')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors border ${
              isLight 
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Ledger</span>
          </button>

          {pendingDeposits.length > 0 && (
            <button
              onClick={handleQuickBatchApproveDeposits}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-600/20"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Clear {pendingDeposits.length} Deposits</span>
            </button>
          )}

          {pendingWithdrawals.length > 0 && (
            <button
              onClick={handleQuickBatchApproveWithdrawals}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-amber-500/20"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Clear {pendingWithdrawals.length} Payouts</span>
            </button>
          )}
        </div>
      </div>

      {/* Pending Approvals Notice Banner */}
      {(pendingDeposits.length > 0 || pendingWithdrawals.length > 0) && (
        <div className={`border rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm ${
          isLight ? 'bg-amber-50 border-amber-300' : 'bg-gradient-to-r from-amber-950/60 to-orange-950/60 border-amber-500/40'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Pending Clearance Queue: {pendingDeposits.length} Deposits, {pendingWithdrawals.length} Withdrawals
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Action required to process member recharges and release bank payout dispatches.
              </p>
            </div>
          </div>

          <div className="flex space-x-2 w-full sm:w-auto">
            {pendingDeposits.length > 0 && (
              <button
                onClick={() => setActiveAdminTab('deposits')}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                Review Deposits ({pendingDeposits.length})
              </button>
            )}
            {pendingWithdrawals.length > 0 && (
              <button
                onClick={() => setActiveAdminTab('withdrawals')}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Review Payouts ({pendingWithdrawals.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Anti-Fraud Risk Surveillance Banner */}
      {unresolvedAlerts.length > 0 && (
        <div className={`border rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm ${
          isLight ? 'bg-red-50 border-red-300' : 'bg-gradient-to-r from-red-950/60 to-rose-950/60 border-red-500/40'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {unresolvedAlerts.length} Active Security Risk Alert{unresolvedAlerts.length > 1 ? 's' : ''} Detected
                </h4>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white">
                  Risk Engine
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Potential multi-accounting, duplicate UTR submissions or rapid balance extraction flagged.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveAdminTab('security')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors shadow-md shadow-red-600/30 whitespace-nowrap"
          >
            Investigate Risk Incidents ({unresolvedAlerts.length})
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Deposits */}
        <div className={`border rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Deposits</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            ₹{completedDeposits.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% this week</span>
          </div>
        </div>

        {/* Total Withdrawals */}
        <div className={`border rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Disbursed</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            ₹{completedWithdrawals.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            Settled via Direct IMPS / UPI
          </div>
        </div>

        {/* Net Liquidity */}
        <div className={`border rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Net Cash Reserve</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black font-mono ${netReserve >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            ₹{netReserve.toLocaleString()}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Solvency Ratio: {solvencyRatio}%</span>
          </div>
        </div>

        {/* Active Capital */}
        <div className={`border rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Capital</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-300 font-mono">
            ₹{activeInvestmentsTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            {allUsers.length} Registered Investors
          </div>
        </div>

      </div>

      {/* Advanced Liquidity & Solvency Stress-Test Simulator */}
      <div className={`border rounded-3xl p-5 shadow-sm space-y-4 transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-base font-['Outfit']">
              Capital Solvency & Withdrawal Run Simulator
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Dynamic stress-testing of bank run scenarios against liquid reserves
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Slider Control */}
          <div className={`space-y-3 p-4 rounded-2xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Simulate Sudden Withdrawal Spike:</span>
              <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">{stressTestPercent}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={stressTestPercent}
              onChange={(e) => setStressTestPercent(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5% (Routine)</span>
              <span>50% (High Run)</span>
              <span>100% (Worst Case)</span>
            </div>
          </div>

          {/* Simulation Output Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Member Liability</span>
              <div className="text-lg font-mono font-black text-slate-900 dark:text-white">
                ₹{totalUserLiabilities.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500">Combined wallet balances</p>
            </div>

            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Projected Outflow ({stressTestPercent}%)</span>
              <div className="text-lg font-mono font-black text-amber-600 dark:text-amber-400">
                ₹{simulatedRunOutflow.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500">Liquidity needed</p>
            </div>

            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Reserve Post-Spike</span>
              <div className={`text-lg font-mono font-black ${isStressTestSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                ₹{projectedRemainingReserve.toLocaleString()}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                isStressTestSafe 
                  ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300' 
                  : isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/20 text-red-300'
              }`}>
                {isStressTestSafe ? 'Solvent & Protected' : 'Deficit Risk'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Executive Global Automation Command Deck & Circuit Breakers */}
      <div className={`border rounded-3xl p-5 shadow-sm space-y-4 transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="font-extrabold text-base font-['Outfit'] text-slate-900 dark:text-white">
              Executive Automation Hub & Platform Circuit Breakers
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
            System Control Center
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action 1: Force Dividend Run */}
          <button
            onClick={() => {
              sounds.playCash();
              const res = triggerGlobalDividendRun();
              showNotification(`⚡ Force Dividend settlement executed! Credited ${res.processedCount} contracts (+₹${res.totalDistributed.toLocaleString()})`, 'success');
            }}
            className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition-all group active:scale-98"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Run Dividend Cycle</span>
              <TrendingUp className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Instantly settle daily profits for all active user contracts
            </p>
          </button>

          {/* Action 2: Force Commission Rebate */}
          <button
            onClick={() => {
              sounds.playCash();
              const res = triggerGlobalCommissionRebateRun();
              showNotification(`⚡ Agency Rebate executed! Disbursed to ${res.processedCount} promoters (+₹${res.totalDistributed.toLocaleString()})`, 'success');
            }}
            className="p-3.5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-left transition-all group active:scale-98"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Sweep Agency Rebates</span>
              <Users className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Disburse pending L1, L2, L3 commissions to all downline teams
            </p>
          </button>

          {/* Action 3: Promoter Airdrop */}
          <button
            onClick={() => {
              sounds.playSuccess();
              const res = distributePromoterAirdrop(300, 3);
              showNotification(`🎁 Airdropped ₹300 to ${res.rewardedCount} active promoters!`, 'success');
            }}
            className="p-3.5 rounded-2xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-left transition-all group active:scale-98"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Promoter Airdrop (₹300)</span>
              <Gift className="w-4 h-4 text-purple-500 group-hover:bounce transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Credit incentive bonus to all agents with 3+ referrals
            </p>
          </button>

          {/* Action 4: Circuit Breaker - Freeze Withdrawals */}
          <button
            onClick={() => {
              const next = !settings.globalFreezeWithdrawals;
              saveSettings({ globalFreezeWithdrawals: next });
              if (next) sounds.playError();
              else sounds.playSuccess();
              showNotification(next ? '⚠️ Emergency Circuit Breaker: Withdrawals FROZEN' : 'Withdrawals Resumed Normal Operation', next ? 'error' : 'success');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all group active:scale-98 ${
              settings.globalFreezeWithdrawals
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-red-500">
                {settings.globalFreezeWithdrawals ? 'Withdrawals FROZEN' : 'Freeze Withdrawals'}
              </span>
              <ShieldAlert className={`w-4 h-4 ${settings.globalFreezeWithdrawals ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {settings.globalFreezeWithdrawals ? 'Clearing desk currently halted' : 'One-click platform payout kill-switch'}
            </p>
          </button>
        </div>
      </div>

      {/* Interactive Charts & Live Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Financial Flow Trend Chart (2 columns) */}
        <div className={`lg:col-span-2 border rounded-3xl p-5 shadow-sm space-y-4 transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold font-['Outfit'] text-slate-900 dark:text-white">
                7-Day Inflow vs Outflow Velocity
              </h3>
              <p className="text-xs text-slate-500">Daily deposit influx vs withdrawal disbursements (₹)</p>
            </div>
            
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">Deposits</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-300">Payouts</span>
              </div>
            </div>
          </div>

          {/* SVG Visual Bar Chart */}
          <div className="pt-4 h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {days.map((day, idx) => {
              const depHeight = Math.round((depositTrend[idx] / maxVal) * 100);
              const wthHeight = Math.round((withdrawalTrend[idx] / maxVal) * 100);

              return (
                <div key={day} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center space-x-1 sm:space-x-1.5 h-48">
                    {/* Deposit Bar */}
                    <div
                      style={{ height: `${depHeight}%` }}
                      className="w-full max-w-[18px] bg-emerald-500/80 group-hover:bg-emerald-500 rounded-t-lg transition-all duration-300 relative"
                      title={`Deposits: ₹${depositTrend[idx].toLocaleString()}`}
                    />
                    {/* Withdrawal Bar */}
                    <div
                      style={{ height: `${wthHeight}%` }}
                      className="w-full max-w-[18px] bg-amber-500/80 group-hover:bg-amber-500 rounded-t-lg transition-all duration-300 relative"
                      title={`Payouts: ₹${withdrawalTrend[idx].toLocaleString()}`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-2 whitespace-nowrap">
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className={`flex items-center justify-between text-xs text-slate-500 pt-2 border-t ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <span>Peak Daily Recharge: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">₹39,500</strong></span>
            <span>Reserve Coverage: <strong className="text-blue-600 dark:text-blue-400 font-mono">{solvencyRatio}%</strong></span>
          </div>
        </div>

        {/* Real-time Activity Feed with Filter Pills */}
        <div className={`border rounded-3xl p-5 shadow-sm space-y-4 transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
              <h3 className="text-base font-extrabold font-['Outfit'] text-slate-900 dark:text-white">
                Live Transaction Stream
              </h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              Live
            </span>
          </div>

          {/* Filter Pills */}
          <div className={`flex rounded-xl p-1 text-[11px] border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            {(['all', 'deposit', 'withdrawal', 'dividend'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStreamFilter(tab)}
                className={`flex-1 py-1 rounded-lg font-bold capitalize transition-colors ${
                  streamFilter === tab 
                    ? isLight ? 'bg-white text-blue-600 shadow-sm' : 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredTransactions.slice(0, 8).map((t) => {
              const isCredit = t.type === 'deposit' || t.type === 'dividend' || t.type === 'checkin' || t.type === 'spin_reward';

              return (
                <div
                  key={t.id}
                  className={`border rounded-2xl p-2.5 flex items-center justify-between text-xs transition-colors ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
                  }`}
                >
                  <div className="space-y-0.5 max-w-[65%]">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-900 dark:text-white truncate">{t.userName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({t.type})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{t.description}</p>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-bold block ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {isCredit ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded capitalize ${
                      t.status === 'approved' || t.status === 'completed'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : t.status === 'pending'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Plan Performance & Asset Allocation Summary */}
      <div className={`border rounded-3xl p-5 shadow-sm space-y-4 transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex justify-between items-center">
          <h3 className="text-base font-extrabold font-['Outfit'] text-slate-900 dark:text-white">
            Asset Product Distribution & Flash Return Quotas
          </h3>
          <button
            onClick={() => setActiveAdminTab('plans')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Manage All Plans &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map((p) => {
            const isFlash = p.category === 'flash';
            return (
              <div key={p.id} className={`p-3.5 rounded-2xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{p.name}</h4>
                      {isFlash && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.2 rounded font-bold">
                          ⚡ FLASH
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {isFlash ? `${p.cycleDuration || 1} ${p.cycleUnit || 'min'}` : `${p.cycleDays} Days`} • ₹{p.dailyIncome} return
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">₹{p.price.toLocaleString()}</span>
                </div>
                <div className={`flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t ${
                  isLight ? 'border-slate-200' : 'border-slate-800'
                }`}>
                  <span>Subscribers: <strong className="text-slate-900 dark:text-white">{p.totalPurchasedCount.toLocaleString()}</strong></span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.isActive 
                      ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400'
                      : isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {p.isActive ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
