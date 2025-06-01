
export const getGeneralSettings = async (supabase, isCacheValid, updateCache, getCache) => {
  if (isCacheValid('generalSettings')) return getCache('generalSettings');
  const { data, error } = await supabase.from('general_settings').select('*').eq('id', 1).single(); 
  if (error && error.code !== 'PGRST116') { 
      console.error('Error fetching general settings:', error); 
      throw error; 
  }
  const settings = data || { id: 1, gym_name: 'FitTrack Gym', admin_email: 'admin@fittrack.com', timezone: 'UTC' }; 
  updateCache('generalSettings', settings);
  return settings;
};
export const saveGeneralSettings = async (supabase, settings, invalidateCache) => {
  const { error } = await supabase.from('general_settings').upsert({ ...settings, id: 1, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (error) { console.error('Error saving general settings:', error); throw error; }
  invalidateCache('generalSettings');
  window.dispatchEvent(new CustomEvent('generalSettingsUpdated'));
};

export const getNotificationSettings = async (supabase, isCacheValid, updateCache, getCache) => {
  if (isCacheValid('notificationSettings')) return getCache('notificationSettings');
  const { data, error } = await supabase.from('notification_settings').select('*').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') { console.error('Error fetching notification settings:', error); throw error; }
  const settings = data || { id: 1, email_new_member: true, email_class_booking: true };
  updateCache('notificationSettings', settings);
  return settings;
};
export const saveNotificationSettings = async (supabase, settings, invalidateCache) => {
  const { error } = await supabase.from('notification_settings').upsert({ ...settings, id: 1, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (error) { console.error('Error saving notification settings:', error); throw error; }
  invalidateCache('notificationSettings');
};

export const getAdminPanelSettings = async (supabase, isCacheValid, updateCache, getCache) => {
  if (isCacheValid('adminPanelSettings')) return getCache('adminPanelSettings');
  const { data, error } = await supabase.from('admin_panel_settings').select('*').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') { console.error('Error fetching admin panel settings:', error); throw error; }
  const settings = data || { id: 1, require_first_name: true, require_last_name: true, require_email: true, require_phone: false, require_dob: false, require_address: false };
  updateCache('adminPanelSettings', settings);
  return settings;
};
export const saveAdminPanelSettings = async (supabase, settings, invalidateCache) => {
  const { error } = await supabase.from('admin_panel_settings').upsert({ ...settings, id: 1, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (error) { console.error('Error saving admin panel settings:', error); throw error; }
  invalidateCache('adminPanelSettings');
};

export const getLayoutSettings = (localStorage, getCache, updateCache, isCacheValid) => { 
  if (isCacheValid('layoutSettings')) return getCache('layoutSettings');
  const settingsString = localStorage.getItem('layoutSettings');
  let settings = {};
  try {
    settings = settingsString ? JSON.parse(settingsString) : { sidebarInitiallyOpen: true };
  } catch (e) {
    console.error("Error parsing layout settings from localStorage", e);
    settings = { sidebarInitiallyOpen: true }; 
  }
  const finalSettings = { 
    sidebarInitiallyOpen: settings?.sidebarInitiallyOpen !== undefined ? settings.sidebarInitiallyOpen : true,
  };
  updateCache('layoutSettings', finalSettings);
  return finalSettings;
};
export const saveLayoutSettings = (localStorage, settings, invalidateCache, getLayoutSettingsFunc) => {
  const currentSettings = getLayoutSettingsFunc(localStorage); // Pass localStorage here
  const newSettings = { ...currentSettings, ...settings };
  const validSettings = {
      sidebarInitiallyOpen: newSettings.sidebarInitiallyOpen,
  };
  localStorage.setItem('layoutSettings', JSON.stringify(validSettings));
  invalidateCache('layoutSettings');
  window.dispatchEvent(new CustomEvent('layoutSettingsUpdated'));
};

export const getSecuritySettings = async (localStorage, getCache, updateCache, isCacheValid) => { 
  if (isCacheValid('securitySettings')) return getCache('securitySettings');
  const defaultSettings = { two_factor_auth_enabled: false, session_timeout: 30 }; 
  const settingsString = localStorage.getItem('securitySettings');
  let settings = defaultSettings;
  try {
      settings = settingsString ? JSON.parse(settingsString) : defaultSettings;
  } catch(e) { console.error("Error parsing security settings", e); }
  updateCache('securitySettings', settings);
  return settings;
};
export const saveSecuritySettings = async (localStorage, settings, invalidateCache) => { 
  localStorage.setItem('securitySettings', JSON.stringify(settings));
  invalidateCache('securitySettings');
};

export const getBillingSettings = async (localStorage, getCache, updateCache, isCacheValid) => { 
  if (isCacheValid('billingSettings')) return getCache('billingSettings');
  const defaultSettings = { currency: 'USD', tax_rate: 0, payment_gateway: 'stripe' }; 
  const settingsString = localStorage.getItem('billingSettings');
  let settings = defaultSettings;
  try {
      settings = settingsString ? JSON.parse(settingsString) : defaultSettings;
  } catch(e) { console.error("Error parsing billing settings", e); }
  updateCache('billingSettings', settings);
  return settings;
};
export const saveBillingSettings = async (localStorage, settings, invalidateCache) => { 
  localStorage.setItem('billingSettings', JSON.stringify(settings));
  invalidateCache('billingSettings');
};


