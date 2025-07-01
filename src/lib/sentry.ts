import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

export const initSentry = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: import.meta.env.MODE,
      beforeSend(event) {
        // Ne pas envoyer les erreurs en développement
        if (import.meta.env.DEV) {
          return null
        }
        return event
      },
    })
  }
}

export function captureException(error: unknown, context?: Record<string, any>) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
    })
  }
  console.error(error, context)
} 