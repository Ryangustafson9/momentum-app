
export const getExpiringMemberships = async (supabase, daysThreshold = 30, getMembersFn) => {
  const members = await getMembersFn(); 
  if (!Array.isArray(members)) return [];
  
  const today = new Date();
  const thresholdDate = new Date(today);
  thresholdDate.setDate(today.getDate() + daysThreshold);

  const expiring = [];
  for (const member of members) {
    if (member.current_membership_type_id) {
      const { data: assignments, error } = await supabase
        .from('member_membership_assignments')
        .select('end_date, status')
        .eq('member_id', member.id)
        .eq('membership_type_id', member.current_membership_type_id)
        .order('end_date', { ascending: false });

      if (error) {
        console.error(`Error fetching assignments for member ${member.id}:`, error);
        continue;
      }
      
      if (assignments && assignments.length > 0) {
        const latestActiveAssignment = assignments.find(a => a.status === 'active' || a.status === 'pending_renewal');
        if (latestActiveAssignment && latestActiveAssignment.end_date) {
          const endDate = new Date(latestActiveAssignment.end_date);
          if (endDate <= thresholdDate && endDate >= today) {
            expiring.push({ ...member, membership_end_date: latestActiveAssignment.end_date });
          }
        }
      }
    }
  }
  return expiring;
};

export const getLowCapacityClasses = async (supabase, spotsThreshold = 5, getClassesFn) => {
  const classes = await getClassesFn(); 
  if (!Array.isArray(classes)) return [];
  return classes.filter(c => (c.max_capacity - (c.booked_count || 0)) <= spotsThreshold && (c.max_capacity - (c.booked_count || 0)) > 0 && new Date(c.start_time) >= new Date());
};


