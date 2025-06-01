import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * PublicRoute component - Protects routes that should only be accessible to non-authenticated users
 * Redirects authenticated users to their appropriate dashboard
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (user) {
    console.log('👤 User is authenticated, redirecting to dashboard');
    
    // Get the intended destination from location state, or default to role-based dashboard
    const from = location.state?.from?.pathname;
    
    if (from && from !== '/login' && from !== '/signup') {
      return <Navigate to={from} replace />;
    }

    // FUTURE-READY: Redirect based on hierarchical role system
    switch (user.role) {
      case 'admin':
        return <Navigate to="/dashboard" replace />;
      case 'staff':
        return <Navigate to="/dashboard" replace />;
      case 'member':
        return <Navigate to="/member/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // User is not authenticated, render the public route
  console.log('🌐 User not authenticated, showing public route');
  return children;
};

export default PublicRoute;