import { MonitoringSystem } from '../utils/MonitoringSystem';
import { validators } from '../utils/validation';
import { syncStates } from '../utils/stateSyncing';

interface ModelMetrics {
  accuracy: number;
  latency: number;
  errorRate: number;
}

interface ModelConfiguration {
  epochs: number;
  batchSize: number;
}

interface Model {
  id: string;
  name: string;
  type: string;
  framework: string;
  status: 'inactive' | 'training' | 'active' | 'paused';
  metrics: ModelMetrics;
  configuration: ModelConfiguration;
  createdAt: string;
}

interface CreateModelData {
  name: string;
  type: string;
  framework: string;
  configuration?: ModelConfiguration;
}

export class ModelService {
  private monitoring = MonitoringSystem.getInstance();

  async createModel(data: CreateModelData): Promise<Model> {
    // Validate model data
    const errors = validators.model(data);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Create model with basic metadata
    const model: Model = {
      id: Date.now().toString(),
      name: data.name,
      type: data.type,
      framework: data.framework,
      status: 'inactive',
      metrics: {
        accuracy: 0,
        latency: 0,
        errorRate: 0
      },
      configuration: data.configuration || {
        epochs: 10,
        batchSize: 32
      },
      createdAt: new Date().toISOString()
    };

    // Store model
    syncStates.addModel(model);

    // Start monitoring
    this.monitoring.recordMetric('model_accuracy', 0, 'model');
    this.monitoring.recordMetric('model_latency', 0, 'model');

    return model;
  }

  async trainModel(modelId: string): Promise<Model> {
    const models = syncStates.getModels();
    const model = models.find(m => m.id === modelId);
    
    if (!model) {
      throw new Error('Model not found');
    }

    // Simulate training
    model.status = 'training';
    
    // Simulate training progress
    for (let i = 0; i < model.configuration.epochs; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const accuracy = Math.min(100, 70 + Math.random() * 30);
      const latency = 50 + Math.random() * 50;
      
      model.metrics.accuracy = accuracy;
      model.metrics.latency = latency;
      
      this.monitoring.recordMetric('model_accuracy', accuracy, 'model');
      this.monitoring.recordMetric('model_latency', latency, 'model');
    }

    model.status = 'active';
    return model;
  }

  async getModel(modelId: string): Promise<Model | undefined> {
    const models = syncStates.getModels();
    return models.find(m => m.id === modelId);
  }

  async listModels(): Promise<Model[]> {
    return syncStates.getModels();
  }

  async pauseModel(modelId: string): Promise<Model> {
    const models = syncStates.getModels();
    const model = models.find(m => m.id === modelId);
    
    if (!model) {
      throw new Error('Model not found');
    }

    if (model.status === 'training') {
      model.status = 'paused';
    }

    return model;
  }

  async resumeModel(modelId: string): Promise<Model> {
    const models = syncStates.getModels();
    const model = models.find(m => m.id === modelId);
    
    if (!model) {
      throw new Error('Model not found');
    }

    if (model.status === 'paused') {
      model.status = 'training';
    }

    return model;
  }

  async deleteModel(modelId: string): Promise<boolean> {
    const models = syncStates.getModels();
    const index = models.findIndex(m => m.id === modelId);
    if (index > -1) {
      models.splice(index, 1);
      return true;
    }
    return false;
  }
} 