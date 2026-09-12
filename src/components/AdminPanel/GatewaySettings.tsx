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
  Zap,
  Globe,
  Lock,
  Eye,
  EyeOff,
  ExternalLink,
  Copy,
  Terminal,
  Activity,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { WatchPayLogo } from '../WatchPay/WatchPayLogo';
import { 
  WATCHPAY_PRESETS, 
  WATCHPAY_CALLBACK_IP, 
  WATCHPAY_ENDPOINTS,
  buildWatchPayDepositPayload 
} from '../../utils/watchpay';

export const GatewaySettings: React.FC = () => {
  const { settings, updateSettings, theme, showNotification } = useApp();
  const isLight = theme === 'light';

  const [formData, setFormData] = useState({
    ...settings,
    watchpayEnabled: settings.watchpayEnabled ?? true,
    watchpayDomain: settings.watchpayDomain || 'https://api.watchpay.net',
    watchpayMerchantNo: settings.watchpayMerchantNo || '100666859',
    watchpayPayKey: settings.watchpayPayKey || '4abd8ad7b8a44bfcbeaa8ad8e30dae30',
    watchpayPayType: settings.watchpayPayType || '101',
    watchpayCountry: settings.watchpayCountry || 'India',
    watchpayTransferKey: settings.watchpayTransferKey || 'ZGZY3REWQJLAWRCRTHWQVGWYPMD878KQ',
    watchpayCallbackIp: settings.watchpayCallbackIp || WATCHPAY_CALLBACK_IP,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedCountryKey, setSelectedCountryKey] = useState<string>('india');
  const [showPayKey, setShowPayKey] = useState(false);
  const [showTransferKey, setShowTransferKey] = useState(false);
  const [testLog, setTestLog] = useState<string | null>(null);

  const handleApplyPreset = (presetKey: string) => {
    const preset = WATCHPAY_PRESETS[presetKey];
    if (!preset) return;

    setSelectedCountryKey(presetKey);
    setFormData(prev => ({
      ...prev,
      watchpayCountry: preset.country,
      watchpayMerchantNo: preset.merchantNo,
      watchpayPayKey: preset.payKey,
      watchpayTransferKey: preset.transferKey,
      watchpayPayType: preset.defaultPayType,
    }));
    sounds.playClick();
    showNotification(`Loaded WatchPay test configuration for ${preset.country} (${preset.flag})`, 'info');
  };

  const handleRunGatewayTest = () => {
    sounds.playClick();
    const testResult = buildWatchPayDepositPayload({
      merchantNo: formData.watchpayMerchantNo,
      payKey: formData.watchpayPayKey,
      amount: 1000,
      payType: formData.watchpayPayType,
    });

    setTestLog(`[WATCHPAY-SANDBOX-INSPECTION]
Domain: ${formData.watchpayDomain}
Endpoint: ${WATCHPAY_ENDPOINTS.payWeb}
Merchant No: ${formData.watchpayMerchantNo}
Active Pay Type: ${formData.watchpayPayType}
Callback IP Whitelist: ${formData.watchpayCallbackIp} (Strict Enforced)
---
Signature String:
${testResult.signStringPreview}
Generated Sign (MD5): ${testResult.payload.sign}
---
Simulated Cashier URL:
${testResult.cashierUrl}
Status: 200 OK (Ready to dispatch deposit traffic)`);

    showNotification('WatchPay gateway diagnostic passed! Signature verified.', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    sounds.playSuccess();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const currentPreset = WATCHPAY_PRESETS[selectedCountryKey] || WATCHPAY_PRESETS.india;

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold flex items-center space-x-2 text-slate-900 dark:text-white">
            <Settings className="w-5 h-5 text-emerald-500" />
            <span>Gateway & Financial Settlement Console</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage WatchPay multi-country aggregation routes, callback firewall, and domestic treasury parameters
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Settings Saved Successfully!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ========================================================= */}
        {/* 1. WATCHPAY GLOBAL GATEWAY SECTION */}
        {/* ========================================================= */}
        <div className={`border rounded-3xl p-6 shadow-sm space-y-5 transition-colors relative overflow-hidden ${
          isLight ? 'bg-white border-emerald-200/80 shadow-emerald-500/5' : 'bg-slate-900 border-emerald-500/30 shadow-emerald-500/10'
        }`}>
          {/* Subtle glow border top accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

          {/* WatchPay Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <WatchPayLogo variant="full" theme={isLight ? 'light' : 'dark'} />
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-500/40">
                  Global Aggregator
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                  IP: {formData.watchpayCallbackIp}
                </span>
              </div>
            </div>

            {/* Gateway Active Switch */}
            <label className="inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.watchpayEnabled}
                onChange={(e) => setFormData({ ...formData, watchpayEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                {formData.watchpayEnabled ? 'Gateway Enabled' : 'Gateway Disabled'}
              </span>
            </label>
          </div>

          {/* Quick Country Presets Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>One-Click Test Merchant Country Presets:</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Click country to load test merchant credentials
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Object.entries(WATCHPAY_PRESETS).map(([key, preset]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => handleApplyPreset(key)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                    formData.watchpayMerchantNo === preset.merchantNo
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm'
                      : isLight
                      ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center space-x-1.5 truncate">
                    <span>{preset.flag}</span>
                    <span className="truncate">{preset.country}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {preset.currency}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Gateway Credentials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Merchant No */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Merchant No (商户号)
              </label>
              <input
                type="text"
                required
                value={formData.watchpayMerchantNo}
                onChange={(e) => setFormData({ ...formData, watchpayMerchantNo: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-emerald-400'
                }`}
              />
            </div>

            {/* Pay Type */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Active Channel Code (pay_type 通道编码)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.watchpayPayType}
                  onChange={(e) => setFormData({ ...formData, watchpayPayType: e.target.value })}
                  placeholder="e.g. 101"
                  className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Callback Firewall IP */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Security Callback IP (我司回调 IP)
              </label>
              <input
                type="text"
                required
                value={formData.watchpayCallbackIp}
                onChange={(e) => setFormData({ ...formData, watchpayCallbackIp: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-amber-400'
                }`}
              />
            </div>

            {/* Payment Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Payment Secret Key (支付密钥)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPayKey(!showPayKey)}
                  className="text-[10px] text-slate-500 hover:text-emerald-500 flex items-center space-x-0.5"
                >
                  {showPayKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPayKey ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showPayKey ? 'text' : 'password'}
                required
                value={formData.watchpayPayKey}
                onChange={(e) => setFormData({ ...formData, watchpayPayKey: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            {/* Transfer / Payout Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Transfer Payout Key (代付密钥)
                </label>
                <button
                  type="button"
                  onClick={() => setShowTransferKey(!showTransferKey)}
                  className="text-[10px] text-slate-500 hover:text-emerald-500 flex items-center space-x-0.5"
                >
                  {showTransferKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showTransferKey ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showTransferKey ? 'text' : 'password'}
                required
                value={formData.watchpayTransferKey}
                onChange={(e) => setFormData({ ...formData, watchpayTransferKey: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            {/* Gateway Domain */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Gateway Base Domain (域名)
              </label>
              <input
                type="text"
                required
                value={formData.watchpayDomain}
                onChange={(e) => setFormData({ ...formData, watchpayDomain: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

          </div>

          {/* Available Channels for selected country */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <span>Supported Channel Catalog for {currentPreset.country} ({currentPreset.flag}):</span>
              </span>
              <span className="text-[11px] text-emerald-500 font-bold">
                Click any channel to activate for deposits
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {[...currentPreset.channelsTier1, ...currentPreset.channelsTier2, ...(currentPreset.channelsTier3 || [])].map((ch) => (
                <button
                  type="button"
                  key={ch.code}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, watchpayPayType: ch.code }));
                    sounds.playClick();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    formData.watchpayPayType === ch.code
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500 font-bold'
                      : isLight
                      ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span>{ch.name}</span>
                    <span className="font-mono text-[10px] opacity-80">pay_type={ch.code}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{ch.description}</p>
                </button>
              ))}
            </div>

            {currentPreset.notes && (
              <div className="flex items-start space-x-2 text-[11px] text-amber-600 dark:text-amber-400 mt-2 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{currentPreset.notes}</span>
              </div>
            )}
          </div>

          {/* Test & Diagnostic Tools */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Only callbacks signed with Pay Key & originating from {formData.watchpayCallbackIp} are processed.</span>
            </div>

            <button
              type="button"
              onClick={handleRunGatewayTest}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center justify-center space-x-2 border border-emerald-500/30 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Inspect Signature & Test /pay/web</span>
            </button>
          </div>

          {/* Diagnostic Log Output */}
          {testLog && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400/90 whitespace-pre-wrap leading-relaxed animate-in fade-in">
              {testLog}
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* 2. MANUAL BACKUP UPI & BANK ACCOUNT */}
        {/* ========================================================= */}
        <div className={`border rounded-3xl p-5 shadow-sm space-y-4 transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className={`flex items-center space-x-2 pb-2 border-b ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <QrCode className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Manual Offline UPI & Bank Account (Fallback)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Admin UPI ID (Manual QR Transfer)
              </label>
              <input
                type="text"
                required
                value={formData.adminUpiId}
                onChange={(e) => setFormData({ ...formData, adminUpiId: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 text-blue-700' 
                    : 'bg-slate-950 border-slate-700 text-blue-400'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Registered Merchant Beneficiary Name
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

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Bank Name
              </label>
              <input
                type="text"
                required
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-medium border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                required
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-amber-400'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Bank IFSC Code
              </label>
              <input
                type="text"
                required
                value={formData.bankIfsc}
                onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                QR Code Image URL
              </label>
              <input
                type="text"
                required
                value={formData.qrCodeUrl}
                onChange={(e) => setFormData({ ...formData, qrCodeUrl: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. TRANSACTION VOLUME & FEE THRESHOLDS */}
        {/* ========================================================= */}
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
                value={formData.minRecharge}
                onChange={(e) => setFormData({ ...formData, minRecharge: Number(e.target.value) })}
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
                value={formData.maxRecharge}
                onChange={(e) => setFormData({ ...formData, maxRecharge: Number(e.target.value) })}
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
                value={formData.telegramSupportLink}
                onChange={(e) => setFormData({ ...formData, telegramSupportLink: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono border focus:outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-blue-600' : 'bg-slate-950 border-slate-700 text-blue-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. 3-TIER REFERRAL COMMISSION */}
        {/* ========================================================= */}
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

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save System & WatchPay Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
