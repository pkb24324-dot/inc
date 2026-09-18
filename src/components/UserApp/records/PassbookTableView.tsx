import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { Transaction } from '../../../types';
import { formatCurrencyINR } from '../../../utils/currencyFormatter';

interface Props {
  transactions: Transaction[];
  isLight: boolean;
  onSelectTxn: (txn: Transaction) => void;
  onCopy: (text: string, label: string) => void;
  copiedText: string | null;
}

export const PassbookTableView: React.FC<Props> = ({
  transactions,
  isLight,
  onSelectTxn,
  onCopy,
  copiedText
}) => {
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm ${
      isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
    }`}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-[11px] font-mono">
          <thead className={`text-[9px] uppercase tracking-wider border-b ${
            isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
          }`}>
            <tr>
              <th className="py-2.5 px-3 whitespace-nowrap">Date & Time</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Reference / UTR</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Transaction Particulars</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Debit (-)</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Credit (+)</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Running Balance</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isLight ? 'divide-slate-100' : 'divide-slate-800/60'
          }`}>
            {transactions.map((txn) => {
              const isDeposit = txn.type === 'deposit';
              const isWithdrawal = txn.type === 'withdrawal';
              const isIncome = !isDeposit && !isWithdrawal && txn.type !== 'investment';
              const isCredit = isDeposit || isIncome;
              const isSuccess = txn.status === 'completed' || txn.status === 'approved';
              const isPending = txn.status === 'pending';
              const isRejected = txn.status === 'rejected';

              const refCode = txn.utrNumber || txn.rrn || txn.orderId || txn.id;

              return (
                <tr 
                  key={txn.id}
                  onClick={() => onSelectTxn(txn)}
                  className={`cursor-pointer transition-colors ${
                    isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Date & Time */}
                  <td className="py-2 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {new Date(txn.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="text-[9px] text-slate-400">
                      {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  {/* Reference / UTR */}
                  <td className="py-2 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-1">
                      <span className={`font-bold ${
                        txn.utrNumber ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                      }`}>
                        {refCode.length > 14 ? `${refCode.slice(0, 12)}…` : refCode}
                      </span>
                      <button
                        onClick={() => onCopy(refCode, 'Reference')}
                        className="p-1 text-slate-400 hover:text-blue-500"
                        title="Copy Reference"
                      >
                        {copiedText === refCode ? (
                          <Check className="w-2.5 h-2.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                      </button>
                    </div>
                    {txn.channel && (
                      <span className="text-[8.5px] text-blue-500 block font-sans">
                        {txn.channel}
                      </span>
                    )}
                  </td>

                  {/* Particulars */}
                  <td className="py-2 px-3 font-sans min-w-[160px]">
                    <div className="font-bold text-slate-900 dark:text-white line-clamp-1 text-[11px]">
                      {txn.description}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      {txn.bankDetails?.accountNumber 
                        ? `A/C: •••• ${txn.bankDetails.accountNumber.slice(-4)}` 
                        : txn.bankDetails?.upiId 
                        ? `UPI: ${txn.bankDetails.upiId}` 
                        : `ID: ${txn.id}`}
                    </div>
                  </td>

                  {/* Debit */}
                  <td className="py-2 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    {!isCredit ? `-${formatCurrencyINR(txn.amount)}` : '—'}
                  </td>

                  {/* Credit */}
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {isCredit ? `+${formatCurrencyINR(txn.amount)}` : '—'}
                  </td>

                  {/* Running Balance */}
                  <td className="py-2 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {txn.runningBalance !== undefined ? formatCurrencyINR(txn.runningBalance) : '—'}
                  </td>

                  {/* Status */}
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center space-x-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                      isSuccess
                        ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
                        : isPending
                        ? isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300 animate-pulse'
                        : isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isSuccess && <CheckCircle2 className="w-2 h-2" />}
                      {isPending && <Clock className="w-2 h-2 animate-spin" />}
                      {isRejected && <AlertCircle className="w-2 h-2" />}
                      <span>{isSuccess ? 'Success' : isPending ? 'Pending' : 'Declined'}</span>
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <button 
                      onClick={() => onSelectTxn(txn)}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[10px] font-sans inline-flex items-center space-x-0.5"
                    >
                      <span>Slip</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
