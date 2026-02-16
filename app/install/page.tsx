"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler as any)

    window.addEventListener('appinstalled', () => setInstalled(true))

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as any)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (choice && choice.outcome === 'accepted') setInstalled(true)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Instalar CargarFichasYA!</h1>
      <p className="text-gray-400 mb-6">Instala la aplicación en tu dispositivo o baja desde las tiendas oficiales.</p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <a
          className="flex-1 py-3 rounded-lg bg-green-600 text-white font-bold"
          href="https://play.google.com/store/apps/details?id=YOUR_ANDROID_PACKAGE_NAME"
          target="_blank"
          rel="noreferrer"
        >
          Google Play
        </a>
        <a
          className="flex-1 py-3 rounded-lg bg-black text-white font-bold"
          href="https://apps.apple.com/app/idYOUR_APP_STORE_ID"
          target="_blank"
          rel="noreferrer"
        >
          App Store
        </a>
      </div>

      <div className="mt-6">
        {installed ? (
          <div className="text-green-400">Aplicación instalada ✅</div>
        ) : deferredPrompt ? (
          <button onClick={promptInstall} className="px-6 py-3 bg-primary text-black rounded-lg font-bold">Instalar PWA</button>
        ) : (
          <div className="text-sm text-gray-500">Si estás en iOS, usa el menú de compartir y "Añadir a pantalla de inicio".</div>
        )}
      </div>

      <div className="mt-8 text-xs text-gray-500">
        <p>Nota: reemplaza los enlaces de la tienda con tus IDs reales en <code>app/install/page.tsx</code>.</p>
      </div>
    </div>
  )
}
