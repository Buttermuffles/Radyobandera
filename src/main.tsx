import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'
import { hydrateCache, clearStorageCache } from './lib/cache'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE,
  });
}

hydrateCache();

const STORAGE_AGE_LIMIT = 24 * 60 * 60 * 1000;
try {
  const cached = localStorage.getItem('app-cache-timestamp');
  if (cached && Date.now() - Number(cached) > STORAGE_AGE_LIMIT) {
    clearStorageCache();
  }
  localStorage.setItem('app-cache-timestamp', String(Date.now()));
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
