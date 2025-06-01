import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; // REMOVED: Router import
import { useAuth } from '@/contexts/AuthContext'; // REMOVED: AuthProvider import (move to main.jsx)
import { Toaster } from '@/components/ui/toaster.jsx';
import { NotificationProvider } from '@/contexts/NotificationContext.jsx';

// UPDATED: Import renamed layouts and components
import StaffDashboardLayout from '@/layouts/StaffDashboardLayout.jsx';
import MemberDashboardLayout from '@/layouts/MemberDashboardLayout.jsx';
import PrivateRoute from '@/components/PrivateRoute.jsx';
import PublicRoute from '@/components/PublicRoute.jsx';

// UPDATED: Import renamed dashboard component
import StaffDashboard from '@/pages/admin/StaffDashboard.jsx';
import Classes from '@/pages/admin/Classes.jsx';
import SettingsPage from '@/pages/admin/Settings.jsx'; 
import Login from '@/pages/Login.jsx';
import Signup from '@/pages/Signup.jsx';
import MemberDashboardPage from '@/pages/member/MemberDashboard.jsx';
import MemberProfilePage from '@/pages/member/MemberProfilePage.jsx';
import StaffMemberProfilePage from '@/pages/admin/StaffMemberProfile.jsx';
import MemberClassesPage from '@/pages/member/MemberClasses.jsx';
import MemberBillingPage from '@/pages/member/MemberBilling.jsx';
import CheckInPage from '@/pages/admin/CheckIn.jsx';
import ReportsPage from '@/pages/admin/Reports.jsx';
import SchedulePage from '@/pages/admin/Schedule.jsx';
import MembershipsPage from '@/pages/admin/Memberships.jsx';
import TrainersPage from '@/pages/admin/Trainers.jsx'; 
import MembersPage from '@/pages/admin/Members.jsx';
import AdminPanelPage from '@/pages/admin/AdminPanelPage.jsx';
import InstructorDashboardPage from '@/pages/admin/InstructorDashboardPage.jsx';
import NotFound from '@/pages/NotFound.jsx';
import Welcome from '@/pages/Welcome.jsx';
import JoinOnline from '@/pages/joinOnline.jsx';
import NonmemberPrompt from '@/pages/NonmemberPrompt.jsx';

function App() {
  const { user, loading } = useAuth();
  const [emergencyLoadingTimeout, setEmergencyLoadingTimeout] = useState(false);
  const location = useLocation();

  // ADDED: Emergency timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ App emergency timeout: Loading too long, showing content anyway');
        setEmergencyLoadingTimeout(true);
      }
    }, 20000); // 20 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  console.log('🔍 App render state:', { 
    loading, 
    user: user?.email || null, 
    pathname: location.pathname,
    emergencyTimeout: emergencyLoadingTimeout 
  });

  // Show loading screen (but not forever)
  if (loading && !emergencyLoadingTimeout) {
    console.log('⏳ App showing loading screen...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
          <p className="mt-2 text-xs text-gray-400">Connecting to authentication...</p>
        </div>
      </div>
    );
  }

  console.log('✅ App loading complete, rendering main app...');

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes - Only accessible when not logged in */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />
          <Route 
            path="/join-online" 
            element={<JoinOnline />}  // Remove PrivateRoute wrapper
          />
          <Route 
            path="/welcome" 
            element={
              <PublicRoute>
                <Welcome />
              </PublicRoute>
            } 
          />
          <Route 
            path="/nonmember-prompt" 
            element={<NonmemberPrompt />} 
          />

          {/* Staff/Admin Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboardLayout>
                  <StaffDashboard />
                </StaffDashboardLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <PrivateRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboardLayout>
                  <SettingsPage />
                </StaffDashboardLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/classes" 
            element={
              <PrivateRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboardLayout>
                  <Classes />
                </StaffDashboardLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/members" 
            element={
              <PrivateRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboardLayout>
                  <MembersPage />
                </StaffDashboardLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/check-in" 
            element={
              <PrivateRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboardLayout>
                  <CheckInPage />
                </StaffDashboardLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <PrivateRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboardLayout>
                  <ReportsPage />
                </StaffDashboardLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/schedule" 
            element={
              <PrivateRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboardLayout>
                  <SchedulePage />
                </StaffDashboardLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/memberships" 
            element={
              <PrivateRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboardLayout>
                  <MembershipsPage />
                </StaffDashboardLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/trainers" 
            element={
              <PrivateRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboardLayout>
                  <TrainersPage />
                </StaffDashboardLayout>
              </PrivateRoute>
            } 
          />

          {/* Member Routes - Wrapped in MemberDashboardLayout */}
          <Route 
            path="/member/dashboard" 
            element={
              <PrivateRoute allowedRoles={['member']}>
                <MemberDashboardLayout>
                  <MemberDashboardPage />
                </MemberDashboardLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/member/profile" 
            element={
              <PrivateRoute allowedRoles={['member']}>
                <MemberDashboardLayout>
                  <MemberProfilePage />
                </MemberDashboardLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/member/classes" 
            element={
              <PrivateRoute allowedRoles={['member']}>
                <MemberDashboardLayout>
                  <MemberClassesPage />
                </MemberDashboardLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/member/billing" 
            element={
              <PrivateRoute allowedRoles={['member']}>
                <MemberDashboardLayout>
                  <MemberBillingPage />
                </MemberDashboardLayout>
              </PrivateRoute>
            } 
          />

          {/* Root Route - Handle nonmembers */}
          <Route 
            path="/" 
            element={
              user ? (
                (user.role === 'staff' || user.role === 'admin') ? <Navigate to="/dashboard" replace /> :
                user.role === 'member' ? <Navigate to="/member/dashboard" replace /> :
                (!user.role || user.role === 'nonmember' || user.role === 'inactive') ? <Navigate to="/nonmember-prompt" replace /> :
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Settings Route Alias */}
          <Route 
            path="/settings" 
            element={
              <PrivateRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboardLayout>
                  <SettingsPage />
                </StaffDashboardLayout>
              </PrivateRoute>
            } 
          />

          {/* Catch-all route - 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Toaster />
      </div>
    </NotificationProvider>
  );
}

export default App;


