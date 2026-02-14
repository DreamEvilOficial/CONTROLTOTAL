'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Wallet, ArrowUpCircle, ArrowDownCircle, History, MessageCircle, CheckCircle, Clock, XCircle, RefreshCw, Key, Lock, ExternalLink, Copy, Check, ShieldCheck, Zap, Coins, CreditCard, Image } from 'lucide-react';
import ChatWindow from '@/components/ChatWindow';
import SupportChat from '@/components/SupportChat';

export default function PlayerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    balance: 0,
    username: '',
    platformName: '',
    platformUrl: '',
    platformUser: '',
    platformPassword: '',
    onboardingCompleted: false
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeCvus, setActiveCvus] = useState<any[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [withdrawDetails, setWithdrawDetails] = useState({ cvu: '', alias: '', bank: '' });
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [adminWhatsapp, setAdminWhatsapp] = useState<string | null>(null);

  // Payment Method State
  const [depositMethod, setDepositMethod] = useState<'MANUAL' | 'AUTO' | 'MP'>('MANUAL');
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER' | 'MP'>('TRANSFER');
  const [mpLink, setMpLink] = useState<string | null>(null);
  const [loadingMp, setLoadingMp] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [newLink, setNewLink] = useState('');

  const handleCopy = (text: string, type: 'user' | 'pass' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'user') {
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    } else if (type === 'pass') {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  useEffect(() => {
    if (selectedTx) {
      setPaymentMethod('TRANSFER');
      setMpLink(null);
    }
  }, [selectedTx]);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    fetchActiveCvus();
    fetch('/api/config/public').then(r => r.json()).then(d => setAdminWhatsapp(d.whatsappNumber || null)).catch(() => { });

    // Auto-refresh every 10s for updates
    const interval = setInterval(() => {
      fetchTransactions();
      fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/player/stats');
      if (res.ok) setStats(await res.json());
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/player/transactions');
      if (res.ok) setTransactions(await res.json());
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchActiveCvus = async () => {
    try {
      const res = await fetch('/api/cvus/active');
      if (res.ok) setActiveCvus(await res.json());
    } catch (error) {
      console.error('Error fetching CVUs:', error);
    }
  };

  // Check for platform link change
  useEffect(() => {
    if (stats.platformUrl && stats.platformName) {
      const lastLink = localStorage.getItem(`last_link_${stats.platformName}`);
      if (lastLink && lastLink !== stats.platformUrl) {
        setNewLink(stats.platformUrl);
        setShowLinkModal(true);
      }
      localStorage.setItem(`last_link_${stats.platformName}`, stats.platformUrl);
    }
  }, [stats.platformUrl, stats.platformName]);

  const handleCreatePreference = async () => {
    if (!selectedTx) return;
    setLoadingMp(true);
    try {
      const res = await fetch(`/api/transactions/${selectedTx}/preference`, { method: 'POST' });
      if (!res.ok) throw new Error('Error en la respuesta del servidor');
      const data = await res.json();
      if (data.init_point) {
        setMpLink(data.init_point);
        window.open(data.init_point, '_blank');
      } else {
        alert('Error generando link de pago: ' + (data.error || 'Desconocido'));
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    } finally {
      setLoadingMp(false);
    }
  };

  const handleTransaction = async (type: 'DEPOSIT' | 'WITHDRAW') => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    const res = await fetch('/api/player/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(amount),
        type
      }),
    });

    if (res.ok) {
      const tx = await res.json();
      setAmount('');
      setShowDepositModal(false);
      setShowWithdrawModal(false);
      fetchTransactions();

      if (type === 'DEPOSIT') {
        setSelectedTx(tx.id);
      } else {
        alert('Solicitud de retiro enviada con éxito.');
      }
    } else {
      const data = await res.json();
      alert(data.error || 'Error en la solicitud');
    }
  };

  const checkPayment = async (txId: string) => {
    setCheckingPayment(true);
    try {
      const res = await fetch(`/api/transactions/${txId}/check-mp`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'COMPLETED') {
        alert('¡Pago confirmado exitosamente!');
        fetchTransactions();
        fetchStats();
      } else {
        alert('Pago aún no detectado. Si ya transferiste, espera unos segundos e intenta de nuevo.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingPayment(false);
    }
  };


  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch('/api/player/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Contraseña actualizada correctamente');
        setShowPasswordModal(false);
        setPasswordForm({ password: '', confirmPassword: '' });
      } else {
        alert(data.error || 'Error actualizando contraseña');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error de conexión');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleOnboardingAccept = async () => {
    try {
      const res = await fetch('/api/player/onboarding', { method: 'POST' });
      if (res.ok) {
        setStats(prev => ({ ...prev, onboardingCompleted: true }));
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const selectedTransactionData = transactions.find(t => t.id === selectedTx);

  if (loadingStats) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-400 text-sm animate-pulse">Cargando tu experiencia...</p>
      </div>
    );
  }

  if (!stats.onboardingCompleted) {
    const hasCredentials = stats.platformUser && stats.platformPassword;

    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-8 relative z-10 backdrop-blur-2xl shadow-2xl shadow-black/50">
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className={`absolute inset-0 bg-primary/20 rounded-full ${!hasCredentials ? 'animate-ping' : ''}`}></div>
            <div className="relative bg-black/40 w-24 h-24 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-md">
              {hasCredentials ? (
                <CheckCircle className="w-10 h-10 text-primary" />
              ) : (
                <Clock className="w-10 h-10 text-primary animate-pulse" />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black tracking-tight text-white">
              {hasCredentials ? '¡Todo listo!' : 'Preparando tu cuenta'}
            </h2>
            <p className="text-gray-400 leading-relaxed max-w-xs mx-auto">
              {hasCredentials
                ? 'Tus credenciales de acceso han sido generadas. Guárdalas para ingresar al casino.'
                : 'Estamos configurando tu acceso exclusivo. Te notificaremos en cuanto tus credenciales estén listas.'}
            </p>
          </div>

          {hasCredentials ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-black/40 rounded-2xl p-6 border border-white/10 text-left space-y-4 shadow-inner">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Plataforma</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">{stats.platformName || 'Casino'}</span>
                    {stats.platformUrl && (
                      <div className="flex items-center gap-2">
                        <a
                          href={stats.platformUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-300 hover:text-white font-mono break-all max-w-[220px]"
                          title="Abrir sitio del casino"
                        >
                          {stats.platformUrl}
                        </a>
                        <button
                          onClick={() => handleCopy(stats.platformUrl, 'url')}
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md border border-white/5 transition-colors text-gray-400 hover:text-white"
                          title="Copiar link"
                        >
                          {copiedUrl ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="group relative">
                    <span className="text-xs text-gray-500 block mb-1.5 ml-1">Usuario</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/5 p-3.5 rounded-xl border border-white/5 font-mono text-lg font-bold select-all text-center tracking-wider text-white group-hover:border-primary/30 transition-colors">
                        {stats.platformUser}
                      </div>
                      <button
                        onClick={() => handleCopy(stats.platformUser || '', 'user')}
                        className="p-3.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors text-gray-400 hover:text-white"
                        title="Copiar usuario"
                      >
                        {copiedUser ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="group relative">
                    <span className="text-xs text-gray-500 block mb-1.5 ml-1">Contraseña</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/5 p-3.5 rounded-xl border border-white/5 font-mono text-lg font-bold select-all text-center tracking-wider text-white group-hover:border-primary/30 transition-colors">
                        {stats.platformPassword}
                      </div>
                      <button
                        onClick={() => handleCopy(stats.platformPassword || '', 'pass')}
                        className="p-3.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors text-gray-400 hover:text-white"
                        title="Copiar contraseña"
                      >
                        {copiedPass ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {stats.platformUrl && (
                  <a
                    href={stats.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-4 py-2 hover:bg-primary/5 rounded-lg"
                  >
                    Ir al sitio del casino <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <button
                onClick={handleOnboardingAccept}
                className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-black font-bold text-lg transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Comenzar a Jugar
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              <div className="flex items-center gap-2 text-sm text-primary font-medium bg-primary/10 px-4 py-2 rounded-full animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verificando estado...</span>
              </div>
              <p className="text-xs text-gray-600">Actualización automática en tiempo real</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="text-primary">CARGAR</span>FICHAS YA!
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm"
              title="Cambiar Contraseña"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden md:inline">Clave</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="glass rounded-2xl p-8 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-32 h-32 text-primary" />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 mb-8">
            <div className="w-full md:w-auto text-center md:text-left space-y-2">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <span className="text-gray-400 text-sm uppercase tracking-wider font-medium">Mi Usuario:</span>
                <span className="text-3xl font-black text-white tracking-tighter text-glow">
                  {stats.username}
                </span>
              </div>
              {stats.platformName && (
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <span className="text-gray-400 text-sm uppercase tracking-wider font-medium">Mi Plataforma:</span>
                  <span className="text-3xl font-black text-primary tracking-tighter text-glow">
                    {stats.platformName}
                  </span>
                </div>
              )}
            </div>

            {stats.platformName && (
              <div className="flex flex-col items-center justify-center gap-2 order-last md:order-none w-full md:w-auto">
                {stats.platformUrl && (
                  <div className="flex items-center gap-2">
                    <a
                      href={stats.platformUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-300 hover:text-white font-mono break-all max-w-[280px]"
                      title="Abrir sitio del casino"
                    >
                      {stats.platformUrl}
                    </a>
                    <button
                      onClick={() => handleCopy(stats.platformUrl, 'url')}
                      className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
                      title="Copiar link"
                    >
                      {copiedUrl ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {stats.platformUser && (
              <div className="bg-black/30 rounded-xl p-4 border border-white/10 backdrop-blur-md w-full md:w-auto">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-primary font-bold flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Credenciales
                  </h3>
                </div>
                <div className="flex gap-6">
                  <div className="group relative">
                    <span className="text-xs text-gray-400 block mb-1">Usuario</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono font-bold text-lg select-all">{stats.platformUser}</span>
                      <button onClick={() => handleCopy(stats.platformUser, 'user')} className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5">
                        {copiedUser ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="group relative">
                    <span className="text-xs text-gray-400 block mb-1">Contraseña</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono font-bold text-lg select-all">{stats.platformPassword}</span>
                      <button onClick={() => handleCopy(stats.platformPassword, 'pass')} className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5">
                        {copiedPass ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 relative z-10">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex-1 bg-primary hover:bg-primary/90 text-black py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <ArrowDownCircle className="w-5 h-5" />
              Depositar
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <ArrowUpCircle className="w-5 h-5" />
              Retirar
            </button>
          </div>
          {adminWhatsapp && (
            <div className="mt-4">
              <a
                href={`https://wa.me/${adminWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] py-3 rounded-xl font-bold hover:bg-[#25D366]/20 hover:border-[#25D366]/30 transition-all"
                title="Abrir WhatsApp del Admin"
              >
                <MessageCircle className="w-5 h-5" />
                Contactar por WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* Active Petitions */}
        <div className="glass rounded-2xl p-6 md:p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-white">Peticiones Pendientes</h2>
            </div>
            <Link href="/player/historial" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-bold">
              Ver Historial Completo <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="pb-4 pl-4">Fecha</th>
                  <th className="pb-4">Tipo</th>
                  <th className="pb-4">Monto</th>
                  <th className="pb-4">Estado</th>
                  <th className="pb-4 pr-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {transactions.filter(tx => tx.status === 'PENDING').map((tx) => (
                  <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-4 text-gray-300">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${tx.type === 'DEPOSIT'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                        : 'bg-red-500/20 text-red-400 border border-red-500/20'
                        }`}>
                        {tx.type === 'DEPOSIT' ? <ArrowDownCircle className="w-3 h-3" /> : <ArrowUpCircle className="w-3 h-3" />}
                        {tx.type === 'DEPOSIT' ? 'Depósito' : 'Retiro'}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-white">
                      ${tx.amount.toLocaleString()}
                      {tx.expectedAmount && tx.status === 'PENDING' && (
                        <div className="text-xs text-secondary font-mono mt-1 flex items-center gap-1">
                          Transferir: ${tx.expectedAmount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${tx.status === 'COMPLETED' ? 'text-green-400' :
                        tx.status === 'REJECTED' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                        {tx.status === 'PENDING' ? <Clock className="w-3 h-3" /> :
                          tx.status === 'COMPLETED' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {tx.status === 'PENDING' ? 'Pendiente' :
                          tx.status === 'COMPLETED' ? 'Completado' : 'Rechazado'}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {tx.status === 'PENDING' && tx.type === 'DEPOSIT' ? (
                          <button
                            onClick={() => setSelectedTx(tx.id)}
                            className="p-2 hover:bg-primary/20 rounded-lg text-primary hover:text-white transition-colors flex items-center gap-2"
                            title="Continuar Pago"
                          >
                            <Wallet className="w-4 h-4" />
                            <span className="text-xs font-bold hidden md:inline">Pagar</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedTx(tx.id)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Ver Detalles"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                        {tx.status === 'PENDING' && tx.expectedAmount && (
                          <button
                            onClick={() => checkPayment(tx.id)}
                            disabled={checkingPayment}
                            className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 hover:text-green-300 transition-colors"
                            title="Verificar Pago"
                          >
                            <RefreshCw className={`w-4 h-4 ${checkingPayment ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.filter(tx => tx.status === 'PENDING').length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No tienes peticiones pendientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Provider Logos */}
        <div className="mb-12 text-center">
          <h3 className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-8 font-medium">Proveedores Oficiales</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <a href="https://www.pragmaticplay.com" target="_blank" rel="noreferrer" className="text-white font-black text-2xl hover:text-primary transition-colors tracking-tight">PRAGMATIC PLAY</a>
            <a href="https://rubyplay.com" target="_blank" rel="noreferrer" className="text-white font-black text-2xl hover:text-red-500 transition-colors tracking-tight">RubyPlay</a>
            <a href="https://www.evolution.com" target="_blank" rel="noreferrer" className="text-white font-black text-2xl hover:text-blue-400 transition-colors tracking-tight">EVOLUTION</a>
            <a href="https://www.playtech.com" target="_blank" rel="noreferrer" className="text-white font-black text-2xl hover:text-blue-600 transition-colors tracking-tight">playtech</a>
          </div>
        </div>

        {/* Security Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass p-8 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group hover:-translate-y-1 duration-300">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Seguridad Total</h3>
            <p className="text-gray-400 leading-relaxed">Garantía de anonimato absoluto y protección de datos con encriptación de grado militar.</p>
          </div>
          <div className="glass p-8 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group hover:-translate-y-1 duration-300">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Pagos Flash</h3>
            <p className="text-gray-400 leading-relaxed">Procesamiento instantáneo. Tus fichas se acreditan en segundos, sin esperas.</p>
          </div>
          <div className="glass p-8 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group hover:-translate-y-1 duration-300">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Coins className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Venta Optimizada</h3>
            <p className="text-gray-400 leading-relaxed">Sistema inteligente de gestión de fichas para una experiencia de juego fluida.</p>
          </div>
        </div>

        {/* WhatsApp Quick Contact */}
        <div className="glass rounded-2xl p-8 md:p-12 text-center relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#25D366]/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-lg mx-auto">
            <h2 className="text-3xl font-black text-white mb-2">Atención Personalizada</h2>
            <p className="text-gray-400 mb-8">Ingresa tu nombre y contáctanos directamente por WhatsApp para una carga rápida.</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Tu Nombre"
                id="wa-name"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none placeholder-gray-500 transition-colors"
              />
              <button
                onClick={() => {
                  const nameInput = document.getElementById('wa-name') as HTMLInputElement;
                  const name = nameInput.value;
                  if (!name) {
                    nameInput.focus();
                    nameInput.classList.add('border-red-500');
                    setTimeout(() => nameInput.classList.remove('border-red-500'), 2000);
                    return;
                  }
                  const msg = `Hola, soy ${name}. Quiero cargar fichas en mi cuenta!`;
                  window.open(`https://wa.me/${adminWhatsapp || ''}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-[#25D366]/20"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contactar Ahora</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        {(showDepositModal || showWithdrawModal) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass rounded-2xl p-8 w-full max-w-md border border-white/10 relative">
              <h3 className="text-2xl font-bold mb-6 text-white">
                {showDepositModal ? 'Cargar Fichas' : 'Retirar Fichas'}
              </h3>
              <input
                type="number"
                placeholder="Monto"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mb-6 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors text-lg"
                value={amount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              />

              {showWithdrawModal && (
                <div className="space-y-4 mb-6">
                  <p className="text-sm text-gray-400">Datos para recibir la transferencia:</p>
                  <input
                    type="text"
                    placeholder="CVU / CBU"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    value={withdrawDetails.cvu}
                    onChange={(e) => setWithdrawDetails({ ...withdrawDetails, cvu: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Alias"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    value={withdrawDetails.alias}
                    onChange={(e) => setWithdrawDetails({ ...withdrawDetails, alias: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Nombre del Banco / Billetera"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    value={withdrawDetails.bank}
                    onChange={(e) => setWithdrawDetails({ ...withdrawDetails, bank: e.target.value })}
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setShowWithdrawModal(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleTransaction(showDepositModal ? 'DEPOSIT' : 'WITHDRAW')}
                  className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-black font-bold transition-colors shadow-lg shadow-primary/20"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat & Info Modal */}
        {selectedTx && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-6xl glass rounded-2xl overflow-hidden flex flex-col h-[85vh] border border-white/10 shadow-2xl">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20 shrink-0">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Detalles de la Operación
                </h3>
                <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-white transition-colors">✕</button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col lg:grid lg:grid-cols-2">
                {/* Left Column: Details */}
                <div className="p-6 overflow-y-auto border-r border-white/10 bg-black/20 space-y-6 max-h-[35vh] lg:max-h-full shrink-0">
                  {selectedTransactionData?.type === 'DEPOSIT' && selectedTransactionData.status === 'PENDING' && (
                    <>
                      {/* Payment Method Selector */}
                      <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                        <button
                          onClick={() => setPaymentMethod('TRANSFER')}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${paymentMethod === 'TRANSFER'
                            ? 'bg-primary text-black shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:text-white'
                            }`}
                        >
                          Transferencia
                        </button>
                        <button
                          disabled
                          className="flex-1 py-2 rounded-lg text-xs font-bold transition-all text-gray-500 cursor-not-allowed border border-white/5 opacity-50"
                        >
                          MercadoPago (PRÓXIMAMENTE)
                        </button>
                      </div>

                      {paymentMethod === 'TRANSFER' ? (
                        <>
                          <div className="bg-secondary/10 p-6 rounded-xl border border-secondary/20 mb-6">
                            <p className="font-bold text-secondary mb-2 flex items-center gap-2 text-lg">
                              <Clock className="w-5 h-5" />
                              Instrucciones de Pago
                            </p>
                            <p className="text-gray-300 text-lg">Transfiere EXACTAMENTE:</p>
                            <p className="text-4xl font-black text-white text-glow my-3 tracking-tight">
                              ${selectedTransactionData.expectedAmount ? selectedTransactionData.expectedAmount.toFixed(2) : selectedTransactionData.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-secondary font-bold bg-secondary/10 px-3 py-1.5 rounded-lg border border-secondary/20 flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4" />
                              Transfiere el monto EXACTO incluyendo los decimales para identificación inmediata.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-white font-bold flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-primary" />
                              Cuentas Disponibles para Transferir
                            </h4>
                            {activeCvus.length > 0 ? (
                              activeCvus.map((cvu: any) => (
                                <div
                                  key={cvu.id}
                                  className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3 hover:bg-white/10 transition-all group cursor-pointer active:scale-[0.98]"
                                  onClick={() => {
                                    const text = `Banco: ${cvu.bankName}\nTitular: ${cvu.holderName || ''}\nCVU: ${cvu.cbu}\nAlias: ${cvu.alias}`;
                                    handleCopy(text, 'url');
                                    alert('Datos de cuenta copiados al portapapeles');
                                  }}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                        <Wallet className="w-4 h-4" />
                                      </div>
                                      <span className="font-bold text-white">{cvu.bankName}</span>
                                    </div>
                                    <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                      Hacer clic para copiar todos los datos
                                    </span>
                                  </div>

                                  <div className="space-y-2 text-sm">
                                    {cvu.holderName && (
                                      <div className="flex justify-between items-center py-1 border-b border-white/5 group/field" onClick={(e) => { e.stopPropagation(); handleCopy(cvu.holderName, 'user'); }}>
                                        <span className="text-gray-400">Titular:</span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-white font-mono select-all text-right">{cvu.holderName}</span>
                                          <Copy className="w-3 h-3 text-gray-500 group-hover/field:text-primary transition-colors" />
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center py-1 border-b border-white/5 group/field" onClick={(e) => { e.stopPropagation(); handleCopy(cvu.cbu, 'user'); }}>
                                      <span className="text-gray-400">CBU/CVU:</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-white font-mono select-all text-right">{cvu.cbu}</span>
                                        <Copy className="w-3 h-3 text-gray-500 group-hover/field:text-primary transition-colors" />
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center py-1 group/field" onClick={(e) => { e.stopPropagation(); handleCopy(cvu.alias, 'user'); }}>
                                      <span className="text-gray-400">Alias:</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-white font-mono select-all text-right">{cvu.alias}</span>
                                        <Copy className="w-3 h-3 text-gray-500 group-hover/field:text-primary transition-colors" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center p-8 bg-white/5 rounded-xl border border-dashed border-white/10 text-gray-500">
                                <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p>No hay cuentas activas disponibles.</p>
                                <p className="text-xs mt-1">Por favor, consulta con soporte por el chat.</p>
                              </div>
                            )}
                          </div>

                        </>
                      ) : (
                        <div className="space-y-6 text-center">
                          <div className="bg-blue-500/10 p-8 rounded-xl border border-blue-500/20">
                            <h4 className="text-xl font-bold text-blue-400 mb-4">Pagar con MercadoPago</h4>
                            <p className="text-gray-300 mb-6">
                              Haz clic en el botón para abrir la pasarela de pago segura de MercadoPago.
                              El pago se acreditará automáticamente.
                            </p>

                            {!mpLink ? (
                              <button
                                onClick={handleCreatePreference}
                                disabled={loadingMp}
                                className="w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                              >
                                {loadingMp ? (
                                  <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Generando link...
                                  </>
                                ) : (
                                  <>
                                    <Wallet className="w-5 h-5" />
                                    Generar Link de Pago
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="space-y-4">
                                <a
                                  href={mpLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                                >
                                  Pagar Ahora
                                </a>
                                <p className="text-xs text-gray-500">
                                  Si no se abrió automáticamente, haz clic arriba.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedTransactionData?.type === 'WITHDRAW' && selectedTransactionData.status === 'PENDING' && (
                    <div className="bg-yellow-500/10 p-6 rounded-xl border border-yellow-500/20">
                      <p className="font-bold text-yellow-500 mb-2 flex items-center gap-2 text-lg">
                        <Clock className="w-5 h-5" />
                        Solicitud de Retiro en Proceso
                      </p>
                      <p className="text-gray-300 mb-4">Tu solicitud ha sido enviada al administrador. Por favor espera la confirmación en el chat.</p>

                      <div className="bg-black/20 p-4 rounded-xl space-y-3 border border-white/5">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monto a recibir:</span>
                          <span className="text-white font-bold text-lg">${selectedTransactionData.amount.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-white/10 my-2"></div>
                        {selectedTransactionData.withdrawalCvu && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">CVU Destino:</span>
                            <span className="text-white">{selectedTransactionData.withdrawalCvu}</span>
                          </div>
                        )}
                        {selectedTransactionData.withdrawalAlias && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Alias:</span>
                            <span className="text-white">{selectedTransactionData.withdrawalAlias}</span>
                          </div>
                        )}
                        {selectedTransactionData.withdrawalBank && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Banco:</span>
                            <span className="text-white">{selectedTransactionData.withdrawalBank}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTransactionData?.status !== 'PENDING' && (
                    <div className={`p-6 rounded-xl border ${selectedTransactionData?.status === 'COMPLETED'
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                      }`}>
                      <p className={`font-bold mb-2 flex items-center gap-2 text-lg ${selectedTransactionData?.status === 'COMPLETED' ? 'text-green-500' : 'text-red-500'
                        }`}>
                        {selectedTransactionData?.status === 'COMPLETED' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        {selectedTransactionData?.status === 'COMPLETED' ? 'Operación Completada' : 'Operación Rechazada'}
                      </p>
                      <p className="text-gray-300 mb-4">
                        {selectedTransactionData?.status === 'COMPLETED'
                          ? 'Esta operación ya fue procesada y finalizada.'
                          : 'Esta operación fue rechazada por el administrador.'}
                      </p>

                      <div className="bg-black/20 p-4 rounded-xl space-y-3 border border-white/5">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tipo:</span>
                          <span className="text-white font-bold">
                            {selectedTransactionData?.type === 'DEPOSIT' ? 'Depósito' : 'Retiro'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monto:</span>
                          <span className="text-white font-bold text-lg">${selectedTransactionData?.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fecha:</span>
                          <span className="text-white">{selectedTransactionData?.createdAt ? new Date(selectedTransactionData.createdAt).toLocaleString() : ''}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Chat */}
                <div className="flex flex-col flex-1 lg:h-full bg-black/40 border-l border-white/10 min-h-0">
                  <div className="flex-1 overflow-hidden">
                    <ChatWindow
                      transactionId={selectedTx}
                      currentUserRole="PLAYER"
                      onClose={() => setSelectedTx(null)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass rounded-2xl p-8 w-full max-w-md border border-white/10 relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Lock className="w-6 h-6 text-primary" />
                  Cambiar Clave
                </h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-white">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Usuario</label>
                  <input
                    type="text"
                    value={stats.username}
                    disabled
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white opacity-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Nueva Contraseña</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Confirmar Contraseña</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Repite la contraseña"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-black font-bold transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {passwordLoading ? 'Guardando...' : 'Cambiar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <SupportChat />
      </div>

      {/* New Platform URL Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-500">
          <div className="w-full max-w-md glass rounded-3xl p-8 border border-primary/20 shadow-[0_0_50px_-12px_rgba(var(--primary-rgb),0.5)] text-center relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <ExternalLink className="w-10 h-10 text-primary" />
              </div>

              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">¡NUEVA URL!</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Hemos actualizado el link de <span className="text-white font-bold">{stats.platformName}</span> para mejorar tu experiencia de juego.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 text-left">Link Actualizado</p>
                <p className="text-primary font-mono text-lg break-all">{newLink}</p>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={newLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowLinkModal(false)}
                  className="w-full bg-primary text-black font-black py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-lg"
                >
                  IR A LA PLATAFORMA
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="text-gray-500 hover:text-white transition-colors text-sm font-bold py-2"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
