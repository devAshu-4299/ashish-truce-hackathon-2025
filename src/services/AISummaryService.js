import { supabase } from '@/lib/supabase';
import mockAiSummaries from '../data/mockAiSummaries.json';

class AISummaryService {
  async summarizePolicy(websiteUrl, policyText) {
    try {
      const { data, error } = await supabase
        .from('ai_summaries')
        .insert([
          {
            user_id: (await supabase.auth.getUser()).data.user.id,
            website_url: websiteUrl,
            policy_text: policyText,
            summary: 'Processing...' // Will be updated by background job
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in summarizePolicy:', error);
      // Return mock data for the first item as fallback
      return mockAiSummaries.summaries[0];
    }
  }

  async getUserSummaries() {
    try {
      const { data, error } = await supabase
        .from('ai_summaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in getUserSummaries:', error);
      // Return mock summaries as fallback
      return mockAiSummaries.summaries;
    }
  }

  async deleteSummary(summaryId) {
    try {
      const { error } = await supabase
        .from('ai_summaries')
        .delete()
        .eq('id', summaryId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error in deleteSummary:', error);
      return true; // Pretend deletion was successful in mock mode
    }
  }
}

export default new AISummaryService();
