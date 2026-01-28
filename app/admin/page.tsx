'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  LogOut, 
  Shield, 
  Search,
  Banknote, 
  Activity,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  TrendingUp,
  UserPlus,
  Settings,
  Gamepad2,
  Trash2,
  Plus,
  Save,
  MessageCircle,
  Send,
  X,
  RefreshCw,
  Edit,
  Key
} from 'lucide-react';
import MarketingTab from '@/components/MarketingTab';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  method?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string;
    platformUser?: string;
    platform?: {
      name: string;
    };
  };
  withdrawalCvu?: string;
  withdrawalAlias?: string;
  withdrawalBank?: string;
}

interface Message {
  id: string;
  content: string;
  sender: { username: string; role: string };
  createdAt: string;
  read: boolean;
}

interface Conversation {
  user: { id: string; username: string; role: string };
  lastMessage: { content: string };
  unreadCount: number;
}

interface ActivityStats {
  newUsers: number;
  volume: number;
  transactionCount: number;
}

interface ActivityData {
  day: ActivityStats;
  week: ActivityStats;
  month: ActivityStats;
}

interface Cvu {
  id: string;
  bankName: string;
  alias: string;
  cbu: string;
  holderName?: string;
  active: boolean;
}

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  balance: number;
  whatsapp?: string;
  platformId?: string;
  platform?: Platform;
  platformUser?: string;
  platformPassword?: string;
  createdAt: string;
}

interface Config {
  whatsappNumber: string;
  mpAccessToken: string;
  mpPublicKey: string;
}

interface Platform {
  id: string;
  name: string;
  url?: string;
  bonus: string;
  active: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, totalAgents: 0, totalVolume: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [cvus, setCvus] = useState<Cvu[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [config, setConfig] = useState<Config>({ whatsappNumber: '', mpAccessToken: '', mpPublicKey: '' });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  
  // Forms
  const [newCvu, setNewCvu] = useState({ bankName: '', alias: '', cbu: '', holderName: '' });
  const [newPlatform, setNewPlatform] = useState({ name: '', url: '', bonus: '' });
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', whatsapp: '' });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<{ id: string; username: string } | null>(null);
  const [adminMessages, setAdminMessages] = useState<Message[]>([]);
  const [adminNewMessage, setAdminNewMessage] = useState('');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    fetchActivity();
    fetchCvus();
    fetchConfig();
    fetchPlatforms();
    fetchUsers();
    fetchConversations();
    
    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      fetchTransactions();
      fetchStats();
      fetchActivity();
      fetchConversations();
      if (selectedChatUser) {
        fetchAdminMessages(selectedChatUser.id);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedChatUser]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchAdminMessages = async (userId: string) => {
    try {
      const res = await fetch(`/api/chat?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setAdminMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNewMessage.trim() || !selectedChatUser) return;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: adminNewMessage,
          receiverId: selectedChatUser.id,
        }),
      });

      if (res.ok) {
        setAdminNewMessage('');
        fetchAdminMessages(selectedChatUser.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const deleteConversation = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Borrar esta conversación?')) return;
    try {
      const res = await fetch(`/api/chat?userId=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedChatUser?.id === userId) setSelectedChatUser(null);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/transactions');
      if (res.ok) setTransactions(await res.json());
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/admin/activity');
      if (res.ok) setActivity(await res.json());
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const fetchCvus = async () => {
    try {
      const res = await fetch('/api/admin/cvus');
      if (res.ok) setCvus(await res.json());
    } catch (error) {
      console.error('Error fetching cvus:', error);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        setConfig({
          whatsappNumber: data.whatsappNumber || '',
          mpAccessToken: data.mpAccessToken || '',
          mpPublicKey: data.mpPublicKey || '',
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const res = await fetch('/api/admin/platforms');
      if (res.ok) setPlatforms(await res.json());
    } catch (error) {
      console.error('Error fetching platforms:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) setUsers(await res.json());
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        setNewUser({ username: '', password: '', name: '', whatsapp: '' });
        fetchUsers();
        fetchStats();
      } else {
        const error = await res.json();
        alert(error.error || 'Error creando usuario');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          platformId: editingUser.platformId,
          platformUser: editingUser.platformUser,
          platformPassword: editingUser.platformPassword,
          whatsapp: editingUser.whatsapp,
        }),
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchUsers();
        fetchStats();
      } else {
        alert('Error eliminando usuario');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleTransactionAction = async (id: string, action: 'COMPLETED' | 'REJECTED') => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/transactions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });
      
      if (res.ok) {
        fetchTransactions();
        fetchStats();
        fetchActivity();
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const checkPayment = async (txId: string) => {
    setCheckingPayment(txId);
    try {
      const res = await fetch(`/api/transactions/${txId}/check-mp`, { method: 'POST' });
      const data = await res.json();
      
      if (data.status === 'COMPLETED') {
        alert('¡Pago verificado y aprobado automáticamente!');
        fetchTransactions();
        fetchStats();
      } else if (data.message) {
        alert(`Estado: ${data.message}`);
      } else {
        alert('Pago no encontrado o aún pendiente en MercadoPago.');
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      alert('Error al verificar el pago');
    } finally {
      setCheckingPayment(null);
    }
  };

  const createCvu = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cvus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCvu),
      });
      if (res.ok) {
        setNewCvu({ bankName: '', alias: '', cbu: '', holderName: '' });
        fetchCvus();
      }
    } catch (error) {
      console.error('Error creating cvu:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCvu = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este CVU?')) return;
    try {
      const res = await fetch(`/api/admin/cvus?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchCvus();
    } catch (error) {
      console.error('Error deleting cvu:', error);
    }
  };

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setSavingConfig(false);
    }
  };

  const createPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlatform),
      });
      if (res.ok) {
        setNewPlatform({ name: '', url: '', bonus: '' });
        fetchPlatforms();
      }
    } catch (error) {
      console.error('Error creating platform:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePlatform = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta plataforma?')) return;
    try {
      const res = await fetch(`/api/admin/platforms?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchPlatforms();
    } catch (error) {
      console.error('Error deleting platform:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const ActivityCard = ({ title, data, icon: Icon }: { title: string, data: ActivityStats, icon: any }) => (
    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-3 text-gray-400">
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Usuarios Nuevos</span>
          <span className="text-white font-bold flex items-center gap-1">
            <UserPlus className="w-3 h-3 text-primary" />
            {data.newUsers}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Volumen</span>
          <span className="text-white font-bold flex items-center gap-1">
            <Banknote className="w-3 h-3 text-green-500" />
            ${data.volume.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Transacciones</span>
          <span className="text-white font-bold flex items-center gap-1">
            <Activity className="w-3 h-3 text-blue-500" />
            {data.transactionCount}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary/30">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">Panel Admin</h1>
              <p className="text-xs text-gray-400">Gestión global de la plataforma</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl w-fit flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'overview' 
                ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'players' 
                ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            Jugadores
          </button>
          <button
            onClick={() => setActiveTab('cvus')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'cvus' 
                ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            CVUs / Pagos
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'config' 
                ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configuración
          </button>
          <button
            onClick={() => setActiveTab('platforms')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'platforms' 
                ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Plataformas
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'support' 
                ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Soporte
            {conversations.reduce((acc, curr) => acc + curr.unreadCount, 0) > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse ml-1">
                {conversations.reduce((acc, curr) => acc + curr.unreadCount, 0)}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'marketing' && <MarketingTab />}

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Total Jugadores</p>
                    <h3 className="text-4xl font-black text-white tracking-tight group-hover:text-primary transition-colors">
                      {stats.totalUsers}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 w-fit px-2 py-1 rounded-full">
                  <Activity className="w-3 h-3" />
                  Activos en plataforma
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Total Agentes</p>
                    <h3 className="text-4xl font-black text-white tracking-tight group-hover:text-yellow-400 transition-colors">
                      {stats.totalAgents}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/5 w-fit px-2 py-1 rounded-full">
                  <Activity className="w-3 h-3" />
                  Gestionando red
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Volumen Total</p>
                    <h3 className="text-4xl font-black text-white tracking-tight group-hover:text-green-400 transition-colors">
                      ${stats.totalVolume.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform">
                    <Banknote className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/5 w-fit px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  Histórico
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Transactions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Clock className="w-6 h-6 text-primary" />
                    Peticiones Pendientes
                  </h2>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                    {transactions.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                      <CheckCircle2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No hay transacciones pendientes</p>
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <div key={tx.id} className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-primary/20 transition-all">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${
                              tx.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                              {tx.type === 'DEPOSIT' ? <TrendingUp className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                                  tx.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                  {tx.type === 'DEPOSIT' ? 'Depósito' : 'Retiro'}
                                </span>
                                {tx.method && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded uppercase bg-blue-500/10 text-blue-500">
                                    {tx.method === 'AUTO' ? 'Auto' : tx.method === 'MP' ? 'MercadoPago' : 'Manual'}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {new Date(tx.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <h4 className="font-bold text-lg">${tx.amount.toLocaleString()}</h4>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-400">
                                  Usuario: <span className="text-white font-medium">{tx.user.username}</span>
                                </p>
                                {conversations.find(c => c.user.id === tx.user.id)?.unreadCount ? (
                                  <button
                                    onClick={() => {
                                      setActiveTab('support');
                                      setSelectedChatUser({ id: tx.user.id, username: tx.user.username });
                                    }}
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary text-black text-xs font-bold animate-pulse hover:bg-primary/90 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    <span>{conversations.find(c => c.user.id === tx.user.id)?.unreadCount} nuevo(s)</span>
                                  </button>
                                ) : null}
                              </div>
                              {tx.user.platform && (
                                <p className="text-sm text-gray-400">
                                  Casino: <span className="text-white font-medium">{tx.user.platform.name}</span>
                                  {tx.user.platformUser && (
                                    <span className="ml-2 text-xs opacity-70">({tx.user.platformUser})</span>
                                  )}
                                </p>
                              )}
                              {tx.type === 'WITHDRAW' && (
                                <div className="mt-2 text-xs bg-black/20 p-2 rounded text-gray-400 border border-white/5">
                                  {tx.withdrawalCvu && <p>CVU: <span className="text-white select-all">{tx.withdrawalCvu}</span></p>}
                                  {tx.withdrawalAlias && <p>Alias: <span className="text-white select-all">{tx.withdrawalAlias}</span></p>}
                                  {tx.withdrawalBank && <p>Banco: <span className="text-white select-all">{tx.withdrawalBank}</span></p>}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            {tx.type === 'DEPOSIT' && (
                              <button
                                onClick={() => checkPayment(tx.id)}
                                disabled={checkingPayment === tx.id || actionLoading === tx.id}
                                className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                title="Verificar en MercadoPago"
                              >
                                <RefreshCw className={`w-4 h-4 ${checkingPayment === tx.id ? 'animate-spin' : ''}`} />
                                <span className="hidden md:inline">Verificar MP</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleTransactionAction(tx.id, 'REJECTED')}
                              disabled={actionLoading === tx.id}
                              className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Rechazar
                            </button>
                            <button
                              onClick={() => handleTransactionAction(tx.id, 'COMPLETED')}
                              disabled={actionLoading === tx.id}
                              className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Aprobar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Activity History */}
              <div className="lg:col-span-1 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="w-6 h-6 text-primary" />
                  Historial
                </h2>
                
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-6 sticky top-24">
                  {activity ? (
                    <>
                      <ActivityCard 
                        title="Hoy" 
                        data={activity.day} 
                        icon={Clock} 
                      />
                      <ActivityCard 
                        title="Esta Semana" 
                        data={activity.week} 
                        icon={Calendar} 
                      />
                      <ActivityCard 
                        title="Este Mes" 
                        data={activity.month} 
                        icon={BarChart3} 
                      />
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-8">Cargando actividad...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Create User Form */}
            <div className="lg:col-span-1 h-fit bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Crear Jugador
              </h3>
              <form onSubmit={createUser} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Usuario</label>
                  <input
                    type="text"
                    required
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                    placeholder="Usuario"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                    placeholder="Contraseña"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                    placeholder="Nombre Completo"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">WhatsApp (Opcional)</label>
                  <input
                    type="text"
                    value={newUser.whatsapp}
                    onChange={(e) => setNewUser({...newUser, whatsapp: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                    placeholder="+54911..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Jugador'}
                </button>
              </form>
            </div>

            {/* User List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Jugadores Registrados
              </h3>
              <div className="grid gap-4">
                {users.map((user) => (
                  <div key={user.id} className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-lg text-white">{user.username}</h4>
                          <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary font-bold">
                            ${user.balance.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{user.name}</p>
                        {user.whatsapp && (
                          <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> {user.whatsapp}
                          </p>
                        )}
                        
                        <div className="mt-3 p-3 bg-black/20 rounded-lg border border-white/5 text-sm">
                          <p className="text-gray-400 mb-1">Plataforma: <span className="text-white font-medium">{user.platform?.name || 'No asignada'}</span></p>
                          {user.platformUser ? (
                            <div className="flex gap-4 mt-2 pt-2 border-t border-white/5">
                              <div>
                                <span className="text-xs text-gray-500 block">Usuario Casino</span>
                                <span className="text-white font-mono">{user.platformUser}</span>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 block">Contraseña Casino</span>
                                <span className="text-white font-mono">{user.platformPassword}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 bg-yellow-500/10 text-yellow-500 text-xs px-2 py-1 rounded inline-flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" />
                              Pendiente de Credenciales
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-primary transition-colors"
                        title="Editar Credenciales"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors ml-2"
                        title="Eliminar Usuario"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No hay jugadores registrados</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'marketing' && <MarketingTab />}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Editar Jugador: {editingUser.username}</h3>
                <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={updateUser} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">WhatsApp</label>
                  <input
                    type="text"
                    value={editingUser.whatsapp || ''}
                    onChange={(e) => setEditingUser({...editingUser, whatsapp: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Plataforma</label>
                  <select
                    value={editingUser.platformId || ''}
                    onChange={(e) => setEditingUser({...editingUser, platformId: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                  >
                    <option value="">Seleccionar Plataforma</option>
                    {platforms.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {editingUser.platformId && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <p className="text-sm font-bold text-primary flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Credenciales del Casino
                    </p>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Usuario en Casino</label>
                      <input
                        type="text"
                        value={editingUser.platformUser || ''}
                        onChange={(e) => setEditingUser({...editingUser, platformUser: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                        placeholder="Usuario asignado"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Contraseña en Casino</label>
                      <input
                        type="text"
                        value={editingUser.platformPassword || ''}
                        onChange={(e) => setEditingUser({...editingUser, platformPassword: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                        placeholder="Contraseña asignada"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-lg bg-primary text-black font-bold hover:bg-primary/90 transition-colors"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'cvus' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Create CVU Form */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 h-fit">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Agregar Nuevo CVU
              </h3>
              <form onSubmit={createCvu} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Banco / Billetera</label>
                  <input
                    type="text"
                    required
                    value={newCvu.bankName}
                    onChange={(e) => setNewCvu({...newCvu, bankName: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                    placeholder="Ej: MercadoPago, Brubank"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Nombre del Titular</label>
                  <input
                    type="text"
                    value={newCvu.holderName || ''}
                    onChange={(e) => setNewCvu({...newCvu, holderName: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Alias</label>
                  <input
                    type="text"
                    required
                    value={newCvu.alias}
                    onChange={(e) => setNewCvu({...newCvu, alias: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                    placeholder="mi.alias.mp"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">CBU / CVU</label>
                  <input
                    type="text"
                    required
                    value={newCvu.cbu}
                    onChange={(e) => setNewCvu({...newCvu, cbu: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                    placeholder="0000000000000000000000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar CVU'}
                </button>
              </form>
            </div>

            {/* CVU List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                CVUs Activos
              </h3>
              {cvus.map((cvu) => (
                <div key={cvu.id} className="bg-white/5 rounded-xl p-5 border border-white/10 flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-lg">{cvu.bankName}</h4>
                    {cvu.holderName && (
                      <p className="text-gray-400 text-sm font-mono mt-1">Titular: <span className="text-white">{cvu.holderName}</span></p>
                    )}
                    <p className="text-gray-400 text-sm font-mono mt-1">Alias: <span className="text-white">{cvu.alias}</span></p>
                    <p className="text-gray-400 text-sm font-mono">CBU: <span className="text-white">{cvu.cbu}</span></p>
                  </div>
                  <button
                    onClick={() => deleteCvu(cvu.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {cvus.length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay CVUs registrados</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Configuración del Sistema
              </h3>
              <form onSubmit={saveConfig} className="space-y-6">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Número de WhatsApp (con código de país)</label>
                  <input
                    type="text"
                    value={config.whatsappNumber}
                    onChange={(e) => setConfig({...config, whatsappNumber: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                    placeholder="Ej: 5491112345678"
                  />
                  <p className="text-xs text-gray-500 mt-1">Este número se usará para el botón de contacto en el login.</p>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h4 className="text-lg font-bold mb-4 text-primary">MercadoPago</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Access Token</label>
                      <input
                        type="password"
                        value={config.mpAccessToken}
                        onChange={(e) => setConfig({...config, mpAccessToken: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                        placeholder="APP_USR-..."
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Public Key</label>
                      <input
                        type="text"
                        value={config.mpPublicKey}
                        onChange={(e) => setConfig({...config, mpPublicKey: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                        placeholder="APP_USR-..."
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingConfig}
                  className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {savingConfig ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'platforms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Create Platform Form */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 h-fit">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Agregar Plataforma
              </h3>
              <form onSubmit={createPlatform} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Nombre de la Plataforma</label>
                  <input
                    type="text"
                    required
                    value={newPlatform.name}
                    onChange={(e) => setNewPlatform({...newPlatform, name: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                    placeholder="Ej: Casino Royal"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">URL de la Plataforma</label>
                  <input
                    type="url"
                    value={newPlatform.url || ''}
                    onChange={(e) => setNewPlatform({...newPlatform, url: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Bono de Bienvenida</label>
                  <textarea
                    required
                    value={newPlatform.bonus}
                    onChange={(e) => setNewPlatform({...newPlatform, bonus: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none min-h-[100px]"
                    placeholder="Ej: 100% hasta $50.000 + 50 Giros Gratis"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Plataforma'}
                </button>
              </form>
            </div>

            {/* Platform List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-primary" />
                Plataformas Disponibles
              </h3>
              {platforms.map((platform) => (
                <div key={platform.id} className="bg-white/5 rounded-xl p-5 border border-white/10 flex justify-between items-start group">
                  <div>
                    <h4 className="font-bold text-lg">{platform.name}</h4>
                    {platform.url && (
                      <a 
                        href={platform.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline text-sm block mt-1"
                      >
                        {platform.url}
                      </a>
                    )}
                    <p className="text-gray-400 text-sm mt-2">{platform.bonus}</p>
                    <span className="inline-block mt-3 px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-500">
                      ACTIVA
                    </span>
                  </div>
                  <button
                    onClick={() => deletePlatform(platform.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {platforms.length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay plataformas registradas</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className="lg:col-span-1 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Conversaciones
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No hay conversaciones activas
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.user.id}
                      onClick={() => {
                        setSelectedChatUser(conv.user);
                        fetchAdminMessages(conv.user.id);
                      }}
                      className={`w-full p-4 border-b border-white/5 text-left transition-colors hover:bg-white/5 flex items-start gap-3 ${
                        selectedChatUser?.id === conv.user.id ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                        {conv.user.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white truncate">{conv.user.username}</span>
                          <div className="flex items-center gap-2">
                            {conv.unreadCount > 0 && (
                              <span className="bg-primary text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                            <button
                              onClick={(e) => deleteConversation(conv.user.id, e)}
                              className="text-gray-500 hover:text-red-500 transition-colors p-1"
                              title="Borrar conversación"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 truncate">{conv.lastMessage.content}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
              {selectedChatUser ? (
                <>
                  <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">
                        {selectedChatUser.username.substring(0, 2).toUpperCase()}
                      </div>
                      {selectedChatUser.username}
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {adminMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender.role === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            msg.sender.role === 'ADMIN'
                              ? 'bg-primary text-black rounded-tr-none'
                              : 'bg-white/10 text-white rounded-tl-none'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <span className="text-[10px] opacity-50 block mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={sendAdminMessage} className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
                    <input
                      type="text"
                      value={adminNewMessage}
                      onChange={(e) => setAdminNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!adminNewMessage.trim()}
                      className="p-3 bg-primary text-black rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                  <p>Selecciona una conversación para comenzar</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
