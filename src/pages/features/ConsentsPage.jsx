import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Trash2, RefreshCcw, Search, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import ConsentService from '../../services/ConsentService';

const ConsentsPage = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadConsents = async () => {
    try {
      setLoading(true);
      const data = await ConsentService.getUserConsents();
      console.log('Received consents:', data);
      setConsents(data || []);
    } catch (error) {
      console.error('Error loading consents:', error);
      toast({
        title: "Error",
        description: "Failed to load consents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsents();
  }, []);

  const handleToggleConsent = async (id, currentStatus) => {
    try {
      await ConsentService.updateConsent(id, { status: !currentStatus });
      setConsents(consents.map(consent => 
        consent.id === id ? { ...consent, status: !currentStatus } : consent
      ));
      toast({
        title: "Success",
        description: `Consent ${!currentStatus ? 'enabled' : 'revoked'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update consent status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await ConsentService.deleteConsent(id);
      toast({
        title: "Success",
        description: "Consent deleted successfully",
      });
      loadConsents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete consent",
        variant: "destructive",
      });
    }
  };

  const filteredConsents = consents.filter(consent =>
    consent.website_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-light">My Consents</h1>
          <Button
            onClick={loadConsents}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-brand-primary/50 dark:text-brand-secondary/50" />
            <Input
              placeholder="Search consents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-brand-primary dark:text-brand-light">Loading consents...</p>
          </div>
        ) : filteredConsents.length > 0 ? (
          <div className="grid gap-6">
            {filteredConsents.map((consent) => (
              <motion.div
                key={consent.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Shield className={`h-5 w-5 ${consent.status ? 'text-green-500' : 'text-red-500'}`} />
                        <div>
                          <CardTitle className="text-lg font-heading text-brand-primary dark:text-brand-light">
                            {consent.website_url}
                          </CardTitle>
                          <CardDescription className="text-sm text-brand-dark/60 dark:text-brand-light/60">
                            {consent.consent_type}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={consent.status}
                          onCheckedChange={() => handleToggleConsent(consent.id, consent.status)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(consent.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {consent.consent_details && (
                      <div className="space-y-2">
                        <h3 className="font-medium text-brand-dark dark:text-brand-light">Consent Details</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(consent.consent_details).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-sm">
                              <span className="text-brand-dark/80 dark:text-brand-light/80 capitalize">
                                {key.replace('_', ' ')}
                              </span>
                              <span className={value ? 'text-green-500' : 'text-red-500'}>
                                {value ? '✓' : '✗'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {consent.risk_factors && consent.risk_factors.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h3 className="font-medium text-brand-dark dark:text-brand-light">Risk Factors</h3>
                        <div className="flex flex-wrap gap-2">
                          {consent.risk_factors.map((riskFactor, index) => {
                            const severityColors = {
                              high: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                              medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                              low: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                            };
                            
                            const severityIcons = {
                              high: "⚠️",
                              medium: "⚡",
                              low: "ℹ️"
                            };

                            return (
                              <span
                                key={index}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${severityColors[riskFactor.severity]}`}
                                title={`Severity: ${riskFactor.severity.charAt(0).toUpperCase() + riskFactor.severity.slice(1)}`}
                              >
                                <span>{severityIcons[riskFactor.severity]}</span>
                                {riskFactor.risk}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {consent.auto_revoke_rule?.enabled && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-brand-dark/60 dark:text-brand-light/60">
                        <Clock className="h-4 w-4" />
                        <span>Auto-revoke in: {consent.auto_revoke_rule.duration}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-brand-primary/30 dark:text-brand-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-brand-primary dark:text-brand-light mb-2">
              No consents found
            </h3>
            <p className="text-brand-dark/60 dark:text-brand-light/60">
              {searchTerm ? "Try adjusting your search terms" : "Start by visiting websites to manage consents"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ConsentsPage;
