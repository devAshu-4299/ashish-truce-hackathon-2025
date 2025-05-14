import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  'https://byeezbrgqtvytbijlsob.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZWV6YnJncXR2eXRiaWpsc29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMTYzNjcsImV4cCI6MjA2MjY5MjM2N30.I6CgRPyxMYXRaAcgLzCaPiI7KrlY-qOt1IsWJia_ep8'
);

// Debug logging
const DEBUG = true;
function debugLog(message, data = null) {
  if (DEBUG) {
    console.log(`[ConsentLens Background] ${message}`, data || '');
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  debugLog('Received message:', message);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      debugLog('User not logged in');
      sendResponse({ error: 'User not logged in' });
      return;
    }

    switch (message.type) {
      case 'COOKIE_BANNER_DETECTED':
        await handleCookieBanner(message.data, user.id);
        break;
      case 'PRIVACY_POLICY_DETECTED':
        await handlePrivacyPolicy(message.data, user.id);
        break;
    }

    sendResponse({ success: true });
  } catch (error) {
    debugLog('Error handling message:', error);
    sendResponse({ error: error.message });
  }
});

// Handle cookie banner detection
async function handleCookieBanner(data, userId) {
  debugLog('Handling cookie banner:', data);

  try {
    const { error } = await supabase
      .from('user_consents')
      .insert({
        user_id: userId,
        website_url: data.url,
        consent_type: 'cookie',
        status: data.status,
        auto_revoke_rule: {
          hasAcceptAll: data.hasAcceptAll,
          hasRejectAll: data.hasRejectAll,
          hasCustomize: data.hasCustomize
        },
        created_at: data.timestamp
      });

    if (error) throw error;
    debugLog('Cookie banner saved to Supabase');
  } catch (error) {
    debugLog('Error saving cookie banner:', error);
  }
}

// Handle privacy policy detection
async function handlePrivacyPolicy(data, userId) {
  debugLog('Handling privacy policy:', data);

  try {
    // First save the policy text
    const { data: policy, error: policyError } = await supabase
      .from('policies')
      .insert({
        title: 'Privacy Policy',
        content: data.text,
        created_at: data.timestamp
      })
      .select()
      .single();

    if (policyError) throw policyError;

    // Then save the consent
    const { error: consentError } = await supabase
      .from('user_consents')
      .insert({
        user_id: userId,
        website_url: data.url,
        consent_type: 'policy',
        status: data.status,
        policy_id: policy.id,
        created_at: data.timestamp
      });

    if (consentError) throw consentError;
    debugLog('Privacy policy saved to Supabase');
  } catch (error) {
    debugLog('Error saving privacy policy:', error);
  }
}

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  debugLog('Extension installed');
});
