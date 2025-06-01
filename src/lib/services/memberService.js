import { supabase } from '@/lib/supabaseClient.js';
import { generateUUID } from '@/lib/utils.js';

export const getMembers = async (supabaseClient, isCacheValid, updateCache, getCache) => {
  if (!supabaseClient) {
    console.warn("Supabase client not available in memberService.getMembers. Returning empty array.");
    return JSON.parse(localStorage.getItem('members')) || [];
  }
  if (isCacheValid?.('members')) {
    const cachedData = getCache?.('members');
    if (cachedData) return cachedData;
  }
  const { data, error } = await supabaseClient.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) { 
    console.error('Error fetching members:', error); 
    throw new Error(`Failed to fetch members: ${error.message}`); 
  }
  updateCache?.('members', data);
  return data ?? [];
};

export const getMemberById = async (supabaseClient, id, isValidUUID, getCache) => {
  if (!supabaseClient) {
    console.warn(`Supabase client not available in memberService.getMemberById for ID ${id}.`);
    const members = JSON.parse(localStorage.getItem('members')) || [];
    return members.find(m => m.id === id) || null;
  }
  if (!isValidUUID?.(id)) {
      console.error(`Invalid UUID provided for getMemberById: ${id}`);
      return null; 
  }
  const cachedMembers = getCache?.('members');
  if (cachedMembers) {
      const memberFromCache = cachedMembers.find(member => member.id === id);
      if (memberFromCache) return memberFromCache;
  }
  const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', id).single();
  if (error) { 
    if (error.code === 'PGRST116') return null; 
    console.error(`Error fetching member by ID ${id}:`, error); 
    return null;
  }
  return data;
};

export const addMember = async (supabaseClient, memberPayload, invalidateCache) => {
  const payload = { ...memberPayload };
  
  // Set default values
  if (!payload.id) payload.id = generateUUID();
  if (!payload.system_member_id) payload.system_member_id = Math.floor(100000 + Math.random() * 900000);
  
  payload.first_name = (memberPayload.first_name ?? '').trim();
  payload.last_name = (memberPayload.last_name ?? '').trim();
  payload.name = `${payload.first_name} ${payload.last_name}`.trim();
  payload.created_at = new Date().toISOString();
  payload.updated_at = new Date().toISOString();
  payload.join_date = payload.join_date || new Date().toISOString().split('T')[0];
  payload.status = payload.status || 'Active';
  payload.role = payload.role || 'member';

  // Handle localStorage fallback
  if (!supabaseClient) {
    console.warn("Supabase client not available. Using localStorage.");
    const members = JSON.parse(localStorage.getItem('members')) || [];
    members.push(payload);
    localStorage.setItem('members', JSON.stringify(members));
    invalidateCache?.('members');
    return payload;
  }

  console.log('Creating member with payload:', payload);
  
  try {
    // Call the RPC function for transactional member creation
    const { data, error } = await supabaseClient
      .rpc('create_member_transactional', { payload })
      .single();
    
    if (error) {
      console.error('RPC Error adding member:', error); 
      throw error;
    }
    
    invalidateCache?.('members');
    
    // If we have billing or membership data, invalidate those caches too
    if (payload.membership_type_id) {
      invalidateCache?.(`memberAssignments_${payload.id}`);
    }
    
    return data;
  } catch (err) {
    console.error('Error in member creation transaction:', err);
    
    // Fallback: Try direct insert if RPC fails (might be due to RPC not being set up)
    try {
      console.log('Falling back to direct insert');
      const { data, error } = await supabaseClient
        .from('profiles')
        .insert(payload)
        .select('*')
        .single();
      
      if (error) throw error;
      
      invalidateCache?.('members');
      return data;
    } catch (fallbackErr) {
      console.error('Fallback insert also failed:', fallbackErr);
      throw new Error(`Failed to add member: ${err.message}`);
    }
  }
};

export const updateMember = async (supabaseClient, id, updatedData, isValidUUID, invalidateCache) => {
  if (!isValidUUID?.(id)) {
      console.error(`Invalid UUID provided for updateMember: ${id}`);
      throw new Error("Invalid member ID for update.");
  }
  
  const dataToUpdate = { ...updatedData };
  dataToUpdate.updated_at = new Date().toISOString();
  dataToUpdate.first_name = (updatedData.first_name ?? '').trim();
  dataToUpdate.last_name = (updatedData.last_name ?? '').trim();
  dataToUpdate.name = `${dataToUpdate.first_name} ${dataToUpdate.last_name}`.trim();
  delete dataToUpdate.membership_type_id;

  if (!supabaseClient) {
    console.warn(`Supabase client not available in memberService.updateMember for ID ${id}. Using localStorage.`);
    let members = JSON.parse(localStorage.getItem('members')) || [];
    members = members.map(m => m.id === id ? { ...m, ...dataToUpdate } : m);
    localStorage.setItem('members', JSON.stringify(members));
    invalidateCache?.('members');
    return members.find(m => m.id === id);
  }

  const { data, error } = await supabaseClient.from('profiles').update(dataToUpdate).eq('id', id).select().single();
  if (error) { 
    console.error('Error updating member:', error); 
    throw new Error(`Failed to update member: ${error.message}`);
  }
  invalidateCache?.('members'); 
  return data;
};

export const archiveMember = async (supabaseClient, memberId, isValidUUID, invalidateCache) => {
  if (!isValidUUID?.(memberId)) {
      console.error(`Invalid UUID provided for archiveMember: ${memberId}`);
      throw new Error("Invalid member ID for archive.");
  }
  const updatedData = { status: 'Archived', updated_at: new Date().toISOString() };

  if (!supabaseClient) {
    console.warn(`Supabase client not available in memberService.archiveMember for ID ${memberId}. Using localStorage.`);
    let members = JSON.parse(localStorage.getItem('members')) || [];
    members = members.map(m => m.id === memberId ? { ...m, ...updatedData } : m);
    localStorage.setItem('members', JSON.stringify(members));
    invalidateCache?.('members');
    return members.find(m => m.id === memberId);
  }

  const { data, error } = await supabaseClient.from('profiles').update(updatedData).eq('id', memberId).select().single();
  if (error) { 
    console.error('Error archiving member:', error); 
    throw new Error(`Failed to archive member: ${error.message}`);
  }
  invalidateCache?.('members'); 
  return data;
};

export const searchMembers = async (supabaseClient, query) => {
  if (!supabaseClient) {
    console.warn("Supabase client not available in memberService.searchMembers. Using localStorage.");
    const members = JSON.parse(localStorage.getItem('members')) || [];
    if (!query || typeof query !== 'string' || query.trim() === '') return members;
    const lowerQuery = query.toLowerCase();
    return members.filter(m => 
        m.name?.toLowerCase().includes(lowerQuery) || 
        m.email?.toLowerCase().includes(lowerQuery) ||
        m.phone?.includes(query)
    );
  }
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return getMembers(supabaseClient, () => false, () => {}, () => null); 
  }
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('name', { ascending: true });
  if (error) {
    console.error('Error searching members:', error);
    throw new Error(`Failed to search members: ${error.message}`);
  }
  return data ?? [];
};

export const getActiveMembers = async (supabaseClient) => {
  if (!supabaseClient) {
    console.warn("Supabase client not available in memberService.getActiveMembers. Using localStorage.");
    const members = JSON.parse(localStorage.getItem('members')) || [];
    return members.filter(m => m.status === 'Active');
  }
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('status', 'Active')
    .order('name', { ascending: true });
  if (error) {
    console.error('Error fetching active members:', error);
    throw new Error(`Failed to fetch active members: ${error.message}`);
  }
  return data ?? [];
};

export const paginateMembers = async (supabaseClient, { page = 1, pageSize = 10 }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const size = Math.max(1, parseInt(pageSize, 10) || 10);
  const from = (pageNum - 1) * size;
  const to = from + size - 1;

  if (!supabaseClient) {
    console.warn("Supabase client not available in memberService.paginateMembers. Using localStorage.");
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const paginatedMembers = members.slice(from, to + 1);
    return { data: paginatedMembers, count: members.length, page: pageNum, pageSize: size };
  }

  const { data, error, count } = await supabaseClient
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error paginating members:', error);
    throw new Error(`Failed to paginate members: ${error.message}`);
  }
  return { data: data ?? [], count: count ?? 0, page: pageNum, pageSize: size };
};


