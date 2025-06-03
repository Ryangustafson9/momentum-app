// Import necessary functions and libraries
import { supabase } from '@/lib/supabaseClient';
import { apiService } from './apiService';

/**
 * Legacy data service for backward compatibility
 * Wraps the new apiService with the old function names
 */

export const getMembers = async (filters = {}) => {
  return await apiService.getMembers(filters);
};

export const getMemberStats = async () => {
  return await apiService.getMemberStats();
};

export const getDashboardStats = async () => {
  try {
    const [memberStats] = await Promise.all([
      apiService.getMemberStats(),
    ]);
    
    return {
      ...memberStats,
      activeClasses: 8, // Mock
      checkInsToday: 15, // Mock
      monthlyRevenue: 12500, // Mock
    };
  } catch (error) {
    console.error('❌ getDashboardStats failed:', error);
    return {
      totalMembers: 0,
      activeMembers: 0,
      newMembersThisMonth: 0,
      activeClasses: 0,
      checkInsToday: 0,
      monthlyRevenue: 0,
    };
  }
};

export const getGeneralSettings = async () => {
  console.log('⚠️ getGeneralSettings not implemented yet, returning mock data');
  
  return {
    gymName: 'Momentum Fitness',
    allowSelfRegistration: true,
    requireMembershipForAccess: true,
    defaultMembershipType: 'monthly',
    timezone: 'America/New_York',
    currency: 'USD',
    maintenanceMode: false,
    lastUpdated: new Date().toISOString()
  };
};

export const getClasses = async (filters = {}) => {
  console.log('⚠️ getClasses not implemented yet, returning mock data');
  
  // Mock class data with proper structure for the component
  return [
    {
      id: 1,
      name: 'Morning Yoga',
      description: 'Start your day with peaceful yoga movements and breathing exercises.',
      instructor_id: '1',
      instructor_name: 'Sarah Johnson',
      start_time: '2024-01-15T08:00:00Z',
      end_time: '2024-01-15T09:00:00Z',
      max_capacity: 20,
      booked_count: 15,
      location: 'Studio A',
      difficulty: 'Beginner',
      recurring_rule: 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR',
      status: 'active'
    },
    {
      id: 2,
      name: 'HIIT Training',
      description: 'High-intensity interval training to boost your metabolism.',
      instructor_id: '2',
      instructor_name: 'Mike Wilson',
      start_time: '2024-01-15T18:00:00Z',
      end_time: '2024-01-15T19:00:00Z',
      max_capacity: 12,
      booked_count: 10,
      location: 'Main Gym',
      difficulty: 'Intermediate',
      recurring_rule: 'RRULE:FREQ=WEEKLY;BYDAY=TU,TH',
      status: 'active'
    },
    {
      id: 3,
      name: 'Strength Training',
      description: 'Build muscle and strength with guided weightlifting.',
      instructor_id: '3',
      instructor_name: 'Alex Chen',
      start_time: '2024-01-15T18:00:00Z',
      end_time: '2024-01-15T19:30:00Z',
      max_capacity: 15,
      booked_count: 12,
      location: 'Weight Room',
      difficulty: 'Advanced',
      recurring_rule: 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR',
      status: 'active'
    }
  ];
};

export const getMembershipTypes = async () => {
  console.log('⚠️ getMembershipTypes not implemented yet, returning mock data');
  
  return [
    {
      id: 1,
      name: 'Monthly',
      price: 49.99,
      duration: 30,
      features: ['Full gym access', 'Basic classes', 'Locker room'],
      popular: false
    },
    {
      id: 2,
      name: 'Quarterly',
      price: 129.99,
      duration: 90,
      features: ['Full gym access', 'All classes', '1 PT session', 'Locker room'],
      popular: true
    },
    {
      id: 3,
      name: 'Annual',
      price: 449.99,
      duration: 365,
      features: ['Full gym access', 'All classes', '4 PT sessions', 'Priority booking', 'Guest passes'],
      popular: false
    }
  ];
};

export const getInstructors = async () => {
  console.log('⚠️ getInstructors not implemented yet, returning mock data');
  
  return [
    {
      id: '1',
      name: 'Sarah Johnson',
      first_name: 'Sarah',
      last_name: 'Johnson',
      role: 'staff',
      specialties: ['Yoga', 'Pilates'],
      experience: '5 years',
      email: 'sarah@momentumfitness.com',
      status: 'active'
    },
    {
      id: '2',
      name: 'Mike Wilson',
      first_name: 'Mike',
      last_name: 'Wilson',
      role: 'staff',
      specialties: ['HIIT', 'Strength Training'],
      experience: '8 years',
      email: 'mike@momentumfitness.com',
      status: 'active'
    },
    {
      id: '3',
      name: 'Alex Chen',
      first_name: 'Alex',
      last_name: 'Chen',
      role: 'staff',
      specialties: ['Powerlifting', 'Bodybuilding'],
      experience: '6 years',
      email: 'alex@momentumfitness.com',
      status: 'active'
    }
  ];
};

// ⭐ ADD: Missing class management methods
export const addClass = async (classData) => {
  console.log('⚠️ addClass not implemented yet, simulating success');
  console.log('📝 Would create class:', classData);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock created class
  return {
    id: Date.now(), // Mock ID
    ...classData,
    created_at: new Date().toISOString(),
    booked_count: 0
  };
};

export const updateClass = async (classId, classData) => {
  console.log('⚠️ updateClass not implemented yet, simulating success');
  console.log('✏️ Would update class:', classId, classData);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock updated class
  return {
    id: classId,
    ...classData,
    updated_at: new Date().toISOString()
  };
};

export const deleteClass = async (classId) => {
  console.log('⚠️ deleteClass not implemented yet, simulating success');
  console.log('🗑️ Would delete class:', classId);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { success: true };
};

export const getTodayCheckIns = async () => {
  console.log('⚠️ getTodayCheckIns not implemented yet, returning mock data');
  
  const now = new Date();
  return [
    {
      id: 1,
      member: { name: 'John Doe', email: 'john@example.com' },
      checkInTime: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
      type: 'gym_access'
    },
    {
      id: 2,
      member: { name: 'Jane Smith', email: 'jane@example.com' },
      checkInTime: new Date(now - 4 * 60 * 60 * 1000), // 4 hours ago
      type: 'class'
    }
  ];
};

export const getCheckIns = async (filters = {}) => {
  console.log('⚠️ getCheckIns not implemented yet, returning mock data');
  return [];
};

export const getReports = async (filters = {}) => {
  console.log('⚠️ getReports not implemented yet, returning mock data');
  return {
    membershipStats: {
      totalActive: 150,
      newThisMonth: 12,
      renewals: 8,
      cancellations: 3
    },
    revenueStats: {
      thisMonth: 12500,
      lastMonth: 11800,
      growth: 5.9
    },
    classStats: {
      totalClasses: 24,
      averageAttendance: 85,
      popularClass: 'Morning Yoga'
    }
  };
};

export const getTrainers = async () => {
  console.log('⚠️ getTrainers not implemented yet, returning mock data');
  return getInstructors(); // Same as instructors for now
};

// ⭐ COMPLETE: Export all functions including missing ones
export const dataService = {
  getMembers,
  getMemberStats,
  getDashboardStats,
  getGeneralSettings,
  getClasses,
  getMembershipTypes,
  getInstructors,
  getTodayCheckIns,
  getCheckIns,
  getReports,
  getTrainers,
  // ⭐ ADD: Class management methods
  addClass,
  updateClass,
  deleteClass,
};

export default dataService;