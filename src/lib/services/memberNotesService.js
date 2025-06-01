
export const getMemberNotes = async (supabase, memberId, isValidUUID) => {
  if (!isValidUUID?.(memberId)) {
    console.error(`Invalid UUID provided for getMemberNotes: ${memberId}`);
    return [];
  }
  const { data, error } = await supabase
    .from('member_notes')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching member notes:', error);
    throw new Error(`Failed to fetch member notes: ${error.message}`);
  }
  return data ?? [];
};

export const addMemberNote = async (supabase, memberId, content, isValidUUID, invalidateCache) => {
  if (!isValidUUID?.(memberId)) {
    console.error(`Invalid UUID provided for addMemberNote: ${memberId}`);
    throw new Error("Invalid member ID for adding note.");
  }
  if (!content || typeof content !== 'string' || content.trim() === '') {
    throw new Error("Note content cannot be empty.");
  }

  const { data, error } = await supabase
    .from('member_notes')
    .insert([{ member_id: memberId, content: content.trim() }])
    .select()
    .single();

  if (error) {
    console.error('Error adding member note:', error);
    throw new Error(`Failed to add member note: ${error.message}`);
  }
  invalidateCache?.(`member_notes_${memberId}`);
  return data;
};

export const updateMemberNote = async (supabase, noteId, content, isValidUUID, invalidateCache) => {
  if (!isValidUUID?.(noteId)) {
    console.error(`Invalid UUID provided for updateMemberNote: ${noteId}`);
    throw new Error("Invalid note ID for update.");
  }
   if (!content || typeof content !== 'string' || content.trim() === '') {
    throw new Error("Note content cannot be empty for update.");
  }

  const { data, error } = await supabase
    .from('member_notes')
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .select()
    .single();

  if (error) {
    console.error('Error updating member note:', error);
    throw new Error(`Failed to update member note: ${error.message}`);
  }
  if (data) {
    invalidateCache?.(`member_notes_${data.member_id}`);
  }
  return data;
};

export const deleteMemberNote = async (supabase, noteId, isValidUUID, invalidateCache) => {
  if (!isValidUUID?.(noteId)) {
    console.error(`Invalid UUID provided for deleteMemberNote: ${noteId}`);
    throw new Error("Invalid note ID for deletion.");
  }

  const { data: noteToDelete, error: fetchError } = await supabase
    .from('member_notes')
    .select('member_id')
    .eq('id', noteId)
    .single();

  if (fetchError || !noteToDelete) {
    console.error('Error fetching note for deletion or note not found:', fetchError);
    throw new Error(`Failed to find note for deletion: ${fetchError?.message || 'Note not found'}`);
  }
  
  const { error } = await supabase
    .from('member_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting member note:', error);
    throw new Error(`Failed to delete member note: ${error.message}`);
  }
  invalidateCache?.(`member_notes_${noteToDelete.member_id}`);
  return { success: true };
};


