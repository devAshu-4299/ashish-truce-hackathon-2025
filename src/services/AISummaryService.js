import { supabase } from '@/lib/supabase';
import { API_BASE_URL, ENDPOINTS } from '../config';

class AISummaryService {
  async summarizePolicy(websiteUrl, policyText) {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AI_SUMMARIES.ANALYZE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          website_url: websiteUrl,
          policy_text: policyText
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze policy');
      }

      const data = await response.json();
      return {
        ...data,
        status: data.summary.status,
        quick_summary: data.summary.quick_summary
      };
    } catch (error) {
      console.error('Error in summarizePolicy:', error);
      throw error;
    }
  }

  async getUserSummaries(page = 1, limit = 10) {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No authentication token');

      const offset = (page - 1) * limit;
      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.AI_SUMMARIES.LIST}?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch summaries');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getUserSummaries:', error);
      throw error;
    }
  }

  async getSummary(summaryId) {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No authentication token');

      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.AI_SUMMARIES.DETAILS(summaryId)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getSummary:', error);
      throw error;
    }
  }

  async deleteSummary(summaryId) {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No authentication token');

      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.AI_SUMMARIES.DETAILS(summaryId)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete summary');
      }

      return true;
    } catch (error) {
      console.error('Error in deleteSummary:', error);
      throw error;
    }
  }

  async compareVersions(oldPolicyText, newPolicyText, websiteUrl) {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No authentication token');

      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.AI_SUMMARIES.COMPARE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            old_policy_text: oldPolicyText,
            new_policy_text: newPolicyText,
            website_url: websiteUrl
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to compare policies');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in compareVersions:', error);
      throw error;
    }
  }

  async pollSummaryStatus(summaryId, interval = 2000, maxAttempts = 30) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const checkStatus = async () => {
        try {
          const summary = await this.getSummary(summaryId);
          
          if (summary.summary.status === 'completed') {
            resolve(summary);
            return;
          }
          
          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error('Analysis timed out'));
            return;
          }
          
          setTimeout(checkStatus, interval);
        } catch (error) {
          reject(error);
        }
      };
      
      checkStatus();
    });
  }
}

export default new AISummaryService();
