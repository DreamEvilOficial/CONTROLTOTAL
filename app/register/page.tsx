'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, ArrowRight, Gamepad2, Gift, Phone } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  bonus: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    platformId: '',
    whatsapp: '',
  });
  const [localPhone, setLocalPhone] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const res = await fetch('/api/config/public');
      if (res.ok) {
        const data = await res.json();
        setPlatforms(data.platforms || []);
        if (data.platforms && data.platforms.length > 0) {
          setFormData(prev => ({ ...prev, platformId: data.platforms[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching platforms:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (platforms.length > 0 && !formData.platformId) {
      setError('Por favor selecciona una plataforma');
      setLoading(false);
      return;
    }

    const digits = localPhone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Ingresa un WhatsApp válido: +54 9 y 10 dígitos');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      // Auto login after registration
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        const role = (loginData.user as { role: string }).role;

        // Save for login page later
        localStorage.setItem('recentUsername', formData.username);
        localStorage.setItem('lastUsername', formData.username);

        if (role === 'ADMIN') router.push('/admin');
        else if (role === 'AGENT') router.push('/agent');
        else router.push('/player');

        router.refresh();
      } else {
        router.push('/login?registered=true');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#050505]">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 z-10">

        {/* Left Column: Form */}
        <div className="glass rounded-2xl shadow-2xl p-8 border border-white/10">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Crear Cuenta</h2>
            <p className="text-gray-400">Únete a nosotros y empieza a ganar</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Nombre Completo</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="Juan Perez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Usuario</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="juanperez123"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">WhatsApp</label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-black/30 border border-white/10 border-r-0 rounded-l-xl text-gray-400 select-none">
                    +54 9
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    className="w-full pr-4 py-3 bg-black/20 border border-white/10 border-l-0 rounded-r-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all pl-3"
                    placeholder="11 2345 6789"
                    value={localPhone}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setLocalPhone(onlyDigits);
                      setFormData(prev => ({ ...prev, whatsapp: `549${onlyDigits}` }));
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-1">Formato: +54 9 + 10 dígitos (sin 0 ni 15)</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                'Creando cuenta...'
              ) : (
                <>
                  Crear mi usuario
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="text-center mt-6">
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                ¿Ya tienes cuenta? <span className="text-primary font-bold">Inicia Sesión</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column: Platform Selection */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-primary" />
              Elige tu Plataforma
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Selecciona donde quieres jugar para recibir tu bono de bienvenida exclusivo.
            </p>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {platforms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Cargando plataformas...
                </div>
              ) : (
                platforms.map((platform) => (
                  <label
                    key={platform.id}
                    className={`block p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${formData.platformId === platform.id
                      ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                      : 'bg-black/20 border-white/10 hover:border-primary/50'
                      }`}
                  >
                    <input
                      type="radio"
                      name="platform"
                      value={platform.id}
                      checked={formData.platformId === platform.id}
                      onChange={(e) => setFormData({ ...formData, platformId: e.target.value })}
                      className="hidden"
                    />
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-bold text-lg ${formData.platformId === platform.id ? 'text-primary' : 'text-white'
                        }`}>
                        {platform.name}
                      </h4>
                      {formData.platformId === platform.id && (
                        <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(255,215,0,0.5)]"></span>
                      )}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-300">
                      <Gift className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <p>{platform.bonus}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
