import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  Save, 
  QrCode, 
  Building2, 
  DollarSign, 
  Percent, 
  Check, 
  ShieldCheck, 
  Headphones 
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const GatewaySettings: React.FC = () => {
  const { settings, updateSettings, theme } = useApp();
  const isLight = theme === 'light';

  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    sounds.playSuccess();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-500" />
            <span>Gateway & Financial Policy Settings</span>
          </h2>
          <p className="text-xs text-slate-500">
            Configure merchant UPI handles, payout fee schedules, and tiered referral rewards
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Settings Saved Successfully!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Merchant UPI Configuration */}
        <div className={`border rounded-3xl p-5 shadow-sm space-y-4 transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className={`flex items-center space-x-2 pb-2 border-b ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <QrCode className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Deposit UPI Merchant Gateway
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Merchant UPI ID (Users pay to this VPA)
              </label>
              <input
                type="text"
                required
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 text-emerald-700' 
                    : 'bg-slate-950 border-slate-700 text-emerald-400'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Merchant Registered Display Name
              </label>
              <input
                type="text"
                required
                value={formData.merchantName}
                onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 text-slate-900' 
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Financial Limits & Withdrawal Fee Schedule */}
        <div className={`border rounded-3xl p-5 shadow-sm space-y-4 transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className={`flex items-center space-x-2 pb-2 border-b ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <DollarSign className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Transaction Volume & Fee Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Minimum Recharge (₹)
              </label>
              <input
                type="number"
                min={10}
                value={formData.minDeposit}
                onChange={(e) => setFormData({ ...formData, minDeposit: Number(e.target.value) })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Maximum Recharge (₹)
              </label>
              <input
                type="number"
                min={100}
                value={formData.maxDeposit}
                onChange={(e) => setFormData({ ...formData, maxDeposit: Number(e.target.value) })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Minimum Withdrawal (₹)
              </label>
              <input
                type="number"
                min={50}
                value={formData.minWithdrawal}
                onChange={(e) => setFormData({ ...formData, minWithdrawal: Number(e.target.value) })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Maximum Single Withdrawal (₹)
              </label>
              <input
                type="number"
                min={1000}
                value={formData.maxWithdrawal}
                onChange={(e) => setFormData({ ...formData, maxWithdrawal: Number(e.target.value) })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Withdrawal Fee / TDS Deduction (%)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={formData.withdrawalFeePercent}
                onChange={(e) => setFormData({ ...formData, withdrawalFeePercent: Number(e.target.value) })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-red-600' : 'bg-slate-950 border-slate-700 text-red-400'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Customer Support Telegram Link
              </label>
              <input
                type="text"
                value={formData.supportTelegram}
                onChange={(e) => setFormData({ ...formData, supportTelegram: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-blue-600' : 'bg-slate-950 border-slate-700 text-blue-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 3-Tier Referral Commission Structure */}
        <div className={`border rounded-3xl p-5 shadow-sm space-y-4 transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className={`flex items-center space-x-2 pb-2 border-b ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <Percent className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              3-Tier Affiliate Commission Rates
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Tier 1 (Direct Referral %)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={formData.referralL1Percent}
                onChange={(e) => setFormData({ ...formData, referralL1Percent: Number(e.target.value) })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-purple-700' : 'bg-slate-950 border-slate-700 text-purple-400'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Tier 2 (Indirect Referral %)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={formData.referralL2Percent}
                onChange={(e) => setFormData({ ...formData, referralL2Percent: Number(e.target.value) })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-purple-700' : 'bg-slate-950 border-slate-700 text-purple-400'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Tier 3 (Third Level %)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={formData.referralL3Percent}
                onChange={(e) => setFormData({ ...formData, referralL3Percent: Number(e.target.value) })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-purple-700' : 'bg-slate-950 border-slate-700 text-purple-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Update System Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
};
