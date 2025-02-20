import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Brain, Zap, Server, Cpu, Memory, Activity, TrendingUp, 
  AlertTriangle, Clock, Database, BarChart2, Share2, CheckCircle, 
  XCircle, Target, GitBranch, Users
} from 'lucide-react';
import AIStatsCards from '../components/Dashboard/AIStats';
import ActivityLog from '../components/Dashboard/ActivityLog';
import { useAI } from '../context/AIContext';
import { useRealTimeData } from '../hooks/useRealTimeData';

export default function Dashboard() {
  const { metrics, isLoading } = useRealTimeData(2000);
  const [performanceData, setPerformanceData] = useState([]);
  const [resourceMetrics, setResourceMetrics] = useState([]);
  const [modelDistribution, setModelDistribution] = useState([]);
  const COLORS = ['#4F46E5', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

  useEffect(() => {
    // Generate random performance data
    const newPerformanceData = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      accuracy: Math.floor(75 + Math.random() * 20),
      throughput: Math.floor(50 + Math.random() * 40),
      latency: Math.floor(20 + Math.random() * 30)
    }));

    // Generate random resource metrics
    const newResourceMetrics = Array.from({ length: 12 }, (_, i) => ({
      time: `${i * 2}:00`,
      cpu: Math.floor(40 + Math.random() * 50),
      memory: Math.floor(30 + Math.random() * 60),
      gpu: Math.floor(20 + Math.random() * 70)
    }));

    // Generate random model distribution
    const newModelDistribution = [
      { name: 'Classification', value: Math.floor(20 + Math.random() * 30) },
      { name: 'Regression', value: Math.floor(15 + Math.random() * 25) },
      { name: 'NLP', value: Math.floor(10 + Math.random() * 20) },
      { name: 'Computer Vision', value: Math.floor(15 + Math.random() * 25) },
      { name: 'Time Series', value: Math.floor(10 + Math.random() * 20) }
    ];

    setPerformanceData(newPerformanceData);
    setResourceMetrics(newResourceMetrics);
    setModelDistribution(newModelDistribution);
  }, []);

  const stats = {
    activeModels: 12,
    trainingSessions: 45,
    performanceScore: 92
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Platform Dashboard</h1>
        <p className="text-gray-600 mt-1">Real-time monitoring and analytics</p>
      </div>

      {/* Stats Cards */}
      <AIStatsCards stats={stats} />

      {/* Main Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
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
                  name="Accuracy"
                />
                <Area 
                  type="monotone" 
                  dataKey="throughput" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.2} 
                  name="Throughput"
                />
                <Area 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#F59E0B" 
                  fill="#F59E0B" 
                  fillOpacity={0.2} 
                  name="Latency"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resourceMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#4F46E5" 
                  name="CPU Usage"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#10B981" 
                  name="Memory Usage"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="gpu" 
                  stroke="#8B5CF6" 
                  name="GPU Usage"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Model Distribution */}
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

        {/* Real-time Metrics */}
        <div className="bg-white rounded-xl shadow-lg p-6 col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Metrics</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Legend />
                <Bar dataKey="accuracy" fill="#4F46E5" name="Accuracy" />
                <Bar dataKey="predictions" fill="#10B981" name="Predictions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="mt-8">
        <ActivityLog />
      </div>
    </div>
  );
}