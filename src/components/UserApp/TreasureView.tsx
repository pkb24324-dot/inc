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
  Timer
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const TreasureView: React.FC = () => {
  const { 
    userInvestments, 
    claimDailyDividend, 
    claimAllDividends,
    setActiveUserTab 
  } = useApp();

  // Tick every second for accurate countdown of 1m-1h flash plans
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeInvestments = userInvestments.filter(i => i.status === 'active');
  const completedInvestments = userInvestments.filter(i => i.status === 'completed');

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
    const timeFormatted = mins > 0 ? `${mins}m ${secs.toString().padStart(2, '0')}s` : `${secs}s`;
    return { isMatured: false, text: timeFormatted, progress: progressPercent, remainingSecs: diff };
  };

  const getDurationTag = (inv: typeof userInvestments[0]) => {
    if (inv.cycleUnit === 'minute') {
      const m = inv.cycleDuration || 1;
      return m === 1 ? '1 Min Flash' : `${m} Min Flash`;
    }
    if (inv.cycleUnit === 'hour') {
      const h = inv.cycleDuration || 1;
      return h === 1 ? '1 Hour Flash' : `${h} Hour Flash`;
    }
    return `${inv.cycleDays} Days`;
  };

  return (
    <div className="pb-28 max-w-xl mx-auto px-4 pt-4 space-y-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/80 to-slate-900 border border-blue-500/30 rounded-3xl p-5 shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-blue-300 font-semibold uppercase tracking-wider">
              Asset Profit Vault
            </div>
            <h2 className="text-2xl font-extrabold text-white font-['Outfit'] mt-1">
              Active Investments
            </h2>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-blue-500/20">
          <div>
            <span className="text-[11px] text-blue-200">Active Capital</span>
            <div className="text-xl font-black text-white font-mono mt-0.5">
              ₹{activeInvestments.reduce((acc, curr) => acc + curr.investedAmount, 0).toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-blue-200">Total Dividends Collected</span>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
              ₹{userInvestments.reduce((acc, curr) => acc + curr.earnedSoFar, 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* 1-Click Collect All Button */}
        {pendingDividendsTotal > 0 && (
          <button
            onClick={handleCollectAll}
            className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
          >
            <Zap className="w-4 h-4 text-slate-950" />
            <span>Collect All Dividends (₹{pendingDividendsTotal.toLocaleString()})</span>
          </button>
        )}
      </div>

      {/* List of Active Investments */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Current Operating Plans ({activeInvestments.length})
          </span>
          <span className="text-xs text-slate-400">Daily Payout Guaranteed</span>
        </div>

        {activeInvestments.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30"
            >
              Browse Investment Plans
            </button>
          </div>
        ) : (
          activeInvestments.map((inv) => {
            const isFlash = inv.isFlash || inv.cycleUnit === 'minute' || inv.cycleUnit === 'hour';

            if (isFlash) {
              const { isMatured, text, progress, remainingSecs } = formatFlashTimeRemaining(inv.endDate, inv.startDate);

              return (
                <div
                  key={inv.id}
                  className="bg-slate-900 border border-amber-500/30 rounded-3xl p-4 shadow-md space-y-3 relative overflow-hidden group"
                >
                  {/* Subtle amber ambient glow for flash plan */}
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
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        isMatured
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 active:scale-95 animate-pulse font-black'
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
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                    Running (Day {inv.daysPassed}/{inv.cycleDays})
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Maturity Progress</span>
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

                {/* Action button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ends: {new Date(inv.endDate).toLocaleDateString()}</span>
                  </div>

                  <button
                    onClick={() => handleClaim(inv.id)}
                    disabled={!inv.canClaimToday}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      inv.canClaimToday
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {inv.canClaimToday ? (
                      <>
                        <Zap className="w-3.5 h-3.5" />
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
            Completed Projects ({completedInvestments.length})
          </span>
          {completedInvestments.map(c => (
            <div key={c.id} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-white block">{c.planName}</span>
                <span className="text-slate-400 text-[11px]">Total Return: ₹{c.earnedSoFar.toLocaleString()}</span>
              </div>
              <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                100% Matured
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
