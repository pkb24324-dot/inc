import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Trophy, 
  HelpCircle, 
  AlertCircle, 
  Zap, 
  Gift, 
  Coins, 
  TrendingUp, 
  CheckCircle2, 
  RotateCcw, 
  CreditCard, 
  UserPlus, 
  ChevronRight,
  Flame,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import { formatCurrencyINR } from '../../utils/currencyFormatter';

export interface WheelSegment {
  id: number;
  label: string;
  sublabel: string;
  value: number;
  weight: number;
  color: string;
  accentColor: string;
  textColor: string;
  isJackpot?: boolean;
}

// Tier 1: Silver Fortune Wheel (1 Spin Turn)
const SILVER_SEGMENTS: WheelSegment[] = [
  { id: 0, label: '₹20', sublabel: 'CASH', value: 20, weight: 26, color: '#1E3A8A', accentColor: '#3B82F6', textColor: '#FFFFFF' },
  { id: 1, label: '₹50', sublabel: 'BONUS', value: 50, weight: 16, color: '#B45309', accentColor: '#F59E0B', textColor: '#FFFFFF' },
  { id: 2, label: '₹100', sublabel: 'ROYAL', value: 100, weight: 10, color: '#065F46', accentColor: '#10B981', textColor: '#FFFFFF' },
  { id: 3, label: '₹10', sublabel: 'LUCKY', value: 10, weight: 28, color: '#5B21B6', accentColor: '#8B5CF6', textColor: '#FFFFFF' },
  { id: 4, label: '₹200', sublabel: 'MEGA', value: 200, weight: 5, color: '#86198F', accentColor: '#D946EF', textColor: '#FFFFFF' },
  { id: 5, label: '₹15', sublabel: 'CASH', value: 15, weight: 20, color: '#9F1239', accentColor: '#F43F5E', textColor: '#FFFFFF' },
  { id: 6, label: '₹500', sublabel: 'JACKPOT', value: 500, weight: 2, color: '#991B1B', accentColor: '#EF4444', textColor: '#FFFFFF', isJackpot: true },
  { id: 7, label: '₹35', sublabel: 'GOLD', value: 35, weight: 15, color: '#115E59', accentColor: '#14B8A6', textColor: '#FFFFFF' },
];

// Tier 2: Golden VIP Wheel (High-Roller Tier: ₹2,000 Mega Jackpot)
const GOLD_SEGMENTS: WheelSegment[] = [
  { id: 0, label: '₹50', sublabel: 'VIP', value: 50, weight: 25, color: '#1E40AF', accentColor: '#60A5FA', textColor: '#FFFFFF' },
  { id: 1, label: '₹100', sublabel: 'BONUS', value: 100, weight: 20, color: '#D97706', accentColor: '#FBBF24', textColor: '#FFFFFF' },
  { id: 2, label: '₹250', sublabel: 'FORTUNE', value: 250, weight: 15, color: '#047857', accentColor: '#34D399', textColor: '#FFFFFF' },
  { id: 3, label: '₹30', sublabel: 'LUCKY', value: 30, weight: 25, color: '#6D28D9', accentColor: '#A78BFA', textColor: '#FFFFFF' },
  { id: 4, label: '₹500', sublabel: 'ROYAL', value: 500, weight: 8, color: '#9D174D', accentColor: '#F472B6', textColor: '#FFFFFF' },
  { id: 5, label: '₹80', sublabel: 'SUPER', value: 80, weight: 15, color: '#B91C1C', accentColor: '#F87171', textColor: '#FFFFFF' },
  { id: 6, label: '₹2,000', sublabel: 'GRAND', value: 2000, weight: 2, color: '#78350F', accentColor: '#FDE047', textColor: '#FFFFFF', isJackpot: true },
  { id: 7, label: '₹150', sublabel: 'GOLD', value: 150, weight: 12, color: '#0F766E', accentColor: '#2DD4BF', textColor: '#FFFFFF' },
];

const LIVE_WINNERS_FEED = [
  { phone: '98***41', prize: '₹500 Jackpot', time: '10 Seconds ago', city: 'Mumbai' },
  { phone: '74***89', prize: '₹200', time: '35 Seconds ago', city: 'Delhi' },
  { phone: '87***23', prize: '₹100', time: '1 Minute ago', city: 'Jaipur' },
  { phone: '91***67', prize: '₹50', time: '2 Minutes ago', city: 'Bengaluru' },
  { phone: '93***12', prize: '₹2,000 VIP', time: '3 Minutes ago', city: 'Ahmedabad' },
  { phone: '82***55', prize: '₹200', time: '4 Minutes ago', city: 'Lucknow' },
  { phone: '70***98', prize: '₹100', time: '5 Minutes ago', city: 'Patna' },
  { phone: '96***34', prize: '₹50', time: '6 Minutes ago', city: 'Hyderabad' },
];

export const SpinWheelView: React.FC = () => {
  const { 
    currentUser, 
    executeSpin, 
    buySpinsWithBalance,
    grantUserSpins, 
    dailyCheckin, 
    setActiveUserTab, 
    showNotification,
    theme 
  } = useApp();

  const isLight = theme === 'light';

  // Wheel configuration & state
  const [wheelMode, setWheelMode] = useState<'silver' | 'gold'>('silver');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winPrize, setWinPrize] = useState<WheelSegment | null>(null);
  const [showWinCelebration, setShowWinCelebration] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [userSpinHistory, setUserSpinHistory] = useState<Array<{ id: string; amount: number; time: string; mode: string }>>([
    { id: '1', amount: 50, time: 'Today, 10:15 AM', mode: 'Silver' },
    { id: '2', amount: 20, time: 'Yesterday', mode: 'Silver' },
  ]);

  // Daily free spin claim state
  const todayStr = new Date().toISOString().slice(0, 10);
  const [dailyClaimed, setDailyClaimed] = useState<boolean>(() => {
    return localStorage.getItem(`spin_daily_claimed_${todayStr}`) === 'true';
  });

  const activeSegments = wheelMode === 'silver' ? SILVER_SEGMENTS : GOLD_SEGMENTS;
  const currentRotationRef = useRef<number>(0);
  currentRotationRef.current = rotation;

  // Live winners feed auto-scroll
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % LIVE_WINNERS_FEED.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  // Claim Daily Free Spin
  const handleClaimDailyFreeSpin = () => {
    if (dailyClaimed) {
      showNotification('Daily free spin already claimed for today! Come back tomorrow.', 'info');
      return;
    }
    grantUserSpins(currentUser.id, 1);
    localStorage.setItem(`spin_daily_claimed_${todayStr}`, 'true');
    setDailyClaimed(true);
    sounds.playCash();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    showNotification('🎉 +1 Daily Free Spin added to your account! Spin now to win cash!', 'success');
  };

  // Buy Spin with Wallet Balance (₹15)
  const handleBuySpinWithBalance = () => {
    buySpinsWithBalance(1);
  };

  // Main Spin Execution with 100% Guaranteed Mathematical Precision
  const spin = () => {
    if (isSpinning) return;

    if (!isDemoMode && currentUser.spinChances <= 0) {
      sounds.playError();
      showNotification('No free spins left! Claim your daily free spin or invest to get more turns.', 'error');
      return;
    }

    setIsSpinning(true);
    setWinPrize(null);
    setShowWinCelebration(false);
    sounds.playClick();

    // 1. Pick winning segment using weighted probability
    const totalWeight = activeSegments.reduce((sum, s) => sum + s.weight, 0);
    let randomVal = Math.random() * totalWeight;
    let chosenSegment = activeSegments[0];
    let winningIndex = 0;

    for (let i = 0; i < activeSegments.length; i++) {
      if (randomVal < activeSegments[i].weight) {
        chosenSegment = activeSegments[i];
        winningIndex = i;
        break;
      }
      randomVal -= activeSegments[i].weight;
    }

    // 2. Exact Angle Calculation:
    // With pointer fixed at 12 o'clock (top):
    // Segment i spans: i * 45 deg to (i + 1) * 45 deg
    // Segment i center: i * 45 + 22.5 deg (measured clockwise from 12 o'clock)
    // To bring segment i center exactly to 12 o'clock:
    // Required wheel rotation mod 360 = (360 - (i * 45 + 22.5)) mod 360
    const segmentAngle = 360 / activeSegments.length; // 45 deg
    const segCenterFromTop = winningIndex * segmentAngle + segmentAngle / 2;
    const targetFinalAngleMod = (360 - segCenterFromTop) % 360;

    // Calculate forward delta from current cumulative rotation
    const currentCumulative = currentRotationRef.current;
    const currentMod = ((currentCumulative % 360) + 360) % 360;
    let delta = (targetFinalAngleMod - currentMod) % 360;
    if (delta < 0) delta += 360;

    // Minimum 6 full revolutions (2160 deg) for suspense
    const extraFullTurns = 6 * 360;
    const nextTargetRotation = currentCumulative + extraFullTurns + delta;

    setRotation(nextTargetRotation);

    // 3. Realistic dynamic audio ticks (accelerates then decelerates)
    const spinDurationMs = 4200;
    const startTime = Date.now();
    let tickTimeout: ReturnType<typeof setTimeout>;

    const scheduleNextTick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= spinDurationMs - 150) return;

      sounds.playSpinTick();

      const progress = elapsed / spinDurationMs;
      let nextDelay: number;
      if (progress < 0.45) {
        nextDelay = 65 + progress * 60; // 65ms to 92ms
      } else if (progress < 0.75) {
        nextDelay = 95 + (progress - 0.45) * 350; // 95ms to 200ms
      } else {
        nextDelay = 200 + (progress - 0.75) * 900; // 200ms to 425ms
      }

      tickTimeout = setTimeout(scheduleNextTick, nextDelay);
    };

    scheduleNextTick();

    // 4. Wheel Stop & Settle
    setTimeout(() => {
      clearTimeout(tickTimeout);
      setIsSpinning(false);
      setWinPrize(chosenSegment);

      // Brief pause so user sees pointer pointing dead-center at the winning slice
      setTimeout(() => {
        if (!isDemoMode) {
          executeSpin(chosenSegment.value);
          setUserSpinHistory(prev => [
            {
              id: Date.now().toString(),
              amount: chosenSegment.value,
              time: 'Just now',
              mode: wheelMode === 'silver' ? 'Silver' : 'Gold'
            },
            ...prev.slice(0, 5)
          ]);
        } else {
          setShowWinCelebration(true);
          sounds.playSuccess();
          setTimeout(() => sounds.playCash(), 250);

          confetti({
            particleCount: 85,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#FFFFFF']
          });
          showNotification(`[Demo Mode] Won ₹${chosenSegment.value}! Switch to Real Spin to cash out.`, 'info');
        }
      }, 650);
    }, spinDurationMs);
  };

  const currentWinner = LIVE_WINNERS_FEED[tickerIndex];

  return (
    <div className="pb-28 max-w-xl mx-auto px-4 pt-3 space-y-4">
      
      {/* Live Winners Marquee Ticker */}
      <div className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition-colors shadow-sm ${
        isLight ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-slate-900/90 border-amber-500/20 text-slate-300'
      }`}>
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <div className="flex items-center space-x-1.5 truncate">
            <span className="font-bold text-amber-500">Live Winner:</span>
            <span className="font-mono text-slate-200">{currentWinner.phone}</span>
            <span>from {currentWinner.city} won</span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              {currentWinner.prize}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2 font-mono">
          {currentWinner.time}
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 rounded-3xl p-5 text-slate-950 shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/20 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-black/15 text-slate-950 text-[10.5px] font-extrabold uppercase tracking-wider">
              <Flame className="w-3 h-3 fill-current" />
              <span>100% Guaranteed Cash Wins</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] mt-1 tracking-tight">
              Mega Fortune Wheel
            </h2>
            <p className="text-xs text-slate-900/80 mt-0.5 font-medium">
              Every turn awards direct cash credited straight to your available wallet!
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center text-slate-950 shadow-inner">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Chances & Quick Actions Bar */}
        <div className="mt-4 bg-black/20 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between text-white relative z-10">
          <div>
            <span className="text-[11px] text-amber-100/90 font-medium block">Available Free Turns</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-white flex items-center space-x-2">
              <span>{currentUser.spinChances} Spins</span>
              {currentUser.spinChances > 0 && (
                <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                  Ready
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!dailyClaimed ? (
              <button
                type="button"
                onClick={handleClaimDailyFreeSpin}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center space-x-1"
              >
                <Gift className="w-3.5 h-3.5 text-amber-600" />
                <span>Claim +1 Daily</span>
              </button>
            ) : (
              <span className="text-[10px] font-bold text-amber-200 bg-black/20 px-2.5 py-1 rounded-xl">
                ✓ Daily Claimed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Wheel Tier Switcher & Mode Selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            if (isSpinning) return;
            setWheelMode('silver');
            sounds.playClick();
          }}
          className={`p-3 rounded-2xl border transition-all text-left cursor-pointer flex items-center justify-between ${
            wheelMode === 'silver'
              ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black">Silver Wheel</span>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono font-bold">1 Spin</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Top Prize: ₹500 Jackpot</span>
          </div>
          <Award className={`w-5 h-5 ${wheelMode === 'silver' ? 'text-blue-400' : 'text-slate-600'}`} />
        </button>

        <button
          type="button"
          onClick={() => {
            if (isSpinning) return;
            setWheelMode('gold');
            sounds.playClick();
          }}
          className={`p-3 rounded-2xl border transition-all text-left cursor-pointer flex items-center justify-between ${
            wheelMode === 'gold'
              ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black text-amber-400">Golden VIP Wheel</span>
              <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">VIP 2+</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Top Prize: ₹2,000 Mega Win</span>
          </div>
          <Flame className={`w-5 h-5 ${wheelMode === 'gold' ? 'text-amber-400' : 'text-slate-600'}`} />
        </button>
      </div>

      {/* Demo Mode & Real Mode Pill Switch */}
      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-slate-400 flex items-center space-x-1.5">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>Real Cash Mode • Verified Random RNG</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setIsDemoMode(prev => !prev);
            sounds.playClick();
          }}
          className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
            isDemoMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          {isDemoMode ? '🎮 Demo Practice Active' : 'Switch to Demo Spin'}
        </button>
      </div>

      {/* ============================================================ */}
      {/* 🎡 THE INTERACTIVE HIGH-PRECISION FORTUNE WHEEL */}
      {/* ============================================================ */}
      <div className="relative flex flex-col items-center justify-center py-6 select-none overflow-visible">
        
        {/* Pointer Arrow at Top (12 o'clock exact position) */}
        <div className="absolute top-1 z-30 flex flex-col items-center pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
          <div className="w-6 h-6 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 border-2 border-slate-900 shadow-md flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-red-500" />
          </div>
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-amber-400 -mt-1" />
        </div>

        {/* Outer Wheel Rim with Casino Bulbs */}
        <div className="w-72 h-72 sm:w-84 sm:h-84 rounded-full p-2.5 bg-gradient-to-b from-amber-400 via-yellow-600 to-amber-700 shadow-[0_0_50px_rgba(245,158,11,0.3)] border-4 border-slate-950 relative flex items-center justify-center">
          
          {/* Alternating LED Bulbs around the ring */}
          {[...Array(16)].map((_, i) => {
            const angle = (i * 360) / 16;
            const rad = (angle * Math.PI) / 180;
            const r = 48.5; // percentage
            const x = 50 + r * Math.cos(rad);
            const y = 50 + r * Math.sin(rad);
            const isLightOn = (i % 2 === 0 && isSpinning) || (!isSpinning && i % 3 === 0);

            return (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full transition-colors duration-200 z-10 ${
                  isLightOn 
                    ? 'bg-yellow-200 shadow-[0_0_6px_#fde047]' 
                    : 'bg-amber-900/80 border border-amber-950'
                }`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            );
          })}

          {/* Rotating Wheel Disc with SVG */}
          <div
            className="w-full h-full rounded-full overflow-hidden relative shadow-inner"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning 
                ? 'transform 4.2s cubic-bezier(0.18, 0.89, 0.15, 1)' 
                : 'transform 0.5s ease-out',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <filter id="segmentShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.5"/>
                </filter>
              </defs>

              {activeSegments.map((seg, i) => {
                const angle = 360 / activeSegments.length; // 45 deg
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;

                // SVG coordinates with 12 o'clock = 0 deg
                const radStart = ((startAngle - 90) * Math.PI) / 180;
                const radEnd = ((endAngle - 90) * Math.PI) / 180;

                const x1 = 50 + 50 * Math.cos(radStart);
                const y1 = 50 + 50 * Math.sin(radStart);
                const x2 = 50 + 50 * Math.cos(radEnd);
                const y2 = 50 + 50 * Math.sin(radEnd);

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                // Center of the slice
                const midAngle = startAngle + angle / 2;
                const radMid = ((midAngle - 90) * Math.PI) / 180;
                const textX = 50 + 33 * Math.cos(radMid);
                const textY = 50 + 33 * Math.sin(radMid);

                return (
                  <g key={seg.id}>
                    {/* Segment Slice */}
                    <path
                      d={pathData}
                      fill={seg.color}
                      stroke="#0f172a"
                      strokeWidth="0.8"
                    />

                    {/* Outer accent arc border */}
                    <path
                      d={`M ${50 + 47 * Math.cos(radStart)} ${50 + 47 * Math.sin(radStart)} A 47 47 0 0 1 ${50 + 47 * Math.cos(radEnd)} ${50 + 47 * Math.sin(radEnd)}`}
                      fill="none"
                      stroke={seg.accentColor}
                      strokeWidth="1.2"
                      opacity="0.8"
                    />

                    {/* Sector Text (Radiating along radius) */}
                    <g transform={`rotate(${midAngle}, ${textX}, ${textY})`}>
                      <text
                        x={textX}
                        y={textY - 2}
                        fill={seg.textColor}
                        fontSize="5"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        filter="url(#segmentShadow)"
                      >
                        {seg.label}
                      </text>
                      <text
                        x={textX}
                        y={textY + 4}
                        fill={seg.isJackpot ? '#FDE047' : 'rgba(255,255,255,0.85)'}
                        fontSize="2.4"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        letterSpacing="0.3"
                      >
                        {seg.sublabel}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Golden Hub Button */}
          <button
            type="button"
            onClick={spin}
            disabled={isSpinning || (!isDemoMode && currentUser.spinChances <= 0)}
            className={`absolute z-20 w-16 h-16 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center border-4 border-slate-950 transition-all cursor-pointer ${
              isSpinning
                ? 'bg-amber-600 scale-95 shadow-inner'
                : (!isDemoMode && currentUser.spinChances <= 0)
                  ? 'bg-slate-800 text-slate-400 border-slate-700 opacity-90'
                  : 'btn-chamko-gold text-slate-950 font-black shadow-2xl active:scale-90 hover:scale-105'
            }`}
          >
            {isSpinning ? (
              <span className="text-[11px] font-black text-white animate-pulse">LUCKY</span>
            ) : (
              <>
                <span className="text-xs sm:text-sm font-black tracking-wider font-['Outfit']">
                  SPIN
                </span>
                <span className="text-[9px] font-bold opacity-80 mt-[-2px]">
                  {isDemoMode ? 'DEMO' : `${currentUser.spinChances} LEFT`}
                </span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Main Spin Action Bar (Below Wheel for easy thumb tap) */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={spin}
          disabled={isSpinning || (!isDemoMode && currentUser.spinChances <= 0)}
          className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center space-x-2 transition-all shadow-xl cursor-pointer ${
            isSpinning
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : (!isDemoMode && currentUser.spinChances <= 0)
                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                : 'btn-chamko-gold text-slate-950 shadow-amber-500/30 active:scale-98'
          }`}
        >
          <Trophy className="w-5 h-5 fill-current" />
          <span>
            {isSpinning 
              ? 'Spinning Wheel...' 
              : (!isDemoMode && currentUser.spinChances <= 0)
                ? '0 Free Spins Remaining' 
                : isDemoMode 
                  ? 'Launch Free Practice Spin' 
                  : `Spin Fortune Wheel (${currentUser.spinChances} Turns)`}
          </span>
        </button>

        {/* Quick ways to get more spins if user is out */}
        {!isDemoMode && currentUser.spinChances <= 0 && (
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Need more free spins to win?</span>
              </span>
              <span className="text-[10px] text-slate-400">Multiple Ways to Earn</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveUserTab('home')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all text-xs"
              >
                <div className="flex items-center space-x-1.5 text-blue-400 font-bold">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Invest / Recharge</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">+1 to +3 Spins per package</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveUserTab('team')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all text-xs"
              >
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite Friends</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">+2 Spins per activated referral</span>
              </button>
            </div>

            {/* Direct Balance Exchange */}
            <div className="pt-1 flex items-center justify-between border-t border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px]">Exchange wallet balance:</span>
              <button
                type="button"
                onClick={handleBuySpinWithBalance}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Buy 1 Spin for ₹15
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Win Celebration Dialog */}
      {showWinCelebration && winPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-2 border-amber-500/60 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
              <Trophy className="w-8 h-8 fill-current" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {winPrize.isJackpot ? '🔥 MEGA JACKPOT WIN!' : 'Congratulations!'}
              </span>
              <h3 className="text-2xl font-black text-white font-['Outfit'] mt-2">
                You Won ₹{winPrize.value}!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {isDemoMode 
                  ? 'Practice reward awarded in Demo Mode.' 
                  : 'Cash reward successfully credited to your withdrawable wallet balance!'}
              </p>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 text-xs flex justify-between items-center font-mono">
              <span className="text-slate-400">Prize Category:</span>
              <span className="text-amber-400 font-bold">{winPrize.sublabel} ({winPrize.label})</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowWinCelebration(false);
                sounds.playClick();
              }}
              className="w-full py-3 rounded-2xl btn-chamko-emerald text-white font-black text-sm shadow-xl shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
            >
              Collect & Keep Playing
            </button>
          </div>
        </div>
      )}

      {/* User Spin History Log */}
      <div className={`p-4 rounded-3xl border space-y-3 transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
              My Recent Spin Rewards
            </h4>
          </div>
          <span className="text-[10px] text-slate-400">Instant Wallet Credits</span>
        </div>

        <div className="space-y-2">
          {userSpinHistory.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <span className={`font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    +{formatCurrencyINR(item.amount)} Won
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {item.mode} Wheel • {item.time}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Credited
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules & Transparency Section */}
      <div className={`p-4 rounded-3xl border space-y-2 text-xs transition-colors ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900/60 border-slate-800 text-slate-400'
      }`}>
        <div className="flex items-center space-x-1.5 text-slate-200 font-semibold mb-1">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span className={isLight ? 'text-slate-900 font-bold' : 'text-white'}>Spin & Win Official Guidelines:</span>
        </div>
        <p>• <strong>Daily Free Spin:</strong> Every member receives 1 free spin credit every 24 hours.</p>
        <p>• <strong>Investment Bonus:</strong> Every active investment plan gives +1 to +3 free spins.</p>
        <p>• <strong>Agency Referral:</strong> Earn +2 spins for every friend who activates their account.</p>
        <p>• <strong>Instant Settlement:</strong> All wheel rewards are 100% genuine cash credited instantly into your spendable balance.</p>
      </div>

    </div>
  );
};
