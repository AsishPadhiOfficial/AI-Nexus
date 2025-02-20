export const validators = {
  model: (data: any) => {
    const required = ['name', 'type', 'framework'];
    const errors = [];

    required.forEach(field => {
      if (!data[field]) {
        errors.push(`${field} is required`);
      }
    });

    if (data.configuration) {
      if (data.configuration.epochs < 1) {
        errors.push('Epochs must be greater than 0');
      }
      if (data.configuration.batchSize < 1) {
        errors.push('Batch size must be greater than 0');
      }
    }

    return errors;
  },

  workflow: (data: any) => {
    const required = ['name', 'type', 'trigger'];
    const errors = [];

    required.forEach(field => {
      if (!data[field]) {
        errors.push(`${field} is required`);
      }
    });

    if (data.trigger === 'schedule' && !data.schedule) {
      errors.push('Schedule is required for scheduled workflows');
    }

    return errors;
  },

  analysis: (data: any) => {
    const required = ['modelId', 'datasetId'];
    const errors = [];

    required.forEach(field => {
      if (!data[field]) {
        errors.push(`${field} is required`);
      }
    });

    if (data.threshold && (data.threshold < 0 || data.threshold > 1)) {
      errors.push('Threshold must be between 0 and 1');
    }

    return errors;
  }
}; 