import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Award, 
  TrendingUp, 
  QrCode,
  MessageCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, settings, theme, showNotification } = useApp();
  const isLight = theme === 'light';

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const referralLink = `${window.location.origin}/?ref=${currentUser.referralCode}`;
  const shareText = `🚀 Join me on ${settings.platformName}! Invest in high-yield production assets with daily earnings. Use my VIP invitation code ${currentUser.referralCode} to get started: ${referralLink}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    sounds.playClick();
    showNotification('Invitation link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    sounds.playClick();
    showNotification(`Referral code ${currentUser.referralCode} copied!`, 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareWhatsApp = () => {
    sounds.playClick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`border rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200 transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${
          isLight ? 'border-slate-100' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold font-['Outfit'] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Invite & Earn 3-Tier Rebates
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Earn up to {settings.referralL1Percent + settings.referralL2Percent + settings.referralL3Percent}% tiered cash on all downline recharges
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Referral Info */}
        <div className="mt-5 space-y-4">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3.5 rounded-2xl border text-center ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total Direct Referrals</span>
              <div className={`text-xl font-black font-mono mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {currentUser.referralsCount} Members
              </div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-center ${
              isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={`text-xs ${isLight ? 'text-emerald-800' : 'text-slate-400'}`}>Commission Earned</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                ₹{currentUser.teamCommission.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Invitation Code & Link */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Your Exclusive Referral Code
              </label>
              <div className={`flex items-center justify-between border rounded-xl px-4 py-2.5 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700/80'
              }`}>
                <span className="font-mono text-lg font-black tracking-wider text-amber-500 dark:text-amber-400">
                  {currentUser.referralCode}
                </span>
                <button
                  onClick={copyCode}
                  className={`flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    isLight 
                      ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                      : 'text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20'
                  }`}
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Direct Share Link
              </label>
              <div className={`flex items-center justify-between border rounded-xl px-4 py-2 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700/80'
              }`}>
                <span className={`text-xs font-mono truncate mr-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {referralLink}
                </span>
                <button
                  onClick={copyLink}
                  className="flex items-center space-x-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 shadow-sm"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Quick Actions: WhatsApp & QR */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={shareWhatsApp}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share WhatsApp</span>
              </button>

              <button
                onClick={() => setShowQr(!showQr)}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-colors ${
                  isLight 
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4 text-indigo-500" />
                <span>{showQr ? 'Hide QR' : 'View QR Code'}</span>
              </button>
            </div>

            {/* QR Code Container */}
            {showQr && (
              <div className="pt-2 text-center animate-in fade-in duration-200">
                <div className="p-3 bg-white rounded-xl border border-indigo-200 inline-block shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(referralLink)}`}
                    alt="Referral QR Code"
                    className="w-36 h-36 mx-auto rounded"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Scan with camera or UPI app to join</p>
              </div>
            )}
          </div>

          {/* Tier Structure */}
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Multi-Level Rebate Distribution
            </span>
            <div className="space-y-2">
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                isLight 
                  ? 'bg-indigo-50/50 border-indigo-200' 
                  : 'bg-gradient-to-r from-blue-950/40 to-slate-900 border-blue-500/20'
              }`}>
                <div className="flex items-center space-x-2.5">
                  <div className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                    isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    L1
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Direct Invitations</h5>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>When your direct invite recharges</p>
                  </div>
                </div>
                <span className="font-mono text-base font-black text-indigo-600 dark:text-amber-400">{settings.referralL1Percent}% Rebate</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                isLight 
                  ? 'bg-blue-50/50 border-blue-200' 
                  : 'bg-gradient-to-r from-indigo-950/40 to-slate-900 border-indigo-500/20'
              }`}>
                <div className="flex items-center space-x-2.5">
                  <div className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                    isLight ? 'bg-blue-100 text-blue-700' : 'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    L2
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Sub-Team Member</h5>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>When L1 user invites new members</p>
                  </div>
                </div>
                <span className="font-mono text-base font-black text-blue-600 dark:text-blue-400">{settings.referralL2Percent}% Rebate</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                isLight 
                  ? 'bg-purple-50/50 border-purple-200' 
                  : 'bg-gradient-to-r from-purple-950/40 to-slate-900 border-purple-500/20'
              }`}>
                <div className="flex items-center space-x-2.5">
                  <div className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                    isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    L3
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Network Member</h5>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>When L2 user invites new members</p>
                  </div>
                </div>
                <span className="font-mono text-base font-black text-purple-600 dark:text-purple-400">{settings.referralL3Percent}% Rebate</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
