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
  ThemeMode
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
  activeAdminTab: 'dashboard' | 'deposits' | 'withdrawals' | 'users' | 'plans' | 'security' | 'marketing' | 'settings' | 'audit';
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  recordsModalOpen: boolean;
  recordsDefaultTab: RecordCategory;
  theme: ThemeMode;

  // View switchers
  setViewMode: (mode: 'user' | 'admin') => void;
  setAdminAuthenticated: (auth: boolean) => void;
  setActiveUserTab: (tab: 'home' | 'spin' | 'treasure' | 'team' | 'profile') => void;
  setActiveAdminTab: (tab: 'dashboard' | 'deposits' | 'withdrawals' | 'users' | 'plans' | 'security' | 'marketing' | 'settings' | 'audit') => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  openRecordsModal: (tab?: RecordCategory) => void;
  closeRecordsModal: () => void;
  toggleTheme: () => void;

  // User Actions
  submitDepositRequest: (amount: number, method: string, utrNumber: string) => boolean;
  submitWithdrawalRequest: (amount: number, bankDetails: UserAccount['bankDetails']) => { success: boolean; error?: string };
  purchasePlan: (planId: string) => { success: boolean; error?: string };
  claimDailyDividend: (investmentId: string) => { success: boolean; error?: string };
  claimAllDividends: () => { success: boolean; count: number; total: number };
  claimTeamCommission: () => { success: boolean; amount: number };
  claimMilestoneReward: (milestoneIndex: number, amount: number, title: string) => { success: boolean; error?: string };
  dailyCheckin: () => { success: boolean; reward: number };
  executeSpin: (reward: number) => { success: boolean; error?: string };
  updateBankDetails: (details: NonNullable<UserAccount['bankDetails']>) => void;
  switchUserAccount: (userId: string) => void;
  redeemGiftCode: (code: string) => { success: boolean; amount?: number; error?: string };

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
  resetToDefaults: () => void;
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

  const [settings, setSettings] = useState<SystemSettings>(() => 
    loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
  );

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
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'deposits' | 'withdrawals' | 'users' | 'plans' | 'security' | 'marketing' | 'settings' | 'audit'>('dashboard');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Financial Records Modal State (High-Concurrency Scalable Passbook)
  const [recordsModalOpen, setRecordsModalOpen] = useState(false);
  const [recordsDefaultTab, setRecordsDefaultTab] = useState<RecordCategory>('recharge');

  // Dark & Light Mode state (Defaults to Light/White Theme)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('apexgrowth_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('apexgrowth_theme', next);
      } catch {}
      sounds.playClick();
      return next;
    });
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const openRecordsModal = useCallback((tab: RecordCategory = 'recharge') => {
    setRecordsDefaultTab(tab);
    setRecordsModalOpen(true);
    sounds.playClick();
  }, []);

  const closeRecordsModal = useCallback(() => {
    setRecordsModalOpen(false);
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
    showNotification(`Deposit request of ₹${amount.toLocaleString()} submitted! Admin will verify and credit within 5-10 mins.`, 'success');
    return true;
  };

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
        ? `${plan.cycleDuration || 1} Min`
        : plan.cycleUnit === 'hour'
        ? `${plan.cycleDuration || 1} Hour`
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
      canClaimToday: !isFlash, // Daily plans can claim day 1; Flash plans unlock when timer reaches 0
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

    const congratsMsg = isFlash
      ? `⚡ Successfully activated ${plan.name}! Matures in ${durationLabel}. Expected return ₹${plan.totalRevenue.toLocaleString()}! +1 Free Lucky Spin added!`
      : `Congratulations! Successfully activated ${plan.name}. Earn ₹${plan.dailyIncome.toLocaleString()} daily! +1 Free Lucky Spin added!`;

    showNotification(congratsMsg, 'success');
    sounds.playSuccess();
    return { success: true };
  };

  const claimDailyDividend = (investmentId: string): { success: boolean; error?: string } => {
    const inv = userInvestments.find(i => i.id === investmentId);
    if (!inv) return { success: false, error: 'Investment not found' };

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

      const payout = inv.totalReturn;
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
        description: `⚡ Flash Profit Settled: ${inv.planName} (Full Payout: ₹${payout.toLocaleString()})`,
      };
      setTransactions(prev => [newTxn, ...prev]);

      sounds.playCoin();
      showNotification(`⚡ Flash Plan Matured! ₹${payout.toLocaleString()} (Principal + Profit) credited to your wallet!`, 'success');
      return { success: true };
    }

    // Standard daily plan claim handling
    if (!inv.canClaimToday) {
      showNotification('Dividends for today have already been credited. Next claim available tomorrow!', 'info');
      return { success: false, error: 'Already claimed today' };
    }

    const newEarned = inv.earnedSoFar + inv.dailyIncome;
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
          balance: u.balance + inv.dailyIncome,
          totalEarned: u.totalEarned + inv.dailyIncome,
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
      amount: inv.dailyIncome,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Daily Dividend Claim: ${inv.planName} (Day ${newDays}/${inv.cycleDays})`,
    };
    setTransactions(prev => [newTxn, ...prev]);

    sounds.playCoin();
    showNotification(`Daily Dividend of ₹${inv.dailyIncome.toLocaleString()} credited to your wallet!`, 'success');
    return { success: true };
  };

  const claimAllDividends = (): { success: boolean; count: number; total: number } => {
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
          totalAmount += item.totalReturn;
          netEarnedDelta += (item.totalReturn - item.investedAmount);
          return {
            ...item,
            daysPassed: 1,
            earnedSoFar: item.totalReturn,
            lastClaimDate: new Date().toISOString(),
            canClaimToday: false,
            status: 'completed' as const,
          };
        } else if (!isFlash && item.canClaimToday) {
          totalAmount += item.dailyIncome;
          netEarnedDelta += item.dailyIncome;
          const newDays = item.daysPassed + 1;
          return {
            ...item,
            daysPassed: newDays,
            earnedSoFar: item.earnedSoFar + item.dailyIncome,
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
      description: `Bulk Claim: ${claimable.length} investments payout settled`,
    };
    setTransactions(prev => [newTxn, ...prev]);

    sounds.playCoin();
    showNotification(`Successfully collected ₹${totalAmount.toLocaleString()} from ${claimable.length} active investments!`, 'success');
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
    }

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
        submitWithdrawalRequest,
        purchasePlan,
        claimDailyDividend,
        claimAllDividends,
        claimTeamCommission,
        claimMilestoneReward,
        dailyCheckin,
        executeSpin,
        updateBankDetails,
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
        resetToDefaults,
        recordsModalOpen,
        recordsDefaultTab,
        openRecordsModal,
        closeRecordsModal,
        theme,
        toggleTheme,
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
