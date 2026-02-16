'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(() => {
            // registered
          })
          .catch((e) => console.warn('Service Worker registration failed:', e))
      })
    }
  }, [])

  return null
}
