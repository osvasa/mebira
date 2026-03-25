'use client';

import { useState } from 'react';
import { MessageCircle, Send, CheckCircle2 } from 'lucide-react';

export function ContactRealtorForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSend() {
    if (!validate()) return;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">Your message has been sent!</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">The realtor will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center gap-2 w-full py-3.5 text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
        style={{ backgroundColor: '#2D9B4E' }}
      >
        <MessageCircle className="w-4 h-4" />
        Contact Realtor
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <div>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-emerald-400'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-emerald-400'}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <textarea
              placeholder="I'm interested in this property..."
              rows={3}
              value={message}
              onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: '' })); }}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none resize-none transition-colors ${errors.message ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-emerald-400'}`}
            />
            {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
          </div>
          <button
            onClick={handleSend}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#2D9B4E' }}
          >
            <Send className="w-3.5 h-3.5" />
            Send Message
          </button>
        </div>
      )}
    </div>
  );
}
