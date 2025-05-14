import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, RefreshCcw, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { aiSummaryService } from '@/services/AISummaryService';

const AISummariesPage = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadSummaries = async () => {
    try {
      setLoading(true);
      const data = await aiSummaryService.getUserSummaries();
      setSummaries(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load summaries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummaries();
  }, []);

  const handleDelete = async (id) => {
    try {
      await aiSummaryService.deleteSummary(id);
      toast({
        title: "Success",
        description: "Summary deleted successfully",
      });
      loadSummaries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete summary",
        variant: "destructive",
      });
    }
  };

  const filteredSummaries = summaries.filter(summary =>
    summary.website_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-light">AI Summaries</h1>
          <Button
            onClick={loadSummaries}
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
              placeholder="Search summaries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-brand-primary dark:text-brand-light">Loading summaries...</p>
          </div>
        ) : filteredSummaries.length > 0 ? (
          <div className="grid gap-6">
            {filteredSummaries.map((summary) => (
              <motion.div
                key={summary.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-brand-primary dark:text-brand-secondary" />
                        <CardTitle className="text-lg font-heading text-brand-primary dark:text-brand-light">
                          {summary.website_url}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(summary.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription className="text-sm text-brand-dark/60 dark:text-brand-light/60">
                      {new Date(summary.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-brand-dark dark:text-brand-light whitespace-pre-wrap">
                      {summary.summary}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-brand-primary/30 dark:text-brand-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-brand-primary dark:text-brand-light mb-2">
              No summaries found
            </h3>
            <p className="text-brand-dark/60 dark:text-brand-light/60">
              {searchTerm ? "Try adjusting your search terms" : "Start by analyzing a privacy policy"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AISummariesPage;
