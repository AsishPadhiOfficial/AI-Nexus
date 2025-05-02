import React, { Component } from 'react';
import { Plus, Trash2, Play, X, Search, Filter, Pause, AlertCircle } from 'lucide-react';
import { AIService } from '../services/AIService';
import { AIModel } from '../types/index';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface State {
  models: AIModel[];
  selectedModel: AIModel | null;
  searchQuery: string;
  showNewModelModal: boolean;
  showDeleteModal: boolean;
  modelToDelete: string | null;
  isLoading: boolean;
  error: string | null;
  newModel: {
    name: string;
    type: AIModel['type'];
    framework: AIModel['framework'];
    metrics: {
      precision: number;
      recall: number;
      f1Score: number;
    };
    deploymentStatus: AIModel['deploymentStatus'];
  };
  validationErrors: {
    name?: string;
    type?: string;
    framework?: string;
  };
}

export default class ModelManagement extends Component<Record<string, never>, State> {
  private aiService: AIService;

  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      models: [],
      selectedModel: null,
      searchQuery: '',
      showNewModelModal: false,
      showDeleteModal: false,
      modelToDelete: null,
      isLoading: false,
      error: null,
      newModel: {
        name: '',
        type: 'classification',
        framework: 'tensorflow',
        metrics: {
          precision: 0,
          recall: 0,
          f1Score: 0
        },
        deploymentStatus: 'undeployed'
      },
      validationErrors: {}
    };

    this.aiService = new AIService(import.meta.env.VITE_API_URL || 'http://localhost:3000', import.meta.env.VITE_API_KEY || '');
  }

  async componentDidMount() {
    await this.loadModels();
  }

  loadModels = async () => {
    try {
      const models = await this.aiService.listModels();
      this.setState({ models });
    } catch {
      this.setState({
        error: 'Failed to fetch models',
        notification: {
          type: 'error',
          message: 'Failed to fetch models'
        }
      });
    }
  };

  handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = this.validateForm();
    if (Object.keys(validationErrors).length > 0) {
      this.setState({ validationErrors });
      toast.error('Please fix the validation errors');
      return;
    }

    this.setState({ isLoading: true, error: null, validationErrors: {} });

    try {
      const model = await this.aiService.createModel({
        name: this.state.newModel.name,
        type: this.state.newModel.type,
        framework: this.state.newModel.framework,
        metrics: this.state.newModel.metrics,
        deploymentStatus: this.state.newModel.deploymentStatus
      });

      await this.loadModels();

      this.setState({
        showNewModelModal: false,
        isLoading: false,
        newModel: {
          name: '',
          type: 'classification',
          framework: 'tensorflow',
          metrics: {
            precision: 0,
            recall: 0,
            f1Score: 0
          },
          deploymentStatus: 'undeployed'
        }
      });

      toast.success('Model created successfully!');
    } catch (error) {
      this.setState({
        error: 'Failed to create model',
        isLoading: false
      });
      toast.error('Failed to create model. Please try again.');
    }
  };

  validateForm = () => {
    const errors: State['validationErrors'] = {};
    
    if (!this.state.newModel.name.trim()) {
      errors.name = 'Model name is required';
    } else if (this.state.newModel.name.length < 3) {
      errors.name = 'Model name must be at least 3 characters';
    }

    if (!this.state.newModel.type) {
      errors.type = 'Model type is required';
    }

    if (!this.state.newModel.framework) {
      errors.framework = 'Framework is required';
    }

    return errors;
  };

  handleRunModel = async (model: AIModel) => {
    try {
      await this.aiService.runTask(model.id);
      this.setState({ 
        selectedModel: null,
        notification: {
          type: 'success',
          message: 'Model run started successfully'
        }
      });
      await this.loadModels();
    } catch {
      this.setState({ 
        notification: {
          type: 'error',
          message: 'Failed to start model run'
        }
      });
    }
  };

  handlePauseResumeModel = async (model: AIModel): Promise<void> => {
    try {
      if (model.status === 'training') {
        const updatedModel = await this.aiService.pauseModel(model.id);
        this.setState(prevState => ({
          models: prevState.models.map(m => m.id === model.id ? updatedModel : m),
          notification: {
            type: 'success',
            message: 'Model paused successfully'
          }
        }));
      } else if (model.status === 'paused') {
        const updatedModel = await this.aiService.resumeModel(model.id);
        this.setState(prevState => ({
          models: prevState.models.map(m => m.id === model.id ? updatedModel : m),
          notification: {
            type: 'success',
            message: 'Model resumed successfully'
          }
        }));
      }
    } catch (error) {
      this.setState({
        notification: {
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to update model status'
        }
      });
    }
  };

  handleDelete = async (modelId: string): Promise<void> => {
    try {
      await this.aiService.deleteModel(modelId);
      this.setState(prevState => ({
        models: prevState.models.filter(m => m.id !== modelId),
        showDeleteModal: false,
        modelToDelete: null,
        notification: {
          type: 'success',
          message: 'Model deleted successfully'
        }
      }));
    } catch (error) {
      this.setState({
        notification: {
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to delete model'
        }
      });
    }
  };

  render() {
    const { models, searchQuery, isLoading, validationErrors } = this.state;
    const filteredModels = models.filter(model => 
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.framework.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="container mx-auto px-4 py-8">
        <ToastContainer position="top-right" autoClose={3000} />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-center">Processing...</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Model Management</h1>
          <button
            onClick={() => this.setState({ showNewModelModal: true })}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            aria-label="Create new model"
            title="Create new model"
          >
            <Plus size={20} aria-hidden="true" />
            <span>Create Model</span>
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
              aria-label="Search models"
              title="Search models"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} aria-hidden="true" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <div key={model.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{model.name}</h3>
                  <p className="text-sm text-gray-500">{model.type} - {model.framework}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => this.handlePauseResumeModel(model)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                    aria-label={model.status === 'training' ? `Pause model ${model.name}` : `Resume model ${model.name}`}
                    title={model.status === 'training' ? `Pause model ${model.name}` : `Resume model ${model.name}`}
                  >
                    {model.status === 'training' ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button
                    onClick={() => this.setState({ showDeleteModal: true, modelToDelete: model.id })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    aria-label={`Delete model ${model.name}`}
                    title={`Delete model ${model.name}`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${
                    model.status === 'completed' ? 'text-green-600' :
                    model.status === 'error' ? 'text-red-600' :
                    model.status === 'training' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {model.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Accuracy:</span>
                  <span className="font-medium">{model.accuracy.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progress:</span>
                  <span className="font-medium">{model.progress}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Version:</span>
                  <span className="font-medium">{model.version}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="font-medium">{new Date(model.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {this.state.showNewModelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create New Model</h2>
                <button
                  onClick={() => this.setState({ showNewModelModal: false, validationErrors: {} })}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Close modal"
                  title="Close modal"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <form onSubmit={this.handleCreateModel}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model Name
                    </label>
                    <input
                      type="text"
                      id="modelName"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        validationErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={this.state.newModel.name}
                      onChange={(e) => this.setState(prevState => ({
                        newModel: { ...prevState.newModel, name: e.target.value },
                        validationErrors: { ...prevState.validationErrors, name: undefined }
                      }))}
                      placeholder="Enter model name"
                      aria-label="Model name"
                      aria-required="true"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {validationErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      id="type"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        validationErrors.type ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={this.state.newModel.type}
                      onChange={(e) => this.setState(prevState => ({
                        newModel: { ...prevState.newModel, type: e.target.value as AIModel['type'] },
                        validationErrors: { ...prevState.validationErrors, type: undefined }
                      }))}
                      required
                    >
                      <option value="classification">Classification</option>
                      <option value="regression">Regression</option>
                      <option value="nlp">NLP</option>
                      <option value="vision">Vision</option>
                    </select>
                    {validationErrors.type && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {validationErrors.type}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="framework" className="block text-sm font-medium text-gray-700 mb-1">
                      Framework
                    </label>
                    <select
                      id="framework"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        validationErrors.framework ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={this.state.newModel.framework}
                      onChange={(e) => this.setState(prevState => ({
                        newModel: { ...prevState.newModel, framework: e.target.value as AIModel['framework'] },
                        validationErrors: { ...prevState.validationErrors, framework: undefined }
                      }))}
                      required
                    >
                      <option value="tensorflow">TensorFlow</option>
                      <option value="pytorch">PyTorch</option>
                      <option value="scikit-learn">Scikit-learn</option>
                    </select>
                    {validationErrors.framework && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {validationErrors.framework}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => this.setState({ showNewModelModal: false, validationErrors: {} })}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Model'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {this.state.showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Delete Model</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this model? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => this.setState({ showDeleteModal: false, modelToDelete: null })}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => this.state.modelToDelete && this.handleDelete(this.state.modelToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {this.state.notification && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg ${
            this.state.notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {this.state.notification.message}
          </div>
        )}
      </div>
    );
  }
}