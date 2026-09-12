import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Trophy, HelpCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

const WHEEL_SEGMENTS = [
  { label: '₹20', value: 20, color: '#2563EB', textColor: '#FFFFFF' },
  { label: '₹50', value: 50, color: '#D97706', textColor: '#FFFFFF' },
  { label: '₹100', value: 100, color: '#059669', textColor: '#FFFFFF' },
  { label: '₹0 (Luck)', value: 0, color: '#475569', textColor: '#CBD5E1' },
  { label: '₹200', value: 200, color: '#7C3AED', textColor: '#FFFFFF' },
  { label: '₹15', value: 15, color: '#DB2777', textColor: '#FFFFFF' },
  { label: '₹500', value: 500, color: '#DC2626', textColor: '#FFFFFF' },
  { label: '₹35', value: 35, color: '#0D9488', textColor: '#FFFFFF' },
];

export const SpinWheelView: React.FC = () => {
  const { currentUser, executeSpin } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winPrize, setWinPrize] = useState<number | null>(null);

  const spin = () => {
    if (isSpinning || currentUser.spinChances <= 0) return;

    setIsSpinning(true);
    setWinPrize(null);
    sounds.playClick();

    // Pick a random segment (weighted slightly toward winning!)
    const winningIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const selectedPrize = WHEEL_SEGMENTS[winningIndex];

    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    // Calculate final rotation so the arrow (at top 270 deg / 0 deg) lands on the chosen index
    const extraSpins = 5 * 360; // 5 full rotations
    const targetAngle = extraSpins + (360 - (winningIndex * segmentAngle + segmentAngle / 2));

    setRotation(prev => prev + targetAngle);

    // Play periodic ticking sounds
    const tickInterval = setInterval(() => {
      sounds.playSpinTick();
    }, 150);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWinPrize(selectedPrize.value);
      executeSpin(selectedPrize.value);

      if (selectedPrize.value > 0) {
        sounds.playSuccess();
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.5 }
        });
      }
    }, 3800);
  };

  return (
    <div className="pb-28 max-w-xl mx-auto px-4 pt-4 space-y-5">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mega Fortune Wheel</span>
        </div>
        <h2 className="text-2xl font-black text-white font-['Outfit']">Spin & Win Daily Cash</h2>
        <p className="text-xs text-slate-400">
          Every investment gives you +1 free spin chance to win up to ₹500 directly into your wallet!
        </p>
      </div>

      {/* Chances Counter Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Available Free Spins</div>
            <div className="text-xl font-black text-amber-400 font-mono">
              {currentUser.spinChances} Spins Left
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Total Won</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">Real Cash</span>
        </div>
      </div>

      {/* Interactive Wheel Container */}
      <div className="relative flex flex-col items-center justify-center py-6">
        
        {/* Pointer Arrow at Top */}
        <div className="absolute top-2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(245,158,11,0.5)]" />

        {/* Outer Wheel Rim */}
        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full p-2 bg-gradient-to-b from-amber-400 via-amber-600 to-amber-700 shadow-[0_0_40px_rgba(245,158,11,0.25)] border-4 border-slate-950 relative flex items-center justify-center">
          
          {/* Rotating Wheel */}
          <div
            className="w-full h-full rounded-full overflow-hidden relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 3.8s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {WHEEL_SEGMENTS.map((seg, i) => {
                const angle = 360 / WHEEL_SEGMENTS.length;
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;
                
                // SVG sector calculation
                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                const midAngle = startAngle + angle / 2;
                const textX = 50 + 32 * Math.cos((Math.PI * midAngle) / 180);
                const textY = 50 + 32 * Math.sin((Math.PI * midAngle) / 180);

                return (
                  <g key={i}>
                    <path d={pathData} fill={seg.color} stroke="#0f172a" strokeWidth="0.8" />
                    <text
                      x={textX}
                      y={textY}
                      fill={seg.textColor}
                      fontSize="5"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Hub Button */}
          <button
            onClick={spin}
            disabled={isSpinning || currentUser.spinChances <= 0}
            className="absolute z-10 w-16 h-16 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center shadow-2xl border-4 border-slate-900 active:scale-95 disabled:opacity-60 transition-transform"
          >
            <span>{isSpinning ? '...' : 'SPIN'}</span>
          </button>
        </div>

      </div>

      {/* Prize Win Banner */}
      {winPrize !== null && (
        <div className="bg-gradient-to-r from-amber-950/80 to-emerald-950/80 border border-amber-500/50 rounded-2xl p-4 text-center animate-in zoom-in-95">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Congratulations!</h4>
          <p className="text-xl font-extrabold text-white mt-0.5">
            {winPrize > 0 ? `You won ₹${winPrize} cash reward!` : 'Better luck on your next spin!'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {winPrize > 0 ? 'Amount credited straight to your available balance.' : 'Spin again to claim the jackpot!'}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center space-x-1.5 text-slate-200 font-semibold mb-1">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span>How to Get More Free Spins:</span>
        </div>
        <p>• Complete Daily Sign-in Check-in: <strong className="text-slate-200">+1 Spin</strong></p>
        <p>• Activate any Investment Package: <strong className="text-slate-200">+1 Spin per purchase</strong></p>
        <p>• Invite friends who activate accounts: <strong className="text-slate-200">+2 Spins per referral</strong></p>
      </div>

    </div>
  );
};
