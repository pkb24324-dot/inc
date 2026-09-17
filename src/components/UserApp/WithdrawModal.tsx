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
import { ProfessionalAmount } from '../common/ProfessionalAmount';
import { amountInIndianWords, formatCurrencyINR } from '../../utils/currencyFormatter';

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
  const [priorityTier, setPriorityTier] = useState<'standard' | 'express'>('express');

  if (!isOpen) return null;

  const isFrozen = !!settings.globalFreezeWithdrawals;
  const isVipEligibleForZeroFee = currentUser.vipLevel >= 4;
  const effectiveFeePercent = isVipEligibleForZeroFee ? 0 : settings.withdrawalFeePercent;
  const fee = Math.round((amount * effectiveFeePercent) / 100);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-4 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Compact Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">Instant Payout</h2>
              <p className="text-[10.5px] text-slate-400">Direct Bank & UPI Settlement</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                openRecordsModal('withdrawal');
              }}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              <span>Records</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">

          {/* Compact Balance Card */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Withdrawable Balance</span>
              <div className="mt-0.5">
                <ProfessionalAmount
                  amount={currentUser.balance}
                  size="lg"
                  color="emerald"
                  showCurrencyBadge={true}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleWithdrawAll}
              className="text-[11px] font-black px-3 py-1.5 btn-chamko-emerald text-white rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
            >
              Max All
            </button>
          </div>

          {/* Amount Input with Quick Chips */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="font-bold text-slate-300 uppercase tracking-wider">
                Payout Amount
              </span>
              <span className="text-slate-400">
                Min ₹{(settings.minWithdrawal || 300).toLocaleString()} • Max ₹{(settings.maxWithdrawal || 50000).toLocaleString()}
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-amber-400 font-black text-sm">₹</span>
              </div>
              <input
                type="number"
                min={settings.minWithdrawal}
                max={Math.min(settings.maxWithdrawal, currentUser.balance || settings.minWithdrawal)}
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-7 pr-14 py-2 text-white font-mono font-black text-base focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="Enter amount"
                required
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  INR
                </span>
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center space-x-1.5 pt-0.5 overflow-x-auto no-scrollbar">
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => {
                    setAmount(amt);
                    sounds.playClick();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                    amount === amt
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Net Settlement Breakdown Strip */}
            <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between text-[11px]">
              <div className="text-slate-400">
                <span>Fee ({effectiveFeePercent}%): </span>
                <span className="text-red-400 font-semibold font-mono">
                  {isVipEligibleForZeroFee ? '₹0 (VIP Exempt)' : `-₹${fee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-slate-300 font-medium">You Receive:</span>
                <span className="text-emerald-400 font-black font-mono text-xs">
                  ₹{netAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Destination Selector Tabs */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPayoutMethod('upi')}
                className={`py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  payoutMethod === 'upi'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>UPI Fast (Instant)</span>
              </button>
              <button
                type="button"
                onClick={() => setPayoutMethod('bank')}
                className={`py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  payoutMethod === 'bank'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3 h-3" />
                <span>Bank IMPS</span>
              </button>
            </div>

            {/* Destination Inputs */}
            <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800">
              {payoutMethod === 'upi' ? (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-slate-400 font-medium">UPI VPA Address</label>
                    {upiId.includes('@') && (
                      <span className="text-[9px] text-emerald-400 font-bold">✓ Valid format</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@paytm or name@okhdfcbank"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[9.5px] text-slate-400 block mb-0.5">Account Holder</label>
                      <input
                        type="text"
                        required
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] text-slate-400 block mb-0.5">Bank Name</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
                        placeholder="Bank Name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[9.5px] text-slate-400 block mb-0.5">Account Number</label>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white font-mono"
                        placeholder="Account Number"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] text-slate-400 block mb-0.5">IFSC Code</label>
                      <input
                        type="text"
                        required
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white font-mono uppercase"
                        placeholder="IFSC Code"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Priority & Security PIN row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Dispatch Speed
              </label>
              <button
                type="button"
                onClick={() => setPriorityTier(priorityTier === 'express' ? 'standard' : 'express')}
                className={`w-full py-1.5 px-2 rounded-xl border text-[10.5px] font-bold flex items-center justify-between cursor-pointer transition-colors ${
                  priorityTier === 'express'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>{priorityTier === 'express' ? '⚡ Instant VIP' : '⏱ Standard'}</span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {priorityTier === 'express' ? '5-15 Minutes' : '12-24 Hours'}
                </span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  PIN <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSecurityPin('1234')}
                  className="text-[9px] text-amber-400 hover:underline cursor-pointer"
                >
                  Use: 1234
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  placeholder="PIN"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono text-center tracking-widest text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Global Freeze Banner */}
          {isFrozen && (
            <div className="p-2 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-[10px] flex items-start space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <p>
                Maintenance Clearance Mode: Request queued for immediate batch dispatch.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || amount > currentUser.balance || amount < settings.minWithdrawal}
            className="w-full py-2.5 rounded-xl btn-chamko-gold disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <span>Confirm Withdrawal: ₹{netAmount.toLocaleString()}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
          </button>

          <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-0.5">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>Fast Gateway Settlement</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>RBI / NPCI Protected</span>
            </span>
          </div>

        </form>
      </div>
    </div>
  );
};
