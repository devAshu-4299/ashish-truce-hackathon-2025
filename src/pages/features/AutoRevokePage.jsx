import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Calendar, Clock, Plus, Search, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { consentManagementService } from '@/services/ConsentManagementService';

const ruleTemplates = [
  {
    name: 'Time-based',
    description: 'Automatically revoke after a specific time period',
    options: ['1 day', '1 week', '1 month', '3 months', '6 months', '1 year'],
  },
  {
    name: 'Visit-based',
    description: 'Revoke after a number of visits to the website',
    options: ['5 visits', '10 visits', '20 visits', '50 visits'],
  },
  {
    name: 'Inactivity',
    description: 'Revoke after a period of inactivity',
    options: ['30 days', '60 days', '90 days', '180 days'],
  },
];

const AutoRevokePage = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadConsents = async () => {
    try {
      setLoading(true);
      const data = await consentManagementService.getUserConsents();
      setConsents(data || []);
    } catch (error) {
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

  const handleSetRule = async (consentId, ruleType, value) => {
    try {
      let expiryDate;
      const now = new Date();

      // Calculate expiry date based on rule type and value
      switch (ruleType) {
        case 'Time-based':
          switch (value) {
            case '1 day':
              expiryDate = new Date(now.setDate(now.getDate() + 1));
              break;
            case '1 week':
              expiryDate = new Date(now.setDate(now.getDate() + 7));
              break;
            case '1 month':
              expiryDate = new Date(now.setMonth(now.getMonth() + 1));
              break;
            case '3 months':
              expiryDate = new Date(now.setMonth(now.getMonth() + 3));
              break;
            case '6 months':
              expiryDate = new Date(now.setMonth(now.getMonth() + 6));
              break;
            case '1 year':
              expiryDate = new Date(now.setFullYear(now.getFullYear() + 1));
              break;
          }
          break;
        // Other rule types will be implemented based on browser extension tracking
      }

      const rule = {
        type: ruleType,
        value,
        expiryDate: expiryDate?.toISOString(),
      };

      await consentManagementService.setAutoRevokeRule(consentId, rule);
      toast({
        title: "Success",
        description: "Auto-revoke rule set successfully",
      });
      loadConsents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set auto-revoke rule",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRule = async (consentId) => {
    try {
      await consentManagementService.setAutoRevokeRule(consentId, null);
      toast({
        title: "Success",
        description: "Auto-revoke rule removed successfully",
      });
      loadConsents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove auto-revoke rule",
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
          <div>
            <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-light">Auto-Revoke Rules</h1>
            <p className="mt-2 text-brand-dark/60 dark:text-brand-light/60">
              Set up rules to automatically revoke consents based on time or usage patterns
            </p>
          </div>
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
                        <Zap className="h-5 w-5 text-brand-primary dark:text-brand-secondary" />
                        <CardTitle className="text-lg font-heading text-brand-primary dark:text-brand-light">
                          {consent.website_url}
                        </CardTitle>
                      </div>
                      {consent.auto_revoke_rule && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRule(consent.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <CardDescription className="text-sm text-brand-dark/60 dark:text-brand-light/60">
                      {consent.consent_type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ruleTemplates.map((template) => (
                        <div key={template.name} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-brand-primary dark:text-brand-light">
                              {template.name}
                            </h4>
                            <AlertCircle className="h-4 w-4 text-brand-primary/60 dark:text-brand-secondary/60" />
                          </div>
                          <p className="text-sm text-brand-dark/60 dark:text-brand-light/60">
                            {template.description}
                          </p>
                          <Select
                            onValueChange={(value) => handleSetRule(consent.id, template.name, value)}
                            value={
                              consent.auto_revoke_rule?.type === template.name
                                ? consent.auto_revoke_rule.value
                                : undefined
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a rule" />
                            </SelectTrigger>
                            <SelectContent>
                              {template.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  {consent.auto_revoke_rule?.expiryDate && (
                    <CardFooter>
                      <div className="flex items-center gap-2 text-sm text-brand-dark/60 dark:text-brand-light/60">
                        <Clock className="h-4 w-4" />
                        <span>
                          Will be revoked on: {new Date(consent.auto_revoke_rule.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-brand-primary/30 dark:text-brand-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-brand-primary dark:text-brand-light mb-2">
              No consents found
            </h3>
            <p className="text-brand-dark/60 dark:text-brand-light/60">
              {searchTerm ? "Try adjusting your search terms" : "Add some consents to set up auto-revoke rules"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AutoRevokePage;
