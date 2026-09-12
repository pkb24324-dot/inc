import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  HelpCircle, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Zap,
  RefreshCw
} from 'lucide-react';
import { Transaction } from '../../../types';
import { sounds } from '../../../utils/audio';

interface Props {
  transactions: Transaction[];
  isLight: boolean;
  onSelectTxn: (txn: Transaction) => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const DelayedUtrAssistant: React.FC<Props> = ({
  transactions,
  isLight,
  onSelectTxn,
  onNotify
}) => {
  const [utrInput, setUtrInput] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchedTxn, setMatchedTxn] = useState<Transaction | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput.trim()) return;

    setIsVerifying(true);
    sounds.playClick();

    setTimeout(() => {
      setIsVerifying(false);
      setSearched(true);
      const cleanUtr = utrInput.trim().toLowerCase();
      const found = transactions.find(t => 
        (t.utrNumber && t.utrNumber.toLowerCase().includes(cleanUtr)) ||
        (t.rrn && t.rrn.toLowerCase().includes(cleanUtr)) ||
        (t.orderId && t.orderId.toLowerCase().includes(cleanUtr)) ||
        t.id.toLowerCase().includes(cleanUtr)
      );

      if (found) {
        setMatchedTxn(found);
        sounds.playSuccess();
        onNotify('Transaction found in bank clearing ledger!', 'success');
      } else {
        setMatchedTxn(null);
        sounds.playError();
        onNotify('UTR reference not yet registered in gateway node.', 'error');
      }
    }, 600);
  };

  return (
    <div className={`p-4 rounded-2xl border space-y-3 ${
      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider font-['Outfit']">
              Delayed UTR / IMPS Self-Resolver
            </h4>
            <p className="text-[10px] text-slate-500">
              Check real-time clearance status for any 12-digit UTR or Bank RRN
            </p>
          </div>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20">
          AUTO-POLL
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleVerify} className="flex space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter 12-digit UTR / Order Ref..."
            value={utrInput}
            onChange={(e) => {
              setUtrInput(e.target.value);
              if (searched) setSearched(false);
            }}
            maxLength={22}
            className={`w-full rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none border transition-colors ${
              isLight 
                ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600' 
                : 'bg-slate-950 border-slate-700 text-white focus:border-blue-500'
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={isVerifying || !utrInput.trim()}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center space-x-1.5 transition-all"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              <span>Query UTR</span>
            </>
          )}
        </button>
      </form>

      {/* Result Card */}
      {searched && (
        <div className="pt-1">
          {matchedTxn ? (
            <div 
              onClick={() => onSelectTxn(matchedTxn)}
              className={`p-3 rounded-xl border cursor-pointer space-y-2 transition-all ${
                isLight ? 'bg-slate-50 border-blue-200 hover:border-blue-400' : 'bg-slate-950 border-blue-500/40 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    matchedTxn.status === 'completed' || matchedTxn.status === 'approved'
                      ? 'bg-emerald-500'
                      : matchedTxn.status === 'pending'
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-red-500'
                  }`} />
                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                    ₹{matchedTxn.amount.toLocaleString()} ({matchedTxn.type.toUpperCase()})
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                  matchedTxn.status === 'completed' || matchedTxn.status === 'approved'
                    ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
                    : matchedTxn.status === 'pending'
                    ? isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {matchedTxn.status}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                <span>UTR: {matchedTxn.utrNumber || 'N/A'}</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center">
                  <span>View Slip</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ) : (
            <div className={`p-3 rounded-xl border text-xs text-center space-y-1 ${
              isLight ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-950/30 border-red-500/30 text-red-300'
            }`}>
              <AlertCircle className="w-4 h-4 mx-auto text-red-500" />
              <p className="font-bold">No match found for "{utrInput}"</p>
              <p className="text-[11px] text-slate-500">
                Please verify the 12 digits or submit a deposit request in the Recharge section.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
