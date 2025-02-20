import React, { useState } from 'react';
import {
  LayoutDashboard,
  Brain,
  LineChart,
  BarChart3,
  Database,
  Cog,
  Rocket,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Brain, label: 'AI Training', path: '/training' },
  { icon: LineChart, label: 'Explainability', path: '/xai' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Database, label: 'Model Management', path: '/models' },
  { icon: Cog, label: 'Automation', path: '/automation' },
  { icon: Rocket, label: 'API & Deployment', path: '/deployment' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div 
      className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI Nexus
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded-lg mb-2 transition-all hover:bg-gray-800 hover:scale-105 ${
                isActive ? 'bg-indigo-600 text-white' : 'text-gray-300'
              }`}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}