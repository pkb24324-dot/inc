import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  Ban, 
  Zap, 
  RefreshCw,
  Cpu,
  Fingerprint,
  UserX
} from 'lucide-react';
import { FraudAlert } from '../../types';
import { sounds } from '../../utils/audio';

export const SecurityMonitor: React.FC = () => {
  const { 
    fraudAlerts, 
    resolveFraudAlert, 
    dismissFraudAlert, 
    toggleUserFrozen, 
    allUsers, 
    transactions,
    settings,
    saveSettings
  } = useApp();

  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'medium' | 'low' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Compute duplicate UTRs across all transactions
  const utrMap: Record<string, number> = {};
  transactions.forEach(t => {
    if (t.utrNumber && t.utrNumber.trim()) {
      const u = t.utrNumber.trim();
      utrMap[u] = (utrMap[u] || 0) + 1;
    }
  });

  const duplicateUtrs = Object.entries(utrMap).filter(([_, count]) => count > 1);

  const filteredAlerts = fraudAlerts.filter(a => {
    if (filterSeverity === 'resolved' && !a.resolved) return false;
    if (filterSeverity !== 'all' && filterSeverity !== 'resolved') {
      if (a.resolved || a.severity !== filterSeverity) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.userName.toLowerCase().includes(q) ||
        a.userPhone.includes(q) ||
        a.details.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unresolvedCount = fraudAlerts.filter(a => !a.resolved).length;
  const criticalCount = fraudAlerts.filter(a => !a.resolved && a.severity === 'critical').length;

  const handleResolve = (id: string) => {
    sounds.playSuccess();
    resolveFraudAlert(id);
  };

  const handleDismiss = (id: string) => {
    sounds.playClick();
    dismissFraudAlert(id);
  };

  const handleFreezeAndBlock = (userId: string, alertId: string) => {
    sounds.playError();
    toggleUserFrozen(userId);
    resolveFraudAlert(alertId);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white font-['Outfit'] flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>Anti-Fraud & Risk Security Engine</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time heuristic threat detection, duplicate UTR scanner & automated account circuit breakers
          </p>
        </div>

        {/* Anti-Fraud Mode Selector */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <span className="text-[11px] text-slate-400 px-2 font-semibold">Strictness:</span>
          {(['low', 'medium', 'strict'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => saveSettings({ antiFraudStrictness: mode })}
              className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all ${
                settings.antiFraudStrictness === mode
                  ? mode === 'strict'
                    ? 'bg-red-500 text-slate-950 shadow-md shadow-red-500/20 font-black'
                    : mode === 'medium'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Security Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Threat Level */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Risk Posture</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              criticalCount > 0 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black font-['Outfit'] ${criticalCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {criticalCount > 0 ? 'High Alert' : unresolvedCount > 0 ? 'Guarded' : 'Secured'}
          </div>
          <div className="text-[11px] text-slate-400">
            {unresolvedCount} Active Flagged Incidents
          </div>
        </div>

        {/* Duplicate UTR Check */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Duplicate UTRs</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Fingerprint className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {duplicateUtrs.length}
          </div>
          <div className="text-[11px] text-amber-400 font-semibold">
            {duplicateUtrs.length > 0 ? 'Recycled UTR submissions detected' : 'Zero duplicate UTR anomalies'}
          </div>
        </div>

        {/* Frozen Accounts */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Quarantine Blacklist</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-400 font-mono">
            {allUsers.filter(u => u.isFrozen).length}
          </div>
          <div className="text-[11px] text-slate-400">
            Frozen Suspended User Accounts
          </div>
        </div>

        {/* Global Security Circuit Breakers */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Emergency Killswitch</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => saveSettings({ globalFreezeWithdrawals: !settings.globalFreezeWithdrawals })}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                settings.globalFreezeWithdrawals
                  ? 'bg-red-500 text-slate-950 shadow-md shadow-red-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {settings.globalFreezeWithdrawals ? '🛑 Payouts Frozen' : 'Payouts Open'}
            </button>
            <button
              onClick={() => saveSettings({ maintenanceMode: !settings.maintenanceMode })}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                settings.maintenanceMode
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {settings.maintenanceMode ? '🔧 Maintenance ON' : 'Live Mode'}
            </button>
          </div>
        </div>

      </div>

      {/* Duplicate UTR Detected Warning Card (if any) */}
      {duplicateUtrs.length > 0 && (
        <div className="bg-red-950/40 border border-red-500/40 rounded-3xl p-5 space-y-3 shadow-lg animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <h3 className="font-extrabold text-sm text-white font-['Outfit']">
                Duplicate UTR Fraud Warning Detected ({duplicateUtrs.length} Conflict Groups)
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">
              Action Recommended
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {duplicateUtrs.map(([utr, count]) => {
              const matchedTxns = transactions.filter(t => t.utrNumber?.trim() === utr);
              return (
                <div key={utr} className="bg-slate-950/80 border border-red-900/60 p-3.5 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-amber-400">UTR: {utr}</span>
                    <span className="text-[10px] bg-red-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                      Used {count} times
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    {matchedTxns.map(m => (
                      <div key={m.id} className="flex justify-between text-slate-400">
                        <span>{m.userName} ({m.userPhone})</span>
                        <span className="font-mono text-white">₹{m.amount.toLocaleString()} ({m.status})</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Incident Log Stream & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-base text-white font-['Outfit']">
              Security Anomaly Incidents Queue
            </h3>
            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full font-bold">
              {filteredAlerts.length}
            </span>
          </div>

          {/* Search & Filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search Incident or Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none w-48 sm:w-56"
              />
            </div>

            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              {(['all', 'critical', 'medium', 'low', 'resolved'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterSeverity(tab)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-colors ${
                    filterSeverity === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alert Cards */}
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-slate-400">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-400" />
            <p className="text-sm font-bold text-white">All Security Threats Neutralized</p>
            <p className="text-xs">No active suspicious activity detected matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map(alert => {
              const targetUser = allUsers.find(u => u.id === alert.userId);
              const isUserFrozen = targetUser?.isFrozen ?? false;

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    alert.resolved
                      ? 'bg-slate-950/50 border-slate-800 opacity-60'
                      : alert.severity === 'critical'
                      ? 'bg-red-950/20 border-red-500/40 shadow-md'
                      : alert.severity === 'medium'
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          alert.severity === 'critical'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                            : alert.severity === 'medium'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}>
                          {alert.severity} Risk
                        </span>

                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                          {alert.type.replace('_', ' ').toUpperCase()}
                        </span>

                        <span className="font-extrabold text-sm text-white">
                          {alert.userName} ({alert.userPhone})
                        </span>

                        {isUserFrozen && (
                          <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                            Account Frozen
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {alert.details}
                      </p>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                        <span>Timestamp: {new Date(alert.timestamp).toLocaleString()}</span>
                        {alert.amount && (
                          <span>Flagged Amount: <strong className="font-mono text-white font-bold">₹{alert.amount.toLocaleString()}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                      {!alert.resolved ? (
                        <>
                          {!isUserFrozen && (
                            <button
                              onClick={() => handleFreezeAndBlock(alert.userId, alert.id)}
                              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30"
                              title="Freeze User Account and resolve incident"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Freeze Account</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Resolved</span>
                          </span>
                          <button
                            onClick={() => handleDismiss(alert.id)}
                            className="text-slate-500 hover:text-slate-300 text-xs"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
