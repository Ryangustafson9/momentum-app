
export const getStaffRoles = async (supabase, isCacheValid, updateCache, getCache, initialStaffRoles) => {
  if (isCacheValid('staffRoles')) {
      const cachedData = getCache('staffRoles');
      if (cachedData) return cachedData;
  }
  const { data, error } = await supabase.from('staff_roles').select('id, name, description, permissions');
  if (error) { 
      console.error("Error fetching staff roles:", error.message, "This could be due to Row Level Security (RLS) policies. Please check your Supabase dashboard. Falling back to initial data if provided."); 
      // Fallback to initialStaffRoles only if data is null or error specifically indicates an RLS issue preventing select,
      // or if initialStaffRoles is explicitly meant as a static fallback.
      // For now, if there's an error, we'll return the initial roles if available, otherwise an empty array.
      return initialStaffRoles || []; 
  } 
  // If data is successfully fetched but empty, and initialStaffRoles exist, it might mean RLS allows select but table is empty.
  // In such cases, using initialStaffRoles might be intended for initial setup.
  const rolesToCache = data && data.length > 0 ? data : (initialStaffRoles || []);
  updateCache('staffRoles', rolesToCache);
  return rolesToCache;
};

export const saveStaffRoles = async (supabase, roles, invalidateCache) => {
  try {
    if (!roles || roles.length === 0) {
        console.warn("No roles provided to saveStaffRoles.");
        return;
    }
    const upsertPromises = roles.map(role => {
        const rolePayload = {
            id: role.id || role.name?.toLowerCase().replace(/\s+/g, '-') || crypto.randomUUID(),
            name: role.name,
            description: role.description,
            permissions: role.permissions || {}, // Ensure permissions is an object
            created_at: role.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        return supabase.from('staff_roles').upsert(rolePayload, { onConflict: 'id' });
    });
    
    const results = await Promise.all(upsertPromises);
    
    let anErrorOccurred = false;
    results.forEach(result => {
        if (result.error) { 
          console.error('Error saving staff role:', result.error.message, 'Details:', result.error.details); 
          anErrorOccurred = true;
          // Do not throw here to allow other upserts to proceed if possible,
          // aggregate errors and throw once or handle as per requirements.
        }
    });

    if (anErrorOccurred) {
        // Consider if a partial success is acceptable or if any error should rollback/fail all.
        // For now, we throw a generic error if any individual upsert failed.
        throw new Error(`One or more staff roles could not be saved. Check console for details. This is likely due to Row Level Security (RLS) policies not allowing insert/update for the current user.`);
    }
    
    invalidateCache('staffRoles'); 
    console.log("Successfully saved/upserted staff roles.");
  } catch (error) {
    // This will catch the error thrown above or any other unexpected error.
    console.error("Overall error in saveStaffRoles:", error.message);
    throw error; // Re-throw the error to be caught by the caller.
  }
};

export const getAllPermissions = (initialPermissions) => { 
  return initialPermissions || {
      manage_members: false,
      manage_classes: false,
      manage_schedule: false,
      manage_billing: false,
      manage_staff: false,
      access_reports: false,
      manage_settings: false,
      can_check_in_members: false,
      can_impersonate_users: false,
  };
};


