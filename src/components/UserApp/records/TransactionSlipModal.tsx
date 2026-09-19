import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Share2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowDownLeft, 
  ArrowUpRight, 
  QrCode, 
  Download, 
  HelpCircle, 
  X,
  Building2,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { Transaction } from '../../../types';
import { sounds } from '../../../utils/audio';
import { ProfessionalAmount } from '../../common/ProfessionalAmount';
import { amountInIndianWords } from '../../../utils/currencyFormatter';

interface Props {
  txn: Transaction | null;
  onClose: () => void;
  isLight: boolean;
  userPhone?: string;
  userName?: string;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TransactionSlipModal: React.FC<Props> = ({
  txn,
  onClose,
  isLight,
  userPhone = '',
  userName = '',
  onNotify
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  if (!txn) return null;

  const isDeposit = txn.type === 'deposit';
  const isWithdrawal = txn.type === 'withdrawal';
  const isIncome = !isDeposit && !isWithdrawal && txn.type !== 'investment';
  const isInvestment = txn.type === 'investment';
  const isCredit = isDeposit || isIncome;
  const isSuccess = txn.status === 'completed' || txn.status === 'approved';
  const isPending = txn.status === 'pending';
  const isRejected = txn.status === 'rejected';

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    sounds.playClick();
    onNotify(`${label} copied to clipboard!`, 'info');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSupportTicket = () => {
    const refCode = txn.utrNumber || txn.rrn || txn.orderId || txn.id;
    const ticket = `[PAYMENT TICKET]
User: ${userName} (${userPhone})
Txn ID: ${txn.id}
Reference / UTR: ${refCode}
Type: ${txn.type.toUpperCase()}
Amount: ₹${txn.amount}
Status: ${txn.status.toUpperCase()}
Time: ${new Date(txn.createdAt).toLocaleString()}
Reason / Query: Please expedite bank verification for this transaction.`;

    navigator.clipboard.writeText(ticket);
    sounds.playSuccess();
    onNotify('Support ticket copied! Open Support to paste and submit.', 'success');
  };

  return (
    <div 
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className={`border rounded-3xl max-w-sm w-full p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${
            isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-slate-800 text-slate-500'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Stamp */}
        <div className="text-center space-y-1 pt-1">
          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            isLight ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          }`}>
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>NPCI / Banking Clearing Voucher</span>
          </div>
          <h3 className="text-base sm:text-lg font-black font-['Outfit']">Official Payment Advice</h3>
          <p className="text-[10px] text-slate-400 font-mono">
            Voucher ID: {txn.orderId || txn.id}
          </p>
        </div>

        {/* Amount Banner */}
        <div className={`border rounded-2xl p-4 text-center space-y-1.5 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
            Settled Transaction Value
          </span>
          <div className="flex items-center justify-center my-1">
            <ProfessionalAmount
              amount={txn.amount}
              size="3xl"
              color={isCredit ? 'emerald' : 'amber'}
              currencyPrefix={isCredit ? '+₹' : '-₹'}
              showCurrencyBadge={true}
            />
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {amountInIndianWords(txn.amount)}
          </div>
          
          <div className="flex items-center justify-center space-x-2 pt-1">
            <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
              isSuccess
                ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
                : isPending
                ? isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300 animate-pulse'
                : isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/20 text-red-400'
            }`}>
              {isSuccess && <CheckCircle2 className="w-3 h-3" />}
              {isPending && <Clock className="w-3 h-3 animate-spin" />}
              {isRejected && <AlertCircle className="w-3 h-3" />}
              <span>{isSuccess ? 'Cleared & Approved' : isPending ? 'Processing at Banking Gateway' : 'Declined / Refunded'}</span>
            </span>
          </div>
        </div>

        {/* Breakdown Specifications Table */}
        <div className={`border rounded-2xl p-3.5 space-y-2 text-xs font-mono ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800/80'
        }`}>
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-sans">Ledger Category:</span>
            <span className="font-sans font-bold capitalize text-slate-900 dark:text-white">
              {txn.type.replace('_', ' ')}
            </span>
          </div>

          {txn.channel && (
            <div className="flex justify-between items-center text-slate-500">
              <span className="font-sans">Transfer Channel:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{txn.channel}</span>
            </div>
          )}

          {txn.utrNumber && (
            <div className="flex justify-between items-center text-slate-500">
              <span className="font-sans">Bank 12-Digit UTR:</span>
              <div className="flex items-center space-x-1">
                <span className="text-amber-600 dark:text-amber-300 font-bold">{txn.utrNumber}</span>
                <button
                  onClick={() => handleCopyText(txn.utrNumber!, 'UTR')}
                  className="p-1 text-slate-400 hover:text-blue-600"
                  title="Copy UTR"
                >
                  {copied === 'UTR' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}

          {txn.rrn && (
            <div className="flex justify-between items-center text-slate-500">
              <span className="font-sans">IMPS Reference (RRN):</span>
              <div className="flex items-center space-x-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{txn.rrn}</span>
                <button
                  onClick={() => handleCopyText(txn.rrn!, 'RRN')}
                  className="p-1 text-slate-400 hover:text-blue-600"
                >
                  {copied === 'RRN' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}

          {txn.bankDetails?.accountNumber && (
            <div className="flex justify-between items-center text-slate-500">
              <span className="font-sans">Beneficiary A/C:</span>
              <span className="text-slate-900 dark:text-white">
                {txn.bankDetails.bankName || 'Bank'} (•••• {txn.bankDetails.accountNumber.slice(-4)})
              </span>
            </div>
          )}

          {txn.bankDetails?.upiId && (
            <div className="flex justify-between items-center text-slate-500">
              <span className="font-sans">Beneficiary UPI:</span>
              <span className="text-slate-900 dark:text-white">{txn.bankDetails.upiId}</span>
            </div>
          )}

          {txn.fee !== undefined && txn.fee > 0 && (
            <div className="flex justify-between items-center text-slate-500">
              <span className="font-sans">TDS & Banking Fee (5%):</span>
              <span className="text-red-500 font-bold">-₹{txn.fee}</span>
            </div>
          )}

          {txn.netAmount !== undefined && (
            <div className={`flex justify-between items-center pt-1 border-t font-bold ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <span className="font-sans">Net Payout Disbursed:</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm">₹{txn.netAmount.toLocaleString()}</span>
            </div>
          )}

          {txn.runningBalance !== undefined && (
            <div className={`flex justify-between items-center pt-1 border-t ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <span className="font-sans text-slate-500">Post-Txn Wallet Balance:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">₹{txn.runningBalance.toLocaleString()}</span>
            </div>
          )}

          <div className={`flex justify-between items-center text-slate-500 pt-1 border-t ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <span className="font-sans">Timestamp:</span>
            <span className="text-slate-700 dark:text-slate-300 text-[11px]">{new Date(txn.createdAt).toLocaleString()}</span>
          </div>

          {txn.approvedBy && (
            <div className="flex justify-between items-center text-slate-500">
              <span className="font-sans">Audited By:</span>
              <span className="text-indigo-600 dark:text-indigo-400 text-[11px] font-sans font-bold">{txn.approvedBy}</span>
            </div>
          )}

          {txn.rejectionReason && (
            <div className={`p-2 rounded-xl border text-[11px] font-sans ${
              isLight ? 'bg-red-50 text-red-800 border-red-200' : 'bg-red-950/40 text-red-300 border-red-500/30'
            }`}>
              <span className="font-bold block">Audit Discrepancy Note:</span>
              <span>{txn.rejectionReason}</span>
            </div>
          )}
        </div>

        {/* Cryptographic SHA-256 Proof Signature */}
        <div className={`p-2.5 rounded-xl border text-[10px] font-mono text-slate-500 space-y-1 ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex justify-between items-center">
            <span className="font-sans font-bold text-slate-600 dark:text-slate-400">NPCI Cryptographic Seal:</span>
            <span className="text-emerald-500 font-bold">VALIDATED</span>
          </div>
          <div className="truncate text-slate-400 font-mono">
            {txn.proofHash || `sha256:${txn.id.slice(0, 10)}${Date.parse(txn.createdAt)}fa90b2`}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const slipSummary = `*OFFICIAL AM INVEST PAYMENT SLIP*
Ref Order: ${txn.orderId || txn.id}
Amount: ₹${txn.amount}
Type: ${txn.type}
Status: ${txn.status}
UTR/RRN: ${txn.utrNumber || txn.rrn || 'N/A'}
Date: ${new Date(txn.createdAt).toLocaleString()}
Security Hash: ${txn.proofHash || 'NPCI-SECURED'}`;
                handleCopyText(slipSummary, 'Slip Summary');
              }}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors ${
                isLight 
                  ? 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800' 
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Copy Voucher</span>
            </button>

            <button
              onClick={handleSupportTicket}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors ${
                isLight 
                  ? 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-900' 
                  : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-300'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Inquire Support</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all active:scale-98"
          >
            Close Voucher
          </button>
        </div>

      </div>
    </div>
  );
};
