import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

const PrivacyInsightsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="h-8 w-8 text-brand-primary dark:text-brand-secondary" />
          <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-light">Privacy Insights</h1>
        </div>
        
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <p className="text-lg text-brand-dark/80 dark:text-brand-light/80">
            Coming soon! Get instant privacy ratings and detailed insights for websites and apps before you engage with them.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyInsightsPage;
