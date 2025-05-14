import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DatabaseZap, Calendar, Search, Grid, List, Trash2, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { consentManagementService } from '@/services/ConsentManagementService';

const ConsentsPage = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
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

  const handleToggleConsent = async (id, currentStatus) => {
    try {
      await consentManagementService.toggleConsent(id, !currentStatus);
      toast({
        title: "Success",
        description: `Consent ${!currentStatus ? 'enabled' : 'revoked'} successfully`,
      });
      loadConsents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update consent",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await consentManagementService.deleteConsent(id);
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
    consent.website_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consent.consent_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ConsentCard = ({ consent }) => (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <DatabaseZap className="h-5 w-5 text-brand-primary dark:text-brand-secondary" />
            <CardTitle className="text-lg font-heading text-brand-primary dark:text-brand-light">
              {consent.website_url}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(consent.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-sm text-brand-dark/60 dark:text-brand-light/60">
          {consent.consent_type}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-primary/60 dark:text-brand-secondary/60" />
            <span className="text-sm text-brand-dark/60 dark:text-brand-light/60">
              {new Date(consent.created_at).toLocaleDateString()}
            </span>
          </div>
          {consent.expiry_date && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-primary/60 dark:text-brand-secondary/60" />
              <span className="text-sm text-brand-dark/60 dark:text-brand-light/60">
                Expires: {new Date(consent.expiry_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm font-medium text-brand-dark dark:text-brand-light">
          Status
        </span>
        <Switch
          checked={consent.status}
          onCheckedChange={() => handleToggleConsent(consent.id, consent.status)}
        />
      </CardFooter>
    </Card>
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
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
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
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : ''}`}>
            {filteredConsents.map((consent) => (
              <motion.div
                key={consent.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ConsentCard consent={consent} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DatabaseZap className="h-12 w-12 text-brand-primary/30 dark:text-brand-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-brand-primary dark:text-brand-light mb-2">
              No consents found
            </h3>
            <p className="text-brand-dark/60 dark:text-brand-light/60">
              {searchTerm ? "Try adjusting your search terms" : "You haven't given any consents yet"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ConsentsPage;
