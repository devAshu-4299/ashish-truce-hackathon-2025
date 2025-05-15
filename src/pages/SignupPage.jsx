import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a verification link to complete your registration.",
      });
      
      // Optionally redirect to a verification pending page
      navigate('/auth/verify-email');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-primary via-brand-accent/30 to-brand-secondary/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl glassmorphism border-brand-primary/30 dark:border-brand-secondary/40">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <ShieldCheck className="h-16 w-16 text-brand-primary dark:text-brand-secondary" />
            </div>
            <CardTitle className="text-3xl font-bold font-heading text-brand-primary dark:text-brand-light">Create Your Account</CardTitle>
            <CardDescription className="text-brand-dark dark:text-slate-300">
              Join ConsentLens and take control of your digital privacy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-brand-dark dark:text-brand-light flex items-center">
                  <Mail className="mr-2 h-4 w-4" /> Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/80 dark:bg-slate-700/80 border-brand-primary/50 dark:border-brand-secondary/60 focus:ring-brand-accent"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-brand-dark dark:text-brand-light flex items-center">
                  <Lock className="mr-2 h-4 w-4" /> Password
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/80 dark:bg-slate-700/80 border-brand-primary/50 dark:border-brand-secondary/60 focus:ring-brand-accent"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-brand-dark dark:text-brand-light flex items-center">
                  <Lock className="mr-2 h-4 w-4" /> Confirm Password
                </Label>
                <Input 
                  id="confirm-password" 
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/80 dark:bg-slate-700/80 border-brand-primary/50 dark:border-brand-secondary/60 focus:ring-brand-accent"
                  disabled={loading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => navigate('/login')}
              className="w-full text-brand-primary dark:text-brand-secondary"
              disabled={loading}
            >
              Already have an account? Sign in
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupPage;
