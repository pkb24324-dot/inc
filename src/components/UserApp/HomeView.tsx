import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  Download, 
  Gift, 
  QrCode, 
  Headphones, 
  Award,
  TrendingUp, 
  ShoppingCart, 
  Check, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  Flame,
  Zap,
  Info,
  Trophy
} from 'lucide-react';
import { RechargeModal } from './RechargeModal';
import { WithdrawModal } from './WithdrawModal';
import { MissionsModal } from './MissionsModal';
import { InviteModal } from './InviteModal';
import { OnlineSupportModal } from './OnlineSupportModal';
import { InvestmentPlan } from '../../types';
import { sounds } from '../../utils/audio';
import { ProfessionalAmount } from '../common/ProfessionalAmount';
import { formatCurrencyINR } from '../../utils/currencyFormatter';
import { HomeImageBanner } from './HomeImageBanner';

export const HomeView: React.FC = () => {
  const { 
    currentUser, 
    plans, 
    purchasePlan, 
    reinvestBalanceIntoPlan,
    settings,
    setActiveUserTab,
    openRecordsModal,
    activePendingDeposit
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
      
      {/* Active Deposit Polling Banner */}
      {activePendingDeposit && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-slate-900 border border-amber-500/30 flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3 w-3 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <div>
              <p className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                <span>Deposit In Progress:</span>
                <span className="font-mono text-white">₹{activePendingDeposit.amount}</span>
                <span className="text-[10px] font-mono text-amber-400/80">({activePendingDeposit.orderNo})</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Real-time UPI verification active • Automated Settlement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRechargeOpen(true)}
            className="px-3.5 py-1.5 rounded-xl btn-chamko-gold text-slate-950 font-black text-xs flex items-center space-x-1.5 transition-transform active:scale-95 cursor-pointer shadow-md shadow-amber-500/30"
          >
            <span>Open Cashier</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Hero Image Banner Carousel */}
      <HomeImageBanner 
        onSelectTab={(tab) => setActiveTab(tab)} 
        onOpenRecharge={() => setIsRechargeOpen(true)} 
      />

      {/* Quick Actions (5 radiant glossy icons matching the screenshot) */}
      <div className="grid grid-cols-5 gap-1.5 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 shadow-md">
        {/* Recharge */}
        <button
          onClick={() => setIsRechargeOpen(true)}
          className="flex flex-col items-center group active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-blue-500/25 to-blue-700/20 border border-blue-400/40 flex items-center justify-center text-blue-400 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/50">
            <CreditCard className="w-5 h-5 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
          </div>
          <span className="text-[10px] font-bold text-slate-300 mt-1 group-hover:text-blue-400 transition-colors">Recharge</span>
        </button>

        {/* Withdraw */}
        <button
          onClick={() => setIsWithdrawOpen(true)}
          className="flex flex-col items-center group active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-indigo-500/25 to-indigo-700/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-600 group-hover:text-white transition-all shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/50">
            <Download className="w-5 h-5 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
          </div>
          <span className="text-[10px] font-bold text-slate-300 mt-1 group-hover:text-indigo-400 transition-colors">Withdraw</span>
        </button>

        {/* Mission */}
        <button
          onClick={() => setIsMissionOpen(true)}
          className="flex flex-col items-center group active:scale-95 transition-transform relative cursor-pointer"
        >
          <span className="absolute -top-1 -right-0.5 bg-red-500 text-[8px] font-black text-white px-1.5 py-0.2 rounded-full uppercase shadow-sm shadow-red-500/50 animate-pulse">
            New
          </span>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-rose-500/25 to-red-700/20 border border-rose-400/40 flex items-center justify-center text-rose-400 group-hover:from-rose-500 group-hover:to-rose-600 group-hover:text-white transition-all shadow-md shadow-red-500/20 group-hover:shadow-red-500/50">
            <Gift className="w-5 h-5 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
          </div>
          <span className="text-[10px] font-bold text-slate-300 mt-1 group-hover:text-rose-400 transition-colors">Mission</span>
        </button>

        {/* Invite */}
        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex flex-col items-center group active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-amber-500/25 to-amber-700/20 border border-amber-400/40 flex items-center justify-center text-amber-400 group-hover:from-amber-400 group-hover:to-amber-500 group-hover:text-slate-950 transition-all shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/50">
            <QrCode className="w-5 h-5 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
          </div>
          <span className="text-[10px] font-bold text-slate-300 mt-1 group-hover:text-amber-400 transition-colors">Invite</span>
        </button>

        {/* Online */}
        <button
          onClick={() => setIsOnlineOpen(true)}
          className="flex flex-col items-center group active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-emerald-500/25 to-emerald-700/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-white transition-all shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/50">
            <Headphones className="w-5 h-5 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
          </div>
          <span className="text-[10px] font-bold text-slate-300 mt-1 group-hover:text-emerald-400 transition-colors">Online</span>
        </button>
      </div>

      {/* Mega Fortune Wheel Quick Card */}
      <div 
        onClick={() => {
          setActiveUserTab('spin');
          sounds.playClick();
        }}
        className="bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-600/20 border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-lg shadow-amber-500/10 cursor-pointer hover:border-amber-400 active:scale-[0.99] transition-all group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/30 group-hover:rotate-12 transition-transform">
            <Trophy className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-white font-['Outfit']">Mega Fortune Wheel</span>
              <span className="text-[9px] font-bold bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40 animate-pulse">
                Win ₹2,000
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {currentUser.spinChances > 0 ? (
                <span className="text-emerald-400 font-bold">🎉 You have {currentUser.spinChances} Free Spins waiting!</span>
              ) : (
                <span>Claim daily free spin & win instant cash</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold pl-2 flex-shrink-0">
          <span>Spin Now</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Plan Category Switcher Tabs (Normal vs Flash 1m-1h vs VIP vs High Return) */}
      <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-4 gap-1 shadow-sm">
        <button
          onClick={() => {
            setActiveTab('normal');
            sounds.playClick();
          }}
          className={`py-2 px-1 rounded-xl text-[10.5px] transition-all text-center cursor-pointer ${
            activeTab === 'normal'
              ? 'btn-chamko-blue font-black text-white shadow-md shadow-blue-600/40 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 font-semibold'
          }`}
        >
          Normal
        </button>

        <button
          onClick={() => {
            setActiveTab('flash');
            sounds.playClick();
          }}
          className={`py-2 px-1 rounded-xl text-[10.5px] transition-all text-center relative cursor-pointer ${
            activeTab === 'flash'
              ? 'btn-chamko-gold font-black text-slate-950 shadow-md shadow-amber-500/40 scale-[1.02]'
              : 'text-amber-400 hover:text-amber-300 font-bold'
          }`}
        >
          <span className="flex items-center justify-center space-x-1">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Flash Minutes</span>
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('vip');
            sounds.playClick();
          }}
          className={`py-2 px-1 rounded-xl text-[10.5px] transition-all text-center cursor-pointer ${
            activeTab === 'vip'
              ? 'btn-chamko bg-gradient-to-r from-orange-500 to-rose-600 font-black text-white shadow-md shadow-orange-500/40 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 font-semibold'
          }`}
        >
          VIP Plan
        </button>

        <button
          onClick={() => {
            setActiveTab('high_return');
            sounds.playClick();
          }}
          className={`py-2 px-1 rounded-xl text-[10.5px] transition-all text-center cursor-pointer ${
            activeTab === 'high_return'
              ? 'btn-chamko bg-gradient-to-r from-purple-600 to-indigo-600 font-black text-white shadow-md shadow-purple-600/40 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 font-semibold'
          }`}
        >
          24H Return
        </button>
      </div>

      {/* When activeTab is 'flash', show duration sub-filters */}
      {activeTab === 'flash' && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[8.5px] sm:text-[9.5px] text-amber-300 flex items-center space-x-1 tracking-tight">
              <Zap className="w-2.5 h-2.5 fill-amber-400" />
              <span>⚡ Flash Fast-Return Plans (1 Minute - 1 Hour)</span>
            </span>
            <span className="text-[9px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
              Instant Liquidity
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {[
              { id: 'all', label: 'All Plans' },
              { id: '1-5m', label: '1 - 5 Minutes' },
              { id: '15-30m', label: '15 - 30 Minutes' },
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
                    : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/70'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Investment Plans List (Clean elevated surface without black background) */}
      <div className="space-y-4">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-slate-800/65 border border-slate-700/60 rounded-2xl p-3.5 shadow-md relative overflow-hidden group hover:border-blue-500/50 hover:bg-slate-800/85 transition-all backdrop-blur-sm"
          >
            {/* Ribbon Badge (Top Right) */}
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-l from-blue-600 to-indigo-700 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-bl-xl shadow-md flex items-center space-x-1">
                <Award className="w-2.5 h-2.5 text-amber-300" />
                <span>{plan.badge}</span>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              {/* Product Visual Container */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-700/40 border border-slate-600/50 overflow-hidden flex-shrink-0 relative group-hover:scale-102 transition-transform">
                <img
                  src={plan.imageUrl}
                  alt={plan.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-slate-900/90 backdrop-blur-xs text-[8.5px] font-mono text-amber-300 font-bold px-1.5 py-0.5 rounded-md border border-amber-500/30">
                  {getDurationLabel(plan)}
                </div>
              </div>

              {/* Product Info & Metrics */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <h3 className="text-xs sm:text-[13.5px] font-bold text-white leading-snug font-['Outfit'] pr-12 truncate">
                  {plan.name}
                </h3>

                {/* Big Price Display */}
                <div className="flex items-baseline space-x-1">
                  <ProfessionalAmount
                    amount={plan.price}
                    size="md"
                    color="white"
                    showDecimals={false}
                  />
                  <span className="text-[10.5px] font-semibold text-slate-400">
                    / {getDurationLabel(plan)}
                  </span>
                </div>

                {/* Return Stats Cards (Matches screenshot Daily vs Total pills) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between bg-slate-700/35 border border-slate-600/40 px-2.5 py-1 rounded-lg">
                    <div className="flex items-center space-x-1 text-slate-300 text-[10.5px] font-medium">
                      <TrendingUp className="w-3 h-3 text-blue-400" />
                      <span>{plan.category === 'flash' ? 'Settlement' : 'Daily'}</span>
                    </div>
                    <ProfessionalAmount
                      amount={plan.category === 'flash' ? plan.totalRevenue : plan.dailyIncome}
                      size="xs"
                      color="white"
                      showDecimals={false}
                    />
                  </div>

                  <div className="flex items-center justify-between bg-slate-700/35 border border-slate-600/40 px-2.5 py-1 rounded-lg">
                    <div className="flex items-center space-x-1 text-slate-300 text-[10.5px] font-medium">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>{plan.category === 'flash' ? 'Net Profit' : 'Total'}</span>
                    </div>
                    <ProfessionalAmount
                      amount={plan.category === 'flash' ? (plan.totalRevenue - plan.price) : plan.totalRevenue}
                      size="xs"
                      color="amber"
                      currencyPrefix={plan.category === 'flash' ? '+₹' : '₹'}
                      showDecimals={false}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={() => handleBuyClick(plan)}
              className="mt-3 w-full py-2.5 rounded-xl btn-chamko-blue active:scale-98 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
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

            <div className="space-y-2 pt-2">
              {currentUser.balance >= selectedPlanForBuy.price ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const res = reinvestBalanceIntoPlan(selectedPlanForBuy.id);
                      if (res.success) {
                        setSelectedPlanForBuy(null);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl btn-chamko-emerald text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1.5 transition-transform active:scale-98 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Auto-Compound Re-invest (+2% Bonus Profit)</span>
                  </button>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanForBuy(null)}
                      className="flex-1 py-2 rounded-xl btn-chamko-glass text-slate-300 text-xs font-semibold hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmPurchase}
                      className="flex-1 py-2 rounded-xl btn-chamko-blue text-white text-xs font-black shadow-md shadow-blue-600/40 cursor-pointer"
                    >
                      Standard Activate
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForBuy(null)}
                    className="flex-1 py-2.5 rounded-xl btn-chamko-glass text-slate-300 text-xs font-semibold hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmPurchase}
                    className="flex-1 py-2.5 rounded-xl btn-chamko-blue text-white text-xs font-black shadow-md shadow-blue-600/40 cursor-pointer"
                  >
                    Recharge Wallet
                  </button>
                </div>
              )}
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
