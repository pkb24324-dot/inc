import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminHeader } from './AdminHeader';
import { AdminDashboard } from './AdminDashboard';
import { DepositApprovals } from './DepositApprovals';
import { WithdrawalApprovals } from './WithdrawalApprovals';
import { UserManager } from './UserManager';
import { PlanManager } from './PlanManager';
import { GatewaySettings } from './GatewaySettings';
import { AuditLogsView } from './AuditLogsView';
import { SecurityMonitor } from './SecurityMonitor';
import { MarketingManager } from './MarketingManager';
import { AffiliateManager } from './AffiliateManager';

export const AdminPanel: React.FC = () => {
  const { activeAdminTab, theme } = useApp();

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'} flex flex-col transition-colors duration-200`}>
      {/* Admin Tab Navigation Header */}
      <AdminHeader />

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeAdminTab === 'dashboard' && <AdminDashboard />}
        {activeAdminTab === 'deposits' && <DepositApprovals />}
        {activeAdminTab === 'withdrawals' && <WithdrawalApprovals />}
        {activeAdminTab === 'users' && <UserManager />}
        {activeAdminTab === 'plans' && <PlanManager />}
        {activeAdminTab === 'security' && <SecurityMonitor />}
        {activeAdminTab === 'marketing' && <MarketingManager />}
        {activeAdminTab === 'affiliate' && <AffiliateManager />}
        {activeAdminTab === 'settings' && <GatewaySettings />}
        {activeAdminTab === 'audit' && <AuditLogsView />}
      </main>
    </div>
  );
};
