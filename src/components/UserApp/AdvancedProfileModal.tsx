import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Lock, 
  KeyRound, 
  User, 
  Mail, 
  Phone, 
  BadgeCheck, 
  CreditCard,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'kyc' | 'bank' | 'security' | 'personal';
}

export const AdvancedProfileModal: React.FC<Props> = ({ isOpen, onClose, initialTab = 'personal' }) => {
  const { currentUser, updateProfile, updateBankDetails, showNotification, theme } = useApp();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'personal' | 'kyc' | 'bank' | 'security'>(initialTab);

  // Personal
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || `${currentUser.phone}@capital-invest.in`);
  const [phone] = useState(currentUser.phone);

  // KYC
  const [panNumber, setPanNumber] = useState(currentUser.panNumber || 'ABCDE1234F');
  const [aadhaarLast4, setAadhaarLast4] = useState(currentUser.aadhaarLast4 || '8921');
  const [kycSubmitted, setKycSubmitted] = useState(currentUser.kycStatus === 'verified');

  // Bank
  const [accountHolder, setAccountHolder] = useState(currentUser.bankDetails?.accountHolder || currentUser.name);
  const [accountNumber, setAccountNumber] = useState(currentUser.bankDetails?.accountNumber || '919876543210');
  const [ifsc, setIfsc] = useState(currentUser.bankDetails?.ifsc || 'SBIN0001234');
  const [bankName, setBankName] = useState(currentUser.bankDetails?.bankName || 'State Bank of India');
  const [upiId, setUpiId] = useState(currentUser.bankDetails?.upiId || `${currentUser.phone}@upi`);

  // Security
  const [pin, setPin] = useState(currentUser.securityPin || '1234');
  const [showPin, setShowPin] = useState(false);
  const [twoFactor, setTwoFactor] = useState(currentUser.twoFactorEnabled !== false);

  if (!isOpen) return null;

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showNotification('Name cannot be empty', 'error');
      return;
    }
    updateProfile({ name: name.trim(), email: email.trim() });
    sounds.playSuccess();
    showNotification('Personal details updated successfully!', 'success');
  };

  const handleSaveKyc = (e: React.FormEvent) => {
    e.preventDefault();
    if (panNumber.length !== 10) {
      showNotification('PAN number must be 10 characters alphanumeric (e.g. ABCDE1234F)', 'error');
      return;
    }
    if (aadhaarLast4.length !== 4) {
      showNotification('Aadhaar last 4 digits required', 'error');
      return;
    }
    updateProfile({
      panNumber: panNumber.toUpperCase(),
      aadhaarLast4: aadhaarLast4,
      kycStatus: 'verified'
    });
    setKycSubmitted(true);
    sounds.playSuccess();
    showNotification('KYC Documents Verified by Banking Gateway!', 'success');
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountHolder.trim() || !accountNumber.trim() || !ifsc.trim() || !upiId.trim()) {
      showNotification('Please fill all banking & UPI fields', 'error');
      return;
    }
    updateBankDetails({
      accountHolder: accountHolder.trim(),
      accountNumber: accountNumber.trim(),
      ifsc: ifsc.trim().toUpperCase(),
      bankName: bankName.trim(),
      upiId: upiId.trim()
    });
    sounds.playSuccess();
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      showNotification('Security PIN must be at least 4 digits', 'error');
      return;
    }
    updateProfile({
      securityPin: pin,
      twoFactorEnabled: twoFactor
    });
    sounds.playSuccess();
    showNotification('Security settings & PIN updated successfully!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black font-['Outfit']">Advanced Profile & Security</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Level 2 Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                KYC Identity, Banking Payout Account & Security Keys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-400' : 'hover:bg-slate-800 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b text-xs font-bold overflow-x-auto ${
          isLight ? 'border-slate-200 bg-slate-100/60' : 'border-slate-800 bg-slate-900/30'
        }`}>
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 min-w-[90px] py-3 px-2 text-center border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'personal'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex-1 min-w-[90px] py-3 px-2 text-center border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'kyc'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>KYC / PAN</span>
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-1 min-w-[90px] py-3 px-2 text-center border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'bank'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Bank & UPI</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 min-w-[90px] py-3 px-2 text-center border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>Security PIN</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* 1. PERSONAL TAB */}
          {activeTab === 'personal' && (
            <form onSubmit={handleSavePersonal} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start space-x-3 text-xs text-blue-400">
                <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-blue-300">Identity Master Record</span>
                  Your account is securely tethered to your primary mobile number and VIP ID.
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                      placeholder="Enter legal name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Registered Phone (Read-Only)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      disabled
                      value={`+91 ${phone}`}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-400 font-mono text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Security Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                      placeholder="Enter email for statement dispatch"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all active:scale-98"
              >
                Save Profile Changes
              </button>
            </form>
          )}

          {/* 2. KYC TAB */}
          {activeTab === 'kyc' && (
            <form onSubmit={handleSaveKyc} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-400">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-bold block text-white">Government KYC Registry</span>
                    <span className="text-[10px] text-emerald-400/90">UIDAI & NSDL Compliant System</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  PASS
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">PAN Card Number (10 Digits)</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono uppercase tracking-wider font-bold transition-all ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                    placeholder="e.g. ABCDE1234F"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Used for TDS clearance and automated ₹50,000+ daily payout limits.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Aadhaar Linked (Last 4 Digits)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-widest font-bold transition-all ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                    placeholder="•••• 8921"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Masked verification with NPCI central registry.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all active:scale-98 flex items-center justify-center space-x-1.5"
              >
                <BadgeCheck className="w-4 h-4" />
                <span>Verify & Bind KYC Identification</span>
              </button>
            </form>
          )}

          {/* 3. BANK & UPI TAB */}
          {activeTab === 'bank' && (
            <form onSubmit={handleSaveBank} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start space-x-3 text-xs">
                <Building2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-slate-300">
                  <span className="font-bold text-white block">Immediate Payment Service (IMPS) Gateway</span>
                  Withdrawals will be transferred directly to this beneficiary account within 5-15 minutes.
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Beneficiary Account Holder Name</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-sm ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      className={`w-full px-3 py-2 rounded-xl border text-sm font-mono uppercase font-bold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">VPA / UPI ID (Instant Clearing)</label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm font-mono font-bold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-emerald-700' : 'bg-slate-900 border-slate-700 text-emerald-400'
                      }`}
                      placeholder="e.g. yourname@okhdfcbank"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all active:scale-98"
              >
                Bind Official Payout Account
              </button>
            </form>
          )}

          {/* 4. SECURITY TAB */}
          {activeTab === 'security' && (
            <form onSubmit={handleSaveSecurity} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3 text-xs text-amber-400">
                <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-300">Fund Security Password</span>
                  Required for every withdrawal clearance to safeguard your account against unauthorized access.
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    4-Digit Fund Withdrawal PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-base font-mono tracking-widest font-bold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Default test PIN: 1234</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div>
                    <span className="text-xs font-bold block">Two-Factor Authentication (2FA)</span>
                    <span className="text-[10px] text-slate-400">SMS / OTP challenge on foreign IP logins</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFactor(!twoFactor)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      twoFactor ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      twoFactor ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all active:scale-98"
              >
                Update Security Credentials
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
