import { supabase } from '@/lib/supabase';
import mockData from '@/data/mockPrivacyInsights.json';

class PrivacyService {
  async getPrivacyInsights() {
    try {
      // Fetch real data from Supabase
      const { data: consents, error: consentsError } = await supabase
        .from('user_consents')
        .select('*');

      if (consentsError) throw consentsError;

      if (!consents || consents.length === 0) {
        console.log('No real data found, using mock data');
        return mockData.insights;
      }

      // Calculate insights from real data
      const insights = await this.calculateInsights(consents);
      return insights;

    } catch (error) {
      console.error('Error in getPrivacyInsights:', error);
      // Return mock data as fallback
      return mockData.insights;
    }
  }

  async calculateInsights(consents) {
    if (!consents || consents.length === 0) {
      return mockData.insights;
    }

    // Calculate basic metrics
    const activeConsents = consents.filter(c => c.status).length;
    const highRiskConsents = consents.filter(c => 
      c.risk_factors?.some(r => r.severity === 'high')
    ).length;
    const autoRevokeRules = consents.filter(c => c.auto_revoke_rule?.enabled).length;

    // Calculate overall score
    const overallScore = Math.round(this.calculatePrivacyScore(consents));

    // Analyze risks
    const risks = this.analyzeRisks(consents);

    // Generate recommendations
    const recommendations = this.generateRecommendations(consents, risks);

    // Calculate detailed metrics
    const details = await this.calculateDetails(consents);

    return {
      overallScore,
      activeConsents,
      highRiskConsents,
      autoRevokeRules,
      risks,
      recommendations,
      details
    };
  }

  calculatePrivacyScore(consents) {
    if (!consents?.length) return 0;

    const factors = {
      highRiskWeight: 0.4,
      mediumRiskWeight: 0.3,
      lowRiskWeight: 0.2,
      autoRevokeWeight: 0.1
    };

    const highRiskCount = consents.filter(c => 
      c.risk_factors?.some(r => r.severity === 'high')
    ).length;

    const mediumRiskCount = consents.filter(c => 
      c.risk_factors?.some(r => r.severity === 'medium')
    ).length;

    const lowRiskCount = consents.filter(c => 
      c.risk_factors?.some(r => r.severity === 'low')
    ).length;

    const autoRevokeCount = consents.filter(c => 
      c.auto_revoke_rule?.enabled
    ).length;

    const totalScore = 100 - (
      (highRiskCount * factors.highRiskWeight * 100 / consents.length) +
      (mediumRiskCount * factors.mediumRiskWeight * 100 / consents.length) +
      (lowRiskCount * factors.lowRiskWeight * 100 / consents.length)
    ) + (autoRevokeCount * factors.autoRevokeWeight * 100 / consents.length);

    return Math.max(0, Math.min(100, totalScore));
  }

  analyzeRisks(consents) {
    if (!consents?.length) {
      return mockData.insights.risks;
    }

    const riskGroups = {};
    
    consents.forEach(consent => {
      consent.risk_factors?.forEach(risk => {
        if (!riskGroups[risk.description]) {
          riskGroups[risk.description] = {
            severity: risk.severity,
            description: risk.description,
            count: 0,
            details: risk.details
          };
        }
        riskGroups[risk.description].count++;
      });
    });

    return Object.values(riskGroups);
  }

  generateRecommendations(consents, risks) {
    if (!consents?.length) {
      return mockData.insights.recommendations;
    }

    const recommendations = [];

    // High-risk recommendations
    const highRisks = risks.filter(r => r.severity === 'high');
    if (highRisks.length > 0) {
      recommendations.push({
        title: 'Review High-Risk Consents',
        description: `You have ${highRisks.length} high-risk consents that need attention`,
        priority: 'high',
        actionType: 'review'
      });
    }

    // Auto-revoke recommendations
    const noAutoRevoke = consents.filter(c => !c.auto_revoke_rule?.enabled).length;
    if (noAutoRevoke > 0) {
      recommendations.push({
        title: 'Enable Auto-Revoke',
        description: `Set up auto-revoke rules for ${noAutoRevoke} consents`,
        priority: 'medium',
        actionType: 'configure'
      });
    }

    return recommendations.length > 0 ? recommendations : mockData.insights.recommendations;
  }

  async calculateDetails(consents) {
    if (!consents?.length) {
      return mockData.insights.details;
    }

    // Calculate data sharing metrics
    const dataSharing = {
      total: consents.length,
      thirdParty: consents.filter(c => c.sharing_type === 'third_party').length,
      analytics: consents.filter(c => c.sharing_type === 'analytics').length,
      marketing: consents.filter(c => c.sharing_type === 'marketing').length
    };

    // Calculate consent types
    const consentTypes = {
      essential: consents.filter(c => c.type === 'essential').length,
      functional: consents.filter(c => c.type === 'functional').length,
      analytics: consents.filter(c => c.type === 'analytics').length,
      marketing: consents.filter(c => c.type === 'marketing').length
    };

    // Calculate auto-revoke status
    const autoRevokeStatus = {
      enabled: consents.filter(c => c.auto_revoke_rule?.enabled).length,
      pending: consents.filter(c => c.auto_revoke_rule?.status === 'pending').length,
      total: consents.length
    };

    const details = {
      dataSharing,
      consentTypes,
      autoRevokeStatus
    };

    // If no real data is available, use mock data
    if (Object.values(dataSharing).every(v => v === 0) &&
        Object.values(consentTypes).every(v => v === 0)) {
      return mockData.insights.details;
    }

    return details;
  }
}

export const privacyService = new PrivacyService();
