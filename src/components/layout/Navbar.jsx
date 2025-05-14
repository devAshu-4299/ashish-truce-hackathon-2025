import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, DatabaseZap, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const handleGetStarted = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/signup');
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const homeFeaturesSection = document.getElementById('features');
        if (homeFeaturesSection) {
          homeFeaturesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <ShieldCheck className="h-10 w-10 text-brand-primary dark:text-brand-secondary" />
            <span className="font-heading text-3xl font-bold text-brand-primary dark:text-brand-light">
              Consent<span className="text-brand-secondary dark:text-brand-accent">Lens</span>
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={scrollToFeatures} className="text-brand-dark dark:text-brand-light hover:bg-brand-primary/10 dark:hover:bg-brand-secondary/20">
              Features
            </Button>
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-brand-dark dark:text-brand-light hover:bg-brand-primary/10 dark:hover:bg-brand-secondary/20">
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => navigate('/consents')} className="text-brand-dark dark:text-brand-light hover:bg-brand-primary/10 dark:hover:bg-brand-secondary/20">
                  <DatabaseZap className="mr-2 h-4 w-4" /> My Consents
                </Button>
                <Button variant="ghost" onClick={() => navigate('/auto-revoke')} className="text-brand-dark dark:text-brand-light hover:bg-brand-primary/10 dark:hover:bg-brand-secondary/20">
                  <Zap className="mr-2 h-4 w-4" /> Auto-Revoke
                </Button>
                <Button onClick={handleLogout} className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:opacity-90 transition-opacity duration-300 shadow-lg">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <Button onClick={handleGetStarted} className="bg-gradient-to-r from-brand-secondary to-brand-accent text-white hover:opacity-90 transition-opacity duration-300 shadow-lg">
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
