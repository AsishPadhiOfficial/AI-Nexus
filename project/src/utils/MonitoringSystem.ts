type Metric = {
  timestamp: number;
  value: number;
  type: string;
};

export class MonitoringSystem {
  private static instance: MonitoringSystem;
  private metrics: Map<string, Metric[]> = new Map();
  private alertThresholds: Map<string, number> = new Map();

  private constructor() {
    // Initialize with default thresholds
    this.alertThresholds.set('errorRate', 0.1); // 10% error rate threshold
    this.alertThresholds.set('latency', 1000); // 1000ms latency threshold
  }

  public static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  public recordMetric(name: string, value: number, type: string) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metric: Metric = {
      timestamp: Date.now(),
      value,
      type
    };

    this.metrics.get(name)?.push(metric);
    this.checkThreshold(name, value);
  }

  public getMetrics(name: string, timeRange: number = 3600000): Metric[] {
    const metrics = this.metrics.get(name) || [];
    const cutoff = Date.now() - timeRange;
    return metrics.filter(m => m.timestamp > cutoff);
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
    // In a real app, this would trigger notifications
    window.dispatchEvent(new CustomEvent('alert', {
      detail: {
        metric: metricName,
        value,
        threshold
      }
    }));
  }
} 