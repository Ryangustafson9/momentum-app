
import React from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { generateUUID } from '@/lib/utils.js';
import { isValidUUID as checkValidUUID } from '@/lib/utils/localStorageUtils.js'; 


const getClassSelectQueryForBooking = () => `
  id, name, start_time, max_capacity, booked_count
`;

export const bookClassForMember = async (memberId, classId, classService, memberService, attendanceService, invalidateCache) => {
  if (!supabase) {
    console.warn("Supabase client not available in bookingService.bookClassForMember. LocalStorage/mock logic would go here if implemented.");
    throw new Error("Supabase client not available. Booking feature disabled.");
  }
  if (!checkValidUUID(memberId) || !checkValidUUID(classId)) {
    throw new Error("Invalid Member ID or Class ID for booking.");
  }

  const member = await memberService.getById(memberId);
  const classInfo = await classService.getById(classId);

  if (!member) throw new Error("Member not found.");
  if (!classInfo) throw new Error("Class not found.");
  
  if ((classInfo.booked_count || 0) >= classInfo.max_capacity) {
    throw new Error("Class is full.");
  }

  const existingBooking = await attendanceService.getByMemberAndClass(memberId, classId);
  if (existingBooking && (existingBooking.status === 'Booked' || existingBooking.status === 'Checked-in')) {
    throw new Error("You are already booked or checked-in for this class.");
  }

  const bookingData = {
    id: generateUUID(),
    member_id: memberId,
    member_name: member.name,
    class_id: classId,
    class_name: classInfo.name,
    check_in_time: new Date(classInfo.start_time).toISOString(), 
    status: 'Booked',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('attendance').insert([bookingData]).select().single();
  if (error) {
    console.error('Error booking class:', error);
    throw new Error(`Failed to book class: ${error.message}`);
  }

  try {
    await classService.update(classId, { booked_count: (classInfo.booked_count || 0) + 1 });
  } catch (classUpdateError) {
    console.error("Error updating class count after booking:", classUpdateError);
  }
  
  invalidateCache('attendance');
  invalidateCache('classes');
  return data;
};

export const cancelClassBookingForMember = async (attendanceId, memberId, classId, classService, attendanceService, invalidateCache) => {
  if (!supabase) {
    console.warn("Supabase client not available in bookingService.cancelClassBookingForMember.");
    throw new Error("Supabase client not available. Cancellation feature disabled.");
  }
  if (!checkValidUUID(attendanceId) || !checkValidUUID(memberId) || !checkValidUUID(classId)) {
    throw new Error("Invalid ID for cancellation.");
  }
  
  const classInfo = await classService.getById(classId);
  if (!classInfo) {
    throw new Error("Class not found for cancellation.");
  }

  const { data, error } = await supabase
    .from('attendance')
    .update({ status: 'Cancelled', updated_at: new Date().toISOString() })
    .eq('id', attendanceId)
    .eq('member_id', memberId)
    .eq('class_id', classId) 
    .select()
    .single();

  if (error) {
    console.error('Error cancelling class booking:', error);
    throw new Error(`Failed to cancel booking: ${error.message}`);
  }

  if (data) { 
    try {
      await classService.update(classId, { booked_count: Math.max(0, (classInfo.booked_count || 0) - 1) });
    } catch (classUpdateError) {
      console.error("Error updating class count after cancellation:", classUpdateError);
    }
  }
  
  invalidateCache('attendance');
  invalidateCache('classes');
  return data;
};

export const recordCheckIn = async (memberId, classId = null, notes = '', classService, memberService, attendanceService, invalidateCache) => {
  if (!supabase) {
    console.warn("Supabase client not available in bookingService.recordCheckIn.");
    throw new Error("Supabase client not available. Check-in feature disabled.");
  }
  if (!checkValidUUID(memberId)) throw new Error("Invalid member ID for check-in.");
  if (classId && !checkValidUUID(classId)) throw new Error("Invalid class ID for check-in.");

  const member = await memberService.getById(memberId);
  if (!member) throw new Error("Member not found for check-in.");
  
  let classInfo = null;
  if (classId) {
    classInfo = await classService.getById(classId);
    if (!classInfo) throw new Error("Class not found for check-in.");
  }

  const checkInData = {
    id: generateUUID(),
    member_id: memberId,
    member_name: member.name,
    class_id: classId,
    class_name: classInfo ? classInfo.name : (classId ? 'Unknown Class' : 'General Check-in'),
    check_in_time: new Date().toISOString(),
    status: 'Checked-in',
    notes: notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('attendance').insert([checkInData]).select().single();
  if (error) { 
    console.error('Error recording check-in:', error); 
    throw new Error(`Failed to record check-in: ${error.message}`);
  }
  
  if (classId && classInfo && classInfo.status !== 'Checked-in') { 
    const existingBooking = await attendanceService.getByMemberAndClass(memberId, classId);
    if (existingBooking && existingBooking.status === 'Booked') {
       await supabase.from('attendance').update({ status: 'Checked-in', updated_at: new Date().toISOString() }).eq('id', existingBooking.id);
    } else if (!existingBooking) {
        try {
            await classService.update(classId, { booked_count: (classInfo.booked_count || 0) + 1 });
        } catch (classUpdateError) {
            console.error("Error updating class count after direct check-in:", classUpdateError);
        }
    }
  }
  
  invalidateCache('attendance');
  if (classId) invalidateCache('classes');
  return data;
};


