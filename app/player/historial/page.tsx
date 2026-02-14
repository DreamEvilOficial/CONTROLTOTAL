'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle, MessageCircle, RefreshCw, Wallet } from 'lucide-react';

export default function HistorialPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/player/transactions');
      if (res.ok) setTransactions(await res.json());
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 relative overflow-hidden">
       {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/player" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Historial <span className="text-primary">Completo</span>
          </h1>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8">
          {loading ? (
             <div className="flex justify-center py-12">
               <RefreshCw className="w-8 h-8 animate-spin text-primary" />
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="pb-4 pl-4">Fecha</th>
                    <th className="pb-4">Tipo</th>
                    <th className="pb-4">Monto</th>
                    <th className="pb-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-4 text-gray-300">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
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
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        No hay transacciones registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
