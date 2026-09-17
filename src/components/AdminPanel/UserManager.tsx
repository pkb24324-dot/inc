import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  UserCheck, 
  Plus, 
  Minus,
  AlertTriangle,
  LogIn,
  Download,
  Award,
  CreditCard,
  Layers,
  Ban,
  Clock,
  ExternalLink,
  ChevronRight,
  X,
  LayoutGrid,
  List,
  Eye,
  Phone,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const UserManager: React.FC = () => {
  const { 
    allUsers, 
    adjustUserBalance, 
    toggleUserFrozen, 
    switchUserAccount, 
    setViewMode,
    updateUserVipLevel,
    grantUserSpins,
    exportDataToCsv,
    userInvestments,
    transactions,
    theme
  } = useApp();

  const isLight = theme === 'light';

  const [layoutMode, setLayoutMode] = useState<'cards' | 'table'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVip, setFilterVip] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'frozen'>('all');

  // Dossier Modal state
  const [dossierUserId, setDossierUserId] = useState<string | null>(null);

  // Balance adjustment in modal or standalone
  const [balanceModalUser, setBalanceModalUser] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState('Promotional Loyalty Reward');

  const filtered = allUsers.filter(u => {
    if (filterStatus === 'active' && u.isFrozen) return false;
    if (filterStatus === 'frozen' && !u.isFrozen) return false;
    if (filterVip !== 'all' && u.vipLevel !== filterVip) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.referralCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUserId = balanceModalUser || dossierUserId;
    if (!targetUserId || adjustAmount <= 0) return;

    sounds.playCash();
    const delta = adjustType === 'credit' ? adjustAmount : -adjustAmount;
    adjustUserBalance(targetUserId, delta, adjustReason);

    setBalanceModalUser(null);
  };

  const handleSwitchAndPreview = (userId: string) => {
    sounds.playClick();
    switchUserAccount(userId);
    setViewMode('user');
  };

  const dossierUser = allUsers.find(u => u.id === dossierUserId);
  const userInvs = userInvestments.filter(i => i.userId === dossierUserId);
  const userTxns = transactions.filter(t => t.userId === dossierUserId);

  return (
    <div className="space-y-6">
      
      {/* Header & CRM Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Investor CRM & Account Surveillance</span>
          </h2>
          <p className="text-xs text-slate-500">
            Audit member portfolios, execute direct balance adjustments, or simulate investor views
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportDataToCsv('users')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              isLight 
                ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700' 
                : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export User Directory</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className={`border rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Member Name, Phone, ID, Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 border ${
              isLight 
                ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400' 
                : 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-500'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className={`flex rounded-xl p-1 border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            {(['all', 'active', 'frozen'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors ${
                  filterStatus === status 
                    ? isLight ? 'bg-white text-blue-600 shadow-sm' : 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <select
            value={filterVip}
            onChange={(e) => setFilterVip(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className={`border rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none ${
              isLight 
                ? 'bg-white border-slate-200 text-slate-700' 
                : 'bg-slate-950 border-slate-700 text-white'
            }`}
          >
            <option value="all">All VIP Tiers</option>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(v => (
              <option key={v} value={v}>VIP {v}</option>
            ))}
          </select>

          {/* Layout Mode Switcher */}
          <div className={`flex rounded-xl p-1 border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              type="button"
              onClick={() => setLayoutMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                layoutMode === 'cards'
                  ? isLight ? 'bg-white text-blue-600 shadow-xs' : 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Cards View (Mobile / Tablet Friendly)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                layoutMode === 'table'
                  ? isLight ? 'bg-white text-blue-600 shadow-xs' : 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View (Desktop Dense)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Display: Cards View OR Table View */}
      {layoutMode === 'cards' ? (
        filtered.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${
            isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            No members match your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filtered.map(user => (
              <div
                key={user.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                  user.isFrozen
                    ? isLight ? 'bg-red-50/50 border-red-200' : 'bg-red-950/20 border-red-800/60'
                    : isLight ? 'bg-white border-slate-200 shadow-xs hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center text-sm shadow-md flex-shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5 truncate">
                        <span className="truncate">{user.name}</span>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 flex-shrink-0">
                          VIP {user.vipLevel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>+91 {user.phone}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        Ref: {user.referralCode}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    user.isFrozen
                      ? isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {user.isFrozen ? 'Frozen' : 'Active'}
                  </span>
                </div>

                {/* Body / Stats */}
                <div className="py-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'
                    }`}>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Available Balance
                      </span>
                      <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{user.balance.toLocaleString()}
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'
                    }`}>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Total Net Profit
                      </span>
                      <div className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">
                        ₹{user.totalEarned.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono px-1">
                    <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                      <ArrowDownLeft className="w-3 h-3" />
                      <span>Recharge: ₹{user.totalRecharge.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-500">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>Withdrawn: ₹{user.totalWithdrawn.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => {
                      setBalanceModalUser(user.id);
                      setAdjustAmount(500);
                      setAdjustType('credit');
                    }}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer ${
                      isLight 
                        ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' 
                        : 'bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600/20'
                    }`}
                    title="Credit/Debit user balance"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Balance</span>
                  </button>

                  <button
                    onClick={() => setDossierUserId(user.id)}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer ${
                      isLight 
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100' 
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                    title="View user dossier profile"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Dossier</span>
                  </button>

                  <button
                    onClick={() => handleSwitchAndPreview(user.id)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                    title="Masquerade login as this user"
                  >
                    <LogIn className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleUserFrozen(user.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      user.isFrozen
                        ? isLight ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        : isLight ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                    }`}
                    title={user.isFrozen ? 'Unfreeze account' : 'Quarantine / Freeze account'}
                  >
                    {user.isFrozen ? 'Unfreeze' : 'Freeze'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
      /* Users Table */
      <div className={`border rounded-3xl overflow-hidden shadow-sm transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase text-[10px] tracking-wider border-b ${
              isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-slate-950/80 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="px-5 py-3.5">User Profile & VIP</th>
                <th className="px-5 py-3.5">Available Balance</th>
                <th className="px-5 py-3.5">Total Influx / Payouts</th>
                <th className="px-5 py-3.5">Total Net Profit</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
              {filtered.map(user => (
                <tr 
                  key={user.id} 
                  onClick={() => setDossierUserId(user.id)}
                  className={`cursor-pointer transition-colors ${
                    isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center text-xs shadow-md flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                          <span>{user.name}</span>
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                            VIP {user.vipLevel}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">+91 {user.phone}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Ref Code: {user.referralCode}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    ₹{user.balance.toLocaleString()}
                  </td>

                  <td className="px-5 py-4 text-[11px] font-mono">
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold">+₹{user.totalRecharge.toLocaleString()}</div>
                    <div className="text-slate-400">-₹{user.totalWithdrawn.toLocaleString()}</div>
                  </td>

                  <td className="px-5 py-4 font-mono font-bold text-purple-600 dark:text-purple-300">
                    ₹{user.totalEarned.toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      user.isFrozen
                        ? isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {user.isFrozen ? 'Suspended / Frozen' : 'Active Verified'}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setBalanceModalUser(user.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        isLight ? 'bg-blue-50 hover:bg-blue-100 text-blue-700' : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300'
                      }`}
                      title="Direct credit or debit balance"
                    >
                      ₹ Adjust
                    </button>

                    <button
                      onClick={() => handleSwitchAndPreview(user.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
                        isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                      title="Masquerade login as this user"
                    >
                      <LogIn className="w-3.5 h-3.5 inline" />
                    </button>

                    <button
                      onClick={() => toggleUserFrozen(user.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        user.isFrozen
                          ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      }`}
                      title={user.isFrozen ? 'Unfreeze account' : 'Quarantine / Freeze account'}
                    >
                      {user.isFrozen ? 'Unfreeze' : 'Freeze'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* USER DOSSIER FULL MODAL */}
      {dossierUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`border rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8 transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            
            <button
              onClick={() => setDossierUserId(null)}
              className={`absolute top-5 right-5 p-1 rounded-xl transition-colors ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Dossier Header */}
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center text-xl shadow-lg flex-shrink-0">
                {dossierUser.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-extrabold font-['Outfit']">{dossierUser.name}</h3>
                  <span className="text-xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                    VIP {dossierUser.vipLevel}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    dossierUser.isFrozen 
                      ? isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/20 text-red-300' 
                      : isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {dossierUser.isFrozen ? 'Suspended' : 'Active Member'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                  <span>Phone: <strong className="text-slate-800 dark:text-white">{dossierUser.phone}</strong></span>
                  <span>ID: <span className="font-mono text-slate-400">{dossierUser.id}</span></span>
                  <span>Invite Code: <strong className="text-amber-600 dark:text-amber-400 font-mono">{dossierUser.referralCode}</strong></span>
                </div>
              </div>
            </div>

            {/* Financial Dossier KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`p-3 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Wallet Balance</span>
                <div className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400">₹{dossierUser.balance.toLocaleString()}</div>
              </div>

              <div className={`p-3 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total Recharged</span>
                <div className="text-base font-mono font-black text-slate-900 dark:text-white">₹{dossierUser.totalRecharge.toLocaleString()}</div>
              </div>

              <div className={`p-3 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total Payouts</span>
                <div className="text-base font-mono font-black text-amber-600 dark:text-amber-400">₹{dossierUser.totalWithdrawn.toLocaleString()}</div>
              </div>

              <div className={`p-3 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Net Profit Earned</span>
                <div className="text-base font-mono font-black text-purple-600 dark:text-purple-400">₹{dossierUser.totalEarned.toLocaleString()}</div>
              </div>
            </div>

            {/* Quick Admin Overrides */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Administrative Overrides</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                
                {/* Change VIP */}
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">VIP Tier Upgrade:</label>
                  <select
                    value={dossierUser.vipLevel}
                    onChange={(e) => updateUserVipLevel(dossierUser.id, Number(e.target.value))}
                    className={`w-full rounded-xl px-2.5 py-1.5 font-bold border ${
                      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(v => (
                      <option key={v} value={v}>VIP {v}</option>
                    ))}
                  </select>
                </div>

                {/* Grant Lucky Spins */}
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Lucky Wheel Spins ({dossierUser.spinChances}):</label>
                  <button
                    onClick={() => grantUserSpins(dossierUser.id, 5)}
                    className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm"
                  >
                    +5 Free Spins
                  </button>
                </div>

                {/* Quarantine Toggle */}
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Security Suspension:</label>
                  <button
                    onClick={() => toggleUserFrozen(dossierUser.id)}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs ${
                      dossierUser.isFrozen
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                    }`}
                  >
                    {dossierUser.isFrozen ? 'Reactivate User' : 'Quarantine User'}
                  </button>
                </div>

              </div>
            </div>

            {/* Linked Bank & UPI Credentials */}
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
            }`}>
              <h4 className="font-bold flex items-center space-x-1.5 text-slate-900 dark:text-white">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>Bound Bank & UPI Withdrawal Credentials</span>
              </h4>
              {dossierUser.bankDetails ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 font-mono">
                  <div>
                    <span className="text-slate-500 block">Bank Name</span>
                    <span className="text-slate-900 dark:text-white font-bold">{dossierUser.bankDetails.bankName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account Number</span>
                    <span className="text-slate-900 dark:text-white font-bold">{dossierUser.bankDetails.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">IFSC Code</span>
                    <span className="text-slate-900 dark:text-white font-bold">{dossierUser.bankDetails.ifsc}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">UPI Virtual ID</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{dossierUser.bankDetails.upiId}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-xs">No bank details bound yet by this member.</p>
              )}
            </div>

            {/* Active Investments Portfolio */}
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
            }`}>
              <div className="flex justify-between items-center">
                <h4 className="font-bold flex items-center space-x-1.5 text-slate-900 dark:text-white">
                  <Layers className="w-4 h-4 text-purple-500" />
                  <span>Subscribed Asset Portfolios ({userInvs.length})</span>
                </h4>
              </div>
              {userInvs.length === 0 ? (
                <p className="text-slate-500 text-xs">No investments active currently.</p>
              ) : (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {userInvs.map(inv => (
                    <div key={inv.id} className={`flex justify-between items-center p-2 rounded-xl border font-mono text-[11px] ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <div>
                        <span className="text-slate-900 dark:text-white font-bold">{inv.planName}</span>
                        <span className="text-slate-500 block text-[10px]">Invested: ₹{inv.investedAmount}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Earned: ₹{inv.earnedSoFar}</span>
                        <span className="text-[10px] text-slate-400 block capitalize">{inv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Balance Adjustment Form inside modal */}
            <form onSubmit={handleAdjustSubmit} className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
            }`}>
              <h4 className="text-xs font-bold flex items-center space-x-1.5 text-slate-900 dark:text-white">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Inject Immediate Capital / Apply Penalty Debit</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className={`flex rounded-xl p-1 border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <button
                    type="button"
                    onClick={() => setAdjustType('credit')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                      adjustType === 'credit' 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-500'
                    }`}
                  >
                    + Credit
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('debit')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                      adjustType === 'debit' 
                        ? 'bg-red-600 text-white' 
                        : 'text-slate-500'
                    }`}
                  >
                    - Debit
                  </button>
                </div>

                <input
                  type="number"
                  min="1"
                  step="10"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  placeholder="Amount ₹"
                  className={`rounded-xl px-3 py-1.5 font-mono font-bold text-xs border focus:outline-none ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />

                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Audit reason note..."
                  className={`rounded-xl px-3 py-1.5 text-xs border focus:outline-none ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30"
                >
                  Execute Balance Adjustment
                </button>
              </div>
            </form>

            <div className={`flex justify-between items-center pt-2 border-t ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <button
                onClick={() => handleSwitchAndPreview(dossierUser.id)}
                className="flex items-center space-x-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Simulate & Login as {dossierUser.name} &rarr;</span>
              </button>

              <button
                onClick={() => setDossierUserId(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Standalone Balance Adjustment Modal */}
      {balanceModalUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <h3 className="text-base font-extrabold font-['Outfit'] flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span>Modify Member Balance</span>
            </h3>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div className={`flex rounded-xl p-1 border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`flex-1 py-1.5 rounded-lg font-bold ${
                    adjustType === 'credit' 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-slate-500'
                  }`}
                >
                  + Credit
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('debit')}
                  className={`flex-1 py-1.5 rounded-lg font-bold ${
                    adjustType === 'debit' 
                      ? 'bg-red-600 text-white' 
                      : 'text-slate-500'
                  }`}
                >
                  - Debit
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">Adjustment Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  required
                  className={`w-full rounded-xl px-3 py-2 font-mono font-bold text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">Audit Reason Note</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  required
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBalanceModalUser(null)}
                  className={`flex-1 py-2 rounded-xl font-bold border ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
