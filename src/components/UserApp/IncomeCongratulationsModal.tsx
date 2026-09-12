import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle2, 
  Sparkles, 
  Share2, 
  FileText, 
  ArrowRight, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Zap, 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  Layers,
  Flame,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

export const IncomeCongratulationsModal: React.FC = () => {
  const { 
    celebrationData, 
    closeIncomeCelebration, 
    openRecordsModal, 
    currentUser, 
    settings, 
    theme 
  } = useApp();

  const isLight = theme === 'light';
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!celebrationData) return;

    // Play celebration sound
    sounds.playSuccess();

    // Trigger multi-stage confetti burst
    const end = Date.now() + 1200;
    const colors = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#EAB308'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Center starburst pop
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#10B981', '#3B82F6']
    });
  }, [celebrationData]);

  if (!celebrationData) return null;

  const referralLink = `${window.location.origin}/?ref=${currentUser.referralCode}`;
  const shareMessage = `🎉 Just received +₹${celebrationData.amount.toLocaleString()} from ${settings.platformName}! Verified daily income and instant bank withdrawals. Join using my VIP invite code ${currentUser.referralCode}: ${referralLink}`;

  const handleShareWhatsApp = () => {
    sounds.playClick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopiedShare(true);
    sounds.playClick();
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleViewRecords = () => {
    sounds.playClick();
    closeIncomeCelebration();
    openRecordsModal('income');
  };

  const getSourceIcon = () => {
    switch (celebrationData.source) {
      case 'dividend':
      case 'bulk_dividend':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'referral':
        return <Award className="w-5 h-5 text-indigo-400" />;
      case 'milestone':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'spin':
        return <Sparkles className="w-5 h-5 text-pink-400" />;
      default:
        return <Zap className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getSourceBadge = () => {
    switch (celebrationData.source) {
      case 'dividend':
        return 'Daily Asset Dividend';
      case 'bulk_dividend':
        return 'Bulk Portfolio Settlement';
      case 'referral':
        return '3-Tier Agency Rebate';
      case 'milestone':
        return 'Agency Rank Milestone';
      case 'spin':
        return 'Lucky Fortune Wheel';
      case 'checkin':
        return 'Daily Attendance Bonus';
      case 'voucher':
        return 'Gift Voucher Credit';
      default:
        return 'Verified Income';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-sm sm:max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border overflow-hidden text-center transition-all animate-in zoom-in-95 duration-200 ${
          isLight 
            ? 'bg-gradient-to-b from-white via-slate-50 to-emerald-50/40 border-emerald-200 text-slate-900 shadow-emerald-500/20' 
            : 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/40 text-white shadow-emerald-950/50'
        }`}
      >
        {/* Background glow discs */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeIncomeCelebration}
          className={`absolute top-3.5 right-3.5 p-1.5 rounded-full transition-colors ${
            isLight ? 'hover:bg-slate-200 text-slate-400 hover:text-slate-800' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Icon with pulsating gold rings */}
        <div className="relative mx-auto w-20 h-20 mb-3 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400 to-amber-400 animate-ping opacity-25" />
          <div className="relative w-18 h-18 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 p-0.5 shadow-xl shadow-emerald-500/30 flex items-center justify-center">
            <div className={`w-full h-full rounded-2xl flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-900'}`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-inner">
                <DollarSign className="w-7 h-7 text-slate-950 stroke-[2.5]" />
              </div>
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow border border-amber-300">
            ★ VIP
          </span>
        </div>

        {/* Congratulatory Header */}
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-xs font-bold mb-1">
            {getSourceIcon()}
            <span>{getSourceBadge()}</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-['Outfit'] mt-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
            {celebrationData.title || 'Income Credited Successfully!'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {celebrationData.sourceTitle || 'Liquid earnings settled into your balance'}
          </p>
        </div>

        {/* Big Profit Counter Box */}
        <div className={`my-4 py-3.5 px-4 rounded-2xl border ${
          isLight 
            ? 'bg-emerald-50/80 border-emerald-200' 
            : 'bg-emerald-950/30 border-emerald-500/30'
        }`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
            Total Settled Amount
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight flex items-center justify-center space-x-1">
            <span>+₹{celebrationData.amount.toLocaleString()}</span>
          </div>

          {celebrationData.planName && (
            <div className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center space-x-1.5">
              <span>{celebrationData.planName}</span>
              {celebrationData.dayProgress && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md">
                  {celebrationData.dayProgress}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Live Wallet & Audit Snapshot */}
        <div className={`p-3 rounded-2xl border text-left text-xs space-y-1.5 mb-4 ${
          isLight ? 'bg-slate-100/70 border-slate-200 text-slate-700' : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center space-x-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Available Wallet Balance:</span>
            </span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
              ₹{(celebrationData.newBalance !== undefined ? celebrationData.newBalance : currentUser.balance).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60 pt-1.5 text-[11px]">
            <span className="text-slate-500 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Clearance Status:</span>
            </span>
            <span className="font-semibold text-emerald-500 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Instant NPCI / Wallet Credited</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* View in Financial Records */}
          <button
            onClick={handleViewRecords}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 border transition-all active:scale-95 ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm' 
                : 'bg-slate-800 hover:bg-slate-750 text-white border-slate-700 shadow-sm'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>View in Financial Passbook</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* WhatsApp Share to Friends */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>

            <button
              onClick={handleCopyShare}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all active:scale-95 ${
                isLight 
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedShare ? 'Copied!' : 'Copy Proof'}</span>
            </button>
          </div>

          {/* Primary Dismiss Button */}
          <button
            onClick={closeIncomeCelebration}
            className="w-full mt-1 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            Awesome, Continue Earning
          </button>
        </div>
      </div>
    </div>
  );
};
