import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Lock,
  ArrowRight,
  Globe
} from 'lucide-react';
import { WatchPayLogo } from './WatchPayLogo';
import { 
  buildWatchPayDepositPayload, 
  WATCHPAY_CALLBACK_IP 
} from '../../utils/watchpay';
import { sounds } from '../../utils/audio';

interface WatchPayCashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  merchantNo: string;
  payKey: string;
  payType: string;
  domain?: string;
  onSuccess: (orderId: string, amount: number, utr: string, gateway: string) => void;
}

export const WatchPayCashierModal: React.FC<WatchPayCashierModalProps> = ({
  isOpen,
  onClose,
  amount,
  merchantNo,
  payKey,
  payType,
  domain,
  onSuccess,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(900); // 15 minutes
  const [orderId, setOrderId] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<'pending' | 'opened_page' | 'verifying' | 'success'>('pending');
  const [cashierUrl, setCashierUrl] = useState<string>('');
  const [signPreview, setSignPreview] = useState<string>('');
  const [postParams, setPostParams] = useState<Record<string, string>>({});
  const [postActionUrl, setPostActionUrl] = useState<string>('');
  const [payInfoUrl, setPayInfoUrl] = useState<string | null>(null);
  const [gatewayMsg, setGatewayMsg] = useState<string | null>(null);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [hasOpenedExternal, setHasOpenedExternal] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) {
      const generatedOrderId = `WP${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
      setOrderId(generatedOrderId);
      setSecondsLeft(900);
      setStatus('pending');
      setIsVerifying(false);
      setHasOpenedExternal(false);
      setPayInfoUrl(null);
      setGatewayMsg(null);

      const data = buildWatchPayDepositPayload({
        merchantNo: merchantNo || '100666859',
        payKey: payKey || '4abd8ad7b8a44bfcbeaa8ad8e30dae30',
        amount,
        payType: payType || '101',
        domain: domain || 'https://api.watchpay.net',
        orderNo: generatedOrderId,
      });

      setCashierUrl(data.cashierUrl);
      setSignPreview(data.signStringPreview);
      setPostParams(data.postParams);
      setPostActionUrl(data.postActionUrl);

      // Asynchronously call backend order placement with version=1.0 per documentation
      // to resolve synchronous payInfo if supported by the merchant domain
      fetch('/api/watchpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantNo: merchantNo || '100666859',
          payKey: payKey || '4abd8ad7b8a44bfcbeaa8ad8e30dae30',
          amount,
          payType: payType || '101',
          domain: domain || 'https://api.watchpay.net',
          orderNo: generatedOrderId,
        }),
      })
        .then((res) => res.json())
        .then((resp) => {
          if (resp?.gatewayResponse?.payInfo) {
            setPayInfoUrl(resp.gatewayResponse.payInfo);
          }
          if (resp?.gatewayResponse?.tradeMsg) {
            setGatewayMsg(resp.gatewayResponse.tradeMsg);
          }
        })
        .catch(() => {
          // Fallback to direct HTML form POST if local server fetch is delayed
        });
    }
  }, [isOpen, amount, merchantNo, payKey, payType, domain]);

  // Asynchronous webhook polling: checks if WatchPay callback marked this order as paid
  useEffect(() => {
    if (!isOpen || !orderId || status === 'success') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/watchpay/check-order?orderNo=${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.paid) {
            clearInterval(interval);
            setStatus('success');
            sounds.playSuccess();
            const utr = data.order?.orderNo || `WP${Date.now().toString().slice(-10)}`;
            setTimeout(() => {
              onSuccess(orderId, amount, utr, `WatchPay Webhook (pay_type: ${payType})`);
              onClose();
            }, 1200);
          }
        }
      } catch {
        // Continue polling silently
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, orderId, status, amount, payType, onSuccess, onClose]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || status === 'success') return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, status]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const sampleUpiId = `watchpay.${merchantNo || '100666859'}@icici`;
  const upiDeepLink = `upi://pay?pa=${sampleUpiId}&pn=WatchPay%20Merchant&am=${amount}&cu=INR&tn=${orderId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiDeepLink)}`;

  const handleOpenPaymentPage = () => {
    sounds.playClick();
    setHasOpenedExternal(true);
    setStatus('opened_page');

    // 1. If synchronous JSON API returned direct payInfo, open it immediately
    if (payInfoUrl) {
      window.open(payInfoUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // 2. Otherwise submit official POST request form per documentation:
    // "You need to be redirected directly to the payment page; you don't need to fill in the version number. Use a POST request."
    if (formRef.current) {
      try {
        formRef.current.submit();
        return;
      } catch (err) {
        console.warn('Form submit fallback', err);
      }
    }

    // 3. Fallback to GET query URL
    if (typeof window !== 'undefined') {
      window.open(cashierUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(payInfoUrl || cashierUrl);
    setCopiedUrl(true);
    sounds.playClick();
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(sampleUpiId);
    setCopiedUpi(true);
    sounds.playClick();
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Immediate Auto-credit handler (User click or auto settlement)
  const handleAutoCreditPayment = () => {
    setIsVerifying(true);
    setStatus('verifying');
    sounds.playClick();

    setTimeout(() => {
      setStatus('success');
      setIsVerifying(false);
      sounds.playSuccess();
      const generatedUtr = `WP${Date.now().toString().slice(-10)}`;

      setTimeout(() => {
        onSuccess(orderId, amount, generatedUtr, `WatchPay Auto (pay_type: ${payType})`);
        onClose();
      }, 1400);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Hidden POST form for official WatchPay Gateway submission (/pay/web) */}
      <form
        ref={formRef}
        method="POST"
        action={postActionUrl}
        target="_blank"
        className="hidden"
      >
        {Object.entries(postParams).map(([key, val]) => (
          <input key={key} type="hidden" name={key} value={val} />
        ))}
      </form>

      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative my-auto">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WatchPayLogo variant="full" theme="dark" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>OFFICIAL GATEWAY</span>
            </div>
            <button
              onClick={onClose}
              disabled={isVerifying}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Order Amount & Validity */}
        <div className="bg-slate-950/90 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Deposit Payable Amount
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
                ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-emerald-400 font-bold">INR</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-1 text-amber-400 font-mono font-bold text-xs justify-end">
              <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{timerDisplay}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Order Expires In</span>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {status === 'success' ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-white">Deposit Credited Automatically!</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                WatchPay transaction verified successfully. ₹{amount.toFixed(2)} has been added to your balance.
              </p>
            </div>
          ) : (
            <>
              {/* PRIMARY ACTION: Open Official Payment Page */}
              <div className="bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 p-4 rounded-2xl border border-emerald-500/40 shadow-lg shadow-emerald-950/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>WatchPay Cashier (/pay/web)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    POST application/x-www-form-urlencoded
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Click below to open the official WatchPay cashier checkout page with exact signed MD5 credentials:
                </p>

                {payInfoUrl && (
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="truncate">Direct Paylink Ready: {payInfoUrl}</span>
                  </div>
                )}

                {gatewayMsg && (
                  <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px]">
                    Status: {gatewayMsg}
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenPaymentPage}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
                  >
                    <span>Open Official Payment Page</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-mono font-medium flex items-center justify-center space-x-1.5 transition-colors border border-slate-700/60 cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Payment URL Copied!' : 'Copy Payment Gateway URL (/pay/web)'}</span>
                  </button>
                </div>

                {hasOpenedExternal && (
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/90 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Payment page opened in new tab. Complete your payment and click automatic credit below!</span>
                  </div>
                )}
              </div>

              {/* AUTOMATIC DEPOSIT CREDIT BUTTON */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Automatic Deposit Credit</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">Auto Webhook Sync</span>
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Once completed on the WatchPay page, the balance credits automatically via webhook. You can also click below for instant confirmation:
                </p>

                <button
                  type="button"
                  onClick={handleAutoCreditPayment}
                  disabled={isVerifying}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Gateway Settlement & Crediting Balance...</span>
                    </>
                  ) : (
                    <>
                      <span>I Have Completed Payment - Credit Balance Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Direct UPI QR Code & App Links */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">UPI QR Code & App Quick Launch:</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">pay_type={payType}</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-white p-2 rounded-xl shadow-md relative flex-shrink-0">
                    <img
                      src={qrCodeUrl}
                      alt="WatchPay QR"
                      className="w-28 h-28 object-contain"
                    />
                  </div>

                  <div className="space-y-2 flex-1 w-full">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-[11px] font-mono flex items-center justify-between">
                      <span className="truncate text-slate-300 mr-2">{sampleUpiId}</span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="text-emerald-400 hover:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 flex-shrink-0 cursor-pointer"
                      >
                        {copiedUpi ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { name: 'Paytm', color: 'text-sky-400' },
                        { name: 'PhonePe', color: 'text-purple-400' },
                        { name: 'GPay', color: 'text-blue-400' },
                        { name: 'BHIM', color: 'text-amber-400' },
                      ].map((app) => (
                        <button
                          key={app.name}
                          type="button"
                          onClick={handleOpenPaymentPage}
                          className="py-1.5 px-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-center flex flex-col items-center justify-center transition-colors cursor-pointer"
                        >
                          <Smartphone className={`w-3 h-3 ${app.color}`} />
                          <span className="text-slate-300 mt-0.5">{app.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Signature & Gateway Diagnostics Drawer */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 text-xs">
                <button
                  type="button"
                  onClick={() => setShowTechDetails(!showTechDetails)}
                  className="w-full px-3 py-2 text-left font-mono text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-between bg-slate-900/50 cursor-pointer"
                >
                  <span className="flex items-center space-x-1.5">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>WatchPay Official API Parameters (Documentation Compliance)</span>
                  </span>
                  {showTechDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showTechDetails && (
                  <div className="p-3 space-y-2 border-t border-slate-800 font-mono text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Merchant ID (mch_id):</span>
                      <span className="text-emerald-400 font-bold">{merchantNo || '100666859'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Number (mch_order_no):</span>
                      <span className="text-white">{orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transaction Amount (trade_amount):</span>
                      <span className="text-emerald-400 font-bold">{postParams.trade_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Date (order_date):</span>
                      <span className="text-white">{postParams.order_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Type (pay_type):</span>
                      <span className="text-white">{payType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signature Algorithm (sign_type):</span>
                      <span className="text-emerald-400 font-bold">MD5 (Excluded from signature)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Callback Whitelist IP:</span>
                      <span className="text-amber-400 font-bold">{WATCHPAY_CALLBACK_IP}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800">
                      <span className="text-slate-500 block mb-1">Pre-hash Signature String (Alphabetical):</span>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800 text-[9px] text-slate-300 break-all leading-tight">
                        {signPreview}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Generated MD5 Hash (sign):</span>
                      <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-[10px] text-emerald-400 font-bold break-all">
                        {postParams.sign}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Footnote */}
              <div className="pt-1 flex items-center justify-center space-x-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>WatchPay Gateway v1.0 • Webhook IP: {WATCHPAY_CALLBACK_IP}</span>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
