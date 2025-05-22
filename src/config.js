// API and Supabase configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const SUPABASE_URL = 'https://byeezbrgqtvytbijlsob.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZWV6YnJncXR2eXRiaWpsc29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMTYzNjcsImV4cCI6MjA2MjY5MjM2N30.I6CgRPyxMYXRaAcgLzCaPiI7KrlY-qOt1IsWJia_ep8';

// Feature flags and settings
export const FEATURES = {
  AI_SUMMARIES: true,
  AUTO_REVOKE: true,
  PRIVACY_INSIGHTS: true
};

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/token',
    SIGNUP: '/api/auth/signup',
    PROFILE: '/api/auth/me'
  },
  AI_SUMMARIES: {
    ANALYZE: '/api/ai-summaries/analyze',
    LIST: '/api/ai-summaries',
    DETAILS: (id) => `/api/ai-summaries/${id}`,
    COMPARE: '/api/ai-summaries/compare'
  },
  CONSENTS: {
    CREATE: '/api/consents',
    LIST: '/api/consents/list',
    DETAILS: (id) => `/api/consents/${id}`,
    STATS: '/api/consents/stats/overview',
    AUTO_REVOKE: (id) => `/api/consents/${id}/auto-revoke`
  }
};
