import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Gift, 
  Calendar, 
  CheckCircle2, 
  Zap, 
  Users, 
  TrendingUp, 
  ArrowRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenInvite?: () => void;
}

export const MissionsModal: React.FC<Props> = ({ isOpen, onClose, onOpenInvite }) => {
  const { currentUser, settings, dailyCheckin } = useApp();
  const [checkedToday, setCheckedToday] = useState(false);

  if (!isOpen) return null;

  const streakDays = [
    { day: 'Day 1', reward: 15, spins: 1 },
    { day: 'Day 2', reward: 25, spins: 1 },
    { day: 'Day 3', reward: 35, spins: 1 },
    { day: 'Day 4', reward: 50, spins: 2 },
    { day: 'Day 5', reward: 65, spins: 2 },
    { day: 'Day 6', reward: 80, spins: 2 },
    { day: 'Day 7', reward: 120, spins: 3, special: true },
  ];

  const handleClaim = () => {
    if (checkedToday) return;
    dailyCheckin();
    setCheckedToday(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white font-['Outfit']">Daily Mission Hub</h2>
                <span className="text-[10px] bg-red-500 text-white font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">New</span>
              </div>
              <p className="text-xs text-slate-400">Claim Attendance Bonus & Complete Milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Day Attendance Grid */}
        <div className="mt-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>7-Day Sign-in Streak</span>
            </span>
            <span className="text-xs text-amber-400 font-bold">Total ₹390 + 12 Spins</span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-2">
            {streakDays.slice(0, 4).map((d, i) => (
              <div
                key={d.day}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  i === 0 && checkedToday
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="text-[11px] text-slate-400 mb-1">{d.day}</div>
                <div className="text-sm font-black text-amber-400 font-mono">₹{d.reward}</div>
                <div className="text-[10px] text-blue-400 mt-1">+{d.spins} Spin</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {streakDays.slice(4).map((d) => (
              <div
                key={d.day}
                className={`p-3 rounded-2xl border text-center relative overflow-hidden ${
                  d.special
                    ? 'bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                {d.special && (
                  <span className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg">
                    JACKPOT
                  </span>
                )}
                <div className="text-[11px] text-slate-400 mb-1">{d.day}</div>
                <div className="text-sm font-black text-amber-400 font-mono">₹{d.reward}</div>
                <div className="text-[10px] text-blue-400 mt-1">+{d.spins} Spins</div>
              </div>
            ))}
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={checkedToday}
            className={`w-full py-3 rounded-xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              checkedToday
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 font-bold'
                : 'btn-chamko bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-black shadow-xl shadow-orange-500/40 active:scale-98'
            }`}
          >
            {checkedToday ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Today's Bonus Claimed</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Sign in Today & Claim ₹{settings.dailyCheckinReward}</span>
              </>
            )}
          </button>
        </div>

        {/* Milestone Tasks */}
        <div className="mt-6 space-y-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Growth Tasks
          </span>

          <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Invite 3 Active Friends</h4>
                <p className="text-[11px] text-slate-400">Reward: ₹150 + 5 Lucky Spins</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenInvite?.();
              }}
              className="text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-xl transition-colors"
            >
              Go Invite
            </button>
          </div>

          <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">First Investment Plan</h4>
                <p className="text-[11px] text-slate-400">Reward: Guaranteed 2-day daily profit</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
