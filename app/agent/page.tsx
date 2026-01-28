'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import ChatWindow from '@/components/ChatWindow';

export default function AgentDashboard() {
  interface Player {
    id: string;
    name: string;
    email: string;
    balance: number;
  }

  interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    user: {
      name: string;
      email: string;
    };
    createdAt: string;
  }

  interface MpConfig {
    mpAccessToken: string;
    mpEnabled: boolean;
  }

  const router = useRouter();
  const [activeTab, setActiveTab] = useState('players');
  const [stats, setStats] = useState({ playersCount: 0, totalPlayersBalance: 0 });
  const [players, setPlayers] = useState<Player[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  
  // Forms
  const [newPlayer, setNewPlayer] = useState({ name: '', email: '', password: '' });
  
  // MP Config
  const [mpConfig, setMpConfig] = useState<MpConfig>({ mpAccessToken: '', mpEnabled: false });

  useEffect(() => {
    fetchStats();
    fetchPlayers();
    fetchTransactions();
    fetchMpConfig();
  }, []);

  const fetchMpConfig = async () => {
    const res = await fetch('/api/agent/config');
    if (res.ok) setMpConfig(await res.json());
  };

  const updateMpConfig = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/agent/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mpConfig),
    });
    if (res.ok) {
      alert('Configuración actualizada');
    } else {
      alert('Error actualizando configuración');
    }
  };

  const fetchStats = async () => {
    const res = await fetch('/api/agent/stats');
    if (res.ok) setStats(await res.json());
  };

  const fetchPlayers = async () => {
    const res = await fetch('/api/agent/players');
    if (res.ok) setPlayers(await res.json());
  };

  const fetchTransactions = async () => {
    const res = await fetch('/api/agent/transactions');
    if (res.ok) setTransactions(await res.json());
  };

  const updateTransactionStatus = async (id: string, status: 'COMPLETED' | 'REJECTED') => {
    if (!confirm(`¿Estás seguro de marcar esta transacción como ${status}?`)) return;
    
    const res = await fetch(`/api/transactions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      fetchTransactions();
      fetchStats(); // Balance might change
    }
  };

  const createPlayer = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/agent/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlayer),
    });
    if (res.ok) {
      setNewPlayer({ name: '', email: '', password: '' });
      fetchPlayers();
      fetchStats();
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Agente</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Cerrar Sesión
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('players')}
            className={`px-4 py-2 rounded ${activeTab === 'players' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
          >
            Jugadores
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded ${activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
          >
            Transacciones
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded ${activeTab === 'config' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
          >
            Configuración
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Jugadores Asignados</h3>
            <p className="text-3xl font-bold">{stats.playersCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Saldo Total Jugadores</h3>
            <p className="text-3xl font-bold">${stats.totalPlayersBalance.toLocaleString()}</p>
          </div>
        </div>

        {activeTab === 'config' && (
          <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Integración MercadoPago</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Configura tu Access Token de MercadoPago para recibir transferencias automatizadas. 
              El sistema verificará pagos automáticamente si está habilitado.
            </p>
            <form onSubmit={updateMpConfig} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Access Token</label>
                <input
                  type="password"
                  placeholder="TEST-1234..."
                  className="w-full p-2 border rounded mt-1"
                  value={mpConfig.mpAccessToken || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setMpConfig({...mpConfig, mpAccessToken: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mpEnabled"
                  checked={mpConfig.mpEnabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setMpConfig({...mpConfig, mpEnabled: e.target.checked})}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="mpEnabled" className="text-sm font-medium text-gray-700">Habilitar Pagos Automáticos</label>
              </div>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Guardar Configuración
              </button>
            </form>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Registrar Nuevo Jugador</h2>
              <form onSubmit={createPlayer} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  className="w-full p-2 border rounded"
                  value={newPlayer.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPlayer({...newPlayer, name: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 border rounded"
                  value={newPlayer.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPlayer({...newPlayer, email: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="w-full p-2 border rounded"
                  value={newPlayer.password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPlayer({...newPlayer, password: e.target.value})}
                  required
                />
                <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Crear Jugador
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Mis Jugadores</h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {players.map((player) => (
                  <div key={player.id} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">{player.name}</span>
                      <span className="text-green-600 font-bold">${player.balance.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-500">{player.email}</div>
                  </div>
                ))}
                {players.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No tienes jugadores asignados aún.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Gestión de Transacciones</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3">Fecha</th>
                    <th className="pb-3">Jugador</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Monto</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 text-sm">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 font-medium">{tx.user.name}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.type === 'DEPOSIT' ? 'Depósito' : 'Retiro'}
                        </span>
                      </td>
                      <td className="py-3 font-bold">${tx.amount.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          tx.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 flex space-x-2">
                        <button
                          onClick={() => setSelectedTx(tx.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                          Chat
                        </button>
                        {tx.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateTransactionStatus(tx.id, 'COMPLETED')}
                              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => updateTransactionStatus(tx.id, 'REJECTED')}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-500">
                        No hay transacciones registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {selectedTx && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl">
              <ChatWindow
                transactionId={selectedTx}
                currentUserRole="AGENT"
                onClose={() => setSelectedTx(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
