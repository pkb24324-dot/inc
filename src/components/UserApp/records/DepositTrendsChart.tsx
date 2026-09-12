import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Activity,
  Layers
} from 'lucide-react';
import { Transaction } from '../../../types';

interface Props {
  transactions: Transaction[];
  isLight: boolean;
  className?: string;
  compact?: boolean;
}

interface DayDataPoint {
  dateKey: string;
  displayDate: string;
  fullDate: string;
  amount: number;
  pendingAmount: number;
  totalAmount: number;
  successCount: number;
  pendingCount: number;
  cumulativeAmount: number;
}

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label, isLight }: any) => {
  if (active && payload && payload.length) {
    const data: DayDataPoint = payload[0].payload;
    return (
      <div
        className={`p-3 rounded-xl border shadow-xl text-xs font-sans min-w-[170px] pointer-events-none transition-all ${
          isLight
            ? 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-900'
            : 'bg-slate-900/95 backdrop-blur-md border-slate-700 text-white'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-1.5 mb-2 border-slate-200 dark:border-slate-800">
          <span className="font-bold flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-blue-500 inline mr-1" />
            <span>{data.fullDate}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {data.successCount + data.pendingCount} txn{data.successCount + data.pendingCount === 1 ? '' : 's'}
          </span>
        </div>

        <div className="space-y-1.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Deposited:</span>
            </span>
            <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
              ₹{data.amount.toLocaleString()}
            </span>
          </div>

          {data.pendingAmount > 0 && (
            <div className="flex items-center justify-between text-amber-500">
              <span className="flex items-center space-x-1 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Pending:</span>
              </span>
              <span className="font-bold text-xs">
                ₹{data.pendingAmount.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px]">
            <span className="text-slate-400">Cumulative:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ₹{data.cumulativeAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const DepositTrendsChart: React.FC<Props> = ({
  transactions,
  isLight,
  className = '',
  compact = false
}) => {
  // Chart controls
  const [daysRange, setDaysRange] = useState<30 | 14 | 7>(30);
  const [chartMode, setChartMode] = useState<'daily' | 'cumulative'>('daily');
  const [includePending, setIncludePending] = useState<boolean>(true);

  // 1. Identify reference date (most recent transaction date or current system date)
  const referenceDate = useMemo(() => {
    const depositTimestamps = transactions
      .filter(t => t.type === 'deposit')
      .map(t => new Date(t.createdAt).getTime())
      .filter(t => !isNaN(t));

    const maxTxnTime = depositTimestamps.length > 0 ? Math.max(...depositTimestamps) : Date.now();
    // Default to the later of current Date or highest txn date
    return new Date(Math.max(Date.now(), maxTxnTime));
  }, [transactions]);

  // 2. Build Day Series for the selected range (30, 14, or 7 days)
  const chartData = useMemo(() => {
    const daysCount = daysRange;
    const result: DayDataPoint[] = [];
    let runningCumulative = 0;

    // Filter relevant deposit transactions upfront
    const depositTxns = transactions.filter(t => t.type === 'deposit');

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(referenceDate);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10); // YYYY-MM-DD

      // Format display dates
      const displayDate = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }); // e.g. "Sep 8"
      const fullDate = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      // Filter transactions matching this day
      const dayTxns = depositTxns.filter(t => t.createdAt.startsWith(dateKey));

      const successfulTxns = dayTxns.filter(
        t => t.status === 'completed' || t.status === 'approved'
      );
      const pendingTxns = dayTxns.filter(t => t.status === 'pending');

      const amount = successfulTxns.reduce((sum, t) => sum + t.amount, 0);
      const pendingAmount = pendingTxns.reduce((sum, t) => sum + t.amount, 0);
      const totalAmount = amount + (includePending ? pendingAmount : 0);

      runningCumulative += amount;

      result.push({
        dateKey,
        displayDate,
        fullDate,
        amount,
        pendingAmount,
        totalAmount,
        successCount: successfulTxns.length,
        pendingCount: pendingTxns.length,
        cumulativeAmount: runningCumulative
      });
    }

    return result;
  }, [transactions, referenceDate, daysRange, includePending]);

  // 3. Compute High-Level Metrics for the Range
  const summary = useMemo(() => {
    const totalDeposited = chartData.reduce((sum, d) => sum + d.amount, 0);
    const totalPending = chartData.reduce((sum, d) => sum + d.pendingAmount, 0);
    const totalTxns = chartData.reduce((sum, d) => sum + d.successCount, 0);
    const activeDays = chartData.filter(d => d.amount > 0).length;

    const dailyAverage = Math.round(totalDeposited / daysRange);

    let peakDay = { date: 'None', amount: 0 };
    chartData.forEach(d => {
      if (d.amount > peakDay.amount) {
        peakDay = { date: d.displayDate, amount: d.amount };
      }
    });

    return {
      totalDeposited,
      totalPending,
      totalTxns,
      activeDays,
      dailyAverage,
      peakDay
    };
  }, [chartData, daysRange]);

  // 4. Tick interval calculation to prevent X-axis crowding
  const tickInterval = useMemo(() => {
    if (daysRange === 30) return 4; // Show roughly every 5th day
    if (daysRange === 14) return 2;
    return 0; // Show all 7 days
  }, [daysRange]);

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isLight
          ? 'bg-white border-slate-200 shadow-sm'
          : 'bg-slate-900 border-slate-800 shadow-md'
      } ${className}`}
    >
      {/* Header & Controls Bar */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          
          {/* Title and Badge */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-black uppercase tracking-wider font-['Outfit']">
                  30-Day Deposit Velocity Trend
                </h4>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                  Recharts v3
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Visualizing capital recharges & gateway clearance velocity
              </p>
            </div>
          </div>

          {/* Time Range Selector & Mode Switchers */}
          <div className="flex items-center flex-wrap gap-1.5">
            {/* 30d / 14d / 7d range buttons */}
            <div
              className={`flex rounded-xl p-0.5 border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              {([30, 14, 7] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setDaysRange(range)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    daysRange === range
                      ? isLight
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {range}D
                </button>
              ))}
            </div>

            {/* Daily vs Cumulative Toggle */}
            <div
              className={`flex rounded-xl p-0.5 border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <button
                onClick={() => setChartMode('daily')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  chartMode === 'daily'
                    ? isLight
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setChartMode('cumulative')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  chartMode === 'cumulative'
                    ? isLight
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Cumulative
              </button>
            </div>

            {/* Pending toggle */}
            <button
              onClick={() => setIncludePending(!includePending)}
              className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition-colors flex items-center space-x-1 ${
                includePending
                  ? isLight
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : isLight
                  ? 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
              title="Toggle pending deposits on line graph"
            >
              <Clock className="w-2.5 h-2.5" />
              <span>Pending</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Stat KPIs */}
        {!compact && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
            <div
              className={`p-2.5 rounded-xl border ${
                isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-blue-950/20 border-blue-900/40'
              }`}
            >
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                {daysRange}-Day Inflow
              </span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                ₹{summary.totalDeposited.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                {summary.totalTxns} cleared recharge{summary.totalTxns === 1 ? '' : 's'}
              </span>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                Daily Average
              </span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                ₹{summary.dailyAverage.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5 font-sans">
                Across {daysRange} days
              </span>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                Peak Day
              </span>
              <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                ₹{summary.peakDay.amount.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                {summary.peakDay.date}
              </span>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                Active Velocity
              </span>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                {summary.activeDays} / {daysRange} Days
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                {summary.totalPending > 0 ? `₹${summary.totalPending.toLocaleString()} pending` : 'All cleared'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Recharts Line Chart Container */}
      <div className="p-3">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 12, left: -16, bottom: 4 }}
            >
              {/* Grid Lines */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isLight ? '#e2e8f0' : '#1e293b'}
                vertical={false}
              />

              {/* X Axis */}
              <XAxis
                dataKey="displayDate"
                interval={tickInterval}
                stroke={isLight ? '#94a3b8' : '#64748b'}
                tick={{ fontSize: 10, fill: isLight ? '#64748b' : '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: isLight ? '#cbd5e1' : '#334155' }}
              />

              {/* Y Axis with formatted INR */}
              <YAxis
                stroke={isLight ? '#94a3b8' : '#64748b'}
                tick={{ fontSize: 10, fill: isLight ? '#64748b' : '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: isLight ? '#cbd5e1' : '#334155' }}
                tickFormatter={(val: number) => {
                  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
                  return `₹${val}`;
                }}
              />

              {/* Interactive Tooltip */}
              <Tooltip
                content={<CustomTooltip isLight={isLight} />}
                cursor={{
                  stroke: isLight ? '#94a3b8' : '#475569',
                  strokeWidth: 1,
                  strokeDasharray: '3 3'
                }}
              />

              {/* Reference Line for Daily Average if in daily mode */}
              {chartMode === 'daily' && summary.dailyAverage > 0 && (
                <ReferenceLine
                  y={summary.dailyAverage}
                  stroke={isLight ? '#94a3b8' : '#475569'}
                  strokeDasharray="3 3"
                  label={{
                    value: `Avg ₹${summary.dailyAverage}`,
                    fill: isLight ? '#64748b' : '#94a3b8',
                    fontSize: 9,
                    position: 'insideBottomRight'
                  }}
                />
              )}

              {/* Primary Deposit Line */}
              <Line
                type="monotone"
                dataKey={chartMode === 'daily' ? 'amount' : 'cumulativeAmount'}
                name={chartMode === 'daily' ? 'Cleared Deposit' : 'Cumulative Growth'}
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{
                  r: daysRange === 30 ? 2 : 3.5,
                  fill: '#3b82f6',
                  strokeWidth: 1,
                  stroke: isLight ? '#ffffff' : '#0f172a'
                }}
                activeDot={{
                  r: 5.5,
                  fill: '#2563eb',
                  stroke: '#93c5fd',
                  strokeWidth: 2
                }}
                animationDuration={800}
              />

              {/* Secondary Pending Line (optional when in daily mode & enabled) */}
              {chartMode === 'daily' && includePending && (
                <Line
                  type="monotone"
                  dataKey="pendingAmount"
                  name="Pending Clearance"
                  stroke="#f59e0b"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{
                    r: 4.5,
                    fill: '#f59e0b',
                    stroke: '#fde68a',
                    strokeWidth: 2
                  }}
                  animationDuration={800}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Legend & Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-1 rounded bg-blue-500" />
              <span className="text-slate-600 dark:text-slate-300">
                {chartMode === 'daily' ? 'Cleared Deposit (₹)' : 'Cumulative Growth (₹)'}
              </span>
            </span>
            {chartMode === 'daily' && includePending && (
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-0.5 bg-amber-500 border-b border-dashed border-amber-500" />
                <span className="text-amber-600 dark:text-amber-400">Pending</span>
              </span>
            )}
          </div>
          <span className="text-slate-400">
            {daysRange}-Day Window ending {referenceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
};
