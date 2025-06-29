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

const Analytics = {
  STORAGE_KEY: 'analytics_events',
  MAX_EVENTS: 1000,
  BATCH_SIZE: 50,
  SESSION_START: Date.now(),

  getEvents(): Array<{
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
  },

  saveEvents(events: Array<{
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
  },

  trackEvent(type: EventType, data: EventData = {}): void {
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
  },

  trackPageView(page: string): void {
    this.trackEvent('page_view', { page });
  },

  trackAction(action: string, data: EventData = {}): void {
    this.trackEvent('action', { action, ...data });
  },

  trackError(error: Error, context: EventData = {}): void {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  },

  trackPerformance(metric: string, value: number): void {
    this.trackEvent('performance', { 
      metric, 
      value,
      memory: (performance as any)?.memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : undefined
    });
  },

  async sendEvents(): Promise<void> {
    try {
      const events = this.getEvents();
      if (events.length === 0) return;

      // TODO: Implémenter l'envoi des événements à un service d'analytics
      // Pour l'instant, on se contente de vider le stockage
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error sending events:', error);
    }
  },

  getSessionDuration(): number {
    return Date.now() - this.SESSION_START;
  },

  clearEvents(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};

export default Analytics; 