import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Zap, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  Coins,
  Timer,
  Bot,
  RefreshCw,
  ArrowRight,
  HelpCircle,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { formatCurrencyINR } from '../../utils/currencyFormatter';

export const TreasureView: React.FC = () => {
  const { 
    currentUser,
    userInvestments, 
    claimDailyDividend, 
    claimAllDividends,
    liquidateInvestment,
    autoHarvestEnabled,
    toggleAutoHarvest,
    settings,
    plans,
    purchasePlan,
    reinvestBalanceIntoPlan,
    setActiveUserTab,
    showNotification 
  } = useApp();

  // Tick every second for live timers & micro-profit streaming ticker
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [streamedProfit, setStreamedProfit] = useState<number>(0);
  const [liquidationModalInvId, setLiquidationModalInvId] = useState<string | null>(null);
  const [showReinvestDrawer, setShowReinvestDrawer] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeInvestments = userInvestments.filter(i => i.status === 'active');
  const completedInvestments = userInvestments.filter(i => i.status === 'completed');

  // Live Micro-Profit Streamer Calculation
  const totalDailyBase = activeInvestments.reduce((acc, curr) => acc + (curr.dailyIncome || 0), 0);
  const perSecondRate = totalDailyBase > 0 ? totalDailyBase / 86400 : 0;

  useEffect(() => {
    if (perSecondRate <= 0) return;
    const streamInterval = setInterval(() => {
      setStreamedProfit(prev => prev + perSecondRate);
    }, 1000);
    return () => clearInterval(streamInterval);
  }, [perSecondRate]);

  // VIP Profit Booster Calculation
  const getVipBoostPercent = (vip: number) => {
    switch (vip) {
      case 2: return 2;
      case 3: return 4;
      case 4: return 7;
      case 5: return 10;
      case 6: return 15;
      default: return 0;
    }
  };
  const vipBoost = getVipBoostPercent(currentUser.vipLevel);

  // Calculate pending claimables (Daily dividend OR matured Flash plan)
  const pendingDividendsTotal = activeInvestments.reduce((acc, curr) => {
    const isFlash = curr.isFlash || curr.cycleUnit === 'minute' || curr.cycleUnit === 'hour';
    if (isFlash) {
      const isMatured = currentTime >= new Date(curr.endDate).getTime();
      return isMatured ? acc + curr.totalReturn : acc;
    }
    return curr.canClaimToday ? acc + curr.dailyIncome : acc;
  }, 0);

  const handleClaim = (id: string) => {
    claimDailyDividend(id);
  };

  const handleCollectAll = () => {
    claimAllDividends();
  };

  const handleConfirmLiquidation = () => {
    if (!liquidationModalInvId) return;
    liquidateInvestment(liquidationModalInvId);
    setLiquidationModalInvId(null);
  };

  const formatFlashTimeRemaining = (endDateStr: string, startDateStr: string) => {
    const endMs = new Date(endDateStr).getTime();
    const startMs = new Date(startDateStr).getTime();
    const diff = Math.max(0, Math.ceil((endMs - currentTime) / 1000));
    
    const totalDurationSecs = Math.max(1, Math.round((endMs - startMs) / 1000));
    const elapsedSecs = Math.max(0, Math.round((currentTime - startMs) / 1000));
    const progressPercent = Math.min(100, Math.round((elapsedSecs / totalDurationSecs) * 100));

    if (diff <= 0) {
      return { isMatured: true, text: 'Matured! Ready to Settle', progress: 100, remainingSecs: 0 };
    }

    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    const timeFormatted = mins > 0 
      ? `${mins} ${mins === 1 ? 'Minute' : 'Minutes'} ${secs.toString().padStart(2, '0')} Seconds` 
      : `${secs} Seconds`;
    return { isMatured: false, text: timeFormatted, progress: progressPercent, remainingSecs: diff };
  };

  const getDurationTag = (inv: typeof userInvestments[0]) => {
    if (inv.cycleUnit === 'minute') {
      const m = inv.cycleDuration || 1;
      return m === 1 ? '1 Minute Flash' : `${m} Minutes Flash`;
    }
    if (inv.cycleUnit === 'hour') {
      const h = inv.cycleDuration || 1;
      return h === 1 ? '1 Hour Flash' : `${h} Hours Flash`;
    }
    return `${inv.cycleDays} Days`;
  };

  const selectedLiquidatingInv = userInvestments.find(i => i.id === liquidationModalInvId);

  return (
    <div className="pb-28 max-w-xl mx-auto px-4 pt-4 space-y-4">
      
      {/* Header Banner with Real-Time Micro-Profit Streaming Ticker */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-blue-300 font-bold uppercase tracking-wider">
                Production Asset Treasury
              </span>
              {vipBoost > 0 && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Zap className="w-2.5 h-2.5 fill-amber-300" />
                  <span>+{vipBoost}% VIP Boost</span>
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] mt-1">
              Active Income Engine
            </h2>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Live Micro-Earnings Real-time Ticker */}
        <div className="mt-4 bg-slate-950/80 border border-blue-500/20 rounded-2xl p-3.5 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute inset-0 opacity-75" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 relative" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">
                Live Micro-Profit Stream ({perSecondRate > 0 ? `+₹${(perSecondRate * 60).toFixed(2)} / Minute` : 'Standby'})
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-emerald-400">
                +₹{(perSecondRate * 86400 * 0.45 + streamedProfit).toFixed(3)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Daily Run-Rate</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              ₹{totalDailyBase.toLocaleString()} / day
            </span>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800 text-xs relative z-10">
          <div>
            <span className="text-slate-400 block text-[11px]">Active Capital</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              ₹{activeInvestments.reduce((acc, curr) => acc + curr.investedAmount, 0).toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Total Profit Disbursed</span>
            <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
              ₹{userInvestments.reduce((acc, curr) => acc + curr.earnedSoFar, 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* 1-Click Collect All Button */}
        {pendingDividendsTotal > 0 && (
          <button
            onClick={handleCollectAll}
            className="mt-4 w-full py-3.5 rounded-2xl btn-chamko-emerald text-white font-black text-sm flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer relative z-10"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Collect All Dividends (₹{pendingDividendsTotal.toLocaleString()})</span>
          </button>
        )}
      </div>

      {/* Advanced Automation & Auto-Collect Engine Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${autoHarvestEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white">Auto-Collect Engine</span>
              {autoHarvestEnabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {autoHarvestEnabled ? 'Automated 24/7 background profit collection active' : 'Turn on to auto-claim dividends as they mature'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleAutoHarvest}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            autoHarvestEnabled 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20' 
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {autoHarvestEnabled ? 'ACTIVE' : 'ENABLE'}
        </button>
      </div>

      {/* 24-Hour Projected Cash Flow Matrix */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5">
          <span className="text-[10px] text-slate-400 block font-medium">Next 24h Payout</span>
          <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400 mt-0.5 block">
            ₹{totalDailyBase.toLocaleString()}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5">
          <span className="text-[10px] text-slate-400 block font-medium">7-Day Projection</span>
          <span className="font-mono text-xs sm:text-sm font-bold text-blue-400 mt-0.5 block">
            ₹{(totalDailyBase * 7).toLocaleString()}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5">
          <span className="text-[10px] text-slate-400 block font-medium">Auto-Reinvest Bonus</span>
          <span className="font-mono text-xs sm:text-sm font-bold text-amber-400 mt-0.5 block">
            +3% Royalty
          </span>
        </div>
      </div>

      {/* List of Active Investments */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Active Operating Assets ({activeInvestments.length})</span>
          </span>
          <span className="text-xs text-slate-400">Guaranteed Return Contracts</span>
        </div>

        {activeInvestments.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">No Active Plans Right Now</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Explore our flash (1m - 1h) or daily high-return packages on the home screen to start generating cash!
              </p>
            </div>
            <button
              onClick={() => setActiveUserTab('home')}
              className="px-5 py-2.5 rounded-xl btn-chamko-blue text-white font-black text-xs shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              Browse Investment Plans
            </button>
          </div>
        ) : (
          activeInvestments.map((inv) => {
            const isFlash = inv.isFlash || inv.cycleUnit === 'minute' || inv.cycleUnit === 'hour';

            if (isFlash) {
              const { isMatured, text, progress } = formatFlashTimeRemaining(inv.endDate, inv.startDate);

              return (
                <div
                  key={inv.id}
                  className="bg-slate-900 border border-amber-500/30 rounded-3xl p-4 shadow-md space-y-3 relative overflow-hidden group"
                >
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <h3 className="font-extrabold text-white text-base font-['Outfit']">
                          {inv.planName}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Invested: <span className="font-mono text-white font-bold">₹{inv.investedAmount.toLocaleString()}</span> • Cycle: <span className="text-amber-400 font-semibold">{getDurationTag(inv)}</span>
                      </p>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1">
                      <Zap className="w-3 h-3 fill-amber-400" />
                      <span>{isMatured ? 'Matured' : 'Flash Running'}</span>
                    </span>
                  </div>

                  {/* Flash Live Progress Bar */}
                  <div className="space-y-1 relative z-10">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Timer className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isMatured ? 'Profit Settled & Ready' : 'Time to Settlement'}</span>
                      </span>
                      <span className={`font-mono font-bold ${isMatured ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {text}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isMatured 
                            ? 'bg-emerald-400' 
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        }`}
                        style={{ width: `${Math.max(5, progress)}%` }}
                      />
                    </div>
                  </div>

                  {/* Return Details */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/80 text-xs relative z-10">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Net Profit Return</span>
                      <span className="font-mono font-bold text-emerald-400">+₹{(inv.totalReturn - inv.investedAmount).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Settlement Return</span>
                      <span className="font-mono font-extrabold text-amber-400">₹{inv.totalReturn.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="flex items-center justify-between pt-1 relative z-10">
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isMatured ? 'Settlement unlocked' : `Matures in ${text}`}</span>
                    </div>

                    <button
                      onClick={() => handleClaim(inv.id)}
                      disabled={!isMatured}
                      className={`px-4 py-2.5 rounded-xl text-xs transition-all flex items-center space-x-1.5 ${
                        isMatured
                          ? 'btn-chamko-emerald text-white shadow-xl shadow-emerald-500/40 active:scale-95 font-black cursor-pointer'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-not-allowed'
                      }`}
                    >
                      {isMatured ? (
                        <>
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>Claim ₹{inv.totalReturn.toLocaleString()}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          <span>Running ({text})</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            }

            // Regular Daily Plan
            const progressPercent = Math.min(100, Math.round((inv.daysPassed / inv.cycleDays) * 100));

            return (
              <div
                key={inv.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md space-y-3 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-white text-base font-['Outfit']">
                      {inv.planName}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Invested: <span className="font-mono text-white font-bold">₹{inv.investedAmount.toLocaleString()}</span> • Cycle: {inv.cycleDays} Days
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Running (Day {inv.daysPassed}/{inv.cycleDays})
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Contract Progress</span>
                    <span className="font-mono font-bold text-slate-200">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Return Details */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Daily Earning</span>
                    <span className="font-mono font-bold text-emerald-400">₹{inv.dailyIncome.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Collected So Far</span>
                    <span className="font-mono font-bold text-amber-400">₹{inv.earnedSoFar.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action button & Emergency Capital Exit */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setLiquidationModalInvId(inv.id)}
                    className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center space-x-1 transition-colors underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-400" />
                    <span>Emergency Capital Exit</span>
                  </button>

                  <button
                    onClick={() => handleClaim(inv.id)}
                    disabled={!inv.canClaimToday}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                      inv.canClaimToday
                        ? 'btn-chamko-emerald text-white shadow-xl shadow-emerald-500/30 active:scale-95 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {inv.canClaimToday ? (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        <span>Collect Today's ₹{inv.dailyIncome.toLocaleString()}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Claimed Today</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Completed Investments (If any) */}
      {completedInvestments.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-1">
            Settled & Matured Contracts ({completedInvestments.length})
          </span>
          {completedInvestments.map(c => (
            <div key={c.id} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-white block">{c.planName}</span>
                <span className="text-slate-400 text-[11px]">Total Return: ₹{c.earnedSoFar.toLocaleString()}</span>
              </div>
              <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                100% Settled
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Capital Liquidation Modal */}
      {liquidationModalInvId && selectedLiquidatingInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Emergency Capital Refund</h3>
                <p className="text-xs text-slate-400">Early Position Exit Protocol</p>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Asset Position:</span>
                <span className="font-bold text-white">{selectedLiquidatingInv.planName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Original Capital:</span>
                <span className="font-mono text-white">₹{selectedLiquidatingInv.investedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Emergency Early Exit Fee (15%):</span>
                <span className="font-mono">-₹{Math.round(selectedLiquidatingInv.investedAmount * 0.15).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold pt-2 border-t border-slate-800 text-sm">
                <span>Net Instant Refund to Balance:</span>
                <span className="font-mono">₹{Math.round(selectedLiquidatingInv.investedAmount * 0.85).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Upon confirmation, this asset contract will be immediately terminated and ₹{Math.round(selectedLiquidatingInv.investedAmount * 0.85).toLocaleString()} will be refunded to your spendable wallet balance right now.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLiquidationModalInvId(null)}
                className="py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800"
              >
                Cancel Keep Plan
              </button>
              <button
                type="button"
                onClick={handleConfirmLiquidation}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
