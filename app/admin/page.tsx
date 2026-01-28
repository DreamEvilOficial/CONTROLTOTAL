'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  LogOut, 
  Shield, 
  Banknote, 
  Activity,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  TrendingUp,
  UserPlus
} from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  user: {
    username: string;
    name: string;
  };
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
  active: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, totalAgents: 0, totalVolume: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [cvus, setCvus] = useState<Cvu[]>([]);
  
  // Forms
  const [newCvu, setNewCvu] = useState({ bankName: '', alias: '', cbu: '' });

  // Loading states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    fetchActivity();
    fetchCvus();
  }, []);

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
        setNewCvu({ bankName: '', alias: '', cbu: '' });
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
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl w-fit">
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
        </div>

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
                  <Activity className="w-3 h-3" />
                  Transacciones completadas
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
                                <span className="text-xs text-gray-500">
                                  {new Date(tx.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <h4 className="font-bold text-lg">${tx.amount.toLocaleString()}</h4>
                              <p className="text-sm text-gray-400">
                                Usuario: <span className="text-white font-medium">{tx.user.username}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 w-full md:w-auto">
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

        {activeTab === 'cvus' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* CVU Management Section (kept from original) */}
             <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <CreditCard className="w-5 h-5 text-primary" />
                 Gestión de Métodos de Pago
               </h3>
               
               <form onSubmit={createCvu} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                 <input
                   type="text"
                   placeholder="Banco / Billetera"
                   className="p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-primary/50 outline-none"
                   value={newCvu.bankName}
                   onChange={(e) => setNewCvu({...newCvu, bankName: e.target.value})}
                   required
                 />
                 <input
                   type="text"
                   placeholder="Alias"
                   className="p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-primary/50 outline-none"
                   value={newCvu.alias}
                   onChange={(e) => setNewCvu({...newCvu, alias: e.target.value})}
                   required
                 />
                 <input
                   type="text"
                   placeholder="CBU / CVU"
                   className="p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-primary/50 outline-none"
                   value={newCvu.cbu}
                   onChange={(e) => setNewCvu({...newCvu, cbu: e.target.value})}
                   required
                 />
                 <button
                   type="submit"
                   disabled={loading}
                   className="bg-primary text-black font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                 >
                   {loading ? 'Agregando...' : 'Agregar CVU'}
                 </button>
               </form>

               <div className="space-y-3">
                 {cvus.map((cvu) => (
                   <div key={cvu.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                     <div className="flex items-center gap-4">
                       <div className="p-3 bg-white/5 rounded-lg">
                         <Banknote className="w-6 h-6 text-gray-400" />
                       </div>
                       <div>
                         <h4 className="font-bold">{cvu.bankName}</h4>
                         <p className="text-sm text-gray-400 font-mono">{cvu.cbu}</p>
                         <p className="text-xs text-primary">{cvu.alias}</p>
                       </div>
                     </div>
                     <button
                       onClick={() => deleteCvu(cvu.id)}
                       className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                     >
                       <LogOut className="w-5 h-5 rotate-180" />
                     </button>
                   </div>
                 ))}
                 {cvus.length === 0 && (
                   <p className="text-center text-gray-500 py-4">No hay métodos de pago configurados</p>
                 )}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
