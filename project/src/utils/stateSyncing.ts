import { AIModel } from '../types/index';

interface SyncedEndpoint {
  id: string;
  modelId: string;
  status: string;
}

interface ModelMetrics {
  precision: number;
  recall: number;
  f1Score: number;
}

// In-memory storage for demo purposes
const models: AIModel[] = [];
const endpoints: SyncedEndpoint[] = [];

export const syncStates = {
  modelToAPI: (modelId: string, status: string): void => {
    // Update related API endpoints when model status changes
    const relatedEndpoints = endpoints.filter(e => e.modelId === modelId);
    relatedEndpoints.forEach(endpoint => {
      if (status === 'active') {
        endpoint.status = 'active';
      } else if (status === 'inactive') {
        endpoint.status = 'inactive';
      }
    });
  },

  apiToModel: (endpointId: string, metrics: ModelMetrics): void => {
    // Update model metrics based on API performance
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (endpoint?.modelId) {
      const model = models.find(m => m.id === endpoint.modelId);
      if (model) {
        model.metrics = metrics;
      }
    }
  },

  // Helper functions for demo purposes
  addModel: (model: AIModel): void => {
    models.push(model);
  },

  addEndpoint: (endpoint: SyncedEndpoint): void => {
    endpoints.push(endpoint);
  },

  getModels: (): AIModel[] => models,
  getEndpoints: (): SyncedEndpoint[] => endpoints,

  removeModel: (modelId: string): void => {
    const index = models.findIndex(m => m.id === modelId);
    if (index > -1) {
      models.splice(index, 1);
    }
  },

  updateModel: (model: AIModel): void => {
    const index = models.findIndex(m => m.id === model.id);
    if (index > -1) {
      models[index] = model;
    }
  }
}; 