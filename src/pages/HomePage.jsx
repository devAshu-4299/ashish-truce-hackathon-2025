
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Eye, Zap, Users, BarChart3, AlertTriangle, ShieldAlert, FileText, DatabaseZap, SearchCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow duration-300 border-brand-primary/20 dark:border-brand-secondary/30">
      <CardHeader className="items-center text-center">
        <div className="p-3 rounded-full bg-gradient-to-br from-brand-secondary to-brand-accent mb-4 inline-block">
          {React.cloneElement(icon, { className: "h-8 w-8 text-white" })}
        </div>
        <CardTitle className="text-xl font-heading text-brand-primary dark:text-brand-light">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center text-brand-dark dark:text-slate-300">{description}</CardDescription>
      </CardContent>
    </Card>
  </motion.div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-20 md:py-32 bg-gradient-to-br from-brand-primary via-brand-accent/60 to-brand-secondary text-white relative"
      >
        <div className="absolute inset-0 opacity-10">
          {/* Decorative pattern or subtle image could go here */}
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 100 }}
            className="text-5xl md:text-7xl font-extrabold font-heading mb-6"
          >
            Consent<span className="text-brand-secondary brightness-125">Lens</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-slate-200"
          >
            AI-Powered Privacy & Consent Tracker. Understand and manage your digital consent with clarity and confidence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button onClick={scrollToFeatures} size="lg" className="bg-white text-brand-primary hover:bg-slate-100 dark:bg-brand-secondary dark:text-white dark:hover:bg-brand-secondary/90 text-lg px-10 py-7 shadow-2xl transform hover:scale-105 transition-transform duration-300 animate-subtle-pulse">
              Explore Features
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* The Problem Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="py-16 md:py-24 bg-brand-light dark:bg-brand-dark"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 text-brand-primary dark:text-brand-light">
                The <span className="gradient-text">Digital Dilemma</span>
              </h2>
              <p className="text-lg text-brand-dark dark:text-slate-300 mb-4">
                Most users blindly accept cookie banners, terms of service, and app permissions without reading or understanding them. This creates a landscape of uncertainty and risk.
              </p>
              <ul className="space-y-3 text-brand-dark dark:text-slate-300">
                <li className="flex items-start">
                  <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                  <span><span className="font-semibold">Legal Risk:</span> Navigating GDPR, CCPA, and other regulations becomes a minefield without proper consent.</span>
                </li>
                <li className="flex items-start">
                  <Users className="h-6 w-6 text-orange-500 mr-3 mt-1 flex-shrink-0" />
                  <span><span className="font-semibold">Eroded Trust:</span> Lack of transparency diminishes user trust and awareness about data sharing.</span>
                </li>
                <li className="flex items-start">
                  <Eye className="h-6 w-6 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                  <span><span className="font-semibold">No Overview:</span> Users lack a consolidated view of what data they've shared or consented to.</span>
                </li>
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-brand-secondary to-brand-accent rounded-lg blur opacity-20"></div>
              <img  class="rounded-lg shadow-2xl relative z-10 w-full h-auto object-cover" alt="Confused user looking at complex legal document" src="https://images.unsplash.com/photo-1586856635275-af01918579ba" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* The Solution Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="py-16 md:py-24 bg-slate-50 dark:bg-slate-800/50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative order-last md:order-first"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-brand-primary to-brand-accent rounded-lg blur opacity-20 "></div>
              <img  class="rounded-lg shadow-2xl relative z-10 w-full h-auto object-cover" alt="ConsentLens dashboard showing clear privacy information" src="https://images.unsplash.com/photo-1690264460165-0ff5e1063d86" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="order-first md:order-last"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 text-brand-primary dark:text-brand-light">
                Introducing <span className="gradient-text">ConsentLens</span>
              </h2>
              <p className="text-lg text-brand-dark dark:text-slate-300 mb-4">
                ConsentLens leverages cutting-edge AI to monitor and manage digital consent. We provide clear summaries, secure storage, and powerful tools for both users and organizations.
              </p>
              <p className="text-lg text-brand-dark dark:text-slate-300">
                Our mission is to bring transparency to the digital world, ensure compliance with global data protection regulations, and rebuild user trust online.
              </p>
              <Button onClick={scrollToFeatures} size="lg" className="mt-8 bg-gradient-to-r from-brand-secondary to-brand-accent text-white hover:opacity-90 transition-opacity duration-300 shadow-lg">
                Learn How It Works
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Key Features Section */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="py-16 md:py-24 bg-brand-light dark:bg-brand-dark"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-6 text-brand-primary dark:text-brand-light">
            Empowering <span className="gradient-text">Users & Organizations</span>
          </h2>
          <p className="text-lg text-center text-brand-dark dark:text-slate-300 mb-12 max-w-2xl mx-auto">
            ConsentLens offers a suite of powerful features tailored to the unique needs of individuals and businesses.
          </p>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <motion.div variants={sectionVariants}>
              <h3 className="text-2xl font-semibold font-heading mb-8 text-center text-brand-primary dark:text-brand-light">For Users</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <FeatureCard icon={<FileText />} title="AI Summaries" description="Understand complex cookie banners and privacy policies with easy-to-read AI-generated summaries." delay={0.1} />
                <FeatureCard icon={<DatabaseZap />} title="Unified Dashboard" description="Manage all your consents from a single, intuitive dashboard." delay={0.2} />
                <FeatureCard icon={<Zap />} title="Auto-Revoke Engine" description="Effortlessly withdraw consent from services you no longer use or trust." delay={0.3} />
                <FeatureCard icon={<BarChart3 />} title="Privacy Score" description="Get an instant privacy rating for websites and apps before you engage." delay={0.4} />
              </div>
            </motion.div>
            <motion.div variants={sectionVariants}>
              <h3 className="text-2xl font-semibold font-heading mb-8 text-center text-brand-primary dark:text-brand-light">For Organizations</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <FeatureCard icon={<DatabaseZap />} title="Consent Repository" description="Maintain a secure and auditable record of user consents for compliance." delay={0.5} />
                <FeatureCard icon={<FileText />} title="Audit Export Tools" description="Easily export consent data for internal reviews or regulatory audits." delay={0.6} />
                <FeatureCard icon={<SearchCheck />} title="Policy Analyzer" description="AI-powered analysis to flag potential compliance issues in your privacy policies." delay={0.7} />
                <FeatureCard icon={<ShieldAlert />} title="Consent Drift Detection" description="Receive alerts when consent practices deviate from established policies or user expectations." delay={0.8} />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={sectionVariants}
        className="py-20 md:py-32 bg-gradient-to-tr from-brand-accent via-brand-primary to-brand-secondary"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">
            Ready to Take Control of Digital Consent?
          </h2>
          <p className="text-xl text-slate-200 mb-10 max-w-2xl mx-auto">
            Join ConsentLens today and experience a new era of privacy management and compliance.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={() => navigate('/signup')} size="lg" className="bg-white text-brand-primary hover:bg-slate-100 dark:bg-brand-secondary dark:text-white dark:hover:bg-brand-secondary/90 text-lg px-12 py-8 shadow-2xl">
              Sign Up for Early Access
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
