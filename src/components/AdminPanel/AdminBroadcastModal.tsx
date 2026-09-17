import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Radio, 
  X, 
  Send, 
  AlertTriangle, 
  MessageSquare, 
  Sparkles, 
  Check, 
  Info, 
  ShieldAlert, 
  Phone, 
  SendHorizontal 
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface AdminBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminBroadcastModal: React.FC<AdminBroadcastModalProps> = ({ isOpen, onClose }) => {
  const { settings, saveSettings, showNotification, theme } = useApp();
  const isLight = theme === 'light';

  const [notice, setNotice] = useState(settings.broadcastNotice || '');
  const [broadcastType, setBroadcastType] = useState<typeof settings.broadcastType>(settings.broadcastType || 'info');
  const [telegram, setTelegram] = useState(settings.telegramSupportLink || '');
  const [whatsapp, setWhatsapp] = useState(settings.whatsappSupportLink || '');
  const [maintenance, setMaintenance] = useState(settings.maintenanceMode || false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    saveSettings({
      broadcastNotice: notice.trim(),
      broadcastType: broadcastType,
      telegramSupportLink: telegram.trim(),
      whatsappSupportLink: whatsapp.trim(),
      maintenanceMode: maintenance
    });
    showNotification('📢 Platform broadcast & support channels updated live!', 'success');
    onClose();
  };

  return (
    <div 
      id="admin-broadcast-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
    >
      <div 
        id="admin-broadcast-modal-content"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/70'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-500 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold font-['Outfit']">Global Broadcast & Support Hub</h3>
              <p className="text-[11px] text-slate-400">Dispatch live ticker announcements & emergency alerts</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 overflow-y-auto no-scrollbar">
          
          {/* Live Notice Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Platform Ticker Notice</span>
              <span className="text-[10px] text-slate-400">Shown at top of user home app</span>
            </label>
            <textarea
              rows={3}
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              placeholder="e.g. 📢 Diwali Special: +15% extra bonus on all UPI recharges today! Instant withdrawals 24/7."
              className={`w-full p-3 rounded-2xl border text-xs outline-hidden font-medium transition-all ${
                isLight 
                  ? 'bg-slate-50 border-slate-200 focus:border-blue-500' 
                  : 'bg-slate-950 border-slate-800 focus:border-blue-500 text-white'
              }`}
            />
          </div>

          {/* Broadcast Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Notice Theme & Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'info' as const, label: 'Standard Info', color: 'border-blue-500 text-blue-500' },
                { type: 'promo' as const, label: 'Promotion', color: 'border-emerald-500 text-emerald-500' },
                { type: 'warning' as const, label: 'Warning / Alert', color: 'border-amber-500 text-amber-500' },
                { type: 'celebration' as const, label: 'Festival Boost', color: 'border-purple-500 text-purple-500' },
              ].map(item => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setBroadcastType(item.type)}
                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold capitalize transition-all ${
                    broadcastType === item.type 
                      ? `${item.color} bg-blue-500/10 font-black shadow-xs` 
                      : isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Box */}
          {notice && (
            <div className="p-3 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Live User Preview</span>
              <div className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start space-x-2">
                <Radio className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5 animate-pulse" />
                <p className="flex-1">{notice}</p>
              </div>
            </div>
          )}

          {/* Official Community Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <span>Telegram Support Channel</span>
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="https://t.me/your_channel"
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-hidden ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <span>WhatsApp Customer Care</span>
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="https://wa.me/919999999999"
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-hidden ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Maintenance Mode Toggle */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
            maintenance ? 'border-amber-500 bg-amber-500/10' : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Emergency Maintenance Lock</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Puts the member application into read-only scheduled maintenance mode
              </p>
            </div>
            <input 
              type="checkbox"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-black shadow-lg shadow-pink-600/25 flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Broadcast Live</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
