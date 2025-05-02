export interface Model {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Metric {
  id: string;
  type: string;
  value: number;
  timestamp: string;
}

export interface Alert {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  resolvedAt?: string;
}

export interface AutomationTask {
  id: string;
  name: string;
  type: 'scheduled' | 'event' | 'manual';
  modelId: string;
  description: string;
  schedule?: string;
  config: Record<string, unknown>;
  status: 'active' | 'inactive' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface ModelConfig {
  name: string;
  type: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface TaskConfig {
  name: string;
  type: string;
  modelId: string;
  parameters: Record<string, unknown>;
}

export interface MetricConfig {
  type: string;
  threshold: number;
  window: number;
}

export interface AlertConfig {
  type: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
} 