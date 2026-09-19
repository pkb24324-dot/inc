import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  Package, 
  Settings, 
  FileText, 
  ShieldAlert, 
  Gift, 
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  TrendingUp,
  Landmark
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { 
    activeAdminTab, 
    setActiveAdminTab, 
    transactions, 
    fraudAlerts, 
    giftCodes,
    settings,
    theme
  } = useApp();

  const isLight = theme === 'light';

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length;
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length;
  const unresolvedAlerts = fraudAlerts.filter(a => !a.resolved).length;
  const activeGifts = giftCodes.filter(g => g.isActive).length;

  const handleSelectTab = (tab: typeof activeAdminTab) => {
    sounds.playClick();
    setActiveAdminTab(tab);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard Overview',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      color: 'text-blue-400',
    },
    {
      id: 'deposits' as const,
      label: 'Deposit Approvals',
      shortLabel: 'Deposits',
      icon: ArrowDownLeft,
      color: 'text-emerald-400',
      badge: pendingDeposits > 0 ? pendingDeposits : undefined,
      badgeColor: 'bg-emerald-500 text-slate-950',
    },
    {
      id: 'withdrawals' as const,
      label: 'Withdrawal Approvals',
      shortLabel: 'Payouts',
      icon: ArrowUpRight,
      color: 'text-amber-400',
      badge: pendingWithdrawals > 0 ? pendingWithdrawals : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'treasury' as const,
      label: 'Treasury & Liquidity',
      shortLabel: 'Treasury',
      icon: Landmark,
      color: 'text-emerald-400',
    },
    {
      id: 'users' as const,
      label: 'User Directory',
      shortLabel: 'Users',
      icon: Users,
      color: 'text-indigo-400',
    },
    {
      id: 'plans' as const,
      label: 'Plans & Returns',
      shortLabel: 'Plans',
      icon: Package,
      color: 'text-purple-400',
    },
    {
      id: 'security' as const,
      label: 'Security & Risk Alerts',
      shortLabel: 'Security',
      icon: ShieldAlert,
      color: 'text-rose-400',
      badge: unresolvedAlerts > 0 ? unresolvedAlerts : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      id: 'marketing' as const,
      label: 'Vouchers & Bonuses',
      shortLabel: 'Marketing',
      icon: Gift,
      color: 'text-pink-400',
      badge: activeGifts > 0 ? activeGifts : undefined,
      badgeColor: 'bg-pink-500/30 text-pink-300',
    },
    {
      id: 'affiliate' as const,
      label: 'Affiliate & Promoters',
      shortLabel: 'Affiliates',
      icon: Network,
      color: 'text-teal-400',
    },
    {
      id: 'settings' as const,
      label: 'Payment & Sunpays Gateways',
      shortLabel: 'Gateways',
      icon: Settings,
      color: 'text-amber-300',
    },
    {
      id: 'audit' as const,
      label: 'System Audit Logs',
      shortLabel: 'Audit',
      icon: FileText,
      color: 'text-slate-400',
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-4">
      {/* Top Header inside sidebar */}
      <div>
        <div className={`px-4 pb-4 mb-2 flex items-center justify-between border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          {!isCollapsed ? (
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0 font-black text-xs font-['Outfit'] border border-white/20">
                AM
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-black uppercase tracking-wider text-blue-400 font-mono">
                  Console Nav
                </h2>
                <p className={`text-[10.5px] font-bold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {settings.platformName} Admin
                </p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-xs font-['Outfit'] border border-white/20">
              AM
            </div>
          )}

          {/* Desktop Toggle Button */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className={`hidden md:flex p-1.5 rounded-lg border transition-all cursor-pointer ${
              isLight 
                ? 'border-slate-200 hover:bg-slate-100 text-slate-600' 
                : 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-blue-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeAdminTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                title={item.label}
                className={`w-full flex items-center rounded-xl transition-all duration-150 group cursor-pointer ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5 space-x-3'
                } ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : item.color}`} />
                
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                    <span className="text-xs font-semibold truncate">
                      {item.label}
                    </span>
                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-black font-mono px-1.5 py-0.2 rounded-full flex-shrink-0 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Badge for Collapsed Mode */}
                {isCollapsed && item.badge !== undefined && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Toggle status info */}
      {!isCollapsed && (
        <div className={`px-4 pt-3 border-t ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'} text-[10px]`}>
          <div className="flex items-center justify-between">
            <span className="font-mono">Sidebar Active</span>
            <button
              onClick={onToggleCollapse}
              className="text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Collapse</span>
              <PanelLeftClose className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 md:hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isLight ? 'bg-white border-r border-slate-200' : 'bg-slate-900 border-r border-slate-800'} shadow-2xl`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:block sticky top-12 self-start h-[calc(100vh-3rem)] transition-all duration-200 flex-shrink-0 ${
          isCollapsed ? 'w-18' : 'w-60'
        } ${isLight ? 'bg-white border-r border-slate-200' : 'bg-slate-900/90 border-r border-slate-800'} backdrop-blur-md z-20`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
