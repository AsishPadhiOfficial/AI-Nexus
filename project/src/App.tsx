import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Training from './pages/Training';
import Explainability from './pages/Explainability';
import ModelManagement from './pages/ModelManagement';
import Analytics from './pages/Analytics';
import Automation from './pages/Automation';
import APIDeployment from './pages/APIDeployment';
import Settings from './pages/Settings';
import { AIProvider } from './context/AIContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <AIProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
              <Dashboard />
            </main>
          </div>
        </AIProvider>
      </ErrorBoundary>
    ),
  },
  {
    path: '/training',
    element: (
      <ErrorBoundary>
        <AIProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
              <Training />
            </main>
          </div>
        </AIProvider>
      </ErrorBoundary>
    ),
  },
  {
    path: '/xai',
    element: (
      <ErrorBoundary>
        <AIProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
              <Explainability />
            </main>
          </div>
        </AIProvider>
      </ErrorBoundary>
    ),
  },
  {
    path: '/models',
    element: (
      <ErrorBoundary>
        <AIProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
              <ModelManagement />
            </main>
          </div>
        </AIProvider>
      </ErrorBoundary>
    ),
  },
  {
    path: '/analytics',
    element: (
      <ErrorBoundary>
        <AIProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
              <Analytics />
            </main>
          </div>
        </AIProvider>
      </ErrorBoundary>
    ),
  },
  {
    path: '/automation',
    element: (
      <ErrorBoundary>
        <AIProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
              <Automation />
            </main>
          </div>
        </AIProvider>
      </ErrorBoundary>
    ),
  },
  {
    path: '/deployment',
    element: (
      <ErrorBoundary>
        <AIProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
              <APIDeployment />
            </main>
          </div>
        </AIProvider>
      </ErrorBoundary>
    ),
  },
  {
    path: '/settings',
    element: (
      <ErrorBoundary>
        <AIProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
              <Settings />
            </main>
          </div>
        </AIProvider>
      </ErrorBoundary>
    ),
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;