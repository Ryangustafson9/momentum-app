import { supabase } from './supabaseClient.js'; 
import { initialDataSets } from '@/scripts/seedData';
import { initializeAllData } from './services/initializationService';

import * as memberServiceModule from './services/memberService';
import * as staffRoleServiceModule from './services/staffRoleService';
import * as membershipTypeServiceModule from './services/membershipTypeService';
import * as memberAssignmentServiceModule from './services/memberAssignmentService';
import * as classServiceModule from './services/classService';
import * as attendanceServiceModule from './services/attendanceService';
import * as bookingServiceModule from './services/bookingService';
import * as reportServiceModule from './services/reportService';
import * as notificationServiceModule from './services/notificationService';
import * as settingsServiceModule from './services/settingsService';
import * as supportTicketServiceModule from './services/supportTicketService';
import * as memberNotesServiceModule from './services/memberNotesService';
import * as staffMemberNotesServiceModule from './services/staffMemberNotesService';

import { createCache, isCacheValid, updateCache, getCache, invalidateCache, clearAllCaches as clearAppCaches } from './utils/cacheUtils';

const appCache = createCache();

const isValidUUID = (uuid) => {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

const notifyDataChange = (key, detail = {}) => {
    window.dispatchEvent(new CustomEvent('appDataChanged', { detail: { key, ...detail } }));
};

const localInvalidateCache = (key, detail = {}) => {
    invalidateCache(appCache, key);
    notifyDataChange(key, detail); 
};

const getSupabase = () => {
  if (!supabase) {
    console.warn("Supabase client is not initialized. Operations requiring Supabase will fail or use fallbacks.");
  }
  return supabase;
};

const memberServiceWrapper = {
  getAll: () => memberServiceModule.getMembers(getSupabase(), () => isCacheValid(appCache, 'members'), (key, data) => updateCache(appCache, key, data), () => getCache(appCache, 'members')),
  getById: (id) => memberServiceModule.getMemberById(getSupabase(), id, isValidUUID, () => getCache(appCache, 'members')),
  create: (memberData) => {
    const loggedInAuthUserId = dataServiceFunctions.auth.getLoggedInUserId();
    const memberPayload = { ...memberData, auth_user_id: loggedInAuthUserId };
    return memberServiceModule.addMember(getSupabase(), memberPayload, () => localInvalidateCache('members'));
  },
  update: (id, updatedData) => memberServiceModule.updateMember(getSupabase(), id, updatedData, isValidUUID, () => localInvalidateCache('members')),
  archive: (memberId) => memberServiceModule.archiveMember(getSupabase(), memberId, isValidUUID, () => localInvalidateCache('members')),
  search: (query) => memberServiceModule.searchMembers(getSupabase(), query),
  getActive: () => memberServiceModule.getActiveMembers(getSupabase()),
  paginate: (options) => memberServiceModule.paginateMembers(getSupabase(), options),
};

const classServiceWrapper = {
  getAll: () => classServiceModule.getClasses(getSupabase(), () => isCacheValid(appCache, 'classes'), (key, data) => updateCache(appCache, key, data), () => getCache(appCache, 'classes')),
  getById: (id) => classServiceModule.getClassById(getSupabase(), id, isValidUUID, () => getCache(appCache, 'classes')),
  create: (classData) => classServiceModule.addClass(getSupabase(), classData, () => localInvalidateCache('classes')),
  update: (id, updatedData) => classServiceModule.updateClass(getSupabase(), id, updatedData, isValidUUID, () => localInvalidateCache('classes')),
  delete: (id) => classServiceModule.deleteClass(getSupabase(), id, isValidUUID, () => localInvalidateCache('classes')),
  getUpcomingForInstructor: (instructorId) => classServiceModule.getUpcomingClassesForInstructor(getSupabase(), instructorId, isValidUUID),
  getLowCapacity: (threshold) => reportServiceModule.getLowCapacityClasses(getSupabase(), threshold, classServiceWrapper.getAll),
};

const attendanceServiceWrapper = {
  getRecords: (filters = {}) => attendanceServiceModule.getAttendanceRecords(getSupabase(), filters, isValidUUID),
  getCheckInsTodayCount: () => attendanceServiceModule.getCheckInsTodayCount(getSupabase()),
  getRecentCheckIns: (limit) => attendanceServiceModule.getRecentCheckIns(getSupabase(), limit),
  getByMemberAndClass: (memberId, classId) => attendanceServiceModule.getAttendanceByMemberAndClass(getSupabase(), memberId, classId, isValidUUID),
};

const bookingServiceWrapper = {
  bookClass: (memberId, classId) => bookingServiceModule.bookClassForMember(memberId, classId, classServiceWrapper, memberServiceWrapper, attendanceServiceWrapper, localInvalidateCache),
  cancelBooking: (attendanceId, memberId, classId) => bookingServiceModule.cancelClassBookingForMember(attendanceId, memberId, classId, classServiceWrapper, attendanceServiceWrapper, localInvalidateCache),
  recordCheckIn: (memberId, classId = null, notes = '') => bookingServiceModule.recordCheckIn(memberId, classId, notes, classServiceWrapper, memberServiceWrapper, attendanceServiceWrapper, localInvalidateCache),
};

const dataServiceFunctions = {
  supabaseClient: getSupabase,
  initializeAllData: () => initializeAllData(getSupabase(), initialDataSets, dataServiceFunctions),
  
  memberService: memberServiceWrapper,
  classService: classServiceWrapper,
  attendanceService: attendanceServiceWrapper,
  bookingService: bookingServiceWrapper,

  staffRoleService: {
    getAll: () => staffRoleServiceModule.getStaffRoles(getSupabase(), () => isCacheValid(appCache, 'staffRoles'), (key, data) => updateCache(appCache, key, data), () => getCache(appCache, 'staffRoles'), initialDataSets.initialStaffRoles),
    saveAll: (roles) => staffRoleServiceModule.saveStaffRoles(getSupabase(), roles, () => localInvalidateCache('staffRoles')),
    getAllPermissions: () => staffRoleServiceModule.getAllPermissions(initialDataSets.initialPermissions),
    getById: (roleId) => {
        const roles = getCache(appCache, 'staffRoles') || initialDataSets.initialStaffRoles;
        return roles.find(role => role.id === roleId);
    },
  },
  
  membershipTypeService: {
    getAll: () => membershipTypeServiceModule.getMembershipTypes(getSupabase(), () => isCacheValid(appCache, 'membership_types'), (key, data) => updateCache(appCache, key, data), () => getCache(appCache, 'membership_types')),
    create: (typeData) => membershipTypeServiceModule.addMembershipType(getSupabase(), typeData, isValidUUID, () => localInvalidateCache('membership_types')),
    update: (id, updatedData) => membershipTypeServiceModule.updateMembershipType(getSupabase(), id, updatedData, isValidUUID, () => localInvalidateCache('membership_types')),
    delete: (id) => membershipTypeServiceModule.deleteMembershipType(getSupabase(), id, isValidUUID, () => localInvalidateCache('membership_types')),
    getById: (id) => {
      const types = getCache(appCache, 'membership_types') || initialDataSets.initialMembershipTypes;
      return types.find(type => type.id === id);
    },
  },

  memberAssignmentService: {
    assignToMember: (memberId, membershipTypeId, startDate, endDate, pricePaid, notes) => 
      memberAssignmentServiceModule.assignMembershipToMember(getSupabase(), memberId, membershipTypeId, startDate, endDate, pricePaid, notes, () => localInvalidateCache(`memberAssignments_${memberId}`), dataServiceFunctions.auth.getLoggedInUserId),
    getForMember: (memberId) => memberAssignmentServiceModule.getMemberAssignments(getSupabase(), memberId, isValidUUID),
    updateStatus: (assignmentId, newStatus, memberId) =>
      memberAssignmentServiceModule.updateMemberAssignmentStatus(getSupabase(), assignmentId, newStatus, memberId, () => localInvalidateCache(`memberAssignments_${memberId}`), dataServiceFunctions.auth.getLoggedInUserId),
    removeFromMember: (memberId, assignmentId, membershipTypeId) =>
      memberAssignmentServiceModule.removeMembershipFromMember(getSupabase(), memberId, assignmentId, membershipTypeId, () => localInvalidateCache(`memberAssignments_${memberId}`), dataServiceFunctions.auth.getLoggedInUserId),
    getLogForMember: (memberId) => memberAssignmentServiceModule.getMembershipLogForMember(getSupabase(), memberId, isValidUUID),
  },
  
  reportService: {
    getExpiringMemberships: (days) => reportServiceModule.getExpiringMemberships(getSupabase(), days, memberServiceWrapper.getAll),
    getLowCapacityClasses: (threshold) => reportServiceModule.getLowCapacityClasses(getSupabase(), threshold, classServiceWrapper.getAll),
  },

  notificationService: {
    getForUser: (userId) => notificationServiceModule.getNotifications(getSupabase(), userId),
    markAsRead: (id) => notificationServiceModule.markNotificationAsRead(getSupabase(), id, isValidUUID, () => localInvalidateCache('notifications', { event: 'userNotificationsUpdated' })),
    markAllAsRead: (userId) => notificationServiceModule.markAllNotificationsAsRead(getSupabase(), userId, () => localInvalidateCache('notifications', { event: 'userNotificationsUpdated' })),
    create: (notificationData) => notificationServiceModule.addNotification(getSupabase(), notificationData, () => localInvalidateCache('notifications', { event: 'userNotificationsUpdated' })),
    clearForUser: (userId) => notificationServiceModule.clearNotifications(getSupabase(), userId, () => localInvalidateCache('notifications', { event: 'userNotificationsUpdated' })),
  },

  settingsService: {
    getGeneral: () => settingsServiceModule.getGeneralSettings(getSupabase(), () => isCacheValid(appCache, 'generalSettings'), (key, data) => updateCache(appCache, key, data), () => getCache(appCache, 'generalSettings'), initialDataSets.initialGeneralSettings),
    updateGeneral: (settingsData) => settingsServiceModule.saveGeneralSettings(getSupabase(), settingsData, () => localInvalidateCache('generalSettings')),
    getNotification: () => settingsServiceModule.getNotificationSettings(getSupabase(), () => isCacheValid(appCache, 'notificationSettings'), (key, data) => updateCache(appCache, key, data), () => getCache(appCache, 'notificationSettings'), initialDataSets.initialNotificationSettings),
    updateNotification: (settingsData) => settingsServiceModule.saveNotificationSettings(getSupabase(), settingsData, () => localInvalidateCache('notificationSettings')),
    getAdminPanel: () => settingsServiceModule.getAdminPanelSettings(getSupabase(), () => isCacheValid(appCache, 'adminPanelSettings'), (key, data) => updateCache(appCache, key, data), () => getCache(appCache, 'adminPanelSettings'), initialDataSets.initialAdminPanelSettings),
    updateAdminPanel: (settingsData) => settingsServiceModule.saveAdminPanelSettings(getSupabase(), settingsData, () => localInvalidateCache('adminPanelSettings')),
    getLayout: () => settingsServiceModule.getLayoutSettings(localStorage, (key) => getCache(appCache, key), (key, data) => updateCache(appCache, key, data), (key) => isCacheValid(appCache, key)),
    saveLayout: (settings) => settingsServiceModule.saveLayoutSettings(localStorage, settings, () => localInvalidateCache('layoutSettings'), () => dataServiceFunctions.settingsService.getLayout()),
  },
  
  auth: {
      getLoggedInUser: () => {
        const impersonationData = JSON.parse(localStorage.getItem('impersonationData'));
        if (impersonationData?.isImpersonating) {
          return impersonationData.impersonatedUser;
        }
        const storedUser = localStorage.getItem('loggedInUser');
        try {
          return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
          console.error("Failed to parse loggedInUser from localStorage", e);
          localStorage.removeItem('loggedInUser');
          return null;
        }
    },
    getLoggedInUserId: () => {
      const user = dataServiceFunctions.auth.getLoggedInUser();
      return user?.id || null; 
    },
  },

  logImpersonationEvent: async (adminUserId, impersonatedMemberId, action, notes = null) => {
    if (!getSupabase()) { console.warn("Supabase not init, skipping logImpersonationEvent"); return; }
    if (!adminUserId || !action) {
      console.error("Missing data for impersonation log:", { adminUserId, impersonatedMemberId, action, notes });
      return;
    }
    try {
      const logEntry = {
        member_id: impersonatedMemberId, 
        action: action, 
        notes: notes || `Admin (${adminUserId}) ${action.replace(/_/g, ' ')}.`,
        created_by: adminUserId, 
        logged_at: new Date().toISOString(),
      };
      if (!impersonatedMemberId) {
        delete logEntry.member_id; 
      }

      const { error } = await getSupabase().from('member_membership_log').insert(logEntry);
      if (error) {
        console.error('Error logging impersonation event:', error);
        throw error;
      }
    } catch (err) {
      console.error('Failed to log impersonation event in dataService:', err);
    }
  },

  supportTicketService: {
    getAll: (options) => supportTicketServiceModule.getSupportTickets(getSupabase(), options),
    getById: (ticketId) => supportTicketServiceModule.getSupportTicketById(getSupabase(), ticketId, isValidUUID),
    create: (ticketData) => supportTicketServiceModule.createSupportTicket(getSupabase(), ticketData, () => localInvalidateCache('supportTickets')),
    update: (ticketId, updates) => supportTicketServiceModule.updateSupportTicket(getSupabase(), ticketId, updates, isValidUUID, () => localInvalidateCache('supportTickets')),
    getPendingCount: () => supportTicketServiceModule.getPendingSupportTicketsCount(getSupabase()),
  },

  memberNotesService: {
    getForMember: (memberId) => memberNotesServiceModule.getMemberNotes(getSupabase(), memberId, isValidUUID),
    create: (memberId, content) => memberNotesServiceModule.addMemberNote(getSupabase(), memberId, content, isValidUUID, () => localInvalidateCache(`memberNotes_${memberId}`)),
    update: (noteId, content) => memberNotesServiceModule.updateMemberNote(getSupabase(), noteId, content, isValidUUID, localInvalidateCache),
    delete: (noteId) => memberNotesServiceModule.deleteMemberNote(getSupabase(), noteId, isValidUUID, localInvalidateCache),
  },

  staffMemberNotesService: {
    getForMember: (memberId) => staffMemberNotesServiceModule.getStaffMemberNotes(getSupabase(), memberId, isValidUUID),
    create: (memberId, staffId, content) => staffMemberNotesServiceModule.addStaffMemberNote(getSupabase(), memberId, staffId, content, isValidUUID, () => localInvalidateCache(`staffMemberNotes_${memberId}`)),
    update: (noteId, content) => staffMemberNotesServiceModule.updateStaffMemberNote(getSupabase(), noteId, content, isValidUUID, localInvalidateCache),
    delete: (noteId) => staffMemberNotesServiceModule.deleteStaffMemberNote(getSupabase(), noteId, isValidUUID, localInvalidateCache),
  },
  
  invalidateCache: localInvalidateCache,
  clearAllCaches: () => clearAppCaches(appCache),
};

export const dataService = dataServiceFunctions;

// ADD THESE CONVENIENCE EXPORTS:
export const getGeneralSettings = () => dataService.settingsService.getGeneral();
export const getNotificationSettings = () => dataService.settingsService.getNotification();
export const getAdminPanelSettings = () => dataService.settingsService.getAdminPanel();
export const getMembers = () => dataService.memberService.getAll();
export const getClasses = () => dataService.classService.getAll();
export const getMembershipTypes = () => dataService.membershipTypeService.getAll();

// Keep existing dataService initialization
if (typeof window !== 'undefined') {
  dataService.initializeAllData().then(() => {
    console.log("Initial data check complete via dataService bootstrap.");
  }).catch(error => {
    console.error("Error during initial data check via dataService bootstrap:", error);
  });
}


