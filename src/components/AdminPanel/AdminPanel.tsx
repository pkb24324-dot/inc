import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { DepositApprovals } from './DepositApprovals';
import { WithdrawalApprovals } from './WithdrawalApprovals';
import { TreasuryView } from './TreasuryView';
import { UserManager } from './UserManager';
import { PlanManager } from './PlanManager';
import { GatewaySettings } from './GatewaySettings';
import { AuditLogsView } from './AuditLogsView';
import { SecurityMonitor } from './SecurityMonitor';
import { MarketingManager } from './MarketingManager';
import { AffiliateManager } from './AffiliateManager';
import { AdminCommandPalette } from './AdminCommandPalette';
import { AdminMobileNav } from './AdminMobileNav';
import { AdminBroadcastModal } from './AdminBroadcastModal';
import { AdminBackupModal } from './AdminBackupModal';

export const AdminPanel: React.FC = () => {
  const { activeAdminTab, theme } = useApp();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K for Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'} flex flex-col transition-colors duration-200`}>
      {/* Admin Tab Navigation Header with Sidebar Toggle Button & Quick Spotlight */}
      <AdminHeader 
        onToggleSidebar={toggleSidebar}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenBroadcast={() => setIsBroadcastModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
      />

      {/* Main Admin Content Layout with Responsive Collapsible Sidebar */}
      <div className="flex-1 flex w-full">
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Admin View Container with safe bottom padding for mobile dock */}
        <main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-5 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {activeAdminTab === 'dashboard' && <AdminDashboard />}
          {activeAdminTab === 'deposits' && <DepositApprovals />}
          {activeAdminTab === 'withdrawals' && <WithdrawalApprovals />}
          {activeAdminTab === 'treasury' && <TreasuryView />}
          {activeAdminTab === 'users' && <UserManager />}
          {activeAdminTab === 'plans' && <PlanManager />}
          {activeAdminTab === 'security' && <SecurityMonitor />}
          {activeAdminTab === 'marketing' && <MarketingManager />}
          {activeAdminTab === 'affiliate' && <AffiliateManager />}
          {activeAdminTab === 'settings' && <GatewaySettings />}
          {activeAdminTab === 'audit' && <AuditLogsView />}
        </main>
      </div>

      {/* Mobile-Friendly Fixed Bottom Action Dock (Thumb-Driven UX) */}
      <AdminMobileNav 
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenBroadcast={() => setIsBroadcastModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
      />

      {/* Global Spotlight Command Palette Modal */}
      <AdminCommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenBroadcast={() => setIsBroadcastModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
      />

      {/* Global Real-Time Announcement / Broadcast Center Modal */}
      <AdminBroadcastModal 
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />

      {/* Disaster Recovery, Database JSON Backup & Restore Modal */}
      <AdminBackupModal 
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
};
