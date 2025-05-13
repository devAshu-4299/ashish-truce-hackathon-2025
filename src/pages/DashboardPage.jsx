
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FileText, DatabaseZap, Zap, BarChart3, ShieldCheck, Users, Settings, HelpCircle } from 'lucide-react';

const DashboardCard = ({ icon, title, description, delay = 0, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="h-full"
  >
    <Card className="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow duration-300 border-brand-primary/20 dark:border-brand-secondary/30">
      <CardHeader className="items-center text-center pb-4">
        <div className="p-3 rounded-full bg-gradient-to-br from-brand-secondary to-brand-accent mb-3 inline-block">
          {React.cloneElement(icon, { className: "h-8 w-8 text-white" })}
        </div>
        <CardTitle className="text-xl font-heading text-brand-primary dark:text-brand-light">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <CardDescription className="text-brand-dark dark:text-slate-300 mb-4">{description}</CardDescription>
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

const DashboardPage = () => {
  const userEmail = localStorage.getItem('userEmail') || 'User';

  const userFeatures = [
    { icon: <FileText />, title: "AI Summaries", description: "View simplified summaries of privacy policies you've encountered." },
    { icon: <DatabaseZap />, title: "My Consents", description: "Manage all your tracked consents in one place." },
    { icon: <Zap />, title: "Auto-Revoke", description: "Set up rules to automatically revoke consents." },
    { icon: <BarChart3 />, title: "Privacy Insights", description: "Check your overall privacy score and trends." },
  ];

  const orgFeatures = [
    { icon: <DatabaseZap />, title: "Consent Repository", description: "Access and manage your organization's consent records." },
    { icon: <FileText />, title: "Audit Trails", description: "Export audit logs for compliance reporting." },
    { icon: <ShieldCheck />, title: "Policy Analyzer", description: "Analyze your policies for compliance gaps." },
    { icon: <Users />, title: "User Management", description: "Manage team access and roles (Admin)." },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold font-heading mb-4 text-brand-primary dark:text-brand-light">
          Welcome to your Dashboard, <span className="gradient-text">{userEmail.split('@')[0]}</span>!
        </h1>
        <p className="text-lg text-brand-dark dark:text-slate-300 mb-10">
          Here's an overview of your ConsentLens activity and tools.
        </p>
      </motion.div>

      <motion.section 
        className="mb-12"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 }}}}
      >
        <h2 className="text-2xl font-semibold font-heading mb-6 text-brand-primary dark:text-brand-light">For You</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userFeatures.map((feature, index) => (
            <DashboardCard key={index} icon={feature.icon} title={feature.title} description={feature.description} delay={index * 0.1}>
              {/* Placeholder for future actions */}
            </DashboardCard>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 }}}}
      >
        <h2 className="text-2xl font-semibold font-heading mb-6 text-brand-primary dark:text-brand-light">For Organizations (Coming Soon)</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {orgFeatures.map((feature, index) => (
            <DashboardCard key={index} icon={feature.icon} title={feature.title} description={feature.description} delay={(userFeatures.length + index) * 0.1}>
               {/* Placeholder for future actions */}
            </DashboardCard>
          ))}
        </div>
      </motion.section>
      
      <motion.section 
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: (userFeatures.length + orgFeatures.length) * 0.1 + 0.2 }}
      >
         <h2 className="text-2xl font-semibold font-heading mb-6 text-brand-primary dark:text-brand-light">Account</h2>
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard icon={<Settings />} title="Settings" description="Manage your account preferences and notification settings." delay={0}>
            </DashboardCard>
            <DashboardCard icon={<HelpCircle />} title="Help & Support" description="Find answers to your questions or contact support." delay={0.1}>
            </DashboardCard>
         </div>
      </motion.section>

    </div>
  );
};

export default DashboardPage;
