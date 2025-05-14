import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import HomePage from '@/pages/HomePage';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SignupPage from '@/pages/SignupPage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import { useAuth } from '@/contexts/AuthContext';
import ConsentsPage from '@/pages/features/ConsentsPage';
import AutoRevokePage from '@/pages/features/AutoRevokePage';
import AISummariesPage from '@/pages/features/AISummariesPage';
import PrivacyInsightsPage from '@/pages/features/PrivacyInsightsPage';
import ConsentRepositoryPage from '@/pages/features/ConsentRepositoryPage';
import AuditExportPage from '@/pages/features/AuditExportPage';
import PolicyAnalyzerPage from '@/pages/features/PolicyAnalyzerPage';
import ConsentDriftPage from '@/pages/features/ConsentDriftPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/consents" 
              element={
                <ProtectedRoute>
                  <ConsentsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/auto-revoke" 
              element={
                <ProtectedRoute>
                  <AutoRevokePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-summaries" 
              element={
                <ProtectedRoute>
                  <AISummariesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/privacy-insights" 
              element={
                <ProtectedRoute>
                  <PrivacyInsightsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/consent-repository" 
              element={
                <ProtectedRoute>
                  <ConsentRepositoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/audit-export" 
              element={
                <ProtectedRoute>
                  <AuditExportPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/policy-analyzer" 
              element={
                <ProtectedRoute>
                  <PolicyAnalyzerPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/consent-drift-detection" 
              element={
                <ProtectedRoute>
                  <ConsentDriftPage />
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
