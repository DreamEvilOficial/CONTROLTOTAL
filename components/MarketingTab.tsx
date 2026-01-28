'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Megaphone, Save, Play, Pause, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Config {
  metaAccessToken: string;
  metaAdAccountId: string;
}

interface Campaign {
  campaignName: string;
  dailyBudget: number;
  status: string;
}

export default function MarketingTab() {
  const [config, setConfig] = useState<Config>({ metaAccessToken: '', metaAdAccountId: '' });
  const [campaign, setCampaign] = useState<Campaign>({ campaignName: '', dailyBudget: 1000, status: 'PAUSED' });
  const [loading, setLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

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

  const createCampaign = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`¡Campaña creada con éxito! ID: ${data.campaignId}`);
        setCampaign({ campaignName: '', dailyBudget: 1000, status: 'PAUSED' });
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Configuración */}
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
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
              value={config.metaAccessToken}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfig({...config, metaAccessToken: e.target.value})}
              placeholder="EAA..."
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Ad Account ID</label>
            <input
              type="text"
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
              value={config.metaAdAccountId}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfig({...config, metaAdAccountId: e.target.value})}
              placeholder="act_123456789"
            />
          </div>
          <button 
            type="submit" 
            disabled={savingConfig}
            className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

      {/* Crear Campaña */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Play className="w-5 h-5 text-green-500" />
          Lanzar Campaña Rápida
        </h3>
        
        {!config.metaAccessToken || !config.metaAdAccountId ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3 text-yellow-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              Debes configurar las credenciales de Meta Ads antes de poder crear campañas.
            </p>
          </div>
        ) : (
          <form onSubmit={createCampaign} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Nombre de Campaña</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                value={campaign.campaignName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCampaign({...campaign, campaignName: e.target.value})}
                required
                placeholder="Ej: Promo Verano 2024"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Estado Inicial</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCampaign({...campaign, status: 'ACTIVE'})}
                  className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    campaign.status === 'ACTIVE'
                      ? 'bg-green-500/20 border-green-500 text-green-500'
                      : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  Activa
                </button>
                <button
                  type="button"
                  onClick={() => setCampaign({...campaign, status: 'PAUSED'})}
                  className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    campaign.status === 'PAUSED'
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
              className="w-full bg-green-500 text-black font-bold py-3 rounded-lg hover:bg-green-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span className="animate-pulse">Creando...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Crear Campaña
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
