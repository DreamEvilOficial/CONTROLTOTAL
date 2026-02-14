import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>
        
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar nuestra plataforma, usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.</p>
          </section>

          <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Elegibilidad</h2>
            <p>Debe tener al menos 18 años de edad para utilizar nuestros servicios. Al registrarse, usted declara y garantiza que cumple con este requisito de edad y que tiene la capacidad legal para celebrar contratos vinculantes.</p>
          </section>

          <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Cuenta de Usuario</h2>
            <p>Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta. Nos reservamos el derecho de suspender o cancelar cuentas que violen nuestras políticas.</p>
          </section>

          <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Uso Aceptable</h2>
            <p>Usted acepta no utilizar la plataforma para actividades ilegales, fraudulentas o no autorizadas. Cualquier intento de manipular el sistema, explotar vulnerabilidades o perjudicar a otros usuarios resultará en la terminación inmediata de su cuenta.</p>
          </section>

          <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Limitación de Responsabilidad</h2>
            <p>La plataforma se proporciona "tal cual". No garantizamos que el servicio sea ininterrumpido o libre de errores. No seremos responsables por pérdidas indirectas, incidentales o consecuentes derivadas del uso de nuestros servicios.</p>
          </section>

          <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio. Su uso continuado de la plataforma constituye su aceptación de los nuevos términos.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} CargarFichasYA. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
