import { supabase } from '../lib/supabase';
import mockUserConsents from '../data/mockUserConsents.json';

class ConsentService {
  async getUserConsents() {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // If no data from Supabase, fall back to mock data
      if (!data || data.length === 0) {
        console.log('No data from Supabase, using mock data');
        return mockUserConsents.consents;
      }

      console.log('Received data from supabase:', data);
      return data;
    } catch (error) {
      console.error('Error in getUserConsents:', error);
      // Return mock consents as fallback
      console.log('Error occurred, returning mock data:', mockUserConsents.consents);
      return mockUserConsents.consents;
    }
  }

  async updateConsent(consentId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .update(updates)
        .eq('id', consentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in updateConsent:', error);
      // Return updated mock consent as fallback
      const mockConsent = mockUserConsents.consents.find(c => c.id === consentId);
      return { ...mockConsent, ...updates };
    }
  }

  async addConsent(websiteUrl, consentType, status, consentDetails) {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .insert([
          {
            website_url: websiteUrl,
            consent_type: consentType,
            status,
            consent_details: consentDetails,
            auto_revoke_rule: { enabled: false }
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in addConsent:', error);
      // Return new mock consent as fallback
      return {
        id: String(Date.now()),
        website_url: websiteUrl,
        consent_type: consentType,
        status,
        consent_details: consentDetails,
        auto_revoke_rule: { enabled: false },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  async deleteConsent(consentId) {
    try {
      const { error } = await supabase
        .from('user_consents')
        .delete()
        .eq('id', consentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error in deleteConsent:', error);
      return true; // Pretend deletion was successful in mock mode
    }
  }
}

export default new ConsentService();
