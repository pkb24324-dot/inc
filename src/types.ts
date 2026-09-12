export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'dividend' | 'referral' | 'spin_reward' | 'checkin' | 'bonus';

export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: TransactionType;
  amount: number;
  fee?: number;
  netAmount?: number;
  status: TransactionStatus;
  method?: string; // 'UPI', 'Bank Transfer', 'USDT'
  utrNumber?: string; // 12-digit reference for deposits
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
    upiId?: string;
  };
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
  description: string;
  approvedBy?: string;
  rrn?: string; // Bank Reference / IMPS RRN
  orderId?: string; // Unique Order Ref
  channel?: string; // PhonePe, GPay, Paytm, Instant QR, IMPS, NEFT
  subType?: 'dividend' | 'referral' | 'checkin' | 'spin' | 'voucher' | 'vip_grant';
  proofHash?: string; // Cryptographic validation hash
  runningBalance?: number; // Ledger balance after transaction
}

export type RecordCategory = 'recharge' | 'income' | 'withdrawal' | 'all' | 'investment';

export type PlanCategory = 'normal' | 'vip' | 'high_return' | 'flash';
export type CycleUnit = 'minute' | 'hour' | 'day';
export type ThemeMode = 'dark' | 'light';

export interface InvestmentPlan {
  id: string;
  name: string;
  category: PlanCategory;
  badge: string;
  price: number;
  dailyIncome: number;
  cycleDays: number;
  cycleDuration?: number;
  cycleUnit?: CycleUnit;
  totalRevenue: number;
  imageUrl: string;
  popular?: boolean;
  isActive: boolean;
  minVipLevel?: number;
  description: string;
  totalPurchasedCount: number;
}

export interface UserInvestment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  investedAmount: number;
  dailyIncome: number;
  totalReturn: number;
  cycleDays: number;
  cycleDuration?: number;
  cycleUnit?: CycleUnit;
  daysPassed: number;
  earnedSoFar: number;
  lastClaimDate: string; // ISO date
  startDate: string;
  endDate: string;
  status: 'active' | 'completed';
  canClaimToday: boolean;
  isFlash?: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
  vipLevel: number;
  balance: number; // Available withdrawable/investable balance
  totalRecharge: number;
  totalWithdrawn: number;
  totalEarned: number;
  spinChances: number;
  referralCode: string;
  referredBy?: string;
  referralsCount: number;
  teamCommission: number;
  claimableCommission?: number;
  claimedMilestones?: number[];
  isFrozen: boolean;
  createdAt: string;
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
    upiId: string;
  };
}

export type AdminTab = 
  | 'dashboard' 
  | 'deposits' 
  | 'withdrawals' 
  | 'users' 
  | 'plans' 
  | 'fraud' 
  | 'vouchers' 
  | 'broadcast' 
  | 'affiliate' 
  | 'settings' 
  | 'audit';

export interface GiftCode {
  id: string;
  code: string;
  amount: number;
  maxUses: number;
  usedCount: number;
  redeemedBy?: string[];
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface FraudAlert {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: 'duplicate_utr' | 'high_velocity' | 'large_withdrawal' | 'suspicious_referrals';
  severity: 'low' | 'medium' | 'critical';
  details: string;
  amount?: number;
  timestamp: string;
  resolved: boolean;
}

export interface SystemSettings {
  platformName: string;
  adminUpiId: string;
  merchantName: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  qrCodeUrl: string;
  minRecharge: number;
  maxRecharge: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  withdrawalFeePercent: number;
  dailyCheckinReward: number;
  spinCost: number;
  referralL1Percent: number;
  referralL2Percent: number;
  referralL3Percent: number;
  maintenanceMode: boolean;
  globalFreezeDeposits: boolean;
  globalFreezeWithdrawals: boolean;
  antiFraudStrictness: 'low' | 'medium' | 'strict';
  telegramSupportLink: string;
  whatsappSupportLink: string;
  broadcastNotice: string;
  broadcastType: 'info' | 'warning' | 'promo' | 'celebration';
  // WatchPay Gateway Configuration
  watchpayEnabled?: boolean;
  watchpayDomain?: string;
  watchpayMerchantNo?: string;
  watchpayPayKey?: string;
  watchpayPayType?: string;
  watchpayCountry?: string;
  watchpayTransferKey?: string;
  watchpayCallbackIp?: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  targetId: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface IncomeCelebrationData {
  title: string;
  amount: number;
  source: 'dividend' | 'referral' | 'milestone' | 'spin' | 'checkin' | 'voucher' | 'bulk_dividend';
  sourceTitle: string;
  planName?: string;
  dayProgress?: string;
  tierLevel?: number;
  referralCount?: number;
  bonusTitle?: string;
  newBalance?: number;
  timestamp?: string;
  txId?: string;
}
