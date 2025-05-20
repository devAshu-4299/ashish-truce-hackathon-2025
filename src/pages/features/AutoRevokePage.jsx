import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Calendar, AlertTriangle, Check, Trash2, Plus, RefreshCcw, Copy, Tag } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { autoRevokeService } from '@/services/AutoRevokeService';
import mockData from '@/data/mockAutoRevokeRules.json';

const AutoRevokePage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [selectedRuleType, setSelectedRuleType] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [addMethod, setAddMethod] = useState('manual'); // 'manual' or 'template'
  const { toast } = useToast();

  // Load rules
  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await autoRevokeService.getRules();
      setRules(data || mockData.rules);
    } catch (error) {
      console.error('Error loading rules:', error);
      setRules(mockData.rules);
      toast({
        title: 'Error',
        description: 'Failed to load auto-revoke rules. Showing mock data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  // Add new rule
  const handleAddRule = async () => {
    if (!selectedRuleType || !selectedWebsite) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const newRule = {
      id: Date.now().toString(),
      website: selectedWebsite,
      type: selectedRuleType,
      value: selectedRuleType === 'scheduled' ? scheduledDate : selectedValue,
      created_at: new Date().toISOString(),
      expiry_date: selectedRuleType === 'scheduled' 
        ? scheduledDate 
        : new Date(Date.now() + getMillisecondsFromValue(selectedValue)).toISOString(),
      status: 'active',
      description: generateRuleDescription(selectedRuleType, selectedValue, scheduledDate)
    };

    try {
      await autoRevokeService.addRule(newRule);
      setRules(prev => [...prev, newRule]);
      setIsAddingRule(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Auto-revoke rule added successfully',
      });
    } catch (error) {
      console.error('Error adding rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to add auto-revoke rule',
        variant: 'destructive',
      });
    }
  };

  // Delete rule
  const handleDeleteRule = async (ruleId) => {
    try {
      await autoRevokeService.deleteRule(ruleId);
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      toast({
        title: 'Success',
        description: 'Auto-revoke rule deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete auto-revoke rule',
        variant: 'destructive',
      });
    }
  };

  // Load template data
  const handleTemplateSelect = (templateId) => {
    const template = mockData.templates.find(t => t.id === templateId);
    if (template) {
      setSelectedRuleType(template.type);
      setSelectedValue(template.value || '');
      setSelectedTemplate(template);
      
      // For scheduled templates, set default date to 3 months from now
      if (template.type === 'scheduled') {
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 3);
        setScheduledDate(defaultDate.toISOString().slice(0, 16));
      }
    }
  };

  // Helper functions
  const getMillisecondsFromValue = (value) => {
    const [amount, unit] = value.split(' ');
    const amounts = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      months: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000
    };
    return parseInt(amount) * amounts[unit];
  };

  const generateRuleDescription = (type, value, date) => {
    switch (type) {
      case 'time_based':
        return `Automatically revoke after ${value}`;
      case 'inactivity':
        return `Revoke after ${value} of inactivity`;
      case 'scheduled':
        return `Scheduled revocation on ${new Date(date).toLocaleDateString()}`;
      default:
        return '';
    }
  };

  // Reset form with template option
  const resetForm = () => {
    setSelectedRuleType('');
    setSelectedValue('');
    setSelectedWebsite('');
    setScheduledDate('');
    setSelectedTemplate(null);
    setAddMethod('manual');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
        <p className="mt-4 text-brand-primary dark:text-brand-light">Loading auto-revoke rules...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-brand-primary dark:text-brand-secondary" />
            <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-light">Auto-Revoke Rules</h1>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadRules}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => setIsAddingRule(true)}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Rule
            </Button>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((rule) => (
            <Card key={rule.id} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">
                    {rule.website}
                  </CardTitle>
                  <CardDescription>
                    {rule.type === 'time_based' && <Clock className="h-4 w-4 inline mr-1" />}
                    {rule.type === 'inactivity' && <Zap className="h-4 w-4 inline mr-1" />}
                    {rule.type === 'scheduled' && <Calendar className="h-4 w-4 inline mr-1" />}
                    {rule.description}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Status</span>
                    <span className={`font-medium ${
                      rule.status === 'active' ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                      {rule.status === 'active' ? (
                        <Check className="h-4 w-4 inline mr-1" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                      )}
                      {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Expiry</span>
                    <span className="font-medium">
                      {new Date(rule.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Rule Dialog */}
        <Dialog open={isAddingRule} onOpenChange={setIsAddingRule}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Auto-Revoke Rule</DialogTitle>
              <DialogDescription>
                Create a new rule to automatically revoke consent based on time, inactivity, or schedule.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={addMethod} onValueChange={setAddMethod} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Setup</TabsTrigger>
                <TabsTrigger value="template">Use Template</TabsTrigger>
              </TabsList>

              <TabsContent value="manual">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      placeholder="Enter website URL"
                      value={selectedWebsite}
                      onChange={(e) => setSelectedWebsite(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rule Type</label>
                    <Select value={selectedRuleType} onValueChange={setSelectedRuleType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rule type" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockData.ruleTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRuleType && selectedRuleType !== 'scheduled' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duration</label>
                      <Select value={selectedValue} onValueChange={setSelectedValue}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockData.ruleTypes
                            .find(type => type.id === selectedRuleType)
                            ?.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedRuleType === 'scheduled' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Scheduled Date</label>
                      <Input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="template">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      placeholder="Enter website URL"
                      value={selectedWebsite}
                      onChange={(e) => setSelectedWebsite(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Template</label>
                    <Select onValueChange={handleTemplateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockData.templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex flex-col">
                              <span>{template.name}</span>
                              <span className="text-xs text-slate-500">{template.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate && (
                    <div className="rounded-lg border p-4 space-y-3">
                      <h4 className="font-medium">{selectedTemplate.name}</h4>
                      <p className="text-sm text-slate-500">{selectedTemplate.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {selectedTemplate.type === 'scheduled' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Scheduled Date</label>
                          <Input
                            type="datetime-local"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddingRule(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddRule}>Add Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default AutoRevokePage;
