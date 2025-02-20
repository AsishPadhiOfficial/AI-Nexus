import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RefreshCw, Square, RotateCcw, Settings, 
  Sliders, Cpu, History, ChevronDown, ChevronUp, Brain,
  TrendingUp, Target, Clock, AlertTriangle, BarChart2,
  Database, GitBranch
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TrainingParameters } from '../types';
import { useAI } from '../context/AIContext';

export default function Training() {
  const { startTraining, pauseTraining, stopTraining, resourceMetrics } = useAI();
  const [parameters, setParameters] = useState<TrainingParameters>({
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100,
    optimizer: 'adam',
  });

  const [trainingMetrics, setTrainingMetrics] = useState([]);
  const [epochMetrics, setEpochMetrics] = useState([]);
  const [resourceUsage, setResourceUsage] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [showParameters, setShowParameters] = useState(false);

  useEffect(() => {
    // Generate sample training metrics
    const generateMetrics = () => {
      const newMetrics = Array.from({ length: 50 }, (_, i) => ({
        step: i + 1,
        loss: 1 - Math.exp(-i / 20) + Math.random() * 0.1,
        accuracy: (1 - Math.exp(-i / 15)) * 100 + Math.random() * 5,
        validation: (1 - Math.exp(-i / 18)) * 100 + Math.random() * 5
      }));
      setTrainingMetrics(newMetrics);
    };

    // Generate epoch metrics
    const generateEpochMetrics = () => {
      const newMetrics = Array.from({ length: 10 }, (_, i) => ({
        epoch: i + 1,
        trainLoss: Math.max(0.2, 1 - (i * 0.08) + Math.random() * 0.1),
        valLoss: Math.max(0.3, 1.2 - (i * 0.07) + Math.random() * 0.1),
        trainAcc: Math.min(100, 60 + (i * 3) + Math.random() * 5),
        valAcc: Math.min(100, 55 + (i * 3) + Math.random() * 5)
      }));
      setEpochMetrics(newMetrics);
    };

    // Generate resource usage data
    const generateResourceUsage = () => {
      const newUsage = Array.from({ length: 20 }, (_, i) => ({
        time: `${i * 5}m`,
        cpu: 40 + Math.random() * 30,
        memory: 50 + Math.random() * 20,
        gpu: 60 + Math.random() * 25
      }));
      setResourceUsage(newUsage);
    };

    generateMetrics();
    generateEpochMetrics();
    generateResourceUsage();

    if (isTraining) {
      const interval = setInterval(() => {
        generateMetrics();
        generateResourceUsage();
        setCurrentEpoch(prev => (prev + 1) % parameters.epochs);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isTraining, parameters.epochs]);

  const handleStartTraining = () => {
    setIsTraining(true);
    startTraining(parameters);
  };

  const handlePauseTraining = () => {
    setIsTraining(false);
    pauseTraining();
  };

  const handleStopTraining = () => {
    setIsTraining(false);
    setCurrentEpoch(0);
    stopTraining();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Model Training</h1>
          <p className="text-gray-600 mt-1">Monitor and control model training progress</p>
        </div>
        <div className="flex items-center gap-3">
          {isTraining ? (
            <>
              <button
                onClick={handlePauseTraining}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Pause size={20} />
                Pause
              </button>
              <button
                onClick={handleStopTraining}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Square size={20} />
                Stop
              </button>
            </>
          ) : (
            <button
              onClick={handleStartTraining}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Play size={20} />
              Start Training
            </button>
          )}
          <button
            onClick={() => setShowParameters(!showParameters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings size={20} />
            Parameters
          </button>
        </div>
      </div>

      {/* Training Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="text-blue-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Current Epoch</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{currentEpoch}/{parameters.epochs}</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="text-green-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {trainingMetrics.length > 0 ? 
              `${trainingMetrics[trainingMetrics.length - 1].accuracy.toFixed(2)}%` : 
              '0%'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="text-red-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Loss</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {trainingMetrics.length > 0 ? 
              trainingMetrics[trainingMetrics.length - 1].loss.toFixed(4) : 
              '0.0000'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="text-purple-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Time Remaining</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {isTraining ? `${Math.floor((parameters.epochs - currentEpoch) * 1.5)}m` : '--'}
          </div>
        </div>
      </div>

      {/* Training Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Progress</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#10B981" 
                  name="Training Accuracy"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="validation" 
                  stroke="#4F46E5" 
                  name="Validation Accuracy"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loss Curves</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={epochMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="epoch" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="trainLoss" 
                  stroke="#EF4444" 
                  fill="#EF4444"
                  fillOpacity={0.2}
                  name="Training Loss"
                />
                <Area 
                  type="monotone" 
                  dataKey="valLoss" 
                  stroke="#F59E0B" 
                  fill="#F59E0B"
                  fillOpacity={0.2}
                  name="Validation Loss"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={resourceUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="cpu" 
                stroke="#4F46E5" 
                fill="#4F46E5"
                fillOpacity={0.2}
                name="CPU Usage (%)"
              />
              <Area 
                type="monotone" 
                dataKey="memory" 
                stroke="#10B981" 
                fill="#10B981"
                fillOpacity={0.2}
                name="Memory Usage (%)"
              />
              <Area 
                type="monotone" 
                dataKey="gpu" 
                stroke="#8B5CF6" 
                fill="#8B5CF6"
                fillOpacity={0.2}
                name="GPU Usage (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Parameters Modal */}
      {showParameters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Training Parameters</h2>
              <button 
                onClick={() => setShowParameters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronUp size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Learning Rate
                </label>
                <input
                  type="number"
                  value={parameters.learningRate}
                  onChange={(e) => setParameters({
                    ...parameters,
                    learningRate: parseFloat(e.target.value)
                  })}
                  className="w-full p-2 border rounded-lg"
                  step="0.0001"
                  min="0.0001"
                  max="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Size
                </label>
                <input
                  type="number"
                  value={parameters.batchSize}
                  onChange={(e) => setParameters({
                    ...parameters,
                    batchSize: parseInt(e.target.value)
                  })}
                  className="w-full p-2 border rounded-lg"
                  step="1"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Epochs
                </label>
                <input
                  type="number"
                  value={parameters.epochs}
                  onChange={(e) => setParameters({
                    ...parameters,
                    epochs: parseInt(e.target.value)
                  })}
                  className="w-full p-2 border rounded-lg"
                  step="1"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Optimizer
                </label>
                <select
                  value={parameters.optimizer}
                  onChange={(e) => setParameters({
                    ...parameters,
                    optimizer: e.target.value
                  })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="adam">Adam</option>
                  <option value="sgd">SGD</option>
                  <option value="rmsprop">RMSprop</option>
                  <option value="adagrad">Adagrad</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowParameters(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowParameters(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}