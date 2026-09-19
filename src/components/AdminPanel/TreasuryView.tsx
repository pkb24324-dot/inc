import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Play,
  Flame,
  Activity,
  Sliders,
  CheckCircle2,
  DollarSign,
  Lock,
  Unlock,
  Radio,
  PlusCircle,
  Clock,
  Sparkles,
  Send,
  Building2,
  PieChart
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const TreasuryView: React.FC = () => {
  const {
    allUsers,
    transactions,
    settings,
    updateSettings,
    triggerGlobalDividendsRun,
    triggerGlobalCommissionRebateRun,
    createManualDeposit,
    showNotification,
    theme
  } = useApp();

  const isLight = theme === 'light';

  // Treasury vault calculations
  const totalUserLiabilities = allUsers.reduce((sum, u) => sum + (u.balance || 0), 0);
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit' && (t.status === 'approved' || t.status === 'completed'))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && (t.status === 'approved' || t.status === 'completed'))
    .reduce((sum, t) => sum + t.amount, 0);

  const netRetainedProfit = totalDeposits - totalWithdrawals;
  
  // Platform Reserve Balance (Simulated base capital 500,000 + net retained profit)
  const baseCapital = 500000;
  const reserveVaultBalance = Math.max(0, baseCapital + netRetainedProfit);
  
  // Solvency ratio (Reserve / Liabilities)
  const solvencyRatio = totalUserLiabilities > 0
    ? Math.round((reserveVaultBalance / totalUserLiabilities) * 100)
    : 100;

  // Stress-test interactive simulation state
  const [simulatedBankRunPercent, setSimulatedBankRunPercent] = useState<number>(30);
  const [isProcessingDividends, setIsProcessingDividends] = useState(false);
  const [isProcessingRebates, setIsProcessingRebates] = useState(false);
  
  // Emergency circuit breaker toggles
  const [isWithdrawalPaused, setIsWithdrawalPaused] = useState(false);
  const [isDepositPaused, setIsDepositPaused] = useState(false);
  const [antiWhaleLimitActive, setAntiWhaleLimitActive] = useState(true);
  const [antiWhaleMaxAmount, setAntiWhaleMaxAmount] = useState<number>(25000);

  // Capital Injection Modal State
  const [injectModalOpen, setInjectModalOpen] = useState(false);
  const [injectAmount, setInjectAmount] = useState<number>(50000);
  const [injectNotes, setInjectNotes] = useState('Institutional Liquidity Buffer Injection');

  // Test Deposit Sandbox State
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);
  const [sandboxAmount, setSandboxAmount] = useState<number>(1000);
  const [sandboxSelectedUserId, setSandboxSelectedUserId] = useState<string>(allUsers[0]?.id || '');

  // Calculated stress test metrics
  const projectedDrainAmount = Math.round(totalUserLiabilities * (simulatedBankRunPercent / 100));
  const remainingReserveAfterDrain = reserveVaultBalance - projectedDrainAmount;
  const isSolventUnderStress = remainingReserveAfterDrain >= 0;

  // Handle Global Dividend Run
  const handleRunDividends = () => {
    setIsProcessingDividends(true);
    sounds.playCash();
    setTimeout(() => {
      const res = triggerGlobalDividendsRun();
      showNotification(`⚡ Force Dividend Completed: ₹${res.totalDistributed.toLocaleString()} credited to ${res.processedCount} active user plans!`, 'success');
      setIsProcessingDividends(false);
    }, 600);
  };

  // Handle Global Commission Rebate Run
  const handleRunRebates = () => {
    setIsProcessingRebates(true);
    sounds.playCash();
    setTimeout(() => {
      const res = triggerGlobalCommissionRebateRun();
      showNotification(`⚡ Agency Rebate Run Completed: ₹${res.totalDistributed.toLocaleString()} paid to ${res.processedCount} promoter accounts!`, 'success');
      setIsProcessingRebates(false);
    }, 600);
  };

  // Handle Test Deposit Injector
  const handleInjectTestDeposit = () => {
    const user = allUsers.find(u => u.id === sandboxSelectedUserId) || allUsers[0];
    if (!user) return;

    const randomUtr = `4290${Math.floor(10000000 + Math.random() * 90000000)}`;
    createManualDeposit(
      user.id,
      sandboxAmount,
      randomUtr,
      'IMPS Sandbox Test',
      'Simulated test investor deposit for verification'
    );
    sounds.playSuccess();
    showNotification(`✅ Simulated ₹${sandboxAmount} test deposit injected for ${user.name} (UTR: ${randomUtr})! Check Deposit Approvals.`, 'success');
    setSandboxModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Treasury Master Header */}
      <div className={`border rounded-3xl p-5 sm:p-6 shadow-sm transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-slate-900 dark:text-white">
                  AM invest Treasury & Liquidity Desk
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  NPCI CLEARING DESK
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Institutional Solvency Surveillance, Automated P&L Oversight & Liquidity Stress Engine
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setSandboxModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-blue-500/40 text-blue-500 hover:bg-blue-500/10 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Deposit</span>
            </button>

            <button
              onClick={() => setInjectModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 hover:opacity-95 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Inject Reserve</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial Solvency Telemetry Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reserve Vault */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Vault Liquidity</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ₹{reserveVaultBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Escrow & Buffer Capital</span>
          </div>
        </div>

        {/* User Liabilities */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Investor Balances</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
            ₹{totalUserLiabilities.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span>{allUsers.length} Registered Wallets</span>
          </div>
        </div>

        {/* Net Retained P&L */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Net P&L</span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black font-mono ${netRetainedProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
            {netRetainedProfit >= 0 ? '+' : ''}₹{netRetainedProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span>Inflow: ₹{totalDeposits.toLocaleString()} | Outflow: ₹{totalWithdrawals.toLocaleString()}</span>
          </div>
        </div>

        {/* Solvency Health Coverage */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Solvency Coverage</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              solvencyRatio >= 100 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black font-mono ${
            solvencyRatio >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
          }`}>
            {solvencyRatio}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span className={solvencyRatio >= 100 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
              {solvencyRatio >= 100 ? 'Vault Over-Collateralized' : 'Warning: High Outflow Demand'}
            </span>
          </div>
        </div>
      </div>

      {/* Global Batch Operations Bar */}
      <div className={`border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-extrabold font-['Outfit'] text-slate-900 dark:text-white">
              Executive Payout Engines & Global Dividend Runs
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">1-Click Automation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Force Global Daily Dividend Card */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>Force Global Daily Return Run</span>
                  <span className="text-[9px] bg-blue-500/20 text-blue-500 px-1.5 py-0.2 rounded font-bold">DAILY ROI</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Processes and credits the daily ROI returns to all active investor plans immediately across the entire platform.
                </p>
              </div>
            </div>
            <button
              onClick={handleRunDividends}
              disabled={isProcessingDividends}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isProcessingDividends ? 'Executing Ledger Runs...' : 'Execute Daily Returns Run'}</span>
            </button>
          </div>

          {/* Force Agency Commission Rebate Card */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>Force Agency Commission Rebate</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.2 rounded font-bold">AFFILIATE 3-TIER</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Calculates Tier 1 (10%), Tier 2 (5%), and Tier 3 (2%) bonuses and immediately credits claimable promoter wallets.
                </p>
              </div>
            </div>
            <button
              onClick={handleRunRebates}
              disabled={isProcessingRebates}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isProcessingRebates ? 'Calculating & Disbursing...' : 'Disburse Agency Rebates'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Financial Stress-Testing & Bank Run Simulator */}
      <div className={`border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
            <h2 className="text-base font-extrabold font-['Outfit'] text-slate-900 dark:text-white">
              Interactive Liquidity Stress Simulator (Bank Run Model)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Dynamic Solvency Modeling</span>
        </div>

        <p className="text-xs text-slate-500">
          Simulate a sudden spike where multiple investors request immediate withdrawals simultaneously to verify if current vault reserves can satisfy obligations.
        </p>

        <div className={`p-4 rounded-2xl border space-y-4 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Simulated Withdrawal Surge: <strong className="text-rose-500 font-mono">{simulatedBankRunPercent}%</strong> of all user balances
              </span>
              <span className="text-slate-400 font-mono">
                Projected Drain: ₹{projectedDrainAmount.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={simulatedBankRunPercent}
              onChange={(e) => setSimulatedBankRunPercent(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <span className="text-[10px] text-slate-400 block uppercase">Projected Outflow Demand</span>
              <span className="text-base font-black font-mono text-rose-500">₹{projectedDrainAmount.toLocaleString()}</span>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <span className="text-[10px] text-slate-400 block uppercase">Estimated Post-Run Reserve</span>
              <span className={`text-base font-black font-mono ${isSolventUnderStress ? 'text-emerald-500' : 'text-rose-500'}`}>
                ₹{remainingReserveAfterDrain.toLocaleString()}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <span className="text-[10px] text-slate-400 block uppercase">Stress Test Verdict</span>
              <span className={`text-sm font-black flex items-center space-x-1 mt-0.5 ${
                isSolventUnderStress ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {isSolventUnderStress ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>PASSED (Solvent)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>DEFICIT (Inject Capital)</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Platform Circuit Breakers (Killswitches) */}
      <div className={`border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-rose-500" />
            <h2 className="text-base font-extrabold font-['Outfit'] text-slate-900 dark:text-white">
              Emergency Financial Circuit Breakers & Anti-Drain Controls
            </h2>
          </div>
          <span className="text-[10px] font-mono text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full font-bold">
            RESTRICTED ACCESS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Pause Withdrawals Switch */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
            isWithdrawalPaused ? 'border-rose-500/50 bg-rose-500/5' : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Freeze All Payouts</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  isWithdrawalPaused ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {isWithdrawalPaused ? 'ACTIVE' : 'NORMAL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Temporarily locks all pending and new withdrawal requests in the queue.
              </p>
            </div>
            <button
              onClick={() => {
                setIsWithdrawalPaused(!isWithdrawalPaused);
                sounds.playClick();
                showNotification(
                  !isWithdrawalPaused ? '⚠️ Payouts Frozen by Admin Killswitch' : '✅ Payouts Resumed Normal Operations',
                  !isWithdrawalPaused ? 'error' : 'success'
                );
              }}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isWithdrawalPaused
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {isWithdrawalPaused ? 'Resume Withdrawals' : 'Freeze Withdrawals'}
            </button>
          </div>

          {/* Pause Deposits Switch */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
            isDepositPaused ? 'border-amber-500/50 bg-amber-500/5' : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Pause Inflow Channels</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  isDepositPaused ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                }`}>
                  {isDepositPaused ? 'PAUSED' : 'ONLINE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Puts UPI and payment gateways into scheduled maintenance mode.
              </p>
            </div>
            <button
              onClick={() => {
                setIsDepositPaused(!isDepositPaused);
                sounds.playClick();
                showNotification(
                  !isDepositPaused ? '⚠️ Deposits Placed on Maintenance Pause' : '✅ Deposit Inflow Restored',
                  !isDepositPaused ? 'error' : 'success'
                );
              }}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isDepositPaused
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {isDepositPaused ? 'Restore Deposits' : 'Pause Deposits'}
            </button>
          </div>

          {/* Anti-Whale Outflow Limit */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
            antiWhaleLimitActive ? 'border-indigo-500/40 bg-indigo-500/5' : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Anti-Whale Outflow Cap</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  antiWhaleLimitActive ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  ₹{antiWhaleMaxAmount.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Limits any single withdrawal payout transaction to avoid abrupt liquidity shocks.
              </p>
            </div>
            <button
              onClick={() => {
                setAntiWhaleLimitActive(!antiWhaleLimitActive);
                sounds.playClick();
                showNotification(
                  !antiWhaleLimitActive ? '🛡️ Anti-Whale Outflow Cap Enabled' : 'Anti-Whale Cap Disabled',
                  'info'
                );
              }}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                antiWhaleLimitActive
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              {antiWhaleLimitActive ? 'Modify Cap Limits' : 'Enable Anti-Whale Cap'}
            </button>
          </div>
        </div>
      </div>

      {/* Reserve Injection Modal */}
      {injectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Landmark className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Inject Platform Reserve Capital
                </h3>
              </div>
              <button
                onClick={() => setInjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Add liquid capital into the AM invest treasury buffer to maintain 100%+ solvency ratios.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Injection Amount (₹)</label>
                <input
                  type="number"
                  value={injectAmount}
                  onChange={(e) => setInjectAmount(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Audit Trail Note</label>
                <input
                  type="text"
                  value={injectNotes}
                  onChange={(e) => setInjectNotes(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setInjectModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sounds.playCash();
                  showNotification(`✅ Successfully injected ₹${injectAmount.toLocaleString()} to AM invest Reserve Vault!`, 'success');
                  setInjectModalOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                Confirm Injection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fast Simulated Deposit Sandbox Modal */}
      {sandboxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Fast Simulated Deposit Injector
                </h3>
              </div>
              <button
                onClick={() => setSandboxModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Instantly create a realistic pending deposit to test the Deposit Approval workflow and sound alerts in real-time.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Investor Account</label>
                <select
                  value={sandboxSelectedUserId}
                  onChange={(e) => setSandboxSelectedUserId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.phone}) - Bal: ₹{u.balance}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Test Amount</label>
                <div className="grid grid-cols-3 gap-2">
                  {[500, 2000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSandboxAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono border transition-all ${
                        sandboxAmount === amt
                          ? 'bg-blue-600 text-white border-blue-500'
                          : isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setSandboxModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleInjectTestDeposit}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
              >
                Dispatch Test Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
