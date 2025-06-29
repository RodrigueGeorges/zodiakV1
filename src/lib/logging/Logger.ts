// ATTENTION: NE PAS MODIFIER CE FICHIER
// Système de journalisation sécurisé

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
};

export class Logger {
  private static readonly MAX_LOGS = 1000;
  private static readonly STORAGE_KEY = 'app_logs';
  private static readonly SENSITIVE_FIELDS = ['password', 'token', 'code', 'phone'];

  private static sanitizeData(data: any): any {
    if (!data) return data;
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      for (const field of this.SENSITIVE_FIELDS) {
        if (field in sanitized) {
          sanitized[field] = '***';
        }
      }
      return sanitized;
    }
    
    return data;
  }

  private static getLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem(this.STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  private static saveLogs(logs: LogEntry[]): void {
    try {
      // Garder seulement les derniers logs
      const trimmedLogs = logs.slice(-this.MAX_LOGS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  }

  private static addLog(level: LogLevel, message: string, data?: any): void {
    try {
      const logs = this.getLogs();
      logs.push({
        timestamp: new Date().toISOString(),
        level,
        message,
        data: this.sanitizeData(data)
      });
      this.saveLogs(logs);
    } catch (error) {
      console.error('Error adding log:', error);
    }
  }

  static debug(message: string, data?: any): void {
    this.addLog('debug', message, data);
  }

  static info(message: string, data?: any): void {
    this.addLog('info', message, data);
  }

  static warn(message: string, data?: any): void {
    this.addLog('warn', message, data);
  }

  static error(message: string, data?: any): void {
    this.addLog('error', message, data);
  }

  static getLast(count: number = 100): LogEntry[] {
    const logs = this.getLogs();
    return logs.slice(-count);
  }

  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}