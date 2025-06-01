
export const initializeGeneralSettingsPart = async (supabase, initialSettings) => {
  const { data: existingGeneralSettings, error: fetchError } = await supabase.from('general_settings').select('id').limit(1).maybeSingle();
  
  if (fetchError) {
    console.error("Error fetching general_settings:", fetchError.message);
    return;
  }

  if (!existingGeneralSettings && initialSettings) {
    const { error: insertError } = await supabase.from('general_settings').insert([{ 
      id: 1, 
      gym_name: initialSettings.gymName || 'FitTrack Gym', 
      admin_email: initialSettings.adminEmail || 'admin@fittrack.com', 
      timezone: initialSettings.timezone || 'UTC',
      updated_at: new Date().toISOString()
    }]);
    if (insertError) {
      console.error("Error initializing general_settings:", insertError.message);
    } else {
      console.log("Successfully initialized general_settings.");
    }
  }
};

export const initializeNotificationSettingsPart = async (supabase, initialSettings) => {
  const { data: existingSettings, error: fetchError } = await supabase.from('notification_settings').select('id').limit(1).maybeSingle();

  if (fetchError) {
    console.error("Error fetching notification_settings:", fetchError.message);
    return;
  }
  
  if (!existingSettings && initialSettings) {
    const { error: insertError } = await supabase.from('notification_settings').insert([{
      id: 1,
      email_new_member: initialSettings.emailNewMember !== undefined ? initialSettings.emailNewMember : true,
      email_class_booking: initialSettings.emailClassBooking !== undefined ? initialSettings.emailClassBooking : true,
      updated_at: new Date().toISOString()
    }]);
    if (insertError) {
      console.error("Error initializing notification_settings:", insertError.message);
    } else {
      console.log("Successfully initialized notification_settings.");
    }
  }
};

export const initializeAdminPanelSettingsPart = async (supabase, initialSettings) => {
  const { data: existingSettings, error: fetchError } = await supabase.from('admin_panel_settings').select('id').limit(1).maybeSingle();

  if (fetchError) {
    console.error("Error fetching admin_panel_settings:", fetchError.message);
    return;
  }

  if (!existingSettings && initialSettings) {
    const { error: insertError } = await supabase.from('admin_panel_settings').insert([{
      id: 1,
      require_first_name: initialSettings.requireFirstName !== undefined ? initialSettings.requireFirstName : true,
      require_last_name: initialSettings.requireLastName !== undefined ? initialSettings.requireLastName : true,
      require_email: initialSettings.requireEmail !== undefined ? initialSettings.requireEmail : true,
      require_phone: initialSettings.requirePhone !== undefined ? initialSettings.requirePhone : false,
      require_dob: initialSettings.requireDOB !== undefined ? initialSettings.requireDOB : false,
      require_address: initialSettings.requireAddress !== undefined ? initialSettings.requireAddress : false,
      updated_at: new Date().toISOString()
    }]);
    if (insertError) {
      console.error("Error initializing admin_panel_settings:", insertError.message);
    } else {
      console.log("Successfully initialized admin_panel_settings.");
    }
  }
};


export const initializeStaffRolesPart = async (supabase, initialStaffRoles) => {
  try {
    if (!initialStaffRoles || initialStaffRoles.length === 0) {
      console.log("No initial staff roles provided or empty array, skipping initialization.");
      return;
    }

    const rolesToUpsert = initialStaffRoles.map(role => ({
      id: role.id || role.name.toLowerCase().replace(/\s+/g, '-'),
      name: role.name,
      description: role.description,
      permissions: role.permissions || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error: upsertError } = await supabase
      .from('staff_roles')
      .upsert(rolesToUpsert, { onConflict: 'id' });

    if (upsertError) {
      console.error(`Database Error initializing 'staff_roles'. Message: "${upsertError.message}". RLS policies or other constraints might be active.`);
       if (upsertError.message.includes('violates row-level security policy')) {
         console.error("This is likely due to RLS. Ensure INSERT/UPDATE policies for 'staff_roles' allow this operation for the 'anon' or relevant role during initialization.");
       }
    } else {
      console.log("Successfully initialized/upserted staff_roles.");
    }
  } catch (staffRolesError) {
    console.error("Outer catch during initializeStaffRoles: Unhandled error initializing staff_roles.", staffRolesError.message);
  }
};

export const initializeMembershipTypesPart = async (supabase, initialMembershipTypes) => {
  if (!initialMembershipTypes || initialMembershipTypes.length === 0) {
    console.log("No initial membership types provided or empty array, skipping initialization.");
    return;
  }
  const { data: existingMembershipTypesCount, error: countError } = await supabase.from('membership_types').select('id', { count: 'exact', head: true });
  
  if (countError) {
    console.error("Error counting membership_types, skipping initialization:", countError.message);
    return;
  }

  if (existingMembershipTypesCount === 0) {
      const typesToInsert = initialMembershipTypes.map(mt => ({
          id: mt.id, 
          name: mt.name,
          price: mt.price,
          billing_type: mt.billing_type, 
          duration_months: mt.duration_months, 
          features: mt.features || [],
          available_for_sale: mt.available_for_sale !== undefined ? mt.available_for_sale : (mt.availableForSale !== undefined ? mt.availableForSale : true),
          category: mt.category, 
          color: mt.color,
          role_id: mt.role_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
      }));
      const { error: insertError } = await supabase.from('membership_types').insert(typesToInsert);
      if (insertError) {
        console.error("Error initializing membership_types:", insertError.message);
         if (insertError.message.includes("column \"role_id\" of relation \"membership_types\" does not exist")) {
           console.error("The 'role_id' column is missing from the 'membership_types' table. Please ensure database migrations are applied.");
         }
      } else {
        console.log("Successfully initialized membership_types.");
      }
  }
};

export const initializeClassesPart = async (supabase, initialClassesData) => {
  if (!initialClassesData || initialClassesData.length === 0) {
    console.log("No initial classes data provided or empty array, skipping initialization.");
    return;
  }
  const { data: existingClassesCount, error: countError } = await supabase.from('classes').select('id', { count: 'exact', head: true });

  if (countError) {
    console.error("Error counting classes, skipping initialization:", countError.message);
    return;
  }

  if (existingClassesCount === 0) {
      const classesToInsert = initialClassesData.map(c => ({
        id: c.id, 
        name: c.name,
        description: c.description,
        instructor_name: c.instructorName, 
        instructor_id: c.instructorId,
        start_time: c.startTime || c.start_time || new Date().toISOString(), 
        end_time: c.endTime || c.end_time || new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), 
        max_capacity: c.max_capacity,
        booked_count: c.enrolled || c.booked_count || 0,
        location: c.location,
        difficulty: c.difficulty,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      const {error: insertError } = await supabase.from('classes').insert(classesToInsert);
      if (insertError) {
        console.error("Error initializing classes:", insertError.message);
      } else {
        console.log("Successfully initialized classes.");
      }
  }
};

export const initializeTestMembersPart = async (supabase, testMembersData) => {
  if (!testMembersData || testMembersData.length === 0) {
    console.log("No test members data provided, skipping initialization.");
    return;
  }
  console.log(`Starting initialization of ${testMembersData.length} test members.`);

  const { data: existingMembers, error: fetchError } = await supabase
    .from('profiles')
    .select('email')
    .in('email', testMembersData.map(m => m.email));

  if (fetchError) {
    console.error("Error fetching existing test members during initialization:", fetchError.message);
    return;
  }

  const existingEmails = existingMembers.map(m => m.email);
  const membersToInsert = testMembersData.filter(m => !existingEmails.includes(m.email));

  if (membersToInsert.length === 0) {
    console.log("All test members already exist in the database.");
    return;
  }

  console.log(`Attempting to insert ${membersToInsert.length} new test members via RPC.`);
  let successCount = 0;
  let errorCount = 0;

  for (const member of membersToInsert) {
    const memberPayload = { ...member };
    if (!memberPayload.id) {
      memberPayload.id = crypto.randomUUID();
    }
    
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_member_transactional', { member_payload: memberPayload });
      
      if (rpcError) {
        console.error(`Error inserting test member ${member.email} via RPC:`, rpcError.message, 'Details:', rpcError.details, 'Hint:', rpcError.hint);
        errorCount++;
      } else if (rpcData && rpcData.length > 0) {
        successCount++;
      } else {
         const { data: checkData, error: checkError } = await supabase.from('profiles').select('id').eq('email', member.email).limit(1);
         if (checkError) {
            console.error(`Error checking for member ${member.email} after RPC call:`, checkError.message);
            errorCount++;
         } else if (checkData && checkData.length > 0) {
            successCount++;
         } else {
            console.error(`Member ${member.email} still not found after RPC call and secondary check.`);
            errorCount++;
         }
      }
    } catch (exception) {
      console.error(`Exception during RPC call for test member ${member.email}:`, exception.message, exception);
      errorCount++;
    }
  }
  console.log(`Test member initialization complete. Success: ${successCount}, Errors: ${errorCount}.`);
};


