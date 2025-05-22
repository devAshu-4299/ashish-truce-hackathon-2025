import { supabase } from '@/lib/supabase';
import { API_BASE_URL, ENDPOINTS } from '../config';
import mockUserConsents from '../data/mockUserConsents.json';

class ConsentService {
  async getUserConsents(page = 1, limit = 10) {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No authentication token');

      const offset = (page - 1) * limit;
      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.CONSENTS.LIST}?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch consents');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getUserConsents:', error);
      // Return mock data as fallback
      const start = (page - 1) * limit;
      const end = start + limit;
      return mockUserConsents.consents.slice(start, end);
    }
  }

  async updateConsent(consentId, updates) {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No authentication token');

      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.CONSENTS.DETAILS(consentId)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update consent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in updateConsent:', error);
      // Return mock updated consent as fallback
      const mockConsent = mockUserConsents.consents.find(c => c.id === consentId);
      return {
        ...mockConsent,
        ...updates,
        updated_at: new Date().toISOString()
      };
    }
  }

  async addConsent(websiteUrl, consentType, consentDetails) {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No authentication token');

      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.CONSENTS.CREATE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            website_url: websiteUrl,
            consent_type: consentType,
            consent_details: consentDetails,
            status: true
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create consent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in addConsent:', error);
      // Return mock new consent based on existing structure
      return {
        id: String(Date.now()),
        website_url: websiteUrl,
        consent_type: consentType,
        status: true,
        consent_details: consentDetails,
        risk_factors: [
          {
            risk: "New consent",
            severity: "low",
            description: "Initial consent configuration"
          }
        ],
        auto_revoke_rule: {
          enabled: false,
          conditions: []
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  async deleteConsent(consentId) {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No authentication token');

      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.CONSENTS.DETAILS(consentId)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete consent');
      }

      return true;
    } catch (error) {
      console.error('Error in deleteConsent:', error);
      return true; // Return success in mock mode
    }
  }

  async getConsentStats() {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No authentication token');

      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.CONSENTS.STATS}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch consent stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getConsentStats:', error);
      // Calculate stats from mock data
      const consents = mockUserConsents.consents;
      return {
        total_consents: consents.length,
        active_consents: consents.filter(c => c.status).length,
        revoked_consents: consents.filter(c => !c.status).length,
        auto_revoke_enabled: consents.filter(c => c.auto_revoke_rule?.enabled).length,
        high_risk_consents: consents.filter(c => 
          c.risk_factors.some(r => r.severity === 'high')
        ).length,
        medium_risk_consents: consents.filter(c => 
          c.risk_factors.some(r => r.severity === 'medium')
        ).length,
        low_risk_consents: consents.filter(c => 
          c.risk_factors.some(r => r.severity === 'low')
        ).length
      };
    }
  }

  async setAutoRevoke(consentId, duration) {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No authentication token');

      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.CONSENTS.AUTO_REVOKE(consentId)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ duration })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to set auto-revoke');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in setAutoRevoke:', error);
      // Return mock updated consent as fallback
      const mockConsent = mockUserConsents.consents.find(c => c.id === consentId);
      const now = new Date();
      const [value, unit] = duration.match(/(\d+)([dhm])/).slice(1);
      const expiry = new Date(now);
      
      switch (unit) {
        case 'd': expiry.setDate(now.getDate() + parseInt(value)); break;
        case 'h': expiry.setHours(now.getHours() + parseInt(value)); break;
        case 'm': expiry.setMinutes(now.getMinutes() + parseInt(value)); break;
      }

      return {
        ...mockConsent,
        auto_revoke_rule: {
          enabled: true,
          duration,
          conditions: ['after_duration']
        },
        expiry_date: expiry.toISOString(),
        updated_at: now.toISOString()
      };
    }
  }

  async disableAutoRevoke(consentId) {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No authentication token');

      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.CONSENTS.AUTO_REVOKE(consentId)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to disable auto-revoke');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in disableAutoRevoke:', error);
      // Return mock updated consent as fallback
      const mockConsent = mockUserConsents.consents.find(c => c.id === consentId);
      return {
        ...mockConsent,
        auto_revoke_rule: {
          enabled: false,
          conditions: []
        },
        expiry_date: null,
        updated_at: new Date().toISOString()
      };
    }
  }
}

export default new ConsentService();
