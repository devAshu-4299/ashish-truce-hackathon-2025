// Background script for ConsentLens extension
import config from './config.js';

let authToken = null;

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ANALYZE_POLICY') {
    analyzePolicyText(request.data, sender.tab?.id)
      .then(response => sendResponse(response))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
  
  if (request.type === 'SET_AUTH_TOKEN') {
    authToken = request.token;
    sendResponse({ success: true });
    return true;
  }

  if (request.type === 'FETCH_POLICY') {
    fetchPolicy(request.data.url)
      .then(html => sendResponse({ html }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

// Fetch policy HTML from URL by creating a new tab
async function fetchPolicy(url) {
  try {
    // Create a new tab to load the policy
    const tab = await chrome.tabs.create({ 
      url: url, 
      active: false // Keep it in background
    });

    // Wait for the page to load and extract content
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        chrome.tabs.remove(tab.id);
        reject(new Error('Timeout waiting for policy page to load'));
      }, 10000); // 10 second timeout

      // Listen for the content script to send us the policy text
      const listener = (message, sender) => {
        if (sender.tab?.id === tab.id && message.type === 'POLICY_CONTENT') {
          cleanup();
          resolve(message.data.html);
        }
      };

      // Cleanup function
      const cleanup = () => {
        clearTimeout(timeout);
        chrome.runtime.onMessage.removeListener(listener);
        chrome.tabs.remove(tab.id);
      };

      // Add listener
      chrome.runtime.onMessage.addListener(listener);

      // Inject content script to extract policy
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          // Wait for page to load
          if (document.readyState === 'complete') {
            extractAndSend();
          } else {
            window.addEventListener('load', extractAndSend);
          }

          function extractAndSend() {
            const html = document.documentElement.outerHTML;
            chrome.runtime.sendMessage({
              type: 'POLICY_CONTENT',
              data: { html }
            });
          }
        }
      }).catch(error => {
        cleanup();
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error fetching policy:', error);
    throw error;
  }
}

// Function to analyze policy text
async function analyzePolicyText(data, tabId) {
  try {
    if (!authToken) {
      throw new Error('Not authenticated');
    }

    // First, create the analysis request
    const response = await fetch(`${config.API_BASE_URL}/api/ai-summaries/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        website_url: data.url,
        policy_text: data.policyText
      })
    });

    if (!response.ok) {
      throw new Error('Failed to initiate analysis');
    }

    const initialResult = await response.json();

    // Show initial quick summary
    if (tabId) {
      try {
        chrome.tabs.sendMessage(tabId, {
          type: 'QUICK_SUMMARY_READY',
          data: initialResult.summary.quick_summary
        });
      } catch (error) {
        console.debug('Could not send quick summary:', error);
      }
    }

    // Poll for full analysis
    const pollInterval = 2000; // 2 seconds
    const maxAttempts = 30; // 1 minute total
    let attempts = 0;

    while (attempts < maxAttempts) {
      const pollResponse = await fetch(
        `${config.API_BASE_URL}/api/ai-summaries/${initialResult.id}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!pollResponse.ok) {
        throw new Error('Failed to check analysis status');
      }

      const result = await pollResponse.json();

      if (result.summary.status === 'completed') {
        // Send full analysis to content script
        if (tabId) {
          try {
            chrome.tabs.sendMessage(tabId, {
              type: 'FULL_ANALYSIS_READY',
              data: result.summary
            });
          } catch (error) {
            console.debug('Could not send full analysis:', error);
          }
        }
        return result;
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Analysis timed out');
  } catch (error) {
    console.error('Error in analyzePolicyText:', error);
    throw error;
  }
}

// Function to compare policy versions
async function comparePolicyVersions(oldText, newText, url) {
  try {
    if (!authToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${config.API_BASE_URL}/api/ai-summaries/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        old_policy_text: oldText,
        new_policy_text: newText,
        website_url: url
      })
    });

    if (!response.ok) {
      throw new Error('Failed to compare policies');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in comparePolicyVersions:', error);
    throw error;
  }
}

// Function to check if URL has changed policy
chrome.webNavigation.onCompleted.addListener(async (details) => {
  try {
    // Only process main frame navigation
    if (details.frameId !== 0) return;

    // Get stored policy for this URL
    const stored = await chrome.storage.local.get(details.url);
    if (!stored[details.url]) return;

    // Check if tab is accessible
    const tab = await chrome.tabs.get(details.tabId).catch(() => null);
    if (!tab) return;

    // Get current policy text
    try {
      const response = await chrome.tabs.sendMessage(details.tabId, {
        type: 'EXTRACT_POLICY_TEXT'
      });

      if (response && response.policyText !== stored[details.url].policyText) {
        // Compare versions
        const changes = await comparePolicyVersions(
          stored[details.url].policyText,
          response.policyText,
          details.url
        );

        // Notify user if significant changes
        if (changes.impact_level === 'High' || changes.user_action_required) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon.svg',
            title: 'Privacy Policy Change Detected',
            message: `The privacy policy at ${new URL(details.url).hostname} has changed. ${changes.summary}`
          });
        }
      }
    } catch (error) {
      console.debug('Could not extract policy text:', error);
      // This is expected for non-policy pages, so we silently ignore
    }
  } catch (error) {
    console.error('Error checking policy changes:', error);
  }
});
