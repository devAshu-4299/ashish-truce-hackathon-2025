
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import HomePage from '@/pages/HomePage';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('userToken');
  if (!isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-brand-light dark:bg-brand-dark text-brand-dark dark:text-brand-light">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
