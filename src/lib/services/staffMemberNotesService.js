
export const getStaffMemberNotes = async (supabase, memberId, isValidUUID) => {
  if (!isValidUUID?.(memberId)) {
    console.error(`Invalid UUID provided for getStaffMemberNotes: ${memberId}`);
    return [];
  }
  const { data, error } = await supabase
    .from('staff_member_notes')
    .select(`
      *,
      staff:members!staff_member_notes_staff_id_fkey (id, name, email)
    `)
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching staff member notes:', error);
    throw new Error(`Failed to fetch staff member notes: ${error.message}`);
  }
  return data ?? [];
};

export const addStaffMemberNote = async (supabase, memberId, staffId, content, isValidUUID, invalidateCache) => {
  if (!isValidUUID?.(memberId) || !isValidUUID?.(staffId)) {
    console.error(`Invalid UUID provided for addStaffMemberNote. MemberID: ${memberId}, StaffID: ${staffId}`);
    throw new Error("Invalid member or staff ID for adding note.");
  }
  if (!content || typeof content !== 'string' || content.trim() === '') {
    throw new Error("Note content cannot be empty.");
  }

  const { data, error } = await supabase
    .from('staff_member_notes')
    .insert([{ member_id: memberId, staff_id: staffId, content: content.trim() }])
    .select(`
      *,
      staff:members!staff_member_notes_staff_id_fkey (id, name, email)
    `)
    .single();

  if (error) {
    console.error('Error adding staff member note:', error);
    throw new Error(`Failed to add staff member note: ${error.message}`);
  }
  invalidateCache?.(`staff_member_notes_${memberId}`);
  return data;
};

export const updateStaffMemberNote = async (supabase, noteId, content, isValidUUID, invalidateCache) => {
  if (!isValidUUID?.(noteId)) {
    console.error(`Invalid UUID provided for updateStaffMemberNote: ${noteId}`);
    throw new Error("Invalid note ID for update.");
  }
  if (!content || typeof content !== 'string' || content.trim() === '') {
    throw new Error("Note content cannot be empty for update.");
  }

  const { data, error } = await supabase
    .from('staff_member_notes')
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .select(`
      *,
      staff:members!staff_member_notes_staff_id_fkey (id, name, email)
    `)
    .single();

  if (error) {
    console.error('Error updating staff member note:', error);
    throw new Error(`Failed to update staff member note: ${error.message}`);
  }
  if (data) {
    invalidateCache?.(`staff_member_notes_${data.member_id}`);
  }
  return data;
};

export const deleteStaffMemberNote = async (supabase, noteId, isValidUUID, invalidateCache) => {
  if (!isValidUUID?.(noteId)) {
    console.error(`Invalid UUID provided for deleteStaffMemberNote: ${noteId}`);
    throw new Error("Invalid note ID for deletion.");
  }

  const { data: noteToDelete, error: fetchError } = await supabase
    .from('staff_member_notes')
    .select('member_id')
    .eq('id', noteId)
    .single();

  if (fetchError || !noteToDelete) {
    console.error('Error fetching staff note for deletion or note not found:', fetchError);
    throw new Error(`Failed to find staff note for deletion: ${fetchError?.message || 'Note not found'}`);
  }
  
  const { error } = await supabase
    .from('staff_member_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting staff member note:', error);
    throw new Error(`Failed to delete staff member note: ${error.message}`);
  }
  invalidateCache?.(`staff_member_notes_${noteToDelete.member_id}`);
  return { success: true };
};


