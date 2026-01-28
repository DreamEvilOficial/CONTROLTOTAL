'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Wallet, ArrowUpCircle, ArrowDownCircle, History, MessageCircle, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import ChatWindow from '@/components/ChatWindow';
import SupportChat from '@/components/SupportChat';

export default function PlayerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ balance: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [withdrawDetails, setWithdrawDetails] = useState({ cvu: '', alias: '', bank: '' });
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
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="text-primary">CONTROL</span>TOTAL
          </h1>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>

        {/* Balance Card */}
        <div className="glass rounded-2xl p-8 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-32 h-32 text-primary" />
          </div>
          <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2 font-medium">Saldo Disponible</h2>
          <div className="text-5xl font-black text-white mb-8 tracking-tighter text-glow">
            ${stats.balance.toLocaleString()}
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
        </div>

        {/* Transactions History */}
        <div className="glass rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-white">Historial de Transacciones</h2>
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
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-4 text-gray-300">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                        tx.type === 'DEPOSIT' 
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
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${
                        tx.status === 'COMPLETED' ? 'text-green-400' :
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
                        <button
                          onClick={() => setSelectedTx(tx.id)}
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                          title="Chat"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
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
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
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
                    onChange={(e) => setWithdrawDetails({...withdrawDetails, cvu: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Alias"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    value={withdrawDetails.alias}
                    onChange={(e) => setWithdrawDetails({...withdrawDetails, alias: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Nombre del Banco / Billetera"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    value={withdrawDetails.bank}
                    onChange={(e) => setWithdrawDetails({...withdrawDetails, bank: e.target.value})}
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
            <div className="w-full max-w-2xl glass rounded-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/10 shadow-2xl">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                 <h3 className="font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    Chat de Transacción
                 </h3>
                 <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-white transition-colors">✕</button>
              </div>
              
              {selectedTransactionData?.expectedAmount && selectedTransactionData.status === 'PENDING' && selectedTransactionData.type === 'DEPOSIT' && (
                <div className="bg-secondary/10 p-4 border-b border-secondary/20 text-sm">
                  <p className="font-bold text-secondary mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Instrucciones de Pago Automático:
                  </p>
                  <p className="text-gray-300">Transfiere EXACTAMENTE <span className="text-xl font-bold text-white text-glow mx-1">${selectedTransactionData.expectedAmount.toFixed(2)}</span></p>
                  <p className="text-gray-400 text-xs mt-2">El monto incluye centavos únicos para identificar tu pago. Se acreditará automáticamente en segundos.</p>
                </div>
              )}

              {selectedTransactionData?.type === 'WITHDRAW' && selectedTransactionData.status === 'PENDING' && (
                <div className="bg-yellow-500/10 p-4 border-b border-yellow-500/20 text-sm">
                  <p className="font-bold text-yellow-500 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Solicitud de Retiro en Proceso
                  </p>
                  <p className="text-gray-300 mb-2">Tu solicitud ha sido enviada al administrador. Por favor espera la confirmación en el chat.</p>
                  <div className="bg-black/20 p-2 rounded text-xs text-gray-400 space-y-1">
                     <p>Monto a recibir: <span className="text-white font-bold">${selectedTransactionData.amount}</span></p>
                     {selectedTransactionData.withdrawalCvu && <p>CVU: {selectedTransactionData.withdrawalCvu}</p>}
                     {selectedTransactionData.withdrawalAlias && <p>Alias: {selectedTransactionData.withdrawalAlias}</p>}
                     {selectedTransactionData.withdrawalBank && <p>Banco: {selectedTransactionData.withdrawalBank}</p>}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-hidden bg-black/20">
                <ChatWindow
                  transactionId={selectedTx}
                  currentUserRole="PLAYER"
                  onClose={() => setSelectedTx(null)}
                />
              </div>
            </div>
          </div>
        )}

        <SupportChat />
      </div>
    </div>
  );
}
