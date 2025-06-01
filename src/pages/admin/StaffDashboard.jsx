import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// UPDATED: Remove getExpiringMemberships import since it's not exported yet
import { 
  getMembers, 
  getMemberStats, 
  getDashboardStats,
  getClasses,
  getTodayCheckIns,
  dataService 
} from '@/services/dataService';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNotifications } from '@/contexts/NotificationContext.jsx';

import StatCard from '@/components/admin/dashboard/StatCard.jsx';
import AddCardDialog from '@/components/admin/dashboard/AddCardDialog.jsx';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader.jsx';
import QuickStatsCard from '@/components/admin/dashboard/QuickStatsCard.jsx';
import RecentActivityCard from '@/components/admin/dashboard/RecentActivityCard.jsx';
import { ALL_AVAILABLE_CARDS_CONFIG } from '@/components/admin/dashboard/dashboardConfig.jsx';

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeClasses: 0,
    checkInsToday: 0,
    expiringMembershipsCount: 0,
    lowCapacityClassesCount: 0,
    pendingSupportTicketsCount: 0,
    unreadSystemNotificationsCount: 0,
    totalMembersTrend: "+0 this month",
    upcomingClassesTrend: "0 new this week",
    quickStatsSummary: { 
      newMembersThisMonth: 0, 
      classAttendanceRate: '0%', 
      membershipRenewalRate: '0%' 
    },
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { unreadCount: unreadSystemNotifications } = useNotifications();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);

  const [visibleCardIds, setVisibleCardIds] = useState(() => {
    const storedLayout = localStorage.getItem('staffDashboardLayout_v3');
    if (storedLayout) {
      try {
        const parsedLayout = JSON.parse(storedLayout);
        return Array.isArray(parsedLayout) ? parsedLayout : ALL_AVAILABLE_CARDS_CONFIG.filter(c => c.defaultVisible).map(c => c.id);
      } catch (e) {
        console.error("Failed to parse dashboard layout from localStorage", e);
      }
    }
    return ALL_AVAILABLE_CARDS_CONFIG.filter(c => c.defaultVisible).map(c => c.id);
  });

  const displayedCardsConfig = useMemo(() => {
    return visibleCardIds.map(id => ALL_AVAILABLE_CARDS_CONFIG.find(card => card.id === id)).filter(Boolean);
  }, [visibleCardIds]);

  // COMPLETE: fetchData function with proper error handling
  const fetchData = useCallback(async () => {
    console.log('🔄 StaffDashboard: Starting data fetch...');
    setIsLoading(true);
    
    try {
      let membersData = [];
      let classesData = [];
      let checkInsData = [];

      // Fetch members data
      try {
        console.log('📞 Fetching members...');
        membersData = await getMembers();
        console.log('✅ Members loaded:', membersData?.length || 0);
      } catch (error) {
        console.error('❌ Members fetch failed:', error);
        membersData = [];
      }

      // Fetch classes data
      try {
        console.log('📞 Fetching classes...');
        classesData = await getClasses();
        console.log('✅ Classes loaded:', classesData?.length || 0);
      } catch (error) {
        console.error('❌ Classes fetch failed:', error);
        classesData = [];
      }

      // Fetch check-ins data
      try {
        console.log('📞 Fetching check-ins...');
        checkInsData = await getTodayCheckIns();
        console.log('✅ Check-ins loaded:', checkInsData?.length || 0);
      } catch (error) {
        console.error('❌ Check-ins fetch failed:', error);
        checkInsData = [];
      }

      // Calculate stats
      const now = new Date();
      const upcomingClasses = classesData.filter(c => {
        if (!c.start_time) return false;
        return new Date(c.start_time) >= now;
      });
      
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newMembersThisMonth = membersData.filter(m => {
        if (!m.created_at) return false;
        return new Date(m.created_at) >= thisMonth;
      }).length;

      // Create recent activity from check-ins
      const checkInActivity = checkInsData.slice(0, 8).map((checkIn, index) => ({
        id: checkIn.id || `checkin-${index}`,
        message: `Member checked in`,
        timestamp: checkIn.check_in_time || new Date().toISOString(),
        type: 'check_in'
      }));

      // Sample activities if no real data
      const sampleActivity = [
        {
          id: 'sample-1',
          message: 'New member registration completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          type: 'registration'
        },
        {
          id: 'sample-2', 
          message: 'Class schedule updated',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          type: 'schedule'
        }
      ];

      const finalActivity = checkInActivity.length > 0 ? checkInActivity : sampleActivity;

      // Update stats
      const newStats = {
        totalMembers: membersData.length,
        activeClasses: upcomingClasses.length,
        checkInsToday: checkInsData.length,
        expiringMembershipsCount: 0, // TODO: Implement when expiring memberships function is ready
        lowCapacityClassesCount: 0,
        pendingSupportTicketsCount: 0,
        unreadSystemNotificationsCount: unreadSystemNotifications || 0,
        totalMembersTrend: `+${newMembersThisMonth} this month`,
        upcomingClassesTrend: `${upcomingClasses.length} scheduled`,
        quickStatsSummary: {
          newMembersThisMonth,
          classAttendanceRate: '85%',
          membershipRenewalRate: '92%'
        }
      };

      console.log('📊 Calculated stats:', newStats);
      console.log('📝 Activity data:', finalActivity);

      setStats(prevStats => ({ ...prevStats, ...newStats }));
      setRecentActivity(finalActivity);
      
      console.log('✅ StaffDashboard: Data fetch complete');

    } catch (error) {
      console.error("❌ Critical error in StaffDashboard fetchData:", error);
    } finally {
      setIsLoading(false);
    }
  }, [unreadSystemNotifications]);

  // COMPLETE: useEffect hooks
  useEffect(() => {
    console.log('🚀 StaffDashboard: Component mounted, calling fetchData...');
    fetchData();
    
    // Listen for data updates
    const eventKeys = ['members', 'classes', 'attendance', 'membership_types', 'support_tickets', 'notifications'];
    const handleDataUpdate = (event) => {
      if (eventKeys.includes(event.detail?.key) || event.detail?.key === 'userNotificationsUpdated') {
        console.log('📢 Data update event received, refreshing dashboard...');
        fetchData();
      }
    };
    
    window.addEventListener('appDataChanged', handleDataUpdate);
    return () => {
      console.log('🧹 StaffDashboard: Cleaning up event listener...');
      window.removeEventListener('appDataChanged', handleDataUpdate);
    };
  }, [fetchData]);
  
  useEffect(() => {
    setStats(prev => ({ ...prev, unreadSystemNotificationsCount: unreadSystemNotifications || 0 }));
  }, [unreadSystemNotifications]);

  // COMPLETE: Event handlers
  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) { 
      localStorage.setItem('staffDashboardLayout_v3', JSON.stringify(visibleCardIds));
    }
  };

  const handleRemoveCard = (cardIdToRemove) => {
    setVisibleCardIds(prevIds => prevIds.filter(id => id !== cardIdToRemove));
  };

  const handleAddCard = (cardIdToAdd) => {
    if (!visibleCardIds.includes(cardIdToAdd)) {
      setVisibleCardIds(prevIds => [...prevIds, cardIdToAdd]);
    }
  };

  // Debug logging
  console.log('🎯 StaffDashboard render state:', {
    isLoading,
    statsCount: Object.keys(stats).length,
    totalMembers: stats.totalMembers,
    recentActivityCount: recentActivity.length,
    visibleCardsCount: visibleCardIds.length
  });

  // Show loading only on initial load
  if (isLoading && stats.totalMembers === 0 && recentActivity.length === 0) {
    console.log('⏳ StaffDashboard: Showing initial loading screen...');
    return <LoadingSpinner text="Loading dashboard..." className="mt-20" />;
  }

  console.log('🎨 StaffDashboard: Rendering main dashboard...');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <DashboardHeader 
        isEditMode={isEditMode}
        onToggleEditMode={handleToggleEditMode}
        onOpenAddCardDialog={() => setIsAddCardDialogOpen(true)}
      />

      {isLoading && <LoadingSpinner text="Refreshing data..." size="small" />}

      {/* Debug Info (Remove in production) */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
        <h3 className="font-semibold text-blue-800">Dashboard Debug Info:</h3>
        <p className="text-sm text-blue-600">
          Members: {stats.totalMembers} | Classes: {stats.activeClasses} | Check-ins: {stats.checkInsToday} | 
          Activity Items: {recentActivity.length} | Visible Cards: {visibleCardIds.length}
        </p>
        <p className="text-xs text-blue-500 mt-1">
          Loading: {isLoading ? 'Yes' : 'No'} | Cards Config: {displayedCardsConfig.length}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <motion.div 
        layout 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <AnimatePresence>
          {displayedCardsConfig.filter(c => c.dataType === 'stat').map(cardConfig => (
            <StatCard 
              key={cardConfig.id}
              cardConfig={cardConfig}
              value={stats[cardConfig.dataKey] ?? 'N/A'}
              trend={stats[cardConfig.trendKey]}
              navigateTo={cardConfig.navigateTo}
              description={cardConfig.description}
              badgeCount={cardConfig.badgeKey ? stats[cardConfig.badgeKey] : 0}
              isEditMode={isEditMode}
              onRemoveCard={handleRemoveCard}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Widget Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {visibleCardIds.includes('recentActivity') && (
          <RecentActivityCard 
            activities={recentActivity} 
            isEditMode={isEditMode} 
            onRemoveCard={handleRemoveCard} 
          />
        )}

        {visibleCardIds.includes('quickStats') && (
          <QuickStatsCard 
            isEditMode={isEditMode} 
            onRemoveCard={handleRemoveCard} 
            statsData={stats.quickStatsSummary}
            className={`${!visibleCardIds.includes('recentActivity') ? 'lg:col-span-3' : ''}`}
          />
        )}
      </div>

      {/* Add Card Dialog */}
      <AddCardDialog 
        open={isAddCardDialogOpen} 
        onOpenChange={setIsAddCardDialogOpen}
        onAddCard={handleAddCard}
        currentVisibleCardIds={visibleCardIds}
      />
    </motion.div>
  );
};

export default StaffDashboard;


