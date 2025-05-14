import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';

const VerifyEmailPage = () => {
  const navigate = useNavigate();

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
              <Mail className="h-16 w-16 text-brand-primary dark:text-brand-secondary animate-bounce" />
            </div>
            <CardTitle className="text-3xl font-bold font-heading text-brand-primary dark:text-brand-light">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-brand-dark dark:text-slate-300">
              We've sent you a verification link to complete your registration
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-brand-dark/80 dark:text-slate-400">
              Please check your email inbox and click the verification link to activate your account.
              If you don't see the email, please check your spam folder.
            </p>
            <div className="p-4 bg-brand-primary/10 dark:bg-brand-secondary/10 rounded-lg">
              <p className="text-sm text-brand-dark/70 dark:text-slate-400">
                The verification link will expire in 24 hours.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-brand-primary dark:text-brand-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;