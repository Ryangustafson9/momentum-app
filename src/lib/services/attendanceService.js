
import { supabase } from '@/lib/supabaseClient.js'; // Assuming supabase client is initialized here
import { isValidUUID as checkValidUUID } from '@/lib/utils/localStorageUtils.js';

export const getAttendanceRecords = async (supabaseClient, filters = {}, isValidUUID) => {
  if (!supabaseClient) {
    console.warn("Supabase client not available in attendanceService.getAttendanceRecords. Returning local data.");
    let attendance = JSON.parse(localStorage.getItem('attendance')) || [];
    if (filters.classId && isValidUUID(filters.classId)) attendance = attendance.filter(a => a.class_id === filters.classId);
    if (filters.memberId && isValidUUID(filters.memberId)) attendance = attendance.filter(a => a.member_id === filters.memberId);
    if (filters.date) {
        attendance = attendance.filter(a => a.check_in_time.startsWith(filters.date));
    }
    return attendance.sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time));
  }

  let query = supabaseClient.from('attendance').select('*');
  if(filters.classId && isValidUUID(filters.classId)) query = query.eq('class_id', filters.classId);
  if(filters.memberId && isValidUUID(filters.memberId)) query = query.eq('member_id', filters.memberId);
  if(filters.date) {
    query = query.gte('check_in_time', `${filters.date}T00:00:00Z`)
                 .lte('check_in_time', `${filters.date}T23:59:59Z`);
  }
  query = query.order('check_in_time', { ascending: false });
  
  const { data, error } = await query;
  if (error) { console.error('Error fetching attendance records:', error); throw error; }
  return data;
};

export const getAttendanceByMemberAndClass = async (supabaseClient, memberId, classId, isValidUUID) => {
  if (!supabaseClient) {
    console.warn("Supabase client not available in attendanceService.getAttendanceByMemberAndClass. Returning local data.");
    const attendance = JSON.parse(localStorage.getItem('attendance')) || [];
    return attendance.find(a => a.member_id === memberId && a.class_id === classId) || null;
  }
  if (!isValidUUID(memberId) || !isValidUUID(classId)) {
    console.error("Invalid memberId or classId for getAttendanceByMemberAndClass");
    return null;
  }
  const { data, error } = await supabaseClient
    .from('attendance')
    .select('*')
    .eq('member_id', memberId)
    .eq('class_id', classId)
    .order('check_in_time', { ascending: false }) 
    .maybeSingle(); 

  if (error) {
    console.error('Error fetching attendance by member and class:', error);
    return null; 
  }
  return data;
};


export const getCheckInsTodayCount = async (supabaseClient) => {
  if (!supabaseClient) {
    console.warn("Supabase client not available in attendanceService.getCheckInsTodayCount. Returning local data count.");
    const attendance = JSON.parse(localStorage.getItem('attendance')) || [];
    const today = new Date().toISOString().split('T')[0];
    return attendance.filter(a => a.check_in_time.startsWith(today)).length;
  }
  const today = new Date().toISOString().split('T')[0];
  const { count, error } = await supabaseClient
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .gte('check_in_time', `${today}T00:00:00Z`)
    .lte('check_in_time', `${today}T23:59:59Z`);

  if (error) { console.error('Error getting today\'s check-in count:', error); throw error; }
  return count || 0;
};

export const getRecentCheckIns = async (supabaseClient, limit = 5) => {
  if (!supabaseClient) {
    console.warn("Supabase client not available in attendanceService.getRecentCheckIns. Returning local data.");
    const attendance = JSON.parse(localStorage.getItem('attendance')) || [];
    return attendance.sort((a,b) => new Date(b.check_in_time) - new Date(a.check_in_time)).slice(0, limit);
  }
  const { data, error } = await supabaseClient
    .from('attendance')
    .select('*')
    .order('check_in_time', { ascending: false })
    .limit(limit);
  if (error) { console.error('Error fetching recent check-ins:', error); throw error; }
  return data;
};


