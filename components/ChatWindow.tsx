'use client';

import { useEffect, useState, useRef } from 'react';

interface Message {
  id: string;
  content: string;
  sender: {
    name: string;
    role: string;
  };
  createdAt: string;
}

interface ChatWindowProps {
  transactionId: string;
  currentUserRole: string;
  onClose?: () => void;
}

interface Cvu {
  id: string;
  bankName: string;
  alias: string;
  cbu: string;
  active: boolean;
}

export default function ChatWindow({ transactionId, currentUserRole, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [cvus, setCvus] = useState<Cvu[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    if (currentUserRole === 'PLAYER' || currentUserRole === 'AGENT') {
      fetchCvus();
    }

    // Poll for new messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [transactionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const res = await fetch(`/api/transactions/${transactionId}/chat`);
    if (res.ok) {
      setMessages(await res.json());
    }
  };

  const fetchCvus = async () => {
    const res = await fetch('/api/cvus/active');
    if (res.ok) setCvus(await res.json());
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const res = await fetch(`/api/transactions/${transactionId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage }),
    });

    if (res.ok) {
      setNewMessage('');
      fetchMessages();
    }
  };

  const sendCvuInfo = async (cvu: Cvu) => {
    const content = `Por favor realiza la transferencia al siguiente CBU:\nBanco: ${cvu.bankName}\nAlias: ${cvu.alias}\nCBU: ${cvu.cbu}`;
    await fetch(`/api/transactions/${transactionId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    fetchMessages();
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center shrink-0">
        <h3 className="font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Soporte
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
            ✕
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
        {messages.map((msg) => {
          const isMe = (currentUserRole === 'PLAYER' && msg.sender.role === 'PLAYER') ||
            (currentUserRole !== 'PLAYER' && msg.sender.role !== 'PLAYER');

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-sm ${isMe
                    ? 'bg-primary text-black rounded-tr-none'
                    : 'bg-white/10 text-white rounded-tl-none'
                  }`}
              >
                <div className="text-[10px] font-bold opacity-70 mb-1 flex items-center gap-1">
                  {msg.sender.role === 'ADMIN' ? (
                    <>
                      <span className="text-red-500">[SOPORTE]</span>
                    </>
                  ) : (
                    msg.sender.name
                  )}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                <div className="text-[10px] opacity-50 mt-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (Agent Only) */}
      {currentUserRole === 'AGENT' && (
        <div className="p-2 border-t border-white/10 bg-white/5 flex gap-2 overflow-x-auto">
          {cvus.map((cvu) => (
            <button
              key={cvu.id}
              onClick={() => sendCvuInfo(cvu)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs whitespace-nowrap transition-colors border border-white/5"
            >
              Enviar {cvu.bankName}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-primary text-black px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
