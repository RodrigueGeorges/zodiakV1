export class PerformanceMonitor {
  private static readonly METRICS = {
    FCP: 'first-contentful-paint',
    LCP: 'largest-contentful-paint',
    FID: 'first-input-delay',
    CLS: 'cumulative-layout-shift',
    TTFB: 'time-to-first-byte'
  } as const;

  static init(): void {
    // Observer les métriques Web Vitals
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const fcp = entries[0];
          Analytics.trackPerformance(this.METRICS.FCP, fcp.startTime);
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lcp = entries[entries.length - 1];
          Analytics.trackPerformance(this.METRICS.LCP, lcp.startTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const fid = entries[0];
          Analytics.trackPerformance(this.METRICS.FID, fid.duration);
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        let cls = 0;
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        Analytics.trackPerformance(this.METRICS.CLS, cls);
      }).observe({ entryTypes: ['layout-shift'] });

      // Time to First Byte
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        Analytics.trackPerformance(this.METRICS.TTFB, ttfb);
      }
    }
  }

  static measureDuration(name: string, fn: () => void): void {
    const start = performance.now();
    fn();
    const duration = performance.now() - start;
    Analytics.trackPerformance(`duration_${name}`, duration);
  }

  static async measureAsyncDuration(name: string, fn: () => Promise<void>): Promise<void> {
    const start = performance.now();
    await fn();
    const duration = performance.now() - start;
    Analytics.trackPerformance(`duration_${name}`, duration);
  }
}