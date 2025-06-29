// Système de monitoring et d'analytics

export type EventType = 
  | 'page_view'
  | 'page_leave'
  | 'tab_change'
  | 'guidance'
  | 'profile'
  | 'social_share'
  | 'action'
  | 'error'
  | 'performance';

type EventData = Record<string, any>;

export class Analytics {
  private static readonly STORAGE_KEY = 'analytics_events';
  private static readonly MAX_EVENTS = 1000;
  private static readonly BATCH_SIZE = 50;
  private static readonly SESSION_START = Date.now();

  private static getEvents(): Array<{
    type: EventType;
    timestamp: string;
    sessionDuration: number;
    data: EventData;
  }> {
    try {
      const events = localStorage.getItem(this.STORAGE_KEY);
      return events ? JSON.parse(events) : [];
    } catch {
      return [];
    }
  }

  private static saveEvents(events: Array<{
    type: EventType;
    timestamp: string;
    sessionDuration: number;
    data: EventData;
  }>): void {
    try {
      const trimmedEvents = events.slice(-this.MAX_EVENTS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedEvents));
    } catch (error) {
      console.error('Error saving events:', error);
    }
  }

  static trackEvent(type: EventType, data: EventData = {}): void {
    try {
      const events = this.getEvents();
      events.push({
        type,
        timestamp: new Date().toISOString(),
        sessionDuration: Date.now() - this.SESSION_START,
        data: {
          ...data,
          url: window.location.pathname,
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          devicePixelRatio: window.devicePixelRatio
        }
      });
      this.saveEvents(events);

      // Si on atteint la taille du batch, envoyer les événements
      if (events.length >= this.BATCH_SIZE) {
        this.sendEvents();
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  static trackPageView(page: string): void {
    this.trackEvent('page_view', { page });
  }

  static trackAction(action: string, data: EventData = {}): void {
    this.trackEvent('action', { action, ...data });
  }

  static trackError(error: Error, context: EventData = {}): void {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  static trackPerformance(metric: string, value: number): void {
    this.trackEvent('performance', { 
      metric, 
      value,
      memory: performance?.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize
      } : undefined
    });
  }

  private static async sendEvents(): Promise<void> {
    try {
      const events = this.getEvents();
      if (events.length === 0) return;

      // TODO: Implémenter l'envoi des événements à un service d'analytics
      // Pour l'instant, on se contente de vider le stockage
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error sending events:', error);
    }
  }

  static getSessionDuration(): number {
    return Date.now() - this.SESSION_START;
  }

  static clearEvents(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
} 