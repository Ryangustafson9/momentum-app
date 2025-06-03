import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CreditCard,
  Star,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user, authReady } = useAuth();
  const [clubInfo, setClubInfo] = useState(null);

  // Simulate loading club info
  useEffect(() => {
    const timer = setTimeout(() => {
      setClubInfo({
        name: "Momentum Fitness",
        address: "123 Fitness Street, Wellness City, WC 12345",
        phone: "(555) 123-4567",
        email: "info@momentumfitness.com",
        hours: {
          weekdays: "5:00 AM - 11:00 PM",
          saturday: "6:00 AM - 10:00 PM", 
          sunday: "7:00 AM - 9:00 PM"
        },
        features: [
          "State-of-the-art equipment",
          "Personal training available",
          "Group fitness classes",
          "24/7 access for members",
          "Locker rooms & showers",
          "Free parking"
        ],
        membershipOptions: [
          { name: "Monthly", price: "$49", features: ["Full gym access", "Basic classes"] },
          { name: "Quarterly", price: "$129", features: ["Full gym access", "All classes", "1 PT session"] },
          { name: "Annual", price: "$449", features: ["Full gym access", "All classes", "4 PT sessions", "Priority booking"] }
        ]
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to {clubInfo?.name || "Our Fitness Center"}
          </h1>
          {user && (
            <p className="text-xl text-gray-600 mb-6">
              Hello {user.first_name || 'there'}! Ready to start your fitness journey?
            </p>
          )}
        </motion.div>

        {clubInfo && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Club Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Visit Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <span className="text-sm text-gray-600">{clubInfo.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{clubInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{clubInfo.email}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Hours Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Mon - Fri:</span>
                    <span className="text-gray-600">{clubInfo.hours.weekdays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saturday:</span>
                    <span className="text-gray-600">{clubInfo.hours.saturday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday:</span>
                    <span className="text-gray-600">{clubInfo.hours.sunday}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Membership CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-2 lg:col-span-1"
            >
              <Card className="h-full bg-gradient-to-br from-blue-600 to-purple-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Join Today!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-blue-100">
                    Start your fitness journey with us. Choose from flexible membership options.
                  </p>
                  <button className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;


