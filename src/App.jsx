import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ServiceDetails from './pages/ServiceDetails';
import Results from './pages/Results';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Settings from './pages/Settings';
import './index.css';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a0a0f',
        color: '#a78bfa',
        fontSize: '1.1rem',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(167, 139, 250, 0.2)',
            borderTopColor: '#a78bfa',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span>Loading...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/service/:serviceType" element={<ServiceDetails />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
