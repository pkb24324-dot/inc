import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Wallet, 
  CreditCard, 
  Download, 
  ShieldCheck, 
  FileText,
  ChevronRight, 
  Building2, 
  Lock, 
  TrendingUp, 
  RotateCcw, 
  Layers, 
  Zap, 
  CheckCircle2, 
  BadgeCheck, 
  Settings, 
  KeyRound,
  ArrowRight,
  Palette,
  Award,
  X,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { RechargeModal } from './RechargeModal';
import { WithdrawModal } from './WithdrawModal';
import { AdvancedProfileModal } from './AdvancedProfileModal';
import { ProfessionalAmount } from '../common/ProfessionalAmount';

type CardTheme = 'sapphire' | 'gold' | 'emerald' | 'ruby' | 'amethyst';

export const ProfileView: React.FC = () => {
  const { 
    currentUser, 
    setViewMode, 
    resetToDefaults,
    openRecordsModal,
    setAdminAuthenticated,
    switchUserAccount,
    showNotification,
    logoutUser,
    theme
  } = useApp();

  const isLight = theme === 'light';

  const [showMobile, setShowMobile] = useState(false);
  const [showPan, setShowPan] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAdvancedProfileOpen, setIsAdvancedProfileOpen] = useState(false);
  const [advancedProfileTab, setAdvancedProfileTab] = useState<'personal' | 'kyc' | 'bank' | 'security'>('personal');
  
  // Admin authentication dialog state
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === '8888' || adminPinInput === '1234') {
      sounds.playSuccess();
      setAdminAuthenticated(true);
      switchUserAccount('usr-admin-001');
      setViewMode('admin');
      setIsAdminAuthModalOpen(false);
      setAdminPinInput('');
      setAdminPinError('');
      showNotification('Admin Authenticated Successfully', 'success');
    } else {
      sounds.playError();
      setAdminPinError('Invalid Admin Passcode. Access denied.');
    }
  };

  // Custom Card Theme state (Vibrant Rich Colors replacing the old dull black card)
  const [cardTheme, setCardTheme] = useState<CardTheme>(() => {
    return (localStorage.getItem('user_profile_card_theme') as CardTheme) || 'gold';
  });

  const handleSetCardTheme = (t: CardTheme) => {
    setCardTheme(t);
    localStorage.setItem('user_profile_card_theme', t);
  };

  // Luxury Card themes definitions - bright, rich, premium colors
  const themeStyles = {
    gold: {
      outerGradient: 'bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-600',
      border: 'border-yellow-200/80 shadow-2xl shadow-amber-500/30',
      glow: 'bg-amber-300/40',
      accentColor: 'text-amber-100',
      innerBox: 'bg-amber-950/40 backdrop-blur-md border-amber-300/40',
      chipBg: 'from-yellow-200 to-amber-400',
      name: 'Imperial Gold',
    },
    sapphire: {
      outerGradient: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-700',
      border: 'border-blue-200/70 shadow-2xl shadow-blue-600/30',
      glow: 'bg-blue-300/40',
      accentColor: 'text-blue-100',
      innerBox: 'bg-blue-950/40 backdrop-blur-md border-blue-300/40',
      chipBg: 'from-amber-300 to-yellow-500',
      name: 'Royal Sapphire',
    },
    emerald: {
      outerGradient: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700',
      border: 'border-emerald-200/70 shadow-2xl shadow-emerald-600/30',
      glow: 'bg-emerald-300/40',
      accentColor: 'text-emerald-100',
      innerBox: 'bg-emerald-950/40 backdrop-blur-md border-emerald-300/40',
      chipBg: 'from-emerald-200 to-teal-400',
      name: 'Jade Emerald',
    },
    ruby: {
      outerGradient: 'bg-gradient-to-br from-rose-600 via-red-600 to-pink-700',
      border: 'border-rose-200/70 shadow-2xl shadow-rose-600/30',
      glow: 'bg-rose-300/40',
      accentColor: 'text-rose-100',
      innerBox: 'bg-rose-950/40 backdrop-blur-md border-rose-300/40',
      chipBg: 'from-amber-200 to-yellow-400',
      name: 'Royal Ruby',
    },
    amethyst: {
      outerGradient: 'bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700',
      border: 'border-purple-200/70 shadow-2xl shadow-purple-600/30',
      glow: 'bg-purple-300/40',
      accentColor: 'text-purple-100',
      innerBox: 'bg-purple-950/40 backdrop-blur-md border-purple-300/40',
      chipBg: 'from-pink-300 to-purple-400',
      name: 'Cosmic Violet',
    }
  };

  const currentTheme = themeStyles[cardTheme];

  return (
    <div className="pb-28 max-w-xl mx-auto px-3.5 pt-3 space-y-3.5">
      
      {/* Luxury Vibrant Profile Card (Replacing the old dull black card) */}
      <div className={`${currentTheme.outerGradient} ${currentTheme.border} border rounded-3xl p-4.5 relative overflow-hidden transition-all duration-300 text-white`}>
        
        {/* Decorative Ambient Radiance */}
        <div className={`absolute -top-14 -right-14 w-44 h-44 ${currentTheme.glow} rounded-full blur-3xl pointer-events-none`} />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Metallic Row with Card Chip & Color Swatches */}
        <div className="flex items-center justify-between pb-3 border-b border-white/20 relative z-10">
          <div className="flex items-center space-x-2">
            {/* Metallic Smart Card Chip */}
            <div className={`w-8 h-6 rounded-md bg-gradient-to-tr ${currentTheme.chipBg} p-0.5 shadow-md flex flex-col justify-between`}>
              <div className="w-full h-0.5 bg-black/20 rounded" />
              <div className="flex justify-between px-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
              </div>
              <div className="w-full h-0.5 bg-black/20 rounded" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase text-white font-mono drop-shadow">
              VIP PRIVILEGE PASS
            </span>
          </div>

          {/* Quick Color Theme Switcher */}
          <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
            <Palette className="w-3 h-3 text-white/90 mr-0.5" />
            <button
              onClick={() => handleSetCardTheme('gold')}
              title="Imperial Gold"
              className={`w-3.5 h-3.5 rounded-full bg-amber-400 transition-all cursor-pointer ${cardTheme === 'gold' ? 'ring-2 ring-white scale-110 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
            />
            <button
              onClick={() => handleSetCardTheme('sapphire')}
              title="Royal Sapphire"
              className={`w-3.5 h-3.5 rounded-full bg-blue-500 transition-all cursor-pointer ${cardTheme === 'sapphire' ? 'ring-2 ring-white scale-110 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
            />
            <button
              onClick={() => handleSetCardTheme('emerald')}
              title="Jade Emerald"
              className={`w-3.5 h-3.5 rounded-full bg-emerald-400 transition-all cursor-pointer ${cardTheme === 'emerald' ? 'ring-2 ring-white scale-110 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
            />
            <button
              onClick={() => handleSetCardTheme('ruby')}
              title="Royal Ruby"
              className={`w-3.5 h-3.5 rounded-full bg-rose-500 transition-all cursor-pointer ${cardTheme === 'ruby' ? 'ring-2 ring-white scale-110 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
            />
            <button
              onClick={() => handleSetCardTheme('amethyst')}
              title="Cosmic Violet"
              className={`w-3.5 h-3.5 rounded-full bg-purple-400 transition-all cursor-pointer ${cardTheme === 'amethyst' ? 'ring-2 ring-white scale-110 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
            />
          </div>
        </div>

        {/* User Identity Details */}
        <div className="flex items-center space-x-3 pt-3 relative z-10">
          <div className="relative">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/30 border-2 border-white/40">
              {currentUser.name.charAt(0)}
            </div>
            <button
              onClick={() => {
                setAdvancedProfileTab('personal');
                setIsAdvancedProfileOpen(true);
              }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md hover:bg-slate-100 transition-colors cursor-pointer border-2 border-slate-900"
              title="Edit Profile"
            >
              <Settings className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              <h2 className="text-base font-extrabold text-white font-['Outfit'] truncate tracking-wide drop-shadow-sm">
                {currentUser.name}
              </h2>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white text-slate-950 font-mono shadow-sm flex items-center space-x-1">
                <Award className="w-2.5 h-2.5 text-amber-600" />
                <span>VIP {currentUser.vipLevel}</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 flex items-center space-x-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" />
                <span>KYC OK</span>
              </span>
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-xs text-white/90 font-mono">
                +91 {showMobile ? currentUser.phone : `${currentUser.phone.slice(0, 2)}••••••${currentUser.phone.slice(-2)}`}
              </span>
              <button
                type="button"
                onClick={() => setShowMobile(!showMobile)}
                className="text-white/70 hover:text-white p-0.5 transition-colors cursor-pointer"
                title={showMobile ? "Hide Mobile Number" : "Show Mobile Number"}
              >
                {showMobile ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            <p className="text-[10px] text-white/80 mt-0.5 truncate">
              ID: <span className="font-mono text-white font-bold">{currentUser.id}</span> • Ref: <span className="font-mono text-yellow-200 font-black">{currentUser.referralCode}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setAdvancedProfileTab('personal');
              setIsAdvancedProfileOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-bold flex items-center space-x-1 transition-all active:scale-95 cursor-pointer flex-shrink-0 backdrop-blur-sm"
          >
            <Settings className="w-3.5 h-3.5 text-white" />
            <span>Manage</span>
          </button>
        </div>

        {/* Security & KYC Quick Status Strip */}
        <div className="mt-3.5 pt-2.5 border-t border-white/15 grid grid-cols-3 gap-1.5 relative z-10">
          <button
            onClick={() => {
              setAdvancedProfileTab('kyc');
              setIsAdvancedProfileOpen(true);
            }}
            className="p-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-left hover:bg-white/25 transition-all group cursor-pointer"
          >
            <span className="text-[8.5px] text-white/80 block">KYC Status</span>
            <div className="flex items-center space-x-1 text-emerald-200 font-bold text-[11px] mt-0.5">
              <BadgeCheck className="w-3 h-3 text-emerald-300" />
              <span>Verified</span>
            </div>
          </button>

          <button
            onClick={() => {
              setAdvancedProfileTab('bank');
              setIsAdvancedProfileOpen(true);
            }}
            className="p-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-left hover:bg-white/25 transition-all group cursor-pointer"
          >
            <span className="text-[8.5px] text-white/80 block">Payout Account</span>
            <div className="flex items-center space-x-1 text-white font-bold text-[11px] mt-0.5">
              <Building2 className="w-3 h-3 text-white/90" />
              <span>{currentUser.bankDetails?.bankName ? 'Active' : 'Bind Bank'}</span>
            </div>
          </button>

          <button
            onClick={() => {
              setAdvancedProfileTab('security');
              setIsAdvancedProfileOpen(true);
            }}
            className="p-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-left hover:bg-white/25 transition-all group cursor-pointer"
          >
            <span className="text-[8.5px] text-white/80 block">Security PIN</span>
            <div className="flex items-center space-x-1 text-yellow-100 font-bold text-[11px] mt-0.5">
              <KeyRound className="w-3 h-3 text-yellow-300" />
              <span>Protected</span>
            </div>
          </button>
        </div>

        {/* Wallet Balance Card (Replaced flat black with luxury radiant glassmorphism) */}
        <div className={`mt-3.5 p-3.5 ${currentTheme.innerBox} rounded-2xl border space-y-2.5 relative z-10 shadow-lg`}>
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available Wallet Balance</span>
              <div className="mt-0.5">
                <ProfessionalAmount
                  amount={currentUser.balance}
                  size="xl"
                  color="emerald"
                  showCurrencyBadge={true}
                />
              </div>
            </div>
            <button
              onClick={() => openRecordsModal('all')}
              className="text-[10px] font-bold text-blue-300 hover:text-white flex items-center space-x-1 py-1.5 px-2.5 rounded-lg bg-blue-500/20 border border-blue-400/30 cursor-pointer transition-colors"
            >
              <FileText className="w-3 h-3" />
              <span>Passbook</span>
            </button>
          </div>

          {/* Metric Gateways */}
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10 text-center">
            <button
              onClick={() => openRecordsModal('recharge')}
              className="p-1.5 rounded-xl hover:bg-white/5 transition-all group text-center active:scale-95 cursor-pointer"
            >
              <span className="text-[9px] text-slate-300 block group-hover:text-blue-300">Total Recharge</span>
              <ProfessionalAmount
                amount={currentUser.totalRecharge}
                size="xs"
                color="white"
                className="mt-0.5 justify-center"
              />
              <span className="text-[8.5px] text-blue-400 font-bold block mt-0.5">Records &rarr;</span>
            </button>
            <button
              onClick={() => openRecordsModal('withdrawal')}
              className="p-1.5 rounded-xl hover:bg-white/5 transition-all group text-center active:scale-95 cursor-pointer"
            >
              <span className="text-[9px] text-slate-300 block group-hover:text-amber-300">Total Withdrawn</span>
              <ProfessionalAmount
                amount={currentUser.totalWithdrawn}
                size="xs"
                color="amber"
                className="mt-0.5 justify-center"
              />
              <span className="text-[8.5px] text-amber-400 font-bold block mt-0.5">Records &rarr;</span>
            </button>
            <button
              onClick={() => openRecordsModal('income')}
              className="p-1.5 rounded-xl hover:bg-white/5 transition-all group text-center active:scale-95 cursor-pointer"
            >
              <span className="text-[9px] text-slate-300 block group-hover:text-emerald-300">Total Income</span>
              <ProfessionalAmount
                amount={currentUser.totalEarned}
                size="xs"
                color="emerald"
                className="mt-0.5 justify-center"
              />
              <span className="text-[8.5px] text-emerald-400 font-bold block mt-0.5">Records &rarr;</span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex space-x-2 pt-1.5">
            <button
              onClick={() => setIsRechargeOpen(true)}
              className="flex-1 py-2.5 rounded-xl btn-chamko-blue text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Recharge</span>
            </button>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="flex-1 py-2.5 rounded-xl btn-chamko-gold text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

      </div>

      {/* DEDICATED SEPARATE RECORDS HUB: RECHARGE, INCOME & WITHDRAWAL */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className={`text-[11px] font-black uppercase tracking-wider flex items-center space-x-1.5 ${
            isLight ? 'text-slate-700' : 'text-slate-300'
          }`}>
            <Layers className="w-3 h-3 text-blue-500" />
            <span>Financial Records (अभिलेख)</span>
          </span>
          <span className="text-[9px] text-slate-500 font-mono">Audit Passbook</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* 1. Recharge Record Card */}
          <button
            onClick={() => openRecordsModal('recharge')}
            className={`border rounded-2xl p-2.5 text-left transition-all group flex flex-col justify-between shadow-sm active:scale-98 cursor-pointer ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-900' 
                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-blue-500/50 text-white'
            }`}
          >
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold group-hover:text-blue-500 transition-colors">
                Recharge Record
              </h4>
              <p className="text-[8px] text-slate-400 mt-0.5">रिचार्ज रिकॉर्ड</p>
              <div className="mt-1.5 text-[8.5px] font-mono text-blue-500 font-bold flex items-center space-x-0.5">
                <span>UTR & Slips</span>
                <ChevronRight className="w-2 h-2" />
              </div>
            </div>
          </button>

          {/* 2. Income Record Card */}
          <button
            onClick={() => openRecordsModal('income')}
            className={`border rounded-2xl p-2.5 text-left transition-all group flex flex-col justify-between shadow-sm active:scale-98 cursor-pointer ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-400 text-slate-900' 
                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-emerald-500/50 text-white'
            }`}
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold group-hover:text-emerald-500 transition-colors">
                Income Record
              </h4>
              <p className="text-[8px] text-slate-400 mt-0.5">इनकम रिकॉर्ड</p>
              <div className="mt-1.5 text-[8.5px] font-mono text-emerald-500 font-bold flex items-center space-x-0.5">
                <span>Daily & Returns</span>
                <ChevronRight className="w-2 h-2" />
              </div>
            </div>
          </button>

          {/* 3. Withdrawal Record Card */}
          <button
            onClick={() => openRecordsModal('withdrawal')}
            className={`border rounded-2xl p-2.5 text-left transition-all group flex flex-col justify-between shadow-sm active:scale-98 cursor-pointer ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-400 text-slate-900' 
                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-amber-500/50 text-white'
            }`}
          >
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Download className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold group-hover:text-amber-500 transition-colors">
                Withdrawal Record
              </h4>
              <p className="text-[8px] text-slate-400 mt-0.5">निकासी रिकॉर्ड</p>
              <div className="mt-1.5 text-[8.5px] font-mono text-amber-500 font-bold flex items-center space-x-0.5">
                <span>IMPS Payouts</span>
                <ChevronRight className="w-2 h-2" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Account Shortcuts */}
      <div className={`border rounded-3xl p-2.5 shadow-md space-y-0.5 ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <button
          onClick={() => {
            setAdvancedProfileTab('personal');
            setIsAdvancedProfileOpen(true);
          }}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors text-left cursor-pointer ${
            isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 truncate">
              <h4 className="text-[10.5px] font-bold truncate">Personal Profile & Contact</h4>
              <p className="text-[9px] text-slate-400 truncate">
                {currentUser.name} • {currentUser.email || 'Configure Email'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
        </button>

        <button
          onClick={() => {
            setAdvancedProfileTab('kyc');
            setIsAdvancedProfileOpen(true);
          }}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors text-left cursor-pointer ${
            isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <BadgeCheck className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 truncate">
              <h4 className="text-[10.5px] font-bold truncate">KYC & Tax Registration (PAN / Aadhaar)</h4>
              <p className="text-[9px] text-emerald-500 font-medium truncate flex items-center space-x-1.5">
                <span>
                  PAN: {showPan 
                    ? (currentUser.panNumber || 'ABCDE1234F') 
                    : (currentUser.panNumber ? `${currentUser.panNumber.slice(0, 3)}•••••${currentUser.panNumber.slice(-2)}` : 'ABC•••••4F')}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPan(!showPan);
                  }}
                  className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-300 p-0.5 cursor-pointer ml-1"
                  title={showPan ? "Hide PAN" : "Show PAN"}
                >
                  {showPan ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </span>
                <span>• UID: •••• {currentUser.aadhaarLast4 || '8921'}</span>
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex-shrink-0 ml-1">
            VERIFIED
          </span>
        </button>

        <button
          onClick={() => {
            setAdvancedProfileTab('bank');
            setIsAdvancedProfileOpen(true);
          }}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors text-left cursor-pointer ${
            isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 truncate">
              <h4 className="text-[10.5px] font-bold truncate">Bank Account / UPI Clearing Gateway</h4>
              <p className="text-[9px] text-slate-400 truncate">
                {currentUser.bankDetails ? `${currentUser.bankDetails.bankName || 'Bank'} (•••• ${currentUser.bankDetails.accountNumber?.slice(-4) || 'UPI'})` : 'Add Payout Account'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
        </button>

        <button
          onClick={() => {
            setAdvancedProfileTab('security');
            setIsAdvancedProfileOpen(true);
          }}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors text-left cursor-pointer ${
            isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 truncate">
              <h4 className="text-[10.5px] font-bold truncate">Fund Security PIN & 2-Factor Auth</h4>
              <p className="text-[9px] text-slate-400 truncate">
                Withdrawal protection active (4-digit PIN)
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
        </button>

        {/* Admin Access: Only visible to users with role === 'admin' */}
        {currentUser.role === 'admin' && (
          <button
            onClick={() => {
              setAdminAuthenticated(true);
              switchUserAccount('usr-admin-001');
              setViewMode('admin');
              showNotification('Master Admin Access Granted', 'success');
            }}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors text-left cursor-pointer border ${
              isLight 
                ? 'bg-purple-50/70 border-purple-200/80 hover:bg-purple-100/80' 
                : 'bg-purple-950/20 border-purple-500/30 hover:bg-purple-950/40'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 truncate">
                <h4 className="text-[10.5px] font-bold truncate text-purple-600 dark:text-purple-400">Advance Admin Console</h4>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">Manage deposits, withdrawals, and users</p>
              </div>
            </div>
            <span className="text-[8.5px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white shadow-sm flex-shrink-0 ml-1">
              Admin &rarr;
            </span>
          </button>
        )}

        {currentUser.role === 'admin' && (
          <button
            onClick={resetToDefaults}
            className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors text-left cursor-pointer ${
              isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'
              }`}>
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 truncate">
                <h4 className={`text-[10.5px] font-bold truncate ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Reset Demo Database</h4>
                <p className="text-[9px] text-slate-500 truncate">Restore factory sample transactions</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
          </button>
        )}

        {/* Universal Logout Option */}
        <button
          id="profile-logout-btn"
          onClick={() => logoutUser()}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors text-left cursor-pointer border mt-1 ${
            isLight 
              ? 'bg-red-50/60 border-red-200/80 text-red-600 hover:bg-red-100' 
              : 'bg-red-950/20 border-red-500/30 text-red-400 hover:bg-red-950/40'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 truncate">
              <h4 className="text-[10.5px] font-bold truncate">Log Out Session</h4>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                Sign out of current account ({showMobile ? currentUser.phone : `${currentUser.phone.slice(0, 2)}••••••${currentUser.phone.slice(-2)}`})
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-red-400 flex-shrink-0 ml-1" />
        </button>
      </div>

      {/* Subtle Footer */}
      <div className="pt-4 pb-2 text-center flex items-center justify-center space-x-2">
        <span className="text-[10px] text-slate-500">
          AM invest Institutional Trading • v4.2.0
        </span>
        <button
          type="button"
          onClick={() => {
            setAdminPinInput('');
            setAdminPinError('');
            setIsAdminAuthModalOpen(true);
          }}
          className="text-slate-600 hover:text-slate-400 p-1 rounded transition-colors cursor-pointer"
          title="Staff Portal"
        >
          <Lock className="w-2.5 h-2.5 opacity-30 hover:opacity-100" />
        </button>
      </div>

      {/* Discreet Staff / Admin Authentication Modal */}
      {isAdminAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xs w-full p-4 shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white">Staff Authentication</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminAuthModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Enter Administrator Security Passcode:
            </p>

            <form onSubmit={handleAdminAuthSubmit} className="space-y-3">
              <input
                type="password"
                maxLength={8}
                value={adminPinInput}
                onChange={(e) => {
                  setAdminPinInput(e.target.value);
                  setAdminPinError('');
                }}
                placeholder="Passcode"
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm text-white font-mono tracking-widest focus:outline-none focus:border-purple-500"
              />

              {adminPinError && (
                <p className="text-[10px] text-red-400 text-center font-medium">
                  {adminPinError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Verify & Enter
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
      />
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
      />
      <AdvancedProfileModal
        isOpen={isAdvancedProfileOpen}
        onClose={() => setIsAdvancedProfileOpen(false)}
        initialTab={advancedProfileTab}
      />

    </div>
  );
};
