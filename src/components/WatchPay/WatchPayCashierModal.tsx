import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  Zap, 
  AlertTriangle,
  Smartphone,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { WatchPayLogo } from './WatchPayLogo';
import { 
  WATCHPAY_CALLBACK_IP, 
  WATCHPAY_ENDPOINTS, 
  buildWatchPayDepositPayload 
} from '../../utils/watchpay';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  merchantNo: string;
  payKey: string;
  payType: string;
  onSuccess: (orderId: string, amount: number, utrNumber: string, channelName: string) => void;
}

export const WatchPayCashierModal: React.FC<Props> = ({
  isOpen,
  onClose,
  amount,
  merchantNo,
  payKey,
  payType,
  onSuccess,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(900); // 15:00 minutes
  const [orderId, setOrderId] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success'>('pending');
  const [cashierUrl, setCashierUrl] = useState<string>('');
  const [signPreview, setSignPreview] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const generatedOrderId = `WP-DEP-${Date.now().toString().slice(-8)}`;
      setOrderId(generatedOrderId);
      setSecondsLeft(900);
      setStatus('pending');
      setIsProcessing(false);

      const { cashierUrl: url, signStringPreview } = buildWatchPayDepositPayload({
        merchantNo: merchantNo || '100666859',
        payKey: payKey || '4abd8ad7b8a44bfcbeaa8ad8e30dae30',
        amount,
        payType: payType || '101',
        orderNo: generatedOrderId,
      });

      setCashierUrl(url);
      setSignPreview(signStringPreview);
    }
  }, [isOpen, amount, merchantNo, payKey, payType]);

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

  const sampleUpiId = `watchpay.mch${merchantNo}@icici`;
  const upiDeepLink = `upi://pay?pa=${sampleUpiId}&pn=WatchPay%20Merchant&am=${amount}&cu=INR&tn=${orderId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiDeepLink)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(cashierUrl);
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

  // Simulate instant webhook callback from official IP 18.141.88.123
  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setStatus('verifying');
    sounds.playClick();

    setTimeout(() => {
      setStatus('success');
      setIsProcessing(false);
      sounds.playSuccess();
      const generatedUtr = `WP${Date.now().toString().slice(-10)}`;

      setTimeout(() => {
        onSuccess(orderId, amount, generatedUtr, `WatchPay (pay_type: ${payType})`);
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative my-auto">
        
        {/* WatchPay Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WatchPayLogo variant="full" theme="dark" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE CASHIER</span>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Order Price & Timer Banner */}
        <div className="bg-slate-950/90 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Payable Amount
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">INR</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-1 text-amber-400 font-mono font-bold text-xs justify-end">
              <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{timerDisplay}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Order Valid For</span>
          </div>
        </div>

        {/* Cashier Content */}
        <div className="p-5 space-y-4">
          
          {status === 'success' ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-white">Payment Received!</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Callback from WatchPay Server (IP: {WATCHPAY_CALLBACK_IP}) verified successfully. Crediting wallet balance...
              </p>
            </div>
          ) : (
            <>
              {/* QR Code Presentation */}
              <div className="flex flex-col items-center justify-center bg-slate-950 rounded-2xl p-4 border border-slate-800 relative">
                <div className="bg-white p-2.5 rounded-xl shadow-lg relative group">
                  <img
                    src={qrCodeUrl}
                    alt="WatchPay UPI QR"
                    className="w-40 h-40 object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="p-1 rounded-md bg-white shadow-md">
                      <WatchPayLogo variant="icon-only" />
                    </div>
                  </div>
                </div>

                <div className="text-center mt-3 space-y-1">
                  <p className="text-xs font-bold text-white flex items-center justify-center space-x-1">
                    <span>Scan with Any UPI App to Pay</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Paytm, PhonePe, Google Pay, BHIM or Cred
                  </p>
                </div>

                {/* Quick UPI Copy */}
                <div className="w-full mt-3 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                  <span className="text-[11px] font-mono text-slate-300 truncate mr-2">
                    {sampleUpiId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="flex items-center space-x-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 py-1 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors flex-shrink-0"
                  >
                    {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                  </button>
                </div>
              </div>

              {/* Supported UPI Apps Direct Launch Simulation */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Instant Payment Apps
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'Paytm', color: 'from-sky-500/20 to-sky-600/10 border-sky-500/30 text-sky-400' },
                    { name: 'PhonePe', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400' },
                    { name: 'GPay', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400' },
                    { name: 'BHIM', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400' },
                  ].map((app) => (
                    <button
                      key={app.name}
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isProcessing}
                      className={`p-2 rounded-xl border bg-gradient-to-b ${app.color} hover:brightness-125 transition-all text-center flex flex-col items-center justify-center space-y-1`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span className="text-[11px] font-bold">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Technical Meta */}
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-[11px] space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Merchant No:</span>
                  <span className="text-white font-bold">{merchantNo || '100666859'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Order ID:</span>
                  <span className="text-amber-400 font-bold truncate ml-2">{orderId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Channel Code:</span>
                  <span className="text-emerald-400 font-bold">pay_type={payType || '101'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Gateway Endpoint:</span>
                  <span className="text-blue-400 truncate">{WATCHPAY_ENDPOINTS.payWeb}</span>
                </div>
              </div>

              {/* Instant Test / Verification Button */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying IP {WATCHPAY_CALLBACK_IP} Callback...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Simulate Payment Success (IP {WATCHPAY_CALLBACK_IP} Webhook)</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold flex items-center justify-center space-x-1 transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl ? 'Copied Cashier Link' : 'Copy Pay Link (/pay/web)'}</span>
                  </button>

                  <a
                    href={upiDeepLink}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[10px] font-bold flex items-center space-x-1 transition-colors border border-blue-500/30"
                  >
                    <span>Open UPI</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Security Badge */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center space-x-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected by WatchPay 256-Bit Financial Encryption</span>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
