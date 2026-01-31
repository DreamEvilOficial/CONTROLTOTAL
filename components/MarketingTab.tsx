
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { Megaphone, Save, Play, Pause, AlertCircle, CheckCircle2, Upload, ExternalLink, ShieldCheck } from 'lucide-react';

interface Config {
  metaAccessToken: string;
  metaAdAccountId: string;
  metaPageId: string;
  metaPixelId: string;
}

interface CampaignForm {
  campaignName: string;
  dailyBudget: number;
  status: string;
  targetUrl: string;
  headline: string;
  primaryText: string;
}

export default function MarketingTab() {
  const [config, setConfig] = useState<Config>({ metaAccessToken: '', metaAdAccountId: '', metaPageId: '', metaPixelId: '' });
  const [campaign, setCampaign] = useState<CampaignForm>({
    campaignName: '',
    dailyBudget: 1000,
    status: 'PAUSED',
    targetUrl: '',
    headline: '',
    primaryText: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        setConfig({
          metaAccessToken: data.metaAccessToken || '',
          metaAdAccountId: data.metaAdAccountId || '',
          metaPageId: data.metaPageId || '',
          metaPixelId: data.metaPixelId || '',
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const updateConfig = async (e: FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        alert('Configuración guardada correctamente');
      } else {
        alert('Error guardando configuración');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Error de conexión');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const createCampaign = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Por favor selecciona una imagen para el anuncio');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('campaignName', campaign.campaignName);
      formData.append('dailyBudget', campaign.dailyBudget.toString());
      formData.append('status', campaign.status);
      formData.append('targetUrl', campaign.targetUrl);
      formData.append('headline', campaign.headline);
      formData.append('primaryText', campaign.primaryText);
      formData.append('image', imageFile);

      const res = await fetch('/api/admin/marketing/create', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(`¡Campaña creada con éxito! ID: ${data.campaignId}`);
        setCampaign({
          campaignName: '',
          dailyBudget: 1000,
          status: 'PAUSED',
          targetUrl: '',
          headline: '',
          primaryText: ''
        });
        setImageFile(null);
        setImagePreview(null);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = config.metaAccessToken && config.metaAdAccountId && config.metaPageId;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Configuración */}
      <div className="space-y-8">
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Configuración Meta Ads
          </h3>
          <form onSubmit={updateConfig} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Meta Access Token</label>
              <input
                type="password"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
                value={config.metaAccessToken}
                onChange={(e) => setConfig({ ...config, metaAccessToken: e.target.value })}
                placeholder="EAA..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Ad Account ID</label>
                <input
                  type="text"
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
                  value={config.metaAdAccountId}
                  onChange={(e) => setConfig({ ...config, metaAdAccountId: e.target.value })}
                  placeholder="act_123..."
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Page ID</label>
                <input
                  type="text"
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
                  value={config.metaPageId}
                  onChange={(e) => setConfig({ ...config, metaPageId: e.target.value })}
                  placeholder="1000..."
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Pixel ID (Opcional)</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
                value={config.metaPixelId}
                onChange={(e) => setConfig({ ...config, metaPixelId: e.target.value })}
                placeholder="123456..."
              />
            </div>
            <button
              type="submit"
              disabled={savingConfig}
              className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {savingConfig ? (
                <span className="animate-pulse">Guardando...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Credenciales
                </>
              )}
            </button>
          </form>
        </div>

        {/* Compliance Section */}
        <div className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
            Checklist de Aprobación
          </h3>
          <p className="text-sm text-gray-400 mb-4">Para asegurar que Facebook apruebe tus anuncios, verifica lo siguiente:</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <span>Tu página tiene una Política de Privacidad visible.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <span>El contenido no promete ganancias irreales ni éxito garantizado.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <span>La página de destino (URL) funciona correctamente y es segura (HTTPS).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <span>La Fan Page (Página de Facebook) tiene foto de perfil y portada.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Crear Campaña */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Play className="w-5 h-5 text-green-500" />
          Crear y Lanzar Anuncio
        </h3>

        {!isConfigured ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3 text-yellow-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              Debes configurar el Access Token, Ad Account ID y Page ID antes de poder crear anuncios.
            </p>
          </div>
        ) : (
          <form onSubmit={createCampaign} className="space-y-5">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Nombre de la Campaña</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
                value={campaign.campaignName}
                onChange={(e) => setCampaign({ ...campaign, campaignName: e.target.value })}
                required
                placeholder="Ej: Promo Bienvenida"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Presupuesto Diario</label>
                <input
                  type="number"
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
                  value={campaign.dailyBudget}
                  onChange={(e) => setCampaign({ ...campaign, dailyBudget: Number(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">URL de Destino (Landing)</label>
                <input
                  type="url"
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
                  value={campaign.targetUrl}
                  onChange={(e) => setCampaign({ ...campaign, targetUrl: e.target.value })}
                  required
                  placeholder="https://tucasino.com"
                />
              </div>
            </div>

            <div className="p-4 bg-black/20 border border-dashed border-white/20 rounded-xl">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Creatividad del Anuncio</h4>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Título Principal (Headline)</label>
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-primary/50 outline-none"
                    value={campaign.headline}
                    onChange={(e) => setCampaign({ ...campaign, headline: e.target.value })}
                    required
                    placeholder="¡Bono de Bienvenida Exclusivo!"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Texto Principal (Body)</label>
                  <textarea
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-primary/50 outline-none resize-none h-20"
                    value={campaign.primaryText}
                    onChange={(e) => setCampaign({ ...campaign, primaryText: e.target.value })}
                    required
                    placeholder="Regístrate hoy y obtén beneficios increíbles..."
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Imagen del Anuncio</label>
                  <div
                    className="border border-white/10 bg-black/40 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="max-h-32 rounded object-cover" />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Upload className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-xs">Click para subir imagen</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Estado Inicial</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCampaign({ ...campaign, status: 'ACTIVE' })}
                  className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${campaign.status === 'ACTIVE'
                      ? 'bg-green-500/20 border-green-500 text-green-500'
                      : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                >
                  <Play className="w-4 h-4" />
                  Activa
                </button>
                <button
                  type="button"
                  onClick={() => setCampaign({ ...campaign, status: 'PAUSED' })}
                  className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${campaign.status === 'PAUSED'
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                      : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                >
                  <Pause className="w-4 h-4" />
                  Pausada
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-black font-bold py-3 rounded-lg hover:bg-green-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Publicando en Meta...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Publicar Anuncio
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
