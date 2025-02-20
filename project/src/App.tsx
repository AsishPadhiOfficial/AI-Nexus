import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <ErrorBoundary>
      <AIProvider>
        <Router>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/training" element={<Training />} />
                <Route path="/xai" element={<Explainability />} />
                <Route path="/models" element={<ModelManagement />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/automation" element={<Automation />} />
                <Route path="/deployment" element={<APIDeployment />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AIProvider>
    </ErrorBoundary>
  );
}

export default App;