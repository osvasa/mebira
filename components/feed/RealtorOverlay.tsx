'use client';

import { useState } from 'react';
import { Send, X, CheckCircle2 } from 'lucide-react';
import { User } from '@/lib/types';

interface RealtorOverlayProps {
  user: User;
  className?: string;
}

export function RealtorOverlay({ user, className = '' }: RealtorOverlayProps) {
  const [hovered, setHovered] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const active = hovered || contactOpen;

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      setContactOpen(false);
      setSent(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 1800);
  };

  return (
    <div
      className={`fixed bottom-6 left-6 z-[10000] transition-all duration-300 ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { if (!contactOpen) setHovered(false); }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Contact form card */}
      {contactOpen && (
        <div className="mb-3 w-64 bg-black/70 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/10">
          {sent ? (
            <div className="flex flex-col items-center py-4 gap-2">
              <CheckCircle2 className="w-8 h-8 text-[#2D9B4E]" />
              <p className="text-white text-sm font-semibold">Message sent!</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-sm font-semibold">Contact {user.displayName}</p>
                <button
                  onClick={() => { setContactOpen(false); setHovered(false); }}
                  className="p-1 rounded-full hover:bg-white/10 text-white/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#2D9B4E]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#2D9B4E]"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/40 resize-none focus:outline-none focus:ring-1 focus:ring-[#2D9B4E]"
                />
                <button
                  onClick={handleSend}
                  disabled={!name.trim() || !email.trim() || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-[#2D9B4E] text-white rounded-lg text-sm font-semibold hover:bg-[#258442] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Realtor info */}
      <div className="flex items-center gap-2.5">
        <img
          src={user.avatar}
          alt={user.displayName}
          className={`rounded-full object-cover border-2 border-white/40 shadow-lg transition-all duration-300 ${
            active ? 'w-10 h-10' : 'w-9 h-9'
          }`}
        />
        <div>
          <p
            className={`text-white font-semibold transition-all duration-300 ${
              active ? 'text-sm opacity-100' : 'text-xs opacity-70'
            }`}
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
          >
            {user.displayName}
          </p>
          <p
            className={`text-white/60 transition-all duration-300 ${
              active ? 'text-xs opacity-100' : 'text-[10px] opacity-70'
            }`}
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
          >
            @{user.username}
          </p>
        </div>
      </div>

      {/* Contact button */}
      <button
        onClick={() => setContactOpen(true)}
        className={`mt-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
          active
            ? 'bg-[#2D9B4E] text-white shadow-lg opacity-100'
            : 'bg-white/20 backdrop-blur-sm text-white/90 opacity-70 hover:opacity-100'
        }`}
        style={{ textShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.3)' }}
      >
        <Send className="w-3 h-3" />
        Contact Realtor
      </button>
    </div>
  );
}
