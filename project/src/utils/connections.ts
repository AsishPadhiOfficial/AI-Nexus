// This file will help manage the interactions between different sections

export const modelStatusMap = {
  training: {
    next: 'trained',
    color: 'yellow',
    action: 'Train'
  },
  trained: {
    next: 'deployed',
    color: 'green',
    action: 'Deploy'
  },
  deployed: {
    next: 'training',
    color: 'blue',
    action: 'Retrain'
  },
  failed: {
    next: 'training',
    color: 'red',
    action: 'Retry'
  }
};

export const calculateModelMetrics = (analysisResults: any[]) => {
  if (!analysisResults?.length) return {
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0
  };
  
  return {
    accuracy: analysisResults.reduce((acc, curr) => acc + (curr?.results?.metrics?.accuracy || 0), 0) / analysisResults.length,
    precision: analysisResults.reduce((acc, curr) => acc + (curr?.results?.metrics?.precision || 0), 0) / analysisResults.length,
    recall: analysisResults.reduce((acc, curr) => acc + (curr?.results?.metrics?.recall || 0), 0) / analysisResults.length,
    f1Score: analysisResults.reduce((acc, curr) => acc + (curr?.results?.metrics?.f1Score || 0), 0) / analysisResults.length
  };
};

export const generateAutomationFromModel = (model: any) => {
  return {
    name: `${model.name} Training Pipeline`,
    type: 'training',
    trigger: 'schedule',
    schedule: '0 0 * * *', // Daily at midnight
    modelId: model.id,
    actions: [
      {
        type: 'preprocess',
        config: { /* preprocessing config */ }
      },
      {
        type: 'train',
        config: model.configuration
      },
      {
        type: 'evaluate',
        config: { threshold: 0.75 }
      },
      {
        type: 'deploy',
        config: { automatic: true }
      }
    ]
  };
};

export const generateDeploymentFromModel = (model: any) => {
  return {
    name: `${model.name} API`,
    path: `/api/v1/models/${model.id}/predict`,
    method: 'POST',
    modelId: model.id,
    version: model.version,
    rateLimit: 1000,
    authentication: true,
    configuration: {
      scalingPolicy: {
        minReplicas: 1,
        maxReplicas: 5,
        targetCPUUtilization: 70
      },
      resources: {
        cpu: '1',
        memory: '2Gi'
      }
    }
  };
}; 