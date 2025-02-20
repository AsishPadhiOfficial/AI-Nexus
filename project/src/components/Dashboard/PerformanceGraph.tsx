import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', accuracy: 65 },
  { time: '04:00', accuracy: 78 },
  { time: '08:00', accuracy: 82 },
  { time: '12:00', accuracy: 85 },
  { time: '16:00', accuracy: 89 },
  { time: '20:00', accuracy: 92 },
  { time: '24:00', accuracy: 95 },
];

export default function PerformanceGraph() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4">AI Performance Metrics</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ fill: '#4F46E5' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}