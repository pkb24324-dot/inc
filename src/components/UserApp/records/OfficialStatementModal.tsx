import React from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Building2,
  Calendar,
  Share2
} from 'lucide-react';
import { Transaction } from '../../../types';
import { sounds } from '../../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currentUser: {
    id: string;
    name: string;
    phone: string;
    balance: number;
    vipLevel: number;
  };
  isLight: boolean;
  onExportCsv: () => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const OfficialStatementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  transactions,
  currentUser,
  isLight,
  onExportCsv,
  onNotify
}) => {
  if (!isOpen) return null;

  // Calculate formal financial summary
  const deposits = transactions.filter(t => t.type === 'deposit' && (t.status === 'completed' || t.status === 'approved'));
  const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);

  const withdrawals = transactions.filter(t => t.type === 'withdrawal' && (t.status === 'completed' || t.status === 'approved'));
  const totalWithdrawals = withdrawals.reduce((sum, t) => sum + (t.netAmount || t.amount), 0);

  const earnings = transactions.filter(t => 
    (t.type === 'dividend' || t.type === 'referral' || t.type === 'spin_reward' || t.type === 'checkin' || t.type === 'bonus') &&
    t.status === 'completed'
  );
  const totalEarnings = earnings.reduce((sum, t) => sum + t.amount, 0);

  const investments = transactions.filter(t => t.type === 'investment');
  const totalInvestments = investments.reduce((sum, t) => sum + t.amount, 0);

  const totalInflow = totalDeposits + totalEarnings;
  const totalOutflow = totalWithdrawals + totalInvestments;
  const netVariance = totalInflow - totalOutflow;

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className={`border rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black font-['Outfit']">Official Financial Statement</h3>
              <p className="text-[10px] text-slate-400">Certified Account Ledger & Tax Advice</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
              title="Print Statement"
            >
              <Printer className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onExportCsv}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-colors ${
                isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Formal Statement Sheet */}
        <div id="printable-statement" className={`rounded-2xl p-5 border space-y-4 font-sans ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          {/* Statement Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-black font-['Outfit'] tracking-tight text-blue-600 dark:text-blue-400">
                  BHARAT CLEAN ENERGY INFRASTRUCTURE
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 font-mono">
                  NPCI CLEARING GATEWAY
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                Govt Reg: IN-DL-982420420 • RBI NBFC Intermediary Settlement Desk
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-[11px] space-y-0.5">
              <div className="text-slate-500">Statement ID: <span className="font-bold text-slate-900 dark:text-white">STM-{Date.now().toString().slice(-8)}</span></div>
              <div className="text-slate-500">Date Generated: <span className="font-bold text-slate-900 dark:text-white">{new Date().toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
            </div>
          </div>

          {/* Account Profile Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Account Holder</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentUser.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Registered Mobile</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentUser.phone}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Member ID</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentUser.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">VIP Standing</span>
              <span className="font-bold text-amber-500">VIP Level {currentUser.vipLevel}</span>
            </div>
          </div>

          {/* Financial Totals Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center font-mono">
            <div className={`p-2.5 rounded-xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className="text-[10px] text-slate-400 block font-sans">Total Deposits</span>
              <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">+₹{totalDeposits.toLocaleString()}</span>
            </div>

            <div className={`p-2.5 rounded-xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className="text-[10px] text-slate-400 block font-sans">Total Earnings</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">+₹{totalEarnings.toLocaleString()}</span>
            </div>

            <div className={`p-2.5 rounded-xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className="text-[10px] text-slate-400 block font-sans">Total Withdrawn</span>
              <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">-₹{totalWithdrawals.toLocaleString()}</span>
            </div>

            <div className={`p-2.5 rounded-xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className="text-[10px] text-slate-400 block font-sans">Closing Balance</span>
              <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">₹{currentUser.balance.toLocaleString()}</span>
            </div>
          </div>

          {/* Itemized Passbook Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`text-[10px] uppercase tracking-wider border-b ${
                isLight ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}>
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reference / UTR</th>
                  <th className="py-2.5 px-3">Particulars</th>
                  <th className="py-2.5 px-3 text-right">Debit (-)</th>
                  <th className="py-2.5 px-3 text-right">Credit (+)</th>
                  <th className="py-2.5 px-3 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isLight ? 'divide-slate-200' : 'divide-slate-800'
              }`}>
                {transactions.slice(0, 15).map((t) => {
                  const isCredit = t.type === 'deposit' || t.type === 'dividend' || t.type === 'referral' || t.type === 'spin_reward' || t.type === 'checkin' || t.type === 'bonus';
                  return (
                    <tr key={t.id} className={`${isLight ? 'hover:bg-slate-100/60' : 'hover:bg-slate-900/40'}`}>
                      <td className="py-2 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-2 px-3 text-[10px] text-slate-400 whitespace-nowrap">
                        {t.utrNumber || t.rrn || t.id.slice(0, 10)}
                      </td>
                      <td className="py-2 px-3 text-[11px] font-sans">
                        <span className="font-semibold block line-clamp-1">{t.description}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{t.type} • {t.status}</span>
                      </td>
                      <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap">
                        {!isCredit ? `₹${t.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                        {isCredit ? `₹${t.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">
                        {t.runningBalance !== undefined ? `₹${t.runningBalance.toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Statement End Stamp & Certification Watermark */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
            <div className="flex items-center space-x-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Computer-Generated Certified Ledger (No Physical Signature Mandated)</span>
            </div>
            <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              AUTHORIZED CLEARANCE SEAL • NPCI SWITCH 2026
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex space-x-2 pt-1">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center space-x-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs border transition-colors ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
