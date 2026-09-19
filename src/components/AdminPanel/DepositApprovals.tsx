import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowDownLeft, 
  Check, 
  X, 
  Copy, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck,
  AlertTriangle,
  CheckSquare,
  Square,
  Zap,
  TrendingUp,
  PlusCircle,
  Smartphone,
  Building2,
  RefreshCw,
  Download,
  HelpCircle,
  LayoutGrid,
  List
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const DepositApprovals: React.FC = () => {
  const { 
    transactions, 
    allUsers,
    approveDeposit, 
    rejectDeposit,
    batchApproveDeposits,
    batchRejectDeposits,
    createManualDeposit,
    exportDataToCsv,
    theme 
  } = useApp();

  const isLight = theme === 'light';
  
  const [layoutMode, setLayoutMode] = useState<'cards' | 'table'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [highValueOnly, setHighValueOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectModalTxnId, setRejectModalTxnId] = useState<string | null>(null);
  const [batchRejectModal, setBatchRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('UTR not found in merchant bank statement');
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // Manual Deposit Drawer/Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualUserId, setManualUserId] = useState(allUsers[0]?.id || '');
  const [manualAmount, setManualAmount] = useState<number>(1000);
  const [manualUtr, setManualUtr] = useState('');
  const [manualChannel, setManualChannel] = useState('UPI FastPay');
  const [manualNote, setManualNote] = useState('Manual resolution credit by Admin');

  // UTR Inspector Sandbox State
  const [inspectorUtr, setInspectorUtr] = useState('');
  const [inspectorResult, setInspectorResult] = useState<{
    status: 'found_approved' | 'found_pending' | 'found_rejected' | 'not_found';
    txn?: any;
  } | null>(null);

  const deposits = transactions.filter(t => t.type === 'deposit');

  // Calculate duplicate UTRs to flag
  const utrCounts: Record<string, number> = {};
  deposits.forEach(d => {
    if (d.utrNumber?.trim()) {
      const u = d.utrNumber.trim();
      utrCounts[u] = (utrCounts[u] || 0) + 1;
    }
  });

  const filtered = deposits.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (highValueOnly && t.amount < 5000) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.userName.toLowerCase().includes(q) ||
        t.userPhone.includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.orderId && t.orderId.toLowerCase().includes(q)) ||
        (t.rrn && t.rrn.toLowerCase().includes(q)) ||
        (t.channel && t.channel.toLowerCase().includes(q)) ||
        (t.utrNumber && t.utrNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingFiltered = filtered.filter(t => t.status === 'pending');

  const handleSelectAllPending = () => {
    if (selectedIds.length === pendingFiltered.length && pendingFiltered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingFiltered.map(t => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCopy = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    sounds.playClick();
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const handleApprove = (id: string) => {
    sounds.playSuccess();
    approveDeposit(id);
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const handleRejectConfirm = () => {
    if (!rejectModalTxnId) return;
    sounds.playError();
    rejectDeposit(rejectModalTxnId, rejectReason);
    setSelectedIds(prev => prev.filter(i => i !== rejectModalTxnId));
    setRejectModalTxnId(null);
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    sounds.playSuccess();
    batchApproveDeposits(selectedIds);
    setSelectedIds([]);
  };

  const handleBatchRejectConfirm = () => {
    if (selectedIds.length === 0) return;
    sounds.playError();
    batchRejectDeposits(selectedIds, rejectReason);
    setSelectedIds([]);
    setBatchRejectModal(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUserId || manualAmount <= 0) return;
    createManualDeposit(manualUserId, manualAmount, manualUtr, manualChannel, manualNote);
    setShowManualModal(false);
    setManualUtr('');
  };

  const handleInspectUtr = () => {
    if (!inspectorUtr.trim()) return;
    const clean = inspectorUtr.trim().toLowerCase();
    const match = deposits.find(d => d.utrNumber?.toLowerCase() === clean);
    if (match) {
      if (match.status === 'approved' || match.status === 'completed') {
        setInspectorResult({ status: 'found_approved', txn: match });
      } else if (match.status === 'pending') {
        setInspectorResult({ status: 'found_pending', txn: match });
      } else {
        setInspectorResult({ status: 'found_rejected', txn: match });
      }
    } else {
      setInspectorResult({ status: 'not_found' });
    }
  };

  const selectedTotalAmount = deposits
    .filter(d => selectedIds.includes(d.id))
    .reduce((sum, curr) => sum + curr.amount, 0);

  return (
    <div className="space-y-5 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold flex items-center space-x-2">
            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
            <span>Deposit Clearance Desk & UTR Validation Hub</span>
          </h2>
          <p className="text-xs text-slate-500">
            Verify 12-digit UTR numbers, credit user balances in real time, or process bulk settlement queues
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Admin Balance Credit</span>
          </button>
          
          <button
            onClick={() => exportDataToCsv('transactions')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold border ${
              isLight 
                ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700' 
                : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* UTR Inspector Sandbox & Quick Verification Tool */}
      <div className={`p-4 rounded-3xl border transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-black uppercase tracking-wider">
              Instant 12-Digit UTR Fraud & Cross-Check Tool
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Real-time duplicate detection across all investor deposits
          </span>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={inspectorUtr}
              onChange={(e) => setInspectorUtr(e.target.value)}
              placeholder="Paste 12-digit UTR (e.g. 429184029182) to inspect status..."
              className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-amber-300'
              }`}
            />
          </div>
          <button
            onClick={handleInspectUtr}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 flex-shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Inspect UTR</span>
          </button>
        </div>

        {inspectorResult && (
          <div className="mt-3 p-3 rounded-2xl border text-xs animate-in fade-in">
            {inspectorResult.status === 'found_approved' && (
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>UTR ALREADY CLEARED & CREDITED: ₹{inspectorResult.txn.amount} to {inspectorResult.txn.userName} (+91 {inspectorResult.txn.userPhone})</span>
                </span>
                <span className="text-[10px] font-mono">{inspectorResult.txn.id}</span>
              </div>
            )}
            {inspectorResult.status === 'found_pending' && (
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>PENDING IN QUEUE: ₹{inspectorResult.txn.amount} for {inspectorResult.txn.userName} (+91 {inspectorResult.txn.userPhone})</span>
                </span>
                <button
                  onClick={() => handleApprove(inspectorResult.txn.id)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Approve Now
                </button>
              </div>
            )}
            {inspectorResult.status === 'found_rejected' && (
              <div className="text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>PREVIOUSLY REJECTED: Reason: "{inspectorResult.txn.rejectionReason || 'Invalid UTR'}"</span>
              </div>
            )}
            {inspectorResult.status === 'not_found' && (
              <div className="text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-blue-500" />
                <span>CLEAN UTR: Never submitted in system. Safe to credit if reflected in merchant statement.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search User, Phone, UTR, Order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 border ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setHighValueOnly(!highValueOnly)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
              highValueOnly
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            ⚡ ≥ ₹5,000 High Value
          </button>

          <div className={`flex rounded-xl p-1 border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setFilter(tab);
                  setSelectedIds([]);
                }}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors ${
                  filter === tab 
                    ? isLight ? 'bg-white text-emerald-700 shadow-sm' : 'bg-emerald-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {tab === 'approved' ? 'Credited' : tab}
              </button>
            ))}
          </div>

          {/* Layout Mode Toggle (Cards vs Table) */}
          <div className={`flex rounded-xl p-1 border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              type="button"
              onClick={() => setLayoutMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
                layoutMode === 'cards'
                  ? isLight ? 'bg-white text-blue-600 shadow-xs' : 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Cards View (Mobile / Tablet Friendly)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                layoutMode === 'table'
                  ? isLight ? 'bg-white text-blue-600 shadow-xs' : 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View (Desktop Dense)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Batch Action Bar (if selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <CheckSquare className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white">
                {selectedIds.length} Deposits Selected
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                Total Credit Value: ₹{selectedTotalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedIds([])}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Clear Selection
            </button>
            <button
              onClick={() => setBatchRejectModal(true)}
              className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-bold flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Batch Reject ({selectedIds.length})</span>
            </button>
            <button
              onClick={handleBatchApprove}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 active:scale-95 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Approve & Credit All ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Content Display: Mobile/Tablet Cards View OR Dense Table View */}
      {layoutMode === 'cards' ? (
        filtered.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${
            isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            No deposit requests match your filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filtered.map((t) => {
              const isSelected = selectedIds.includes(t.id);
              const isDuplicateUtr = t.utrNumber && utrCounts[t.utrNumber.trim()] > 1;

              return (
                <div
                  key={t.id}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                    isSelected
                      ? isLight ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20' : 'bg-blue-900/20 border-blue-500'
                      : isLight ? 'bg-white border-slate-200 shadow-xs hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header: User info + Select Checkbox */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {t.userName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        +91 {t.userPhone}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        ID: {t.id}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <span
                        className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          t.status === 'approved' || t.status === 'completed'
                            ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : t.status === 'pending'
                            ? isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {t.status === 'approved' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {t.status === 'pending' && <Clock className="w-2.5 h-2.5 animate-spin" />}
                        {t.status === 'rejected' && <AlertCircle className="w-2.5 h-2.5" />}
                        <span>{t.status}</span>
                      </span>

                      {t.status === 'pending' && (
                        <button
                          onClick={() => toggleSelect(t.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 active:scale-95 cursor-pointer"
                          title="Select for batch action"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Body: Amount & UTR Details */}
                  <div className="py-3 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                          ₹{t.amount.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400">Recharge Inflow</span>
                      </div>
                      {t.amount >= 5000 && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                          ⚡ High Value
                        </span>
                      )}
                    </div>

                    {/* UTR Box with 1-tap Copy */}
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'
                    }`}>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                          UTR / Reference
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 select-all truncate block">
                          {t.utrNumber || 'N/A'}
                        </span>
                      </div>
                      {t.utrNumber && (
                        <button
                          onClick={() => handleCopy(t.utrNumber!)}
                          className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 transition-all active:scale-90 flex-shrink-0 cursor-pointer ${
                            isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                          title="Copy UTR"
                        >
                          {copiedUtr === t.utrNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[10px] font-bold">Copy</span>
                        </button>
                      )}
                    </div>

                    {isDuplicateUtr && (
                      <div className="flex items-center space-x-1.5 text-[11px] text-red-600 dark:text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Duplicate UTR used {utrCounts[t.utrNumber!.trim()]}x!</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {t.channel || t.method || 'UPI-Fast'}
                      </span>
                      <span className="font-mono text-[10px]">
                        {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {t.rejectionReason && (
                      <p className="text-[11px] text-red-600 dark:text-red-400 bg-red-500/10 p-2 rounded-lg">
                        Reason: {t.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Card Actions (Large touch targets for phones) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {t.status === 'pending' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleApprove(t.id)}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => setRejectModalTxnId(t.id)}
                          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer ${
                            isLight 
                              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                              : 'bg-slate-800 text-red-400 border-red-500/20 hover:bg-red-950/80'
                          }`}
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 text-center py-1">
                        Processed by <span className="font-bold">{t.approvedBy || 'System'}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Table Container */
        <div className={`border rounded-3xl overflow-hidden shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase text-[10px] tracking-wider border-b ${
                isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-slate-950/80 text-slate-400 border-slate-800'
              }`}>
                <tr>
                  <th className="px-4 py-3.5 w-10">
                    {filter === 'pending' && pendingFiltered.length > 0 && (
                      <button
                        onClick={handleSelectAllPending}
                        className="text-slate-400 hover:text-blue-600 cursor-pointer"
                        title="Select all pending"
                      >
                        {selectedIds.length === pendingFiltered.length ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </th>
                  <th className="px-4 py-3.5">Transaction & User</th>
                  <th className="px-4 py-3.5">Amount (₹)</th>
                  <th className="px-4 py-3.5">Gateway & UTR Number</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      No deposit requests match your filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const isSelected = selectedIds.includes(t.id);
                    const isDuplicateUtr = t.utrNumber && utrCounts[t.utrNumber.trim()] > 1;

                    return (
                      <tr 
                        key={t.id} 
                        className={`transition-colors ${
                          isSelected 
                            ? isLight ? 'bg-blue-50' : 'bg-blue-900/20' 
                            : isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-850/50'
                        }`}
                      >
                        {/* Selection Checkbox */}
                        <td className="px-4 py-4">
                          {t.status === 'pending' && (
                            <button
                              onClick={() => toggleSelect(t.id)}
                              className="text-slate-400 hover:text-blue-600 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </td>
                        
                        {/* User */}
                        <td className="px-4 py-4">
                          <div className="font-bold text-sm text-slate-900 dark:text-white">{t.userName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">+91 {t.userPhone}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{t.id}</div>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-4">
                          <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            ₹{t.amount.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-slate-400">Recharge Inflow</span>
                        </td>

                        {/* UTR */}
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border select-all ${
                              isLight 
                                ? 'bg-slate-50 border-slate-200 text-amber-700' 
                                : 'bg-slate-950 border-slate-800 text-amber-400'
                            }`}>
                              {t.utrNumber || 'N/A'}
                            </span>
                            {t.utrNumber && (
                              <button
                                onClick={() => handleCopy(t.utrNumber!)}
                                className={`p-1 rounded-md transition-colors cursor-pointer ${
                                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                                }`}
                                title="Copy UTR"
                              >
                                {copiedUtr === t.utrNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                          
                          {isDuplicateUtr && (
                            <div className="flex items-center space-x-1 text-[10px] text-red-600 dark:text-red-400 font-bold mt-1 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Duplicate UTR ({utrCounts[t.utrNumber!.trim()]}x)</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-1.5 text-[10px] mt-1 text-slate-400 font-mono">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">{t.channel || t.method || 'UPI-Fast'}</span>
                            {t.orderId && <span>• {t.orderId}</span>}
                          </div>
                        </td>

                        {/* Time */}
                        <td className="px-4 py-4">
                          <div className="font-mono text-slate-700 dark:text-slate-300">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {new Date(t.createdAt).toLocaleTimeString()}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${
                              t.status === 'approved' || t.status === 'completed'
                                ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : t.status === 'pending'
                                ? isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {t.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                            {t.status === 'pending' && <Clock className="w-3 h-3 animate-spin" />}
                            {t.status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                            <span>{t.status}</span>
                          </span>
                          {t.rejectionReason && (
                            <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 max-w-xs truncate">
                              Reason: {t.rejectionReason}
                            </p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right">
                          {t.status === 'pending' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleApprove(t.id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => setRejectModalTxnId(t.id)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs border flex items-center space-x-1 transition-all cursor-pointer ${
                                  isLight 
                                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                                    : 'bg-slate-800 text-red-400 border-red-500/20 hover:bg-red-950/80'
                                }`}
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {t.approvedBy || 'Processed'}
                            </span>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Direct Balance Credit Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-blue-500" />
                <h3 className="font-extrabold text-base">Direct Investor Balance Adjustment</h3>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Select Target Investor Account
                </label>
                <select
                  value={manualUserId}
                  onChange={(e) => setManualUserId(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} (+91 {u.phone}) — Balance: ₹{u.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">
                    Credit Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={manualAmount}
                    onChange={(e) => setManualAmount(Number(e.target.value))}
                    className={`w-full rounded-xl px-3 py-2 text-sm font-black font-mono border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-200 text-emerald-700' : 'bg-slate-950 border-slate-800 text-emerald-400'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">
                    Payment Gateway Channel
                  </label>
                  <select
                    value={manualChannel}
                    onChange={(e) => setManualChannel(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  >
                    <option value="UPI FastPay">UPI FastPay</option>
                    <option value="PhonePe Business">PhonePe Business</option>
                    <option value="Google Pay">Google Pay</option>
                    <option value="Paytm Gateway">Paytm Gateway</option>
                    <option value="Bank IMPS Direct">Bank IMPS Direct</option>
                    <option value="Cash / Offline Desk">Cash / Offline Desk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  12-Digit Banking UTR / Reference ID
                </label>
                <input
                  type="text"
                  placeholder="Optional or leave blank for auto-generator"
                  value={manualUtr}
                  onChange={(e) => setManualUtr(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Internal Audit Note
                </label>
                <input
                  type="text"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/30"
                >
                  Credit Funds Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Dialog (Single) */}
      {rejectModalTxnId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`border rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <h3 className="font-bold text-base">Decline Deposit Request</h3>
            <p className="text-xs text-slate-500">
              Select or provide the reason for declining transaction <span className="font-mono font-bold text-slate-800 dark:text-white">{rejectModalTxnId}</span>:
            </p>

            <div className="space-y-2">
              {[
                'UTR not found in merchant bank statement',
                'Payment amount mismatch with receipt',
                'Duplicate UTR submission detected',
                'Payment was cancelled or reversed at bank',
                'Invalid 12-digit UTR character sequence'
              ].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRejectReason(r)}
                  className={`w-full text-left text-xs p-2.5 rounded-xl border transition-all ${
                    rejectReason === r
                      ? 'bg-blue-600/20 border-blue-500 text-blue-700 dark:text-blue-200 font-bold'
                      : isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalTxnId(null)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Reject Modal */}
      {batchRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`border rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <h3 className="font-bold text-base text-red-600">Batch Reject ({selectedIds.length}) Requests</h3>
            <p className="text-xs text-slate-500">
              Apply rejection reason to all {selectedIds.length} selected transactions:
            </p>

            <div className="space-y-2">
              {[
                'UTR not found in merchant bank statement',
                'Invalid or fake UTR submission',
                'Payment reversed by payer bank',
                'Merchant clearing window expired'
              ].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRejectReason(r)}
                  className={`w-full text-left text-xs p-2.5 rounded-xl border transition-all ${
                    rejectReason === r
                      ? 'bg-red-600/20 border-red-500 text-red-700 dark:text-red-200 font-bold'
                      : isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setBatchRejectModal(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchRejectConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30"
              >
                Reject All Selected
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
