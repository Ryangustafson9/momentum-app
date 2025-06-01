
const isValidUUID = (uuid) => {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

export const getSupportTickets = async (supabase, options = {}) => {
  let query = supabase.from('support_tickets').select(`
    *,
    member:members ( name, email ),
    assigned_staff:members ( name, email )
  `);

  if (options.status) {
    query = query.eq('status', options.status);
  }
  if (options.priority) {
    query = query.eq('priority', options.priority);
  }
  if (options.category) {
    query = query.eq('category', options.category);
  }
  if (options.assignedToStaffId) {
    query = query.eq('assigned_to_staff_id', options.assignedToStaffId);
  }
  if (options.sortBy && options.sortDirection) {
    query = query.order(options.sortBy, { ascending: options.sortDirection === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching support tickets:', error);
    throw error;
  }
  return { data, count };
};

export const getSupportTicketById = async (supabase, ticketId) => {
  if (!isValidUUID(ticketId)) throw new Error("Invalid ticket ID.");
  
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      member:members ( id, name, email, phone ),
      assigned_staff:members ( id, name, email )
    `)
    .eq('id', ticketId)
    .single();

  if (error) {
    console.error('Error fetching support ticket by ID:', error);
    throw error;
  }
  return data;
};

export const createSupportTicket = async (supabase, ticketData, invalidateCacheCallback) => {
  const newTicket = {
    id: crypto.randomUUID(),
    status: 'Open', 
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...ticketData,
  };

  const { data, error } = await supabase
    .from('support_tickets')
    .insert([newTicket])
    .select()
    .single();

  if (error) {
    console.error('Error creating support ticket:', error);
    throw error;
  }
  if (invalidateCacheCallback) invalidateCacheCallback('support_tickets');
  return data;
};

export const updateSupportTicket = async (supabase, ticketId, updates, invalidateCacheCallback) => {
  if (!isValidUUID(ticketId)) throw new Error("Invalid ticket ID for update.");

  const updatedFields = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('support_tickets')
    .update(updatedFields)
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    console.error('Error updating support ticket:', error);
    throw error;
  }
  if (invalidateCacheCallback) invalidateCacheCallback('support_tickets');
  return data;
};

export const getPendingSupportTicketsCount = async (supabase) => {
    const { count, error } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Open', 'Pending']);
    
    if (error) {
        console.error('Error fetching pending support tickets count:', error);
        return 0;
    }
    return count || 0;
};


