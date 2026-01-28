'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';

export default function MarketingPage() {
  interface Config {
    metaAccessToken: string;
    metaAdAccountId: string;
  }

  interface Campaign {
    campaignName: string;
    dailyBudget: number;
    status: string;
  }

  const [config, setConfig] = useState<Config>({ metaAccessToken: '', metaAdAccountId: '' });
  const [campaign, setCampaign] = useState<Campaign>({ campaignName: '', dailyBudget: 1000, status: 'PAUSED' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const res = await fetch('/api/admin/config');
    if (res.ok) setConfig(await res.json());
  };

  const updateConfig = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (res.ok) alert('Configuración guardada');
    else alert('Error guardando configuración');
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
        alert(`Campaña creada con éxito! ID: ${data.campaignId}`);
        setCampaign({ campaignName: '', dailyBudget: 1000, status: 'PAUSED' });
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Marketing & Publicidad</h1>

      {/* Configuración */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Configuración Meta Ads</h2>
        <form onSubmit={updateConfig} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Meta Access Token</label>
            <input
              type="password"
              className="w-full p-2 border rounded mt-1"
              value={config.metaAccessToken || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfig({...config, metaAccessToken: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ad Account ID</label>
            <input
              type="text"
              placeholder="act_123456789"
              className="w-full p-2 border rounded mt-1"
              value={config.metaAdAccountId || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfig({...config, metaAdAccountId: e.target.value})}
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Guardar Credenciales
          </button>
        </form>
      </div>

      {/* Crear Campaña */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Lanzar Campaña Rápida</h2>
        <form onSubmit={createCampaign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de Campaña</label>
            <input
              type="text"
              className="w-full p-2 border rounded mt-1"
              value={campaign.campaignName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCampaign({...campaign, campaignName: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado Inicial</label>
              <select
                className="w-full p-2 border rounded mt-1"
                value={campaign.status}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setCampaign({...campaign, status: e.target.value})}
              >
                <option value="PAUSED">Pausada</option>
                <option value="ACTIVE">Activa</option>
              </select>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-bold disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Lanzar Campaña en Meta'}
          </button>
        </form>
      </div>
    </div>
  );
}
