import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RefreshCw, Square, Settings, Plus, Calendar, Bell, Brain, 
  TrendingUp, Database, Workflow, Cpu, Clock, AlertTriangle, BarChart,
  ChevronDown, ChevronUp, Trash2, Edit, Copy, Link, Zap, Activity, Eye, X
} from 'lucide-react';
import { useAI } from '../context/AIContext';
import { AutomationTask } from '../types';

interface NewWorkflowTask {
  name: string;
  type: string;
  trigger: string;
  schedule?: string;
  actions: string[];
}

interface WorkflowMetrics {
  successRate: number;
  totalRuns: number;
  averageDuration: number;
}

interface WorkflowType {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused';
  metrics: WorkflowMetrics;
  nextRun?: string;
}

export default function Automation() {
  const { 
    tasks, 
    createAutomation, 
    updateAutomation, 
    toggleAutomation, 
    deleteAutomation,
    resourceMetrics,
    workflows,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
    models
  } = useAI();

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'error'>('all');
  const [filterType, setFilterType] = useState<'all' | AutomationTask['type']>('all');

  const [newTask, setNewTask] = useState<Partial<AutomationTask>>({
    name: '',
    type: 'training',
    schedule: '0 0 * * *',
    config: {
      retryAttempts: 3,
      timeout: 3600,
      notifyOnCompletion: true,
      resources: {
        cpu: 2,
        memory: 4,
        gpu: false
      }
    }
  });

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    type: 'training',
    trigger: 'schedule',
    schedule: '0 0 * * *',
    actions: [] as string[],
    enabled: true,
    priority: 'medium',
    timeout: 3600,
    retries: 3
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedTaskSettings, setSelectedTaskSettings] = useState<string | null>(null);
  const [taskSettings, setTaskSettings] = useState({
    notifications: {
      email: true,
      slack: false,
      webhook: false
    },
    retryPolicy: {
      maxAttempts: 3,
      backoffMultiplier: 1.5
    },
    resources: {
      cpu: 1,
      memory: 2,
      timeout: 3600
    },
    logging: {
      level: 'info',
      retention: '7d'
    }
  });

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const [executionHistory, setExecutionHistory] = useState<Array<{
    id: string;
    workflowId: string;
    status: 'success' | 'failed' | 'running' | 'pending';
    startTime: string;
    endTime?: string;
    duration: number;
    error?: string;
  }>>([]);

  const [workflowSettings, setWorkflowSettings] = useState({
    notifications: {
      email: true,
      slack: false,
      webhook: false,
      customEndpoint: ''
    },
    execution: {
      maxConcurrent: 5,
      queueSize: 100,
      defaultTimeout: 3600,
      maxRetries: 3
    },
    resources: {
      cpu: 1,
      memory: 2,
      gpu: 0,
      storage: 5
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: false,
      alerting: true
    },
    security: {
      rbac: true,
      encryption: true,
      auditLogs: true
    },
    advanced: {
      customEnvironment: {},
      tags: [],
      labels: {},
      annotations: {}
    }
  });

  const [selectedWorkflowDetails, setSelectedWorkflowDetails] = useState<string | null>(null);
  const [workflowHistory, setWorkflowHistory] = useState<any[]>([
    {
      id: 1,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      duration: '1h 45m',
      metrics: { accuracy: 0.95, processed: 1250 }
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      status: 'failed',
      duration: '32m',
      error: 'Memory limit exceeded'
    },
    // Add more history items as needed
  ]);

  // Add delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);

  // Local state
  const [localWorkflows, setLocalWorkflows] = useState<WorkflowType[]>([
    {
      id: '1',
      name: 'Daily Model Training',
      type: 'training',
      status: 'active',
      metrics: {
        successRate: 95,
        totalRuns: 120,
        averageDuration: 3600
      },
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'Data Preprocessing',
      type: 'preprocessing',
      status: 'active',
      metrics: {
        successRate: 98,
        totalRuns: 450,
        averageDuration: 1800
      },
      nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    }
  ]);

  // Sync with context workflows
  useEffect(() => {
    if (workflows && workflows.length > 0) {
      setLocalWorkflows(workflows);
    }
  }, [workflows]);

  const handleCreateTask = () => {
    if (!newTask.name) return;

    createAutomation({
      ...newTask as Omit<AutomationTask, 'id'>,
      status: 'active',
      lastRun: new Date().toISOString(),
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      logs: []
    });
    setShowNewTaskModal(false);
    setNewTask({
      name: '',
      type: 'training',
      schedule: '0 0 * * *',
      config: {
        retryAttempts: 3,
        timeout: 3600,
        notifyOnCompletion: true,
        resources: {
          cpu: 2,
          memory: 4,
          gpu: false
        }
      }
    });
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name) {
      alert('Workflow name is required');
      return;
    }

    const workflow = await addWorkflow(newWorkflow);
    setShowWorkflowModal(false);
    resetNewWorkflow();
  };

  const calculateNextRun = (schedule: string): string => {
    // Simple cron-like schedule parser
    const now = new Date();
    // Add 24 hours for daily schedules
    return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  };

  const resetNewWorkflow = () => {
    setNewWorkflow({
      name: '',
      type: 'training',
      trigger: 'schedule',
      schedule: '0 0 * * *',
      actions: [],
      enabled: true,
      priority: 'medium',
      timeout: 3600,
      retries: 3
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterType !== 'all' && task.type !== filterType) return false;
    return true;
  });

  const taskTypeInfo = {
    training: {
      icon: Brain,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    analysis: {
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    backup: {
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    deployment: {
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    monitoring: {
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  };

  // Workflow actions
  const toggleWorkflow = (id: string) => {
    setLocalWorkflows(prevWorkflows =>
      prevWorkflows.map(workflow =>
        workflow.id === id
          ? { ...workflow, status: workflow.status === 'active' ? 'paused' : 'active' }
          : workflow
      )
    );
  };

  const handleDeleteWorkflow = (id: string) => {
    setLocalWorkflows(prevWorkflows => prevWorkflows.filter(workflow => workflow.id !== id));
    deleteWorkflow(id);
    setShowDeleteModal(false);
    setWorkflowToDelete(null);
    if (selectedWorkflowDetails === id) {
      setSelectedWorkflowDetails(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Automation</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor your automated workflows
          </p>
        </div>
        <button
          onClick={() => setShowWorkflowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} />
          Create Workflow
        </button>
      </div>

      {localWorkflows.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="flex justify-center mb-4">
            <Workflow className="text-indigo-600 w-16 h-16" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Automations Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first automation workflow to streamline your AI operations and improve productivity
          </p>
          <button
            onClick={() => setShowWorkflowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            Create First Workflow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localWorkflows.map((workflow) => (
            <div key={workflow.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{workflow.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      workflow.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.status}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">{workflow.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleWorkflow(workflow.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      workflow.status === 'active' 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={workflow.status === 'active' ? 'Pause Workflow' : 'Start Workflow'}
                  >
                    {workflow.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={() => setSelectedWorkflowDetails(workflow.id)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWorkflow(workflow.id);
                      setShowSettingsModal(true);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Settings"
                  >
                    <Settings size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setWorkflowToDelete(workflow.id);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Workflow"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${workflow.metrics.successRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {workflow.metrics.successRate}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Runs</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {workflow.metrics.totalRuns}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg. Duration</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {Math.floor(workflow.metrics.averageDuration / 60)}m {workflow.metrics.averageDuration % 60}s
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Next Run</span>
                    <span className="text-gray-900">
                      {workflow.nextRun ? new Date(workflow.nextRun).toLocaleString() : 'Not scheduled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workflow Details Modal */}
      {selectedWorkflowDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold">Workflow Details</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setWorkflowToDelete(selectedWorkflowDetails);
                    setShowDeleteModal(true);
                  }}
                  className="text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 size={18} />
                    Delete Workflow
                  </div>
                </button>
                <button
                  onClick={() => setSelectedWorkflowDetails(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Workflow Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-sm text-gray-600">Status</span>
                  <div className="mt-1 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      localWorkflows.find(w => w.id === selectedWorkflowDetails)?.status === 'active'
                        ? 'bg-green-500'
                        : 'bg-gray-500'
                    }`} />
                    <span className="font-medium capitalize">
                      {localWorkflows.find(w => w.id === selectedWorkflowDetails)?.status}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-sm text-gray-600">Type</span>
                  <p className="mt-1 font-medium capitalize">
                    {localWorkflows.find(w => w.id === selectedWorkflowDetails)?.type}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-sm text-gray-600">Created</span>
                  <p className="mt-1 font-medium">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Execution History */}
              <div>
                <h3 className="text-lg font-medium mb-4">Execution History</h3>
                <div className="space-y-4">
                  {workflowHistory.map((history) => (
                    <div key={history.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            history.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className={`font-medium ${
                            history.status === 'success' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {history.status}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(history.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Duration</span>
                          <p className="font-medium">{history.duration}</p>
                        </div>
                        {history.metrics && (
                          <div>
                            <span className="text-gray-600">Metrics</span>
                            <p className="font-medium">
                              Accuracy: {history.metrics.accuracy * 100}% | 
                              Processed: {history.metrics.processed}
                            </p>
                          </div>
                        )}
                        {history.error && (
                          <div className="col-span-2">
                            <span className="text-gray-600">Error</span>
                            <p className="font-medium text-red-600">{history.error}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration */}
              <div>
                <h3 className="text-lg font-medium mb-4">Configuration</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-800">
                    {JSON.stringify(localWorkflows.find(w => w.id === selectedWorkflowDetails)?.configuration || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal with Enhanced Options */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">Workflow Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notifications Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notifications</h3>
                <div className="space-y-2">
                  {Object.entries(workflowSettings.notifications).map(([key, value]) => (
                    key !== 'customEndpoint' && (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setWorkflowSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              [key]: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300"
                        />
                        <span className="capitalize">{key} notifications</span>
                      </label>
                    )
                  ))}
                </div>
              </div>

              {/* Resource Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Resources</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(workflowSettings.resources).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm text-gray-600 mb-1 capitalize">
                        {key} {key === 'memory' || key === 'storage' ? '(GB)' : ''}
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setWorkflowSettings(prev => ({
                          ...prev,
                          resources: {
                            ...prev.resources,
                            [key]: parseInt(e.target.value)
                          }
                        }))}
                        className="w-full rounded-lg border-gray-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Monitoring & Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Monitoring & Security</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {Object.entries(workflowSettings.monitoring).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setWorkflowSettings(prev => ({
                            ...prev,
                            monitoring: {
                              ...prev.monitoring,
                              [key]: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300"
                        />
                        <span className="capitalize">{key}</span>
                      </label>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {Object.entries(workflowSettings.security).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setWorkflowSettings(prev => ({
                            ...prev,
                            security: {
                              ...prev.security,
                              [key]: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300"
                        />
                        <span className="capitalize">{key}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Execution Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Execution Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(workflowSettings.execution).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm text-gray-600 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setWorkflowSettings(prev => ({
                          ...prev,
                          execution: {
                            ...prev.execution,
                            [key]: parseInt(e.target.value)
                          }
                        }))}
                        className="w-full rounded-lg border-gray-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save settings logic
                  setShowSettingsModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Create New Automation</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Enter task name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                <select
                  value={newTask.type}
                  onChange={(e) => setNewTask({ ...newTask, type: e.target.value as AutomationTask['type'] })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="training">Model Training</option>
                  <option value="analysis">Performance Analysis</option>
                  <option value="backup">Data Backup</option>
                  <option value="deployment">Model Deployment</option>
                  <option value="monitoring">System Monitoring</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Cron)</label>
                <input
                  type="text"
                  value={newTask.schedule}
                  onChange={(e) => setNewTask({ ...newTask, schedule: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="0 0 * * *"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Retry Attempts</label>
                  <input
                    type="number"
                    value={newTask.config?.retryAttempts}
                    onChange={(e) => setNewTask({
                      ...newTask,
                      config: { ...newTask.config, retryAttempts: parseInt(e.target.value) }
                    })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (seconds)</label>
                  <input
                    type="number"
                    value={newTask.config?.timeout}
                    onChange={(e) => setNewTask({
                      ...newTask,
                      config: { ...newTask.config, timeout: parseInt(e.target.value) }
                    })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resource Requirements</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500">CPU Cores</label>
                    <input
                      type="number"
                      value={newTask.config?.resources?.cpu}
                      onChange={(e) => setNewTask({
                        ...newTask,
                        config: {
                          ...newTask.config,
                          resources: {
                            ...newTask.config?.resources,
                            cpu: parseInt(e.target.value)
                          }
                        }
                      })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Memory (GB)</label>
                    <input
                      type="number"
                      value={newTask.config?.resources?.memory}
                      onChange={(e) => setNewTask({
                        ...newTask,
                        config: {
                          ...newTask.config,
                          resources: {
                            ...newTask.config?.resources,
                            memory: parseInt(e.target.value)
                          }
                        }
                      })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="gpu-required"
                      checked={newTask.config?.resources?.gpu}
                      onChange={(e) => setNewTask({
                        ...newTask,
                        config: {
                          ...newTask.config,
                          resources: {
                            ...newTask.config?.resources,
                            gpu: e.target.checked
                          }
                        }
                      })}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <label htmlFor="gpu-required" className="ml-2 block text-sm text-gray-900">
                      GPU Required
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Modal */}
      {showWorkflowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Create New Workflow</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border-gray-300"
                  placeholder="Daily Model Training"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trigger Type
                </label>
                <select
                  value={newWorkflow.trigger}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, trigger: e.target.value }))}
                  className="w-full rounded-lg border-gray-300"
                >
                  <option value="schedule">Schedule</option>
                  <option value="event">Event Based</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              {newWorkflow.trigger === 'schedule' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule (Cron Expression)
                  </label>
                  <input
                    type="text"
                    value={newWorkflow.schedule}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, schedule: e.target.value }))}
                    className="w-full rounded-lg border-gray-300"
                    placeholder="0 0 * * *"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Workflow</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this workflow? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setWorkflowToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => workflowToDelete && handleDeleteWorkflow(workflowToDelete)}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}