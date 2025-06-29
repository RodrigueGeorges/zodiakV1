import React, { Component, ErrorInfo } from 'react';
import { Logger } from '../logging/Logger';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Journaliser l'erreur
    Logger.error('React error boundary caught error', {
      error: error.message,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-cosmic-900 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">
              Oups ! Une erreur est survenue
            </h1>
            <p className="text-gray-300 mb-6">
              Nous sommes désolés, mais quelque chose s'est mal passé.
              Notre équipe a été notifiée et travaille sur le problème.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-cosmic-900 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}