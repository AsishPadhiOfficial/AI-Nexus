import React, { Component } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Plus, Search, Filter, MoreVertical, Edit, Trash2, Play,
  Pause, RefreshCw, Download, Upload, GitBranch, Check,
  AlertTriangle, Clock, Settings, ChevronDown, X, Brain,
  BarChart2, Database
} from 'lucide-react';
import { AIModel } from '../types';
import { useAI } from '../context/AIContext';
import { modelStatusMap, generateAutomationFromModel, generateDeploymentFromModel, calculateModelMetrics } from '../utils/connections';

const performanceData = [
  { timestamp: '2024-03-01', accuracy: 85, loss: 0.15 },
  { timestamp: '2024-03-02', accuracy: 87, loss: 0.13 },
  { timestamp: '2024-03-03', accuracy: 89, loss: 0.11 },
  { timestamp: '2024-03-04', accuracy: 90, loss: 0.10 },
  { timestamp: '2024-03-05', accuracy: 92, loss: 0.09 },
];

interface ModelMetrics {
  timestamp: string;
  accuracy: number;
  latency: number;
}

interface Model {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'active' | 'inactive' | 'training' | 'error' | 'trained';
  accuracy: number;
  lastUpdated: string;
  deployments: number;
  description: string;
  framework: string;
  inputShape: string;
  outputShape: string;
  performance: ModelMetrics[];
}

interface ModelSettings {
  batchSize: number;
  learningRate: number;
  optimizer: string;
}

type ModelStatus = 'active' | 'inactive' | 'training' | 'error' | 'trained';

interface State {
  models: Model[];
  selectedModel: Model | null;
  showDetails: boolean;
  isDeploying: boolean;
  searchQuery: string;
  showFilters: boolean;
  showNewModelModal: boolean;
  showSettingsModal: boolean;
  showDeleteModal: boolean;
  modelToDelete: string | null;
  trainingStatus: { [key: string]: number };
}

class ModelManagement extends Component<{}, State> {
  private trainingIntervals: { [key: string]: NodeJS.Timeout } = {};

  constructor(props: {}) {
    super(props);
    this.state = {
      models: [],
      selectedModel: null,
      showDetails: false,
      isDeploying: false,
      searchQuery: '',
      showFilters: false,
      showNewModelModal: false,
      showSettingsModal: false,
      showDeleteModal: false,
      modelToDelete: null,
      trainingStatus: {}
    };
  }

  componentDidMount() {
    const sampleData: Model[] = Array.from({ length: 6 }, (_, i) => ({
      id: `model-${i + 1}`,
      name: `Model ${i + 1}`,
      type: ['Classification', 'Regression', 'NLP', 'Computer Vision'][Math.floor(Math.random() * 4)],
      version: `v${1 + Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
      status: ['active', 'inactive', 'training', 'trained', 'error'][Math.floor(Math.random() * 5)] as ModelStatus,
      accuracy: 70 + Math.random() * 25,
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      deployments: Math.floor(Math.random() * 50),
      performance: Array.from({ length: 24 }, (_, j) => ({
        timestamp: `${j}:00`,
        accuracy: 75 + Math.random() * 20,
        latency: 20 + Math.random() * 50
      }))
    }));

    this.setState({ models: sampleData });
  }

  componentWillUnmount() {
    // Clear all training intervals
    Object.values(this.trainingIntervals).forEach(interval => clearInterval(interval));
  }

  handleDeploy = async (model: Model) => {
    this.setState({ isDeploying: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const updatedModels = this.state.models.map(m => 
        m.id === model.id 
          ? { ...m, status: 'active' as ModelStatus, deployments: m.deployments + 1 }
          : m
      );
      this.setState({ models: updatedModels });
    } finally {
      this.setState({ isDeploying: false });
    }
  };

  getStatusColor = (status: ModelStatus) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      inactive: 'text-gray-600 bg-gray-100',
      training: 'text-blue-600 bg-blue-100',
      error: 'text-red-600 bg-red-100',
      trained: 'text-purple-600 bg-purple-100'
    };
    return colors[status] || colors.inactive;
  };

  handleDelete = async (modelId: string) => {
    this.setState({ showDeleteModal: true, modelToDelete: modelId });
  };

  confirmDelete = () => {
    const { modelToDelete } = this.state;
    if (modelToDelete) {
      const updatedModels = this.state.models.filter(m => m.id !== modelToDelete);
      this.setState({ 
        models: updatedModels, 
        showDeleteModal: false, 
        modelToDelete: null 
      });
    }
  };

  handleSettingsSave = (modelId: string, settings: any) => {
    const updatedModels = this.state.models.map(model => {
      if (model.id === modelId) {
        return {
          ...model,
          settings: settings,
          lastUpdated: new Date().toISOString()
        };
      }
      return model;
    });
    this.setState({ 
      models: updatedModels,
      showSettingsModal: false
    });
  };

  startTraining = (modelId: string) => {
    // Clear existing interval if any
    if (this.trainingIntervals[modelId]) {
      clearInterval(this.trainingIntervals[modelId]);
    }

    // Set initial training status
    this.setState(prevState => ({
      trainingStatus: {
        ...prevState.trainingStatus,
        [modelId]: 0
      }
    }));

    // Update model status to training
    const updatedModels = this.state.models.map(model => 
      model.id === modelId ? { ...model, status: 'training' as ModelStatus } : model
    );
    this.setState({ models: updatedModels });

    // Create training progress interval
    this.trainingIntervals[modelId] = setInterval(() => {
      this.setState(prevState => {
        const currentProgress = prevState.trainingStatus[modelId] || 0;
        if (currentProgress >= 100) {
          clearInterval(this.trainingIntervals[modelId]);
          // Update model status to trained
          const trainedModels = prevState.models.map(model => 
            model.id === modelId ? { ...model, status: 'trained' as ModelStatus } : model
          );
          return {
            models: trainedModels,
            trainingStatus: {
              ...prevState.trainingStatus,
              [modelId]: 100
            }
          };
        }
        return {
          trainingStatus: {
            ...prevState.trainingStatus,
            [modelId]: currentProgress + 1
          }
        };
      });
    }, 100);
  };

  handleNewModel = () => {
    const newModel: Model = {
      id: `model-${this.state.models.length + 1}`,
      name: `New Model ${this.state.models.length + 1}`,
      type: 'Classification',
      version: 'v1.0',
      status: 'inactive',
      accuracy: 0,
      lastUpdated: new Date().toISOString(),
      deployments: 0,
      performance: Array.from({ length: 24 }, () => ({
        timestamp: '00:00',
        accuracy: 0,
        latency: 0
      }))
    };

    this.setState({
      models: [...this.state.models, newModel],
      showNewModelModal: false
    });
  };

  renderNewModelModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Model</h2>
          <button 
            onClick={() => this.setState({ showNewModelModal: false })}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter model name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model Type
            </label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>Classification</option>
              <option>Regression</option>
              <option>NLP</option>
              <option>Computer Vision</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => this.setState({ showNewModelModal: false })}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={this.handleNewModel}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create Model
          </button>
        </div>
      </div>
    </div>
  );

  renderSettingsModal = () => {
    const { selectedModel } = this.state;
    if (!selectedModel) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Model Settings</h2>
            <button 
              onClick={() => this.setState({ showSettingsModal: false })}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Size
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg"
                defaultValue="32"
                id="batchSize"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Learning Rate
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg"
                defaultValue="0.001"
                step="0.001"
                id="learningRate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Optimizer
              </label>
              <select 
                className="w-full px-3 py-2 border rounded-lg"
                id="optimizer"
              >
                <option>Adam</option>
                <option>SGD</option>
                <option>RMSprop</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => this.setState({ showSettingsModal: false })}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const settings = {
                  batchSize: (document.getElementById('batchSize') as HTMLInputElement).value,
                  learningRate: (document.getElementById('learningRate') as HTMLInputElement).value,
                  optimizer: (document.getElementById('optimizer') as HTMLSelectElement).value
                };
                this.handleSettingsSave(selectedModel.id, settings);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  renderDeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold mb-2">Delete Model</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this model? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => this.setState({ showDeleteModal: false, modelToDelete: null })}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={this.confirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Model
          </button>
        </div>
      </div>
    </div>
  );

  render() {
    const { 
      models, showDetails, isDeploying, searchQuery, 
      showNewModelModal, showSettingsModal, showDeleteModal,
      trainingStatus 
    } = this.state;

    const filteredModels = models.filter(model =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Model Management</h1>
            <p className="text-gray-600 mt-1">Manage and monitor your AI models</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Plus size={20} />
            New Model
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search models..."
              className="w-full px-4 py-2 border rounded-lg pl-10"
              value={searchQuery}
              onChange={(e) => this.setState({ searchQuery: e.target.value })}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button
            onClick={() => this.setState({ showFilters: !this.state.showFilters })}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map(model => (
            <div 
              key={model.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                  <p className="text-gray-500">{model.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${this.getStatusColor(model.status)}`}>
                  {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Version</span>
                  <span className="font-medium">{model.version}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Accuracy</span>
                  <span className="font-medium">{model.accuracy.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Deployments</span>
                  <span className="font-medium">{model.deployments}</span>
                </div>
              </div>

              <div className="h-[100px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={model.performance}>
                    <Area 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#4F46E5" 
                      fill="#4F46E5" 
                      fillOpacity={0.2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {model.status === 'training' && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${trainingStatus[model.id] || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 text-center">
                    Training: {trainingStatus[model.id] || 0}%
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button 
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                  onClick={() => this.setState({ showSettingsModal: true, selectedModel: model })}
                >
                  <Settings size={20} />
                </button>
                <button 
                  className="p-2 text-red-600 hover:text-red-900 rounded-lg hover:bg-red-50"
                  onClick={() => this.handleDelete(model.id)}
                >
                  <Trash2 size={20} />
                </button>
                {model.status !== 'training' && (
                  <button
                    className="p-2 text-blue-600 hover:text-blue-900 rounded-lg hover:bg-blue-50"
                    onClick={() => this.startTraining(model.id)}
                  >
                    <Play size={20} />
                  </button>
                )}
                <button
                  className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg ${
                    isDeploying || model.status === 'training' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                  }`}
                  onClick={() => this.handleDeploy(model)}
                  disabled={isDeploying || model.status === 'training'}
                >
                  {isDeploying ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <Play size={20} />
                  )}
                  {isDeploying ? 'Deploying...' : 'Deploy'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {showNewModelModal && this.renderNewModelModal()}
        {showSettingsModal && this.renderSettingsModal()}
        {showDeleteModal && this.renderDeleteModal()}
      </div>
    );
  }
}

export default ModelManagement;