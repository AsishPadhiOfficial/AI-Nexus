export interface AIModel {
  id: string;
  name: string;
  status: 'training' | 'paused' | 'completed' | 'error';
  accuracy: number;
  progress: number;
  lastUpdated: string;
  type: 'classification' | 'regression' | 'nlp' | 'vision';
  framework: 'tensorflow' | 'pytorch' | 'scikit-learn';
  version: string;
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
  };
  deploymentStatus: 'deployed' | 'undeployed' | 'pending';
}

export interface TrainingParameters {
  learningRate: number;
  explorationRate: number;
  duration: number;
  batchSize: number;
  epochs: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop';
  lossFunction: string;
  validationSplit: number;
  earlyStoppingPatience: number;
}

export interface AIStats {
  activeModels: number;
  trainingSessions: number;
  performanceScore: number;
  lastUpdate: string;
  resourceUsage: {
    cpu: number;
    memory: number;
    gpu: number;
  };
  totalPredictions: number;
  averageLatency: number;
}

export interface AutomationTask {
  id: string;
  name: string;
  schedule: string;
  status: 'active' | 'paused' | 'completed' | 'error';
  lastRun: string;
  nextRun: string;
  type: 'training' | 'analysis' | 'backup' | 'deployment' | 'monitoring';
  config: {
    retryAttempts?: number;
    timeout?: number;
    notifyOnCompletion?: boolean;
    dependencies?: string[];
    resources?: {
      cpu: number;
      memory: number;
      gpu: boolean;
    };
  };
  logs: {
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
  }[];
}

export interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'active' | 'inactive' | 'error';
  version: string;
  authentication: {
    type: 'api_key' | 'oauth2' | 'jwt';
    required: boolean;
  };
  rateLimit: {
    requests: number;
    period: 'second' | 'minute' | 'hour';
  };
  performance: {
    requests: number;
    latency: number;
    errorRate: number;
    lastCalled: string;
  };
  monitoring: {
    uptime: number;
    lastIncident: string | null;
    healthCheck: 'healthy' | 'degraded' | 'down';
  };
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    slack: boolean;
    types: {
      training: boolean;
      deployment: boolean;
      errors: boolean;
      performance: boolean;
    };
  };
  language: string;
  twoFactor: boolean;
  autoSave: boolean;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'analyst';
  profile?: {
    avatar: string;
    title: string;
    company: string;
    location: string;
    bio: string;
    website?: string;
    social: {
      twitter: string;
      github: string;
      linkedin: string;
    };
  };
  preferences: {
    defaultModelFramework: 'tensorflow' | 'pytorch' | 'scikit-learn';
    autoDeployment: boolean;
    dataRetentionDays: number;
    resourceAlerts: boolean;
  };
}

export interface PerformanceMetric {
  timestamp: string;
  accuracy: number;
  loss: number;
  predictions: number;
  latency: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    gpu: number;
  };
  customMetrics: Record<string, number>;
}

export interface ModelDistribution {
  name: string;
  value: number;
  color: string;
  trend: number;
  details: {
    version: string;
    framework: string;
    lastUpdated: string;
  };
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  read: boolean;
  category: 'system' | 'model' | 'deployment' | 'security';
  priority: 'low' | 'medium' | 'high';
  actions?: {
    label: string;
    action: string;
  }[];
}

export interface ResourceMonitoring {
  timestamp: string;
  cpu: {
    usage: number;
    temperature: number;
    processes: number;
  };
  memory: {
    used: number;
    total: number;
    swap: number;
  };
  gpu: {
    usage: number;
    memory: number;
    temperature: number;
  };
  network: {
    incoming: number;
    outgoing: number;
    latency: number;
  };
  storage: {
    used: number;
    total: number;
    readSpeed: number;
    writeSpeed: number;
  };
}

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  replicas: number;
  resources: {
    cpu: string;
    memory: string;
    gpu: number;
  };
  scaling: {
    minReplicas: number;
    maxReplicas: number;
    targetCPUUtilization: number;
  };
  networking: {
    port: number;
    protocol: 'http' | 'grpc';
    timeout: number;
  };
  monitoring: {
    logging: boolean;
    metrics: boolean;
    tracing: boolean;
  };
}