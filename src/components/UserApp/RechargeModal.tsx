import React, { useState } from 'react';
import { WatchPayCashierModal } from '../WatchPay/WatchPayCashierModal';
import { SunpaysCashierModal } from '../Sunpays/SunpaysCashierModal';
import { useApp } from '../../context/AppContext';
import { X, Zap, ShieldCheck, ArrowRight, Smartphone, Building2 } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
}

export const RechargeModal: React.FC<Props> = ({ isOpen, onClose, defaultAmount = 700 }) => {
  const { settings, completeWatchPayDeposit } = useApp();

  const isSunpaysActive = settings.sunpaysEnabled !== false;
  const isWatchPayActive = settings.watchpayEnabled !== false;

  // Determine active default gateway internally without exposing brand names
  const initialGateway: 'sunpays' | 'watchpay' = 
    settings.activeGateway === 'watchpay' 
      ? 'watchpay' 
      : 'sunpays';

  const [selectedGateway, setSelectedGateway] = useState<'sunpays' | 'watchpay'>(initialGateway);
  const [showPicker, setShowPicker] = useState<boolean>(settings.activeGateway === 'both');

  if (!isOpen) return null;

  // If both enabled and user is in the channel selection screen
  if (showPicker) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white">Select Deposit Channel</h3>
              <p className="text-xs text-slate-400">Choose your preferred UPI / Bank clearance route</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Fast Channel 1: Express UPI */}
            <div
              onClick={() => {
                sounds.playClick();
                setSelectedGateway('sunpays');
                setShowPicker(false);
              }}
              className="p-4 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-orange-500/5 hover:border-amber-400 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold flex-shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-['Outfit']">Fast UPI Channel 1</h4>
                    <span className="text-[10px] text-amber-400 font-medium">GPay • PhonePe • Paytm • QR Pay</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  RECOMMENDED
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Direct Hosted Checkout with automatic payment detection and 30-second rapid clearance.
              </p>
              <div className="flex items-center justify-between text-[10px] text-amber-400 font-semibold pt-1">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Instant Auto-Credit • 100% Success Guarantee</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Fast Channel 2: Direct Banking UPI */}
            <div
              onClick={() => {
                sounds.playClick();
                setSelectedGateway('watchpay');
                setShowPicker(false);
              }}
              className="p-4 rounded-2xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-['Outfit']">Fast UPI Channel 2</h4>
                    <span className="text-[10px] text-emerald-400 font-medium">Direct UPI Intent & Net Banking</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  INSTANT UTR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct bank transfer with high-speed automated reconciliation & instant wallet sync.
              </p>
              <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold pt-1">
                <span className="flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>24/7 Verified Bank Clearing</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render selected gateway
  if (selectedGateway === 'sunpays' && isSunpaysActive) {
    return (
      <SunpaysCashierModal
        isOpen={isOpen}
        onClose={onClose}
        initialAmount={defaultAmount}
        onSuccess={(orderId, paidAmount, utr, gateway) => {
          completeWatchPayDeposit(orderId, paidAmount, utr, gateway);
        }}
      />
    );
  }

  return (
    <WatchPayCashierModal
      isOpen={isOpen}
      onClose={onClose}
      initialAmount={defaultAmount}
      merchantNo={settings.watchpayMerchantNo || '100666859'}
      payKey={settings.watchpayPayKey || '4abd8ad7b8a44bfcbeaa8ad8e30dae30'}
      payType={settings.watchpayPayType || '101'}
      domain={settings.watchpayDomain || 'https://api.watchglb.com'}
      onSuccess={(orderId, paidAmount, utr, gateway) => {
        completeWatchPayDeposit(orderId, paidAmount, utr, gateway);
      }}
    />
  );
};

