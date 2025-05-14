import React from 'react';
import { motion } from 'framer-motion';
import { SearchCheck } from 'lucide-react';

const PolicyAnalyzerPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <SearchCheck className="h-8 w-8 text-brand-primary dark:text-brand-secondary" />
          <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-light">Policy Analyzer</h1>
        </div>
        
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <p className="text-lg text-brand-dark/80 dark:text-brand-light/80">
            Coming soon! AI-powered analysis to flag potential compliance issues in your privacy policies.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PolicyAnalyzerPage;
