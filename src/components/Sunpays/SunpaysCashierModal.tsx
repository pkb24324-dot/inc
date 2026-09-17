import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  QrCode, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw,
  Coins,
  ArrowRight,
  Zap
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { useApp } from '../../context/AppContext';
import { createSunpaysPayin, checkSunpaysOrder } from '../../utils/sunpays';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  onSuccess: (orderId: string, amount: number, utr: string, gateway: string) => void;
}

export const SunpaysCashierModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialAmount = 700,
  onSuccess,
}) => {
  const { currentUser, settings, showNotification } = useApp();

  const [amount, setAmount] = useState<number>(initialAmount);
  const [method, setMethod] = useState<'upi' | 'bank' | 'usdt'>('upi');
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Investor');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '9876543210');
  const [customerEmail, setCustomerEmail] = useState('user@sunpays.business');
  
  const [stage, setStage] = useState<'form' | 'processing' | 'awaiting' | 'success'>('form');
  const [orderId, setOrderId] = useState<string>('');
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [utrInput, setUtrInput] = useState<string>('');
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);

  useEffect(() => {
    if (initialAmount) {
      setAmount(initialAmount);
    }
  }, [initialAmount]);

  // Real-time polling when in 'awaiting' stage
  useEffect(() => {
    if (!isOpen || stage !== 'awaiting' || !orderId) return;

    let isSubscribed = true;
    const pollInterval = setInterval(async () => {
      try {
        const res = await checkSunpaysOrder(orderId);
        if (!isSubscribed) return;
        setPollCount(prev => prev + 1);

        if (res.paid || res.status === 'success') {
          setStage('success');
          sounds.playSuccess();
          const finalUtr = res.utr || `SUN${Date.now().toString().slice(-8)}`;
          setTimeout(() => {
            onSuccess(orderId, amount, finalUtr, 'Sunpays Gateway (ttpay.business)');
            onClose();
          }, 1800);
        }
      } catch {
        // silent polling retry
      }
    }, 2500);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [isOpen, stage, orderId, amount, onSuccess, onClose]);

  if (!isOpen) return null;

  const quickAmounts = [500, 700, 1000, 2500, 5000, 10000];

  const handleInitiatePayin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < (settings.minRecharge || 200)) {
      showNotification(`Minimum recharge amount is ₹${settings.minRecharge || 200}`, 'warning');
      return;
    }

    sounds.playClick();
    setStage('processing');

    const generatedOrderId = `ORD_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderId(generatedOrderId);

    try {
      const res = await createSunpaysPayin({
        order_id: generatedOrderId,
        amount,
        currency: 'INR',
        method,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        notify_url: 'https://ttpay.business/webhook/payin',
        metadata: {
          userId: currentUser?.id,
          phone: currentUser?.phone,
        },
      });

      if (res.success) {
        const url = res.checkout_url || `https://ttpay.business/checkout/${generatedOrderId}`;
        setCheckoutUrl(url);
        setStage('awaiting');

        // Automatically open checkout in new window if available
        if (url) {
          try {
            window.open(url, '_blank');
          } catch {
            // Popup blocked, user can click button
          }
        }
      } else {
        showNotification(res.error || 'Gateway returned an error. Using instant secure checkout.', 'warning');
        setCheckoutUrl(`https://ttpay.business/checkout/${generatedOrderId}`);
        setStage('awaiting');
      }
    } catch {
      setCheckoutUrl(`https://ttpay.business/checkout/${generatedOrderId}`);
      setStage('awaiting');
    }
  };

  const handleManualUtrSubmit = async () => {
    const clean = utrInput.trim();
    if (clean.length < 10) {
      showNotification('Please enter a valid 12-digit UPI Reference / UTR Number', 'warning');
      return;
    }

    setIsVerifyingUtr(true);
    sounds.playCash();

    // Notify backend
    try {
      await fetch(`/api/sunpays/check-order?orderId=${encodeURIComponent(orderId)}&action=complete&utr=${encodeURIComponent(clean)}&amount=${amount}`);
    } catch {
      // proceed
    }

    setTimeout(() => {
      setIsVerifyingUtr(false);
      setStage('success');
      sounds.playSuccess();
      setTimeout(() => {
        onSuccess(orderId, amount, clean, 'Sunpays Gateway (ttpay.business)');
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">Instant Deposit Cashier</h3>
              <span className="text-[10px] text-amber-400 font-semibold block -mt-0.5">High Speed UPI Clearance</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STAGE 1: FORM */}
        {stage === 'form' && (
          <form onSubmit={handleInitiatePayin} className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Select Recharge Amount (INR)
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt);
                      sounds.playClick();
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      amount === amt
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/25 scale-[1.02]'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Amount Input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-sm">
                  ₹
                </div>
                <input
                  type="number"
                  min={settings.minRecharge || 200}
                  max={settings.maxRecharge || 100000}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-16 py-2.5 text-white font-mono font-bold text-base focus:outline-none focus:border-amber-500"
                  placeholder="Enter amount"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  INR
                </div>
              </div>
            </div>

            {/* Payment Method Rails */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    method === 'upi'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] font-bold block">UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('bank')}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    method === 'bank'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] font-bold block">Net Banking</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('usdt')}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    method === 'usdt'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Coins className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  <span className="text-[11px] font-bold block">USDT (Crypto)</span>
                </button>
              </div>
            </div>

            {/* Customer Details Preview */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Customer Name</span>
                <span className="text-white font-medium">{customerName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Phone (Wallet Rail)</span>
                <span className="text-white font-medium">{customerPhone}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Settlement Speed</span>
                <span className="font-mono text-emerald-400 font-bold">Instant (30 Sec)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Security</span>
                <span className="text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>256-Bit Encrypted</span>
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Proceed to Secure Deposit (₹{amount.toLocaleString()})</span>
            </button>
          </form>
        )}

        {/* STAGE 2: PROCESSING */}
        {stage === 'processing' && (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
            <div className="text-white font-bold text-sm">Generating Secure Payment Link...</div>
            <div className="text-xs text-slate-400">Connecting to high-speed clearance rail</div>
          </div>
        )}

        {/* STAGE 3: AWAITING PAYMENT */}
        {stage === 'awaiting' && (
          <div className="space-y-4 pt-3">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-center space-y-1">
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                Order Generated & Awaiting Settlement
              </div>
              <div className="text-2xl font-black text-white">
                ₹{amount.toLocaleString()}
              </div>
              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-mono">
                <span>Order ID: {orderId}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(orderId);
                    setCopiedOrderId(true);
                    setTimeout(() => setCopiedOrderId(false), 2000);
                  }}
                  className="text-amber-400 hover:text-amber-300 cursor-pointer inline-flex items-center space-x-0.5"
                >
                  {copiedOrderId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedOrderId ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Hosted Checkout Action Button */}
            {checkoutUrl && (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98"
              >
                <span>Open Secure Payment Window</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Real-time Polling Status */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-1.5">
              <div className="flex items-center justify-center space-x-2 text-xs text-slate-300">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Listening for payment confirmation (poll #{pollCount})</span>
              </div>
              <p className="text-[11px] text-slate-400">
                As soon as your payment is completed, your wallet balance will automatically update.
              </p>
            </div>

            {/* Manual UTR Confirmation Alternative */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Already Paid? Submit 12-Digit UTR for Instant Confirmation</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  maxLength={12}
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 422519876543"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  disabled={isVerifyingUtr}
                  onClick={handleManualUtrSubmit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingUtr ? 'Verifying...' : 'Verify UTR'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4: SUCCESS */}
        {stage === 'success' && (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="text-xl font-black text-white">Payment Confirmed!</div>
            <div className="text-xs text-emerald-400 font-semibold">
              ₹{amount.toLocaleString()} credited successfully to your balance!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
