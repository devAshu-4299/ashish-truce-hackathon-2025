import { supabase } from '@/lib/supabase';
import mockData from '@/data/mockAutoRevokeRules.json';

class AutoRevokeService {
  async getRules() {
    try {
      const { data, error } = await supabase
        .from('auto_revoke_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching auto-revoke rules:', error);
      return mockData.rules;
    }
  }

  async addRule(rule) {
    try {
      const { data, error } = await supabase
        .from('auto_revoke_rules')
        .insert([{
          website: rule.website,
          type: rule.type,
          value: rule.value,
          status: rule.status,
          description: rule.description,
          expiry_date: rule.expiry_date,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding auto-revoke rule:', error);
      throw error;
    }
  }

  async deleteRule(ruleId) {
    try {
      const { error } = await supabase
        .from('auto_revoke_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting auto-revoke rule:', error);
      throw error;
    }
  }

  async updateRuleStatus(ruleId, status) {
    try {
      const { data, error } = await supabase
        .from('auto_revoke_rules')
        .update({ status })
        .eq('id', ruleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating auto-revoke rule status:', error);
      throw error;
    }
  }

  async checkAndExecuteRules() {
    try {
      const now = new Date();
      const { data: rules, error } = await supabase
        .from('auto_revoke_rules')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      for (const rule of rules) {
        const expiryDate = new Date(rule.expiry_date);
        if (now >= expiryDate) {
          // Revoke the consent
          await this.revokeConsent(rule);
          // Update rule status to completed
          await this.updateRuleStatus(rule.id, 'completed');
        }
      }
    } catch (error) {
      console.error('Error executing auto-revoke rules:', error);
      throw error;
    }
  }

  async revokeConsent(rule) {
    try {
      // Update consent status in the consents table
      const { error } = await supabase
        .from('user_consents')
        .update({ status: false, revoked_at: new Date().toISOString() })
        .eq('website', rule.website);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error revoking consent:', error);
      throw error;
    }
  }

  // Helper method to calculate expiry date based on rule type and value
  calculateExpiryDate(type, value) {
    const now = new Date();
    
    switch (type) {
      case 'time_based': {
        const [amount, unit] = value.split(' ');
        const multipliers = {
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000,
          months: 30 * 24 * 60 * 60 * 1000,
          year: 365 * 24 * 60 * 60 * 1000
        };
        return new Date(now.getTime() + (parseInt(amount) * multipliers[unit]));
      }
      
      case 'inactivity': {
        const [amount, unit] = value.split(' ');
        // For inactivity, we'll use the same time calculations but track last activity separately
        const multipliers = {
          month: 30 * 24 * 60 * 60 * 1000,
          months: 30 * 24 * 60 * 60 * 1000
        };
        return new Date(now.getTime() + (parseInt(amount) * multipliers[unit]));
      }
      
      case 'scheduled':
        // For scheduled type, the value is already a date string
        return new Date(value);
      
      default:
        throw new Error('Invalid rule type');
    }
  }

  // Helper method to check if a rule needs to be executed
  shouldExecuteRule(rule) {
    const now = new Date();
    const expiryDate = new Date(rule.expiry_date);

    switch (rule.type) {
      case 'time_based':
        return now >= expiryDate;

      case 'inactivity': {
        // Check last activity date from user_activities table
        // This is a placeholder - you'll need to implement activity tracking
        const lastActivity = this.getLastActivity(rule.website);
        const inactivityPeriod = this.calculateExpiryDate(rule.type, rule.value);
        return lastActivity && (now - lastActivity) >= inactivityPeriod;
      }

      case 'scheduled':
        return now >= expiryDate;

      default:
        return false;
    }
  }

  // Placeholder method for getting last activity
  // You'll need to implement this based on your activity tracking system
  async getLastActivity(website) {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('timestamp')
        .eq('website', website)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data ? new Date(data.timestamp) : null;
    } catch (error) {
      console.error('Error getting last activity:', error);
      return null;
    }
  }
}

export const autoRevokeService = new AutoRevokeService();
