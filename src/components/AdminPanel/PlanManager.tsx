import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Star, 
  TrendingUp, 
  Eye, 
  EyeOff,
  Zap,
  Clock
} from 'lucide-react';
import { InvestmentPlan, CycleUnit, PlanCategory } from '../../types';

export const PlanManager: React.FC = () => {
  const { plans, createPlan, updatePlan, deletePlan } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'normal' | 'flash' | 'vip' | 'high_return'>('all');

  // New Plan form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlanCategory>('flash');
  const [badge, setBadge] = useState('⚡ Flash 1 Min');
  const [price, setPrice] = useState<number>(500);
  const [dailyIncome, setDailyIncome] = useState<number>(650);
  const [cycleUnit, setCycleUnit] = useState<CycleUnit>('minute');
  const [cycleDuration, setCycleDuration] = useState<number>(1);
  const [cycleDays, setCycleDays] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80');
  const [description, setDescription] = useState('Ultra rapid liquid return asset with instantaneous payout.');

  const isFlash = category === 'flash' || cycleUnit === 'minute' || cycleUnit === 'hour';
  const totalRevenue = isFlash ? dailyIncome : dailyIncome * cycleDays;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // calculate equivalent cycleDays for backward compatibility
    const days = cycleUnit === 'minute' ? cycleDuration / 1440 : cycleUnit === 'hour' ? cycleDuration / 24 : cycleDuration;

    createPlan({
      name,
      category,
      badge,
      price,
      dailyIncome: isFlash ? Math.round(dailyIncome - price) : dailyIncome,
      cycleDays: Math.max(0.001, days),
      cycleDuration,
      cycleUnit,
      totalRevenue: isFlash ? dailyIncome : totalRevenue,
      imageUrl,
      description,
      isActive: true,
      popular: category === 'flash' || (category === 'normal' && price <= 1000),
    });

    setIsCreating(false);
    setName('');
  };

  const toggleActive = (id: string, current: boolean) => {
    updatePlan(id, { isActive: !current });
  };

  const getDurationLabel = (p: InvestmentPlan) => {
    if (p.cycleUnit === 'minute') {
      const m = p.cycleDuration || 1;
      return m === 1 ? '1 Min' : `${m} Mins`;
    }
    if (p.cycleUnit === 'hour') {
      const h = p.cycleDuration || 1;
      return h === 1 ? '1 Hour' : `${h} Hours`;
    }
    return `${p.cycleDays} Days`;
  };

  const filteredPlans = activeFilter === 'all' ? plans : plans.filter(p => p.category === activeFilter);

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white font-['Outfit'] flex items-center space-x-2">
            <Package className="w-5 h-5 text-purple-400" />
            <span>Investment Plans Manager</span>
          </h2>
          <p className="text-xs text-slate-400">
            Create and manage Flash (1m-1h), Normal, VIP, and High Return investment packages
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Plan</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Plans' },
          { id: 'flash', label: '⚡ Flash (1m-1h)' },
          { id: 'normal', label: 'Normal Plans' },
          { id: 'vip', label: 'VIP Plans' },
          { id: 'high_return', label: '24H Quick Return' },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === filter.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Plan Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Launch New Investment Package</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Plan / Asset Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pidilite 1-Min Turbo Liquid Return"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const val = e.target.value as PlanCategory;
                      setCategory(val);
                      if (val === 'flash') {
                        setCycleUnit('minute');
                        setCycleDuration(1);
                        setBadge('⚡ 1-Min Return');
                      } else {
                        setCycleUnit('day');
                        setCycleDuration(5);
                        setBadge('Hot Asset');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="flash">⚡ Flash Plan (1m - 1h)</option>
                    <option value="normal">Normal Plan</option>
                    <option value="vip">VIP Plan</option>
                    <option value="high_return">24H High Return</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Hot Product / ⚡ Flash"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Cycle Unit & Duration for Flash Plans */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-amber-400 block mb-1">Duration Unit</label>
                  <select
                    value={cycleUnit}
                    onChange={(e) => {
                      const u = e.target.value as CycleUnit;
                      setCycleUnit(u);
                      if (u === 'minute') setCycleDuration(1);
                      if (u === 'hour') setCycleDuration(1);
                      if (u === 'day') setCycleDuration(3);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="minute">Minute(s) (1m - 59m)</option>
                    <option value="hour">Hour(s) (1h)</option>
                    <option value="day">Day(s)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-400 block mb-1">
                    {cycleUnit === 'minute' ? 'Duration (1 to 60 Minutes)' : cycleUnit === 'hour' ? 'Duration (Hours)' : 'Duration (Days)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={cycleUnit === 'minute' ? 60 : 365}
                    required
                    value={cycleDuration}
                    onChange={(e) => setCycleDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Principal Price (₹)</label>
                  <input
                    type="number"
                    min={50}
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isFlash ? 'Total Payout Return (₹)' : 'Daily Return (₹)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={dailyIncome}
                    onChange={(e) => setDailyIncome(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Calculated Total */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between text-xs">
                <span className="text-slate-400">
                  {isFlash ? `Net Profit Return (+₹${Math.max(0, dailyIncome - price).toLocaleString()}):` : 'Total Guaranteed Return:'}
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  ₹{(isFlash ? dailyIncome : totalRevenue).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
                >
                  Launch Plan Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map((p) => {
          const isPlanFlash = p.category === 'flash' || p.cycleUnit === 'minute' || p.cycleUnit === 'hour';

          return (
            <div
              key={p.id}
              className={`bg-slate-900 border rounded-3xl p-4 shadow-md space-y-3 relative transition-all ${
                p.isActive ? (isPlanFlash ? 'border-amber-500/30' : 'border-slate-800') : 'border-red-900/50 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center space-x-1 ${
                  isPlanFlash ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {isPlanFlash && <Zap className="w-3 h-3 fill-amber-400" />}
                  <span>{p.category}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {p.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="flex space-x-3 items-center">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-sm text-white truncate font-['Outfit']">{p.name}</h4>
                  <div className="text-sm font-black text-amber-400 font-mono mt-0.5">
                    ₹{p.price.toLocaleString()}
                    <span className="text-[10px] text-slate-400 font-normal"> / {getDurationLabel(p)}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isPlanFlash ? 'Maturity Return: ' : 'Daily: '}
                    <span className="font-mono text-emerald-400 font-bold">₹{(isPlanFlash ? p.totalRevenue : p.dailyIncome).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 text-xs flex justify-between">
                <span className="text-slate-400">{isPlanFlash ? 'Net Profit Return:' : 'Total Return:'}</span>
                <span className="font-mono font-bold text-white">
                  {isPlanFlash ? `+₹${(p.totalRevenue - p.price).toLocaleString()}` : `₹${p.totalRevenue.toLocaleString()}`}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">
                  {p.totalPurchasedCount.toLocaleString()} subscriptions
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => toggleActive(p.id, p.isActive)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      p.isActive ? 'text-amber-400 hover:bg-slate-800' : 'text-emerald-400 hover:bg-slate-800'
                    }`}
                    title={p.isActive ? 'Disable Plan' : 'Activate Plan'}
                  >
                    {p.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deletePlan(p.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/60 transition-colors"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
