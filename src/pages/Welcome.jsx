import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-4">Welcome to Momentum</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Whether you're here to build strength, flexibility, or community — let's get you started with the right membership or login path.
      </p>

      <div className="grid gap-4 w-full max-w-sm">
        <Button className="w-full" onClick={() => navigate('/signup')}>Create Account</Button>
        <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>I Already Have an Account</Button>
        <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => navigate('/demo')}>
          Just Exploring? Try a Demo
        </Button>
      </div>
    </motion.div>
  );
};

export default WelcomePage;
// This code defines a simple welcome page for a fitness application using React and Framer Motion.

