// Debug mode
const DEBUG = true;

function debugLog(message, data = null) {
  if (DEBUG) {
    console.log(`[ConsentLens] ${message}`, data || '');
  }
}

// Cookie banner detection
function detectCookieBanner() {
  debugLog(' Scanning for cookie banners...');
  const selectors = [
    '[class*="cookie"]',
    '[class*="consent"]',
    '[id*="cookie"]',
    '[id*="consent"]',
    '[class*="gdpr"]',
    '[id*="gdpr"]'
  ];

  debugLog('Using selectors:', selectors);
  let found = false;

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (isVisible(element) && !element.classList.contains('consentlens-processed')) {
        debugLog(' Found cookie banner:', {
          selector,
          text: element.innerText.substring(0, 100) + '...',
          element
        });
        
        highlightElement(element, 'cookie');
        element.classList.add('consentlens-processed');
        found = true;
        
        // Send to background script
        chrome.runtime.sendMessage({
          type: 'COOKIE_BANNER_DETECTED',
          data: {
            url: window.location.href,
            text: element.innerText,
            timestamp: new Date().toISOString(),
            hasAcceptAll: hasButton(element, 'accept'),
            hasRejectAll: hasButton(element, 'reject'),
            hasCustomize: hasButton(element, 'customize'),
            status: true // default to accepted
          }
        }, response => {
          debugLog(' Background script response:', response);
        });
      }
    });
  }

  if (!found) {
    debugLog(' No cookie banners found on this page');
  }
}

// Privacy policy detection
function detectPrivacyPolicy() {
  debugLog(' Scanning for privacy policies...');
  const selectors = [
    'a[href*="privacy"]',
    'a[href*="datenschutz"]',
    'a[href*="gdpr"]',
    '[class*="privacy-policy"]'
  ];

  debugLog('Using selectors:', selectors);
  let found = false;

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (isVisible(element) && !element.classList.contains('consentlens-processed')) {
        debugLog(' Found privacy policy:', {
          selector,
          text: element.innerText,
          href: element.href,
          element
        });
        
        highlightElement(element, 'policy');
        element.classList.add('consentlens-processed');
        found = true;
        
        // Send to background script
        chrome.runtime.sendMessage({
          type: 'PRIVACY_POLICY_DETECTED',
          data: {
            url: element.href || window.location.href,
            text: element.innerText,
            timestamp: new Date().toISOString(),
            status: true // default to accepted
          }
        }, response => {
          debugLog(' Background script response:', response);
        });
      }
    });
  }

  if (!found) {
    debugLog(' No privacy policies found on this page');
  }
}

// Helper functions
function isVisible(element) {
  const style = window.getComputedStyle(element);
  const visible = style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 style.opacity !== '0';
  debugLog(`Visibility check for element:`, {
    element,
    visible,
    display: style.display,
    visibility: style.visibility,
    opacity: style.opacity
  });
  return visible;
}

function hasButton(element, type) {
  const buttonText = type === 'accept' ? /accept|allow|agree|ok|yes/i :
                    type === 'reject' ? /reject|decline|deny|no/i :
                    /customize|settings|preferences|more/i;
  
  const hasBtn = Array.from(element.querySelectorAll('button, a')).some(button => 
    buttonText.test(button.innerText.toLowerCase())
  );

  debugLog(`Button check for ${type}:`, {
    element,
    hasButton: hasBtn,
    pattern: buttonText.toString()
  });

  return hasBtn;
}

function highlightElement(element, type) {
  debugLog(` Highlighting ${type} element:`, element);
  
  element.classList.add('consentlens-highlight');
  
  const badge = document.createElement('div');
  badge.className = 'consentlens-badge';
  badge.textContent = type === 'cookie' ? '' : '';
  element.appendChild(badge);
  
  const tooltip = document.createElement('div');
  tooltip.className = 'consentlens-tooltip';
  tooltip.textContent = type === 'cookie' ? 'Cookie Banner Detected' : 'Privacy Policy Detected';
  element.appendChild(tooltip);
}

// Listen for auth state changes from extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AUTH_STATE_CHANGE' && message.session) {
    // Get all supabase.auth.token keys
    const keys = Object.keys(localStorage).filter(key => key.startsWith('sb-'));
    keys.forEach(key => localStorage.removeItem(key));

    // Store the session with Supabase's format
    const key = 'sb-' + new URL('https://byeezbrgqtvytbijlsob.supabase.co').hostname;
    localStorage.setItem(key, JSON.stringify({
      currentSession: message.session,
      expiresAt: Math.floor((Date.now() + 3600 * 1000) / 1000)
    }));
    
    // Also store the fallback key
    localStorage.setItem('supabase.auth.token', JSON.stringify(message.session));
    
    // Reload the page to update auth state
    window.location.reload();
  }
});

// Run detection on page load and DOM changes
debugLog(' ConsentLens initialized');
detectCookieBanner();
detectPrivacyPolicy();

// Watch for dynamic content
debugLog(' Setting up mutation observer');
const observer = new MutationObserver(() => {
  debugLog(' DOM changed, re-scanning...');
  detectCookieBanner();
  detectPrivacyPolicy();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
