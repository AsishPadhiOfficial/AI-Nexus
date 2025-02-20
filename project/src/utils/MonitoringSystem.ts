type Metric = {
  timestamp: number;
  value: number;
  labels: Record<string, string>;
};

export class MonitoringSystem {
  private static instance: MonitoringSystem;
  private metrics: Map<string, Metric[]> = new Map();
  private alertThresholds: Map<string, number> = new Map();

  private constructor() {
    this.startPeriodicCheck();
  }

  public static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  public recordMetric(name: string, value: number, labels: Record<string, string> = {}) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metric: Metric = {
      timestamp: Date.now(),
      value,
      labels
    };

    this.metrics.get(name)?.push(metric);
    this.checkThreshold(name, value);
  }

  public setAlertThreshold(metricName: string, threshold: number) {
    this.alertThresholds.set(metricName, threshold);
  }

  private checkThreshold(metricName: string, value: number) {
    const threshold = this.alertThresholds.get(metricName);
    if (threshold && value > threshold) {
      this.triggerAlert(metricName, value, threshold);
    }
  }

  private triggerAlert(metricName: string, value: number, threshold: number) {
    console.warn(`Alert: ${metricName} exceeded threshold of ${threshold} with value ${value}`);
    // Implement your alert notification system here
  }

  private startPeriodicCheck() {
    setInterval(() => {
      this.cleanOldMetrics();
    }, 3600000); // Clean up every hour
  }

  private cleanOldMetrics() {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.metrics.forEach((metrics, name) => {
      const filtered = metrics.filter(m => m.timestamp > oneWeekAgo);
      this.metrics.set(name, filtered);
    });
  }
} 