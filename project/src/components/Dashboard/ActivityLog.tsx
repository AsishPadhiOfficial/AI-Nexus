import React from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'success',
    message: 'Model training completed successfully',
    time: '2 minutes ago',
  },
  {
    id: 2,
    type: 'warning',
    message: 'Performance optimization suggested',
    time: '15 minutes ago',
  },
  {
    id: 3,
    type: 'info',
    message: 'New training session started',
    time: '1 hour ago',
  },
];

export default function ActivityLog() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {activity.type === 'success' && (
              <CheckCircle className="text-green-500" size={20} />
            )}
            {activity.type === 'warning' && (
              <AlertCircle className="text-yellow-500" size={20} />
            )}
            {activity.type === 'info' && (
              <Clock className="text-blue-500" size={20} />
            )}
            <div>
              <p className="text-gray-800">{activity.message}</p>
              <p className="text-sm text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}