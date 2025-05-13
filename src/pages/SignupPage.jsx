
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
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
    
    // Simulate API call and successful signup
    localStorage.setItem('userToken', `mock_token_for_${email}`);
    localStorage.setItem('userEmail', email);

    toast({
      title: "Signup Successful!",
      description: "Welcome to ConsentLens. Redirecting to your dashboard...",
    });
    navigate('/dashboard');
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
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-brand-secondary to-brand-accent text-white hover:opacity-90 transition-opacity duration-300 shadow-lg py-3 text-base">
                Sign Up
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-brand-dark dark:text-slate-400">
              Already have an account?{' '}
              <Button variant="link" onClick={() => navigate('/')} className="p-0 text-brand-primary dark:text-brand-secondary">
                Log In (Back to Home)
              </Button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupPage;
