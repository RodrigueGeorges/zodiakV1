import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from './lib/errors/ErrorBoundary'
import { PerformanceMonitor } from './lib/performance/PerformanceMonitor'
import { SuperAuthService } from './lib/auth'
import { initSentry } from './lib/sentry'
import { AuthProvider } from './lib/hooks/useAuth'

// Initialiser Sentry
initSentry()

// Créer un client
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <React.Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0B1120',color:'#fff'}}>Chargement...</div>}>
              <App />
            </React.Suspense>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)

// Register service worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'module'
      });

      // Update service worker if new version available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('Une nouvelle version est disponible. Voulez-vous mettre à jour ?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });

      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}