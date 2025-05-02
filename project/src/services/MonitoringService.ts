import { MonitoringSystem } from '../utils/MonitoringSystem';

interface Alert {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export class MonitoringService {
  private monitoring = MonitoringSystem.getInstance();
  private alerts: Alert[] = [];

  constructor() {
    // Listen for threshold alerts
    window.addEventListener('alert', ((e: CustomEvent) => {
      const { metric, value, threshold } = e.detail;
      this.addAlert(metric, `Threshold exceeded: ${value} > ${threshold}`, 'high');
    }) as EventListener);
  }

  async getMetrics(name: string, timeRange: number = 3600000): Promise<{ timestamp: number; value: number; type: string }[]> {
    return this.monitoring.getMetrics(name, timeRange);
  }

  async getAlerts(): Promise<Alert[]> {
    return this.alerts;
  }

  async clearAlerts(): Promise<void> {
    this.alerts = [];
  }

  private addAlert(type: string, message: string, severity: 'low' | 'medium' | 'high'): void {
    const alert: Alert = {
      id: Date.now().toString(),
      type,
      message,
      severity,
      timestamp: new Date().toISOString()
    };
    this.alerts.push(alert);
  }

  async checkThresholds(): Promise<void> {
    // Check error rate threshold
    const errorRateMetrics = await this.getMetrics('errorRate');
    const avgErrorRate = errorRateMetrics.reduce((sum, m) => sum + m.value, 0) / errorRateMetrics.length;
    
    if (avgErrorRate > 0.1) {
      this.addAlert('errorRate', `High error rate detected: ${avgErrorRate.toFixed(2)}`, 'high');
    }

    // Check latency threshold
    const latencyMetrics = await this.getMetrics('latency');
    const avgLatency = latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length;
    
    if (avgLatency > 1000) {
      this.addAlert('latency', `High latency detected: ${avgLatency.toFixed(2)}ms`, 'medium');
    }
  }
} 