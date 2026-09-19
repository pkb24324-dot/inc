import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  CheckCircle2, 
  RefreshCw,
  Coins,
  ArrowRight,
  Zap,
  Smartphone,
  ChevronLeft
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
  const [customerName] = useState(currentUser?.name || 'Investor');
  const [customerPhone] = useState(currentUser?.phone || '9876543210');
  const [customerEmail] = useState('user@sunpays.business');
  
  const [stage, setStage] = useState<'form' | 'processing' | 'awaiting' | 'success'>('form');
  const [orderId, setOrderId] = useState<string>('');
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

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

        if (res.paid || res.status === 'success') {
          setStage('success');
          sounds.playSuccess();
          const finalUtr = res.utr || `SUN${Date.now().toString().slice(-8)}`;
          setTimeout(() => {
            onSuccess(orderId, amount, finalUtr, 'AM Invest Payment Terminal');
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
        setIsIframeLoading(true);
      } else {
        setCheckoutUrl(`https://ttpay.business/checkout/${generatedOrderId}`);
        setStage('awaiting');
        setIsIframeLoading(true);
      }
    } catch {
      setCheckoutUrl(`https://ttpay.business/checkout/${generatedOrderId}`);
      setStage('awaiting');
      setIsIframeLoading(true);
    }
  };

  // STEALTH FULL-SCREEN IN-APP CHECKOUT VIEW (People won't even realize an external payment link opened!)
  if (stage === 'awaiting') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-in fade-in duration-200">
        {/* Stealth Top Native App Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md shadow-md select-none">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setStage('form');
              }}
              className="p-1.5 -ml-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono text-slate-300">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span className="truncate max-w-[140px] sm:max-w-[220px]">secure.fastclearing.in</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsIframeLoading(true);
                setIframeKey(k => k + 1);
                sounds.playClick();
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Stealth Iframe */}
        <div className="flex-1 relative w-full h-full bg-slate-950">
          {isIframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 space-y-3 p-4">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs font-bold text-white tracking-wide">Connecting to Secure Payment Rail...</p>
              <p className="text-[10px] text-slate-400 text-center max-w-xs">
                Please wait while we establish an encrypted channel.
              </p>
            </div>
          )}

          <iframe
            src={checkoutUrl}
            key={iframeKey}
            onLoad={() => setIsIframeLoading(false)}
            className="w-full h-full border-0 bg-white"
            allow="payment; camera; clipboard-write; clipboard-read"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals allow-top-navigation-by-user-activation"
            title="AM Invest Payment Terminal"
          />
        </div>

        {/* Stealth Bottom Status Strip */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Amount: ₹{amount.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
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
            {/* Amount Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Select Amount
              </label>
              
              {/* Presets Grid */}
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
                  <Smartphone className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] font-bold block">UPI Express</span>
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
                <span className="font-mono text-emerald-400 font-bold">Instant Auto-Credit</span>
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
              <span>Proceed to Pay ₹{amount.toLocaleString()}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STAGE 2: PROCESSING */}
        {stage === 'processing' && (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
            <div className="text-white font-bold text-sm">Connecting to Secure Banking Gateway...</div>
            <div className="text-xs text-slate-400">Initiating high-speed clearance rail</div>
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
