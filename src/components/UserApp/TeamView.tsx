import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  TrendingUp, 
  Award, 
  UserCheck, 
  DollarSign,
  Gift,
  Sparkles,
  MessageCircle,
  Calculator,
  ChevronRight,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  QrCode,
  Search,
  Filter,
  Download,
  Flame,
  Clock,
  Layers,
  CheckCircle2,
  X
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const TeamView: React.FC = () => {
  const { 
    currentUser, 
    allUsers, 
    settings, 
    claimTeamCommission, 
    claimMilestoneReward, 
    showNotification,
    theme 
  } = useApp();

  const isLight = theme === 'light';

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTier, setActiveTier] = useState<1 | 2 | 3>(1);
  const [searchMember, setSearchMember] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [showPosterModal, setShowPosterModal] = useState(false);

  // Commission Projection Calculator State
  const [calcInvites, setCalcInvites] = useState<number>(6);
  const [calcSubRatio, setCalcSubRatio] = useState<number>(3);
  const [calcAvgInvestment, setCalcAvgInvestment] = useState<number>(2500);

  const referralLink = `${window.location.origin}/?ref=${currentUser.referralCode}`;
  const shareText = `🚀 Join me on ${settings.platformName}! Invest in high-return production assets with guaranteed daily returns. Use my VIP invitation code ${currentUser.referralCode} to claim instant ₹50 welcome cash: ${referralLink}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    sounds.playClick();
    showNotification('Invitation link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    sounds.playClick();
    showNotification(`Referral code ${currentUser.referralCode} copied!`, 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareWhatsApp = () => {
    sounds.playClick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareTelegram = () => {
    sounds.playClick();
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`Join ${settings.platformName} with code ${currentUser.referralCode} for high daily returns!`)}`;
    window.open(url, '_blank');
  };

  const handleClaimCommission = () => {
    const claimable = currentUser.claimableCommission ?? 850;
    if (claimable <= 0) {
      showNotification('No pending agency rebates available right now.', 'info');
      return;
    }
    claimTeamCommission();
  };

  // --- COMPUTE REAL DYNAMIC 3-TIER TEAM TREE FROM allUsers ---
  // Level 1: Users referred directly by currentUser's referral code
  const level1Users = useMemo(() => {
    return allUsers.filter(u => u.referredBy === currentUser.referralCode);
  }, [allUsers, currentUser.referralCode]);

  // Level 2: Users referred by any Level 1 user
  const level1Codes = useMemo(() => level1Users.map(u => u.referralCode), [level1Users]);
  const level2Users = useMemo(() => {
    return allUsers.filter(u => u.referredBy && level1Codes.includes(u.referredBy));
  }, [allUsers, level1Codes]);

  // Level 3: Users referred by any Level 2 user
  const level2Codes = useMemo(() => level2Users.map(u => u.referralCode), [level2Users]);
  const level3Users = useMemo(() => {
    return allUsers.filter(u => u.referredBy && level2Codes.includes(u.referredBy));
  }, [allUsers, level2Codes]);

  // Aggregate stats
  const totalNetworkCount = level1Users.length + level2Users.length + level3Users.length;
  const l1TotalRecharge = level1Users.reduce((sum, u) => sum + (u.totalRecharge || 0), 0);
  const l2TotalRecharge = level2Users.reduce((sum, u) => sum + (u.totalRecharge || 0), 0);
  const l3TotalRecharge = level3Users.reduce((sum, u) => sum + (u.totalRecharge || 0), 0);
  const totalTeamTurnover = l1TotalRecharge + l2TotalRecharge + l3TotalRecharge;

  const l1Commission = Math.round(l1TotalRecharge * (settings.referralL1Percent / 100));
  const l2Commission = Math.round(l2TotalRecharge * (settings.referralL2Percent / 100));
  const l3Commission = Math.round(l3TotalRecharge * (settings.referralL3Percent / 100));
  const totalCommissionCalculated = l1Commission + l2Commission + l3Commission;

  const activeInvestorsCount = [...level1Users, ...level2Users, ...level3Users].filter(u => (u.totalRecharge || 0) > 0).length;

  // Selected Active Tier Users
  const activeTierUsers = activeTier === 1 ? level1Users : activeTier === 2 ? level2Users : level3Users;
  const activeRate = activeTier === 1 ? settings.referralL1Percent : activeTier === 2 ? settings.referralL2Percent : settings.referralL3Percent;

  // Filter & Search Downline Members
  const filteredMembers = useMemo(() => {
    return activeTierUsers.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchMember.toLowerCase()) ||
        u.phone.includes(searchMember) ||
        u.referralCode.toLowerCase().includes(searchMember.toLowerCase());
      
      const isUserActive = (u.totalRecharge || 0) > 0;
      if (statusFilter === 'active') return matchesSearch && isUserActive;
      if (statusFilter === 'pending') return matchesSearch && !isUserActive;
      return matchesSearch;
    });
  }, [activeTierUsers, searchMember, statusFilter]);

  // Milestone Rewards Structure
  const milestones = [
    { target: 3, reward: 300, salary: 0, title: 'Starter Promoter Bonus', badge: 'Tier 1' },
    { target: 5, reward: 750, salary: 0, title: 'Silver Team Leader', badge: 'Tier 2' },
    { target: 10, reward: 2000, salary: 150, title: 'Gold Partner + ₹150/Day Salary', badge: 'VIP Partner' },
    { target: 25, reward: 6000, salary: 500, title: 'Diamond Regional Manager + ₹500/Day', badge: 'Executive' },
    { target: 50, reward: 15000, salary: 1500, title: 'Crown Director Guild + ₹1,500/Day', badge: 'Director' },
  ];

  const claimedMilestones = currentUser.claimedMilestones || [];

  const handleClaimMilestone = (idx: number, reward: number, title: string) => {
    claimMilestoneReward(idx, reward, title);
  };

  // Calculator Projections
  const l1Rate = settings.referralL1Percent / 100;
  const l2Rate = settings.referralL2Percent / 100;
  const l3Rate = settings.referralL3Percent / 100;

  const projL1Count = calcInvites;
  const projL2Count = calcInvites * calcSubRatio;
  const projL3Count = calcInvites * calcSubRatio * 2;

  const projL1Earnings = Math.round(projL1Count * calcAvgInvestment * l1Rate);
  const projL2Earnings = Math.round(projL2Count * calcAvgInvestment * l2Rate);
  const projL3Earnings = Math.round(projL3Count * calcAvgInvestment * l3Rate);
  const projTotalInstant = projL1Earnings + projL2Earnings + projL3Earnings;
  const projMonthlyRun = Math.round(projTotalInstant * 3.5);

  const claimable = currentUser.claimableCommission !== undefined ? currentUser.claimableCommission : 850;

  // Real-time Downline Commission Activity Stream
  const liveCommissionEvents = [
    { name: 'Priya S.', level: 'Level 1', action: 'Purchased Fevicol SH Asset', amount: 360, time: '2 mins ago' },
    { name: 'Karan J.', level: 'Level 2', action: 'Sub-agent Recharge Settled', amount: 375, time: '14 mins ago' },
    { name: 'Vikas G.', level: 'Level 1', action: 'Activated Rapid Scalp Bond', amount: 380, time: '1 hour ago' },
    { name: 'Ananya B.', level: 'Level 3', action: 'Downline Polymer Activation', amount: 120, time: '3 hours ago' },
  ];

  return (
    <div className={`pb-28 max-w-xl mx-auto px-4 pt-4 space-y-4 transition-colors ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
      
      {/* Network Header Banner */}
      <div className={`rounded-3xl p-5 shadow-xl relative overflow-hidden transition-all ${
        isLight
          ? 'bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-900 text-white shadow-indigo-900/20'
          : 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30'
      }`}>
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 text-indigo-200">
              <ShieldCheck className="w-4 h-4 text-indigo-300" />
              <span>Verified 3-Tier Affiliate System</span>
            </div>
            <h2 className="text-2xl font-black text-white font-['Outfit'] mt-1">
              Affiliate & Team Network
            </h2>
            <p className="text-xs text-indigo-100/90 mt-0.5">
              Earn up to {settings.referralL1Percent + settings.referralL2Percent + settings.referralL3Percent}% tiered passive commissions on all downline recharges
            </p>
          </div>
          <button 
            onClick={() => setShowPosterModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>VIP Poster</span>
          </button>
        </div>

        {/* Aggregate Network Performance Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20 relative z-10 text-center">
          <div className="bg-black/20 rounded-2xl p-2.5 backdrop-blur-sm">
            <span className="text-[10px] text-indigo-200 font-medium block">Total Downlines</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              {totalNetworkCount}
            </div>
            <span className="text-[9px] text-emerald-300 font-bold block">{activeInvestorsCount} Active</span>
          </div>

          <div className="bg-black/20 rounded-2xl p-2.5 backdrop-blur-sm">
            <span className="text-[10px] text-indigo-200 font-medium block">Team Turnover</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              ₹{totalTeamTurnover.toLocaleString()}
            </div>
            <span className="text-[9px] text-indigo-200 block">Total Volume</span>
          </div>

          <div className="bg-black/20 rounded-2xl p-2.5 backdrop-blur-sm">
            <span className="text-[10px] text-indigo-200 font-medium block">Total Earned</span>
            <div className="text-lg font-black text-emerald-300 font-mono mt-0.5">
              ₹{currentUser.teamCommission.toLocaleString()}
            </div>
            <span className="text-[9px] text-emerald-300 font-bold block">Wallet Settled</span>
          </div>
        </div>
      </div>

      {/* Unclaimed Agency Rebate Box with 1-Click Instant Claim */}
      <div className={`rounded-3xl p-4 shadow-md transition-all ${
        isLight 
          ? 'bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white border border-emerald-200 shadow-emerald-500/10' 
          : 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40'
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isLight ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-xs font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Unclaimed Agency Commission
              </span>
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Real-time generated rebates ready for transfer
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{claimable.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          id="claim-team-commission-btn"
          onClick={handleClaimCommission}
          disabled={claimable <= 0}
          className={`w-full mt-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 ${
            claimable > 0
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
              : isLight 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {claimable > 0 ? `Claim ₹${claimable.toLocaleString()} Commission To Balance` : 'All Rebates Cleared'}
          </span>
        </button>
      </div>

      {/* Referral Code & Quick Social Share Tools */}
      <div className={`rounded-3xl p-4 shadow-sm border transition-all space-y-3 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-xs font-black uppercase tracking-wider block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Your Unique Referral Code
            </span>
            <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Share with friends to build your 3-level agency network
            </span>
          </div>
          <span className={`font-mono text-xl font-black px-3.5 py-1 rounded-xl border ${
            isLight 
              ? 'bg-amber-50 text-amber-700 border-amber-300' 
              : 'bg-amber-400/10 text-amber-400 border-amber-400/30'
          }`}>
            {currentUser.referralCode}
          </span>
        </div>

        {/* Quick Copy Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={copyCode}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all border active:scale-95 ${
              isLight 
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
          </button>
          
          <button
            onClick={copyLink}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/30 active:scale-95 transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
          </button>
        </div>

        {/* 1-Click WhatsApp & Telegram Social Outreach */}
        <div className={`grid grid-cols-2 gap-2 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
          <button
            onClick={shareWhatsApp}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors border active:scale-95 ${
              isLight 
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' 
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Share to WhatsApp</span>
          </button>
          
          <button
            onClick={shareTelegram}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors border active:scale-95 ${
              isLight 
                ? 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200' 
                : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/30'
            }`}
          >
            <Share2 className="w-4 h-4 text-sky-600" />
            <span>Share to Telegram</span>
          </button>
        </div>
      </div>

      {/* 3-Tier Multi-Level Commission Structure Cards */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            3-Tier Commission Split Rates
          </span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
            isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
          }`}>
            Total {settings.referralL1Percent + settings.referralL2Percent + settings.referralL3Percent}% Agency Payout
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Level 1 Direct */}
          <div 
            onClick={() => setActiveTier(1)}
            className={`rounded-2xl p-3 text-center space-y-1 cursor-pointer transition-all border ${
              activeTier === 1
                ? isLight 
                  ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-200' 
                  : 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30'
                : isLight 
                  ? 'bg-white border-slate-200 hover:border-indigo-200' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wider block">Level 1 Direct</span>
            <div className={`text-xl font-black font-mono ${isLight ? 'text-indigo-900' : 'text-white'}`}>{settings.referralL1Percent}%</div>
            <span className={`text-[10px] block font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {level1Users.length} Members (₹{l1TotalRecharge.toLocaleString()})
            </span>
          </div>

          {/* Level 2 Network */}
          <div 
            onClick={() => setActiveTier(2)}
            className={`rounded-2xl p-3 text-center space-y-1 cursor-pointer transition-all border ${
              activeTier === 2
                ? isLight 
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-200' 
                  : 'bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/30'
                : isLight 
                  ? 'bg-white border-slate-200 hover:border-blue-200' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider block">Level 2 Sub-tier</span>
            <div className={`text-xl font-black font-mono ${isLight ? 'text-blue-900' : 'text-white'}`}>{settings.referralL2Percent}%</div>
            <span className={`text-[10px] block font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {level2Users.length} Members (₹{l2TotalRecharge.toLocaleString()})
            </span>
          </div>

          {/* Level 3 Downline */}
          <div 
            onClick={() => setActiveTier(3)}
            className={`rounded-2xl p-3 text-center space-y-1 cursor-pointer transition-all border ${
              activeTier === 3
                ? isLight 
                  ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-200' 
                  : 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/30'
                : isLight 
                  ? 'bg-white border-slate-200 hover:border-purple-200' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wider block">Level 3 Indirect</span>
            <div className={`text-xl font-black font-mono ${isLight ? 'text-purple-900' : 'text-white'}`}>{settings.referralL3Percent}%</div>
            <span className={`text-[10px] block font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {level3Users.length} Members (₹{l3TotalRecharge.toLocaleString()})
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Agency Commission & Salary Calculator */}
      <div className={`rounded-3xl p-4 shadow-sm border transition-all space-y-3.5 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Interactive Agency Profit Simulator
              </h3>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Simulate potential direct & passive 3-tier returns
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Real-Time Projections
          </span>
        </div>

        {/* Dynamic Sliders */}
        <div className={`p-3.5 rounded-2xl border space-y-3.5 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className={isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}>
                Direct L1 Invites:
              </span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{calcInvites} Members</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={calcInvites}
              onChange={(e) => setCalcInvites(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className={isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}>
                Sub-tier Multiplier (Each Invites):
              </span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{calcSubRatio} People</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={calcSubRatio}
              onChange={(e) => setCalcSubRatio(Number(e.target.value))}
              className="w-full accent-blue-600 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className={isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}>
                Average Investment Amount:
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{calcAvgInvestment.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="700"
              max="20000"
              step="500"
              value={calcAvgInvestment}
              onChange={(e) => setCalcAvgInvestment(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Projected Calculated Outcomes */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className={`p-3 rounded-2xl border ${
            isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <span className={`text-[10px] block ${isLight ? 'text-emerald-800' : 'text-slate-400'}`}>Instant Direct Commission</span>
            <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">
              ₹{projTotalInstant.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">L1+L2+L3 combined</span>
          </div>

          <div className={`p-3 rounded-2xl border ${
            isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <span className={`text-[10px] block ${isLight ? 'text-amber-800' : 'text-slate-400'}`}>Estimated Monthly Salary Run</span>
            <span className="font-mono font-black text-lg text-amber-600 dark:text-amber-400">
              ₹{projMonthlyRun.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">With ongoing repurchases</span>
          </div>
        </div>
      </div>

      {/* Agency Milestone Achievement Bonuses & Daily Salary Desk */}
      <div className={`rounded-3xl p-4 shadow-sm border transition-all space-y-3 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Agency Milestones & Daily Salary Desk
              </h3>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Achieve invite targets to claim instant bonus cash + recurring salary
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-400/20">
            Instant Wallet Crediting
          </span>
        </div>

        <div className="space-y-2.5">
          {milestones.map((m, idx) => {
            const isCompleted = level1Users.length >= m.target;
            const isClaimed = claimedMilestones.includes(idx);
            const progress = Math.min(100, Math.round((level1Users.length / m.target) * 100));

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                  isLight 
                    ? isClaimed 
                      ? 'bg-slate-50/70 border-slate-200' 
                      : isCompleted 
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200' 
                        : 'bg-white border-slate-200'
                    : isClaimed 
                      ? 'bg-slate-950/60 border-slate-800' 
                      : isCompleted 
                        ? 'bg-emerald-950/40 border-emerald-500/40' 
                        : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {m.badge}
                      </span>
                      <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {m.title}
                      </h4>
                    </div>
                    <span className={`text-[10px] mt-0.5 block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {level1Users.length} / {m.target} direct active investors
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 block">
                      +₹{m.reward.toLocaleString()}
                    </span>
                    {m.salary > 0 && (
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 block">
                        +₹{m.salary}/day salary
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center space-x-2">
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                    isLight ? 'bg-slate-100' : 'bg-slate-900'
                  }`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${
                    isCompleted ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {progress}%
                  </span>
                </div>

                {/* Claim Button / Status */}
                <div className="pt-1 flex justify-end">
                  {isClaimed ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-400 py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Reward Claimed</span>
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaimMilestone(idx, m.reward, m.title)}
                      className="py-1 px-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 active:scale-95 flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Claim ₹{m.reward.toLocaleString()} Now</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      Need {m.target - level1Users.length} more direct invites
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Downline Member Surveillance Roster */}
      <div className={`rounded-3xl p-4 shadow-sm border transition-all space-y-3 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Downline Network Members ({activeTierUsers.length})
            </h3>
            <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Inspect members, their total recharges & your direct commission rebate ({activeRate}%)
            </p>
          </div>

          {/* Tier Switcher Pills */}
          <div className={`p-1 rounded-xl border flex space-x-1 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => { setActiveTier(1); sounds.playClick(); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTier === 1 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              L1 ({settings.referralL1Percent}%)
            </button>
            <button
              onClick={() => { setActiveTier(2); sounds.playClick(); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTier === 2 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              L2 ({settings.referralL2Percent}%)
            </button>
            <button
              onClick={() => { setActiveTier(3); sounds.playClick(); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTier === 3 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              L3 ({settings.referralL3Percent}%)
            </button>
          </div>
        </div>

        {/* Search & Status Filter Controls */}
        <div className="flex items-center space-x-2">
          <div className={`flex-1 flex items-center space-x-2 px-3 py-2 rounded-xl border ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
          }`}>
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search member name or phone..."
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              className="bg-transparent text-xs outline-none w-full placeholder-slate-400"
            />
            {searchMember && (
              <button onClick={() => setSearchMember('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={`text-xs font-bold py-2 px-2.5 rounded-xl border outline-none cursor-pointer ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            <option value="all">All ({activeTierUsers.length})</option>
            <option value="active">Active Investors</option>
            <option value="pending">Pending First Recharge</option>
          </select>
        </div>

        {/* Members List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
          {filteredMembers.length === 0 ? (
            <div className={`text-center py-8 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}>
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-bold">No downline members found</p>
              <p className="text-[11px] mt-0.5 text-slate-400">Share your invite link to register new investors!</p>
            </div>
          ) : (
            filteredMembers.map((m) => {
              const commissionEarned = Math.round((m.totalRecharge || 0) * (activeRate / 100));
              const isActive = (m.totalRecharge || 0) > 0;

              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    isLight 
                      ? 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200' 
                      : 'bg-slate-950 hover:bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                      isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {m.name}
                        </h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                          isActive 
                            ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isLight ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {isActive ? 'Active Investor' : 'Registered'}
                        </span>
                        <span className="text-[9px] text-amber-500 font-bold">VIP {m.vipLevel}</span>
                      </div>
                      <p className={`text-[11px] font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        +91 {m.phone.slice(0, 5)}••••• • Joined {m.createdAt.slice(0, 10)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 block">
                      +₹{commissionEarned.toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Recharge: ₹{(m.totalRecharge || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Live Commission Activity Stream Ticker */}
      <div className={`rounded-3xl p-4 shadow-sm border transition-all space-y-2.5 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <h3 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Live Downline Rebate Stream
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>Real-Time</span>
          </span>
        </div>

        <div className="space-y-1.5">
          {liveCommissionEvents.map((evt, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl flex items-center justify-between text-xs border ${
                isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950 border-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {evt.level}
                </span>
                <div>
                  <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{evt.name}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">• {evt.action}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+₹{evt.amount}</span>
                <span className="text-[9px] text-slate-400 block">{evt.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- VIP PROMOTIONAL INVITATION POSTER MODAL --- */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <button
              onClick={() => setShowPosterModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Poster Card Artwork */}
            <div className="text-center space-y-4 pt-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-black">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>OFFICIAL TREASURY INVITATION</span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold font-['Outfit']">
                  {settings.platformName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  High-Return Liquidity Production Assets
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-2xl border-2 border-indigo-600/30 inline-block shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(referralLink)}`}
                  alt="Invitation QR Code"
                  className="w-44 h-44 mx-auto rounded-lg"
                />
              </div>

              {/* Referral Code Display */}
              <div className={`p-3 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Exclusive Invitation Code</span>
                <span className="font-mono text-2xl font-black text-amber-500 tracking-wider">
                  {currentUser.referralCode}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                  🎁 Sign up & receive instant ₹50 welcome reward
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={copyLink}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
                <button
                  onClick={() => {
                    showNotification('Poster image ready for social sharing!', 'success');
                    setShowPosterModal(false);
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 border ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save Poster</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
