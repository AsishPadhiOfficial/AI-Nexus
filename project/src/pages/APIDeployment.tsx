import React, { useState, useEffect } from 'react';
import { 
  Globe, Key, Code, Cloud, Database, Shield, Copy, ExternalLink,
  BarChart2, Activity, Clock, AlertTriangle, Terminal, Settings,
  RefreshCw, Play, Pause, ChevronDown, ChevronUp, Zap, Lock, X, Plus, Trash2
} from 'lucide-react';
import { useAI } from '../context/AIContext';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const performanceData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  requests: Math.floor(Math.random() * 1000),
  latency: 50 + Math.random() * 100,
  errors: Math.floor(Math.random() * 10),
}));

interface NewEndpoint {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  rateLimit: {
    requests: number;
    period: 'second' | 'minute' | 'hour'
  };
  authentication: boolean;
}

interface FormErrors {
  name?: string;
  path?: string;
  method?: string;
  rateLimit?: string;
}

interface ApiKey {
  key: string;
  name: string;
  created: string;
  lastUsed: string | null;
  status: 'active' | 'revoked';
}

type RateLimitPeriod = "second" | "minute" | "hour";

export default function APIDeployment() {
  const { endpoints, deployEndpoint, updateEndpoint, monitorEndpoint, revokeApiKey } = useAI();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [showNewEndpointModal, setShowNewEndpointModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [apiKey, setApiKey] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState<NewEndpoint>({
    name: '',
    path: '',
    method: 'GET',
    rateLimit: {
      requests: 100,
      period: 'minute'
    },
    authentication: true
  });
  const [endpointLogs, setEndpointLogs] = useState<{ [key: string]: any[] }>({});
  const [realTimeMetrics, setRealTimeMetrics] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedEndpointLogs, setSelectedEndpointLogs] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedEndpointSettings, setSelectedEndpointSettings] = useState<any>(null);
  const [showLogsViewer, setShowLogsViewer] = useState(false);
  const [currentViewingLogs, setCurrentViewingLogs] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification here
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      endpoints.forEach(endpoint => {
        monitorEndpoint(endpoint.id);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [endpoints, monitorEndpoint]);

  const totalRequests = endpoints.reduce((sum, endpoint) => sum + endpoint.performance.requests, 0);
  const averageLatency = endpoints.reduce((sum, endpoint) => sum + endpoint.performance.latency, 0) / endpoints.length;
  const errorRate = endpoints.reduce((sum, endpoint) => sum + endpoint.performance.errorRate, 0) / endpoints.length;

  const handleAddApiKey = () => {
    if (apiKey) {
      setApiKeys(prev => [...prev, {
        key: apiKey,
        name: `API Key ${apiKeys.length + 1}`,
        created: new Date().toISOString(),
        lastUsed: null,
        status: 'active'
      }]);
      setApiKey('');
    }
  };

  const handleManageAPIKeys = () => {
    // Logic to manage API keys
    console.log("Managing API Keys");
    // Example: Open a modal or navigate to a key management page
  };

  const handleDeployNewAPI = () => {
    // Logic to deploy a new API
    console.log("Deploying New API");
    // Example: Trigger an API deployment process
    // You might want to call a function from your context or API service
    deployEndpoint({ /* endpoint details */ })
        .then(() => {
            console.log("API deployed successfully");
        })
        .catch((error) => {
            console.error("Error deploying API:", error);
        });
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!newEndpoint.name.trim()) {
      errors.name = 'Endpoint name is required';
    }
    
    if (!newEndpoint.path.trim()) {
      errors.path = 'Path is required';
    } else if (!newEndpoint.path.startsWith('/')) {
      errors.path = 'Path must start with /';
    }
    
    if (!newEndpoint.method) {
      errors.method = 'Method is required';
    }
    
    if (newEndpoint.rateLimit.requests <= 0) {
      errors.rateLimit = 'Rate limit must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFormError = (field: keyof FormErrors) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleCreateEndpoint = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await deployEndpoint({
        ...newEndpoint,
        id: `endpoint-${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        performance: {
          latency: 0,
          uptime: 100,
          errorRate: 0
        }
      });
      setShowNewEndpointModal(false);
      setFormErrors({});
      setNotification({
        type: 'success',
        message: 'Endpoint created successfully'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create endpoint'
      });
    }
  };

  const generateApiKey = () => {
    const newKey = {
      key: `ak_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
      name: `API Key ${apiKeys.length + 1}`,
      created: new Date().toISOString(),
      lastUsed: null,
      status: 'active' as const
    };
    
    setApiKeys(prev => [...prev, newKey]);
    return newKey.key;
  };

  const handleStartPause = async (endpoint: any) => {
    try {
      setIsLoading({ ...isLoading, [endpoint.id]: true });
      const newStatus = endpoint.status === 'active' ? 'inactive' : 'active';
      await updateEndpoint(endpoint.id, {
        ...endpoint,
        status: newStatus
      });
      // Update real-time metrics
      setRealTimeMetrics(prev => ({
        ...prev,
        [endpoint.id]: {
          ...prev[endpoint.id],
          isRunning: newStatus === 'active'
        }
      }));
    } catch (error) {
      console.error('Error toggling endpoint status:', error);
    } finally {
      setIsLoading({ ...isLoading, [endpoint.id]: false });
    }
  };

  const handleSettingsClick = (endpoint: any) => {
    setSelectedEndpointSettings(endpoint);
    setShowSettingsModal(true);
  };

  const handleViewLogs = (endpoint: any) => {
    setSelectedEndpointLogs(endpoint.id);
    setShowLogsModal(true);
  };

  const handleStatusFilter = (status: 'all' | 'active' | 'inactive') => {
    setFilterStatus(status);
  };

  const handleViewAllLogs = () => {
    setShowLogsViewer(true);
  };

  const filteredEndpoints = endpoints.filter(endpoint => {
    if (filterStatus === 'all') return true;
    return endpoint.status === filterStatus;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      endpoints.forEach(endpoint => {
        if (endpoint.status === 'active') {
          setRealTimeMetrics(prev => ({
            ...prev,
            [endpoint.id]: {
              requests: Math.floor(Math.random() * 1000),
              latency: 50 + Math.random() * 100,
              errorRate: Math.random() * 5,
              uptime: 95 + Math.random() * 5
            }
          }));
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [endpoints]);

  // Add this function to generate sample logs
  const generateSampleLogs = (endpointId: string) => {
    const logTypes = ['info', 'warning', 'error'];
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const statusCodes = [200, 201, 400, 401, 403, 500];
    const messages = [
      'Request processed successfully',
      'Authentication failed',
      'Rate limit exceeded',
      'Invalid payload format',
      'Database operation completed',
      'Cache miss, fetching from source',
      'Background job scheduled',
      'Validation error occurred'
    ];

    return Array.from({ length: 10 }, (_, i) => ({
      id: `${endpointId}-${i}`,
      timestamp: new Date(Date.now() - i * 300000).toISOString(),
      type: logTypes[Math.floor(Math.random() * logTypes.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      details: {
        method: methods[Math.floor(Math.random() * methods.length)],
        path: '/api/v1/endpoint',
        statusCode: statusCodes[Math.floor(Math.random() * statusCodes.length)],
        latency: Math.floor(Math.random() * 200),
        requestId: `req_${Math.random().toString(36).substr(2, 9)}`
      }
    }));
  };

  // Add this effect to initialize logs for each endpoint
  useEffect(() => {
    const newLogs: { [key: string]: any[] } = {};
    endpoints.forEach(endpoint => {
      newLogs[endpoint.id] = generateSampleLogs(endpoint.id);
    });
    setEndpointLogs(newLogs);
  }, [endpoints]);

  const handleRevokeKey = async (key: ApiKey) => {
    try {
      await revokeApiKey(key.key);
      setNotification({
        type: 'success',
        message: 'API key revoked successfully'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to revoke API key'
      });
    }
  };

  return (
    <div className="p-8 space-y-8">
      {notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.message}
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-gray-500 hover:text-gray-700"
            aria-label="Dismiss notification"
            title="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API & Deployment</h1>
          <p className="text-gray-500 mt-1">Manage and monitor your API endpoints</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            aria-label="Manage API keys"
            title="Manage API keys"
          >
            <Key size={20} />
            Manage API Keys
          </button>
          <button
            onClick={() => setShowNewEndpointModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            aria-label="Deploy new API"
            title="Deploy new API"
          >
            <Cloud size={20} />
            Deploy New API
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Globe className="text-indigo-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600">Total Requests</p>
              <h3 className="text-2xl font-bold">{totalRequests.toLocaleString()}</h3>
              <p className="text-sm text-green-600">↑ 12% from last week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600">Avg Response Time</p>
              <h3 className="text-2xl font-bold">{averageLatency.toFixed(0)}ms</h3>
              <p className="text-sm text-green-600">↓ 5% improvement</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600">Error Rate</p>
              <h3 className="text-2xl font-bold">{errorRate.toFixed(2)}%</h3>
              <p className="text-sm text-yellow-600">Within threshold</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Cloud className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600">Active Endpoints</p>
              <h3 className="text-2xl font-bold">
                {endpoints.filter(e => e.status === 'active').length}
              </h3>
              <p className="text-sm text-purple-600">All healthy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Request Volume</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="time-range" className="sr-only">Select time range</label>
              <select
                id="time-range"
                className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                aria-label="Select time range"
                title="Select time range"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button
                onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                aria-label={showAdvancedMetrics ? 'Show basic metrics' : 'Show advanced metrics'}
                title={showAdvancedMetrics ? 'Show basic metrics' : 'Show advanced metrics'}
              >
                <Settings size={20} />
                <span>{showAdvancedMetrics ? 'Basic Metrics' : 'Advanced Metrics'}</span>
              </button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Response Time</h2>
            <button
              onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Settings size={20} />
              {showAdvancedMetrics ? 'Basic Metrics' : 'Advanced Metrics'}
            </button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#10B981"
                  strokeWidth={2}
                />
                {showAdvancedMetrics && (
                  <Line
                    type="monotone"
                    dataKey="errors"
                    stroke="#EF4444"
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">API Endpoints</h2>
            <div className="flex items-center gap-4">
              <label htmlFor="endpoint-filter" className="sr-only">Filter endpoints by status</label>
              <select
                id="endpoint-filter"
                value={filterStatus}
                onChange={(e) => handleStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                aria-label="Filter endpoints by status"
                title="Filter endpoints by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button 
                onClick={handleViewAllLogs}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                aria-label="View all logs"
                title="View all logs"
              >
                <Terminal size={20} />
                <span>View Logs</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {endpoints
              .filter(endpoint => {
                if (filterStatus === 'all') return true;
                return filterStatus === endpoint.status;
              })
              .map((endpoint) => (
                <div key={endpoint.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Globe className="text-indigo-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{endpoint.name}</h3>
                        <p className="text-sm text-gray-500">{endpoint.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          endpoint.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {endpoint.status}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartPause(endpoint)}
                          disabled={isLoading[endpoint.id]}
                          className={`p-1 ${
                            endpoint.status === 'active' 
                              ? 'text-yellow-600 hover:text-yellow-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={endpoint.status === 'active' ? 'Pause endpoint' : 'Start endpoint'}
                          aria-label={endpoint.status === 'active' ? 'Pause endpoint' : 'Start endpoint'}
                        >
                          {isLoading[endpoint.id] ? (
                            <RefreshCw className="animate-spin" size={20} />
                          ) : endpoint.status === 'active' ? (
                            <Pause size={20} />
                          ) : (
                            <Play size={20} />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleSettingsClick(endpoint)}
                          className="p-1 text-indigo-600 hover:text-indigo-900"
                          title="Endpoint settings"
                          aria-label="Endpoint settings"
                        >
                          <Settings size={20} />
                        </button>
                        
                        <button
                          onClick={() => copyToClipboard(endpoint.url)}
                          className="p-1 text-blue-600 hover:text-blue-900"
                          title="Copy endpoint URL"
                          aria-label="Copy endpoint URL"
                        >
                          <Copy size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedEndpoint === endpoint.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Success Rate</span>
                                <span>
                                  {(100 - (realTimeMetrics[endpoint.id]?.errorRate || 0)).toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-full bg-green-600 rounded-full"
                                  style={{ 
                                    width: `${100 - (realTimeMetrics[endpoint.id]?.errorRate || 0)}%` 
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Latency</span>
                                <span>{endpoint.performance.latency}ms</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-full bg-indigo-600 rounded-full"
                                  style={{ width: `${(endpoint.performance.latency / 500) * 100}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Uptime</span>
                                <span>{endpoint.monitoring.uptime}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-full bg-purple-600 rounded-full"
                                  style={{ width: `${endpoint.monitoring.uptime}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Recent Logs</h4>
                            <span className="text-sm text-gray-500">Last 24 hours</span>
                          </div>
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {endpointLogs[endpoint.id]?.map((log) => (
                              <div
                                key={log.id}
                                className={`p-3 rounded-lg text-sm ${
                                  log.type === 'error' ? 'bg-red-50 border border-red-100' :
                                  log.type === 'warning' ? 'bg-yellow-50 border border-yellow-100' :
                                  'bg-gray-50 border border-gray-100'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    log.type === 'error' ? 'bg-red-100 text-red-800' :
                                    log.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {log.type.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-gray-900 mb-1">{log.message}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>
                                    {log.details.method} {log.details.path}
                                  </span>
                                  <span>
                                    Status: {log.details.statusCode} ({log.details.latency}ms)
                                  </span>
                                </div>
                                <div className="mt-1 text-xs text-gray-400">
                                  Request ID: {log.details.requestId}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Documentation and Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Quick Start Guide</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Authentication</h3>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
                <code>
                  {`curl -X POST https://api.ainexus.com/v1/predict \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"data": "your_input_here"}'`}
                </code>
              </pre>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Response Format</h3>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
                <code>
                  {`{
  "prediction": "result",
  "confidence": 0.95,
  "timestamp": "2024-03-21T10:30:00Z"
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Deployment Options</h2>
          <div className="space-y-4">
            {[
              {
                name: 'Production Environment',
                description: 'Deploy to production servers with high availability',
                icon: Cloud,
              },
              {
                name: 'Staging Environment',
                description: 'Test your API in a pre-production environment',
                icon: Code,
              },
              {
                name: 'Custom Domain',
                description: 'Use your own domain for API endpoints',
                icon: Globe,
              },
              {
                name: 'Auto-Scaling',
                description: 'Automatically scale based on demand',
                icon: Zap,
              },
            ].map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <option.icon className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{option.name}</h3>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
                <ExternalLink className="text-gray-400" size={20} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">API Keys</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900">Production API Key</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(apiKey)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label="Copy API key"
                      title="Copy API key"
                    >
                      <Copy size={20} className="text-gray-500" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label="Refresh API key"
                      title="Refresh API key"
                    >
                      <RefreshCw size={20} className="text-gray-500" />
                    </button>
                  </div>
                </div>
                <code className="text-sm text-gray-800 break-all">{apiKey}</code>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">Key Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="permissions" className="block text-sm font-medium text-gray-700">Permissions</label>
                    <select 
                      id="permissions"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      aria-label="Select API key permissions"
                      title="Select API key permissions"
                    >
                      <option value="read">Read Only</option>
                      <option value="write">Read & Write</option>
                      <option value="admin">Full Access</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="expiration" className="block text-sm font-medium text-gray-700">Expiration</label>
                    <select 
                      id="expiration"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      aria-label="Select API key expiration"
                      title="Select API key expiration"
                    >
                      <option value="never">Never</option>
                      <option value="30d">30 Days</option>
                      <option value="90d">90 Days</option>
                      <option value="1y">1 Year</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const newKey = generateApiKey();
                  setApiKey(newKey);
                  setShowApiKeyModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Generate New Key
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewEndpointModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Create New API Endpoint</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endpoint Name
                </label>
                <input
                  type="text"
                  value={newEndpoint.name}
                  onChange={(e) => {
                    setNewEndpoint(prev => ({ ...prev, name: e.target.value }));
                    clearFormError('name');
                  }}
                  className={`w-full rounded-lg border-gray-300 ${
                    formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  aria-label="Endpoint name"
                  title="Endpoint name"
                  placeholder="Enter endpoint name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Path
                </label>
                <input
                  type="text"
                  value={newEndpoint.path}
                  onChange={(e) => {
                    setNewEndpoint(prev => ({ ...prev, path: e.target.value }));
                    clearFormError('path');
                  }}
                  className={`w-full rounded-lg border-gray-300 ${
                    formErrors.path ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  aria-label="Endpoint path"
                  title="Endpoint path"
                  placeholder="/api/v1/predictions"
                />
                {formErrors.path && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.path}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Method
                  </label>
                  <select
                    value={newEndpoint.method}
                    onChange={(e) => {
                      setNewEndpoint(prev => ({ 
                        ...prev, 
                        method: e.target.value as NewEndpoint['method']
                      }));
                      clearFormError('method');
                    }}
                    className={`w-full rounded-lg border-gray-300 ${
                      formErrors.method ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    aria-label="Select HTTP method"
                    title="Select HTTP method"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  {formErrors.method && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.method}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="rateLimitRequests" className="block text-sm font-medium text-gray-700 mb-1">
                    Rate Limit (requests)
                  </label>
                  <input
                    type="number"
                    id="rateLimitRequests"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={newEndpoint.rateLimit.requests}
                    onChange={(e) => setNewEndpoint({
                      ...newEndpoint,
                      rateLimit: { ...newEndpoint.rateLimit, requests: parseInt(e.target.value) }
                    })}
                    placeholder="Enter rate limit requests"
                    aria-label="Rate limit requests"
                    title="Rate limit requests"
                  />
                </div>

                <div>
                  <label htmlFor="rateLimitPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                    Rate Limit Period
                  </label>
                  <select
                    id="rateLimitPeriod"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={newEndpoint.rateLimit.period}
                    onChange={(e) => setNewEndpoint({
                      ...newEndpoint,
                      rateLimit: { ...newEndpoint.rateLimit, period: e.target.value }
                    })}
                    aria-label="Select rate limit period"
                    title="Select rate limit period"
                  >
                    <option value="second">Per Second</option>
                    <option value="minute">Per Minute</option>
                    <option value="hour">Per Hour</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authentication
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={newEndpoint.authentication}
                      onChange={(e) => setNewEndpoint(prev => ({
                        ...prev,
                        authentication: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">Required</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowNewEndpointModal(false);
                  setFormErrors({});
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
                aria-label="Cancel endpoint creation"
                title="Cancel endpoint creation"
              >
                <span className="sr-only">Cancel endpoint creation</span>
                Cancel
              </button>
              <button
                onClick={handleCreateEndpoint}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                aria-label="Create new endpoint"
                title="Create new endpoint"
              >
                <span className="sr-only">Create new endpoint</span>
                Create Endpoint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">API Keys</h3>
          <button
            onClick={() => {
              const newKey = generateApiKey();
              setApiKey(newKey);
              setShowApiKeyModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Key size={20} />
            Generate New Key
          </button>
        </div>

        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div key={key.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{key.name}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(key.created).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  key.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {key.status}
                </span>
                <button
                  onClick={() => handleRevokeKey(key)}
                  className="text-red-600 hover:text-red-800"
                  aria-label={`Revoke API key ${key.name}`}
                  title={`Revoke API key ${key.name}`}
                >
                  <span className="sr-only">Revoke API key {key.name}</span>
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && selectedEndpointSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Endpoint Settings</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="rateLimitRequests" className="block text-sm font-medium text-gray-700">Rate Limit</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    id="rateLimitRequests"
                    type="number"
                    value={selectedEndpointSettings.rateLimit.requests}
                    onChange={(e) => setSelectedEndpointSettings({
                      ...selectedEndpointSettings,
                      rateLimit: {
                        ...selectedEndpointSettings.rateLimit,
                        requests: parseInt(e.target.value)
                      }
                    })}
                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    aria-label="Rate limit requests"
                    title="Rate limit requests"
                    placeholder="Enter requests"
                  />
                  <span className="text-gray-600">requests per</span>
                  <select
                    id="rateLimitPeriod"
                    value={selectedEndpointSettings.rateLimit.period}
                    onChange={(e) => {
                      const period = e.target.value as RateLimitPeriod;
                      if (period === "second" || period === "minute" || period === "hour") {
                        setSelectedEndpointSettings({
                          ...selectedEndpointSettings,
                          rateLimit: {
                            ...selectedEndpointSettings.rateLimit,
                            period
                          }
                        });
                      }
                    }}
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    aria-label="Select rate limit period"
                    title="Select rate limit period"
                  >
                    <option value="second">Second</option>
                    <option value="minute">Minute</option>
                    <option value="hour">Hour</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="authType" className="block text-sm font-medium text-gray-700">Authentication</label>
                <select
                  id="authType"
                  value={selectedEndpointSettings.authentication.type}
                  onChange={(e) => setSelectedEndpointSettings({
                    ...selectedEndpointSettings,
                    authentication: {
                      ...selectedEndpointSettings.authentication,
                      type: e.target.value
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  aria-label="Select authentication type"
                  title="Select authentication type"
                >
                  <option value="none">None</option>
                  <option value="apiKey">API Key</option>
                  <option value="jwt">JWT</option>
                  <option value="oauth">OAuth</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await updateEndpoint(selectedEndpointSettings.id, selectedEndpointSettings);
                  setShowSettingsModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Viewer Modal */}
      {showLogsViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">System Logs</h2>
              <button
                onClick={() => setShowLogsViewer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <label htmlFor="endpoint-logs" className="sr-only">Select endpoint to view logs</label>
              <select
                id="endpoint-logs"
                className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                onChange={(e) => setCurrentViewingLogs(e.target.value)}
                value={currentViewingLogs || ''}
                aria-label="Select endpoint to view logs"
                title="Select endpoint to view logs"
              >
                <option value="">All Endpoints</option>
                {endpoints.map(endpoint => (
                  <option key={endpoint.id} value={endpoint.id}>
                    {endpoint.name}
                  </option>
                ))}
              </select>

              <label htmlFor="log-level" className="sr-only">Filter logs by level</label>
              <select
                id="log-level"
                className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                defaultValue="all"
                aria-label="Filter logs by level"
                title="Filter logs by level"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>

              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                onClick={() => {
                  // Refresh logs
                  const newLogs = currentViewingLogs 
                    ? generateSampleLogs(currentViewingLogs)
                    : endpoints.flatMap(e => generateSampleLogs(e.id));
                  setEndpointLogs(prev => ({
                    ...prev,
                    [currentViewingLogs || 'all']: newLogs
                  }));
                }}
                aria-label="Refresh logs"
                title="Refresh logs"
              >
                <RefreshCw size={20} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-200px)]">
              <div className="space-y-3">
                {(currentViewingLogs 
                  ? endpointLogs[currentViewingLogs] 
                  : Object.values(endpointLogs).flat()
                )?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                 .map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg ${
                      log.type === 'error' ? 'bg-red-50' :
                      log.type === 'warning' ? 'bg-yellow-50' :
                      'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          log.type === 'error' ? 'bg-red-100 text-red-800' :
                          log.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {log.type.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {endpoints.find(e => log.id.startsWith(e.id))?.name}
                      </span>
                    </div>
                    <p className="text-gray-900">{log.message}</p>
                    <div className="mt-2 text-sm text-gray-600 flex justify-between">
                      <span>
                        {log.details.method} {log.details.path}
                      </span>
                      <span>
                        Status: {log.details.statusCode} ({log.details.latency}ms)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}