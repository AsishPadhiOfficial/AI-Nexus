import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Brain, Eye, Target, AlertTriangle, Zap, Settings, 
  RefreshCw, Download, Share2, Filter, ChevronDown, ChevronUp,
  Lightbulb, Cpu, Activity, ArrowRight, X, Upload, Database, GitBranch
} from 'lucide-react';
import { useAI } from '../context/AIContext';

const COLORS = ['#4F46E5', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

export default function Explainability() {
  const { models } = useAI();
  const [selectedDecision, setSelectedDecision] = useState(0);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedModel, setSelectedModel] = useState('');
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    income: '',
    creditScore: '',
    employmentYears: '',
    existingLoans: '',
    purpose: 'personal'
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Add states for main dashboard data
  const [decisionPath, setDecisionPath] = useState([]);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [attentionDistribution, setAttentionDistribution] = useState([]);

  // Add new state for graph data
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const randomConfidence = 0.7 + Math.random() * 0.25;
      
      // Generate random decision path data
      const newDecisionPath = Array.from({ length: 10 }, (_, i) => ({
        step: i + 1,
        confidence: Math.min(40 + (i * 5) + (Math.random() * 10), 95),
        attention: Math.min(30 + (i * 6) + (Math.random() * 15), 90),
        impact: Math.min(20 + (i * 7) + (Math.random() * 12), 85)
      }));

      // Generate random feature importance
      const features = ["Income Level", "Credit History", "Employment Status", "Debt Ratio", "Payment Record"];
      const newFeatureImportance = features.map(name => ({
        name,
        importance: Math.floor(30 + Math.random() * 60),
        trend: Math.random() > 0.5 ? 1 : -1
      })).sort((a, b) => b.importance - a.importance);

      // Generate random attention distribution
      const aspects = ["Data Validation", "Feature Analysis", "Model Processing", "Decision Logic"];
      const totalAttention = aspects.map(() => Math.random());
      const sum = totalAttention.reduce((a, b) => a + b, 0);
      const newAttentionDistribution = aspects.map((name, i) => ({
        name,
        value: Math.floor((totalAttention[i] / sum) * 100)
      }));

      // Generate time series data
      const newTimeSeriesData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        confidence: Math.floor(60 + Math.random() * 30),
        attention: Math.floor(50 + Math.random() * 40),
        accuracy: Math.floor(70 + Math.random() * 25)
      }));

      // Generate distribution data
      const newDistributionData = [
        { name: 'Feature Analysis', value: Math.floor(20 + Math.random() * 30) },
        { name: 'Model Processing', value: Math.floor(15 + Math.random() * 25) },
        { name: 'Data Validation', value: Math.floor(10 + Math.random() * 20) },
        { name: 'Decision Logic', value: Math.floor(15 + Math.random() * 25) },
        { name: 'Output Generation', value: Math.floor(10 + Math.random() * 20) }
      ];

      // Update all states
      setDecisionPath(newDecisionPath);
      setFeatureImportance(newFeatureImportance);
      setAttentionDistribution(newAttentionDistribution);
      setTimeSeriesData(newTimeSeriesData);
      setDistributionData(newDistributionData);
      
      setAnalysisResult({
        modelName: "Risk Assessment Model",
        prediction: ["Low Risk", "Medium Risk", "High Risk"][Math.floor(Math.random() * 3)],
        confidence: randomConfidence,
        featureImportance: newFeatureImportance.map(f => ({
          feature: f.name,
          importance: f.importance / 100
        })),
        attentionPoints: newAttentionDistribution.map(a => ({
          step: a.name,
          attention: a.value / 100
        }))
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    handleAnalyze();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Explainability Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze AI decision-making processes</p>
        </div>
        <button
          onClick={() => setShowAnalyzeModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Brain size={20} />
          Quick Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Confidence Score */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Model Confidence</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="text-green-600" size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {analysisResult ? `${(analysisResult.confidence * 100).toFixed(1)}%` : '0%'}
          </div>
          <p className="text-sm text-gray-600">Overall prediction confidence</p>
        </div>

        {/* Feature Count */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Features</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {featureImportance.length}
          </div>
          <p className="text-sm text-gray-600">Features analyzed in decision</p>
        </div>

        {/* Decision Steps */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Process Steps</h3>
            <div className="p-2 bg-purple-100 rounded-lg">
              <GitBranch className="text-purple-600" size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {decisionPath.length}
          </div>
          <p className="text-sm text-gray-600">Steps in decision path</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Over Time */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics Over Time</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#4F46E5" 
                  fill="#4F46E5" 
                  fillOpacity={0.2} 
                  name="Confidence"
                />
                <Area 
                  type="monotone" 
                  dataKey="attention" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.2} 
                  name="Attention"
                />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.2} 
                  name="Accuracy"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Process Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Distribution</h3>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {distributionData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Feature Importance Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Importance</h3>
          <div className="space-y-4">
            {featureImportance.map((feature, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{feature.name}</span>
                  <span className="text-gray-600">{feature.importance}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${feature.importance}%` }}
                  />
                </div>
                <span className={`absolute right-0 top-0 text-xs ${
                  feature.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {feature.trend > 0 ? '↑' : '↓'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Attention Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attention Distribution</h3>
          <div className="space-y-4">
            {attentionDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-600">{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decision Path Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Decision Path Analysis</h3>
        <div className="space-y-4">
          {decisionPath.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex items-center mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.confidence > 80 ? 'bg-green-100 text-green-600' :
                  step.confidence > 60 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-4">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-900">Step {step.step}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <span className="font-medium">{step.confidence}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Attention:</span>
                      <span className="font-medium">{step.attention}%</span>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-4">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${step.confidence}%` }}
                      />
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${step.attention}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analyze New Decision Modal */}
      {showAnalyzeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Model Analysis</h2>
              <button 
                onClick={() => setShowAnalyzeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {analysisResult ? (
                <div className="space-y-6">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{analysisResult.modelName}</h3>
                        <p className="text-sm text-gray-600 mt-1">Latest prediction analysis</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                        {(analysisResult.confidence * 100).toFixed(1)}% Confidence
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Feature Importance</h4>
                    {analysisResult.featureImportance.map((feature, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{feature.feature}</span>
                          <span className="font-medium">{(feature.importance * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${feature.importance * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Attention Distribution</h4>
                    {analysisResult.attentionPoints.map((point, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{point.step}</span>
                          <span className="font-medium">{(point.attention * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${point.attention * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Click analyze to see the model's decision process</p>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowAnalyzeModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Close
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain size={20} />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}