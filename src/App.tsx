import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ArticleServiceWithFallback } from './services/articleServiceWithFallback';
import { MovementServiceWithFallback } from './services/movementServiceWithFallback';
import { InventoryServiceWithFallback } from './services/inventoryServiceWithFallback';
import { ReportServiceWithFallback } from './services/reportServiceWithFallback';
import { UserServiceWithFallback } from './services/userServiceWithFallback';
import { SettingsServiceWithFallback } from './services/settingsServiceWithFallback';
import { SupplierServiceWithFallback } from './services/supplierServiceWithFallback';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import Movements from './pages/Movements';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';

// Démarrer la synchronisation automatique des articles
ArticleServiceWithFallback.startAutoSync();

// Démarrer la synchronisation automatique des mouvements
MovementServiceWithFallback.startAutoSync();

// Démarrer la synchronisation automatique des inventaires
InventoryServiceWithFallback.startAutoSync();

// Démarrer la synchronisation automatique des rapports
ReportServiceWithFallback.startAutoSync();

// Démarrer la synchronisation automatique des utilisateurs
UserServiceWithFallback.startAutoSync();

// Démarrer la synchronisation automatique des paramètres
SettingsServiceWithFallback.startAutoSync();

// Démarrer la synchronisation automatique des fournisseurs
SupplierServiceWithFallback.startAutoSync();

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#6B2C91' }}></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/articles" element={
              <ProtectedRoute requiredRole="user">
                <Articles />
              </ProtectedRoute>
            } />
            <Route path="/movements" element={
              <ProtectedRoute>
                <Movements />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute requiredRole="supervisor">
                <Inventory />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requiredRole="manager">
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requiredRole="manager">
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;