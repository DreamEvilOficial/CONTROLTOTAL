import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Coins, LayoutDashboard, Zap } from 'lucide-react';

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
          <span className="text-white text-glow">CargarFichas</span>
          <span className="text-primary ml-4 text-glow">YA</span>
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

        {/* Provider Logos */}
        <div className="mb-24 text-center mt-24">
           <h3 className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-8 font-medium">Proveedores Oficiales</h3>
           <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-white font-black text-2xl hover:text-primary transition-colors tracking-tight cursor-default">PRAGMATIC PLAY</span>
              <span className="text-white font-black text-2xl hover:text-red-500 transition-colors tracking-tight cursor-default">RubyPlay</span>
              <span className="text-white font-black text-2xl hover:text-blue-400 transition-colors tracking-tight cursor-default">EVOLUTION</span>
              <span className="text-white font-black text-2xl hover:text-blue-600 transition-colors tracking-tight cursor-default">playtech</span>
           </div>
        </div>

        {/* Security Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 max-w-6xl mx-auto">
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
        © 2026 CargarFichasYA. Todos los derechos reservados.
      </footer>
    </div>
  );
}
