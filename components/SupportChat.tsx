'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  HelpCircle, 
  Clock, 
  Gift, 
  ChevronRight, 
  ArrowLeft, 
  MessageSquare, 
  ExternalLink,
  Phone
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: {
    username: string;
    role: string;
  };
  createdAt: string;
}

type ViewState = 'MENU' | 'CHAT' | 'HOW_TO_DEPOSIT' | 'DEPOSIT_TIME' | 'BONUS';

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ViewState>('MENU');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [adminWhatsapp, setAdminWhatsapp] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch WhatsApp number
    fetch('/api/config/public')
      .then(r => r.json())
      .then(d => setAdminWhatsapp(d.whatsappNumber || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen && view === 'CHAT') {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, view]);

  useEffect(() => {
    if (view === 'CHAT') {
      scrollToBottom();
    }
  }, [messages, view]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
            setMessages(data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenWhatsapp = () => {
    if (adminWhatsapp) {
      window.open(`https://wa.me/${adminWhatsapp}`, '_blank');
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir soporte"
          className="w-14 h-14 bg-primary text-black rounded-full shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-110 transition-all duration-300 hover:rotate-12 group"
        >
          <HelpCircle className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-[#050505]"></span>
        </button>
      </div>
    );
  }

  const renderHeader = (title: string, showBack: boolean = true) => (
    <div className="p-4 bg-black/40 border-b border-white/5 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={() => setView('MENU')}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            aria-label="Volver al menú"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h3 className="font-bold text-white text-lg">{title}</h3>
      </div>
      <button 
        onClick={() => {
          setIsOpen(false);
          setView('MENU'); // Reset view on close
        }}
        className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
        aria-label="Cerrar panel"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );

  const renderMenu = () => (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      <div className="p-6 bg-gradient-to-b from-primary/20 to-transparent">
        <h2 className="text-2xl font-black text-white mb-2">Centro de Ayuda</h2>
        <p className="text-gray-400 text-sm">¿En qué podemos ayudarte hoy?</p>
      </div>
      
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        <button
          onClick={() => setView('HOW_TO_DEPOSIT')}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <span className="font-bold text-white">¿Cómo depositar?</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
        </button>

        <button
          onClick={() => setView('DEPOSIT_TIME')}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-lg group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <span className="font-bold text-white">Tiempo de demora</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
        </button>

        <button
          onClick={() => setView('BONUS')}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
              <Gift className="w-6 h-6" />
            </div>
            <span className="font-bold text-white">Bonos y Promociones</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
        </button>

        <div className="h-px bg-white/10 my-2"></div>

        <button
          onClick={() => setView('CHAT')}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-400 rounded-lg group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="font-bold text-white block">Chat en Vivo</span>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Agentes online
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
        </button>

        {adminWhatsapp && (
          <button
            onClick={handleOpenWhatsapp}
            className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-xl p-4 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#25D366]/20 text-[#25D366] rounded-lg group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <span className="font-bold text-white">Soporte WhatsApp</span>
            </div>
            <ExternalLink className="w-5 h-5 text-[#25D366]" />
          </button>
        )}
      </div>
    </div>
  );

  const renderInfoView = (title: string, content: React.ReactNode, icon: React.ReactNode) => (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      {renderHeader(title)}
      <div className="p-6 overflow-y-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-4 bg-white/5 rounded-full mb-4">
            {icon}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        </div>
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
          {content}
        </div>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      {renderHeader('Chat de Soporte')}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 opacity-50">
            <MessageSquare className="w-12 h-12" />
            <p>Inicia una conversación...</p>
          </div>
        )}
        {messages.map((msg) => {
          const isAdmin = msg.sender.role === 'ADMIN';
          
          return (
            <div
              key={msg.id}
              className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                  isAdmin
                    ? 'bg-[#2a2a2a] text-white rounded-tl-none border border-white/10'
                    : 'bg-primary text-black rounded-tr-none font-medium'
                }`}
              >
                {isAdmin && (
                   <div className="text-xs mb-1 font-bold text-primary flex items-center gap-1">
                     <span className="w-1 h-1 rounded-full bg-primary"></span>
                     SOPORTE
                   </div>
                )}
                <p className="leading-relaxed">{msg.content}</p>
                <span className={`text-[10px] block mt-1 text-right ${isAdmin ? 'text-gray-400' : 'text-black/50'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-[#1a1a1a]">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu consulta..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 p-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-gray-500"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#121212] border-l border-white/10 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {view === 'MENU' && (
          <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="p-4 bg-black/40 border-b border-white/5 flex justify-end backdrop-blur-md">
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {renderMenu()}
          </div>
        )}

        {view === 'CHAT' && renderChat()}

        {view === 'HOW_TO_DEPOSIT' && renderInfoView(
          '¿Cómo depositar?',
          <>
            <p>Depositar en tu cuenta es muy sencillo y rápido. Sigue estos pasos:</p>
            <ol className="list-decimal pl-4 space-y-2 marker:text-primary">
              <li>Dirígete a la sección <strong>"CARGAR FICHAS YA!"</strong> en tu panel principal.</li>
              <li>Haz clic en el botón <strong>"Depositar"</strong>.</li>
              <li>Ingresa el monto que deseas cargar.</li>
              <li>Elige tu método de pago preferido (Transferencia o MercadoPago).</li>
              <li>Realiza el pago siguiendo las instrucciones en pantalla.</li>
            </ol>
            <p className="text-primary font-bold mt-4">¡Listo! Tus fichas se acreditarán automáticamente en segundos.</p>
          </>,
          <HelpCircle className="w-10 h-10 text-blue-400" />
        )}

        {view === 'DEPOSIT_TIME' && renderInfoView(
          'Tiempo de demora',
          <>
            <p>Nuestro sistema de acreditación es <strong>automático e instantáneo</strong>.</p>
            <p>Normalmente, verás tus fichas reflejadas en tu cuenta en menos de <strong>60 segundos</strong> después de realizar el pago.</p>
            <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg my-4">
              <p className="text-yellow-200 text-xs">
                Nota: En ocasiones, las redes bancarias pueden presentar demoras ajenas a nosotros. Si tu carga no impacta en 5 minutos, contáctanos por chat.
              </p>
            </div>
          </>,
          <Clock className="w-10 h-10 text-yellow-400" />
        )}

        {view === 'BONUS' && renderInfoView(
          'Bonos y Promociones',
          <>
            <p>¡Nos encanta premiar a nuestros jugadores!</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Gift className="w-4 h-4 text-purple-400 mt-1" />
                <span><strong>Bono de Bienvenida:</strong> 100% extra en tu primera carga.</span>
              </li>
              <li className="flex items-start gap-2">
                <Gift className="w-4 h-4 text-purple-400 mt-1" />
                <span><strong>Cashback Semanal:</strong> Recupera un porcentaje de tus pérdidas cada lunes.</span>
              </li>
            </ul>
            <p className="mt-4">Mantente atento a nuestros canales de comunicación para no perderte ninguna oferta especial.</p>
          </>,
          <Gift className="w-10 h-10 text-purple-400" />
        )}
      </div>
    </>
  );
}
