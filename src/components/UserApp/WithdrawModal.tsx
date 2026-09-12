import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Download, 
  Building2, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle, 
  Lock,
  ArrowRight,
  Clock,
  FileText
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, settings, submitWithdrawalRequest, updateBankDetails, openRecordsModal } = useApp();
  
  const [amount, setAmount] = useState<number>(1000);
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'upi'>('upi');
  
  // Bank fields
  const [accountHolder, setAccountHolder] = useState(currentUser.bankDetails?.accountHolder || currentUser.name);
  const [accountNumber, setAccountNumber] = useState(currentUser.bankDetails?.accountNumber || '');
  const [ifsc, setIfsc] = useState(currentUser.bankDetails?.ifsc || '');
  const [bankName, setBankName] = useState(currentUser.bankDetails?.bankName || 'State Bank of India');
  const [upiId, setUpiId] = useState(currentUser.bankDetails?.upiId || '');
  
  const [securityPin, setSecurityPin] = useState('');
  const [isEditingAccount, setIsEditingAccount] = useState(!currentUser.bankDetails);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const fee = Math.round((amount * settings.withdrawalFeePercent) / 100);
  const netAmount = Math.max(0, amount - fee);

  const handleWithdrawAll = () => {
    setAmount(currentUser.balance);
    sounds.playClick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityPin.trim().length < 4) {
      alert('Please enter a 4 or 6-digit transaction security PIN (Demo: 1234)');
      return;
    }

    // Save bank details if updated
    const finalBank = {
      accountHolder,
      accountNumber,
      ifsc,
      bankName,
      upiId,
    };
    updateBankDetails(finalBank);

    setSubmitting(true);
    const res = submitWithdrawalRequest(amount, finalBank);
    setSubmitting(false);

    if (res.success) {
      onClose();
      setSecurityPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">Instant Withdrawal</h2>
              <p className="text-xs text-slate-400">Secure Direct Bank & UPI Settlement</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                openRecordsModal('withdrawal');
              }}
              className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center space-x-1 transition-colors"
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

          {/* Balance card */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Withdrawable Balance</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                ₹{currentUser.balance.toLocaleString()}
              </div>
            </div>
            <button
              type="button"
              onClick={handleWithdrawAll}
              className="text-xs font-bold px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-colors"
            >
              Withdraw All
            </button>
          </div>

          {/* Amount input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Withdrawal Amount (₹)
              </label>
              <span className="text-[11px] text-slate-400">
                Min: ₹{settings.minWithdrawal} • Max: ₹{settings.maxWithdrawal.toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min={settings.minWithdrawal}
                max={Math.min(settings.maxWithdrawal, currentUser.balance || settings.minWithdrawal)}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono font-bold text-base focus:outline-none focus:border-amber-500"
                placeholder="Enter amount"
                required
              />
            </div>

            {/* Fee calculation breakdown */}
            <div className="mt-2 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tax & Service Fee ({settings.withdrawalFeePercent}%):</span>
                <span className="font-mono text-red-400">-₹{fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-200 font-semibold pt-1 border-t border-slate-800">
                <span>Net Credited to Account:</span>
                <span className="font-mono text-emerald-400 text-sm font-bold">₹{netAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Destination Selector */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Payout Destination
              </label>
              <button
                type="button"
                onClick={() => setIsEditingAccount(!isEditingAccount)}
                className="text-[11px] text-blue-400 hover:text-blue-300 underline"
              >
                {isEditingAccount ? 'Done Editing' : 'Change Account'}
              </button>
            </div>

            {/* Method switch */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setPayoutMethod('upi')}
                className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-2 transition-all ${
                  payoutMethod === 'upi'
                    ? 'bg-slate-800 text-amber-400 border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI ID (Instant)</span>
              </button>
              <button
                type="button"
                onClick={() => setPayoutMethod('bank')}
                className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-2 transition-all ${
                  payoutMethod === 'bank'
                    ? 'bg-slate-800 text-amber-400 border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Bank IMPS / NEFT</span>
              </button>
            </div>

            {/* Account Details Box */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
              {payoutMethod === 'upi' ? (
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Your Virtual Payment Address (UPI)</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@okhdfcbank or rahul@paytm"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Account Holder Name</label>
                    <input
                      type="text"
                      required
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      placeholder="Account Holder Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">Bank Name</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                        placeholder="e.g. HDFC Bank"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">IFSC Code</label>
                      <input
                        type="text"
                        required
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                        placeholder="HDFC0001234"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Account Number</label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      placeholder="e.g. 5010049281726"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security PIN verification */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Security PIN <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                maxLength={6}
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                placeholder="4 or 6-digit transaction PIN (Demo: 1234)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-center tracking-widest text-base focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-center">
              Demo Security PIN: <code className="text-amber-400">1234</code>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || amount > currentUser.balance || amount < settings.minWithdrawal}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <span>Request Payout of ₹{amount.toLocaleString()}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Processing window: 10m - 2h</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RBI / NPCI Gateway Compliant</span>
            </span>
          </div>

        </form>
      </div>
    </div>
  );
};
