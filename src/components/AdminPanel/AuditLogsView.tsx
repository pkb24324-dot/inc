import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  Info,
  Clock 
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'danger'>('all');

  const filtered = auditLogs.filter(log => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.targetId && log.targetId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white font-['Outfit'] flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Immutable Security Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-400">
            Chronological forensic trail of all administrative interventions and transaction releases
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search Action, Details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-48 sm:w-64"
            />
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {(['all', 'success', 'warning', 'danger'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition-colors ${
                  severityFilter === sev ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Severity</th>
                <th className="px-5 py-3.5">Action Code</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5">Forensic Event Details</th>
                <th className="px-5 py-3.5 text-right">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                  
                  {/* Timestamp */}
                  <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  {/* Severity */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        log.severity === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : log.severity === 'warning'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : log.severity === 'danger'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5 text-white font-bold text-xs">
                    {log.action}
                  </td>

                  {/* Target */}
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {log.targetId || 'SYSTEM'}
                  </td>

                  {/* Details */}
                  <td className="px-5 py-3.5 text-slate-300 font-sans text-xs max-w-md">
                    {log.details}
                  </td>

                  {/* Operator */}
                  <td className="px-5 py-3.5 text-right text-amber-400 font-bold text-xs">
                    {log.admin}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
