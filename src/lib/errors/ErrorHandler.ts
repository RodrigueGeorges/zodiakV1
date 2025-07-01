import { Logger } from '../logging/Logger';

export class ErrorHandler {
  private static isHandlingError = false;

  static init(): void {
    // Capturer les erreurs non gérées
    window.onerror = (message, source, line, column, error) => {
      this.handleError(error || new Error(String(message)), {
        source,
        line,
        column
      });
    };

    // Capturer les rejets de promesses non gérés
    window.onunhandledrejection = (event) => {
      this.handleError(event.reason, {
        type: 'unhandled_rejection'
      });
    };
  }

  static handleError(error: Error, context: Record<string, unknown> = {}): void {
    // Éviter les boucles infinies
    if (this.isHandlingError) return;
    this.isHandlingError = true;

    try {
      // Journaliser l'erreur
      Logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        ...context
      });

      // Afficher un message à l'utilisateur si nécessaire
      if (import.meta.env.PROD) {
        // En production, afficher un message générique
        console.error('Une erreur est survenue. Notre équipe a été notifiée.');
      } else {
        // En développement, afficher l'erreur complète
        console.error('Error:', error);
        console.error('Context:', context);
      }
    } finally {
      this.isHandlingError = false;
    }
  }
}