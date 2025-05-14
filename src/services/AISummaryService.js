import { supabase } from '@/lib/supabase';

class AISummaryService {
  async summarizePolicy(policyText) {
    try {
      // TODO: Integrate with OpenAI API
      const summary = "Sample summary - OpenAI integration pending";
      
      const { data, error } = await supabase
        .from('ai_summaries')
        .insert([
          {
            user_id: (await supabase.auth.getUser()).data.user.id,
            policy_text: policyText,
            summary,
            website_url: window.location.origin,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in summarizePolicy:', error);
      throw error;
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
      throw error;
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
      throw error;
    }
  }
}

export const aiSummaryService = new AISummaryService();
