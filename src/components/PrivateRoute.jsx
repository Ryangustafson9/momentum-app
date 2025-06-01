import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
// UPDATED: Import from services/dataService
import { getGeneralSettings } from '@/services/dataService';

/**
 * PrivateRoute component - Protects routes that require authentication
 * Supports hierarchical role system: admin > staff > member
 * Handles nonmember redirection based on settings
 */
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [settings, setSettings] = useState({ NonmemberSignupPrompt: false });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load settings for nonmember handling
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const generalSettings = await getGeneralSettings();
        if (generalSettings) {
          setSettings(generalSettings);
        }
      } catch (error) {
        console.error('Error loading settings in PrivateRoute:', error);
      } finally {
        setSettingsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Show loading spinner while authentication state is being determined
  if (loading || !settingsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    console.log('🔒 User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for nonmember users and settings
  if (user && !user.role) {
    console.log('👤 User has no role (nonmember)');
    
    if (settings.NonmemberSignupPrompt) {
      console.log('🔄 Redirecting nonmember to signup prompt');
      return <Navigate to="/nonmember-prompt" replace />;
    } else {
      console.log('🚫 Nonmember signup prompt disabled, denying access');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You need an active membership to access this area.
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      );
    }
  }

  // Handle users with role "nonmember" or similar
  if (user && (user.role === 'nonmember' || user.role === 'inactive')) {
    console.log(`👤 User role '${user.role}' identified as nonmember`);
    
    if (settings.NonmemberSignupPrompt) {
      console.log('🔄 Redirecting nonmember to signup prompt');
      return <Navigate to="/nonmember-prompt" replace />;
    }
  }

  // Check role permissions if roles are specified
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    console.log(`🚫 User role '${user.role}' not in allowed roles:`, allowedRoles);
    
    // FUTURE-READY: Redirect based on hierarchical role system
    switch (user.role) {
      case 'admin':
        return <Navigate to="/dashboard" replace />;
      case 'staff':
        return <Navigate to="/dashboard" replace />;
      case 'member':
        return <Navigate to="/member/dashboard" replace />;
      case 'nonmember':
      case 'inactive':
        if (settings.NonmemberSignupPrompt) {
          return <Navigate to="/nonmember-prompt" replace />;
        }
        // Fall through to access denied
      default:
        // Show access denied for unrecognized roles
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-4">
                You don't have permission to access this page.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                <strong>Your role:</strong> {user.role} <br />
                <strong>Required:</strong> {allowedRoles.join(', ')}
              </p>
              <div className="space-x-2">
                <button 
                  onClick={() => window.history.back()}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Go Back
                </button>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        );
    }
  }

  // User is authenticated and has permission
  console.log('✅ User authenticated and authorized:', user.role);
  return children;
};

export default PrivateRoute;


