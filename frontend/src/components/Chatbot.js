import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Chatbot() {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I\'m FoodBot — how can I help today?' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const quickReplies = [
    'How to place an order?',
    'Delivery time',
    'Contact support',
    'Order status'
  ];

  const botReply = (text) => {
    // Very small rule-based responses
    const t = text.toLowerCase();
    if (t.includes('how') && t.includes('place')) return "To place an order: add items to cart, go to checkout, fill address and payment or choose COD.";
    if (t.includes('delivery')) return 'Typical delivery time is 30–45 minutes depending on your location.';
    if (t.includes('contact') || t.includes('support')) return 'You can message us here and our support team will get back to you, or call 9819877891.';
    if (t.includes('status') || t.includes('track')) return 'You can track your orders in Dashboard → Order History.';
    return "Sorry, I didn't quite get that — you can ask about orders, delivery, or contact support.";
  };

  const handleSend = async (text) => {
    if (!text || sending) return;
    setSending(true);
    // add user message
    setMessages(prev => [...prev, { from: 'user', text }]);
    setInput('');

    // simple bot response
    const reply = botReply(text);
    setTimeout(() => setMessages(prev => [...prev, { from: 'bot', text: reply }]), 350);

    // If user asked to contact support, also persist message to backend
    if (text.toLowerCase().includes('contact') || text.toLowerCase().includes('support') || text.toLowerCase().includes('help')) {
      try {
        const payload = {
          user_id: auth && auth.user && auth.user.id ? auth.user.id : null,
          name: auth && auth.user && auth.user.name ? auth.user.name : null,
          phone: auth && auth.user && auth.user.phone ? auth.user.phone : null,
          email: null,
          message: text
        };
        await fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error('Failed to send support message', err);
      }
    }

    setSending(false);
  };

  return (
    <div className={`chatbot-root ${open ? 'open' : ''}`} aria-live="polite">
      <div className="chatbot-toggle" role="button" aria-label="Open chat" onClick={() => setOpen(v => !v)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>

      {open && (
        <div className="chatbot-window" role="dialog" aria-label="Chatbot window">
          <div className="chatbot-header">
            <strong>FoodBot</strong>
            <button className="btn ghost" onClick={() => setOpen(false)}>Close</button>
          </div>
          <div className="chatbot-list" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-message ${m.from === 'bot' ? 'bot' : 'user'}`}>
                <div className="chatbot-text">{m.text}</div>
              </div>
            ))}
          </div>
          <div className="chatbot-quick">
            {quickReplies.map(q => (
              <button key={q} className="btn small" onClick={() => handleSend(q)}>{q}</button>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              className="form-control"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(input); }}
              aria-label="Type message"
            />
            <button className="btn" onClick={() => handleSend(input)} disabled={sending}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
