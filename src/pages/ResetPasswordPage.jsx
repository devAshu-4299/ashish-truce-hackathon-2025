import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock } from 'lucide-react';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { resetPassword, updatePassword } = useAuth();

  useEffect(() => {
    if (location.hash) {
      setIsResetMode(true);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isResetMode) {
        if (password !== confirmPassword) {
          throw new Error("Passwords don't match");
        }
        const { error } = await updatePassword(password);
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Your password has been successfully updated.",
        });
        navigate('/login');
      } else {
        const { error } = await resetPassword(email);
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        });
      }
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
            <ShieldCheck className="mx-auto h-12 w-12 text-brand-primary dark:text-brand-secondary" />
            <CardTitle className="text-2xl font-bold mt-4 text-brand-primary dark:text-brand-light">
              {isResetMode ? "Set New Password" : "Reset Password"}
            </CardTitle>
            <CardDescription className="text-brand-dark/60 dark:text-brand-light/60">
              {isResetMode 
                ? "Please enter your new password"
                : "Enter your email and we'll send you a reset link"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isResetMode ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-brand-primary/50 dark:text-brand-secondary/50" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-white/80 dark:bg-slate-700/80 border-brand-primary/50 dark:border-brand-secondary/60 focus:ring-brand-accent"
                        required
                        minLength={6}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-brand-primary/50 dark:text-brand-secondary/50" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 bg-white/80 dark:bg-slate-700/80 border-brand-primary/50 dark:border-brand-secondary/60 focus:ring-brand-accent"
                        required
                        minLength={6}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-brand-primary/50 dark:text-brand-secondary/50" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/80 dark:bg-slate-700/80 border-brand-primary/50 dark:border-brand-secondary/60 focus:ring-brand-accent"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : isResetMode
                  ? "Update Password"
                  : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="w-full text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate('/login')}
                className="w-full text-brand-primary/80 dark:text-brand-secondary/80 text-sm"
                disabled={loading}
              >
                Back to Login
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;