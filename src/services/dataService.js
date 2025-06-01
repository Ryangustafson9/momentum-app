// Import necessary functions and libraries
import { supabase } from '@/lib/supabaseClient';

// MEMBERS
export async function getMembers() {
  try {
    console.log('📊 Fetching members data...');
    
    // CORRECTED: Use memberships table as bridge to membership_types
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        memberships (
          id,
          start_date,
          end_date,
          status,
          membership_types (
            name,
            price,
            duration_months
          )
        )
      `)
      .eq('role', 'member')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching members:', error);
      // Fallback to basic query if relationship fails
      const { data: basicData, error: basicError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'member')
        .order('created_at', { ascending: false });
      
      if (basicError) {
        throw basicError;
      }
      
      console.log('⚠️ Using basic member data without membership details');
      return basicData || [];
    }

    console.log('✅ Members data fetched successfully:', data?.length || 0, 'members');
    return data || [];
  } catch (error) {
    console.error('❌ Failed to fetch members:', error);
    throw error;
  }
}

// UPDATED: Fix getMemberById with correct relationship

export async function getMemberById(memberId) {
  try {
    console.log('📊 Fetching member by ID:', memberId);
    
    // Get member with their current memberships
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        memberships (
          id,
          start_date,
          end_date,
          status,
          created_at,
          membership_types (
            id,
            name,
            price,
            duration_months,
            description
          )
        )
      `)
      .eq('id', memberId)
      .eq('role', 'member')
      .single();

    if (error) {
      console.error('Error fetching member with memberships:', error);
      
      // Fallback to basic member data
      const { data: basicData, error: basicError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', memberId)
        .eq('role', 'member')
        .single();
      
      if (basicError) {
        throw basicError;
      }
      
      return basicData;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch member:', error);
    throw error;
  }
}

// UPDATED: Fix getMemberStats to work with memberships table

export async function getMemberStats() {
  try {
    console.log('📊 Fetching member stats...');
    
    // Get all members
    const { data: members, error: membersError } = await supabase
      .from('profiles')
      .select('id, created_at')
      .eq('role', 'member');

    if (membersError) throw membersError;

    // Get all active memberships with types
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select(`
        profile_id,
        status,
        membership_types (
          id,
          name
        )
      `)
      .eq('status', 'active');

    if (membershipsError) {
      console.warn('Could not fetch membership details, using basic stats');
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: members.length,
      newThisMonth: members.filter(member => {
        const createdAt = new Date(member.created_at);
        return createdAt >= thisMonth;
      }).length,
      byMembershipType: {}
    };

    // Group active memberships by type
    if (memberships) {
      memberships.forEach(membership => {
        const typeName = membership.membership_types?.name || 'Unknown';
        stats.byMembershipType[typeName] = (stats.byMembershipType[typeName] || 0) + 1;
      });
    }

    console.log('✅ Member stats calculated:', stats);
    return stats;
  } catch (error) {
    console.error('Failed to fetch member stats:', error);
    throw error;
  }
}

// STAFF
export async function getStaff() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['staff', 'admin'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    throw error;
  }
}

// DASHBOARD STATS
export async function getDashboardStats() {
  try {
    const [membersResult, staffResult] = await Promise.allSettled([
      getMemberStats(),
      getStaff()
    ]);

    return {
      members: membersResult.status === 'fulfilled' ? membersResult.value : null,
      staff: staffResult.status === 'fulfilled' ? staffResult.value : null,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw error;
  }
}

// CLASSES
export async function getClasses() {
  try {
    console.log('📊 Fetching classes data...');
    
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('start_time');

    if (error) {
      console.error('Error fetching classes:', error);
      return []; // Return empty array instead of throwing
    }

    console.log('✅ Classes data fetched successfully:', data?.length || 0, 'classes');
    return data || [];
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    return []; // Return empty array instead of throwing
  }
}

// CHECK-INS
export async function getTodayCheckIns() {
  try {
    console.log('📊 Fetching today check-ins...');
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .gte('check_in_time', `${today}T00:00:00`)
      .lt('check_in_time', `${today}T23:59:59`)
      .order('check_in_time', { ascending: false });

    if (error) {
      console.error('Error fetching today check-ins:', error);
      return [];
    }

    console.log('✅ Check-ins data fetched successfully:', data?.length || 0, 'check-ins');
    return data || [];
  } catch (error) {
    console.error('Failed to fetch today check-ins:', error);
    return [];
  }
}

// MEMBERSHIP TYPES
export async function getMembershipTypes() {
  try {
    console.log('📊 Fetching membership types...');
    
    const { data, error } = await supabase
      .from('membership_types')
      .select('*')
      .order('price');

    if (error) {
      console.error('Error fetching membership types:', error);
      return [];
    }

    console.log('✅ Membership types fetched successfully:', data?.length || 0, 'types');
    return data || [];
  } catch (error) {
    console.error('Failed to fetch membership types:', error);
    return [];
  }
}

// SETTINGS
export async function getGeneralSettings() {
  try {
    const { data, error } = await supabase
      .from('general_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching general settings:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch general settings:', error);
    throw error;
  }
}

export async function updateGeneralSettings(settings) {
  try {
    const { data, error } = await supabase
      .from('general_settings')
      .update(settings)
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      console.error('Error updating general settings:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update general settings:', error);
    throw error;
  }
}

// ADD: New functions for membership management

// Get all active memberships
export async function getActiveMemberships() {
  try {
    console.log('📊 Fetching active memberships...');
    
    const { data, error } = await supabase
      .from('memberships')
      .select(`
        *,
        profiles (
          id,
          first_name,
          last_name,
          email
        ),
        membership_types (
          name,
          price,
          duration_months
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active memberships:', error);
      return [];
    }

    console.log('✅ Active memberships fetched:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch active memberships:', error);
    return [];
  }
}

// Get expiring memberships (within specified days)
export async function getExpiringMemberships(days = 7) {
  try {
    console.log(`📊 Fetching memberships expiring in ${days} days...`);
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const { data, error } = await supabase
      .from('memberships')
      .select(`
        *,
        profiles (
          id,
          first_name,
          last_name,
          email
        ),
        membership_types (
          name,
          price
        )
      `)
      .eq('status', 'active')
      .lte('end_date', futureDate.toISOString())
      .order('end_date', { ascending: true });

    if (error) {
      console.error('Error fetching expiring memberships:', error);
      return [];
    }

    console.log('✅ Expiring memberships fetched:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch expiring memberships:', error);
    return [];
  }
}

// Get membership by profile ID
export async function getMembershipByProfileId(profileId) {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select(`
        *,
        membership_types (
          name,
          price,
          duration_months,
          description
        )
      `)
      .eq('profile_id', profileId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching membership for profile:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Failed to fetch membership for profile:', error);
    return null;
  }
}

// ENHANCED: Export all functions as a service object for Dashboard import compatibility
export const dataService = {
  // Members
  getMembers,
  getMemberById,
  getMemberStats,
  
  // Staff
  getStaff,
  
  // Dashboard
  getDashboardStats,
  
  // Classes
  getClasses,
  
  // Check-ins
  getTodayCheckIns,
  
  // Membership Types (available plans)
  getMembershipTypes,
  
  // Memberships (assigned memberships)
  getActiveMemberships,
  getExpiringMemberships,
  getMembershipByProfileId,
  
  // Settings
  getGeneralSettings,
  updateGeneralSettings,

  // Helper functions for dashboard
  getCheckInsTodayCount: async () => {
    const checkIns = await getTodayCheckIns();
    return checkIns.length;
  },
  
  getExpiringMembershipsCount: async (days = 7) => {
    const expiring = await getExpiringMemberships(days);
    return expiring.length;
  },
  
  getLowCapacityClasses: async (threshold = 3) => {
    // TODO: Implement when class capacity tracking is added
    return [];
  },
  
  getRecentCheckIns: async (limit = 5) => {
    const checkIns = await getTodayCheckIns();
    return checkIns.slice(0, limit);
  },
  
  getPendingSupportTicketsCount: async () => {
    // TODO: Implement when support system is added
    return 0;
  }
};

// Also export individual functions for flexible importing
export default dataService;