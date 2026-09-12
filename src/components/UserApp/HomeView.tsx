import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  Download, 
  Gift, 
  QrCode, 
  Headphones, 
  Star, 
  TrendingUp, 
  ShoppingCart, 
  Check, 
  Clock, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Flame,
  Zap,
  Info,
  FileText
} from 'lucide-react';
import { RechargeModal } from './RechargeModal';
import { WithdrawModal } from './WithdrawModal';
import { MissionsModal } from './MissionsModal';
import { InviteModal } from './InviteModal';
import { OnlineSupportModal } from './OnlineSupportModal';
import { InvestmentPlan } from '../../types';
import { sounds } from '../../utils/audio';

export const HomeView: React.FC = () => {
  const { 
    currentUser, 
    plans, 
    purchasePlan, 
    settings,
    setActiveUserTab,
    openRecordsModal 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'normal' | 'vip' | 'flash' | 'high_return'>('normal');
  const [flashFilter, setFlashFilter] = useState<'all' | '1-5m' | '15-30m' | '1h'>('all');
  const [selectedPlanForBuy, setSelectedPlanForBuy] = useState<InvestmentPlan | null>(null);

  // Modals state
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isOnlineOpen, setIsOnlineOpen] = useState(false);

  const filteredPlans = plans.filter(p => {
    if (p.category !== activeTab) return false;
    if (activeTab === 'flash' && flashFilter !== 'all') {
      const durationMins = p.cycleUnit === 'hour' ? (p.cycleDuration || 1) * 60 : (p.cycleDuration || 1);
      if (flashFilter === '1-5m') return durationMins <= 5;
      if (flashFilter === '15-30m') return durationMins > 5 && durationMins <= 30;
      if (flashFilter === '1h') return durationMins >= 60;
    }
    return true;
  });

  const getDurationLabel = (plan: InvestmentPlan) => {
    if (plan.cycleUnit === 'minute') {
      const mins = plan.cycleDuration || 1;
      return mins === 1 ? '1 Minute' : `${mins} Minutes`;
    }
    if (plan.cycleUnit === 'hour') {
      const hrs = plan.cycleDuration || 1;
      return hrs === 1 ? '1 Hour' : `${hrs} Hours`;
    }
    return `${plan.cycleDays} Days`;
  };

  const handleBuyClick = (plan: InvestmentPlan) => {
    sounds.playClick();
    setSelectedPlanForBuy(plan);
  };

  const confirmPurchase = () => {
    if (!selectedPlanForBuy) return;
    
    if (currentUser.balance < selectedPlanForBuy.price) {
      // Prompt recharge
      setSelectedPlanForBuy(null);
      setIsRechargeOpen(true);
      return;
    }

    const res = purchasePlan(selectedPlanForBuy.id);
    if (res.success) {
      setSelectedPlanForBuy(null);
    }
  };

  return (
    <div className="pb-28 max-w-xl mx-auto px-4 pt-3 space-y-4">
      
      {/* Hero Banner (Designed exactly from user's uploaded screenshot) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 p-6 shadow-xl border border-blue-400/30 text-white">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-sky-400/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between min-h-[140px]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-blue-200">
                Official Industrial Asset Portfolio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit'] mt-1 text-white">
              Strong Bonds.<br />Stronger Returns.
            </h1>
            <p className="text-xs text-blue-100/90 mt-1 max-w-xs leading-relaxed">
              Backed by high-grade manufacturing lines & rapid capital turnarounds.
            </p>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-blue-400/30">
            <div className="text-[11px] text-blue-200 font-medium">
              Daily Settlement: <span className="text-amber-300 font-bold">100% Guaranteed</span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
              SEBI Compliant Node
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions (5 icons matching the screenshot) */}
      <div className="grid grid-cols-5 gap-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-md">
        {/* Recharge */}
        <button
          onClick={() => setIsRechargeOpen(true)}
          className="flex flex-col items-center group active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-300 mt-1.5 group-hover:text-blue-400">Recharge</span>
        </button>

        {/* Withdraw */}
        <button
          onClick={() => setIsWithdrawOpen(true)}
          className="flex flex-col items-center group active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
            <Download className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-300 mt-1.5 group-hover:text-indigo-400">Withdraw</span>
        </button>

        {/* Mission */}
        <button
          onClick={() => setIsMissionOpen(true)}
          className="flex flex-col items-center group active:scale-95 transition-transform relative"
        >
          <span className="absolute -top-1.5 -right-0.5 bg-red-500 text-[9px] font-black text-white px-1.5 py-0.2 rounded-full uppercase">
            New
          </span>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
            <Gift className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-300 mt-1.5 group-hover:text-red-400">Mission</span>
        </button>

        {/* Invite */}
        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex flex-col items-center group active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-sm">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-300 mt-1.5 group-hover:text-amber-400">Invite</span>
        </button>

        {/* Online */}
        <button
          onClick={() => setIsOnlineOpen(true)}
          className="flex flex-col items-center group active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
            <Headphones className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-300 mt-1.5 group-hover:text-emerald-400">Online</span>
        </button>
      </div>

      {/* Live Financial Records Strip (Recharge, Income, Withdrawal) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center space-x-1.5 text-slate-400 font-medium pl-1">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-bold text-slate-300">Live Ledger:</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => openRecordsModal('recharge')}
            className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-[11px] border border-blue-500/20 flex items-center space-x-1 transition-colors"
          >
            <span>Recharge</span>
            <span className="text-[9px] opacity-75 font-normal">रिकॉर्ड</span>
          </button>
          <button
            onClick={() => openRecordsModal('income')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/20 flex items-center space-x-1 transition-colors"
          >
            <span>Income</span>
            <span className="text-[9px] opacity-75 font-normal">रिकॉर्ड</span>
          </button>
          <button
            onClick={() => openRecordsModal('withdrawal')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-[11px] border border-amber-500/20 flex items-center space-x-1 transition-colors"
          >
            <span>Withdraw</span>
            <span className="text-[9px] opacity-75 font-normal">रिकॉर्ड</span>
          </button>
        </div>
      </div>

      {/* Plan Category Switcher Tabs (Normal vs Flash 1m-1h vs VIP vs High Return) */}
      <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-4 gap-1">
        <button
          onClick={() => {
            setActiveTab('normal');
            sounds.playClick();
          }}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
            activeTab === 'normal'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Normal
        </button>

        <button
          onClick={() => {
            setActiveTab('flash');
            sounds.playClick();
          }}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center relative ${
            activeTab === 'flash'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/30 font-black'
              : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <span className="flex items-center justify-center space-x-1">
            <Zap className="w-3 h-3 fill-current" />
            <span>1m-1h</span>
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('vip');
            sounds.playClick();
          }}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
            activeTab === 'vip'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          VIP Plan
        </button>

        <button
          onClick={() => {
            setActiveTab('high_return');
            sounds.playClick();
          }}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
            activeTab === 'high_return'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          24H Return
        </button>
      </div>

      {/* When activeTab is 'flash', show duration sub-filters */}
      {activeTab === 'flash' && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-amber-400 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 fill-amber-400" />
              <span>⚡ Flash Fast-Return Plans (1m - 1h)</span>
            </span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
              Instant Liquidity
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {[
              { id: 'all', label: 'All (1m-1h)' },
              { id: '1-5m', label: '1 - 5 Min' },
              { id: '15-30m', label: '15 - 30 Min' },
              { id: '1h', label: '1 Hour' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  setFlashFilter(filter.id as any);
                  sounds.playClick();
                }}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  flashFilter === filter.id
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Investment Plans List (Exact match to screenshot card structure) */}
      <div className="space-y-4">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all"
          >
            {/* Ribbon Badge (Top Right) */}
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-l from-blue-600 to-indigo-700 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-2xl shadow-md flex items-center space-x-1">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                <span>{plan.badge}</span>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              {/* Product Visual Container */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 relative group-hover:scale-102 transition-transform">
                <img
                  src={plan.imageUrl}
                  alt={plan.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-xs text-[9px] font-mono text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                  {getDurationLabel(plan)}
                </div>
              </div>

              {/* Product Info & Metrics */}
              <div className="flex-1 space-y-2">
                <h3 className="text-base font-extrabold text-white leading-tight font-['Outfit'] pr-14">
                  {plan.name}
                </h3>

                {/* Big Price Display */}
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-white font-mono">
                    ₹{plan.price.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    / {getDurationLabel(plan)}
                  </span>
                </div>

                {/* Return Stats Cards (Matches screenshot Daily vs Total pills) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 px-2.5 py-1 rounded-xl">
                    <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-medium">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                      <span>{plan.category === 'flash' ? 'Settlement' : 'Daily'}</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-white">
                      ₹{plan.category === 'flash' ? plan.totalRevenue.toLocaleString() : plan.dailyIncome.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 px-2.5 py-1 rounded-xl">
                    <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-medium">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>{plan.category === 'flash' ? 'Net Profit' : 'Total'}</span>
                    </div>
                    <span className="font-mono font-extrabold text-xs text-amber-400">
                      {plan.category === 'flash' ? `+₹${(plan.totalRevenue - plan.price).toLocaleString()}` : `₹${plan.totalRevenue.toLocaleString()}`}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Buy Now Button (Full width blue rounded button matching screenshot) */}
            <button
              onClick={() => handleBuyClick(plan)}
              className="mt-4 w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buy Now</span>
            </button>

          </div>
        ))}
      </div>

      {/* Confirmation & Buy Modal */}
      {selectedPlanForBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Confirm Investment</h3>
              <button
                onClick={() => setSelectedPlanForBuy(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Asset:</span>
                <span className="font-bold text-white">{selectedPlanForBuy.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cycle Duration:</span>
                <span className="font-mono font-bold text-amber-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{getDurationLabel(selectedPlanForBuy)}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subscription Cost:</span>
                <span className="font-mono font-bold text-white text-sm">₹{selectedPlanForBuy.price.toLocaleString()}</span>
              </div>
              {selectedPlanForBuy.category === 'flash' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Net Profit Return:</span>
                    <span className="font-mono font-bold text-emerald-400">+₹{(selectedPlanForBuy.totalRevenue - selectedPlanForBuy.price).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Settlement Payout:</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">₹{selectedPlanForBuy.totalRevenue.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Return:</span>
                    <span className="font-mono font-bold text-emerald-400">₹{selectedPlanForBuy.dailyIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Return:</span>
                    <span className="font-mono font-bold text-amber-400">₹{selectedPlanForBuy.totalRevenue.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Your Wallet Balance:</span>
                <span className={`font-mono font-bold ${currentUser.balance >= selectedPlanForBuy.price ? 'text-emerald-400' : 'text-red-400'}`}>
                  ₹{currentUser.balance.toLocaleString()}
                </span>
              </div>
            </div>

            {currentUser.balance < selectedPlanForBuy.price && (
              <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-start space-x-2">
                <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>You need ₹{(selectedPlanForBuy.price - currentUser.balance).toLocaleString()} more. Please recharge to activate this plan.</span>
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlanForBuy(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPurchase}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
              >
                {currentUser.balance >= selectedPlanForBuy.price ? 'Confirm & Activate' : 'Recharge Wallet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Modals */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
      />
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
      />
      <MissionsModal
        isOpen={isMissionOpen}
        onClose={() => setIsMissionOpen(false)}
        onOpenInvite={() => setIsInviteOpen(true)}
      />
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
      <OnlineSupportModal
        isOpen={isOnlineOpen}
        onClose={() => setIsOnlineOpen(false)}
      />

    </div>
  );
};
