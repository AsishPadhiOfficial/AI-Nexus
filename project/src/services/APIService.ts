import { MonitoringSystem } from '../utils/MonitoringSystem';
import { validators } from '../utils/validation';
import { syncStates } from '../utils/stateSyncing';

interface APIMetrics {
  requests: number;
  latency: number;
  errorRate: number;
}

interface RateLimit {
  requests: number;
  period: 'second' | 'minute' | 'hour';
}

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  modelId?: string;
  status: 'active' | 'inactive';
  rateLimit: RateLimit;
  authentication: boolean;
  metrics: APIMetrics;
  createdAt: string;
}

interface CreateEndpointData {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  modelId?: string;
  rateLimit: RateLimit;
  authentication: boolean;
}

interface APIResponse {
  success: boolean;
  latency: number;
  timestamp: string;
}

export class APIService {
  private monitoring = MonitoringSystem.getInstance();

  async createEndpoint(data: CreateEndpointData): Promise<APIEndpoint> {
    // Validate endpoint data
    const errors = validators.api(data);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Create endpoint with basic metadata
    const endpoint: APIEndpoint = {
      id: Date.now().toString(),
      name: data.name,
      path: data.path,
      method: data.method,
      modelId: data.modelId,
      status: 'inactive',
      rateLimit: data.rateLimit,
      authentication: data.authentication,
      metrics: {
        requests: 0,
        latency: 0,
        errorRate: 0
      },
      createdAt: new Date().toISOString()
    };

    // Store endpoint
    syncStates.addEndpoint(endpoint);

    // Start monitoring
    this.monitoring.recordMetric('api_requests', 0, 'api');
    this.monitoring.recordMetric('api_latency', 0, 'api');

    return endpoint;
  }

  async toggleEndpoint(endpointId: string): Promise<APIEndpoint> {
    const endpoints = syncStates.getEndpoints();
    const endpoint = endpoints.find(e => e.id === endpointId);
    
    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    endpoint.status = endpoint.status === 'active' ? 'inactive' : 'active';
    return endpoint;
  }

  async getEndpoint(endpointId: string): Promise<APIEndpoint | undefined> {
    const endpoints = syncStates.getEndpoints();
    return endpoints.find(e => e.id === endpointId);
  }

  async listEndpoints(): Promise<APIEndpoint[]> {
    return syncStates.getEndpoints();
  }

  async deleteEndpoint(endpointId: string): Promise<boolean> {
    const endpoints = syncStates.getEndpoints();
    const index = endpoints.findIndex(e => e.id === endpointId);
    if (index > -1) {
      endpoints.splice(index, 1);
      return true;
    }
    return false;
  }

  // Simulate API call
  async makeRequest(endpointId: string): Promise<APIResponse> {
    const endpoint = await this.getEndpoint(endpointId);
    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    if (endpoint.status !== 'active') {
      throw new Error('Endpoint is not active');
    }

    // Simulate request processing
    const latency = 50 + Math.random() * 50;
    const errorRate = Math.random() * 0.1;

    // Update metrics
    endpoint.metrics.requests++;
    endpoint.metrics.latency = latency;
    endpoint.metrics.errorRate = errorRate;

    // Record metrics
    this.monitoring.recordMetric('api_requests', endpoint.metrics.requests, 'api');
    this.monitoring.recordMetric('api_latency', latency, 'api');

    // Simulate response
    return {
      success: true,
      latency,
      timestamp: new Date().toISOString()
    };
  }
} 