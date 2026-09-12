import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  FileText,
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { WatchPayLogo } from '../WatchPay/WatchPayLogo';
import { WatchPayCashierModal } from '../WatchPay/WatchPayCashierModal';
import { WATCHPAY_CALLBACK_IP, WATCHPAY_PRESETS } from '../../utils/watchpay';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
}

export const RechargeModal: React.FC<Props> = ({ isOpen, onClose, defaultAmount = 700 }) => {
  const { settings, submitDepositRequest, completeWatchPayDeposit, openRecordsModal } = useApp();
  const [amount, setAmount] = useState<number>(defaultAmount);
  
  // Primary Gateway Mode: 'watchpay' or 'manual'
  const [gatewayMode, setGatewayMode] = useState<'watchpay' | 'manual'>('watchpay');
  const [selectedPayType, setSelectedPayType] = useState<string>(settings.watchpayPayType || '101');
  const [isCashierOpen, setIsCashierOpen] = useState(false);

  // Manual fallback state
  const [manualMethod, setManualMethod] = useState<'UPI' | 'Bank Transfer' | 'USDT'>('UPI');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const quickAmounts = [500, 700, 1500, 3800, 7500, 15000];

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.adminUpiId);
    setCopiedUpi(true);
    sounds.playClick();
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyBank = () => {
    navigator.clipboard.writeText(`${settings.bankAccount} (IFSC: ${settings.bankIfsc})`);
    setCopiedBank(true);
    sounds.playClick();
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) return;
    setIsSubmitting(true);

    const success = submitDepositRequest(amount, manualMethod, utrNumber.trim());
    setIsSubmitting(false);

    if (success) {
      onClose();
      setUtrNumber('');
    }
  };

  const handleOpenWatchPay = () => {
    if (amount < settings.minRecharge) {
      sounds.playError();
      return;
    }
    sounds.playClick();
    setIsCashierOpen(true);
  };

  const handleWatchPaySuccess = (orderId: string, paidAmount: number, utr: string, channelName: string) => {
    completeWatchPayDeposit(orderId, paidAmount, utr, channelName);
    setIsCashierOpen(false);
    onClose();
  };

  const availableChannels = [
    { code: '101', name: 'Paytm Native 一类', badge: 'Recommended', desc: '官方推荐测试通道' },
    { code: '105', name: 'UPI 娱乐二类', badge: 'High Speed', desc: 'UPI 极速清算' },
    { code: '131', name: 'Paytm 跑分一类', badge: '99.8% Success', desc: '高并发通道' },
    { code: '152', name: 'UPI 原生二类', badge: 'Direct Bank', desc: '原生银行清算' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center space-x-2">
                  <span>Recharge Treasury Wallet</span>
                </h2>
                <p className="text-xs text-slate-400">Instant Automated Settlement Gateway</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openRecordsModal('recharge');
                }}
                className="text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center space-x-1 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Record</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            
            {/* Amount Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Select Deposit Amount (₹)
                </label>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>Instant Auto-Credit</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {quickAmounts.map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => {
                      setAmount(amt);
                      sounds.playClick();
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      amount === amt
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30 scale-102'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min={settings.minRecharge}
                  max={settings.maxRecharge}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
                  placeholder="Custom Amount"
                  required
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 px-1">
                <span>Min: ₹{settings.minRecharge}</span>
                <span>Max: ₹{settings.maxRecharge.toLocaleString()}</span>
              </div>
            </div>

            {/* Gateway Mode Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Deposit Clearance Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                
                {/* WatchPay Option */}
                <button
                  type="button"
                  onClick={() => {
                    setGatewayMode('watchpay');
                    sounds.playClick();
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    gatewayMode === 'watchpay'
                      ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <WatchPayLogo variant="compact" theme="dark" />
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Auto ⚡
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Instant Paytm / UPI QR / Cards with 0-sec auto callback
                  </p>
                </button>

                {/* Manual UTR Option */}
                <button
                  type="button"
                  onClick={() => {
                    setGatewayMode('manual');
                    sounds.playClick();
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    gatewayMode === 'manual'
                      ? 'bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-900 border-blue-500 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <QrCode className="w-4 h-4 text-blue-400" />
                      <span>Manual UTR</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-400 bg-slate-800">
                      Offline
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Direct Bank IMPS / UPI transfer with manual 12-digit UTR
                  </p>
                </button>

              </div>
            </div>

            {/* WATCHPAY VIEW */}
            {gatewayMode === 'watchpay' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* WatchPay Channel Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      WatchPay Channel Route (pay_type)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      MCH: {settings.watchpayMerchantNo || '100666859'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {availableChannels.map((ch) => (
                      <button
                        type="button"
                        key={ch.code}
                        onClick={() => {
                          setSelectedPayType(ch.code);
                          sounds.playClick();
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedPayType === ch.code
                            ? 'bg-emerald-500/15 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className={selectedPayType === ch.code ? 'text-emerald-400' : 'text-slate-200'}>
                            {ch.name}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">#{ch.code}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{ch.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* WatchPay Gateway Highlights */}
                <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Verified Gateway:</span>
                    <span className="text-white font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WatchPay Global 2.0</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Callback Server Node:</span>
                    <span className="font-mono text-emerald-400 font-bold">{WATCHPAY_CALLBACK_IP}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Checkout Endpoint:</span>
                    <span className="font-mono text-slate-300">/pay/web (Signed MD5)</span>
                  </div>
                </div>

                {/* Big Proceed Button */}
                <button
                  type="button"
                  onClick={handleOpenWatchPay}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all active:scale-98"
                >
                  <Zap className="w-4 h-4" />
                  <span>Pay ₹{amount.toLocaleString()} with WatchPay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center space-x-1.5 text-[11px] text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Direct Encrypted Cashier with Automatic Wallet Release</span>
                </div>

              </div>
            )}

            {/* MANUAL UTR VIEW */}
            {gatewayMode === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in duration-200">
                
                {/* Manual Method Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Bank Transfer', 'USDT'] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => {
                        setManualMethod(m);
                        sounds.playClick();
                      }}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        manualMethod === m
                          ? 'bg-slate-800 text-blue-400 border-blue-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Payment Details Box */}
                {manualMethod === 'UPI' && (
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-md flex-shrink-0">
                        <img
                          src={settings.qrCodeUrl}
                          alt="UPI QR Code"
                          className="w-24 h-24 object-contain"
                        />
                      </div>

                      <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                        <div className="text-[11px] uppercase font-bold text-slate-400">Manual Merchant UPI</div>
                        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                          <span className="text-xs font-mono font-bold text-amber-400 select-all truncate mr-2">
                            {settings.adminUpiId}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="flex items-center space-x-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                            <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Transfer exact ₹{amount} and enter the 12-digit UTR below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {manualMethod === 'Bank Transfer' && (
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Bank Name:</span>
                      <span className="font-semibold text-white">{settings.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Account No:</span>
                      <span className="font-mono font-bold text-amber-400">{settings.bankAccount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">IFSC Code:</span>
                      <span className="font-mono font-bold text-white">{settings.bankIfsc}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Beneficiary:</span>
                      <span className="text-white">{settings.merchantName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyBank}
                      className="w-full py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 flex items-center justify-center space-x-1.5 mt-2"
                    >
                      {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBank ? 'Bank Details Copied!' : 'Copy Bank Details'}</span>
                    </button>
                  </div>
                )}

                {manualMethod === 'USDT' && (
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Network:</span>
                      <span className="font-bold text-emerald-400">TRC20 / BSC (BEP20)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rate:</span>
                      <span className="font-mono text-white">1 USDT = ₹91.50</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-amber-400 break-all border border-slate-800">
                      TQ7s2K918hU9xPmLz9bB2yR41xPqMn9L
                    </div>
                  </div>
                )}

                {/* UTR Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Enter 12-Digit Bank UTR / Reference No <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                    placeholder="e.g. 425983719283"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span>Admin manually verifies offline UTR requests within 5-10 minutes.</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !utrNumber.trim()}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all"
                >
                  <span>Submit Manual Verification Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>
            )}

          </div>
        </div>
      </div>

      {/* WatchPay Live Cashier Modal */}
      <WatchPayCashierModal
        isOpen={isCashierOpen}
        onClose={() => setIsCashierOpen(false)}
        amount={amount}
        merchantNo={settings.watchpayMerchantNo || '100666859'}
        payKey={settings.watchpayPayKey || '4abd8ad7b8a44bfcbeaa8ad8e30dae30'}
        payType={selectedPayType}
        domain={settings.watchpayDomain || 'https://api.watchpay.net'}
        onSuccess={handleWatchPaySuccess}
      />
    </>
  );
};
