import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { captureException } from '../lib/sentry'

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Une erreur est survenue</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        captureException(error)
      }}
      onReset={() => {
        // Réinitialiser l'état de l'application si nécessaire
        window.location.reload()
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
} 