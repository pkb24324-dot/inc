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
  MessageCircle,
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
  Network,
  ChevronDown,
  Calendar,
  Palette,
  Send,
  X
} from 'lucide-react';
import { WhatsAppIcon, TelegramIcon } from '../common/SocialIcons';
import { sounds } from '../../utils/audio';

export const TeamView: React.FC = () => {
  const { 
    currentUser, 
    allUsers, 
    settings, 
    claimTeamCommission, 
    claimMilestoneReward, 
    claimDailyAgencySalary,
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

  // Advanced View Modes & Poster Customizer State
  const [downlineViewMode, setDownlineViewMode] = useState<'roster' | 'tree'>('roster');
  const [posterTheme, setPosterTheme] = useState<'gold' | 'neon' | 'emerald'>('gold');
  const [customPosterHeadline, setCustomPosterHeadline] = useState('Official VIP Treasury Invitation');
  const [expandedTreeMembers, setExpandedTreeMembers] = useState<Record<string, boolean>>({});
  const [salaryClaimedToday, setSalaryClaimedToday] = useState(false);

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

  // Executive Daily Agency Salary Matrix
  const salaryTiers = [
    { minTeam: 1, rank: 'Junior Promoter', dailySalary: 50, color: 'text-blue-500', badge: 'Tier I' },
    { minTeam: 5, rank: 'Senior Promoter', dailySalary: 180, color: 'text-indigo-500', badge: 'Tier II' },
    { minTeam: 15, rank: 'Agency Manager', dailySalary: 500, color: 'text-amber-500', badge: 'Tier III' },
    { minTeam: 30, rank: 'Regional Director', dailySalary: 1200, color: 'text-emerald-500', badge: 'Tier IV' },
    { minTeam: 50, rank: 'AM Ambassador', dailySalary: 3000, color: 'text-purple-500', badge: 'VIP Master' },
  ];

  const currentSalaryTier = [...salaryTiers].reverse().find(t => totalNetworkCount >= t.minTeam) || null;
  const nextSalaryTier = salaryTiers.find(t => totalNetworkCount < t.minTeam);

  const handleClaimSalary = () => {
    if (!currentSalaryTier) {
      showNotification('Recruit at least 1 team member to unlock daily executive salary!', 'info');
      return;
    }
    if (salaryClaimedToday) {
      showNotification("Today's agency salary has already been credited to your wallet balance!", 'info');
      return;
    }
    claimDailyAgencySalary(currentSalaryTier.dailySalary, currentSalaryTier.rank);
    setSalaryClaimedToday(true);
  };

  const nudgeMemberWhatsApp = (member: typeof allUsers[0]) => {
    sounds.playClick();
    const cleanPhone = member.phone.replace(/\D/g, '');
    const msg = `Hi ${member.name}! Glad to have you on my ${settings.platformName} team. Activate your daily returns plan or check the flash profit plans today! Here is the platform portal: ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  const toggleTreeMember = (memberId: string) => {
    sounds.playClick();
    setExpandedTreeMembers(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const claimable = currentUser.claimableCommission !== undefined ? currentUser.claimableCommission : 850;

  // Real-time Downline Commission Activity Stream
  const liveCommissionEvents = [
    { name: 'Priya S.', level: 'Level 1', action: 'Purchased Fevicol SH Asset', amount: 360, time: '2 Minutes ago' },
    { name: 'Karan J.', level: 'Level 2', action: 'Sub-agent Recharge Settled', amount: 375, time: '14 Minutes ago' },
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
            <div className="text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 text-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span>Verified 3-Tier Affiliate System</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit'] mt-1">
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
          className={`w-full mt-3 py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 cursor-pointer ${
            claimable > 0
              ? 'btn-chamko-emerald text-white font-black shadow-lg shadow-emerald-600/30'
              : isLight 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
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
            <span className={`text-[11px] font-black uppercase tracking-wider block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Your Unique Referral Code
            </span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Share with friends to build your 3-level agency network
            </span>
          </div>
          <span className={`font-mono text-base font-black px-3 py-1 rounded-xl border ${
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
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all border active:scale-95 cursor-pointer ${
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
            className="py-2.5 px-3 rounded-xl btn-chamko-blue text-white text-xs font-black flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
          </button>
        </div>

        {/* 1-Click WhatsApp & Telegram Social Outreach */}
        <div className={`grid grid-cols-2 gap-2 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
          <button
            onClick={shareWhatsApp}
            className="py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer btn-chamko bg-[#25D366] hover:bg-[#20ba59] text-white shadow-md shadow-[#25D366]/30"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Share to WhatsApp</span>
          </button>
          
          <button
            onClick={shareTelegram}
            className="py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer btn-chamko bg-[#229ED9] hover:bg-[#1f8ec3] text-white shadow-md shadow-[#229ED9]/30"
          >
            <TelegramIcon className="w-4 h-4 text-white" />
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

      {/* --- EXECUTIVE DAILY AGENCY SALARY ACCRUAL DESK --- */}
      <div className={`rounded-3xl p-4 sm:p-5 shadow-sm border transition-all space-y-3.5 ${
        isLight 
          ? 'bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white border-amber-200' 
          : 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/30'
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              isLight ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`font-black text-xs sm:text-sm font-['Outfit'] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Executive Agency Daily Salary
                </h3>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  currentSalaryTier 
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {currentSalaryTier ? currentSalaryTier.rank : 'Unranked Partner'}
                </span>
              </div>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Automatic recurring executive stipend credited daily based on verified downlines
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Daily Payout</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              ₹{currentSalaryTier ? currentSalaryTier.dailySalary : 0}
              <span className="text-xs font-normal text-slate-400">/day</span>
            </span>
          </div>
        </div>

        {/* Next Tier Milestone Bar */}
        {nextSalaryTier && (
          <div className={`p-3 rounded-2xl border space-y-1.5 ${
            isLight ? 'bg-white/80 border-amber-100' : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex justify-between items-center text-xs">
              <span className={isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}>
                Next Rank: <strong className="text-amber-600 dark:text-amber-400">{nextSalaryTier.rank} (₹{nextSalaryTier.dailySalary}/day)</strong>
              </span>
              <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                {totalNetworkCount} / {nextSalaryTier.minTeam} Members
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((totalNetworkCount / nextSalaryTier.minTeam) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block text-right">
              Need {Math.max(0, nextSalaryTier.minTeam - totalNetworkCount)} more downline members to upgrade
            </span>
          </div>
        )}

        {/* Claim Today's Salary Button */}
        <button
          onClick={handleClaimSalary}
          disabled={!currentSalaryTier || salaryClaimedToday}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 ${
            !currentSalaryTier
              ? isLight 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : salaryClaimedToday
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/20'
          }`}
        >
          {salaryClaimedToday ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Today's Salary (₹{currentSalaryTier?.dailySalary}) Already Credited</span>
            </>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              <span>
                {currentSalaryTier 
                  ? `Claim Today's ₹${currentSalaryTier.dailySalary} Daily Executive Salary` 
                  : 'Reach 1+ Downline Members to Unlock Daily Salary'}
              </span>
            </>
          )}
        </button>
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
                      <Gift className="w-3 h-3" />
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

      {/* Downline Member Surveillance Roster & Network Tree */}
      <div className={`rounded-3xl p-4 sm:p-5 shadow-sm border transition-all space-y-3.5 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-black text-xs sm:text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Downline Network Intelligence ({totalNetworkCount})
              </h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {activeInvestorsCount} Active Investors
              </span>
            </div>
            <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Inspect members, downline chains & your direct commission rebate ({activeRate}%)
            </p>
          </div>

          {/* View Mode & Tier Controls */}
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className={`p-1 rounded-xl border flex space-x-1 ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <button
                onClick={() => { setDownlineViewMode('roster'); sounds.playClick(); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  downlineViewMode === 'roster'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Roster</span>
              </button>
              <button
                onClick={() => { setDownlineViewMode('tree'); sounds.playClick(); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  downlineViewMode === 'tree'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Tree View</span>
              </button>
            </div>

            {/* Tier Switcher Pills (in Roster mode) */}
            {downlineViewMode === 'roster' && (
              <div className={`p-1 rounded-xl border flex space-x-1 ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <button
                  onClick={() => { setActiveTier(1); sounds.playClick(); }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTier === 1 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  L1 ({settings.referralL1Percent}%)
                </button>
                <button
                  onClick={() => { setActiveTier(2); sounds.playClick(); }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTier === 2 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  L2 ({settings.referralL2Percent}%)
                </button>
                <button
                  onClick={() => { setActiveTier(3); sounds.playClick(); }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTier === 3 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  L3 ({settings.referralL3Percent}%)
                </button>
              </div>
            )}
          </div>
        </div>

        {downlineViewMode === 'roster' ? (
          <>
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
                <option value="all">All Tier {activeTier} ({activeTierUsers.length})</option>
                <option value="active">Active Investors</option>
                <option value="pending">Pending First Recharge</option>
              </select>
            </div>

            {/* Members List with WhatsApp Direct Nudge */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-0.5">
              {filteredMembers.length === 0 ? (
                <div className={`text-center py-8 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold">No downline members in Tier {activeTier}</p>
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
                            +91 {m.phone.slice(0, 5)}••••• • Code: {m.referralCode}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 block">
                            +₹{commissionEarned.toLocaleString()}
                          </span>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Recharge: ₹{(m.totalRecharge || 0).toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => nudgeMemberWhatsApp(m)}
                          title="Nudge & Guide via WhatsApp"
                          className="p-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 active:scale-95 transition-all flex items-center space-x-1.5"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold hidden sm:inline">WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* --- INTERACTIVE 3-TIER NETWORK HIERARCHY TREE --- */
          <div className="space-y-3 pt-1">
            {/* AM Sponsor: You */}
            <div className={`p-3.5 rounded-2xl border ${
              isLight ? 'bg-indigo-50/70 border-indigo-200' : 'bg-indigo-950/30 border-indigo-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                    YOU
                  </div>
                  <div>
                    <span className={`text-xs font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {currentUser.name} (AM Sponsor)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Code: {currentUser.referralCode} • VIP {currentUser.vipLevel}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 block">
                    {totalNetworkCount} Downlines
                  </span>
                  <span className="text-[10px] text-slate-400">₹{totalTeamTurnover.toLocaleString()} Turnover</span>
                </div>
              </div>
            </div>

            {/* Level 1 Members Branch */}
            <div className="pl-4 border-l-2 border-dashed border-indigo-300 dark:border-indigo-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-1">
                <span>Tier 1 Direct Recruits ({level1Users.length}) • {settings.referralL1Percent}% Rebate</span>
                <span className="font-mono text-emerald-500">₹{l1TotalRecharge.toLocaleString()} Vol</span>
              </div>

              {level1Users.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2 pl-2">
                  No direct Level 1 downlines yet. Share your code {currentUser.referralCode} to begin!
                </div>
              ) : (
                level1Users.map((l1) => {
                  const isExpanded = !!expandedTreeMembers[l1.id];
                  // Downlines of this L1 user (which are L2 to current user)
                  const l1DirectSubs = allUsers.filter(u => u.referredBy === l1.referralCode);
                  const subTurnover = l1DirectSubs.reduce((sum, u) => sum + (u.totalRecharge || 0), 0);

                  return (
                    <div key={l1.id} className="space-y-2">
                      <div className={`p-3 rounded-2xl border transition-all ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-500 font-bold text-xs flex items-center justify-center">
                              L1
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                  {l1.name}
                                </span>
                                <span className="text-[9px] px-1 rounded bg-amber-500/10 text-amber-500 font-bold">
                                  VIP {l1.vipLevel}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                +91 {l1.phone.slice(0, 5)}••••• • Code: {l1.referralCode}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-emerald-500 block">
                                ₹{(l1.totalRecharge || 0).toLocaleString()}
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {l1DirectSubs.length} subs
                              </span>
                            </div>

                            {l1DirectSubs.length > 0 && (
                              <button
                                onClick={() => toggleTreeMember(l1.id)}
                                className={`p-1.5 rounded-lg border text-xs transition-all ${
                                  isExpanded 
                                    ? 'bg-indigo-600 text-white border-indigo-600' 
                                    : isLight ? 'bg-white text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-300 border-slate-700'
                                }`}
                              >
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            )}

                            <button
                              onClick={() => nudgeMemberWhatsApp(l1)}
                              className="p-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30"
                              title="WhatsApp Nudge"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Level 2 Sub-branch nested */}
                      {isExpanded && l1DirectSubs.length > 0 && (
                        <div className="pl-4 border-l-2 border-dashed border-blue-400/50 space-y-1.5 py-1">
                          <span className="text-[10px] font-bold text-blue-400 block">
                            Tier 2 Downlines via {l1.name} ({l1DirectSubs.length} members)
                          </span>
                          {l1DirectSubs.map((l2) => {
                            const l2DirectSubs = allUsers.filter(u => u.referredBy === l2.referralCode);
                            return (
                              <div
                                key={l2.id}
                                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                                  isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-blue-950/20 border-blue-900/30'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                    L2
                                  </span>
                                  <div>
                                    <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                                      {l2.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                                      VIP {l2.vipLevel}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-emerald-500 font-bold">
                                    ₹{(l2.totalRecharge || 0).toLocaleString()}
                                  </span>
                                  {l2DirectSubs.length > 0 && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
                                      +{l2DirectSubs.length} L3
                                    </span>
                                  )}
                                  <button
                                    onClick={() => nudgeMemberWhatsApp(l2)}
                                    className="p-1 rounded-lg bg-[#25D366]/15 text-[#25D366]"
                                    title="WhatsApp Nudge"
                                  >
                                    <WhatsAppIcon className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
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

      {/* --- VIP PROMOTIONAL INVITATION POSTER STUDIO 2.0 MODAL --- */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className={`rounded-3xl max-w-sm w-full p-5 shadow-2xl relative border my-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <button
              onClick={() => setShowPosterModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Poster Customizer Controls */}
            <div className="space-y-3 pt-1">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-500 block">
                  VIP Invitation Studio 2.0
                </span>
                <h3 className="text-lg font-bold font-['Outfit']">
                  Customize Shareable Poster
                </h3>
              </div>

              {/* Theme Selector */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold text-slate-400 mr-1">Theme:</span>
                {[
                  { id: 'gold', name: 'Royal Gold', bg: 'from-amber-600 to-yellow-600' },
                  { id: 'neon', name: 'Cyber Neon', bg: 'from-indigo-600 to-purple-600' },
                  { id: 'emerald', name: 'Emerald VIP', bg: 'from-emerald-600 to-teal-600' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setPosterTheme(th.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                      posterTheme === th.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-indigo-500 shadow-sm'
                        : isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>

              {/* Poster Card Artwork Preview */}
              <div className={`p-4 rounded-3xl text-center space-y-3.5 border shadow-xl text-white transition-all bg-gradient-to-br ${
                posterTheme === 'gold'
                  ? 'from-amber-700 via-yellow-600 to-amber-900 border-amber-400/40 shadow-amber-500/20'
                  : posterTheme === 'emerald'
                  ? 'from-emerald-800 via-teal-700 to-emerald-950 border-emerald-400/40 shadow-emerald-500/20'
                  : 'from-indigo-900 via-purple-900 to-slate-950 border-indigo-500/40 shadow-indigo-500/20'
              }`}>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VIP Treasury Pass</span>
                </div>

                <div>
                  <h4 className="text-xl font-black font-['Outfit'] tracking-tight">
                    {settings.platformName}
                  </h4>
                  <p className="text-[11px] text-white/80 mt-0.5">
                    High Return Daily Profits
                  </p>
                </div>

                {/* QR Code Container */}
                <div className="p-3 bg-white rounded-2xl border-2 border-white/40 inline-block shadow-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(referralLink)}`}
                    alt="Invitation QR Code"
                    className="w-36 h-36 mx-auto rounded-lg"
                  />
                </div>

                {/* Referral Code Display */}
                <div className="p-2.5 rounded-2xl bg-black/30 border border-white/20 backdrop-blur-sm">
                  <span className="text-[9px] text-white/70 uppercase tracking-wider block">Exclusive Invitation Code</span>
                  <span className="font-mono text-2xl font-black text-amber-300 tracking-wider">
                    {currentUser.referralCode}
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold block mt-0.5">
                    🎁 Sign up & receive instant ₹50 welcome reward
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={shareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-[#25D366]/30"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={copyLink}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
