
import { supabase as defaultSupabaseClient } from '@/lib/supabaseClient.js';

const getSupabaseClient = (instance) => instance || defaultSupabaseClient;

const logMembershipAction = async (supabase, memberId, membershipTypeId, planName, action, details = {}) => {
  const client = getSupabaseClient(supabase);
  const logEntry = {
    member_id: memberId,
    membership_type_id: membershipTypeId,
    plan_name: planName || 'Unknown Plan',
    action: action,
    notes: details.notes || `${action} for plan.`.trim(),
    start_date: details.start_date,
    end_date: details.end_date,
    price_paid: details.price_paid,
    status_before: details.status_before,
    status_after: details.status_after,
    logged_at: new Date().toISOString(),
  };
  const { error } = await client.from('member_membership_log').insert(logEntry);
  if (error) {
    console.error(`Error logging membership action "${action}":`, error);
  }
};

const getPlanDetails = async (supabase, membershipTypeId) => {
  const client = getSupabaseClient(supabase);
  if (!membershipTypeId) return null;
  const { data, error } = await client.from('membership_types').select('id, name, category, role_id').eq('id', membershipTypeId).single();
  if (error) {
    console.error('Error fetching plan details for ID:', membershipTypeId, error);
    return null;
  }
  return data;
};

const updateMemberCoreDetails = async (supabase, memberId, updates) => {
  const client = getSupabaseClient(supabase);
  const finalUpdates = { ...updates, updated_at: new Date().toISOString() };
  const { error } = await client.from('profiles').update(finalUpdates).eq('id', memberId);
  if (error) {
    console.error('Error updating member core details for ID:', memberId, error);
    throw new Error(`Failed to update member details: ${error.message}`);
  }
};

const endExistingActiveAssignments = async (supabase, memberId, newPlanStartDate, newPlanTypeId, newPlanNameForLog) => {
  const client = getSupabaseClient(supabase);
  const { data: activeAssignments, error: fetchError } = await client
    .from('member_membership_assignments')
    .select('id, membership_type_id, status')
    .eq('member_id', memberId)
    .is('end_date', null);

  if (fetchError) {
    console.error('Error fetching active assignments to end:', fetchError);
    return;
  }

  if (!activeAssignments || activeAssignments.length === 0) return;

  const yesterday = new Date(new Date(newPlanStartDate).setDate(new Date(newPlanStartDate).getDate() - 1)).toISOString().split('T')[0];

  for (const assignment of activeAssignments) {
    if (assignment.membership_type_id === newPlanTypeId) continue; 

    const newStatus = 'Ended';
    await client
      .from('member_membership_assignments')
      .update({ end_date: yesterday, status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', assignment.id);
    
    const oldPlanDetails = await getPlanDetails(client, assignment.membership_type_id);
    await logMembershipAction(client, memberId, assignment.membership_type_id, oldPlanDetails?.name, 
      'ended_due_to_new_assignment', 
      { 
        status_before: assignment.status, 
        status_after: newStatus, 
        end_date: yesterday, 
        notes: `Plan ${newStatus.toLowerCase()} as new plan ${newPlanNameForLog || newPlanTypeId} was assigned.` 
      }
    );
  }
};

const calculateNewMemberRoleAndStaffId = async (supabase, memberId, assignedPlanIds) => {
  const client = getSupabaseClient(supabase);
  let newRole = 'member'; 
  let newStaffRoleId = null;

  if (assignedPlanIds && assignedPlanIds.length > 0) {
    const { data: activeAssignments, error: activeAssignmentsError } = await client
        .from('member_membership_assignments')
        .select('membership_type_id')
        .eq('member_id', memberId)
        .eq('status', 'Active');

    if (activeAssignmentsError) {
        console.error("Error fetching active assignments for role calculation:", activeAssignmentsError);
    } else if (activeAssignments && activeAssignments.length > 0) {
        const activePlanIds = activeAssignments.map(a => a.membership_type_id);
        const { data: assignedPlansDetails, error: plansError } = await client
          .from('membership_types')
          .select('category, role_id')
          .in('id', activePlanIds); 

        if (plansError) {
          console.error("Error fetching assigned plan details for role calculation:", plansError);
        } else if (assignedPlansDetails) {
          const activeStaffPlan = assignedPlansDetails.find(p => p.category === 'Staff' && p.role_id);
          if (activeStaffPlan) {
            newRole = 'staff';
            newStaffRoleId = activeStaffPlan.role_id;
          }
        }
    }
  }
  return { role: newRole, staff_role_id: newStaffRoleId };
};

export const assignMembershipToMember = async (supabaseInstance, memberId, membershipTypeId, startDate, endDate, pricePaid, notes, invalidateCache, getLoggedInUserId) => {
  const supabase = getSupabaseClient(supabaseInstance);
  
  const newPlanFullDetails = await getPlanDetails(supabase, membershipTypeId);
  if (!newPlanFullDetails) {
      throw new Error("Could not retrieve details for the new plan.");
  }

  if (newPlanFullDetails.category !== 'Staff') {
      await endExistingActiveAssignments(supabase, memberId, startDate, membershipTypeId, newPlanFullDetails.name);
  }

  const assignmentData = {
    member_id: memberId,
    membership_type_id: membershipTypeId,
    start_date: startDate,
    end_date: endDate, 
    status: 'Active',
    price_paid: pricePaid,
    notes: notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: newAssignment, error: assignmentError } = await supabase
    .from('member_membership_assignments')
    .insert(assignmentData)
    .select()
    .single();

  if (assignmentError) {
    console.error('Error creating new membership assignment:', assignmentError);
    throw new Error(`Failed to assign membership: ${assignmentError.message}. Ensure RLS policies are permissive.`);
  }
  if (!newAssignment) {
    throw new Error('Failed to assign membership: No data returned after assignment insert. This might indicate a silent failure or RLS issue.');
  }

  const { data: memberToUpdate } = await supabase.from('profiles').select('assigned_plan_ids, current_membership_type_id, status, role, staff_role_id').eq('id', memberId).single();
  let updatedAssignedPlanIds = Array.from(new Set([...(memberToUpdate?.assigned_plan_ids || []), membershipTypeId]));
  
  const { role: finalRole, staff_role_id: finalStaffRoleId } = await calculateNewMemberRoleAndStaffId(supabase, memberId, updatedAssignedPlanIds);

  let memberCoreUpdates = {
    assigned_plan_ids: updatedAssignedPlanIds,
    role: finalRole,
    staff_role_id: finalStaffRoleId,
  };

  if(newPlanFullDetails.category !== 'Staff') {
      memberCoreUpdates.current_membership_type_id = membershipTypeId;
      memberCoreUpdates.status = 'Active'; 
  } else { 
    if (memberToUpdate?.status !== 'Active') {
        memberCoreUpdates.status = 'Active'; 
    }
  }

  await updateMemberCoreDetails(supabase, memberId, memberCoreUpdates);

  await logMembershipAction(supabase, memberId, membershipTypeId, newPlanFullDetails?.name, 'assigned', 
    { startDate, endDate, pricePaid, status_after: 'Active', notes: `Assigned plan. ${notes || ''}` }
  );
  
  invalidateCache?.('members');
  invalidateCache?.(`member_assignments_${memberId}`); 
  invalidateCache?.(`member_log_${memberId}`); 

  const { data: updatedMember } = await supabase.from('profiles').select('*').eq('id', memberId).single();
  return updatedMember;
};

export const getMemberAssignments = async (supabaseInstance, memberId, isValidUUID) => {
  const supabase = getSupabaseClient(supabaseInstance);
  if (!isValidUUID?.(memberId)) {
    console.error(`Invalid member ID for getMemberAssignments: ${memberId}`);
    return [];
  }
  const { data, error } = await supabase
    .from('member_membership_assignments')
    .select(`
      *,
      membership_type: membership_types (id, name, price, billing_type, color, category, role_id)
    `)
    .eq('member_id', memberId)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching member assignments:', error);
    throw new Error(`Failed to fetch member assignments: ${error.message}`);
  }
  return data || [];
};

export const updateMemberAssignmentStatus = async (supabaseInstance, assignmentId, newStatus, memberId, invalidateCache, getLoggedInUserId) => {
  const supabase = getSupabaseClient(supabaseInstance);
  const { data: assignment, error: fetchError } = await supabase
    .from('member_membership_assignments')
    .select('membership_type_id, status, start_date')
    .eq('id', assignmentId)
    .single();

  if (fetchError || !assignment) {
    console.error('Error fetching assignment for status update:', fetchError);
    throw new Error('Could not fetch assignment details.');
  }
  
  const updatePayload = { status: newStatus, updated_at: new Date().toISOString() };
  if (newStatus === 'Ended' || newStatus === 'Cancelled') {
    updatePayload.end_date = new Date().toISOString().split('T')[0];
  } else if (newStatus === 'Active') {
    updatePayload.end_date = null; 
  }

  const { error: updateErr } = await supabase.from('member_membership_assignments').update(updatePayload).eq('id', assignmentId);
  if (updateErr) {
    console.error('Error updating assignment status:', updateErr);
    throw new Error(`Failed to update assignment status: ${updateErr.message}`);
  }
  
  const { data: memberData } = await supabase.from('profiles').select('current_membership_type_id, status, assigned_plan_ids, role, staff_role_id').eq('id', memberId).single();
  let memberCoreUpdate = {};

  if (memberData) {
    const planBeingModifiedDetails = await getPlanDetails(supabase, assignment.membership_type_id);
    
    const { data: allActiveAssignments, error: allActiveError } = await supabase
      .from('member_membership_assignments')
      .select('membership_type_id, membership_types (id, name, category, role_id, start_date)') // Added start_date to membership_types selection here too if needed for sorting. Original was membership_type_id from assignments table
      .eq('member_id', memberId)
      .eq('status', 'Active');

    if(allActiveError) {
        console.error("Error fetching all active assignments for member update:", allActiveError);
    }

    const activePlanTypes = allActiveAssignments?.map(a => a.membership_types) || [];
    
    const activeStaffPlans = activePlanTypes.filter(p => p && p.category === 'Staff' && p.role_id);
    if (activeStaffPlans.length > 0) {
        memberCoreUpdate.role = 'staff';
        memberCoreUpdate.staff_role_id = activeStaffPlans[0].role_id; 
    } else {
        memberCoreUpdate.role = 'member';
        memberCoreUpdate.staff_role_id = null;
    }

    const activeNonStaffPlans = activePlanTypes.filter(p => p && p.category !== 'Staff');
    if (activeNonStaffPlans.length > 0) {
        // Sort activeNonStaffPlans by their original assignment start_date if that data is available
        // For simplicity, if start_date isn't directly on membership_types in this context, this will pick one.
        // A more robust sort would need the assignment's start_date associated with each plan type.
        // Assuming allActiveAssignments returns the assignment itself, not just the type, for sorting by start_date.
        // If allActiveAssignments.membership_types does not have start_date, this sort won't work as intended.
        // The original query for allActiveAssignments joins membership_types, so it has type details.
        // To sort by assignment start_date, we need that from the member_membership_assignments table.
        // Let's assume the original allActiveAssignments query returns enough detail or re-fetch if needed.
        // For now, we'll just pick the first one.
        memberCoreUpdate.current_membership_type_id = activeNonStaffPlans[0].id; 
        memberCoreUpdate.status = 'Active';
    } else {
        memberCoreUpdate.current_membership_type_id = null;
        memberCoreUpdate.status = activeStaffPlans.length > 0 ? 'Active' : 'Inactive';
    }
    
     if (newStatus === 'Active' && !memberData.assigned_plan_ids?.includes(assignment.membership_type_id)) {
        memberCoreUpdate.assigned_plan_ids = [...(memberData.assigned_plan_ids || []), assignment.membership_type_id];
     } else if ((newStatus === 'Ended' || newStatus === 'Cancelled') && memberData.assigned_plan_ids?.includes(assignment.membership_type_id)) {
        memberCoreUpdate.assigned_plan_ids = (memberData.assigned_plan_ids || []).filter(id => id !== assignment.membership_type_id);
     }


    if (Object.keys(memberCoreUpdate).length > 0) {
      await updateMemberCoreDetails(supabase, memberId, memberCoreUpdate);
    }
  }

  const planDetailsForLog = await getPlanDetails(supabase, assignment.membership_type_id);
  await logMembershipAction(supabase, memberId, assignment.membership_type_id, planDetailsForLog?.name, `status_changed_to_${newStatus}`,
    { status_before: assignment.status, status_after: newStatus, start_date: assignment.start_date, end_date: updatePayload.end_date, notes: `Assignment status updated.` }
  );

  invalidateCache?.('members');
  invalidateCache?.(`member_assignments_${memberId}`);
  invalidateCache?.(`member_log_${memberId}`);
  return { success: true, message: 'Assignment status updated.' };
};

export const removeMembershipFromMember = async (supabaseInstance, memberId, assignmentIdToRemove, membershipTypeIdToRemove, invalidateCache, getLoggedInUserId) => {
  const supabase = getSupabaseClient(supabaseInstance);
  const { data: assignmentToRemove, error: fetchError } = await supabase.from('member_membership_assignments').select('start_date, price_paid, status').eq('id', assignmentIdToRemove).single();
  if (fetchError) console.error('Error fetching assignment to log before deletion:', fetchError);

  const { error: deleteError } = await supabase.from('member_membership_assignments').delete().eq('id', assignmentIdToRemove);
  if (deleteError) {
    console.error('Error deleting membership assignment:', deleteError);
    throw new Error(`Failed to delete assignment: ${deleteError.message}`);
  }

  const { data: memberData } = await supabase.from('profiles').select('assigned_plan_ids, current_membership_type_id, status, role, staff_role_id').eq('id', memberId).single();
  let memberCoreUpdates = {};
  
  if (memberData) {
    memberCoreUpdates.assigned_plan_ids = (memberData.assigned_plan_ids || []).filter(id => id !== membershipTypeIdToRemove);

    const { data: allActiveAssignments, error: allActiveError } = await supabase
      .from('member_membership_assignments')
      .select('membership_type_id, membership_types (id, name, category, role_id)') // start_date on outer table
      .eq('member_id', memberId)
      .eq('status', 'Active');
      
    if(allActiveError) console.error("Error fetching active assignments post-delete:", allActiveError);

    const activePlanTypes = allActiveAssignments?.map(a => a.membership_types).filter(Boolean) || [];


    const activeStaffPlans = activePlanTypes.filter(p => p.category === 'Staff' && p.role_id);
    if (activeStaffPlans.length > 0) {
        memberCoreUpdates.role = 'staff';
        memberCoreUpdates.staff_role_id = activeStaffPlans[0].role_id; 
    } else {
        memberCoreUpdates.role = 'member';
        memberCoreUpdates.staff_role_id = null;
    }

    const activeNonStaffPlans = activePlanTypes.filter(p => p.category !== 'Staff');
    if (activeNonStaffPlans.length > 0) {
        // This logic for picking the current_membership_type_id should ideally sort by assignment start_date.
        // If allActiveAssignments has the original start_date, it should be used.
        // For now, picking the first one after filtering.
        memberCoreUpdates.current_membership_type_id = activeNonStaffPlans[0].id;
        memberCoreUpdates.status = 'Active';
    } else {
        memberCoreUpdates.current_membership_type_id = null;
        memberCoreUpdates.status = activeStaffPlans.length > 0 ? 'Active' : 'Inactive';
    }
    
    if (Object.keys(memberCoreUpdates).length > 0) {
        await updateMemberCoreDetails(supabase, memberId, memberCoreUpdates);
    }
  }


  const planDetails = await getPlanDetails(supabase, membershipTypeIdToRemove);
  await logMembershipAction(supabase, memberId, membershipTypeIdToRemove, planDetails?.name, 'removed', 
    { status_before: assignmentToRemove?.status || 'Unknown', notes: `Removed plan assignment. Was active from ${assignmentToRemove?.start_date}.`, price_paid: assignmentToRemove?.price_paid }
  );

  invalidateCache?.('members');
  invalidateCache?.(`member_assignments_${memberId}`);
  invalidateCache?.(`member_log_${memberId}`);

  const { data: updatedMember } = await supabase.from('profiles').select('*').eq('id', memberId).single();
  return updatedMember;
};

export const getMembershipLogForMember = async (supabaseInstance, memberId, isValidUUID) => {
  const supabase = getSupabaseClient(supabaseInstance);
  if (!isValidUUID?.(memberId)) {
    console.error(`Invalid member ID for getMembershipLogForMember: ${memberId}`);
    return [];
  }
  const { data, error } = await supabase
    .from('member_membership_log')
    .select('*')
    .eq('member_id', memberId)
    .order('logged_at', { ascending: false });

  if (error) {
    console.error('Error fetching membership log:', error);
    throw new Error(`Failed to fetch membership log: ${error.message}`);
  }
  return data || [];
};


