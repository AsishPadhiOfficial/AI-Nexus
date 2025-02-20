import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  AIModel, 
  AIStats, 
  AutomationTask, 
  APIEndpoint, 
  Alert, 
  ResourceMonitoring,
  DeploymentConfig
} from '../types';
import { AIService } from '../services/AIService';

interface AIContextType {
  // Models
  models: AIModel[];
  addModel: (model: AIModel) => void;
  updateModel: (id: string, data: Partial<AIModel>) => void;
  deleteModel: (id: string) => void;
  
  // Deployments
  deployments: DeploymentConfig[];
  addDeployment: (deployment: DeploymentConfig) => void;
  updateDeployment: (id: string, data: Partial<DeploymentConfig>) => void;
  deleteDeployment: (id: string) => void;
  
  // Automations
  workflows: AutomationTask[];
  addWorkflow: (workflow: AutomationTask) => void;
  updateWorkflow: (id: string, data: Partial<AutomationTask>) => void;
  deleteWorkflow: (id: string) => void;
  
  // Analysis
  analyses: any[];
  addAnalysis: (analysis: any) => void;
  updateAnalysis: (id: string, data: any) => void;
  deleteAnalysis: (id: string) => void;
  
  // API Keys
  apiKeys: APIEndpoint[];
  generateApiKey: (name: string) => void;
  revokeApiKey: (id: string) => void;
  
  // Metrics
  metrics: {
    modelPerformance: any[];
    apiUsage: any[];
    systemHealth: any;
  };
  updateMetrics: () => void;
  
  // Stats and Monitoring
  stats: AIStats;
  resourceMetrics: ResourceMonitoring;
  alerts: Alert[];
  
  // Automation
  tasks: AutomationTask[];
  createAutomation: (task: Omit<AutomationTask, 'id'>) => void;
  updateAutomation: (id: string, updates: Partial<AutomationTask>) => void;
  toggleAutomation: (taskId: string) => void;
  deleteAutomation: (taskId: string) => void;
  
  // API Management
  endpoints: APIEndpoint[];
  deployEndpoint: (endpoint: Omit<APIEndpoint, 'id'>) => Promise<void>;
  updateEndpoint: (id: string, updates: Partial<APIEndpoint>) => void;
  monitorEndpoint: (id: string) => void;
  
  // Alerts and Notifications
  markAlertAsRead: (alertId: string) => void;
  clearAlerts: () => void;
  
  // Resource Management
  getResourceUsage: () => ResourceMonitoring;
  optimizeResources: () => Promise<void>;
}

const aiService = new AIService();

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  // Models State
  const [models, setModels] = useState<AIModel[]>([]);
  const [deployments, setDeployments] = useState<DeploymentConfig[]>([]);
  const [workflows, setWorkflows] = useState<AutomationTask[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<APIEndpoint[]>([]);
  const [metrics, setMetrics] = useState({
    modelPerformance: [],
    apiUsage: [],
    systemHealth: {}
  });
  const [stats, setStats] = useState<AIStats>({
    activeModels: 0,
    trainingSessions: 0,
    performanceScore: 0,
    lastUpdate: new Date().toISOString(),
    resourceUsage: { cpu: 0, memory: 0, gpu: 0 },
    totalPredictions: 0,
    averageLatency: 0
  });
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [resourceMetrics, setResourceMetrics] = useState<ResourceMonitoring>({
    timestamp: new Date().toISOString(),
    cpu: { usage: 0, temperature: 0, processes: 0 },
    memory: { used: 0, total: 0, swap: 0 },
    gpu: { usage: 0, memory: 0, temperature: 0 },
    network: { incoming: 0, outgoing: 0, latency: 0 },
    storage: { used: 0, total: 0, readSpeed: 0, writeSpeed: 0 }
  });

  // Simulate real-time resource monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setResourceMetrics(prev => ({
        ...prev,
        timestamp: new Date().toISOString(),
        cpu: {
          usage: Math.random() * 100,
          temperature: 40 + Math.random() * 40,
          processes: Math.floor(Math.random() * 100)
        },
        memory: {
          used: Math.random() * 32,
          total: 64,
          swap: Math.random() * 16
        },
        gpu: {
          usage: Math.random() * 100,
          memory: Math.random() * 16,
          temperature: 50 + Math.random() * 30
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Models Functions
  const addModel = async (modelData: any) => {
    try {
      const model = await aiService.createModel(modelData);
      setModels(prev => [...prev, model]);
      return model;
    } catch (error) {
      console.error('Failed to create model:', error);
      throw error;
    }
  };

  const updateModel = (id: string, data: Partial<AIModel>) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const deleteModel = (id: string) => {
    setModels(prev => prev.filter(m => m.id !== id));
  };

  // Deployment Functions
  const addDeployment = (deployment: DeploymentConfig) => {
    const newDeployment = {
      ...deployment,
      id: uuidv4(),
      status: 'deploying',
      createdAt: new Date().toISOString(),
      metrics: {
        requests: 0,
        latency: 0,
        errors: 0
      }
    };
    setDeployments(prev => [...prev, newDeployment]);
    return newDeployment;
  };

  const updateDeployment = (id: string, data: Partial<DeploymentConfig>) => {
    setDeployments(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  };

  const deleteDeployment = (id: string) => {
    setDeployments(prev => prev.filter(d => d.id !== id));
  };

  // Workflow Functions
  const addWorkflow = async (workflowData: any) => {
    try {
      const workflow = await aiService.createWorkflow(workflowData);
      setWorkflows(prev => [...prev, workflow]);
      return workflow;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  };

  const updateWorkflow = (id: string, data: Partial<AutomationTask>) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  // Analysis Functions
  const addAnalysis = async (analysisData: any) => {
    try {
      const analysis = await aiService.createAnalysis(analysisData);
      setAnalyses(prev => [...prev, analysis]);
      return analysis;
    } catch (error) {
      console.error('Failed to create analysis:', error);
      throw error;
    }
  };

  const updateAnalysis = (id: string, data: any) => {
    setAnalyses(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const deleteAnalysis = (id: string) => {
    setAnalyses(prev => prev.filter(a => a.id !== id));
  };

  // API Key Functions
  const generateApiKey = (name: string) => {
    const newKey = {
      id: uuidv4(),
      key: `ak_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
      name,
      created: new Date().toISOString(),
      lastUsed: null,
      status: 'active'
    };
    setApiKeys(prev => [...prev, newKey]);
    return newKey;
  };

  const revokeApiKey = (id: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' } : k));
  };

  // Metrics Update Function
  const updateMetrics = () => {
    // Simulate metrics update
    setMetrics({
      modelPerformance: models.map(m => ({
        id: m.id,
        name: m.name,
        accuracy: m.metrics.accuracy,
        requests: Math.floor(Math.random() * 1000)
      })),
      apiUsage: deployments.map(d => ({
        id: d.id,
        name: d.name,
        requests: d.metrics.requests,
        errors: d.metrics.errors
      })),
      systemHealth: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        storage: Math.random() * 100
      }
    });
  };

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(updateMetrics, 30000);
    return () => clearInterval(interval);
  }, [models, deployments]);

  // Automation Management
  const createAutomation = (task: Omit<AutomationTask, 'id'>) => {
    const newTask: AutomationTask = {
      ...task,
      id: uuidv4(),
      logs: []
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateAutomation = (id: string, updates: Partial<AutomationTask>) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const toggleAutomation = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: task.status === 'active' ? 'paused' : 'active',
            lastRun: new Date().toISOString()
          }
        : task
    ));
  };

  const deleteAutomation = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // API Management
  const deployEndpoint = async (endpoint: Omit<APIEndpoint, 'id'>) => {
    const newEndpoint: APIEndpoint = {
      ...endpoint,
      id: uuidv4(),
      performance: {
        requests: 0,
        latency: 0,
        errorRate: 0,
        lastCalled: new Date().toISOString()
      },
      monitoring: {
        uptime: 100,
        lastIncident: null,
        healthCheck: 'healthy'
      }
    };
    setEndpoints(prev => [...prev, newEndpoint]);
  };

  const updateEndpoint = (id: string, updates: Partial<APIEndpoint>) => {
    setEndpoints(prev => prev.map(endpoint =>
      endpoint.id === id ? { ...endpoint, ...updates } : endpoint
    ));
  };

  const monitorEndpoint = (id: string) => {
    // Simulate endpoint monitoring
    setEndpoints(prev => prev.map(endpoint =>
      endpoint.id === id
        ? {
            ...endpoint,
            performance: {
              requests: endpoint.performance.requests + Math.floor(Math.random() * 100),
              latency: Math.random() * 500,
              errorRate: Math.random() * 2,
              lastCalled: new Date().toISOString()
            }
          }
        : endpoint
    ));
  };

  // Alert Management
  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  // Resource Management
  const getResourceUsage = () => resourceMetrics;

  const optimizeResources = async () => {
    // Simulate resource optimization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setResourceMetrics(prev => ({
      ...prev,
      cpu: { ...prev.cpu, usage: prev.cpu.usage * 0.8 },
      memory: { ...prev.memory, used: prev.memory.used * 0.85 },
      gpu: { ...prev.gpu, usage: prev.gpu.usage * 0.75 }
    }));
  };

  const value = {
    models,
    addModel,
    updateModel,
    deleteModel,
    deployments,
    addDeployment,
    updateDeployment,
    deleteDeployment,
    workflows,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
    analyses,
    addAnalysis,
    updateAnalysis,
    deleteAnalysis,
    apiKeys,
    generateApiKey,
    revokeApiKey,
    metrics,
    updateMetrics,
    stats,
    tasks,
    createAutomation,
    updateAutomation,
    toggleAutomation,
    deleteAutomation,
    endpoints,
    deployEndpoint,
    updateEndpoint,
    monitorEndpoint,
    alerts,
    resourceMetrics,
    markAlertAsRead,
    clearAlerts,
    getResourceUsage,
    optimizeResources
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}