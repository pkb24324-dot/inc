import React from 'react';
import { 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PieChart, 
  Zap, 
  Users, 
  Gift, 
  ShieldCheck,
  CreditCard,
  Percent
} from 'lucide-react';
import { Transaction } from '../../../types';
import { DepositTrendsChart } from './DepositTrendsChart';

interface Props {
  transactions: Transaction[];
  isLight: boolean;
}

export const RecordsAnalytics: React.FC<Props> = ({ transactions, isLight }) => {
  // Aggregate Metrics
  const deposits = transactions.filter(t => t.type === 'deposit' && (t.status === 'completed' || t.status === 'approved'));
  const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);

  const withdrawals = transactions.filter(t => t.type === 'withdrawal' && (t.status === 'completed' || t.status === 'approved'));
  const totalWithdrawals = withdrawals.reduce((sum, t) => sum + (t.netAmount || t.amount), 0);

  const plantDividends = transactions
    .filter(t => t.type === 'dividend' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const teamCommissions = transactions
    .filter(t => t.type === 'referral' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const rewards = transactions
    .filter(t => (t.type === 'spin_reward' || t.type === 'checkin' || t.type === 'bonus') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEarnings = plantDividends + teamCommissions + rewards;
  const totalInflow = totalDeposits + totalEarnings;
  const totalOutflow = totalWithdrawals;
  const netGrowth = totalInflow - totalOutflow;

  // Inflow / Outflow percentage
  const totalVolume = totalInflow + totalOutflow || 1;
  const inflowPct = Math.round((totalInflow / totalVolume) * 100);
  const outflowPct = 100 - inflowPct;

  // 7-Day Income Trend Data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString([], { weekday: 'short' });
    const dateOnly = d.toISOString().slice(0, 10);
    
    // Sum earnings for this day
    const dayIncome = transactions
      .filter(t => {
        const isEarn = t.type === 'dividend' || t.type === 'referral' || t.type === 'spin_reward' || t.type === 'checkin' || t.type === 'bonus';
        return isEarn && t.status === 'completed' && t.createdAt.startsWith(dateOnly);
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return { dayStr, dateOnly, amount: dayIncome };
  });

  const maxDayIncome = Math.max(...last7Days.map(d => d.amount), 500);

  return (
    <div className="space-y-4 p-1">
      
      {/* Visual Inflow vs Outflow Ratio Card */}
      <div className={`p-4 rounded-2xl border space-y-3 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-blue-500" />
            <h4 className="text-xs font-black uppercase tracking-wider font-['Outfit']">
              Capital Flow Dynamics
            </h4>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
            netGrowth >= 0 
              ? isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            Net Liquidity: {netGrowth >= 0 ? '+' : ''}₹{netGrowth.toLocaleString()}
          </span>
        </div>

        {/* Dynamic Dual Color Bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${inflowPct}%` }}
              className="bg-emerald-500 h-full transition-all duration-500" 
              title={`Inflow ${inflowPct}%`}
            />
            <div 
              style={{ width: `${outflowPct}%` }}
              className="bg-amber-500 h-full transition-all duration-500" 
              title={`Outflow ${outflowPct}%`}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono">
            <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Inflow (Recharges + Profits): {inflowPct}%</span>
              <span className="font-bold">(₹{totalInflow.toLocaleString()})</span>
            </div>
            <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Outflow: {outflowPct}%</span>
              <span className="font-bold">(₹{totalOutflow.toLocaleString()})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Recharts Deposit Trends Line Chart */}
      <DepositTrendsChart
        transactions={transactions}
        isLight={isLight}
      />

      {/* 7-Day Income Trend Mini Bar Graph */}
      <div className={`p-4 rounded-2xl border space-y-3 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-black uppercase tracking-wider font-['Outfit']">
              7-Day Daily Accrual Trend
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Daily Yield Velocity
          </span>
        </div>

        {/* CSS/SVG Bar Chart */}
        <div className="grid grid-cols-7 gap-2 pt-3 pb-1 items-end h-28">
          {last7Days.map((item, idx) => {
            const barHeight = Math.max(Math.round((item.amount / maxDayIncome) * 100), 8);
            const isToday = idx === 6;

            return (
              <div key={item.dateOnly} className="flex flex-col items-center justify-end h-full group">
                <span className="text-[9px] font-mono text-slate-400 group-hover:text-emerald-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">
                  ₹{item.amount}
                </span>
                <div 
                  style={{ height: `${barHeight}%` }}
                  className={`w-full rounded-t-lg transition-all ${
                    isToday
                      ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                      : item.amount > 0
                      ? 'bg-emerald-600/70 dark:bg-emerald-500/50 group-hover:bg-emerald-500'
                      : isLight ? 'bg-slate-200' : 'bg-slate-800'
                  }`}
                />
                <span className={`text-[10px] mt-1.5 font-bold ${
                  isToday ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-slate-400'
                }`}>
                  {item.dayStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Income Streams Distribution Breakdown */}
      <div className={`p-4 rounded-2xl border space-y-3 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-black uppercase tracking-wider font-['Outfit']">
            Income Streams Contribution
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Plant Dividends</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{plantDividends.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Team Rebates</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">₹{teamCommissions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Gift className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Spins & Streaks</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">₹{rewards.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
