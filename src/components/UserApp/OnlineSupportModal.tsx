import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Headphones, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  Bot
} from 'lucide-react';
import { WhatsAppIcon, TelegramIcon } from '../common/SocialIcons';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const OnlineSupportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Namaste! Welcome to 24/7 AM Customer Concierge. How can we assist you with your investments or transactions today?',
      time: 'Just now',
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const quickFaqs = [
    'How do I recharge my account?',
    'When will my withdrawal arrive?',
    'How to unlock VIP 1?',
    'Is my investment capital safe?',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text) return;

    sounds.playClick();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate smart automated reply
    setTimeout(() => {
      let replyText = 'Thank you for your inquiry. Our senior treasury desk is active 24/7. Your query has been logged.';
      const lower = text.toLowerCase();

      if (lower.includes('recharge') || lower.includes('deposit')) {
        replyText = 'To recharge: Click the "Recharge" icon on the home screen. Scan the UPI QR or copy our merchant UPI ID, complete the payment in PhonePe/GPay, and paste the 12-digit UTR reference number. Verification takes 3-10 minutes!';
      } else if (lower.includes('withdraw') || lower.includes('payout')) {
        replyText = 'Withdrawals are processed automatically via IMPS/UPI clearing between 09:00 - 20:00 daily. Net funds are usually credited within 10 to 45 minutes of admin dispatch.';
      } else if (lower.includes('vip')) {
        replyText = 'VIP tiers are automatically upgraded when you subscribe to high-return or VIP packages (such as Pidilite Green Tech Foundry or higher). VIP members enjoy priority withdrawal lanes and zero-fee claims!';
      } else if (lower.includes('safe') || lower.includes('security') || lower.includes('guarantee')) {
        replyText = 'All investment assets represent fractional industrial equipment bonds backed by active production quotas. All transactions are logged with 256-bit SSL encryption.';
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
      sounds.playCoin();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full h-[600px] flex flex-col shadow-2xl relative my-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">24/7 Priority Helpdesk</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Average response time: &lt; 1 minute</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channels banner with Authentic WhatsApp & Telegram links */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs flex-shrink-0 gap-2">
          <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Direct Channels:</span>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Real WhatsApp Direct Link */}
            <a
              href="https://api.whatsapp.com/send?phone=919876543210&text=Hello%20AM%20Support,%20I%20need%20assistance"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 font-bold flex items-center space-x-1.5 transition-all text-[11px]"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp Desk</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>

            {/* Real Telegram Direct Link */}
            <a
              href="https://t.me/AM_Official"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 font-bold flex items-center space-x-1.5 transition-all text-[11px]"
            >
              <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
              <span>Telegram Channel</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Message stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                <div className="flex items-center space-x-1 mb-1 opacity-75 text-[10px]">
                  {m.sender === 'bot' && <Bot className="w-3 h-3 text-blue-400 mr-0.5" />}
                  <span>{m.sender === 'user' ? 'You' : 'Officer Priya (Support)'}</span>
                  <span>•</span>
                  <span>{m.time}</span>
                </div>
                <p className="whitespace-pre-line">{m.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick FAQ tags */}
        <div className="p-2.5 bg-slate-950/60 border-t border-slate-800 overflow-x-auto flex space-x-2 flex-shrink-0">
          {quickFaqs.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700/60 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message here..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
