import React, { useState, useCallback, useEffect } from 'react';
import { 
  Sun, Moon, Bell, Globe, Lock, User, Palette, Save, 
  Shield, Database, Zap, Laptop, Mail, Sliders,
  RefreshCw, Key, Trash2, Download, Upload, AlertTriangle,
  Cpu as CpuIcon, Settings as SettingsIcon, BarChart2, Check,
  ChevronRight, Camera, Building, MapPin
} from 'lucide-react';
import { UserSettings } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    slack: false,
    types: {
      training: true,
      deployment: true,
      errors: true,
      performance: true,
    }
  },
  language: 'en',
  twoFactor: false,
  autoSave: true,
  email: 'user@example.com',
  name: 'John Doe',
  role: 'developer',
  profile: {
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    title: 'Senior AI Engineer',
    company: 'AI Nexus Technologies',
    location: 'San Francisco, CA',
    bio: 'Passionate about building AI solutions that make a difference.',
    website: 'https://example.com',
    social: {
      twitter: '@johndoe',
      github: 'johndoe',
      linkedin: 'johndoe'
    }
  },
  preferences: {
    defaultModelFramework: 'tensorflow',
    autoDeployment: true,
    dataRetentionDays: 30,
    resourceAlerts: true
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const themeToApply = settings.theme === 'system' ? systemTheme : settings.theme;
    
    if (themeToApply === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleSettingChange = useCallback((path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      path.split('.').reduce((obj: any, key, i, arr) => {
        if (i === arr.length - 1) {
          obj[key] = value;
        }
        return obj[key];
      }, newSettings);
      return newSettings;
    });

    if (settings.autoSave) {
      handleSaveSettings();
    }
  }, [settings.autoSave]);

  const handleSaveSettings = async () => {
    try {
      setSaveStatus('saving');
      
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('userSettings');
      handleSaveSettings();
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          handleSaveSettings();
        } catch (error) {
          alert('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Account deleted successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      alert('Failed to delete account');
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleSettingChange('profile.avatar', e.target?.result);
        setEditingAvatar(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your AI platform preferences</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleResetDefaults}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw size={20} />
            Reset Defaults
          </button>
          <button 
            onClick={handleSaveSettings}
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
              saveStatus === 'saving' 
                ? 'bg-gray-400 cursor-not-allowed'
                : saveStatus === 'saved'
                ? 'bg-green-600 hover:bg-green-700'
                : saveStatus === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white`}
          >
            {saveStatus === 'saving' ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : saveStatus === 'saved' ? (
              <Check size={20} />
            ) : (
              <Save size={20} />
            )}
            {saveStatus === 'saving' 
              ? 'Saving...' 
              : saveStatus === 'saved'
              ? 'Saved!'
              : saveStatus === 'error'
              ? 'Error!'
              : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User size={20} className="text-indigo-600" />
              Profile Information
            </h2>
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={settings.profile?.avatar}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <button
                    onClick={() => setEditingAvatar(true)}
                    className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                  >
                    <Camera size={16} />
                  </button>
                  {editingAvatar && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-input"
                    />
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => handleSettingChange('name', e.target.value)}
                    className="block w-full text-xl font-semibold mb-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Your Name"
                  />
                  <input
                    type="text"
                    value={settings.profile?.title}
                    onChange={(e) => handleSettingChange('profile.title', e.target.value)}
                    className="block w-full text-sm text-gray-500 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Your Title"
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={settings.role}
                    onChange={(e) => handleSettingChange('role', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="admin">Administrator</option>
                    <option value="developer">Developer</option>
                    <option value="analyst">Analyst</option>
                  </select>
                </div>
              </div>

              {/* Company & Location */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="text"
                      value={settings.profile?.company}
                      onChange={(e) => handleSettingChange('profile.company', e.target.value)}
                      className="block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Company Name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="text"
                      value={settings.profile?.location}
                      onChange={(e) => handleSettingChange('profile.location', e.target.value)}
                      className="block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={settings.profile?.bio}
                  onChange={(e) => handleSettingChange('profile.bio', e.target.value)}
                  rows={4}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Tell us about yourself"
                />
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Social Links</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={settings.profile?.social.twitter}
                      onChange={(e) => handleSettingChange('profile.social.twitter', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub
                    </label>
                    <input
                      type="text"
                      value={settings.profile?.social.github}
                      onChange={(e) => handleSettingChange('profile.social.github', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Palette size={20} className="text-indigo-600" />
              Appearance
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Laptop },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleSettingChange('theme', theme.value)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        settings.theme === theme.value
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <theme.icon
                        size={20}
                        className={
                          settings.theme === theme.value ? 'text-indigo-600' : 'text-gray-500'
                        }
                      />
                      <span
                        className={
                          settings.theme === theme.value ? 'text-indigo-600' : 'text-gray-700'
                        }
                      >
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Bell size={20} className="text-indigo-600" />
              Notifications
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Channels</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'email', label: 'Email Notifications', icon: Mail },
                      { key: 'push', label: 'Push Notifications', icon: Bell },
                      { key: 'slack', label: 'Slack Notifications', icon: Globe },
                    ].map((channel) => (
                      <div key={channel.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <channel.icon size={20} className="text-gray-400" />
                          <span className="text-gray-700">{channel.label}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications[channel.key as keyof typeof settings.notifications]}
                            onChange={(e) => handleSettingChange(`notifications.${channel.key}`, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Event Types</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'training', label: 'Training Events' },
                      { key: 'deployment', label: 'Deployments' },
                      { key: 'errors', label: 'Errors & Warnings' },
                      { key: 'performance', label: 'Performance Alerts' },
                    ].map((type) => (
                      <div key={type.key} className="flex items-center justify-between">
                        <span className="text-gray-700">{type.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.types[type.key as keyof typeof settings.notifications.types]}
                            onChange={(e) => handleSettingChange(`notifications.types.${type.key}`, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Shield size={20} className="text-indigo-600" />
              Security
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactor}
                    onChange={(e) => handleSettingChange('twoFactor', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">Account Actions</h3>
                <div className="space-y-4">
                  <button
                    onClick={handleExportSettings}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Download size={20} className="text-gray-500" />
                      <span className="text-gray-700">Export Settings</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>

                  <label className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Upload size={20} className="text-gray-500" />
                      <span className="text-gray-700">Import Settings</span>
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportSettings}
                      className="hidden"
                    />
                    <ChevronRight size={20} className="text-gray-400" />
                  </label>

                  <button
                    onClick={handleDeleteAccount}
                    className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Trash2 size={20} className="text-red-500" />
                      <span className="text-red-700">Delete Account</span>
                    </div>
                    <ChevronRight size={20} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sliders size={20} className="text-indigo-600" />
              Preferences
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Model Framework
                </label>
                <select
                  value={settings.preferences.defaultModelFramework}
                  onChange={(e) => handleSettingChange('preferences.defaultModelFramework', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="tensorflow">TensorFlow</option>
                  <option value="pytorch">PyTorch</option>
                  <option value="scikit-learn">Scikit-learn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Retention (days)
                </label>
                <input
                  type="number"
                  value={settings.preferences.dataRetentionDays}
                  onChange={(e) => handleSettingChange('preferences.dataRetentionDays', parseInt(e.target.value))}
                  min="1"
                  max="365"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Auto-save Changes</h3>
                  <p className="text-sm text-gray-500">Save settings automatically</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Auto-deployment</h3>
                  <p className="text-sm text-gray-500">Deploy models automatically</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.preferences.autoDeployment}
                    onChange={(e) => handleSettingChange('preferences.autoDeployment', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Resource Alerts</h3>
                  <p className="text-sm text-gray-500">Get notified about resource usage</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.preferences.resourceAlerts}
                    onChange={(e) => handleSettingChange('preferences.resourceAlerts', e.target.checked)}
                    className className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Delete Account</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}