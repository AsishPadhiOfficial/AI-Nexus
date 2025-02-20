import React from 'react';
import { Activity, Brain, Target } from 'lucide-react';
import { AIStats } from '../../types';

interface StatCardProps {
  stats: AIStats;
}

export default function AIStatsCards({ stats }: StatCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Brain className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-gray-600">Active Models</p>
            <h3 className="text-2xl font-bold">{stats.activeModels}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Activity className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-gray-600">Training Sessions</p>
            <h3 className="text-2xl font-bold">{stats.trainingSessions}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Target className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-gray-600">Performance Score</p>
            <h3 className="text-2xl font-bold">{stats.performanceScore}%</h3>
          </div>
        </div>
      </div>
    </div>
  );
}