type ValidationRule = {
  test: (value: any) => boolean;
  message: string;
};

type ValidationSchema = {
  [key: string]: ValidationRule[];
};

export class ValidationSystem {
  private static schemas: Map<string, ValidationSchema> = new Map();

  static registerSchema(type: string, schema: ValidationSchema) {
    this.schemas.set(type, schema);
  }

  static validate(type: string, data: any): string[] {
    const schema = this.schemas.get(type);
    if (!schema) {
      throw new Error(`No validation schema found for type: ${type}`);
    }

    const errors: string[] = [];

    Object.entries(schema).forEach(([field, rules]) => {
      rules.forEach(rule => {
        if (!rule.test(data[field])) {
          errors.push(rule.message.replace('{field}', field));
        }
      });
    });

    return errors;
  }
}

// Register schemas
ValidationSystem.registerSchema('model', {
  name: [
    { test: (v) => !!v, message: '{field} is required' },
    { test: (v) => v.length >= 3, message: '{field} must be at least 3 characters' }
  ],
  type: [
    { test: (v) => !!v, message: '{field} is required' },
    { test: (v) => ['classification', 'regression'].includes(v), message: 'Invalid {field}' }
  ]
}); 