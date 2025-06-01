
export const getNotifications = async (supabaseClient, userId) => {
  if (!supabaseClient) {
    console.warn("Supabase client not available in notificationService.getNotifications. Returning empty array.");
    return [];
  }
  if (!userId) return []; 
  const { data, error } = await supabaseClient
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
  return data;
};

export const addNotification = async (supabaseClient, notificationData, invalidateCacheCallback) => {
  if (!supabaseClient) {
    console.warn("Supabase client not available in notificationService.addNotification.");
    throw new Error("Supabase client not available.");
  }
  const newNotification = {
    id: crypto.randomUUID(),
    ...notificationData, 
    read: false,
    created_at: new Date().toISOString(),
  };
  if (!newNotification.user_id) {
      console.warn("Attempted to add notification without user_id:", newNotification);
      throw new Error("Notification must have a user_id.");
  }
  const { error } = await supabaseClient.from('notifications').insert([newNotification]);
  if (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
  if (invalidateCacheCallback) invalidateCacheCallback('notifications', { event: 'userNotificationsUpdated' });
};

export const markNotificationAsRead = async (supabaseClient, notificationId, isValidUUID, invalidateCacheCallback) => {
  if (!supabaseClient) {
    console.warn("Supabase client not available in notificationService.markNotificationAsRead.");
    throw new Error("Supabase client not available.");
  }
  if (!isValidUUID(notificationId)) throw new Error("Invalid notification ID for marking as read.");
  const { error } = await supabaseClient
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
  if (invalidateCacheCallback) invalidateCacheCallback('notifications', { event: 'userNotificationsUpdated' });
};

export const markAllNotificationsAsRead = async (supabaseClient, userId, invalidateCacheCallback) => {
  if (!supabaseClient) {
    console.warn("Supabase client not available in notificationService.markAllNotificationsAsRead.");
    throw new Error("Supabase client not available.");
  }
  if (!userId) return; 
  const { error } = await supabaseClient
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
  if (invalidateCacheCallback) invalidateCacheCallback('notifications', { event: 'userNotificationsUpdated' });
};

export const clearNotifications = async (supabaseClient, userId, invalidateCacheCallback) => {
  if (!supabaseClient) {
    console.warn("Supabase client not available in notificationService.clearNotifications.");
    throw new Error("Supabase client not available.");
  }
  if (!userId) return; 
  const { error } = await supabaseClient
    .from('notifications')
    .delete()
    .eq('user_id', userId);
  if (error) {
    console.error('Error clearing notifications:', error);
    throw error;
  }
  if (invalidateCacheCallback) invalidateCacheCallback('notifications', { event: 'userNotificationsUpdated' });
};


