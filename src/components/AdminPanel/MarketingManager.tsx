import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Gift, 
  Megaphone, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Clock, 
  Radio, 
  Tag, 
  AlertCircle,
  Copy,
  Percent,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const MarketingManager: React.FC = () => {
  const { 
    giftCodes, 
    createGiftCode, 
    toggleGiftCode, 
    deleteGiftCode, 
    settings, 
    saveSettings 
  } = useApp();

  const [codeName, setCodeName] = useState('');
  const [bonusAmount, setBonusAmount] = useState<number>(200);
  const [maxUsage, setMaxUsage] = useState<number>(100);
  const [expiryDays, setExpiryDays] = useState<number>(7);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Broadcast settings form
  const [broadcastText, setBroadcastText] = useState(settings.broadcastNotice || '');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'promo' | 'celebration'>(settings.broadcastType || 'celebration');

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeName.trim()) return;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiryDays);

    createGiftCode({
      code: codeName.trim().toUpperCase(),
      amount: Number(bonusAmount),
      maxUses: Number(maxUsage),
      expiresAt: expiry.toISOString(),
      isActive: true,
    });

    sounds.playSuccess();
    setCodeName('');
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    sounds.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      broadcastNotice: broadcastText,
      broadcastType: broadcastType,
    });
    sounds.playSuccess();
  };

  const totalBonusGiven = giftCodes.reduce((sum, g) => sum + (g.usedCount * g.amount), 0);
  const totalClaims = giftCodes.reduce((sum, g) => sum + g.usedCount, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white font-['Outfit'] flex items-center space-x-2">
            <Gift className="w-5 h-5 text-pink-400" />
            <span>Marketing, Gift Vouchers & Broadcast Ticker</span>
          </h2>
          <p className="text-xs text-slate-400">
            Generate promotional redeem codes for user cash incentives & push live system-wide alert notices
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold">
            Promo Disbursed: ₹{totalBonusGiven.toLocaleString()} ({totalClaims} Claims)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Create Gift Code */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Tag className="w-4 h-4 text-pink-400" />
            <h3 className="font-bold text-white text-sm">Issue New Gift Voucher</h3>
          </div>

          <form onSubmit={handleCreateCode} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold mb-1 block">Voucher Code (Uppercase)</label>
              <input
                type="text"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value.toUpperCase())}
                placeholder="e.g. MEGA2026, VIPBONUS"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase focus:outline-none focus:border-pink-500"
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['BONUS100', 'FLASH500', 'SUPER2026', 'FESTIVE50'].map(sample => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setCodeName(sample)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md font-mono"
                  >
                    +{sample}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold mb-1 block">Cash Bonus Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Max Usage Quota</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Valid For (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-600/30 flex items-center justify-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Gift Voucher</span>
            </button>
          </form>

          {/* Quick Info Box */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">How users redeem:</span>
            <p>Users tap "Redeem Voucher" in their Mobile Profile tab, enter the code, and funds credit directly to their available balance with an instant transaction record.</p>
          </div>
        </div>

        {/* Right Column: Active Vouchers List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Active & Historic Gift Vouchers ({giftCodes.length})</h3>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
            {giftCodes.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No gift vouchers created yet. Use the generator on the left to launch one!
              </div>
            ) : (
              giftCodes.map((g) => {
                const isExpired = new Date(g.expiresAt).getTime() < Date.now();
                const isExhausted = g.usedCount >= g.maxUses;
                const percent = Math.min(100, Math.round((g.usedCount / g.maxUses) * 100));

                return (
                  <div 
                    key={g.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      !g.isActive || isExpired || isExhausted
                        ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black font-mono text-pink-400 tracking-wider bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-lg select-all">
                            {g.code}
                          </span>
                          <button
                            onClick={() => handleCopy(g.code, g.id)}
                            className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                            title="Copy code"
                          >
                            {copiedId === g.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <span className="text-xs font-black text-emerald-400 font-mono">
                            +₹{g.amount}
                          </span>

                          {isExpired ? (
                            <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                              Expired
                            </span>
                          ) : isExhausted ? (
                            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                              Fully Claimed
                            </span>
                          ) : g.isActive ? (
                            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                              Paused
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                          <span>Expires: {new Date(g.expiresAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Claimed: <strong className="text-white font-mono">{g.usedCount}</strong> / {g.maxUses} users</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <button
                          onClick={() => toggleGiftCode(g.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            g.isActive 
                              ? 'bg-slate-800 hover:bg-slate-700 text-amber-400' 
                              : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                          }`}
                        >
                          {g.isActive ? 'Pause' : 'Activate'}
                        </button>

                        <button
                          onClick={() => deleteGiftCode(g.id)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete code"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isExhausted ? 'bg-amber-400' : 'bg-pink-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Broadcast Announcement & Live Marquee Banner Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-base">Site-Wide Live Broadcast Marquee Banner</h3>
              <p className="text-xs text-slate-400">Pushes instant notification banner across all user mobile headers</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Announcement Message / Headline
              </label>
              <input
                type="text"
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="e.g. ⚡ Special Flash Plans (1m to 1h) are now live! Get instant dividend payout directly into wallet!"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Theme / Priority Banner Style
              </label>
              <select
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="celebration">🎉 Celebration / Flash Plan Launch</option>
                <option value="promo">🎁 Promo / Extra Deposit Cashback</option>
                <option value="info">ℹ️ System Routine Update</option>
                <option value="warning">⚠️ High Priority Notice</option>
              </select>
            </div>

          </div>

          {/* Live Preview Box */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
              Live Preview as seen on User Screen:
            </span>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 flex items-center space-x-2 text-xs text-amber-300 font-medium overflow-hidden">
              <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span className="truncate">{broadcastText || 'No announcement message currently set.'}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Update & Broadcast to All Users</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
