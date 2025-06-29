// ATTENTION: NE PAS MODIFIER CE FICHIER
// Système de rate limiting avancé pour protéger l'API

export class RateLimiter {
  private static readonly WINDOW_MS = 60 * 1000; // 1 minute
  private static readonly MAX_REQUESTS = 10;
  private static readonly STORAGE_PREFIX = 'rate_limit_';
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  private static getKey(action: string, identifier: string): string {
    return `${this.STORAGE_PREFIX}${action}_${identifier}`;
  }

  private static getAttempts(key: string): { count: number; timestamp: number } {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : { count: 0, timestamp: Date.now() };
    } catch {
      return { count: 0, timestamp: Date.now() };
    }
  }

  private static setAttempts(key: string, count: number): void {
    localStorage.setItem(key, JSON.stringify({
      count,
      timestamp: Date.now()
    }));
  }

  static isRateLimited(action: string, identifier: string): boolean {
    const key = this.getKey(action, identifier);
    const attempts = this.getAttempts(key);
    const now = Date.now();

    // Réinitialiser le compteur si la fenêtre de temps est passée
    if (now - attempts.timestamp > this.WINDOW_MS) {
      this.setAttempts(key, 1);
      return false;
    }

    // Vérifier si l'utilisateur est bloqué
    if (attempts.count >= this.MAX_REQUESTS) {
      const timeElapsed = now - attempts.timestamp;
      if (timeElapsed < this.LOCKOUT_DURATION) {
        return true;
      }
      // Réinitialiser après la période de blocage
      this.setAttempts(key, 1);
      return false;
    }

    // Incrémenter le compteur
    this.setAttempts(key, attempts.count + 1);
    return false;
  }

  static getRemainingTime(action: string, identifier: string): number {
    const key = this.getKey(action, identifier);
    const attempts = this.getAttempts(key);
    
    if (attempts.count >= this.MAX_REQUESTS) {
      const timeElapsed = Date.now() - attempts.timestamp;
      return Math.max(0, this.LOCKOUT_DURATION - timeElapsed);
    }
    
    return 0;
  }

  static clearLimits(action: string, identifier: string): void {
    const key = this.getKey(action, identifier);
    localStorage.removeItem(key);
  }
}