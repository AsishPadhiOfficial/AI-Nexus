import { AIError, handleError } from '../utils/errorHandling';
import { syncStates } from '../utils/stateSyncing';
import { ValidationSystem } from '../utils/ValidationSystem';
import { monitoring } from '../utils/monitoring';
import { Task, Metric, Alert, AutomationTask, TaskConfig, MetricConfig, AlertConfig } from '../types';
import { AIModel } from '../types/index';

interface ModelData {
  name: string;
  type: string;
  framework: string;
  configuration?: {
    epochs: number;
    batchSize: number;
  };
}

interface WorkflowData {
  name: string;
  type: string;
  trigger: string;
  schedule?: string;
}

interface APIData {
  name: string;
  path: string;
  method: string;
  rateLimit?: {
    requests: number;
    period: 'second' | 'minute' | 'hour';
  };
}

interface ModelMetrics {
  precision: number;
  recall: number;
  f1Score: number;
}

interface SyncedEndpoint {
  id: string;
  modelId: string;
  status: string;
}

export class AIService {
  private baseUrl: string;
  private apiKey: string;
  private mockData: boolean;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.mockData = !baseUrl || baseUrl.includes('localhost');
  }

  // Model management
  async listModels(): Promise<AIModel[]> {
    if (this.mockData) {
      return this.getMockModels();
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      if (!response.ok) throw new Error('Failed to fetch models');
      return response.json();
    } catch (error) {
      console.warn('Using mock data due to API error:', error);
      return this.getMockModels();
    }
  }

  private getMockModels(): AIModel[] {
    return syncStates.getModels();
  }

  async createModel(config: Omit<AIModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIModel> {
    if (this.mockData) {
      console.warn('Using mock data in development mode');
      const mockModel: AIModel = {
        id: Math.random().toString(36).substr(2, 9),
        name: config.name,
        type: config.type,
        framework: config.framework,
        status: 'training',
        accuracy: 0,
        progress: 0,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
        metrics: {
          precision: 0,
          recall: 0,
          f1Score: 0
        },
        deploymentStatus: 'undeployed'
      };
      syncStates.addModel(mockModel);
      return mockModel;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const model = await response.json();
      syncStates.addModel(model);
      return model;
    } catch {
      console.warn('Server not available, using mock data');
      const mockModel: AIModel = {
        id: Math.random().toString(36).substr(2, 9),
        name: config.name,
        type: config.type,
        framework: config.framework,
        status: 'training',
        accuracy: 0,
        progress: 0,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
        metrics: {
          precision: 0,
          recall: 0,
          f1Score: 0
        },
        deploymentStatus: 'undeployed'
      };
      syncStates.addModel(mockModel);
      return mockModel;
    }
  }

  async deleteModel(modelId: string): Promise<void> {
    if (this.mockData) {
      syncStates.removeModel(modelId);
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models/${modelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete model');
      }

      syncStates.removeModel(modelId);
    } catch (error) {
      console.error('Error deleting model:', error);
      throw error;
    }
  }

  // Task management
  async listTasks(): Promise<Task[]> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  }

  async createTask(config: TaskConfig): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  }

  // Automation task management
  async listAutomationTasks(): Promise<AutomationTask[]> {
    const response = await fetch(`${this.baseUrl}/automation-tasks`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    if (!response.ok) throw new Error('Failed to fetch automation tasks');
    return response.json();
  }

  async createAutomationTask(task: Omit<AutomationTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<AutomationTask> {
    const response = await fetch(`${this.baseUrl}/automation-tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to create automation task');
    return response.json();
  }

  async runTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/automation-tasks/${taskId}/run`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    if (!response.ok) throw new Error('Failed to run task');
  }

  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/automation-tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    if (!response.ok) throw new Error('Failed to delete task');
  }

  async getTaskStatus(taskId: string): Promise<{ status: string; progress: number; lastRunTime?: string }> {
    const response = await fetch(`${this.baseUrl}/automation-tasks/${taskId}/status`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    if (!response.ok) throw new Error('Failed to get task status');
    return response.json();
  }

  // Metrics and alerts
  async getMetrics(config: MetricConfig): Promise<Metric[]> {
    const response = await fetch(`${this.baseUrl}/metrics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  }

  async getAlerts(): Promise<Alert[]> {
    const response = await fetch(`${this.baseUrl}/alerts`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  }

  async createAlert(config: AlertConfig): Promise<Alert> {
    const response = await fetch(`${this.baseUrl}/alerts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error('Failed to create alert');
    return response.json();
  }

  // Model validation and state syncing
  validateModel(data: ModelData): string[] {
    return ValidationSystem.validate('model', data);
  }

  validateWorkflow(data: WorkflowData): string[] {
    return ValidationSystem.validate('workflow', data);
  }

  validateAPI(data: APIData): string[] {
    return ValidationSystem.validate('api', data);
  }

  syncModelToAPI(modelId: string, status: string): void {
    syncStates.modelToAPI(modelId, status);
  }

  syncAPIToModel(endpointId: string, metrics: ModelMetrics): void {
    syncStates.apiToModel(endpointId, metrics);
  }

  addModelToSync(model: AIModel): void {
    syncStates.addModel(model);
  }

  addEndpointToSync(endpoint: SyncedEndpoint): void {
    syncStates.addEndpoint(endpoint);
  }

  getSyncedModels(): AIModel[] {
    return syncStates.getModels();
  }

  getSyncedEndpoints(): SyncedEndpoint[] {
    return syncStates.getEndpoints();
  }

  // Workflow Services
  async createWorkflow(workflowData: WorkflowData): Promise<void> {
    const errors = ValidationSystem.validate('workflow', workflowData);
    if (errors.length > 0) {
      throw new AIError('Workflow validation failed', 'VALIDATION_ERROR', 'error');
    }

    // Monitor workflow creation
    monitoring.trackMetrics('workflow', {
      type: 'creation',
      timestamp: new Date()
    });
  }

  // Error handling
  private handleAPIError(error: unknown): never {
    throw handleError(error as AIError);
  }

  async pauseModel(modelId: string): Promise<AIModel> {
    if (this.mockData) {
      const models = syncStates.getModels();
      const model = models.find(m => m.id === modelId);
      if (!model) throw new Error('Model not found');
      
      if (model.status === 'training') {
        model.status = 'paused';
        model.lastUpdated = new Date().toISOString();
        syncStates.updateModel(model);
      }
      return model;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models/${modelId}/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to pause model');
      }

      const model = await response.json();
      syncStates.updateModel(model);
      return model;
    } catch (error) {
      console.error('Error pausing model:', error);
      throw error;
    }
  }

  async resumeModel(modelId: string): Promise<AIModel> {
    if (this.mockData) {
      const models = syncStates.getModels();
      const model = models.find(m => m.id === modelId);
      if (!model) throw new Error('Model not found');
      
      if (model.status === 'paused') {
        model.status = 'training';
        model.lastUpdated = new Date().toISOString();
        syncStates.updateModel(model);
      }
      return model;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models/${modelId}/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to resume model');
      }

      const model = await response.json();
      syncStates.updateModel(model);
      return model;
    } catch (error) {
      console.error('Error resuming model:', error);
      throw error;
    }
  }
} 