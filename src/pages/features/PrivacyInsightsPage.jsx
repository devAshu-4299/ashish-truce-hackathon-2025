import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, Shield, TrendingUp, RefreshCcw, Lock, Unlock, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { privacyService } from '@/services/PrivacyService';

const PrivacyInsightsPage = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await privacyService.getPrivacyInsights();
      setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to load privacy insights.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading || !insights) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
        <p className="mt-4 text-brand-primary dark:text-brand-light">Loading insights...</p>
      </div>
    );
  }

  // Get only the top-level metrics from dataSharing
  const dataSharingMetrics = Object.entries(insights.details.dataSharing).filter(
    ([key]) => typeof insights.details.dataSharing[key] === 'number'
  );

  // Get only the top-level metrics from consentTypes
  const consentTypeMetrics = Object.entries(insights.details.consentTypes).filter(
    ([key]) => typeof insights.details.consentTypes[key] === 'number'
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-brand-primary dark:text-brand-secondary" />
            <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-light">Privacy Insights</h1>
          </div>
          <Button
            onClick={loadInsights}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Overall Score</CardTitle>
              <CardDescription>Your privacy health score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${getScoreColor(insights.overallScore)}`}>
                {insights.overallScore}%
              </div>
              <Progress 
                value={insights.overallScore} 
                className="mt-4"
                indicatorClassName={getProgressColor(insights.overallScore)}
              />
            </CardContent>
          </Card>

          {/* Active Consents */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Consents</CardTitle>
                  <CardDescription>Currently active permissions</CardDescription>
                </div>
                <Lock className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-brand-primary">
                {insights.activeConsents}
              </div>
            </CardContent>
          </Card>

          {/* High Risk Consents */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>High Risk</CardTitle>
                  <CardDescription>Consents requiring attention</CardDescription>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-500">
                {insights.highRiskConsents}
              </div>
            </CardContent>
          </Card>

          {/* Auto-Revoke Rules */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Auto-Revoke</CardTitle>
                  <CardDescription>Active protection rules</CardDescription>
                </div>
                <Shield className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-500">
                {insights.autoRevokeRules}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Actions to improve your privacy</CardDescription>
                </div>
                <Shield className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      <TrendingUp className="h-4 w-4 text-brand-primary dark:text-brand-secondary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-brand-dark dark:text-brand-light">{rec.title}</h4>
                      <p className="text-sm text-brand-dark/60 dark:text-brand-light/60">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risks Summary */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Risk Summary</CardTitle>
                  <CardDescription>Current risk factors</CardDescription>
                </div>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.risks.map((risk, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{risk.description}</span>
                      <span>{risk.count}</span>
                    </div>
                    <Progress 
                      value={risk.count} 
                      className="h-2"
                      indicatorClassName={
                        risk.severity === 'high' ? 'bg-red-500' :
                        risk.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consent Types Distribution */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Consent Distribution</CardTitle>
                  <CardDescription>Types of active consents</CardDescription>
                </div>
                <Unlock className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consentTypeMetrics.map(([type, count]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{type}</span>
                      <span>{count}</span>
                    </div>
                    <Progress 
                      value={(count / insights.activeConsents) * 100}
                      className="h-2"
                      indicatorClassName={
                        type === 'essential' ? 'bg-green-500' :
                        type === 'functional' ? 'bg-blue-500' :
                        type === 'analytics' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing Analysis */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Sharing</CardTitle>
                  <CardDescription>How your data is being used</CardDescription>
                </div>
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataSharingMetrics.map(([type, count]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>{count}</span>
                    </div>
                    <Progress 
                      value={(count / insights.details.dataSharing.total) * 100}
                      className="h-2"
                      indicatorClassName={
                        type === 'thirdParty' ? 'bg-red-500' :
                        type === 'analytics' ? 'bg-yellow-500' :
                        type === 'marketing' ? 'bg-orange-500' :
                        'bg-blue-500'
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyInsightsPage;
