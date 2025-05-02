import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Settings, Plus, Brain, 
  TrendingUp, Database, Workflow, AlertTriangle,
  Trash2, Copy, Link, Zap, Activity, Eye, X,
  Clock, Calendar
} from 'lucide-react';
import { useAI } from '../context/AIContext';
import { AutomationTask } from '../types';
import { AIService } from '../services/AIService';

interface ResourceMetrics {
  cpu: { usage: number; temperature: number; processes: number };
  memory: { used: number; total: number; swap: number };
  gpu: { usage: number; memory: number; temperature: number };
  network: { incoming: number; outgoing: number; latency: number };
  storage: { used: number; total: number; readSpeed: number; writeSpeed: number };
}

interface WorkflowConfiguration {
  resources: {
    cpu: number;
    memory: number;
    gpu: number;
    storage: number;
  };
  notifications: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
    customEndpoint: string;
  };
  execution: {
    maxConcurrent: number;
    queueSize: number;
    defaultTimeout: number;
    maxRetries: number;
  };
  monitoring: {
    metrics: boolean;
    logging: boolean;
    tracing: boolean;
    alerting: boolean;
  };
  security: {
    rbac: boolean;
    encryption: boolean;
    auditLogs: boolean;
  };
  advanced: {
    customEnvironment: Record<string, string>;
    tags: string[];
    labels: Record<string, string>;
    annotations: Record<string, string>;
  };
}

interface WorkflowState {
  trigger?: 'schedule' | 'event' | 'manual';
  resources: ResourceMetrics;
  configuration: Record<string, unknown>;
}

const defaultWorkflowConfig: WorkflowConfiguration = {
  resources: {
    cpu: 1,
    memory: 2,
    gpu: 0,
    storage: 5
  },
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
};

const defaultResourceMetrics: ResourceMetrics = {
  cpu: { usage: 0, temperature: 0, processes: 0 },
  memory: { used: 0, total: 0, swap: 0 },
  gpu: { usage: 0, memory: 0, temperature: 0 },
  network: { incoming: 0, outgoing: 0, latency: 0 },
  storage: { used: 0, total: 0, readSpeed: 0, writeSpeed: 0 }
};

const defaultNewTask: Omit<AutomationTask, 'id'> = {
  name: '',
  schedule: '',
  status: 'active',
  type: 'training',
  lastRun: new Date().toISOString(),
  nextRun: new Date().toISOString(),
  config: {
    retryAttempts: 3,
    timeout: 3600,
    notifyOnCompletion: true,
    dependencies: [],
    resources: {
      cpu: 1,
      memory: 2048,
      gpu: false
    }
  },
  logs: []
};

const Automation: React.FC = () => {
  const { tasks, createAutomation, updateAutomation, deleteAutomation, toggleAutomation } = useAI();
  const [newTask, setNewTask] = useState<Omit<AutomationTask, 'id'>>(defaultNewTask);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AutomationTask | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all');
  const [filterType, setFilterType] = useState<'all' | AutomationTask['type']>('all');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('config.resources.')) {
      const resourceKey = name.split('.')[2];
      setNewTask(prev => ({
        ...prev,
        config: {
          ...prev.config,
          resources: {
            ...prev.config.resources,
            [resourceKey]: resourceKey === 'gpu' ? value === 'true' : Number(value)
          }
        }
      }));
    } else if (name.startsWith('config.')) {
      const configKey = name.split('.')[1];
      setNewTask(prev => ({
        ...prev,
        config: {
          ...prev.config,
          [configKey]: configKey === 'notifyOnCompletion' ? value === 'true' : 
                      configKey === 'dependencies' ? value.split(',') : 
                      configKey === 'retryAttempts' || configKey === 'timeout' ? Number(value) : value
        }
      }));
    } else {
      setNewTask(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAutomation(newTask);
      setNewTask(defaultNewTask);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleAutomation(taskId);
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteAutomation(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterType !== 'all' && task.type !== filterType) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Automation Tasks</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          aria-label="Create new task"
          title="Create new task"
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'paused')}
          className="px-4 py-2 border rounded-lg"
          aria-label="Filter by status"
          title="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | AutomationTask['type'])}
          className="px-4 py-2 border rounded-lg"
          aria-label="Filter by type"
          title="Filter by type"
        >
          <option value="all">All Types</option>
          <option value="training">Training</option>
          <option value="analysis">Analysis</option>
          <option value="backup">Backup</option>
          <option value="deployment">Deployment</option>
          <option value="monitoring">Monitoring</option>
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newTask.name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                    aria-label="Task name"
                    title="Enter task name"
                    placeholder="Enter task name"
                  />
                </div>
                <div>
                  <label className="block mb-2">Type</label>
                  <select
                    name="type"
                    value={newTask.type}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                    aria-label="Task type"
                    title="Select task type"
                  >
                    <option value="training">Training</option>
                    <option value="analysis">Analysis</option>
                    <option value="backup">Backup</option>
                    <option value="deployment">Deployment</option>
                    <option value="monitoring">Monitoring</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Schedule (Cron)</label>
                  <input
                    type="text"
                    name="schedule"
                    value={newTask.schedule}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="0 0 * * *"
                    required
                    aria-label="Task schedule"
                    title="Enter task schedule in cron format"
                  />
                </div>
                <div>
                  <label className="block mb-2">Status</label>
                  <select
                    name="status"
                    value={newTask.status}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                    aria-label="Task status"
                    title="Select task status"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-bold mb-2">Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Retry Attempts</label>
                    <input
                      type="number"
                      name="config.retryAttempts"
                      value={newTask.config.retryAttempts}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      min="0"
                      aria-label="Retry attempts"
                      title="Enter number of retry attempts"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Timeout (seconds)</label>
                    <input
                      type="number"
                      name="config.timeout"
                      value={newTask.config.timeout}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      min="0"
                      aria-label="Timeout in seconds"
                      title="Enter timeout in seconds"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Notify on Completion</label>
                    <select
                      name="config.notifyOnCompletion"
                      value={newTask.config.notifyOnCompletion?.toString()}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      aria-label="Notify on completion"
                      title="Select whether to notify on task completion"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2">Dependencies (comma-separated)</label>
                    <input
                      type="text"
                      name="config.dependencies"
                      value={newTask.config.dependencies?.join(',')}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      aria-label="Task dependencies"
                      title="Enter task dependencies separated by commas"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-bold mb-2">Resources</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2">CPU (cores)</label>
                    <input
                      type="number"
                      name="config.resources.cpu"
                      value={newTask.config.resources?.cpu}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      min="1"
                      aria-label="CPU cores"
                      title="Enter number of CPU cores required"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Memory (MB)</label>
                    <input
                      type="number"
                      name="config.resources.memory"
                      value={newTask.config.resources?.memory}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      min="1024"
                      aria-label="Memory in MB"
                      title="Enter memory requirement in MB"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">GPU Required</label>
                    <select
                      name="config.resources.gpu"
                      value={newTask.config.resources?.gpu?.toString()}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      aria-label="GPU requirement"
                      title="Select whether GPU is required"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">{task.name}</h3>
                <p className="text-gray-500">{task.type}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  title={task.status === 'active' ? 'Pause Task' : 'Resume Task'}
                >
                  {task.status === 'active' ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  title="Delete Task"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-gray-500" />
                <span>Schedule: {task.schedule}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-gray-500" />
                <span>Status: {task.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-500" />
                <span>Last Run: {new Date(task.lastRun).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-500" />
                <span>Next Run: {new Date(task.nextRun).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="font-bold mb-2">Configuration</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Retry Attempts:</span>
                  <span className="ml-2">{task.config.retryAttempts}</span>
                </div>
                <div>
                  <span className="text-gray-500">Timeout:</span>
                  <span className="ml-2">{task.config.timeout}s</span>
                </div>
                <div>
                  <span className="text-gray-500">Notify:</span>
                  <span className="ml-2">{task.config.notifyOnCompletion ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Dependencies:</span>
                  <span className="ml-2">{task.config.dependencies?.join(', ') || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="font-bold mb-2">Resources</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">CPU:</span>
                  <span className="ml-2">{task.config.resources?.cpu} cores</span>
                </div>
                <div>
                  <span className="text-gray-500">Memory:</span>
                  <span className="ml-2">{task.config.resources?.memory}MB</span>
                </div>
                <div>
                  <span className="text-gray-500">GPU:</span>
                  <span className="ml-2">{task.config.resources?.gpu ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {task.logs.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-bold mb-2">Recent Logs</h4>
                <div className="space-y-2">
                  {task.logs.slice(-3).map((log, index) => (
                    <div key={index} className="text-sm">
                      <span className={`text-${log.level === 'error' ? 'red' : log.level === 'warning' ? 'yellow' : 'gray'}-500`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="ml-2">{log.message}</span>
                      <span className="text-gray-500 ml-2">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Automation;