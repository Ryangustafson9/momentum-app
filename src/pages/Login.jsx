import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getGymName, getGymLogo, getGymColors } from '@/helpers/gymBranding.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gymLogoError, setGymLogoError] = useState(false);
  const [momentumLogoError, setMomentumLogoError] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = await login(email, password);

      if (!user) {
        toast({
          title: "Account not found",
          description: "Please check your credentials or create an account.",
          variant: "destructive",
        });
        return;
      }

      if (user.role === 'member') {
        navigate('/dashboard');
      } else if (user.role === 'staff') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const gymColors = getGymColors();
  const gymLogo = getGymLogo();
  const gymName = getGymName();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl w-full max-w-md flex flex-col" // min-h-[540px] - temporarily disabled due to layout issues
      >
        {/* Gym (Customer) Logo at the Top */}
        <div className="text-center mb-1.5">
          {gymLogo ? (
            <img
              src={gymLogo}
              alt={`${gymName} Logo`}
              className="h-12 w-auto mx-auto mb-2 object-contain"
              onLoad={() => console.log('Gym logo loaded')}
              onError={() => setGymLogoError(true)}
            />
          ) : (
            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg">
              <span className="text-white font-bold text-xl">
                {gymName.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Nordic Fitness</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => toast({
                  title: "Not implemented",
                  description: "Password recovery will be added soon.",
                })}
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="-mt-6">
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => navigate('/signup')}
            >
              Create Account
            </Button>
          </div>
        </form>

        {/* Footer: Powered by Momentum - At Bottom of Card */}
        <div className="mt-auto pt-8 text-center flex flex-col items-center justify-center border-t border-gray-200">
          <span className="text-xs text-black mb-1">Powered by</span>
          {!momentumLogoError ? (
            <img
              src={`${import.meta.env.BASE_URL}assets/momentum-logo.png`}
              alt="Momentum"
              className="h-8"
              style={{ maxHeight: '32px', objectFit: 'contain' }}
              onLoad={() => console.log('Momentum logo loaded successfully')}
              onError={() => {
                console.log("Momentum logo failed to load from:", `${import.meta.env.BASE_URL}assets/momentum-logo.png`);
                setMomentumLogoError(true);
              }}
            />
          ) : (
            <div className="h-8 w-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};

export default Login;

/*
// Future multi-tenant version:
const getGymLogo = (subdomain) => {
  const gymConfigs = {
    'viking': 'VikingGymLight.png',
    'powerhouse': 'PowerhouseGym.png',
    // etc...
  };
  return `${import.meta.env.BASE_URL}assets/${gymConfigs[subdomain]}`;
};
*/


