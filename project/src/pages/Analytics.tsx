import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { 
  Calendar, Users, Filter, Target, Activity, AlertTriangle,
  ChevronDown, X
} from 'lucide-react';

interface PerformanceData {
  time: string;
  accuracy: number;
  latency: number;
  requests: number;
}

interface UserMetrics {
  day: string;
  activeUsers: number;
  predictions: number;
  errorRate: number;
}

interface ModelDistribution {
  name: string;
  value: number;
}

interface PredictionTrends {
  hour: string;
  successful: number;
  failed: number;
  pending: number;
}

interface Filters {
  models: string;
  accuracy: string;
  users: string;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('24h');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filters>({
    models: 'all',
    accuracy: 'all',
    users: 'all'
  });
  const COLORS = ['#4F46E5', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetrics[]>([]);
  const [modelDistribution, setModelDistribution] = useState<ModelDistribution[]>([]);
  const [predictionTrends, setPredictionTrends] = useState<PredictionTrends[]>([]);

  const generateData = (range: string, filters: Filters) => {
    // Generate performance data based on time range
    const dataPoints = range === '24h' ? 24 : range === '7d' ? 7 : 30;
    const newPerformanceData: PerformanceData[] = Array.from({ length: dataPoints }, (_, i) => {
      const accuracyBase = filters.accuracy === 'high' ? 90 : 
                          filters.accuracy === 'medium' ? 70 : 
                          filters.accuracy === 'low' ? 50 : 75;
      
      return {
        time: range === '24h' ? `${i}:00` : 
              range === '7d' ? `Day ${i + 1}` : 
              `Day ${i + 1}`,
        accuracy: accuracyBase + Math.random() * 10,
        latency: 20 + Math.random() * (filters.users === 'active' ? 50 : 30),
        requests: Math.floor(100 + Math.random() * (filters.users === 'active' ? 1500 : 900))
      };
    });

    // Generate user metrics
    const userMultiplier = filters.users === 'active' ? 2 : 
                          filters.users === 'inactive' ? 0.5 : 1;
    const newUserMetrics: UserMetrics[] = Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      activeUsers: Math.floor((500 + Math.random() * 1500) * userMultiplier),
      predictions: Math.floor((1000 + Math.random() * 4000) * userMultiplier),
      errorRate: Math.random() * (filters.accuracy === 'high' ? 2 : 
                                filters.accuracy === 'medium' ? 5 : 8)
    }));

    // Generate model distribution based on selected model filter
    const modelWeights: Record<string, number> = {
      Classification: 1,
      Regression: 1,
      NLP: 1,
      Vision: 1,
      'Time Series': 1
    };

    if (filters.models !== 'all') {
      Object.keys(modelWeights).forEach(key => {
        modelWeights[key] = key.toLowerCase() === filters.models ? 2 : 0.5;
      });
    }

    const newModelDistribution: ModelDistribution[] = Object.entries(modelWeights).map(([name, weight]) => ({
      name,
      value: Math.floor((20 + Math.random() * 30) * weight)
    }));

    // Generate prediction trends
    const trendMultiplier = filters.accuracy === 'high' ? 1.5 : 
                           filters.accuracy === 'low' ? 0.5 : 1;
    const newPredictionTrends: PredictionTrends[] = Array.from({ length: 12 }, (_, i) => ({
      hour: `${i * 2}:00`,
      successful: Math.floor((800 + Math.random() * 1200) * trendMultiplier),
      failed: Math.floor((10 + Math.random() * 50) * (1 / trendMultiplier)),
      pending: Math.floor(50 + Math.random() * 150)
    }));

    setPerformanceData(newPerformanceData);
    setUserMetrics(newUserMetrics);
    setModelDistribution(newModelDistribution);
    setPredictionTrends(newPredictionTrends);
  };

  // Generate initial data
  useEffect(() => {
    generateData(timeRange, activeFilters);
  }, []);

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    setShowTimeRangeDropdown(false);
    generateData(range, activeFilters);
  };

  // Handle filter apply
  const handleApplyFilters = () => {
    setShowFilters(false);
    generateData(timeRange, activeFilters);
  };

  // Handle filter reset
  const handleResetFilters = () => {
    const defaultFilters = {
      models: 'all',
      accuracy: 'all',
      users: 'all'
    };
    setActiveFilters(defaultFilters);
    generateData(timeRange, defaultFilters);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
              aria-label="Time range selector"
            >
              <Calendar size={20} />
              {timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              <ChevronDown size={16} />
            </button>
            
            {showTimeRangeDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleTimeRangeChange('24h')}
                    className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
                      timeRange === '24h' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                    }`}
                    aria-label="Last 24 hours"
                  >
                    Last 24 Hours
                  </button>
                  <button
                    onClick={() => handleTimeRangeChange('7d')}
                    className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
                      timeRange === '7d' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                    }`}
                    aria-label="Last 7 days"
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => handleTimeRangeChange('30d')}
                    className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
                      timeRange === '30d' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                    }`}
                    aria-label="Last 30 days"
                  >
                    Last 30 Days
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
              aria-label="Filter options"
            >
              <Filter size={20} />
              Filters
              <ChevronDown size={16} />
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-10">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Filters</h3>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Close filters"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Models
                      </label>
                      <select
                        value={activeFilters.models}
                        onChange={(e) => setActiveFilters({
                          ...activeFilters,
                          models: e.target.value
                        })}
                        className="w-full p-2 border rounded-lg text-sm"
                        aria-label="Select model type"
                      >
                        <option value="all">All Models</option>
                        <option value="classification">Classification</option>
                        <option value="regression">Regression</option>
                        <option value="nlp">NLP</option>
                        <option value="vision">Computer Vision</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accuracy Range
                      </label>
                      <select
                        value={activeFilters.accuracy}
                        onChange={(e) => setActiveFilters({
                          ...activeFilters,
                          accuracy: e.target.value
                        })}
                        className="w-full p-2 border rounded-lg text-sm"
                        aria-label="Select accuracy range"
                      >
                        <option value="all">All Ranges</option>
                        <option value="high">High (90-100%)</option>
                        <option value="medium">Medium (70-90%)</option>
                        <option value="low">Low (Below 70%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User Activity
                      </label>
                      <select
                        value={activeFilters.users}
                        onChange={(e) => setActiveFilters({
                          ...activeFilters,
                          users: e.target.value
                        })}
                        className="w-full p-2 border rounded-lg text-sm"
                        aria-label="Select user activity level"
                      >
                        <option value="all">All Users</option>
                        <option value="active">Active Users</option>
                        <option value="inactive">Inactive Users</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={handleResetFilters}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                        aria-label="Reset filters"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleApplyFilters}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        aria-label="Apply filters"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Target className="text-indigo-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {performanceData.length > 0 ? 
              `${performanceData[performanceData.length - 1].accuracy.toFixed(1)}%` : 
              '0%'}
          </div>
          <div className="text-sm text-green-600 mt-2">↑ 2.5% from last period</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="text-green-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Requests/Hour</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {performanceData.length > 0 ? 
              performanceData[performanceData.length - 1].requests.toLocaleString() : 
              '0'}
          </div>
          <div className="text-sm text-green-600 mt-2">↑ 12% from last period</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Active Users</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {userMetrics.length > 0 ? 
              userMetrics[userMetrics.length - 1].activeUsers.toLocaleString() : 
              '0'}
          </div>
          <div className="text-sm text-green-600 mt-2">↑ 8% from last period</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Error Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {userMetrics.length > 0 ? 
              `${userMetrics[userMetrics.length - 1].errorRate.toFixed(2)}%` : 
              '0%'}
          </div>
          <div className="text-sm text-red-600 mt-2">↓ 0.5% from last period</div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#4F46E5" 
                  fill="#4F46E5" 
                  fillOpacity={0.2}
                  name="Accuracy (%)"
                />
                <Area 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.2}
                  name="Latency (ms)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="activeUsers" fill="#4F46E5" name="Active Users" />
                <Bar dataKey="predictions" fill="#10B981" name="Predictions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Distribution and Prediction Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {modelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {modelDistribution.map((entry, index) => (
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

        <div className="bg-white rounded-xl shadow-lg p-6 col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="successful" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981" 
                  name="Successful"
                />
                <Area 
                  type="monotone" 
                  dataKey="failed" 
                  stackId="1"
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  name="Failed"
                />
                <Area 
                  type="monotone" 
                  dataKey="pending" 
                  stackId="1"
                  stroke="#F59E0B" 
                  fill="#F59E0B" 
                  name="Pending"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}