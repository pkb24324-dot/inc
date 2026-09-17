import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Share2, 
  Award, 
  TrendingUp, 
  DollarSign, 
  Gift, 
  Search, 
  ArrowUpRight, 
  Network,
  ChevronRight,
  ShieldCheck,
  Percent,
  Filter,
  CheckCircle2,
  Layers,
  Flame,
  Download,
  AlertTriangle,
  ChevronDown,
  Lock,
  Unlock,
  X
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const AffiliateManager: React.FC = () => {
  const { 
    allUsers, 
    settings, 
    saveSettings, 
    adjustUserBalance, 
    toggleUserFrozen, 
    showNotification, 
    theme,
    triggerGlobalDividendRun,
    triggerGlobalCommissionRebateRun,
    distributePromoterAirdrop
  } = useApp();
  const isLight = theme === 'light';

  const [l1Percent, setL1Percent] = useState<number>(settings.referralL1Percent || 10);
  const [l2Percent, setL2Percent] = useState<number>(settings.referralL2Percent || 5);
  const [l3Percent, setL3Percent] = useState<number>(settings.referralL3Percent || 2);
  const [commissionMultiplier, setCommissionMultiplier] = useState<number>(settings.commissionMultiplier || 1.0);
  const [incomeMultiplier, setIncomeMultiplier] = useState<number>(settings.incomeMultiplier || 1.0);
  const [promoterTierBonusEnabled, setPromoterTierBonusEnabled] = useState<boolean>(settings.promoterTierBonusEnabled ?? true);
  
  const [airdropAmount, setAirdropAmount] = useState<number>(250);
  const [airdropMinReferrals, setAirdropMinReferrals] = useState<number>(3);
  const [isExecutingRun, setIsExecutingRun] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(allUsers[0]?.id || null);
  const [selectedLeaderTier, setSelectedLeaderTier] = useState<1 | 2 | 3>(1);
  const [adminViewMode, setAdminViewMode] = useState<'grid' | 'tree'>('grid');
  const [expandedAdminTrees, setExpandedAdminTrees] = useState<Record<string, boolean>>({});

  // Bonus modal state
  const [bonusModalUser, setBonusModalUser] = useState<string | null>(null);
  const [bonusAmount, setBonusAmount] = useState<number>(1000);
  const [bonusNote, setBonusNote] = useState<string>('Tier 1 Promoter Recruitment Milestone Reward');

  // Filtered Leaderboard
  const leaderboard = useMemo(() => {
    return [...allUsers]
      .filter(u => {
        const matches = 
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.phone.includes(searchQuery) ||
          u.referralCode.toLowerCase().includes(searchQuery.toLowerCase());
        return matches;
      })
      .sort((a, b) => {
        return (b.teamCommission + (b.referralsCount || 0) * 100) - (a.teamCommission + (a.referralsCount || 0) * 100);
      });
  }, [allUsers, searchQuery]);

  const totalCommissionsPaid = allUsers.reduce((sum, u) => sum + (u.teamCommission || 0), 0);
  const totalNetworkMembers = allUsers.reduce((sum, u) => sum + (u.referralsCount || 0), 0);
  const totalTurnoverVolume = allUsers.reduce((sum, u) => sum + (u.totalRecharge || 0), 0);

  // Selected Leader & Hierarchical 3-Tier Downline Resolution
  const selectedLeader = useMemo(() => {
    return allUsers.find(u => u.id === selectedLeaderId) || allUsers[0];
  }, [allUsers, selectedLeaderId]);

  // Level 1: Direct child users of selectedLeader
  const leaderL1 = useMemo(() => {
    if (!selectedLeader) return [];
    return allUsers.filter(u => u.referredBy === selectedLeader.referralCode);
  }, [allUsers, selectedLeader]);

  // Level 2: Child users of Level 1
  const leaderL1Codes = useMemo(() => leaderL1.map(u => u.referralCode), [leaderL1]);
  const leaderL2 = useMemo(() => {
    return allUsers.filter(u => u.referredBy && leaderL1Codes.includes(u.referredBy));
  }, [allUsers, leaderL1Codes]);

  // Level 3: Child users of Level 2
  const leaderL2Codes = useMemo(() => leaderL2.map(u => u.referralCode), [leaderL2]);
  const leaderL3 = useMemo(() => {
    return allUsers.filter(u => u.referredBy && leaderL2Codes.includes(u.referredBy));
  }, [allUsers, leaderL2Codes]);

  const currentTierUsers = selectedLeaderTier === 1 ? leaderL1 : selectedLeaderTier === 2 ? leaderL2 : leaderL3;
  const currentTierRate = selectedLeaderTier === 1 ? l1Percent : selectedLeaderTier === 2 ? l2Percent : l3Percent;

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      referralL1Percent: Number(l1Percent),
      referralL2Percent: Number(l2Percent),
      referralL3Percent: Number(l3Percent),
      commissionMultiplier: Number(commissionMultiplier),
      incomeMultiplier: Number(incomeMultiplier),
      promoterTierBonusEnabled: Boolean(promoterTierBonusEnabled),
    });
    sounds.playSuccess();
    showNotification('Affiliate rates and multipliers updated successfully!', 'success');
  };

  const handleInjectBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusModalUser) return;
    adjustUserBalance(bonusModalUser, Number(bonusAmount), bonusNote || `Promoter Leadership Bonus`);
    setBonusModalUser(null);
    sounds.playSuccess();
  };

  const applyPresetRates = (l1: number, l2: number, l3: number) => {
    sounds.playClick();
    setL1Percent(l1);
    setL2Percent(l2);
    setL3Percent(l3);
  };

  const exportAffiliatesCSV = () => {
    sounds.playClick();
    const headers = ['Rank', 'Name', 'Phone', 'Referral Code', 'VIP Level', 'Team Size', 'Total Recharged', 'Commissions Earned'];
    const rows = leaderboard.map((u, idx) => [
      idx + 1,
      `"${u.name}"`,
      u.phone,
      u.referralCode,
      `VIP ${u.vipLevel}`,
      u.referralsCount || 0,
      u.totalRecharge || 0,
      u.teamCommission || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Affiliate_Network_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Affiliate audit CSV downloaded successfully!', 'success');
  };

  const leaderRiskMetrics = useMemo(() => {
    if (!selectedLeader) return { inactiveRatio: 0, sybilRisk: 'low', zeroRechargeCount: 0, totalSubs: 0 };
    const allSubs = [...leaderL1, ...leaderL2, ...leaderL3];
    if (allSubs.length === 0) return { inactiveRatio: 0, sybilRisk: 'low', zeroRechargeCount: 0, totalSubs: 0 };
    const zeroRecharge = allSubs.filter(u => (u.totalRecharge || 0) === 0);
    const ratio = Math.round((zeroRecharge.length / allSubs.length) * 100);
    const sybilRisk = ratio >= 75 && allSubs.length >= 4 ? 'high' : ratio >= 50 ? 'medium' : 'low';
    return { inactiveRatio: ratio, sybilRisk, zeroRechargeCount: zeroRecharge.length, totalSubs: allSubs.length };
  }, [selectedLeader, leaderL1, leaderL2, leaderL3]);

  const toggleAdminTree = (userId: string) => {
    sounds.playClick();
    setExpandedAdminTrees(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <div className={`space-y-6 transition-colors ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-black font-['Outfit'] flex items-center space-x-2 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <Network className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Multi-Tier Affiliate & Commission Supervisor</span>
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Inspect Level 1/2/3 team hierarchies, tune multi-level dividend splits & reward top platform promoters
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={exportAffiliatesCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-95"
            title="Download CSV Audit of all affiliates and downlines"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-3xl p-5 space-y-2 border shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex justify-between items-center text-slate-400">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Total Network Size
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {totalNetworkMembers}
          </div>
          <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Referred Network Accounts
          </div>
        </div>

        <div className={`rounded-3xl p-5 space-y-2 border shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex justify-between items-center text-slate-400">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Commissions Paid
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-purple-50 text-purple-600' : 'bg-purple-500/20 text-purple-400'
            }`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-300 font-mono">
            ₹{totalCommissionsPaid.toLocaleString()}
          </div>
          <div className={`text-[11px] font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
            Distributed across 3 levels
          </div>
        </div>

        <div className={`rounded-3xl p-5 space-y-2 border shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex justify-between items-center text-slate-400">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Tier Structure
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/20 text-blue-400'
            }`}>
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {settings.referralL1Percent}% - {settings.referralL2Percent}% - {settings.referralL3Percent}%
          </div>
          <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            L1 Direct / L2 Sub / L3 Network
          </div>
        </div>

        <div className={`rounded-3xl p-5 space-y-2 border shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex justify-between items-center text-slate-400">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Top Promoter
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 truncate">
            {leaderboard[0]?.name || 'Rahul Verma'}
          </div>
          <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            ₹{(leaderboard[0]?.teamCommission || 0).toLocaleString()} Commission Earned
          </div>
        </div>
      </div>

      {/* Main Content Grid: Multi-Level Settings & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Commission Rates Configuration */}
        <div className={`rounded-3xl p-5 shadow-sm border space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-indigo-600 dark:text-blue-400" />
            <h3 className={`font-extrabold text-base font-['Outfit'] ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Multi-Tier Rate Engine
            </h3>
          </div>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Configure automated instant referral bonuses credited whenever a downline activates any production asset
          </p>

          <form onSubmit={handleSaveRates} className="space-y-3.5 text-xs">
            <div className={`space-y-1 p-3 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex justify-between font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">Level 1 (Direct Invite)</span>
                <span className={`font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{l1Percent}%</span>
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Credited instantly when personal invites purchase plans</p>
              <input
                type="range"
                min="1"
                max="25"
                value={l1Percent}
                onChange={(e) => setL1Percent(Number(e.target.value))}
                className="w-full accent-emerald-500 mt-1 cursor-pointer"
              />
            </div>

            <div className={`space-y-1 p-3 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex justify-between font-bold">
                <span className="text-blue-600 dark:text-blue-400">Level 2 (Secondary Sub-Tier)</span>
                <span className={`font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{l2Percent}%</span>
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Credited from 2nd generation downline activations</p>
              <input
                type="range"
                min="0"
                max="15"
                value={l2Percent}
                onChange={(e) => setL2Percent(Number(e.target.value))}
                className="w-full accent-blue-500 mt-1 cursor-pointer"
              />
            </div>

            <div className={`space-y-1 p-3 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex justify-between font-bold">
                <span className="text-purple-600 dark:text-purple-400">Level 3 (Tertiary Network)</span>
                <span className={`font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{l3Percent}%</span>
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Credited from 3rd generation downline activations</p>
              <input
                type="range"
                min="0"
                max="10"
                value={l3Percent}
                onChange={(e) => setL3Percent(Number(e.target.value))}
                className="w-full accent-purple-500 mt-1 cursor-pointer"
              />
            </div>

            {/* Advanced Dynamic Multipliers */}
            <div className={`space-y-2 p-3 rounded-2xl border ${
              isLight ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-800/40'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" />
                  Commission Multiplier
                </span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">{commissionMultiplier}x</span>
              </div>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Global scale factor applied to all L1, L2, L3 referral rewards
              </p>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={commissionMultiplier}
                onChange={(e) => setCommissionMultiplier(Number(e.target.value))}
                className="w-full accent-indigo-600 mt-1 cursor-pointer"
              />
            </div>

            <div className={`space-y-2 p-3 rounded-2xl border ${
              isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/40'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Daily Income Multiplier
                </span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{incomeMultiplier}x</span>
              </div>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Global surge factor for investment daily profits and automated credits
              </p>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={incomeMultiplier}
                onChange={(e) => setIncomeMultiplier(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-1 cursor-pointer"
              />
            </div>

            {/* Elite Promoter Bonus Switch */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div>
                <span className={`text-[11px] font-bold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Elite Agent Tier Boost
                </span>
                <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  +2% L1 (15+ refs), +3% L1 (30+ refs)
                </span>
              </div>
              <input
                type="checkbox"
                checked={promoterTierBonusEnabled}
                onChange={(e) => setPromoterTierBonusEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Quick Strategy Presets */}
            <div className="space-y-1.5 pt-1">
              <span className={`text-[11px] font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Quick Strategy Presets
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPresetRates(10, 5, 2)}
                  className={`py-1.5 px-1 text-center rounded-xl text-[10px] font-bold border transition-colors ${
                    l1Percent === 10 && l2Percent === 5 && l3Percent === 2
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  Standard<br/><span className="text-[9px] opacity-80">10/5/2%</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetRates(15, 7, 3)}
                  className={`py-1.5 px-1 text-center rounded-xl text-[10px] font-bold border transition-colors ${
                    l1Percent === 15 && l2Percent === 7 && l3Percent === 3
                      ? 'bg-blue-600 text-white border-blue-600'
                      : isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  High Growth<br/><span className="text-[9px] opacity-80">15/7/3%</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetRates(20, 10, 5)}
                  className={`py-1.5 px-1 text-center rounded-xl text-[10px] font-bold border transition-colors ${
                    l1Percent === 20 && l2Percent === 10 && l3Percent === 5
                      ? 'bg-amber-600 text-white border-amber-600'
                      : isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  VIP Surge<br/><span className="text-[9px] opacity-80">20/10/5%</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              Update Commission & Profit Rates
            </button>
          </form>

          {/* Global Automation & Batch Settlement Control Station */}
          <div className={`pt-4 border-t space-y-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <div className="flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              <h4 className={`font-black text-xs uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Global Financial Engine Triggers
              </h4>
            </div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              One-click batch runs to disburse production dividends or flush pending rebates across the entire platform.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsExecutingRun('dividend');
                  setTimeout(() => {
                    triggerGlobalDividendRun();
                    setIsExecutingRun(null);
                  }, 400);
                }}
                disabled={isExecutingRun !== null}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Run Global Dividend Settlement</span>
                </span>
                <span className="text-[10px] bg-emerald-700/60 px-2 py-0.5 rounded-md font-mono">
                  {settings.incomeMultiplier || 1.0}x
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExecutingRun('rebate');
                  setTimeout(() => {
                    triggerGlobalCommissionRebateRun();
                    setIsExecutingRun(null);
                  }, 400);
                }}
                disabled={isExecutingRun !== null}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Flush All Pending Agency Rebates</span>
                </span>
                <span className="text-[10px] bg-blue-700/60 px-2 py-0.5 rounded-md">
                  Auto-Disburse
                </span>
              </button>
            </div>

            {/* Promoter Cash Airdrop Tool */}
            <div className={`p-3 rounded-2xl border space-y-2.5 ${
              isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-950/20 border-amber-800/40'
            }`}>
              <div className="flex items-center justify-between font-bold text-xs text-amber-700 dark:text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  Promoter Cash Airdrop
                </span>
                <span className="font-mono">₹{airdropAmount}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className={`text-[10px] font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Amount (₹)</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={airdropAmount}
                    onChange={(e) => setAirdropAmount(Number(e.target.value))}
                    className={`w-full px-2 py-1 rounded-lg text-xs font-mono font-bold border ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Min Referrals</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={airdropMinReferrals}
                    onChange={(e) => setAirdropMinReferrals(Number(e.target.value))}
                    className={`w-full px-2 py-1 rounded-lg text-xs font-mono font-bold border ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  distributePromoterAirdrop(airdropAmount, airdropMinReferrals);
                }}
                className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition-all"
              >
                Disburse Festival Airdrop
              </button>
            </div>
          </div>
        </div>

        {/* Center & Right: Promoters Leaderboard & Team Tree Inspector */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className={`rounded-3xl p-5 shadow-sm border space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b ${
              isLight ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className={`font-extrabold text-base font-['Outfit'] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Top Platform Promoters & Influencers
                </h3>
              </div>
              
              {/* Search input */}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter promoter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs outline-none w-32 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`uppercase text-[10px] tracking-wider border-b ${
                  isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-slate-950/80 text-slate-400 border-slate-800'
                }`}>
                  <tr>
                    <th className="px-4 py-3">Rank & Member</th>
                    <th className="px-4 py-3">Referral Code</th>
                    <th className="px-4 py-3">Team Size</th>
                    <th className="px-4 py-3">Commission Earned</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono ${
                  isLight ? 'divide-slate-100' : 'divide-slate-800/60'
                }`}>
                  {leaderboard.map((user, idx) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedLeaderId(user.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedLeaderId === user.id 
                          ? isLight ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'bg-blue-950/40 border-l-4 border-blue-500' 
                          : isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <td className={`px-4 py-3 font-bold flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          idx === 0
                            ? 'bg-amber-500 text-slate-950'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className={`font-sans font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{user.name}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{user.phone} • VIP {user.vipLevel}</div>
                        </div>
                      </td>

                      <td className={`px-4 py-3 font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {user.referralCode}
                      </td>

                      <td className={`px-4 py-3 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {user.referralsCount} Members
                      </td>

                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">
                        ₹{(user.teamCommission || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setBonusModalUser(user.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-bold transition-colors border border-emerald-200 dark:border-emerald-500/30"
                        >
                          + Bonus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Leader 3-Tier Downline Tree Inspection */}
          {selectedLeader && (
            <div className={`rounded-3xl p-5 shadow-sm border space-y-4 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b ${
                isLight ? 'border-slate-100' : 'border-slate-800'
              }`}>
                <div>
                  <div className="flex items-center space-x-2">
                    <Network className="w-4 h-4 text-emerald-500" />
                    <h4 className={`font-extrabold text-sm font-['Outfit'] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Network Inspector: {selectedLeader.name}
                    </h4>
                  </div>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Referral Code: <span className="font-bold text-indigo-600 dark:text-blue-400">{selectedLeader.referralCode}</span> • Wallet: ₹{(selectedLeader.balance || 0).toLocaleString()}
                  </span>
                </div>

                {/* Grid / Tree Mode Switcher */}
                <div className={`p-1 rounded-xl border flex space-x-1 ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  <button
                    onClick={() => { sounds.playClick(); setAdminViewMode('grid'); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      adminViewMode === 'grid'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tier Grid
                  </button>
                  <button
                    onClick={() => { sounds.playClick(); setAdminViewMode('tree'); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      adminViewMode === 'tree'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Interactive Tree
                  </button>
                </div>
              </div>

              {/* Sybil & Downline Health Diagnostics */}
              <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                leaderRiskMetrics.sybilRisk === 'high'
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
                  : leaderRiskMetrics.sybilRisk === 'medium'
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
                  : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    leaderRiskMetrics.sybilRisk === 'high'
                      ? 'bg-rose-500 text-white'
                      : leaderRiskMetrics.sybilRisk === 'medium'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {leaderRiskMetrics.sybilRisk === 'high' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : leaderRiskMetrics.sybilRisk === 'medium' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-black ${
                        leaderRiskMetrics.sybilRisk === 'high'
                          ? 'text-rose-700 dark:text-rose-400'
                          : leaderRiskMetrics.sybilRisk === 'medium'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {leaderRiskMetrics.sybilRisk === 'high'
                          ? 'High Sybil / Bot Loop Warning'
                          : leaderRiskMetrics.sybilRisk === 'medium'
                          ? 'Moderate Inactive Network Drift'
                          : 'Healthy & Verified Organic Downline'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-white/60 dark:bg-black/30 border">
                        {leaderRiskMetrics.inactiveRatio}% Inactive
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Total Network Members: <b>{leaderRiskMetrics.totalSubs}</b> • Zero-Recharge Accounts: <b>{leaderRiskMetrics.zeroRechargeCount}</b> • Active Depositors: <b>{leaderRiskMetrics.totalSubs - leaderRiskMetrics.zeroRechargeCount}</b>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      toggleUserFrozen(selectedLeader.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1.5 ${
                      selectedLeader.isFrozen
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-600'
                        : isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {selectedLeader.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{selectedLeader.isFrozen ? 'Unfreeze Promoter' : 'Freeze Promoter'}</span>
                  </button>
                </div>
              </div>

              {adminViewMode === 'grid' ? (
                <>
                  {/* Tier Filter Buttons */}
                  <div className={`p-1 rounded-xl border flex space-x-1 ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}>
                    <button
                      onClick={() => setSelectedLeaderTier(1)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedLeaderTier === 1 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Level 1 ({leaderL1.length})
                    </button>
                    <button
                      onClick={() => setSelectedLeaderTier(2)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedLeaderTier === 2 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Level 2 ({leaderL2.length})
                    </button>
                    <button
                      onClick={() => setSelectedLeaderTier(3)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedLeaderTier === 3 
                          ? 'bg-purple-600 text-white shadow-sm' 
                          : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Level 3 ({leaderL3.length})
                    </button>
                  </div>

                  {currentTierUsers.length === 0 ? (
                    <div className={`text-center py-6 rounded-2xl border ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <Users className="w-8 h-8 mx-auto mb-1 opacity-40" />
                      <p className="text-xs font-bold">No members in Level {selectedLeaderTier} for this user</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {currentTierUsers.map(d => {
                        const commissionProfit = Math.round((d.totalRecharge || 0) * (currentTierRate / 100));
                        return (
                          <div 
                            key={d.id} 
                            className={`p-3 rounded-2xl border flex justify-between items-center transition-all ${
                              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                            }`}
                          >
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className={`font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>{d.name}</span>
                                <span className="text-[9px] text-amber-500 font-bold">VIP {d.vipLevel}</span>
                                {d.isFrozen && (
                                  <span className="text-[9px] bg-rose-500/20 text-rose-500 font-bold px-1.5 py-0.2 rounded">FROZEN</span>
                                )}
                              </div>
                              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                {d.phone} • Ref: {d.referredBy || 'None'}
                              </span>
                            </div>
                            <div className="text-right font-mono">
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold block">
                                +₹{commissionProfit.toLocaleString()}
                              </span>
                              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                Recharge: ₹{(d.totalRecharge || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* Interactive Hierarchical Tree Mode */
                <div className="space-y-3">
                  <div className={`p-3 rounded-2xl border ${
                    isLight ? 'bg-indigo-50/60 border-indigo-100' : 'bg-indigo-950/20 border-indigo-900/40'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          P
                        </div>
                        <div>
                          <span className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            Root Promoter: {selectedLeader.name}
                          </span>
                          <span className="text-[10px] block text-indigo-600 dark:text-indigo-400 font-mono">
                            Referrals: {selectedLeader.referralsCount || 0} • Code: {selectedLeader.referralCode}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                        ₹{(selectedLeader.teamCommission || 0).toLocaleString()} Earned
                      </span>
                    </div>
                  </div>

                  {leaderL1.length === 0 ? (
                    <div className={`text-center py-6 rounded-2xl border ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <Users className="w-7 h-7 mx-auto mb-1 opacity-40" />
                      <p className="text-xs font-bold">No direct invites connected</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pl-3 border-l-2 border-dashed border-indigo-300 dark:border-indigo-800">
                      {leaderL1.map(l1 => {
                        const l1Children = leaderL2.filter(sub => sub.referredBy === l1.referralCode);
                        const isExpanded = !!expandedAdminTrees[l1.id];
                        return (
                          <div key={l1.id} className="space-y-1.5">
                            <div className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                            }`}>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => toggleAdminTree(l1.id)}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-colors ${
                                    isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                  }`}
                                >
                                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </button>
                                <div>
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">L1</span>
                                    <span className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{l1.name}</span>
                                    <span className="text-[9px] text-amber-500 font-bold">VIP {l1.vipLevel}</span>
                                  </div>
                                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {l1.phone} • {l1Children.length} Sub-invites
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <div className="text-right font-mono text-xs">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold block">
                                    ₹{(l1.totalRecharge || 0).toLocaleString()}
                                  </span>
                                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Commission: ₹{Math.round((l1.totalRecharge || 0) * (l1Percent / 100)).toLocaleString()}
                                  </span>
                                </div>
                                <button
                                  onClick={() => { sounds.playClick(); toggleUserFrozen(l1.id); }}
                                  title={l1.isFrozen ? 'Unfreeze' : 'Freeze'}
                                  className={`p-1.5 rounded-lg border ${
                                    l1.isFrozen 
                                      ? 'bg-rose-500 text-white border-rose-600' 
                                      : isLight ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                                  }`}
                                >
                                  {l1.isFrozen ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            {/* Level 2 Sub-Children */}
                            {isExpanded && (
                              <div className="pl-6 space-y-1.5 border-l-2 border-dashed border-blue-300 dark:border-blue-800">
                                {l1Children.length === 0 ? (
                                  <p className={`text-[11px] italic py-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                    No secondary recruits under this member
                                  </p>
                                ) : (
                                  l1Children.map(l2 => {
                                    const l2Children = leaderL3.filter(sub => sub.referredBy === l2.referralCode);
                                    return (
                                      <div key={l2.id} className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                                        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                                      }`}>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400">L2</span>
                                          <div>
                                            <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{l2.name}</span>
                                            <span className={`text-[10px] block font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                              {l2.phone} ({l2Children.length} L3 downlines)
                                            </span>
                                          </div>
                                        </div>
                                        <div className="text-right font-mono">
                                          <span className="text-blue-600 dark:text-blue-400 font-bold block">
                                            ₹{(l2.totalRecharge || 0).toLocaleString()}
                                          </span>
                                          <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Commission: ₹{Math.round((l2.totalRecharge || 0) * (l2Percent / 100)).toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Bonus Reward Modal */}
      {bonusModalUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex justify-between items-start">
              <h3 className={`text-base font-extrabold font-['Outfit'] flex items-center space-x-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <Gift className="w-5 h-5 text-amber-500" />
                <span>Grant Leader Incentive</span>
              </h3>
              <button onClick={() => setBonusModalUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Reward top performing affiliates with extra direct wallet cash for expanding the member base.
            </p>

            <form onSubmit={handleInjectBonus} className="space-y-3">
              <div className="space-y-1 text-xs">
                <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Reward Amount (₹)</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 font-mono font-bold text-base focus:outline-none border ${
                    isLight 
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600' 
                      : 'bg-slate-950 border-slate-700 text-white focus:border-blue-500'
                  }`}
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Incentive Note / Reason</label>
                <input
                  type="text"
                  value={bonusNote}
                  onChange={(e) => setBonusNote(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${
                    isLight 
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600' 
                      : 'bg-slate-950 border-slate-700 text-white focus:border-blue-500'
                  }`}
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBonusModalUser(null)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${
                    isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  Credit Bonus Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
