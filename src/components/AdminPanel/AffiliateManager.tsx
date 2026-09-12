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
  Sparkles,
  Layers,
  Flame,
  X
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const AffiliateManager: React.FC = () => {
  const { allUsers, settings, saveSettings, adjustUserBalance, theme } = useApp();
  const isLight = theme === 'light';

  const [l1Percent, setL1Percent] = useState<number>(settings.referralL1Percent || 10);
  const [l2Percent, setL2Percent] = useState<number>(settings.referralL2Percent || 5);
  const [l3Percent, setL3Percent] = useState<number>(settings.referralL3Percent || 2);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(allUsers[0]?.id || null);
  const [selectedLeaderTier, setSelectedLeaderTier] = useState<1 | 2 | 3>(1);

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
    });
    sounds.playSuccess();
  };

  const handleInjectBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusModalUser) return;
    adjustUserBalance(bonusModalUser, Number(bonusAmount), bonusNote || `Promoter Leadership Bonus`);
    setBonusModalUser(null);
    sounds.playSuccess();
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

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              Update Commission Splits
            </button>
          </form>
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
                <div className="flex items-center space-x-2">
                  <Network className="w-4 h-4 text-emerald-500" />
                  <h4 className={`font-extrabold text-sm font-['Outfit'] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Tree Hierarchy: {selectedLeader.name} (Code: {selectedLeader.referralCode})
                  </h4>
                </div>

                {/* Tier Switcher for selected leader */}
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
                    const commissionYield = Math.round((d.totalRecharge || 0) * (currentTierRate / 100));
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
                          </div>
                          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {d.phone} • Ref: {d.referredBy || 'None'}
                          </span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold block">
                            +₹{commissionYield.toLocaleString()}
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
