import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
        
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introducción</h2>
            <p>Bienvenido a nuestra plataforma. Nos tomamos muy en serio su privacidad y nos comprometemos a proteger su información personal. Esta Política de Privacidad explica cómo recopilamos, usamos y compartimos su información.</p>
          </section>

          <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Información que Recopilamos</h2>
            <p>Podemos recopilar la siguiente información:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Información de contacto (nombre, correo electrónico, número de teléfono).</li>
              <li>Credenciales de cuenta (nombre de usuario, contraseña cifrada).</li>
              <li>Información de transacciones y pagos.</li>
              <li>Datos de uso y actividad en la plataforma.</li>
            </ul>
          </section>

          <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Uso de la Información</h2>
            <p>Utilizamos su información para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Proporcionar y mantener nuestros servicios.</li>
              <li>Procesar sus transacciones y gestionar su cuenta.</li>
              <li>Comunicarnos con usted sobre actualizaciones, ofertas y soporte.</li>
              <li>Detectar y prevenir fraudes.</li>
            </ul>
          </section>

          <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Seguridad</h2>
            <p>Implementamos medidas de seguridad robustas para proteger sus datos personales. Sin embargo, ningún método de transmisión por Internet es 100% seguro, por lo que no podemos garantizar seguridad absoluta.</p>
          </section>

          <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Sus Derechos</h2>
            <p>Usted tiene derecho a acceder, corregir o eliminar su información personal. Puede ejercer estos derechos contactando a nuestro equipo de soporte.</p>
          </section>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} CargarFichasYA. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
