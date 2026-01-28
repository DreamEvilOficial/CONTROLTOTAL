'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import ChatWindow from '@/components/ChatWindow';

export default function PlayerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ balance: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    
    // Auto-refresh every 10s for updates
    const interval = setInterval(() => {
      fetchTransactions();
      fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    const res = await fetch('/api/player/stats');
    if (res.ok) setStats(await res.json());
  };

  const fetchTransactions = async () => {
    const res = await fetch('/api/player/transactions');
    if (res.ok) setTransactions(await res.json());
  };

  const handleTransaction = async (type: 'DEPOSIT' | 'WITHDRAW') => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    const res = await fetch('/api/player/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount), type }),
    });

    if (res.ok) {
      const tx = await res.json();
      setAmount('');
      setShowDepositModal(false);
      setShowWithdrawModal(false);
      fetchTransactions();
      
      // Open chat automatically for deposits
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

  // Auto-check logic for selected transaction
  useEffect(() => {
    if (!selectedTx) return;
    
    const tx = transactions.find(t => t.id === selectedTx);
    if (tx?.expectedAmount && tx.status === 'PENDING') {
      const interval = setInterval(() => {
        checkPayment(selectedTx);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedTx, transactions]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const selectedTransactionData = transactions.find(t => t.id === selectedTx);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">Mi Panel</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-sm">
            Salir
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700 shadow-lg">
          <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Saldo Disponible</h2>
          <div className="text-4xl font-bold text-white mb-6">
            ${stats.balance.toLocaleString()}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold transition-colors"
            >
              Depositar
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition-colors"
            >
              Retirar
            </button>
          </div>
        </div>

        {/* Transactions History */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-200">Historial de Transacciones</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm">
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Monto</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-700/50">
                    <td className="py-3 text-gray-300">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tx.type === 'DEPOSIT' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.type === 'DEPOSIT' ? 'Depósito' : 'Retiro'}
                      </span>
                    </td>
                    <td className="py-3 font-medium">
                      ${tx.amount.toLocaleString()}
                      {tx.expectedAmount && tx.status === 'PENDING' && (
                        <div className="text-xs text-yellow-400 font-mono mt-1">
                          Transferir: ${tx.expectedAmount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs ${
                        tx.status === 'COMPLETED' ? 'text-green-400' :
                        tx.status === 'REJECTED' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {tx.status === 'PENDING' ? 'Pendiente' : 
                         tx.status === 'COMPLETED' ? 'Completado' : 'Rechazado'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedTx(tx.id)}
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Chat
                        </button>
                        {tx.status === 'PENDING' && tx.expectedAmount && (
                          <button
                            onClick={() => checkPayment(tx.id)}
                            disabled={checkingPayment}
                            className="text-green-400 hover:text-green-300 underline text-xs"
                          >
                            {checkingPayment ? '...' : 'Verificar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      No hay transacciones recientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        {(showDepositModal || showWithdrawModal) && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
              <h3 className="text-xl font-bold mb-4">
                {showDepositModal ? 'Cargar Fichas' : 'Retirar Fichas'}
              </h3>
              <input
                type="number"
                placeholder="Monto"
                className="w-full bg-gray-700 border border-gray-600 rounded p-3 mb-4 text-white focus:outline-none focus:border-yellow-500"
                value={amount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setShowWithdrawModal(false);
                  }}
                  className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleTransaction(showDepositModal ? 'DEPOSIT' : 'WITHDRAW')}
                  className="flex-1 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat & Info Modal */}
        {selectedTx && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl bg-gray-800 rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 bg-gray-700 flex justify-between items-center">
                 <h3 className="font-bold">Chat de Transacción</h3>
                 <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              {selectedTransactionData?.expectedAmount && selectedTransactionData.status === 'PENDING' && (
                <div className="bg-yellow-900/50 p-4 border-b border-yellow-700 text-sm">
                  <p className="font-bold text-yellow-500 mb-1">⚠️ Instrucciones de Pago Automático:</p>
                  <p>Transfiere EXACTAMENTE <span className="text-xl font-bold text-white">${selectedTransactionData.expectedAmount.toFixed(2)}</span></p>
                  <p className="text-gray-400 text-xs mt-1">El monto incluye centavos únicos para identificar tu pago. Se acreditará automáticamente en segundos.</p>
                </div>
              )}

              <div className="flex-1 overflow-hidden">
                <ChatWindow
                  transactionId={selectedTx}
                  currentUserRole="PLAYER"
                  onClose={() => setSelectedTx(null)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
