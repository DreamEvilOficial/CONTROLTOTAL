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
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
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
    <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h3 className="font-bold">Chat de Soporte</h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {messages.map((msg) => {
          const isMe = (currentUserRole === 'PLAYER' && msg.sender.role === 'PLAYER') ||
                       (currentUserRole !== 'PLAYER' && msg.sender.role !== 'PLAYER');
          
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  isMe
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="text-xs opacity-75 mb-1">
                  {msg.sender.role === 'ADMIN' ? (
                    <>
                      <span className="text-red-600 font-bold mr-1">[SOPORTE]</span>
                      {msg.sender.name}
                    </>
                  ) : (
                    msg.sender.name
                  )}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-xs opacity-75 mt-1 text-right">
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
        <div className="p-2 bg-gray-100 border-t flex gap-2 overflow-x-auto">
          {cvus.map((cvu) => (
            <button
              key={cvu.id}
              onClick={() => sendCvuInfo(cvu)}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs whitespace-nowrap"
            >
              Enviar {cvu.bankName}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
