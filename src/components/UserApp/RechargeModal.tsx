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
  FileText
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
}

export const RechargeModal: React.FC<Props> = ({ isOpen, onClose, defaultAmount = 700 }) => {
  const { settings, submitDepositRequest, openRecordsModal } = useApp();
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [method, setMethod] = useState<'UPI' | 'Bank Transfer' | 'USDT'>('UPI');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) return;
    setIsSubmitting(true);

    const success = submitDepositRequest(amount, method, utrNumber.trim());
    setIsSubmitting(false);

    if (success) {
      onClose();
      setUtrNumber('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">Recharge Wallet</h2>
              <p className="text-xs text-slate-400">Instant Automated Verification via UPI & IMPS</p>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          
          {/* Amount Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Deposit Amount (₹)
            </label>
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
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 scale-102'
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono font-bold text-base focus:outline-none focus:border-blue-500"
                placeholder="Custom Amount"
                required
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 px-1">
              <span>Min: ₹{settings.minRecharge}</span>
              <span>Max: ₹{settings.maxRecharge.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Payment Gateway
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['UPI', 'Bank Transfer', 'USDT'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => {
                    setMethod(m);
                    sounds.playClick();
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    method === m
                      ? 'bg-slate-800 text-blue-400 border-blue-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Details Box */}
          {method === 'UPI' && (
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* QR Code */}
                <div className="p-2 bg-white rounded-xl shadow-md flex-shrink-0">
                  <img
                    src={settings.qrCodeUrl}
                    alt="UPI QR Code"
                    className="w-28 h-28 object-contain"
                  />
                </div>

                <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                  <div className="text-[11px] uppercase font-bold text-slate-400">Official Merchant UPI</div>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                    <span className="text-xs font-mono font-bold text-amber-400 select-all truncate mr-2">
                      {settings.adminUpiId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="flex items-center space-x-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pay via PhonePe, Google Pay, Paytm, or BHIM.
                  </p>
                </div>
              </div>
            </div>
          )}

          {method === 'Bank Transfer' && (
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Bank Name:</span>
                <span className="font-semibold text-white">{settings.bankName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Account No:</span>
                <span className="font-mono font-bold text-amber-400">{settings.bankAccount}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">IFSC Code:</span>
                <span className="font-mono font-bold text-white">{settings.bankIfsc}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Beneficiary:</span>
                <span className="text-white">{settings.merchantName}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyBank}
                className="w-full py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 flex items-center justify-center space-x-1.5"
              >
                {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBank ? 'Bank Details Copied!' : 'Copy Bank Account & IFSC'}</span>
              </button>
            </div>
          )}

          {method === 'USDT' && (
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Network:</span>
                <span className="font-bold text-emerald-400">TRC20 / BSC (BEP20)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fixed Rate:</span>
                <span className="font-mono text-white">1 USDT = ₹91.50</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-amber-400 break-all select-all border border-slate-800">
                TQ7s2K918hU9xPmLz9bB2yR41xPqMn9L
              </div>
            </div>
          )}

          {/* UTR Input Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Enter 12-Digit UTR / Transaction Reference Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
              placeholder="e.g. 425983719283"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-base tracking-wider focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center space-x-1">
              <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span>You can find the 12-digit UTR in your payment app under transfer details.</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !utrNumber.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <span>Submit Verification Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted Financial Clearance System</span>
          </div>

        </form>
      </div>
    </div>
  );
};
