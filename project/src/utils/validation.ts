import { ErrorCodes, createError } from './errorHandling';

interface ValidationRule<T = unknown> {
  test: (value: T) => boolean;
  message: string;
  code: keyof typeof ErrorCodes;
}

interface ValidationSchema {
  [key: string]: ValidationRule[];
}

interface ModelValidationData {
  name: string;
  type: string;
  framework: string;
  epochs?: number;
  batchSize?: number;
  [key: string]: unknown;
}

interface WorkflowValidationData {
  name: string;
  type: string;
  [key: string]: unknown;
}

interface APIValidationData {
  name: string;
  endpoint: string;
  [key: string]: unknown;
}

export class ValidationSystem {
  private static schemas: Map<string, ValidationSchema> = new Map();

  static registerSchema(type: string, schema: ValidationSchema) {
    this.schemas.set(type, schema);
  }

  static validate(type: string, data: Record<string, unknown>): string[] {
    const schema = this.schemas.get(type);
    if (!schema) {
      throw createError('SYSTEM_ERROR', `No validation schema found for type: ${type}`);
    }

    const errors: string[] = [];

    Object.entries(schema).forEach(([field, rules]) => {
      const value = data[field];
      rules.forEach(rule => {
        if (!rule.test(value)) {
          const error = createError(rule.code, rule.message.replace('{field}', field), {
            field,
            value
          });
          errors.push(error.message);
        }
      });
    });

    return errors;
  }

  static validateModel(data: ModelValidationData): string[] {
    return this.validate('model', data);
  }

  static validateWorkflow(data: WorkflowValidationData): string[] {
    return this.validate('workflow', data);
  }

  static validateAPI(data: APIValidationData): string[] {
    return this.validate('api', data);
  }
}

// Register validation schemas
ValidationSystem.registerSchema('model', {
  name: [
    {
      test: (v: unknown) => typeof v === 'string' && v.length > 0,
      message: '{field} is required',
      code: 'MISSING_REQUIRED_FIELD'
    }
  ],
  type: [
    {
      test: (v: unknown) => typeof v === 'string' && ['classification', 'regression', 'clustering'].includes(v),
      message: '{field} must be one of: classification, regression, clustering',
      code: 'INVALID_FORMAT'
    }
  ],
  framework: [
    {
      test: (v: unknown) => typeof v === 'string' && ['tensorflow', 'pytorch', 'scikit-learn'].includes(v),
      message: '{field} must be one of: tensorflow, pytorch, scikit-learn',
      code: 'INVALID_FORMAT'
    }
  ]
});

ValidationSystem.registerSchema('workflow', {
  name: [
    {
      test: (v: unknown) => typeof v === 'string' && v.length > 0,
      message: '{field} is required',
      code: 'MISSING_REQUIRED_FIELD'
    }
  ],
  type: [
    {
      test: (v: unknown) => typeof v === 'string' && ['training', 'inference', 'evaluation'].includes(v),
      message: '{field} must be one of: training, inference, evaluation',
      code: 'INVALID_FORMAT'
    }
  ]
});

ValidationSystem.registerSchema('api', {
  name: [
    {
      test: (v: unknown) => typeof v === 'string' && v.length > 0,
      message: '{field} is required',
      code: 'MISSING_REQUIRED_FIELD'
    }
  ],
  endpoint: [
    {
      test: (v: unknown) => typeof v === 'string' && v.startsWith('/'),
      message: '{field} must start with a forward slash',
      code: 'INVALID_FORMAT'
    }
  ]
}); 