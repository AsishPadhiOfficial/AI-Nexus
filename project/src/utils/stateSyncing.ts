export const syncStates = {
  modelToAutomation: (modelId: string, status: string) => {
    // Sync model status with automation workflows
    const relatedWorkflows = workflows.filter(w => w.modelId === modelId);
    relatedWorkflows.forEach(workflow => {
      if (status === 'training') {
        workflow.status = 'active';
      } else if (status === 'failed') {
        workflow.status = 'paused';
      }
    });
  },

  automationToDeployment: (workflowId: string, status: string) => {
    // Sync automation results with deployments
    const deployment = deployments.find(d => d.workflowId === workflowId);
    if (deployment) {
      deployment.status = status === 'success' ? 'active' : 'failed';
    }
  },

  analysisToModel: (modelId: string, analysisResults: any) => {
    // Update model metrics based on analysis
    const model = models.find(m => m.id === modelId);
    if (model) {
      model.metrics = {
        ...model.metrics,
        accuracy: analysisResults.accuracy,
        confidence: analysisResults.confidence
      };
    }
  }
}; 