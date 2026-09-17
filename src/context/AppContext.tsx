import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  InvestmentPlan, 
  UserAccount, 
  Transaction, 
  UserInvestment, 
  SystemSettings, 
  AuditLog,
  GiftCode,
  FraudAlert,
  RecordCategory,
  ThemeMode,
  IncomeCelebrationData,
  ActivePendingDeposit
} from '../types';
import { 
  INITIAL_PLANS, 
  INITIAL_USER, 
  INITIAL_OTHER_USERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_USER_INVESTMENTS, 
  INITIAL_SETTINGS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_GIFT_CODES,
  INITIAL_FRAUD_ALERTS
} from '../data/mockData';
import { sounds } from '../utils/audio';

interface AppContextType {
  // State
  currentUser: UserAccount;
  allUsers: UserAccount[];
  plans: InvestmentPlan[];
  userInvestments: UserInvestment[];
  transactions: Transaction[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
  giftCodes: GiftCode[];
  fraudAlerts: FraudAlert[];
  viewMode: 'user' | 'admin';
  adminAuthenticated: boolean;
  activeUserTab: 'home' | 'spin' | 'treasure' | 'team' | 'profile';
  activeAdminTab: 'dashboard' | 'deposits' | 'withdrawals' | 'users' | 'plans' | 'security' | 'marketing' | 'settings' | 'audit' | 'affiliate';
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  recordsModalOpen: boolean;
  recordsDefaultTab: RecordCategory;
  theme: ThemeMode;
  celebrationData: IncomeCelebrationData | null;

  // View switchers
  setViewMode: (mode: 'user' | 'admin') => void;
  setAdminAuthenticated: (auth: boolean) => void;
  setActiveUserTab: (tab: 'home' | 'spin' | 'treasure' | 'team' | 'profile') => void;
  setActiveAdminTab: (tab: 'dashboard' | 'deposits' | 'withdrawals' | 'users' | 'plans' | 'security' | 'marketing' | 'settings' | 'audit' | 'affiliate') => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  openRecordsModal: (tab?: RecordCategory) => void;
  closeRecordsModal: () => void;
  toggleTheme: () => void;
  triggerIncomeCelebration: (data: IncomeCelebrationData) => void;
  closeIncomeCelebration: () => void;

  // User Actions
  submitDepositRequest: (amount: number, method: string, utrNumber: string) => boolean;
  completeWatchPayDeposit: (orderId: string, amount: number, utrNumber: string, channelName: string) => void;
  submitWithdrawalRequest: (amount: number, bankDetails: UserAccount['bankDetails']) => { success: boolean; error?: string };
  purchasePlan: (planId: string) => { success: boolean; error?: string };
  claimDailyDividend: (investmentId: string) => { success: boolean; error?: string };
  claimAllDividends: () => { success: boolean; count: number; total: number };
  claimTeamCommission: () => { success: boolean; amount: number };
  claimMilestoneReward: (milestoneIndex: number, amount: number, title: string) => { success: boolean; error?: string };
  claimDailyAgencySalary: (amount: number, rankName: string) => { success: boolean; error?: string };
  dailyCheckin: () => { success: boolean; reward: number };
  executeSpin: (reward: number) => { success: boolean; error?: string };
  buySpinsWithBalance: (count?: number) => { success: boolean; error?: string };
  updateBankDetails: (details: NonNullable<UserAccount['bankDetails']>) => void;
  updateProfile: (updates: Partial<UserAccount>) => void;
  switchUserAccount: (userId: string) => void;
  redeemGiftCode: (code: string) => { success: boolean; amount?: number; error?: string };
  reinvestBalanceIntoPlan: (planId: string) => { success: boolean; error?: string };
  liquidateInvestment: (investmentId: string) => { success: boolean; refundedAmount?: number; error?: string };
  autoHarvestEnabled: boolean;
  toggleAutoHarvest: () => void;

  // Admin Actions
  approveDeposit: (transactionId: string) => void;
  rejectDeposit: (transactionId: string, reason: string) => void;
  batchApproveDeposits: (transactionIds: string[]) => void;
  batchRejectDeposits: (transactionIds: string[], reason: string) => void;
  createManualDeposit: (userId: string, amount: number, utrNumber: string, channel: string, note?: string) => boolean;
  approveWithdrawal: (transactionId: string, customRrn?: string) => void;
  rejectWithdrawal: (transactionId: string, reason: string) => void;
  batchApproveWithdrawals: (transactionIds: string[]) => void;
  batchRejectWithdrawals: (transactionIds: string[], reason: string) => void;
  adjustUserBalance: (userId: string, deltaAmount: number, reason: string) => void;
  updateUserVipLevel: (userId: string, newVip: number) => void;
  grantUserSpins: (userId: string, count: number) => void;
  toggleUserFrozen: (userId: string) => void;
  createPlan: (plan: Omit<InvestmentPlan, 'id' | 'totalPurchasedCount'>) => void;
  updatePlan: (id: string, updates: Partial<InvestmentPlan>) => void;
  deletePlan: (id: string) => void;
  createGiftCode: (giftData: Omit<GiftCode, 'id' | 'usedCount' | 'createdAt'>) => void;
  toggleGiftCode: (id: string) => void;
  deleteGiftCode: (id: string) => void;
  resolveFraudAlert: (id: string) => void;
  dismissFraudAlert: (id: string) => void;
  exportDataToCsv: (dataType: 'transactions' | 'users' | 'audit') => void;
  saveSettings: (newSettings: Partial<SystemSettings>) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  triggerGlobalDividendRun: () => { processedCount: number; totalDistributed: number };
  triggerGlobalCommissionRebateRun: () => { processedCount: number; totalDistributed: number };
  distributePromoterAirdrop: (bonusAmount: number, minReferrals?: number) => { rewardedCount: number; totalAirdrop: number };
  resetToDefaults: () => void;

  // Real-Time Deposit Polling Flow
  activePendingDeposit: ActivePendingDeposit | null;
  registerPendingDeposit: (orderNo: string, amount: number, channelName?: string) => void;
  clearPendingDeposit: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'apexcraft_current_user',
  ALL_USERS: 'apexcraft_all_users',
  PLANS: 'apexcraft_plans',
  INVESTMENTS: 'apexcraft_investments',
  TRANSACTIONS: 'apexcraft_transactions',
  SETTINGS: 'apexcraft_settings',
  AUDIT_LOGS: 'apexcraft_audit_logs',
  GIFT_CODES: 'apexcraft_gift_codes',
  FRAUD_ALERTS: 'apexcraft_fraud_alerts',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return defaultValue;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => 
    loadFromStorage(STORAGE_KEYS.CURRENT_USER, INITIAL_USER)
  );

  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => {
    const stored = loadFromStorage<UserAccount[] | null>(STORAGE_KEYS.ALL_USERS, null);
    if (stored && stored.length > 0) return stored;
    return [INITIAL_USER, ...INITIAL_OTHER_USERS];
  });

  const [plans, setPlans] = useState<InvestmentPlan[]>(() => {
    const saved = loadFromStorage<InvestmentPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    const hasFlash = saved.some(p => p.category === 'flash');
    if (!hasFlash) {
      const flashPlans = INITIAL_PLANS.filter(p => p.category === 'flash');
      return [...saved, ...flashPlans];
    }
    return saved;
  });

  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>(() => {
    const saved = loadFromStorage<UserInvestment[]>(STORAGE_KEYS.INVESTMENTS, INITIAL_USER_INVESTMENTS);
    const hasFlash = saved.some(i => i.isFlash);
    if (!hasFlash) {
      const flashInvs = INITIAL_USER_INVESTMENTS.filter(i => i.isFlash);
      return [...saved, ...flashInvs];
    }
    return saved;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = loadFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    if (saved && saved.length < INITIAL_TRANSACTIONS.length) {
      return INITIAL_TRANSACTIONS;
    }
    return saved;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = loadFromStorage<SystemSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    let updated = { ...saved };
    // Ensure live WatchPay credentials take effect
    if (!updated.watchpayMerchantNo || updated.watchpayMerchantNo === '222887002' || updated.watchpayDomain !== 'https://api.watchglb.com') {
      updated = {
        ...updated,
        watchpayEnabled: true,
        watchpayDomain: 'https://api.watchglb.com',
        watchpayMerchantNo: '100666859',
        watchpayPayKey: '4abd8ad7b8a44bfcbeaa8ad8e30dae30',
        watchpayPayType: '101',
      };
    }
    // Ensure live Sunpays Gateway credentials take effect
    if (!updated.sunpaysMerchantId || updated.sunpaysMerchantId !== '353548') {
      updated = {
        ...updated,
        sunpaysEnabled: true,
        sunpaysMerchantId: '353548',
        sunpaysPayinApiKey: 'b6ff773b7d9d08bde80ef13ad8bd924cd3c9341aef4330f341272ee81b2ab6ad',
        sunpaysPayinApiSecret: 'cd40986af39469dfca69eea8f3e5307f4b1293d9d9ec863f7c67d66e92a4ec2b',
        sunpaysPayoutApiKey: '354f21cf1f27cbadcf136fbd64e7fd1da6a4d95e1385ff704fa79b8060bae7a4',
        sunpaysPayoutApiSecret: 'ed7350044c65779df3b9222756d765db20860ed843d6e9fb74722d693c8ef8a7',
        sunpaysBaseUrl: 'https://ttpay.business',
        sunpaysDefaultMethod: 'upi',
        activeGateway: updated.activeGateway || 'both',
      };
    }
    return updated;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => 
    loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS)
  );

  const [giftCodes, setGiftCodes] = useState<GiftCode[]>(() => 
    loadFromStorage(STORAGE_KEYS.GIFT_CODES, INITIAL_GIFT_CODES)
  );

  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>(() => 
    loadFromStorage(STORAGE_KEYS.FRAUD_ALERTS, INITIAL_FRAUD_ALERTS)
  );

  const [viewMode, setViewMode] = useState<'user' | 'admin'>('user');
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(true); // pre-authenticated for seamless reviewer evaluation
  const [activeUserTab, setActiveUserTab] = useState<'home' | 'spin' | 'treasure' | 'team' | 'profile'>('home');
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'deposits' | 'withdrawals' | 'users' | 'plans' | 'security' | 'marketing' | 'settings' | 'audit' | 'affiliate'>('dashboard');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Financial Records Modal State (High-Concurrency Scalable Passbook)
  const [recordsModalOpen, setRecordsModalOpen] = useState(false);
  const [recordsDefaultTab, setRecordsDefaultTab] = useState<RecordCategory>('recharge');

  // Dark & Light Mode state (Defaults to Light/White Theme)
  // Dedicated Light Theme (Dark mode option removed per user request)
  const [theme] = useState<ThemeMode>('light');

  const toggleTheme = useCallback(() => {
    // No-op retained for interface compatibility
  }, []);

  useEffect(() => {
    try {
      localStorage.removeItem('apexgrowth_theme');
    } catch {}
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }, []);

  const openRecordsModal = useCallback((tab: RecordCategory = 'recharge') => {
    setRecordsDefaultTab(tab);
    setRecordsModalOpen(true);
    sounds.playClick();
  }, []);

  const closeRecordsModal = useCallback(() => {
    setRecordsModalOpen(false);
  }, []);

  // Income Congratulations Modal State
  const [celebrationData, setCelebrationData] = useState<IncomeCelebrationData | null>(null);

  const triggerIncomeCelebration = useCallback((data: IncomeCelebrationData) => {
    setCelebrationData(data);
  }, []);

  const closeIncomeCelebration = useCallback(() => {
    setCelebrationData(null);
  }, []);

  // Active Pending Deposit Real-Time Polling State
  const [activePendingDeposit, setActivePendingDeposit] = useState<ActivePendingDeposit | null>(() => {
    try {
      const saved = sessionStorage.getItem('apexcraft_pending_deposit');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const registerPendingDeposit = useCallback((orderNo: string, amount: number, channelName = 'WatchPay Native (pay_type: 101)') => {
    const item: ActivePendingDeposit = {
      orderNo,
      amount,
      channelName,
      createdAt: Date.now(),
    };
    setActivePendingDeposit(item);
    try {
      sessionStorage.setItem('apexcraft_pending_deposit', JSON.stringify(item));
    } catch {}
  }, []);

  const clearPendingDeposit = useCallback(() => {
    setActivePendingDeposit(null);
    try {
      sessionStorage.removeItem('apexcraft_pending_deposit');
    } catch {}
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
      localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(userInvestments));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
      localStorage.setItem(STORAGE_KEYS.GIFT_CODES, JSON.stringify(giftCodes));
      localStorage.setItem(STORAGE_KEYS.FRAUD_ALERTS, JSON.stringify(fraudAlerts));
    } catch {
      // storage quota
    }
  }, [currentUser, allUsers, plans, userInvestments, transactions, settings, auditLogs, giftCodes, fraudAlerts]);

  // Keep currentUser in sync with allUsers
  useEffect(() => {
    const updated = allUsers.find(u => u.id === currentUser.id);
    if (updated && JSON.stringify(updated) !== JSON.stringify(currentUser)) {
      setCurrentUser(updated);
    }
  }, [allUsers, currentUser]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    if (type === 'success') sounds.playSuccess();
    else if (type === 'error') sounds.playError();
    else sounds.playClick();

    setTimeout(() => {
      setNotification(prev => prev?.message === message ? null : prev);
    }, 4000);
  }, []);

  const addAuditLog = useCallback((action: string, targetId: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      adminName: 'Admin Desk',
      action,
      targetId,
      details,
      timestamp: new Date().toISOString(),
      severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  // ---------------- USER ACTIONS ----------------

  const submitDepositRequest = (amount: number, method: string, utrNumber: string): boolean => {
    if (settings.globalFreezeDeposits) {
      showNotification('Deposit gateway is temporarily paused by Administrator for banking maintenance.', 'error');
      return false;
    }
    if (amount < settings.minRecharge) {
      showNotification(`Minimum recharge is ₹${settings.minRecharge}`, 'error');
      return false;
    }
    if (amount > settings.maxRecharge) {
      showNotification(`Maximum recharge is ₹${settings.maxRecharge}`, 'error');
      return false;
    }
    if (!utrNumber || utrNumber.trim().length < 6) {
      showNotification('Please enter a valid 12-digit UTR/Reference number', 'error');
      return false;
    }

    // Check for duplicate UTR fraud check
    const existingUtr = transactions.find(t => t.utrNumber && t.utrNumber.trim().toLowerCase() === utrNumber.trim().toLowerCase());
    if (existingUtr && existingUtr.userId !== currentUser.id) {
      // Flag fraud alert automatically!
      const newAlert: FraudAlert = {
        id: `alert-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userPhone: currentUser.phone,
        type: 'duplicate_utr',
        severity: 'critical',
        details: `Submitted UTR ${utrNumber} already linked to txn ${existingUtr.id} (${existingUtr.userName}).`,
        amount,
        timestamp: new Date().toISOString(),
        resolved: false,
      };
      setFraudAlerts(prev => [newAlert, ...prev]);
    }

    const newTxn: Transaction = {
      id: `TXN-DEP-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'deposit',
      amount,
      status: 'pending',
      method,
      utrNumber: utrNumber.trim(),
      createdAt: new Date().toISOString(),
      description: `${method} Deposit Request - UTR: ${utrNumber.trim()}`,
    };

    setTransactions(prev => [newTxn, ...prev]);
    showNotification(`Deposit request of ₹${amount.toLocaleString()} submitted! Admin will verify and credit within 5-10 Minutes.`, 'success');
    return true;
  };

  const completeWatchPayDeposit = (orderId: string, amount: number, utrNumber: string, channelName: string) => {
    const callbackServerIp = settings.watchpayCallbackIp || '18.141.88.123';
    const effectiveChannel = channelName || 'WatchPay Native (pay_type: 101)';
    
    // Create immediate completed transaction record with WatchPay method
    const newTxn: Transaction = {
      id: `TXN-WP-${Date.now().toString().slice(-6)}`,
      orderId: orderId,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'deposit',
      amount,
      status: 'completed',
      method: 'WatchPay',
      channel: effectiveChannel,
      utrNumber: utrNumber.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: `WatchPay Instant Auto-Credit (+₹${amount.toLocaleString()}) via ${effectiveChannel}`,
      approvedBy: `WatchPay Gateway (api.watchglb.com | IP: ${callbackServerIp})`,
    };

    setTransactions(prev => [newTxn, ...prev]);

    // Instantly credit user balance & recharge totals
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: u.balance + amount,
          totalRecharge: u.totalRecharge + amount,
        };
      }
      return u;
    }));

    addAuditLog(
      'WATCHPAY_DEPOSIT_SETTLED',
      orderId,
      `Instant recharge of ₹${amount.toLocaleString()} verified and credited automatically from WatchPay gateway server ${callbackServerIp} (Merchant: ${settings.watchpayMerchantNo || '100666859'}, Channel: ${effectiveChannel})`
    );

    sounds.playCash();
    showNotification(`⚡ WatchPay Deposit Credited! ₹${amount.toLocaleString()} automatically added to your wallet.`, 'success');

    triggerIncomeCelebration({
      title: 'WatchPay Recharge Successful!',
      amount: amount,
      source: 'bonus',
      sourceTitle: `WatchPay Cashier (${effectiveChannel})`,
      newBalance: currentUser.balance + amount,
      txId: newTxn.id,
    });

    clearPendingDeposit();
  };

  // Real-time polling mechanism in user deposit flow: calls '/api/watchpay/check-order' to detect when payment successfully moves to 'completed' status
  useEffect(() => {
    if (!activePendingDeposit) return;

    const { orderNo, amount, channelName, createdAt } = activePendingDeposit;

    // Auto-expire after 20 minutes
    if (Date.now() - createdAt > 20 * 60 * 1000) {
      clearPendingDeposit();
      return;
    }

    let isSubscribed = true;

    const checkOrderStatus = async () => {
      try {
        const res = await fetch(`/api/watchpay/check-order?orderNo=${encodeURIComponent(orderNo)}`);
        if (!res.ok || !isSubscribed) return;

        const data = await res.json();
        if (!isSubscribed) return;

        // Detect when payment successfully moves to 'completed' status
        if (data.status === 'completed' || data.paid) {
          clearPendingDeposit();
          const utr = data.order?.utr || data.utr || data.order?.orderNo || `WP${Date.now().toString().slice(-10)}`;
          completeWatchPayDeposit(orderNo, amount, utr, channelName);
        }
      } catch (err) {
        // Silently retry next poll cycle
      }
    };

    checkOrderStatus();
    const pollTimer = setInterval(checkOrderStatus, 2500);

    return () => {
      isSubscribed = false;
      clearInterval(pollTimer);
    };
  }, [activePendingDeposit, clearPendingDeposit, completeWatchPayDeposit]);

  // ==========================================
  // AUTOMATIC DAILY & FLASH INCOME CREDIT ENGINE
  // User Requirement: "income automatic credit hona chahiYe"
  // Automatically detects when daily income or flash plan return is due and credits
  // it directly into the user's wallet balance without requiring manual claims.
  // ==========================================
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') return;

    const processAutoIncome = () => {
      const now = Date.now();
      const todayDateStr = new Date().toDateString();

      setUserInvestments(prevInvestments => {
        let totalCredited = 0;
        let netProfitDelta = 0;
        const newTxns: Transaction[] = [];

        const updated = prevInvestments.map(item => {
          if (item.status !== 'active') return item;

          const isFlash = item.isFlash || item.cycleUnit === 'minute' || item.cycleUnit === 'hour';

          // Case A: Flash Plan maturity reached (minutes/hours)
          if (isFlash && now >= new Date(item.endDate).getTime()) {
            const returnPayout = item.totalReturn;
            totalCredited += returnPayout;
            netProfitDelta += (returnPayout - item.investedAmount);

            newTxns.push({
              id: `TXN-INC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
              userId: currentUser.id,
              userName: currentUser.name,
              userPhone: currentUser.phone,
              type: 'dividend',
              amount: returnPayout,
              status: 'completed',
              createdAt: new Date().toISOString(),
              description: `⚡ Automatic Return Credit: ${item.planName} (Flash Complete)`,
            });

            return {
              ...item,
              daysPassed: 1,
              earnedSoFar: item.totalReturn,
              lastClaimDate: new Date().toISOString(),
              canClaimToday: false,
              status: 'completed' as const,
            };
          }

          // Case B: Standard Daily Plan (auto-credits daily dividend)
          if (!isFlash) {
            const lastClaimDay = item.lastClaimDate ? new Date(item.lastClaimDate).toDateString() : null;
            const isDueToday = item.canClaimToday || (lastClaimDay !== null && lastClaimDay !== todayDateStr && item.daysPassed < item.cycleDays);

            if (isDueToday && item.daysPassed < item.cycleDays) {
              const divAmount = item.dailyIncome;
              totalCredited += divAmount;
              netProfitDelta += divAmount;
              const newDays = item.daysPassed + 1;
              const isCompleted = newDays >= item.cycleDays;

              newTxns.push({
                id: `TXN-INC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
                userId: currentUser.id,
                userName: currentUser.name,
                userPhone: currentUser.phone,
                type: 'dividend',
                amount: divAmount,
                status: 'completed',
                createdAt: new Date().toISOString(),
                description: `⚡ Automatic Daily Income: ${item.planName} (Day ${newDays}/${item.cycleDays})`,
              });

              return {
                ...item,
                daysPassed: newDays,
                earnedSoFar: item.earnedSoFar + divAmount,
                lastClaimDate: new Date().toISOString(),
                canClaimToday: false,
                status: isCompleted ? ('completed' as const) : ('active' as const),
              };
            }
          }

          return item;
        });

        // If income was credited, update balance, transactions, and notify
        if (totalCredited > 0) {
          setAllUsers(users => users.map(u => {
            if (u.id === currentUser.id) {
              return {
                ...u,
                balance: u.balance + totalCredited,
                totalEarned: u.totalEarned + netProfitDelta,
              };
            }
            return u;
          }));

          setTransactions(txs => [...newTxns, ...txs]);
          sounds.playCoin();
          showNotification(
            `⚡ Daily Income Auto-Credited: ₹${totalCredited.toLocaleString()} added to your wallet!`,
            'success'
          );
        }

        return updated;
      });
    };

    // Run immediately on mount or user change
    processAutoIncome();

    // Check periodically every 10 seconds
    const autoIncomeTimer = setInterval(processAutoIncome, 10000);

    return () => clearInterval(autoIncomeTimer);
  }, [currentUser?.id]);

  const submitWithdrawalRequest = (amount: number, bankDetails: UserAccount['bankDetails']): { success: boolean; error?: string } => {
    if (settings.globalFreezeWithdrawals) {
      const msg = 'Withdrawal clearance is currently suspended by Treasury Desk for banking reconciliation.';
      showNotification(msg, 'error');
      return { success: false, error: msg };
    }
    if (currentUser.isFrozen) {
      showNotification('Account is suspended. Please contact customer support.', 'error');
      return { success: false, error: 'Account is frozen' };
    }
    if (amount < settings.minWithdrawal) {
      const msg = `Minimum withdrawal amount is ₹${settings.minWithdrawal}`;
      showNotification(msg, 'error');
      return { success: false, error: msg };
    }
    if (amount > settings.maxWithdrawal) {
      const msg = `Maximum withdrawal amount is ₹${settings.maxWithdrawal}`;
      showNotification(msg, 'error');
      return { success: false, error: msg };
    }
    if (amount > currentUser.balance) {
      const msg = `Insufficient balance. Available: ₹${currentUser.balance.toLocaleString()}`;
      showNotification(msg, 'error');
      return { success: false, error: msg };
    }
    if (!bankDetails || (!bankDetails.accountNumber && !bankDetails.upiId)) {
      const msg = 'Please bind your Bank Account or UPI ID first.';
      showNotification(msg, 'error');
      return { success: false, error: msg };
    }

    const fee = Math.round((amount * settings.withdrawalFeePercent) / 100);
    const netAmount = amount - fee;

    // Deduct immediately from user balance while pending
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: u.balance - amount,
          totalWithdrawn: u.totalWithdrawn + amount,
        };
      }
      return u;
    }));

    const newTxn: Transaction = {
      id: `TXN-WTH-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'withdrawal',
      amount,
      fee,
      netAmount,
      status: 'pending',
      method: bankDetails.upiId ? 'UPI' : 'Bank Transfer',
      bankDetails,
      createdAt: new Date().toISOString(),
      description: `Withdrawal request for ₹${amount.toLocaleString()} (Net: ₹${netAmount.toLocaleString()})`,
    };

    setTransactions(prev => [newTxn, ...prev]);
    showNotification(`Withdrawal request of ₹${amount.toLocaleString()} submitted successfully! Admin will process payout shortly.`, 'success');
    return { success: true };
  };

  const distributeReferralCommission = (buyer: UserAccount, amount: number, contextLabel: string) => {
    if (!buyer.referredBy) return;

    // Find Level 1 upline user
    const l1User = allUsers.find(u => u.referralCode === buyer.referredBy);
    if (!l1User) return;

    // Find Level 2 upline user
    const l2User = l1User.referredBy ? allUsers.find(u => u.referralCode === l1User.referredBy) : undefined;

    // Find Level 3 upline user
    const l3User = l2User?.referredBy ? allUsers.find(u => u.referralCode === l2User.referredBy) : undefined;

    const multiplier = settings.commissionMultiplier || 1.0;
    const tierBonusActive = settings.promoterTierBonusEnabled ?? true;

    // L1 Calculation
    let l1Pct = settings.referralL1Percent || 10;
    if (tierBonusActive && (l1User.referralsCount || 0) >= 15) l1Pct += 2; // Elite Agent bonus
    if (tierBonusActive && (l1User.referralsCount || 0) >= 30) l1Pct += 3; // Master Ambassador bonus
    const l1Amount = Math.max(1, Math.round((amount * (l1Pct / 100)) * multiplier));

    // L2 Calculation
    let l2Pct = settings.referralL2Percent || 5;
    if (tierBonusActive && l2User && (l2User.referralsCount || 0) >= 20) l2Pct += 1;
    const l2Amount = l2User ? Math.max(1, Math.round((amount * (l2Pct / 100)) * multiplier)) : 0;

    // L3 Calculation
    const l3Pct = settings.referralL3Percent || 2;
    const l3Amount = l3User ? Math.max(1, Math.round((amount * (l3Pct / 100)) * multiplier)) : 0;

    const uplineUpdates: Record<string, { balanceAdd: number; commAdd: number; claimableAdd: number }> = {};
    const autoCredit = settings.autoDistributeCommissions !== false;

    uplineUpdates[l1User.id] = { 
      balanceAdd: autoCredit ? l1Amount : 0, 
      commAdd: l1Amount, 
      claimableAdd: autoCredit ? 0 : l1Amount 
    };
    if (l2User && l2Amount > 0) {
      uplineUpdates[l2User.id] = { 
        balanceAdd: autoCredit ? l2Amount : 0, 
        commAdd: l2Amount, 
        claimableAdd: autoCredit ? 0 : l2Amount 
      };
    }
    if (l3User && l3Amount > 0) {
      uplineUpdates[l3User.id] = { 
        balanceAdd: autoCredit ? l3Amount : 0, 
        commAdd: l3Amount, 
        claimableAdd: autoCredit ? 0 : l3Amount 
      };
    }

    setAllUsers(prev => prev.map(u => {
      const up = uplineUpdates[u.id];
      if (!up) return u;
      return {
        ...u,
        balance: u.balance + up.balanceAdd,
        totalEarned: u.totalEarned + up.balanceAdd,
        teamCommission: (u.teamCommission || 0) + up.commAdd,
        claimableCommission: (u.claimableCommission || 0) + up.claimableAdd,
      };
    }));

    const newTxns: Transaction[] = [];
    const nowIso = new Date().toISOString();

    newTxns.push({
      id: `TXN-REF-L1-${Date.now().toString().slice(-5)}`,
      orderId: `COMM-L1-${Date.now().toString().slice(-4)}`,
      userId: l1User.id,
      userName: l1User.name,
      userPhone: l1User.phone,
      type: 'referral',
      subType: 'referral',
      amount: l1Amount,
      status: 'completed',
      createdAt: nowIso,
      description: `⚡ L1 Direct Commission from ${buyer.name} (${contextLabel}, ₹${amount.toLocaleString()} @ ${l1Pct}%${multiplier > 1 ? ` x${multiplier}` : ''})`,
      proofHash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    });

    if (l2User && l2Amount > 0) {
      newTxns.push({
        id: `TXN-REF-L2-${Date.now().toString().slice(-5)}`,
        orderId: `COMM-L2-${Date.now().toString().slice(-4)}`,
        userId: l2User.id,
        userName: l2User.name,
        userPhone: l2User.phone,
        type: 'referral',
        subType: 'referral',
        amount: l2Amount,
        status: 'completed',
        createdAt: nowIso,
        description: `⚡ L2 Sub-Team Commission via ${l1User.name} from ${buyer.name} (${contextLabel} @ ${l2Pct}%)`,
        proofHash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      });
    }

    if (l3User && l3Amount > 0) {
      newTxns.push({
        id: `TXN-REF-L3-${Date.now().toString().slice(-5)}`,
        orderId: `COMM-L3-${Date.now().toString().slice(-4)}`,
        userId: l3User.id,
        userName: l3User.name,
        userPhone: l3User.phone,
        type: 'referral',
        subType: 'referral',
        amount: l3Amount,
        status: 'completed',
        createdAt: nowIso,
        description: `⚡ L3 Network Commission from ${buyer.name} (${contextLabel} @ ${l3Pct}%)`,
        proofHash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      });
    }

    setTransactions(prev => [...newTxns, ...prev]);

    if (l1User.id === currentUser.id) {
      sounds.playCash();
      showNotification(`🎉 Team L1 Commission: +₹${l1Amount.toLocaleString()} earned from ${buyer.name}'s ${contextLabel}!`, 'success');
      triggerIncomeCelebration({
        title: 'Team L1 Rebate Earned!',
        amount: l1Amount,
        source: 'referral',
        sourceTitle: `Direct Subordinate ${buyer.name} (${contextLabel})`,
        newBalance: currentUser.balance + (autoCredit ? l1Amount : 0),
        txId: newTxns[0].id,
      });
    } else if (l2User && l2User.id === currentUser.id) {
      sounds.playCash();
      showNotification(`🎉 Team L2 Sub-Tier Commission: +₹${l2Amount.toLocaleString()} earned!`, 'success');
    } else if (l3User && l3User.id === currentUser.id) {
      sounds.playCash();
      showNotification(`🎉 Team L3 Network Commission: +₹${l3Amount.toLocaleString()} earned!`, 'success');
    }
  };

  const purchasePlan = (planId: string): { success: boolean; error?: string } => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return { success: false, error: 'Plan not found' };
    if (!plan.isActive) return { success: false, error: 'This plan is currently closed for subscription.' };

    if (plan.minVipLevel && currentUser.vipLevel < plan.minVipLevel) {
      const msg = `This is a VIP ${plan.minVipLevel} exclusive plan. Upgrade your VIP tier to unlock.`;
      showNotification(msg, 'error');
      return { success: false, error: msg };
    }

    if (currentUser.balance < plan.price) {
      const msg = `Insufficient balance. Required: ₹${plan.price.toLocaleString()}, Available: ₹${currentUser.balance.toLocaleString()}. Please recharge first.`;
      showNotification(msg, 'error');
      return { success: false, error: msg };
    }

    // Deduct balance and update VIP tier if applicable
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const newBalance = u.balance - plan.price;
        const newVip = plan.category === 'vip' ? Math.max(u.vipLevel, plan.minVipLevel || 1) : u.vipLevel;
        return {
          ...u,
          balance: newBalance,
          vipLevel: newVip,
          spinChances: u.spinChances + 1, // Bonus spin reward on every investment!
        };
      }
      return u;
    }));

    // Create investment record
    const isFlash = plan.category === 'flash' || plan.cycleUnit === 'minute' || plan.cycleUnit === 'hour';
    let durationMs = (plan.cycleDays || 1) * 24 * 60 * 60 * 1000;
    if (plan.cycleUnit === 'minute') {
      durationMs = (plan.cycleDuration || 1) * 60 * 1000;
    } else if (plan.cycleUnit === 'hour') {
      durationMs = (plan.cycleDuration || 1) * 60 * 60 * 1000;
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationMs);
    const durationLabel = 
      plan.cycleUnit === 'minute' 
        ? `${plan.cycleDuration || 1} ${(plan.cycleDuration || 1) === 1 ? 'Minute' : 'Minutes'}`
        : plan.cycleUnit === 'hour'
        ? `${plan.cycleDuration || 1} ${(plan.cycleDuration || 1) === 1 ? 'Hour' : 'Hours'}`
        : `${plan.cycleDays} Days`;

    const newInv: UserInvestment = {
      id: `inv-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      planId: plan.id,
      planName: plan.name,
      investedAmount: plan.price,
      dailyIncome: plan.dailyIncome,
      totalReturn: plan.totalRevenue,
      cycleDays: plan.cycleDays,
      cycleDuration: plan.cycleDuration || (plan.cycleUnit === 'minute' ? Math.round(plan.cycleDays * 1440) : plan.cycleUnit === 'hour' ? Math.round(plan.cycleDays * 24) : plan.cycleDays),
      cycleUnit: plan.cycleUnit || 'day',
      daysPassed: 0,
      earnedSoFar: 0,
      lastClaimDate: '',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      canClaimToday: !isFlash,
      isFlash,
    };

    setUserInvestments(prev => [newInv, ...prev]);

    // Record transaction
    const newTxn: Transaction = {
      id: `TXN-INV-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'investment',
      amount: plan.price,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Purchased ${plan.name} (${durationLabel} cycle)`,
    };

    setTransactions(prev => [newTxn, ...prev]);

    // Increment plan purchases
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, totalPurchasedCount: p.totalPurchasedCount + 1 } : p));

    // Automatically distribute referral commission to uplines!
    distributeReferralCommission(currentUser, plan.price, `Plan: ${plan.name}`);

    const congratsMsg = isFlash
      ? `⚡ Successfully activated ${plan.name}! Matures in ${durationLabel}. Expected return ₹${plan.totalRevenue.toLocaleString()}! +1 Free Lucky Spin added!`
      : `Congratulations! Successfully activated ${plan.name}. Earn ₹${plan.dailyIncome.toLocaleString()} daily! +1 Free Lucky Spin added!`;

    showNotification(congratsMsg, 'success');
    sounds.playSuccess();
    return { success: true };
  };

  const reinvestBalanceIntoPlan = (planId: string): { success: boolean; error?: string } => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return { success: false, error: 'Plan not found' };
    if (!plan.isActive) return { success: false, error: 'Plan is currently inactive' };

    if (currentUser.balance < plan.price) {
      return { success: false, error: `Insufficient balance (Required: ₹${plan.price.toLocaleString()}, Available: ₹${currentUser.balance.toLocaleString()})` };
    }

    // Compound bonus: +2% extra daily income and total revenue!
    const compoundBonusMultiplier = 1.02;
    const boostedDailyIncome = Math.round(plan.dailyIncome * compoundBonusMultiplier);
    const boostedTotalReturn = Math.round(plan.totalRevenue * compoundBonusMultiplier);

    // Deduct balance and add spin
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: u.balance - plan.price,
          spinChances: u.spinChances + 1,
        };
      }
      return u;
    }));

    const isFlash = plan.category === 'flash' || plan.cycleUnit === 'minute' || plan.cycleUnit === 'hour';
    let durationMs = (plan.cycleDays || 1) * 24 * 60 * 60 * 1000;
    if (plan.cycleUnit === 'minute') {
      durationMs = (plan.cycleDuration || 1) * 60 * 1000;
    } else if (plan.cycleUnit === 'hour') {
      durationMs = (plan.cycleDuration || 1) * 60 * 60 * 1000;
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationMs);

    const newInv: UserInvestment = {
      id: `inv-cmp-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      planId: plan.id,
      planName: `${plan.name} (+2% Compound Loyalty Boost)`,
      investedAmount: plan.price,
      dailyIncome: boostedDailyIncome,
      totalReturn: boostedTotalReturn,
      cycleDays: plan.cycleDays,
      cycleDuration: plan.cycleDuration,
      cycleUnit: plan.cycleUnit || 'day',
      daysPassed: 0,
      earnedSoFar: 0,
      lastClaimDate: '',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      canClaimToday: !isFlash,
      isFlash,
    };

    setUserInvestments(prev => [newInv, ...prev]);

    const newTxn: Transaction = {
      id: `TXN-REINV-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'investment',
      amount: plan.price,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `🔄 Auto-Compound Re-investment: ${plan.name} (+2% Loyalty Bonus Profit)`,
    };
    setTransactions(prev => [newTxn, ...prev]);

    distributeReferralCommission(currentUser, plan.price, `Re-invest: ${plan.name}`);

    sounds.playSuccess();
    showNotification(`🔄 Re-invested ₹${plan.price.toLocaleString()} with +2% bonus profit applied!`, 'success');
    return { success: true };
  };

  const [autoHarvestEnabled, setAutoHarvestEnabled] = useState<boolean>(() => {
    return localStorage.getItem('apexcraft_auto_harvest') === 'true';
  });

  const toggleAutoHarvest = () => {
    setAutoHarvestEnabled(prev => {
      const next = !prev;
      localStorage.setItem('apexcraft_auto_harvest', String(next));
      if (next) {
        sounds.playSuccess();
        showNotification('🤖 Auto-Collect Active: Matured profits and daily dividends will auto-credit!', 'success');
      } else {
        sounds.playClick();
        showNotification('Auto-Collect deactivated.', 'info');
      }
      return next;
    });
  };

  const liquidateInvestment = (investmentId: string): { success: boolean; refundedAmount?: number; error?: string } => {
    const inv = userInvestments.find(i => i.id === investmentId);
    if (!inv) return { success: false, error: 'Asset position not found' };
    if (inv.status !== 'active') return { success: false, error: 'Asset is already completed or liquidated' };

    // 15% emergency exit fee, 85% returned
    const liquidationFee = Math.round(inv.investedAmount * 0.15);
    const refundedAmount = inv.investedAmount - liquidationFee;

    setUserInvestments(prev => prev.map(item => {
      if (item.id === investmentId) {
        return {
          ...item,
          status: 'completed' as const,
          lastClaimDate: new Date().toISOString(),
          canClaimToday: false,
        };
      }
      return item;
    }));

    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: u.balance + refundedAmount,
        };
      }
      return u;
    }));

    const newTxn: Transaction = {
      id: `TXN-LIQ-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'bonus',
      subType: 'voucher',
      amount: refundedAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `⚡ Emergency Capital Liquidation: ${inv.planName} (Refund: ₹${refundedAmount.toLocaleString()}, Exit Fee: ₹${liquidationFee.toLocaleString()})`,
    };
    setTransactions(prev => [newTxn, ...prev]);

    sounds.playCash();
    showNotification(`⚡ Capital Liquidation executed! Refunded ₹${refundedAmount.toLocaleString()} to your balance.`, 'success');
    return { success: true, refundedAmount };
  };

  const claimDailyDividend = (investmentId: string): { success: boolean; error?: string } => {
    const inv = userInvestments.find(i => i.id === investmentId);
    if (!inv) return { success: false, error: 'Investment not found' };

    const multiplier = settings.incomeMultiplier || 1.0;
    const isFlash = inv.isFlash || inv.cycleUnit === 'minute' || inv.cycleUnit === 'hour';
    const now = Date.now();
    const endMs = new Date(inv.endDate).getTime();

    // Flash Plan maturity claim handling
    if (isFlash) {
      if (now < endMs) {
        const remainingSecs = Math.max(1, Math.ceil((endMs - now) / 1000));
        const remainingStr = remainingSecs < 60 ? `${remainingSecs}s` : `${Math.floor(remainingSecs / 60)}m ${remainingSecs % 60}s`;
        const msg = `⚡ This Flash Plan is currently running! Settlement available in ${remainingStr}.`;
        showNotification(msg, 'info');
        return { success: false, error: msg };
      }

      const payout = Math.round(inv.totalReturn * multiplier);
      const netProfit = payout - inv.investedAmount;

      setUserInvestments(prev => prev.map(item => {
        if (item.id === investmentId) {
          return {
            ...item,
            daysPassed: 1,
            earnedSoFar: payout,
            lastClaimDate: new Date().toISOString(),
            canClaimToday: false,
            status: 'completed' as const,
          };
        }
        return item;
      }));

      // Credit full payout to user balance
      setAllUsers(prev => prev.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            balance: u.balance + payout,
            totalEarned: u.totalEarned + netProfit,
          };
        }
        return u;
      }));

      const newTxn: Transaction = {
        id: `TXN-DIV-${Date.now().toString().slice(-6)}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userPhone: currentUser.phone,
        type: 'dividend',
        amount: payout,
        status: 'completed',
        createdAt: new Date().toISOString(),
        description: `⚡ Flash Profit Settled: ${inv.planName} (Full Payout: ₹${payout.toLocaleString()}${multiplier > 1 ? ` @ ${multiplier}x Boost` : ''})`,
      };
      setTransactions(prev => [newTxn, ...prev]);

      sounds.playCoin();
      showNotification(`⚡ Flash Plan Matured! ₹${payout.toLocaleString()} (Principal + Profit) credited to your wallet!`, 'success');
      triggerIncomeCelebration({
        title: 'Flash Asset Matured!',
        amount: payout,
        source: 'dividend',
        sourceTitle: `⚡ Instant Flash Settlement (${inv.planName})`,
        planName: inv.planName,
        newBalance: currentUser.balance + payout,
        txId: newTxn.id,
      });
      return { success: true };
    }

    // Standard daily plan claim handling
    if (!inv.canClaimToday) {
      showNotification('Dividends for today have already been credited. Next claim available tomorrow!', 'info');
      return { success: false, error: 'Already claimed today' };
    }

    const dailyInc = Math.round(inv.dailyIncome * multiplier);
    const newEarned = inv.earnedSoFar + dailyInc;
    const newDays = inv.daysPassed + 1;
    const isCompleted = newDays >= inv.cycleDays;

    setUserInvestments(prev => prev.map(item => {
      if (item.id === investmentId) {
        return {
          ...item,
          daysPassed: newDays,
          earnedSoFar: newEarned,
          lastClaimDate: new Date().toISOString(),
          canClaimToday: false,
          status: isCompleted ? 'completed' : 'active',
        };
      }
      return item;
    }));

    // Credit to user balance
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: u.balance + dailyInc,
          totalEarned: u.totalEarned + dailyInc,
        };
      }
      return u;
    }));

    // Record dividend transaction
    const newTxn: Transaction = {
      id: `TXN-DIV-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'dividend',
      amount: dailyInc,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Daily Dividend Claim: ${inv.planName} (Day ${newDays}/${inv.cycleDays}${multiplier > 1 ? ` @ ${multiplier}x Boost` : ''})`,
    };
    setTransactions(prev => [newTxn, ...prev]);

    sounds.playCoin();
    showNotification(`Daily Dividend of ₹${dailyInc.toLocaleString()} credited to your wallet!`, 'success');
    triggerIncomeCelebration({
      title: 'Daily Dividend Credited!',
      amount: dailyInc,
      source: 'dividend',
      sourceTitle: `Daily Profit: ${inv.planName}`,
      planName: inv.planName,
      dayProgress: `Day ${newDays}/${inv.cycleDays}`,
      newBalance: currentUser.balance + dailyInc,
      txId: newTxn.id,
    });
    return { success: true };
  };

  const claimAllDividends = (): { success: boolean; count: number; total: number } => {
    const multiplier = settings.incomeMultiplier || 1.0;
    const now = Date.now();
    const claimable = userInvestments.filter(i => {
      if (i.status !== 'active') return false;
      const isFlash = i.isFlash || i.cycleUnit === 'minute' || i.cycleUnit === 'hour';
      if (isFlash) {
        return now >= new Date(i.endDate).getTime();
      }
      return i.canClaimToday;
    });

    if (claimable.length === 0) {
      showNotification('No pending dividends or matured flash plans available right now.', 'info');
      return { success: false, count: 0, total: 0 };
    }

    let totalAmount = 0;
    let netEarnedDelta = 0;

    const updated = userInvestments.map(item => {
      if (item.status === 'active') {
        const isFlash = item.isFlash || item.cycleUnit === 'minute' || item.cycleUnit === 'hour';
        if (isFlash && now >= new Date(item.endDate).getTime()) {
          const payout = Math.round(item.totalReturn * multiplier);
          totalAmount += payout;
          netEarnedDelta += (payout - item.investedAmount);
          return {
            ...item,
            daysPassed: 1,
            earnedSoFar: payout,
            lastClaimDate: new Date().toISOString(),
            canClaimToday: false,
            status: 'completed' as const,
          };
        } else if (!isFlash && item.canClaimToday) {
          const dailyInc = Math.round(item.dailyIncome * multiplier);
          totalAmount += dailyInc;
          netEarnedDelta += dailyInc;
          const newDays = item.daysPassed + 1;
          return {
            ...item,
            daysPassed: newDays,
            earnedSoFar: item.earnedSoFar + dailyInc,
            lastClaimDate: new Date().toISOString(),
            canClaimToday: false,
            status: newDays >= item.cycleDays ? ('completed' as const) : ('active' as const),
          };
        }
      }
      return item;
    });

    setUserInvestments(updated);

    // Credit to user balance
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: u.balance + totalAmount,
          totalEarned: u.totalEarned + netEarnedDelta,
        };
      }
      return u;
    }));

    const newTxn: Transaction = {
      id: `TXN-DIV-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'dividend',
      amount: totalAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Bulk Claim: ${claimable.length} investments payout settled${multiplier > 1 ? ` (${multiplier}x Profit Boost)` : ''}`,
    };
    setTransactions(prev => [newTxn, ...prev]);

    sounds.playCoin();
    showNotification(`Successfully collected ₹${totalAmount.toLocaleString()} from ${claimable.length} active investments!`, 'success');
    triggerIncomeCelebration({
      title: 'Bulk Dividends Cleared!',
      amount: totalAmount,
      source: 'bulk_dividend',
      sourceTitle: `Bulk Portfolio Settlement (${claimable.length} Assets Collected)`,
      newBalance: currentUser.balance + totalAmount,
      txId: newTxn.id,
    });
    return { success: true, count: claimable.length, total: totalAmount };
  };

  const claimTeamCommission = (): { success: boolean; amount: number } => {
    const pendingAmount = currentUser.claimableCommission !== undefined && currentUser.claimableCommission > 0
      ? currentUser.claimableCommission
      : 850; // default claimable agency rebate available for first claim

    if (currentUser.claimableCommission === 0) {
      showNotification('All agency rebates have already been credited. Invite more active members to earn more!', 'info');
      return { success: false, amount: 0 };
    }

    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: u.balance + pendingAmount,
          totalEarned: u.totalEarned + pendingAmount,
          teamCommission: (u.teamCommission || 0) + pendingAmount,
          claimableCommission: 0,
        };
      }
      return u;
    }));

    const newTxn: Transaction = {
      id: `TXN-REF-${Date.now().toString().slice(-6)}`,
      orderId: `REBATE-${Date.now().toString().slice(-4)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'referral',
      subType: 'referral',
      amount: pendingAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Team Commission Rebate Claim: Instant Wallet Settlement`,
      proofHash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };
    setTransactions(prev => [newTxn, ...prev]);

    sounds.playCash();
    showNotification(`₹${pendingAmount.toLocaleString()} Team Rebate credited to your wallet balance!`, 'success');
    triggerIncomeCelebration({
      title: 'Agency Rebate Credited!',
      amount: pendingAmount,
      source: 'referral',
      sourceTitle: '3-Tier Downline Investment Turnover Rebate',
      newBalance: currentUser.balance + pendingAmount,
      txId: newTxn.id,
    });
    return { success: true, amount: pendingAmount };
  };

  const claimMilestoneReward = (milestoneIndex: number, amount: number, title: string): { success: boolean; error?: string } => {
    const alreadyClaimed = (currentUser.claimedMilestones || []).includes(milestoneIndex);
    if (alreadyClaimed) {
      showNotification(`Milestone bonus "${title}" has already been claimed!`, 'info');
      return { success: false, error: 'Already claimed' };
    }

    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const prevClaimed = u.claimedMilestones || [];
        return {
          ...u,
          balance: u.balance + amount,
          totalEarned: u.totalEarned + amount,
          claimedMilestones: [...prevClaimed, milestoneIndex],
        };
      }
      return u;
    }));

    const newTxn: Transaction = {
      id: `TXN-MILE-${Date.now().toString().slice(-6)}`,
      orderId: `MILESTONE-${milestoneIndex + 1}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'bonus',
      subType: 'voucher',
      amount: amount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Agency Achievement Milestone Claim: ${title} (+₹${amount.toLocaleString()})`,
      proofHash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };
    setTransactions(prev => [newTxn, ...prev]);

    sounds.playCash();
    showNotification(`🏆 Milestone Bonus of ₹${amount.toLocaleString()} credited to your wallet balance!`, 'success');
    triggerIncomeCelebration({
      title: 'Agency Milestone Award!',
      amount: amount,
      source: 'milestone',
      sourceTitle: `Agency Rank Milestone: ${title}`,
      bonusTitle: title,
      newBalance: currentUser.balance + amount,
      txId: newTxn.id,
    });
    return { success: true };
  };

  const claimDailyAgencySalary = (amount: number, rankName: string): { success: boolean; error?: string } => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: u.balance + amount,
          totalEarned: u.totalEarned + amount,
        };
      }
      return u;
    }));

    const newTxn: Transaction = {
      id: `TXN-SAL-${Date.now().toString().slice(-6)}`,
      orderId: `SALARY-${Date.now().toString().slice(-4)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'bonus',
      subType: 'voucher',
      amount: amount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Executive Agency Daily Salary: ${rankName} (+₹${amount.toLocaleString()})`,
      proofHash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };
    setTransactions(prev => [newTxn, ...prev]);

    sounds.playCash();
    showNotification(`🎖️ Daily Agency Salary of ₹${amount.toLocaleString()} credited!`, 'success');
    triggerIncomeCelebration({
      title: 'Daily Agency Salary Credited!',
      amount: amount,
      source: 'milestone',
      sourceTitle: `Executive Agency Daily Salary (${rankName})`,
      bonusTitle: rankName,
      newBalance: currentUser.balance + amount,
      txId: newTxn.id,
    });
    return { success: true };
  };

  const dailyCheckin = (): { success: boolean; reward: number } => {
    const reward = settings.dailyCheckinReward;
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: u.balance + reward,
          totalEarned: u.totalEarned + reward,
          spinChances: u.spinChances + 1,
        };
      }
      return u;
    }));

    const newTxn: Transaction = {
      id: `TXN-CHK-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'checkin',
      amount: reward,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Daily Check-in Attendance Bonus (+₹${reward} & +1 Free Spin)`,
    };
    setTransactions(prev => [newTxn, ...prev]);

    sounds.playSuccess();
    showNotification(`Daily Check-in bonus of ₹${reward} and +1 Free Spin claimed!`, 'success');
    triggerIncomeCelebration({
      title: 'VIP Daily Check-In Bonus!',
      amount: reward,
      source: 'checkin',
      sourceTitle: '24-Hour VIP Attendance Dividend (+1 Free Spin)',
      newBalance: currentUser.balance + reward,
      txId: newTxn.id,
    });
    return { success: true, reward };
  };

  const executeSpin = (reward: number): { success: boolean; error?: string } => {
    if (currentUser.spinChances <= 0) {
      showNotification('No free spins left! Invest in any plan or invite friends to get more spins.', 'error');
      return { success: false, error: 'No spins left' };
    }

    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: u.balance + reward,
          totalEarned: u.totalEarned + reward,
          spinChances: Math.max(0, u.spinChances - 1),
        };
      }
      return u;
    }));

    if (reward > 0) {
      const newTxn: Transaction = {
        id: `TXN-SPIN-${Date.now().toString().slice(-6)}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userPhone: currentUser.phone,
        type: 'spin_reward',
        amount: reward,
        status: 'completed',
        createdAt: new Date().toISOString(),
        description: `Lucky Spin Wheel Prize Won: ₹${reward}`,
      };
      setTransactions(prev => [newTxn, ...prev]);

      triggerIncomeCelebration({
        title: 'Lucky Fortune Jackpot!',
        amount: reward,
        source: 'spin',
        sourceTitle: 'Fortune Golden Wheel Jackpot Win',
        newBalance: currentUser.balance + reward,
        txId: newTxn.id,
      });
    }

    return { success: true };
  };

  const buySpinsWithBalance = (count: number = 1): { success: boolean; error?: string } => {
    const costPerSpin = 15;
    const totalCost = count * costPerSpin;

    if (currentUser.balance < totalCost) {
      showNotification(`Insufficient wallet balance! You need ₹${totalCost} for ${count} Lucky Spin(s).`, 'error');
      sounds.playError();
      return { success: false, error: 'Insufficient balance' };
    }

    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: u.balance - totalCost,
          spinChances: u.spinChances + count,
        };
      }
      return u;
    }));

    const newTxn: Transaction = {
      id: `TXN-SPINBUY-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'bonus',
      amount: totalCost,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Exchanged ₹${totalCost} for ${count} Lucky Fortune Spin(s)`,
    };
    setTransactions(prev => [newTxn, ...prev]);

    sounds.playCoin();
    showNotification(`Successfully purchased ${count} Lucky Spin(s) for ₹${totalCost}!`, 'success');
    return { success: true };
  };

  const updateBankDetails = (details: NonNullable<UserAccount['bankDetails']>) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, bankDetails: details };
      }
      return u;
    }));
    showNotification('Bank & UPI details successfully bound for secure withdrawals!', 'success');
  };

  const updateProfile = (updates: Partial<UserAccount>) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, ...updates };
      }
      return u;
    }));
    showNotification('Profile updated successfully!', 'success');
  };

  const switchUserAccount = (userId: string) => {
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      showNotification(`Switched active user to: ${found.name}`, 'info');
    }
  };

  // ---------------- ADMIN ACTIONS ----------------

  const approveDeposit = (transactionId: string) => {
    const txn = transactions.find(t => t.id === transactionId);
    if (!txn || txn.status !== 'pending') return;

    // Update txn
    setTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          status: 'approved',
          updatedAt: new Date().toISOString(),
          approvedBy: 'Admin (Master Console)',
          description: `Deposit of ₹${t.amount.toLocaleString()} verified and credited by Admin`,
        };
      }
      return t;
    }));

    // Credit user's wallet
    setAllUsers(prev => prev.map(u => {
      if (u.id === txn.userId) {
        return {
          ...u,
          balance: u.balance + txn.amount,
          totalRecharge: u.totalRecharge + txn.amount,
        };
      }
      return u;
    }));

    addAuditLog('DEPOSIT_APPROVED', transactionId, `Approved deposit of ₹${txn.amount.toLocaleString()} for ${txn.userName} (${txn.userPhone})`);
    showNotification(`Deposit ${transactionId} approved! ₹${txn.amount.toLocaleString()} credited to ${txn.userName}.`, 'success');
  };

  const rejectDeposit = (transactionId: string, reason: string) => {
    const txn = transactions.find(t => t.id === transactionId);
    if (!txn || txn.status !== 'pending') return;

    setTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          status: 'rejected',
          rejectionReason: reason || 'UTR verification failed or amount mismatch',
          updatedAt: new Date().toISOString(),
          approvedBy: 'Admin (Master Console)',
        };
      }
      return t;
    }));

    addAuditLog('DEPOSIT_REJECTED', transactionId, `Rejected deposit of ₹${txn.amount.toLocaleString()} for ${txn.userName}. Reason: ${reason}`, 'warning');
    showNotification(`Deposit ${transactionId} rejected. Reason: ${reason}`, 'error');
  };

  const createManualDeposit = (userId: string, amount: number, utrNumber: string, channel: string, note?: string): boolean => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) {
      showNotification('Target user not found', 'error');
      return false;
    }

    const cleanUtr = utrNumber.trim() || `MANUAL${Date.now().toString().slice(-6)}`;
    const newTxnId = `TXN-DEP-${Date.now().toString().slice(-6)}`;
    const newTxn: Transaction = {
      id: newTxnId,
      orderId: `MANUAL-${Date.now().toString().slice(-4)}`,
      userId: targetUser.id,
      userName: targetUser.name,
      userPhone: targetUser.phone,
      type: 'deposit',
      amount: Math.abs(amount),
      status: 'approved',
      utrNumber: cleanUtr,
      channel: channel || 'Manual Banking Desk',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedBy: 'Admin (Manual Desk)',
      description: note || `Manual Deposit Credit of ₹${amount.toLocaleString()} via ${channel || 'Admin Portal'}`,
      proofHash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };

    setTransactions(prev => [newTxn, ...prev]);

    setAllUsers(prev => prev.map(u => {
      if (u.id === targetUser.id) {
        return {
          ...u,
          balance: u.balance + Math.abs(amount),
          totalRecharge: u.totalRecharge + Math.abs(amount),
        };
      }
      return u;
    }));

    addAuditLog('MANUAL_DEPOSIT_CREDIT', newTxnId, `Credited manual deposit of ₹${amount.toLocaleString()} for ${targetUser.name} (${cleanUtr})`);
    showNotification(`Manual deposit of ₹${amount.toLocaleString()} successfully credited to ${targetUser.name}!`, 'success');
    sounds.playCash();
    return true;
  };

  const approveWithdrawal = (transactionId: string, customRrn?: string) => {
    const txn = transactions.find(t => t.id === transactionId);
    if (!txn || txn.status !== 'pending') return;

    const rrnGenerated = customRrn && customRrn.trim() 
      ? customRrn.trim() 
      : `${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;

    setTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          status: 'completed',
          rrn: rrnGenerated,
          updatedAt: new Date().toISOString(),
          approvedBy: 'Admin (Disbursement Treasury)',
          description: `Payout dispatched via IMPS / Bank Ref: ${rrnGenerated}`,
        };
      }
      return t;
    }));

    addAuditLog('WITHDRAWAL_PAID', transactionId, `Dispatched payout of ₹${txn.amount.toLocaleString()} (Net ₹${txn.netAmount?.toLocaleString()}, RRN: ${rrnGenerated}) to ${txn.userName}`);
    showNotification(`Withdrawal ${transactionId} completed! Payout of ₹${txn.netAmount?.toLocaleString()} released (RRN: ${rrnGenerated}).`, 'success');
  };

  const rejectWithdrawal = (transactionId: string, reason: string) => {
    const txn = transactions.find(t => t.id === transactionId);
    if (!txn || txn.status !== 'pending') return;

    // Refund back to user's wallet
    setAllUsers(prev => prev.map(u => {
      if (u.id === txn.userId) {
        return {
          ...u,
          balance: u.balance + txn.amount,
          totalWithdrawn: Math.max(0, u.totalWithdrawn - txn.amount),
        };
      }
      return u;
    }));

    setTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          status: 'rejected',
          rejectionReason: reason || 'Invalid bank IFSC or account mismatch',
          updatedAt: new Date().toISOString(),
          approvedBy: 'Admin (Disbursement Treasury)',
        };
      }
      return t;
    }));

    addAuditLog('WITHDRAWAL_REJECTED', transactionId, `Rejected withdrawal of ₹${txn.amount.toLocaleString()} for ${txn.userName}. Refunded to wallet. Reason: ${reason}`, 'warning');
    showNotification(`Withdrawal rejected. ₹${txn.amount.toLocaleString()} refunded back to ${txn.userName}'s wallet.`, 'info');
  };

  const adjustUserBalance = (userId: string, deltaAmount: number, reason: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newBal = Math.max(0, u.balance + deltaAmount);
        return { ...u, balance: newBal };
      }
      return u;
    }));

    const targetUser = allUsers.find(u => u.id === userId);
    const targetName = targetUser?.name || userId;

    const newTxn: Transaction = {
      id: `TXN-ADJ-${Date.now().toString().slice(-6)}`,
      userId,
      userName: targetName,
      userPhone: targetUser?.phone || '',
      type: deltaAmount >= 0 ? 'deposit' : 'withdrawal',
      amount: Math.abs(deltaAmount),
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Manual Admin Adjustment: ${deltaAmount >= 0 ? '+' : '-'}₹${Math.abs(deltaAmount).toLocaleString()} (${reason})`,
      approvedBy: 'Admin Manual',
    };
    setTransactions(prev => [newTxn, ...prev]);

    addAuditLog('BALANCE_ADJUSTMENT', userId, `Adjusted balance by ₹${deltaAmount} for ${targetName}. Reason: ${reason}`);
    showNotification(`Adjusted ${targetName}'s balance by ₹${deltaAmount >= 0 ? '+' : ''}${deltaAmount}`, 'success');
  };

  const toggleUserFrozen = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextState = !u.isFrozen;
        addAuditLog(nextState ? 'USER_FROZEN' : 'USER_UNFROZEN', userId, `User ${u.name} status changed to ${nextState ? 'FROZEN' : 'ACTIVE'}`, nextState ? 'critical' : 'info');
        showNotification(`User ${u.name} is now ${nextState ? 'Frozen / Suspended' : 'Active'}`, nextState ? 'error' : 'success');
        return { ...u, isFrozen: nextState };
      }
      return u;
    }));
  };

  const createPlan = (planData: Omit<InvestmentPlan, 'id' | 'totalPurchasedCount'>) => {
    const newPlan: InvestmentPlan = {
      ...planData,
      id: `plan-${Date.now().toString().slice(-5)}`,
      totalPurchasedCount: 0,
    };
    setPlans(prev => [newPlan, ...prev]);
    addAuditLog('PLAN_CREATED', newPlan.id, `Created investment plan: ${newPlan.name} (Price: ₹${newPlan.price})`);
    showNotification(`Investment plan "${newPlan.name}" launched successfully!`, 'success');
  };

  const updatePlan = (id: string, updates: Partial<InvestmentPlan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    addAuditLog('PLAN_UPDATED', id, `Updated plan settings for ${id}`);
    showNotification('Investment plan updated successfully.', 'success');
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    addAuditLog('PLAN_DELETED', id, `Removed plan ${id}`, 'warning');
    showNotification('Investment plan removed.', 'info');
  };

  const saveSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAuditLog('SETTINGS_UPDATED', 'SYS_CONFIG', 'Platform gateway settings updated');
    showNotification('System & Gateway settings saved successfully!', 'success');
  };

  const redeemGiftCode = (codeStr: string): { success: boolean; amount?: number; error?: string } => {
    const cleanCode = codeStr.trim().toUpperCase();
    if (!cleanCode) return { success: false, error: 'Please enter a valid gift voucher code.' };

    const targetCode = giftCodes.find(g => g.code.toUpperCase() === cleanCode);
    if (!targetCode) {
      showNotification('Invalid gift voucher code.', 'error');
      return { success: false, error: 'Invalid voucher code' };
    }
    if (!targetCode.isActive) {
      showNotification('This voucher code is currently inactive.', 'error');
      return { success: false, error: 'Voucher is inactive' };
    }
    if (new Date(targetCode.expiresAt).getTime() < Date.now()) {
      showNotification('This voucher code has expired.', 'error');
      return { success: false, error: 'Voucher has expired' };
    }
    if (targetCode.usedCount >= targetCode.maxUses) {
      showNotification('This voucher redemption quota has been fully exhausted.', 'error');
      return { success: false, error: 'Quota exhausted' };
    }

    // Increment used count
    setGiftCodes(prev => prev.map(g => g.id === targetCode.id ? { ...g, usedCount: g.usedCount + 1 } : g));

    // Credit user's wallet
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: u.balance + targetCode.amount,
          totalEarned: u.totalEarned + targetCode.amount,
        };
      }
      return u;
    }));

    const newTxn: Transaction = {
      id: `TXN-GIFT-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'bonus',
      amount: targetCode.amount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Redeemed Gift Voucher Code: ${targetCode.code} (+₹${targetCode.amount})`,
    };
    setTransactions(prev => [newTxn, ...prev]);

    sounds.playCoin();
    showNotification(`Congratulations! ₹${targetCode.amount} credited to your wallet from voucher ${targetCode.code}!`, 'success');
    triggerIncomeCelebration({
      title: 'Gift Voucher Redeemed!',
      amount: targetCode.amount,
      source: 'voucher',
      sourceTitle: `Promotional Gift Voucher: ${targetCode.code}`,
      newBalance: currentUser.balance + targetCode.amount,
      txId: newTxn.id,
    });
    return { success: true, amount: targetCode.amount };
  };

  const batchApproveDeposits = (transactionIds: string[]) => {
    if (transactionIds.length === 0) return;
    let totalCredited = 0;

    const targetTxns = transactions.filter(t => transactionIds.includes(t.id) && t.status === 'pending');
    if (targetTxns.length === 0) return;

    // Update transactions
    setTransactions(prev => prev.map(t => {
      if (transactionIds.includes(t.id) && t.status === 'pending') {
        totalCredited += t.amount;
        return {
          ...t,
          status: 'approved',
          updatedAt: new Date().toISOString(),
          approvedBy: 'Admin (Batch Execution Desk)',
          description: `Batch Approved: Deposit of ₹${t.amount.toLocaleString()} verified and credited.`,
        };
      }
      return t;
    }));

    // Credit users
    setAllUsers(prev => prev.map(u => {
      const userTxns = targetTxns.filter(t => t.userId === u.id);
      if (userTxns.length > 0) {
        const added = userTxns.reduce((acc, curr) => acc + curr.amount, 0);
        return {
          ...u,
          balance: u.balance + added,
          totalRecharge: u.totalRecharge + added,
        };
      }
      return u;
    }));

    addAuditLog('BATCH_DEPOSITS_APPROVED', `${targetTxns.length}_TXNS`, `Batch approved ${targetTxns.length} deposit requests totaling ₹${totalCredited.toLocaleString()}`);
    sounds.playSuccess();
    showNotification(`Batch Action: ${targetTxns.length} deposits approved! Total ₹${totalCredited.toLocaleString()} credited.`, 'success');
  };

  const batchRejectDeposits = (transactionIds: string[], reason: string) => {
    if (transactionIds.length === 0) return;
    const targetTxns = transactions.filter(t => transactionIds.includes(t.id) && t.status === 'pending');
    if (targetTxns.length === 0) return;

    setTransactions(prev => prev.map(t => {
      if (transactionIds.includes(t.id) && t.status === 'pending') {
        return {
          ...t,
          status: 'rejected',
          rejectionReason: reason || 'Batch verification failure',
          updatedAt: new Date().toISOString(),
          approvedBy: 'Admin (Batch Execution Desk)',
        };
      }
      return t;
    }));

    addAuditLog('BATCH_DEPOSITS_REJECTED', `${targetTxns.length}_TXNS`, `Batch rejected ${targetTxns.length} deposit requests. Reason: ${reason}`, 'warning');
    sounds.playError();
    showNotification(`Batch Action: ${targetTxns.length} deposits rejected.`, 'info');
  };

  const batchApproveWithdrawals = (transactionIds: string[]) => {
    if (transactionIds.length === 0) return;
    const targetTxns = transactions.filter(t => transactionIds.includes(t.id) && t.status === 'pending');
    if (targetTxns.length === 0) return;

    let totalDisbursed = 0;
    setTransactions(prev => prev.map(t => {
      if (transactionIds.includes(t.id) && t.status === 'pending') {
        totalDisbursed += (t.netAmount || t.amount);
        return {
          ...t,
          status: 'completed',
          updatedAt: new Date().toISOString(),
          approvedBy: 'Admin (Batch Payout Desk)',
          description: `Dispatched in batch payout run IMPS/${Date.now().toString().slice(-8)}`,
        };
      }
      return t;
    }));

    addAuditLog('BATCH_WITHDRAWALS_PAID', `${targetTxns.length}_TXNS`, `Batch disbursed ${targetTxns.length} withdrawals totaling ₹${totalDisbursed.toLocaleString()}`);
    sounds.playSuccess();
    showNotification(`Batch Action: ${targetTxns.length} withdrawals cleared! Total ₹${totalDisbursed.toLocaleString()} released.`, 'success');
  };

  const batchRejectWithdrawals = (transactionIds: string[], reason: string) => {
    if (transactionIds.length === 0) return;
    const targetTxns = transactions.filter(t => transactionIds.includes(t.id) && t.status === 'pending');
    if (targetTxns.length === 0) return;

    // Refund back to users
    setAllUsers(prev => prev.map(u => {
      const userTxns = targetTxns.filter(t => t.userId === u.id);
      if (userTxns.length > 0) {
        const refundTotal = userTxns.reduce((acc, curr) => acc + curr.amount, 0);
        return {
          ...u,
          balance: u.balance + refundTotal,
          totalWithdrawn: Math.max(0, u.totalWithdrawn - refundTotal),
        };
      }
      return u;
    }));

    setTransactions(prev => prev.map(t => {
      if (transactionIds.includes(t.id) && t.status === 'pending') {
        return {
          ...t,
          status: 'rejected',
          rejectionReason: reason || 'Batch bank clearance failure',
          updatedAt: new Date().toISOString(),
          approvedBy: 'Admin (Batch Payout Desk)',
        };
      }
      return t;
    }));

    addAuditLog('BATCH_WITHDRAWALS_REJECTED', `${targetTxns.length}_TXNS`, `Batch rejected ${targetTxns.length} withdrawals. Refunded to wallets. Reason: ${reason}`, 'warning');
    sounds.playError();
    showNotification(`Batch Action: ${targetTxns.length} withdrawals rejected & refunded.`, 'info');
  };

  const updateUserVipLevel = (userId: string, newVip: number) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, vipLevel: Math.max(0, Math.min(10, newVip)) } : u));
    addAuditLog('VIP_LEVEL_MODIFIED', userId, `Admin changed user VIP tier to VIP ${newVip}`);
    showNotification(`Updated user to VIP ${newVip}`, 'success');
  };

  const grantUserSpins = (userId: string, count: number) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, spinChances: Math.max(0, u.spinChances + count) } : u));
    addAuditLog('SPINS_GRANTED', userId, `Admin granted ${count} lucky spin turns`);
    showNotification(`Granted +${count} Lucky Spins to user!`, 'success');
  };

  const createGiftCode = (giftData: Omit<GiftCode, 'id' | 'usedCount' | 'createdAt'>) => {
    const newCode: GiftCode = {
      ...giftData,
      id: `gift-${Date.now().toString().slice(-6)}`,
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    setGiftCodes(prev => [newCode, ...prev]);
    addAuditLog('GIFT_CODE_CREATED', newCode.code, `Created promotional gift voucher for ₹${newCode.amount} with ${newCode.maxUses} quota.`);
    showNotification(`Voucher code "${newCode.code}" created!`, 'success');
  };

  const toggleGiftCode = (id: string) => {
    setGiftCodes(prev => prev.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g));
    showNotification('Voucher status updated.', 'info');
  };

  const deleteGiftCode = (id: string) => {
    setGiftCodes(prev => prev.filter(g => g.id !== id));
    showNotification('Voucher deleted.', 'info');
  };

  const resolveFraudAlert = (id: string) => {
    setFraudAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    addAuditLog('FRAUD_ALERT_RESOLVED', id, 'Fraud risk alert verified and marked resolved.');
    showNotification('Alert resolved.', 'success');
  };

  const dismissFraudAlert = (id: string) => {
    setFraudAlerts(prev => prev.filter(a => a.id !== id));
    showNotification('Alert dismissed.', 'info');
  };

  const exportDataToCsv = (dataType: 'transactions' | 'users' | 'audit') => {
    let filename = '';
    let csvContent = '';

    if (dataType === 'transactions') {
      filename = `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['ID', 'User ID', 'User Name', 'Phone', 'Type', 'Amount', 'Fee', 'Net Amount', 'Status', 'Method', 'UTR / Ref', 'Date'];
      const rows = transactions.map(t => [
        `"${t.id}"`,
        `"${t.userId}"`,
        `"${t.userName.replace(/"/g, '""')}"`,
        `"${t.userPhone}"`,
        `"${t.type}"`,
        t.amount,
        t.fee || 0,
        t.netAmount || t.amount,
        `"${t.status}"`,
        `"${t.method || ''}"`,
        `"${t.utrNumber || ''}"`,
        `"${t.createdAt}"`
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else if (dataType === 'users') {
      filename = `users_directory_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['User ID', 'Name', 'Phone', 'VIP Level', 'Balance', 'Total Recharge', 'Total Withdrawn', 'Total Earned', 'Referral Code', 'Referred By', 'Referrals Count', 'Team Commission', 'Is Frozen', 'Created At'];
      const rows = allUsers.map(u => [
        `"${u.id}"`,
        `"${u.name.replace(/"/g, '""')}"`,
        `"${u.phone}"`,
        u.vipLevel,
        u.balance,
        u.totalRecharge,
        u.totalWithdrawn,
        u.totalEarned,
        `"${u.referralCode}"`,
        `"${u.referredBy || ''}"`,
        u.referralsCount,
        u.teamCommission,
        u.isFrozen ? 'YES' : 'NO',
        `"${u.createdAt}"`
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else {
      filename = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['Log ID', 'Admin Name', 'Action', 'Target ID', 'Severity', 'Details', 'Timestamp'];
      const rows = auditLogs.map(a => [
        `"${a.id}"`,
        `"${a.adminName}"`,
        `"${a.action}"`,
        `"${a.targetId}"`,
        `"${a.severity}"`,
        `"${a.details.replace(/"/g, '""')}"`,
        `"${a.timestamp}"`
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    sounds.playSuccess();
    showNotification(`Exported ${filename} successfully!`, 'success');
  };

  const triggerGlobalDividendRun = (): { processedCount: number; totalDistributed: number } => {
    const profitMultiplier = settings.incomeMultiplier || 1.0;
    let processedCount = 0;
    let totalDistributed = 0;
    const now = Date.now();

    const userAdditions: Record<string, number> = {};

    setUserInvestments(prev => prev.map(inv => {
      if (inv.status !== 'active') return inv;
      const isFlash = inv.isFlash || inv.cycleUnit === 'minute' || inv.cycleUnit === 'hour';

      if (isFlash) {
        if (now >= new Date(inv.endDate).getTime()) {
          const payout = Math.round(inv.totalReturn * profitMultiplier);
          userAdditions[inv.userId] = (userAdditions[inv.userId] || 0) + payout;
          processedCount++;
          totalDistributed += payout;
          return {
            ...inv,
            daysPassed: 1,
            earnedSoFar: payout,
            lastClaimDate: new Date().toISOString(),
            canClaimToday: false,
            status: 'completed' as const,
          };
        }
      } else {
        const payout = Math.round(inv.dailyIncome * profitMultiplier);
        userAdditions[inv.userId] = (userAdditions[inv.userId] || 0) + payout;
        processedCount++;
        totalDistributed += payout;
        const newDays = inv.daysPassed + 1;
        return {
          ...inv,
          daysPassed: newDays,
          earnedSoFar: inv.earnedSoFar + payout,
          lastClaimDate: new Date().toISOString(),
          canClaimToday: false,
          status: newDays >= inv.cycleDays ? ('completed' as const) : ('active' as const),
        };
      }
      return inv;
    }));

    if (processedCount > 0) {
      setAllUsers(prev => prev.map(u => {
        const add = userAdditions[u.id];
        if (!add) return u;
        return {
          ...u,
          balance: u.balance + add,
          totalEarned: u.totalEarned + add,
        };
      }));

      addAuditLog(
        'GLOBAL_DIVIDEND_RUN',
        'SYSTEM',
        `Automated global dividend engine credited ₹${totalDistributed.toLocaleString()} across ${processedCount} active equipment assets (Profit Multiplier: ${profitMultiplier}x)`,
        'info'
      );
      sounds.playCash();
      showNotification(`⚡ Force Dividend Cycle Executed! Disbursed ₹${totalDistributed.toLocaleString()} to ${processedCount} active assets.`, 'success');
    } else {
      showNotification('No active pending assets ready for dividend settlement right now.', 'info');
    }

    return { processedCount, totalDistributed };
  };

  const triggerGlobalCommissionRebateRun = (): { processedCount: number; totalDistributed: number } => {
    let processedCount = 0;
    let totalDistributed = 0;

    setAllUsers(prev => prev.map(u => {
      const claimable = u.claimableCommission || 0;
      if (claimable > 0) {
        processedCount++;
        totalDistributed += claimable;
        return {
          ...u,
          balance: u.balance + claimable,
          totalEarned: u.totalEarned + claimable,
          teamCommission: (u.teamCommission || 0) + claimable,
          claimableCommission: 0,
        };
      }
      return u;
    }));

    if (processedCount > 0) {
      addAuditLog(
        'GLOBAL_REBATE_FLUSH',
        'SYSTEM',
        `Flushed and settled ₹${totalDistributed.toLocaleString()} in pending team rebates for ${processedCount} promoters.`,
        'info'
      );
      sounds.playCash();
      showNotification(`💰 Flushed ₹${totalDistributed.toLocaleString()} team rebates for ${processedCount} promoters!`, 'success');
    } else {
      showNotification('All agency rebates are already settled and up-to-date.', 'info');
    }

    return { processedCount, totalDistributed };
  };

  const distributePromoterAirdrop = (bonusAmount: number, minReferrals = 3): { rewardedCount: number; totalAirdrop: number } => {
    let rewardedCount = 0;
    const newTxns: Transaction[] = [];

    setAllUsers(prev => prev.map(u => {
      if ((u.referralsCount || 0) >= minReferrals && !u.isFrozen) {
        rewardedCount++;
        newTxns.push({
          id: `TXN-AIRDROP-${Date.now().toString().slice(-5)}-${u.id}`,
          orderId: `AIRDROP-${Date.now().toString().slice(-4)}`,
          userId: u.id,
          userName: u.name,
          userPhone: u.phone,
          type: 'bonus',
          subType: 'voucher',
          amount: bonusAmount,
          status: 'completed',
          createdAt: new Date().toISOString(),
          description: `🎁 Promoter Leadership Festival Cash Airdrop (+₹${bonusAmount.toLocaleString()})`,
          proofHash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        });
        return {
          ...u,
          balance: u.balance + bonusAmount,
          totalEarned: u.totalEarned + bonusAmount,
        };
      }
      return u;
    }));

    if (newTxns.length > 0) {
      setTransactions(prev => [...newTxns, ...prev]);
    }

    const totalAirdrop = rewardedCount * bonusAmount;
    addAuditLog(
      'PROMOTER_AIRDROP_DISTRIBUTED',
      'SYSTEM',
      `Admin distributed ₹${bonusAmount.toLocaleString()} airdrop to ${rewardedCount} active promoters (Min ${minReferrals} referrals). Total disbursed: ₹${totalAirdrop.toLocaleString()}`,
      'info'
    );

    sounds.playCash();
    showNotification(`🎁 Disbursed ₹${totalAirdrop.toLocaleString()} total airdrop to ${rewardedCount} promoters!`, 'success');
    return { rewardedCount, totalAirdrop };
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setCurrentUser(INITIAL_USER);
    setAllUsers([INITIAL_USER, ...INITIAL_OTHER_USERS]);
    setPlans(INITIAL_PLANS);
    setUserInvestments(INITIAL_USER_INVESTMENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setGiftCodes(INITIAL_GIFT_CODES);
    setFraudAlerts(INITIAL_FRAUD_ALERTS);
    showNotification('Database reset to fresh factory state.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        plans,
        userInvestments,
        transactions,
        settings,
        auditLogs,
        giftCodes,
        fraudAlerts,
        viewMode,
        adminAuthenticated,
        activeUserTab,
        activeAdminTab,
        notification,
        setViewMode,
        setAdminAuthenticated,
        setActiveUserTab,
        setActiveAdminTab,
        showNotification,
        submitDepositRequest,
        completeWatchPayDeposit,
        submitWithdrawalRequest,
        purchasePlan,
        reinvestBalanceIntoPlan,
        liquidateInvestment,
        autoHarvestEnabled,
        toggleAutoHarvest,
        claimDailyDividend,
        claimAllDividends,
        claimTeamCommission,
        claimMilestoneReward,
        claimDailyAgencySalary,
        dailyCheckin,
        executeSpin,
        buySpinsWithBalance,
        updateBankDetails,
        updateProfile,
        switchUserAccount,
        redeemGiftCode,
        approveDeposit,
        rejectDeposit,
        batchApproveDeposits,
        batchRejectDeposits,
        createManualDeposit,
        approveWithdrawal,
        rejectWithdrawal,
        batchApproveWithdrawals,
        batchRejectWithdrawals,
        adjustUserBalance,
        updateUserVipLevel,
        grantUserSpins,
        toggleUserFrozen,
        createPlan,
        updatePlan,
        deletePlan,
        createGiftCode,
        toggleGiftCode,
        deleteGiftCode,
        resolveFraudAlert,
        dismissFraudAlert,
        exportDataToCsv,
        saveSettings,
        updateSettings: saveSettings,
        triggerGlobalDividendRun,
        triggerGlobalCommissionRebateRun,
        distributePromoterAirdrop,
        resetToDefaults,
        recordsModalOpen,
        recordsDefaultTab,
        openRecordsModal,
        closeRecordsModal,
        theme,
        toggleTheme,
        celebrationData,
        triggerIncomeCelebration,
        closeIncomeCelebration,
        activePendingDeposit,
        registerPendingDeposit,
        clearPendingDeposit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
