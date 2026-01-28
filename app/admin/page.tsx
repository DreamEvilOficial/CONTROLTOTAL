'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  LogOut, 
  Plus, 
  Shield, 
  UserPlus, 
  Banknote, 
  Activity,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  username: string;
  _count?: {
    users: number;
  };
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
  const [agents, setAgents] = useState<Agent[]>([]);
  const [cvus, setCvus] = useState<Cvu[]>([]);
  
  // Forms
  const [newAgent, setNewAgent] = useState({ name: '', username: '', password: '' });
  const [newCvu, setNewCvu] = useState({ bankName: '', alias: '', cbu: '' });

  // Loading states
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAgents();
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

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) setAgents(await res.json());
    } catch (error) {
      console.error('Error fetching agents:', error);
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

  const createAgent = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent),
      });
      if (res.ok) {
        setNewAgent({ name: '', email: '', password: '' });
        fetchAgents();
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCvu = async (e: FormEvent) => {
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
      console.error('Error creating CVU:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCvu = async (id: string, active: boolean) => {
    try {
      await fetch('/api/admin/cvus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !active }),
      });
      fetchCvus();
    } catch (error) {
      console.error('Error toggling CVU:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <Shield className="w-10 h-10 text-primary" />
              Panel Admin
            </h1>
            <p className="text-gray-400 mt-1">Gestión global de la plataforma</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 w-full md:w-fit mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Resumen', icon: BarChart3 },
            { id: 'agents', label: 'Agentes', icon: Users },
            { id: 'cvus', label: 'CVUs / Pagos', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className="w-24 h-24 text-primary" />
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Jugadores</h3>
                <p className="text-4xl font-black text-white">{stats.totalUsers}</p>
                <div className="mt-4 text-xs text-primary flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Activos en plataforma
                </div>
              </div>

              <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-secondary/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Shield className="w-24 h-24 text-secondary" />
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Agentes</h3>
                <p className="text-4xl font-black text-white">{stats.totalAgents}</p>
                <div className="mt-4 text-xs text-secondary flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Gestionando red
                </div>
              </div>

              <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Banknote className="w-24 h-24 text-primary" />
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Volumen Total</h3>
                <p className="text-4xl font-black text-white">${stats.totalVolume.toLocaleString()}</p>
                <div className="mt-4 text-xs text-primary flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Transacciones completadas
                </div>
              </div>
            </div>
          )}

          {/* AGENTS TAB */}
          {activeTab === 'agents' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Create Agent Form */}
              <div className="glass p-8 rounded-2xl border-primary/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Crear Nuevo Agente</h2>
                </div>
                
                <form onSubmit={createAgent} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                      value={newAgent.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAgent({...newAgent, name: e.target.value})}
                      required
                      placeholder="Nombre del Agente"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Usuario</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                      value={newAgent.username}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAgent({...newAgent, username: e.target.value})}
                      required
                      placeholder="nombredeusuario"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Contraseña</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                      value={newAgent.password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAgent({...newAgent, password: e.target.value})}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Creando...' : <><Plus className="w-5 h-5" /> Crear Agente</>}
                  </button>
                </form>
              </div>

              {/* Agents List */}
              <div className="glass p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Lista de Agentes</h2>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {agents.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      No hay agentes registrados
                    </div>
                  ) : (
                    agents.map((agent) => (
                      <div key={agent.id} className="bg-black/20 border border-white/5 p-4 rounded-xl flex justify-between items-center hover:bg-white/5 transition-colors">
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            {agent.name}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">Agente</span>
                          </div>
                          <div className="text-sm text-gray-400">{agent.username}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 uppercase tracking-wider">Jugadores</div>
                          <div className="font-mono text-xl text-secondary">{agent._count?.users || 0}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CVUS TAB */}
          {activeTab === 'cvus' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Create CVU Form */}
              <div className="glass p-8 rounded-2xl border-secondary/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Agregar Método de Pago</h2>
                </div>
                
                <form onSubmit={createCvu} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Banco / Billetera</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all outline-none"
                      value={newCvu.bankName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCvu({...newCvu, bankName: e.target.value})}
                      required
                      placeholder="Ej: MercadoPago, Banco Galicia"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Alias</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all outline-none"
                      value={newCvu.alias}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCvu({...newCvu, alias: e.target.value})}
                      required
                      placeholder="mi.alias.mp"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">CBU / CVU</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all outline-none"
                      value={newCvu.cbu}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCvu({...newCvu, cbu: e.target.value})}
                      required
                      placeholder="0000000000000000000000"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 bg-secondary text-black font-bold rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                  >
                     {loading ? 'Guardando...' : <><Plus className="w-5 h-5" /> Agregar Método</>}
                  </button>
                </form>
              </div>

              {/* CVUs List */}
              <div className="glass p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Métodos Activos</h2>
                </div>

                <div className="space-y-4">
                  {cvus.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      No hay métodos de pago configurados
                    </div>
                  ) : (
                    cvus.map((cvu) => (
                      <div key={cvu.id} className="bg-black/20 border border-white/5 p-4 rounded-xl flex justify-between items-center hover:bg-white/5 transition-colors">
                        <div>
                          <div className="font-bold text-white">{cvu.bankName}</div>
                          <div className="text-sm text-gray-400 font-mono">{cvu.alias}</div>
                          <div className="text-xs text-gray-500 font-mono mt-1">{cvu.cbu}</div>
                        </div>
                        <button
                          onClick={() => toggleCvu(cvu.id, cvu.active)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            cvu.active 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30'
                          }`}
                        >
                          {cvu.active ? (
                            <><ToggleRight className="w-4 h-4" /> Activo</>
                          ) : (
                            <><ToggleLeft className="w-4 h-4" /> Inactivo</>
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}