import { supabase } from '@/lib/supabase';

class PrivacyScoreService {
  async calculateScore(websiteUrl) {
    // This is a placeholder scoring algorithm
    // In a real implementation, this would analyze various privacy factors
    const factors = {
      dataCollection: Math.floor(Math.random() * 100),
      dataSharing: Math.floor(Math.random() * 100),
      userControl: Math.floor(Math.random() * 100),
      transparency: Math.floor(Math.random() * 100),
    };

    const score = Math.floor(
      Object.values(factors).reduce((acc, val) => acc + val, 0) / 4
    );

    return { score, factors };
  }

  async updatePrivacyScore(websiteUrl) {
    try {
      const { score, factors } = await this.calculateScore(websiteUrl);
      
      const { data, error } = await supabase
        .from('privacy_scores')
        .insert([
          {
            user_id: (await supabase.auth.getUser()).data.user.id,
            website_url: websiteUrl,
            score,
            factors,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in updatePrivacyScore:', error);
      throw error;
    }
  }

  async getUserScores() {
    try {
      const { data, error } = await supabase
        .from('privacy_scores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in getUserScores:', error);
      throw error;
    }
  }

  async getScoreTrends() {
    try {
      const { data, error } = await supabase
        .from('privacy_scores')
        .select('score, created_at')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group scores by month for trend analysis
      const trends = data.reduce((acc, { score, created_at }) => {
        const month = new Date(created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = { total: 0, count: 0 };
        }
        acc[month].total += score;
        acc[month].count += 1;
        return acc;
      }, {});

      return Object.entries(trends).map(([month, { total, count }]) => ({
        month,
        averageScore: Math.round(total / count),
      }));
    } catch (error) {
      console.error('Error in getScoreTrends:', error);
      throw error;
    }
  }

  async getPrivacyRecommendations(score) {
    // Placeholder recommendations based on privacy score
    if (score >= 80) {
      return ['Consider enabling two-factor authentication', 'Regularly review third-party access'];
    } else if (score >= 60) {
      return [
        'Review your privacy settings',
        'Consider limiting data sharing',
        'Enable additional security features',
      ];
    } else {
      return [
        'Update your privacy settings immediately',
        'Limit data collection permissions',
        'Enable all available security features',
        'Consider using privacy-focused alternatives',
      ];
    }
  }
}

export const privacyScoreService = new PrivacyScoreService();
