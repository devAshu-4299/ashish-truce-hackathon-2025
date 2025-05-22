// Debug mode
const DEBUG = true;

function debugLog(message, data = null) {
  if (DEBUG) {
    console.log(`[ConsentLens] ${message}`, data || '');
  }
}

// Throttle function for performance
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Cookie banner detection
function detectCookieBanner() {
  if (!document.body) return;
  debugLog(' Scanning for cookie banners...');
  const combinedSelector = [
    '[class*="cookie"]',
    '[class*="consent"]',
    '[id*="cookie"]',
    '[id*="consent"]',
    '[class*="gdpr"]',
    '[id*="gdpr"]'
  ].join(',');

  const elements = document.querySelectorAll(combinedSelector);
  let found = false;
  let processedCount = 0;

  const processBatch = (startIndex) => {
    const batchSize = 5;
    const endIndex = Math.min(startIndex + batchSize, elements.length);

    for (let i = startIndex; i < endIndex; i++) {
      const element = elements[i];
      if (!element.classList.contains('consentlens-processed') && isVisible(element)) {
        debugLog(' Found cookie banner:', {
          selector: combinedSelector,
          text: element.innerText.substring(0, 100) + '...',
          element
        });
        
        highlightElement(element, 'cookie');
        element.classList.add('consentlens-processed');
        found = true;
        
        queueMicrotask(() => {
          chrome.runtime.sendMessage({
            type: 'COOKIE_BANNER_DETECTED',
            data: {
              url: window.location.href,
              text: element.innerText,
              timestamp: new Date().toISOString(),
              hasAcceptAll: hasButton(element, 'accept'),
              hasRejectAll: hasButton(element, 'reject'),
              hasCustomize: hasButton(element, 'customize'),
              status: true
            }
          }, response => {
            debugLog(' Background script response:', response);
          });
        });
      }
      processedCount++;
    }

    if (endIndex < elements.length) {
      requestAnimationFrame(() => processBatch(endIndex));
    }
  };

  if (elements.length > 0) {
    processBatch(0);
  }

  if (!found) {
    debugLog(' No cookie banners found on this page');
  }
}

// Privacy policy detection
function detectPrivacyPolicy() {
  if (!document.body) return;
  debugLog(' Scanning for privacy policies...');
  const combinedSelector = [
    'a[href*="privacy"]',
    'a[href*="datenschutz"]',
    'a[href*="gdpr"]',
    '[class*="privacy-policy"]'
  ].join(',');

  const elements = document.querySelectorAll(combinedSelector);
  let found = false;
  let processedCount = 0;

  const processBatch = (startIndex) => {
    const batchSize = 5;
    const endIndex = Math.min(startIndex + batchSize, elements.length);

    for (let i = startIndex; i < endIndex; i++) {
      const element = elements[i];
      if (!element.classList.contains('consentlens-processed') && isVisible(element)) {
        debugLog(' Found privacy policy:', {
          selector: combinedSelector,
          text: element.innerText,
          href: element.href,
          element
        });
        
        highlightElement(element, 'policy');
        element.classList.add('consentlens-processed');
        found = true;
        
        queueMicrotask(() => {
          chrome.runtime.sendMessage({
            type: 'PRIVACY_POLICY_DETECTED',
            data: {
              url: element.href || window.location.href,
              text: element.innerText,
              timestamp: new Date().toISOString(),
              status: true
            }
          }, response => {
            debugLog(' Background script response:', response);
          });
        });
      }
      processedCount++;
    }

    if (endIndex < elements.length) {
      requestAnimationFrame(() => processBatch(endIndex));
    }
  };

  if (elements.length > 0) {
    processBatch(0);
  }

  if (!found) {
    debugLog(' No privacy policies found on this page');
  }
}

// Helper functions
function isVisible(element) {
  if (!element.offsetParent && element.offsetWidth === 0 && element.offsetHeight === 0) {
    return false;
  }
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
  
  const buttons = element.querySelectorAll('button, a');
  for (let i = 0; i < buttons.length; i++) {
    if (buttonText.test(buttons[i].innerText.toLowerCase())) {
      return true;
    }
  }
  return false;
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
const observer = new MutationObserver(
  throttle(() => {
    requestAnimationFrame(() => {
      detectCookieBanner();
      detectPrivacyPolicy();
    });
  }, 1000)
);

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Content script for ConsentLens extension
let analysisOverlay = null;

// Initialize overlay
function initializeOverlay() {
  if (analysisOverlay) return;

  analysisOverlay = document.createElement('div');
  analysisOverlay.id = 'consent-lens-overlay';
  analysisOverlay.innerHTML = `
    <div class="cl-overlay-content">
      <div class="cl-header">
        <h2>ConsentLens Analysis</h2>
        <button class="cl-close">×</button>
      </div>
      <div class="cl-body">
        <div class="cl-loading">Analyzing privacy policy...</div>
        <div class="cl-quick-summary hidden">
          <h3>Quick Summary</h3>
          <p class="cl-quick-summary-text"></p>
        </div>
        <div class="cl-full-analysis hidden">
          <h3>Detailed Analysis</h3>
          <div class="cl-key-points">
            <h4>Key Points</h4>
            <ul></ul>
          </div>
          <div class="cl-data-collection">
            <h4>Data Collection</h4>
            <p></p>
          </div>
          <div class="cl-data-usage">
            <h4>Data Usage</h4>
            <p></p>
          </div>
          <div class="cl-data-sharing">
            <h4>Data Sharing</h4>
            <p></p>
          </div>
          <div class="cl-user-rights">
            <h4>Your Rights</h4>
            <p></p>
          </div>
          <div class="cl-privacy-risks">
            <h4>Privacy Risks</h4>
            <ul></ul>
          </div>
          <div class="cl-readability">
            <h4>Readability</h4>
            <p class="cl-readability-score"></p>
            <p class="cl-complexity-level"></p>
            <ul class="cl-readability-suggestions"></ul>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(analysisOverlay);

  // Add event listeners
  analysisOverlay.querySelector('.cl-close').addEventListener('click', () => {
    analysisOverlay.classList.remove('active');
  });

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #consent-lens-overlay {
      display: none;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 400px;
      background: white;
      box-shadow: -2px 0 5px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }
    #consent-lens-overlay.active {
      display: block;
    }
    .cl-overlay-content {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .cl-header {
      padding: 15px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cl-header h2 {
      margin: 0;
      font-size: 18px;
    }
    .cl-close {
      border: none;
      background: none;
      font-size: 24px;
      cursor: pointer;
    }
    .cl-body {
      padding: 15px;
      overflow-y: auto;
      flex-grow: 1;
    }
    .cl-loading {
      text-align: center;
      padding: 20px;
    }
    .hidden {
      display: none;
    }
    .cl-quick-summary {
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 5px;
    }
    h3 {
      margin: 0 0 15px 0;
      font-size: 16px;
    }
    h4 {
      margin: 15px 0 10px 0;
      font-size: 14px;
      color: #666;
    }
    p {
      margin: 0 0 10px 0;
      font-size: 14px;
      line-height: 1.5;
    }
    ul {
      margin: 0 0 15px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 5px;
      font-size: 14px;
      line-height: 1.5;
    }
  `;
  document.head.appendChild(style);
}

// Extract policy text from the page
function extractPolicyText() {
  // Common selectors for privacy policy content
  const selectors = [
    'article',
    '[role="main"]',
    '.privacy-policy',
    '#privacy-policy',
    '.privacy',
    '#privacy'
  ];

  let content = null;
  for (const selector of selectors) {
    content = document.querySelector(selector);
    if (content) break;
  }

  // If no specific container found, use body but exclude headers, footers, etc.
  if (!content) {
    content = document.body;
  }

  // Clone the content to manipulate it
  const clone = content.cloneNode(true);

  // Remove unwanted elements
  const unwanted = [
    'header',
    'footer',
    'nav',
    'script',
    'style',
    'noscript',
    'iframe',
    'img',
    'svg'
  ];
  unwanted.forEach(tag => {
    clone.querySelectorAll(tag).forEach(el => el.remove());
  });

  // Get text content and clean it up
  let text = clone.textContent || '';
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();

  return text;
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_POLICY_TEXT') {
    sendResponse({ policyText: extractPolicyText() });
    return true;
  }

  if (message.type === 'QUICK_SUMMARY_READY') {
    const quickSummaryDiv = analysisOverlay.querySelector('.cl-quick-summary');
    quickSummaryDiv.querySelector('.cl-quick-summary-text').textContent = message.data;
    quickSummaryDiv.classList.remove('hidden');
    return true;
  }

  if (message.type === 'FULL_ANALYSIS_READY') {
    displayFullAnalysis(message.data);
    return true;
  }
});

function displayFullAnalysis(data) {
  const fullAnalysis = analysisOverlay.querySelector('.cl-full-analysis');
  
  // Hide loading
  analysisOverlay.querySelector('.cl-loading').classList.add('hidden');
  
  // Key points
  const keyPointsList = fullAnalysis.querySelector('.cl-key-points ul');
  keyPointsList.innerHTML = data.key_points
    .map(point => `<li>${point}</li>`)
    .join('');

  // Data sections
  fullAnalysis.querySelector('.cl-data-collection p').textContent = data.data_collection;
  fullAnalysis.querySelector('.cl-data-usage p').textContent = data.data_usage;
  fullAnalysis.querySelector('.cl-data-sharing p').textContent = data.data_sharing;
  fullAnalysis.querySelector('.cl-user-rights p').textContent = data.user_rights;

  // Privacy risks
  const risksList = fullAnalysis.querySelector('.cl-privacy-risks ul');
  risksList.innerHTML = data.privacy_risks
    ? data.privacy_risks.map(risk => `<li>${risk}</li>`).join('')
    : '<li>No significant privacy risks identified.</li>';

  // Readability
  const readabilitySection = fullAnalysis.querySelector('.cl-readability');
  readabilitySection.querySelector('.cl-readability-score').textContent = 
    `Readability Score: ${data.readability.score}/100`;
  readabilitySection.querySelector('.cl-complexity-level').textContent = 
    `Complexity Level: ${data.readability.complexity_level}`;
  
  const suggestionsList = readabilitySection.querySelector('.cl-readability-suggestions');
  suggestionsList.innerHTML = data.readability.suggestions
    .map(suggestion => `<li>${suggestion}</li>`)
    .join('');

  // Show full analysis
  fullAnalysis.classList.remove('hidden');
}

// When clicking on a highlighted policy link
function handlePolicyLinkClick(event) {
  const link = event.target.closest('a[href*="privacy"], a[href*="datenschutz"], a[href*="gdpr"]');
  if (!link) return;

  event.preventDefault();
  debugLog('Policy link clicked:', link.href);

  // Show loading state
  initializeOverlay();
  analysisOverlay.classList.add('active');
  analysisOverlay.querySelector('.cl-loading').textContent = 'Fetching and analyzing privacy policy...';

  // Fetch policy content
  fetchPolicyContent(link.href)
    .then(policyText => {
      if (policyText) {
        // Send to background script for analysis
        chrome.runtime.sendMessage({
          type: 'ANALYZE_POLICY',
          data: {
            url: link.href,
            policyText: policyText
          }
        }, response => {
          debugLog('Analysis initiated:', response);
        });
      }
    })
    .catch(error => {
      console.error('Error fetching policy:', error);
      analysisOverlay.querySelector('.cl-loading').textContent = 'Error loading policy. Please try again.';
    });
}

// Fetch policy content from URL
async function fetchPolicyContent(url) {
  try {
    debugLog('Fetching policy from:', url);

    // If on the same page as the policy
    if (url === window.location.href) {
      debugLog('Policy is on current page');
      return extractPolicyText();
    }

    // Try direct fetch first
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (!response.ok) throw new Error('Direct fetch failed');

      const html = await response.text();
      return extractTextFromHTML(html);
    } catch (directError) {
      debugLog('Direct fetch failed:', directError);
      
      // If direct fetch fails, ask background script to fetch
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'FETCH_POLICY',
          data: { url }
        }, response => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(extractTextFromHTML(response.html));
          }
        });
      });
    }
  } catch (error) {
    debugLog('Error in fetchPolicyContent:', error);
    throw error;
  }
}

// Extract text from HTML string
function extractTextFromHTML(html) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove unwanted elements
    const unwantedTags = [
      'script', 'style', 'iframe', 'img', 'video', 'audio', 'noscript',
      'header', 'footer', 'nav', 'aside', 'advertisement'
    ];
    
    unwantedTags.forEach(tag => {
      doc.querySelectorAll(tag).forEach(el => el.remove());
    });

    // Try to find main content using various selectors
    const selectors = [
      'main',
      'article',
      '[role="main"]',
      '.privacy-policy',
      '#privacy-policy',
      '.privacy',
      '#privacy',
      '.policy-content',
      '#policy-content',
      '[data-content="privacy-policy"]'
    ];

    let mainContent = null;
    for (const selector of selectors) {
      mainContent = doc.querySelector(selector);
      if (mainContent) {
        debugLog('Found policy content with selector:', selector);
        break;
      }
    }

    // Fallback to body if no specific container found
    if (!mainContent) {
      debugLog('No specific container found, using body');
      mainContent = doc.body;
    }

    // Clean and get text
    let text = mainContent.textContent
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    // Validate text
    if (!text || text.length < 100) {
      throw new Error('Extracted text too short to be a valid policy');
    }

    debugLog('Successfully extracted policy text, length:', text.length);
    return text;
  } catch (error) {
    debugLog('Error in extractTextFromHTML:', error);
    throw error;
  }
}

// Add click handler to document
document.addEventListener('click', handlePolicyLinkClick);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeOverlay();

  // Add analyze button if we detect a privacy policy
  if (document.location.href.toLowerCase().includes('privacy') ||
      document.title.toLowerCase().includes('privacy policy')) {
    const button = document.createElement('button');
    button.id = 'consent-lens-analyze';
    button.textContent = 'Analyze with ConsentLens';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999998;
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    `;

    button.addEventListener('click', async () => {
      analysisOverlay.classList.add('active');
      const policyText = extractPolicyText();
      
      chrome.runtime.sendMessage({
        type: 'ANALYZE_POLICY',
        data: {
          url: window.location.href,
          policyText: policyText
        }
      });
    });

    document.body.appendChild(button);
  }
});
