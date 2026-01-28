import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Coins, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <main className="z-10 text-center max-w-4xl px-4">
        <div className="flex justify-center mb-8">
          <div className="p-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm box-glow">
            <Coins className="w-16 h-16 text-secondary animate-bounce" />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
          <span className="text-white text-glow">CASINO</span>
          <span className="text-primary ml-4 text-glow">PLATFORM</span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-12 text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
          Gestión integral para operadores de juego. 
          <span className="text-secondary font-medium"> Potencia tu negocio</span> con nuestra suite de administración.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <Link
            href="/login"
            className="group relative px-8 py-4 bg-primary text-black font-bold text-lg rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Iniciar Sesión <ShieldCheck className="w-5 h-5" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </Link>

          <Link
            href="/register"
            className="group relative px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-lg rounded-xl overflow-hidden transition-all hover:bg-white/10 hover:border-white/20"
          >
            <span className="relative z-10 flex items-center gap-2">
              Crear Cuenta <LayoutDashboard className="w-5 h-5" />
            </span>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
          {[
            { title: 'Seguridad Total', desc: 'Protección de datos y transacciones encriptadas.', icon: ShieldCheck },
            { title: 'Gestión Real', desc: 'Control total de agentes y jugadores en tiempo real.', icon: LayoutDashboard },
            { title: 'Pagos Rápidos', desc: 'Integración fluida con métodos de pago locales.', icon: Coins },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors backdrop-blur-sm">
              <item.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
      
      <footer className="absolute bottom-4 text-gray-600 text-sm">
        © 2026 Casino Platform. Todos los derechos reservados.
      </footer>
    </div>
  );
}
