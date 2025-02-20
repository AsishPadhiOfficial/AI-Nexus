import { useState, useEffect } from 'react';
import { PerformanceMetric } from '../types';

// Simulate real-time data updates
function generateMetric(): PerformanceMetric {
  return {
    timestamp: new Date().toISOString(),
    accuracy: 75 + Math.random() * 20,
    loss: Math.random(),
    predictions: Math.floor(Math.random() * 1000)
  };
}

export function useRealTimeData(interval: number = 5000) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial data
    const initialData: PerformanceMetric[] = Array.from({ length: 10 }, () => generateMetric());
    setMetrics(initialData);
    setIsLoading(false);

    // Real-time updates
    const timer = setInterval(() => {
      setMetrics(prev => {
        const newMetric = generateMetric();
        return [...prev.slice(1), newMetric];
      });
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return { metrics, isLoading };
}