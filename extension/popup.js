import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://byeezbrgqtvytbijlsob.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZWV6YnJncXR2eXRiaWpsc29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMTYzNjcsImV4cCI6MjA2MjY5MjM2N30.I6CgRPyxMYXRaAcgLzCaPiI7KrlY-qOt1IsWJia_ep8';

// Initialize Supabase with persistSession enabled
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: {
      getItem: async (key) => {
        const { [key]: value } = await chrome.storage.local.get(key);
        return value;
      },
      setItem: (key, value) => {
        return chrome.storage.local.set({ [key]: value });
      },
      removeItem: (key) => {
        return chrome.storage.local.remove(key);
      }
    }
  }
});

// Constants
const CONSENTLENS_SIGNUP_URL = 'http://localhost:5173/signup';
const CONSENTLENS_APP_URL = 'http://localhost:5173';

// DOM Elements
const loginSection = document.getElementById('loginSection');
const mainSection = document.getElementById('mainSection');
const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorText = document.getElementById('errorText');
const toggleAuth = document.getElementById('toggleAuth');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const cookieCount = document.getElementById('cookieCount');
const policyCount = document.getElementById('policyCount');

// Store Supabase session in storage and notify main app
async function storeSession(session) {
  if (session) {
    // Store session in chrome storage
    const key = 'sb-' + new URL(SUPABASE_URL).hostname;
    await chrome.storage.local.set({
      [key]: JSON.stringify({
        currentSession: session,
        expiresAt: Math.floor((Date.now() + 3600 * 1000) / 1000)
      })
    });

    // Send message to main app if it's open
    chrome.tabs.query({ url: CONSENTLENS_APP_URL + '/*' }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { 
          type: 'AUTH_STATE_CHANGE',
          session: session
        });
      });
    });
  }
}

// Check auth state on popup open
async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    showMainSection();
    updateStats();
  } else {
    showLoginSection();
  }
}

// Show login section
function showLoginSection() {
  loginSection.style.display = 'block';
  mainSection.style.display = 'none';
  errorText.textContent = '';
  // Always show login mode in extension
  loginBtn.textContent = 'Log In';
  toggleAuth.textContent = "Don't have an account? Sign up";
}

// Show main section
function showMainSection() {
  loginSection.style.display = 'none';
  mainSection.style.display = 'block';
}

// Update stats
async function updateStats() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get cookie banner count
    const { count: cookieCount } = await supabase
      .from('user_consents')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('consent_type', 'cookie');

    // Get privacy policy count
    const { count: policyCount } = await supabase
      .from('user_consents')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('consent_type', 'policy');

    // Update UI
    document.getElementById('cookieCount').textContent = cookieCount || 0;
    document.getElementById('policyCount').textContent = policyCount || 0;
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Handle signup click
toggleAuth.addEventListener('click', () => {
  // Open ConsentLens signup page in new tab
  chrome.tabs.create({ url: CONSENTLENS_SIGNUP_URL });
  window.close(); // Close the popup
});

// Handle form submission (login only)
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorText.textContent = '';

  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data.session) {
      await storeSession(data.session);
      showMainSection();
      updateStats();
      emailInput.value = '';
      passwordInput.value = '';
    }
  } catch (error) {
    errorText.textContent = error.message;
    console.error('Auth error:', error);
  }
});

// Logout handler
logoutBtn.addEventListener('click', async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await storeSession(null);
    showLoginSection();
  } catch (error) {
    console.error('Logout error:', error.message);
  }
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    storeSession(session);
    showMainSection();
    updateStats();
  } else if (event === 'SIGNED_OUT') {
    storeSession(null);
    showLoginSection();
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});
