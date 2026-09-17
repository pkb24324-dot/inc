import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowUpRight, 
  Check, 
  X, 
  Search, 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Copy, 
  DollarSign, 
  Download, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  AlertTriangle,
  Zap,
  CheckCheck,
  Send,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Wallet,
  LayoutGrid,
  List
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { SunpaysLogo } from '../Sunpays/SunpaysLogo';
import { sendSunpaysPayout, fetchSunpaysBalance } from '../../utils/sunpays';

export const WithdrawalApprovals: React.FC = () => {
  const { 
    transactions, 
    approveWithdrawal, 
    rejectWithdrawal,
    batchApproveWithdrawals,
    batchRejectWithdrawals,
    exportDataToCsv,
    allUsers,
    settings,
    showNotification,
    theme
  } = useApp();

  const isLight = theme === 'light';

  const [layoutMode, setLayoutMode] = useState<'cards' | 'table'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [highValueOnly, setHighValueOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectModalTxnId, setRejectModalTxnId] = useState<string | null>(null);
  const [batchRejectModal, setBatchRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Invalid bank account number or IFSC mismatch');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Single Approve Modal with Custom IMPS RRN
  const [approveModalTxn, setApproveModalTxn] = useState<any | null>(null);
  const [customRrn, setCustomRrn] = useState('');
  const [isProcessingSunpays, setIsProcessingSunpays] = useState(false);

  // Live Sunpays Balance
  const [sunpaysBalance, setSunpaysBalance] = useState<number | null>(null);
  const [sunpaysUpstream, setSunpaysUpstream] = useState<number | null>(null);
  const [loadingSunpaysBalance, setLoadingSunpaysBalance] = useState(false);

  const loadSunpaysBalance = async () => {
    setLoadingSunpaysBalance(true);
    try {
      const data = await fetchSunpaysBalance();
      if (data.balance !== undefined) {
        setSunpaysBalance(data.balance);
        if (data.upstream_balance !== undefined) {
          setSunpaysUpstream(data.upstream_balance);
        }
      }
    } catch {
      // silent
    } finally {
      setLoadingSunpaysBalance(false);
    }
  };

  React.useEffect(() => {
    loadSunpaysBalance();
  }, []);

  const handleSunpaysInstantPayout = async (txn: any) => {
    if (!txn) return;
    setIsProcessingSunpays(true);
    sounds.playClick();

    const payoutMethod = txn.bankDetails?.upiId ? 'upi' : 'bank';
    const amountToTransfer = txn.netAmount || txn.amount;

    try {
      const res = await sendSunpaysPayout({
        payout_id: `PO_${txn.id}_${Date.now().toString().slice(-4)}`,
        amount: amountToTransfer,
        currency: 'INR',
        method: payoutMethod,
        beneficiary_name: txn.bankDetails?.accountHolder || txn.userName || 'Beneficiary',
        beneficiary_account: txn.bankDetails?.upiId || txn.bankDetails?.accountNumber || '',
        beneficiary_phone: txn.userPhone || '9876543210',
        ifsc: txn.bankDetails?.ifsc,
        bank_name: txn.bankDetails?.bankName,
        notify_url: 'https://ttpay.business/webhook/payout',
      });

      if (res.success) {
        const liveUtr = res.data?.utr || `SUN${Date.now().toString().slice(-8)}`;
        sounds.playCash();
        approveWithdrawal(txn.id, liveUtr);
        showNotification(`⚡ Sunpays Payout Dispatched! UTR: ${liveUtr} (Net: ₹${amountToTransfer.toLocaleString()})`, 'success');
        setApproveModalTxn(null);
        setSelectedIds(prev => prev.filter(i => i !== txn.id));
        loadSunpaysBalance();
      } else {
        showNotification(res.error || 'Sunpays Payout API returned an error', 'error');
      }
    } catch (err: any) {
      showNotification(err?.message || 'Failed to dispatch Sunpays payout', 'error');
    } finally {
      setIsProcessingSunpays(false);
    }
  };

  const withdrawals = transactions.filter(t => t.type === 'withdrawal');

  const filtered = withdrawals.filter(t => {
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
        (t.bankDetails?.accountNumber && t.bankDetails.accountNumber.includes(q)) ||
        (t.bankDetails?.upiId && t.bankDetails.upiId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingWithdrawals = withdrawals.filter(t => t.status === 'pending');
  const pendingSelected = selectedIds.filter(id => {
    const txn = withdrawals.find(w => w.id === id);
    return txn && txn.status === 'pending';
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    sounds.playClick();
    setTimeout(() => setCopiedText(null), 2000);
  };

  const openApproveModal = (txn: any) => {
    const randomRrn = `${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    setCustomRrn(randomRrn);
    setApproveModalTxn(txn);
  };

  const handleApproveConfirm = () => {
    if (!approveModalTxn) return;
    sounds.playCash();
    approveWithdrawal(approveModalTxn.id, customRrn);
    setSelectedIds(prev => prev.filter(i => i !== approveModalTxn.id));
    setApproveModalTxn(null);
  };

  const handleRejectConfirm = () => {
    if (!rejectModalTxnId) return;
    sounds.playError();
    rejectWithdrawal(rejectModalTxnId, rejectReason);
    setSelectedIds(prev => prev.filter(i => i !== rejectModalTxnId));
    setRejectModalTxnId(null);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(t => t.id));
    }
    sounds.playClick();
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    sounds.playClick();
  };

  const handleBatchApprove = () => {
    if (pendingSelected.length === 0) return;
    sounds.playCash();
    batchApproveWithdrawals(pendingSelected);
    setSelectedIds([]);
  };

  const handleBatchRejectConfirm = () => {
    if (pendingSelected.length === 0) return;
    sounds.playError();
    batchRejectWithdrawals(pendingSelected, rejectReason);
    setSelectedIds([]);
    setBatchRejectModal(false);
  };

  const selectedNetTotal = withdrawals
    .filter(w => selectedIds.includes(w.id))
    .reduce((sum, curr) => sum + (curr.netAmount || curr.amount), 0);

  return (
    <div className="space-y-5 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold flex items-center space-x-2">
            <ArrowUpRight className="w-5 h-5 text-amber-500" />
            <span>Disbursement Treasury & Bank Payout Console</span>
          </h2>
          <p className="text-xs text-slate-500">
            Audit bank account numbers, dispatch live IMPS settlement batches, and manage withdrawal refunds
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportDataToCsv('transactions')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
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

      {/* Sunpays Gateway Treasury Bar */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isLight ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' : 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/30'
      }`}>
        <div className="flex items-center space-x-3">
          <SunpaysLogo />
          <div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
              <span>Sunpays Live Disbursement Payout Gateway</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                API ONLINE
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Merchant: {settings.sunpaysMerchantId || '353548'} • Rail: UPI / IMPS Payout • ttpay.business
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
              Available Merchant Balance
            </span>
            <div className="text-lg font-black text-amber-500 font-mono">
              {sunpaysBalance !== null ? `₹${sunpaysBalance.toLocaleString()}` : 'Connecting...'}
            </div>
          </div>

          <button
            type="button"
            onClick={loadSunpaysBalance}
            disabled={loadingSunpaysBalance}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isLight ? 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50' : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
            }`}
            title="Refresh Sunpays Balance"
          >
            <RefreshCw className={`w-4 h-4 ${loadingSunpaysBalance ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search User, Phone, Bank A/C, RRN, IFSC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 border ${
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
            {(['pending', 'completed', 'rejected', 'all'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setFilter(tab);
                  setSelectedIds([]);
                }}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors ${
                  filter === tab 
                    ? isLight ? 'bg-white text-amber-700 shadow-sm' : 'bg-amber-500 text-slate-950'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {tab === 'completed' ? 'Disbursed' : tab}
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
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                layoutMode === 'cards'
                  ? isLight ? 'bg-white text-amber-600 shadow-xs' : 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Cards View (Mobile / Tablet Friendly)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                layoutMode === 'table'
                  ? isLight ? 'bg-white text-amber-600 shadow-xs' : 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View (Desktop Dense)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Batch Processing Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <CheckSquare className="w-5 h-5 text-amber-500" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white">
                {selectedIds.length} Payouts Selected ({pendingSelected.length} Actionable)
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                Total Net Disbursement: ₹{selectedNetTotal.toLocaleString()}
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
              disabled={pendingSelected.length === 0}
              onClick={() => setBatchRejectModal(true)}
              className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-bold disabled:opacity-50 flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Batch Reject ({pendingSelected.length})</span>
            </button>
            <button
              disabled={pendingSelected.length === 0}
              onClick={handleBatchApprove}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/30 flex items-center space-x-1.5 active:scale-95 transition-all disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Release IMPS Payouts ({pendingSelected.length})</span>
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
            No withdrawal requests match your filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filtered.map((t) => {
              const isSelected = selectedIds.includes(t.id);
              const userObj = allUsers.find(u => u.id === t.userId);

              return (
                <div
                  key={t.id}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                    isSelected
                      ? isLight ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-500/20' : 'bg-amber-900/20 border-amber-500'
                      : isLight ? 'bg-white border-slate-200 shadow-xs hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5 truncate">
                        <span className="truncate">{t.userName}</span>
                        {userObj && (
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 flex-shrink-0">
                            VIP {userObj.vipLevel}
                          </span>
                        )}
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
                          t.status === 'completed'
                            ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : t.status === 'pending'
                            ? isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {t.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {t.status === 'pending' && <Clock className="w-2.5 h-2.5 animate-spin" />}
                        {t.status === 'rejected' && <AlertCircle className="w-2.5 h-2.5" />}
                        <span>{t.status === 'completed' ? 'Disbursed' : t.status}</span>
                      </span>

                      {t.status === 'pending' && (
                        <button
                          onClick={() => toggleSelectOne(t.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-amber-500 active:scale-95 cursor-pointer"
                          title="Select for batch action"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-amber-500" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="py-3 space-y-2.5">
                    {/* Amount */}
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                          ₹{(t.netAmount || t.amount).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Net Payout • Gross: ₹{t.amount.toLocaleString()} {t.fee ? `(Fee: ₹${t.fee})` : ''}
                        </span>
                      </div>
                      {t.amount >= 10000 && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                          ⚡ Priority Payout
                        </span>
                      )}
                    </div>

                    {/* Bank / UPI Details Card */}
                    <div className={`p-2.5 rounded-xl border space-y-1.5 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'
                    }`}>
                      {t.bankDetails?.upiId ? (
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                              UPI Virtual Address
                            </span>
                            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 select-all truncate block">
                              {t.bankDetails.upiId}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(t.bankDetails!.upiId!)}
                            className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 transition-all active:scale-90 flex-shrink-0 cursor-pointer ${
                              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                            title="Copy UPI"
                          >
                            {copiedText === t.bankDetails.upiId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="text-[10px] font-bold">Copy</span>
                          </button>
                        </div>
                      ) : t.bankDetails?.accountNumber ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                              <Building2 className="w-3.5 h-3.5 text-amber-500" />
                              <span>{t.bankDetails.bankName || 'Direct Bank IMPS'}</span>
                            </span>
                            <button
                              onClick={() => handleCopy(t.bankDetails!.accountNumber!)}
                              className={`p-1 rounded-md border text-xs flex items-center space-x-1 cursor-pointer ${
                                isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                              }`}
                              title="Copy Account"
                            >
                              {copiedText === t.bankDetails.accountNumber ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span className="text-[9px] font-bold">Copy A/C</span>
                            </button>
                          </div>
                          <div className="font-mono text-xs font-bold text-slate-900 dark:text-white select-all">
                            A/C: {t.bankDetails.accountNumber}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            IFSC: <span className="text-blue-600 dark:text-blue-400 font-bold">{t.bankDetails.ifscCode}</span> • {t.bankDetails.holderName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No bank info provided</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="font-mono text-[10px]">
                        Req: {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {t.rrn && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          RRN: {t.rrn}
                        </span>
                      )}
                    </div>

                    {t.rejectionReason && (
                      <p className="text-[11px] text-red-600 dark:text-red-400 bg-red-500/10 p-2 rounded-lg">
                        Refunded: {t.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {t.status === 'pending' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openApproveModal(t)}
                          className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>Dispatch</span>
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
                        Processed by <span className="font-bold">{t.approvedBy || 'Disbursed'}</span>
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
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-amber-500"
                    title="Select all"
                  >
                    {selectedIds.length === filtered.length && filtered.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3.5">Investor & Profile</th>
                <th className="px-4 py-3.5">Gross / Net Payout (₹)</th>
                <th className="px-4 py-3.5">Bank Details & Verification</th>
                <th className="px-4 py-3.5">Requested Time</th>
                <th className="px-4 py-3.5">Status & RRN</th>
                <th className="px-4 py-3.5 text-right">Disbursement Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No withdrawal requests match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isSelected = selectedIds.includes(t.id);
                  const userObj = allUsers.find(u => u.id === t.userId);

                  return (
                    <tr 
                      key={t.id} 
                      className={`transition-colors ${
                        isSelected 
                          ? isLight ? 'bg-amber-50/70' : 'bg-amber-900/10' 
                          : isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-850/50'
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleSelectOne(t.id)}
                          className="text-slate-400 hover:text-amber-500"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Investor */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                          <span>{t.userName}</span>
                          {userObj && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                              VIP {userObj.vipLevel}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">+91 {t.userPhone}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{t.id}</div>
                      </td>

                      {/* Amount Breakdown */}
                      <td className="px-4 py-4">
                        <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                          ₹{(t.netAmount || t.amount).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Gross: ₹{t.amount.toLocaleString()} {t.fee ? `• Fee: ₹${t.fee}` : ''}
                        </div>
                      </td>

                      {/* Bank Details */}
                      <td className="px-4 py-4">
                        {t.bankDetails?.upiId ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                              <Smartphone className="w-3.5 h-3.5" />
                              <span className="font-mono">{t.bankDetails.upiId}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block font-mono">UPI Instant Virtual Address</span>
                          </div>
                        ) : t.bankDetails?.accountNumber ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                              <Building2 className="w-3.5 h-3.5 text-amber-500" />
                              <span>{t.bankDetails.bankName || 'Direct Bank IMPS'}</span>
                            </div>
                            <div className="flex items-center space-x-1 font-mono text-[11px]">
                              <span className="text-slate-500">A/C:</span>
                              <span className="font-bold text-slate-900 dark:text-white select-all">{t.bankDetails.accountNumber}</span>
                              <button
                                onClick={() => handleCopy(t.bankDetails!.accountNumber!)}
                                className="text-slate-400 hover:text-blue-500 ml-1"
                                title="Copy account number"
                              >
                                {copiedText === t.bankDetails.accountNumber ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              IFSC: <span className="text-blue-600 dark:text-blue-400 font-bold">{t.bankDetails.ifscCode}</span> • {t.bankDetails.holderName}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No bank info</span>
                        )}
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
                            t.status === 'completed' || t.status === 'approved'
                              ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : t.status === 'pending'
                              ? isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {t.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                          {t.status === 'pending' && <Clock className="w-3 h-3 animate-spin" />}
                          {t.status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                          <span>{t.status === 'completed' ? 'Disbursed' : t.status}</span>
                        </span>

                        {t.rrn && (
                          <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                            RRN: {t.rrn}
                          </div>
                        )}

                        {t.rejectionReason && (
                          <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 max-w-xs truncate">
                            Refunded: {t.rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        {t.status === 'pending' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openApproveModal(t)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center space-x-1 shadow-sm transition-all active:scale-95"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Dispatch</span>
                            </button>
                            <button
                              onClick={() => setRejectModalTxnId(t.id)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs border flex items-center space-x-1 transition-all ${
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
                            {t.approvedBy || 'Disbursed'}
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

      {/* Approve & Dispatch Modal with RRN Input */}
      {approveModalTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base">Release IMPS Bank Disbursement</h3>
              </div>
              <button
                onClick={() => setApproveModalTxn(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Payout Summary Box */}
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
              isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-950 border-amber-500/30'
            }`}>
              <div className="flex justify-between items-center text-slate-500">
                <span>Beneficiary Name:</span>
                <span className="font-bold text-slate-900 dark:text-white font-sans">{approveModalTxn.userName}</span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span>Net Amount to Release:</span>
                <span className="font-black text-base text-emerald-600 dark:text-emerald-400 font-mono">
                  ₹{(approveModalTxn.netAmount || approveModalTxn.amount).toLocaleString()}
                </span>
              </div>

              {approveModalTxn.bankDetails?.accountNumber && (
                <div className="flex justify-between items-center text-slate-500 font-mono">
                  <span>Target Account:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{approveModalTxn.bankDetails.accountNumber} ({approveModalTxn.bankDetails.ifscCode})</span>
                </div>
              )}

              {approveModalTxn.bankDetails?.upiId && (
                <div className="flex justify-between items-center text-slate-500 font-mono">
                  <span>Target UPI:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{approveModalTxn.bankDetails.upiId}</span>
                </div>
              )}
            </div>

            {/* RRN Reference input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">
                12-Digit Bank IMPS RRN (Reference Number)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customRrn}
                  onChange={(e) => setCustomRrn(e.target.value)}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-mono font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-amber-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newR = `${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
                    setCustomRrn(newR);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                  }`}
                  title="Generate new RRN"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block">
                This RRN will appear on the investor's official withdrawal receipt & bank passbook.
              </span>
            </div>

            {/* One-Click Sunpays Payout API Option */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                type="button"
                disabled={isProcessingSunpays}
                onClick={() => handleSunpaysInstantPayout(approveModalTxn)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-slate-950 fill-current" />
                <span>
                  {isProcessingSunpays 
                    ? 'Signing HMAC-SHA256 & Dispatching via ttpay.business...' 
                    : `⚡ Auto-Dispatch via Sunpays Payout API (₹${(approveModalTxn.netAmount || approveModalTxn.amount).toLocaleString()})`}
                </span>
              </button>
              <p className="text-[10px] text-center text-slate-400">
                Calls POST /api/public/v1/payouts with HMAC-SHA256 signature to transfer funds instantly.
              </p>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setApproveModalTxn(null)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border ${
                  isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveConfirm}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                Manual RRN Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalTxnId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`border rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <h3 className="font-bold text-base">Decline Payout & Refund Wallet</h3>
            <p className="text-xs text-slate-500">
              Declining will automatically refund 100% of the withdrawal amount back to the investor's wallet:
            </p>

            <div className="space-y-2">
              {[
                'Invalid bank account number or IFSC mismatch',
                'Beneficiary bank account is dormant or frozen',
                'UPI Virtual ID inactive or not accepting incoming credits',
                'High-frequency withdrawal limit reached for the day',
                'Investor name does not match KYC / Bank records'
              ].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRejectReason(r)}
                  className={`w-full text-left text-xs p-2.5 rounded-xl border transition-all ${
                    rejectReason === r
                      ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-200 font-bold'
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
                Confirm Refund
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
            <h3 className="font-bold text-base text-red-600">Batch Reject ({pendingSelected.length}) Payouts</h3>
            <p className="text-xs text-slate-500">
              Apply reason and refund all {pendingSelected.length} transactions back to user accounts:
            </p>

            <div className="space-y-2">
              {[
                'Bank gateway maintenance window active',
                'Invalid account credentials detected',
                'Manual re-submission required by user'
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
                Reject & Refund All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
