import { supabase } from '@/lib/supabase';

class ConsentManagementService {
  async getUserConsents() {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in getUserConsents:', error);
      throw error;
    }
  }

  async toggleConsent(consentId, status) {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .update({ status })
        .eq('id', consentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in toggleConsent:', error);
      throw error;
    }
  }

  async addConsent(websiteUrl, consentType, status = true) {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .insert([
          {
            user_id: (await supabase.auth.getUser()).data.user.id,
            website_url: websiteUrl,
            consent_type: consentType,
            status,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in addConsent:', error);
      throw error;
    }
  }

  async setAutoRevokeRule(consentId, rule) {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .update({
          auto_revoke_rule: rule,
          expiry_date: rule.expiryDate || null,
        })
        .eq('id', consentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in setAutoRevokeRule:', error);
      throw error;
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
      throw error;
    }
  }
}

export const consentManagementService = new ConsentManagementService();
