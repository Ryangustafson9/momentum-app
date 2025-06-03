/**
 * SINGLE SOURCE OF TRUTH for all role-related logic
 * All role definitions, permissions, and access rules are defined here
 */

// ⭐ MASTER: Valid roles in the system
export const VALID_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff', 
  MEMBER: 'member',
  NONMEMBER: 'nonmember',
  INACTIVE: 'inactive'
};

// ⭐ MASTER: Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [VALID_ROLES.ADMIN]: 100,
  [VALID_ROLES.STAFF]: 50,
  [VALID_ROLES.MEMBER]: 25,
  [VALID_ROLES.NONMEMBER]: 10,
  [VALID_ROLES.INACTIVE]: 0
};

// ⭐ MASTER: Default routes per role
export const ROLE_DEFAULT_ROUTES = {
  [VALID_ROLES.ADMIN]: '/admin/dashboard',
  [VALID_ROLES.STAFF]: '/staff/staffdashboard',
  [VALID_ROLES.MEMBER]: '/member/memberdashboard',
  [VALID_ROLES.NONMEMBER]: '/dashboard',
  [VALID_ROLES.INACTIVE]: '/dashboard'
};

// ⭐ MASTER: Accessible route patterns per role
export const ROLE_ACCESSIBLE_ROUTES = {
  [VALID_ROLES.ADMIN]: [
    '/dashboard', '/profile', '/settings',
    '/admin/*', '/staff/*', '/member/*'
  ],
  [VALID_ROLES.STAFF]: [
    '/dashboard', '/profile', '/settings',
    '/staff/*', '/member/*'
  ],
  [VALID_ROLES.MEMBER]: [
    '/dashboard', '/profile', '/settings',
    '/member/*'
  ],
  [VALID_ROLES.NONMEMBER]: [
    '/dashboard', '/profile'
  ],
  [VALID_ROLES.INACTIVE]: [
    '/dashboard'
  ]
};

// ⭐ MASTER: Component access permissions
export const ROLE_PERMISSIONS = {
  [VALID_ROLES.ADMIN]: {
    // Dashboard & Navigation
    canViewDashboard: true,
    canEditProfile: true,
    canAccessAdminPanel: true,
    
    // User Management
    canManageUsers: true,
    canImpersonateUsers: true,
    canViewAllProfiles: true,
    canDeleteUsers: true,
    
    // Content Management
    canManageClasses: true,
    canManageMembers: true,
    canManageSettings: true,
    canManageReports: true,
    
    // Financial
    canViewReports: true,
    canManageBilling: true,
    canViewRevenue: true,
    
    // System
    canCheckInMembers: true,
    canManageEquipment: true,
    canViewLogs: true
  },
  
  [VALID_ROLES.STAFF]: {
    // Dashboard & Navigation
    canViewDashboard: true,
    canEditProfile: true,
    canAccessAdminPanel: false,
    
    // User Management
    canManageUsers: false,
    canImpersonateUsers: false,
    canViewAllProfiles: true,
    canDeleteUsers: false,
    
    // Content Management
    canManageClasses: true,
    canManageMembers: true,
    canManageSettings: false,
    canManageReports: true,
    
    // Financial
    canViewReports: true,
    canManageBilling: false,
    canViewRevenue: false,
    
    // System
    canCheckInMembers: true,
    canManageEquipment: true,
    canViewLogs: false
  },
  
  [VALID_ROLES.MEMBER]: {
    // Dashboard & Navigation
    canViewDashboard: true,
    canEditProfile: true,
    canAccessAdminPanel: false,
    
    // User Management
    canManageUsers: false,
    canImpersonateUsers: false,
    canViewAllProfiles: false,
    canDeleteUsers: false,
    
    // Content Management
    canManageClasses: false,
    canManageMembers: false,
    canManageSettings: false,
    canManageReports: false,
    
    // Financial
    canViewReports: false,
    canManageBilling: true, // Own billing only
    canViewRevenue: false,
    
    // System
    canCheckInMembers: false,
    canManageEquipment: false,
    canViewLogs: false,
    
    // Member-specific
    canBookClasses: true,
    canViewSchedule: true,
    canCancelBookings: true
  },
  
  [VALID_ROLES.NONMEMBER]: {
    canViewDashboard: true,
    canEditProfile: true,
    canViewSchedule: true, // Limited view
    canBookClasses: false
  },
  
  [VALID_ROLES.INACTIVE]: {
    canViewDashboard: true,
    canEditProfile: false
  }
};

/**
 * Normalize user role to standard values
 * @param {string} role - Raw role from database
 * @returns {string} Normalized role
 */
export const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') {
    return VALID_ROLES.MEMBER; // Default role
  }

  const normalizedRole = role.toLowerCase().trim();
  
  switch (normalizedRole) {
    case 'admin':
    case 'administrator':
    case 'super_admin':
      return VALID_ROLES.ADMIN;
      
    case 'staff':
    case 'employee':
    case 'instructor':
    case 'trainer':
      return VALID_ROLES.STAFF;
      
    case 'member':
    case 'active':
    case 'active_member':
      return VALID_ROLES.MEMBER;
      
    case 'nonmember':
    case 'non_member':
    case 'inactive':
    case 'expired':
    case 'guest':
      return VALID_ROLES.NONMEMBER;
      
    default:
      console.warn('🔧 Unknown role:', role, '- defaulting to member');
      return VALID_ROLES.MEMBER;
  }
};

/**
 * Get default route for a role
 * @param {string} role - User role
 * @returns {string} Default route path
 */
export const getDefaultRoute = (role) => {
  const normalized = normalizeRole(role);
  return ROLE_DEFAULT_ROUTES[normalized] || '/dashboard';
};

/**
 * Get accessible routes for a role
 * @param {string} role - User role
 * @returns {Array} Array of accessible route patterns
 */
export const getAccessibleRoutes = (role) => {
  const normalized = normalizeRole(role);
  return ROLE_ACCESSIBLE_ROUTES[normalized] || ['/dashboard'];
};

/**
 * Check if a role can access a specific route
 * @param {string} route - Route to check
 * @param {string} role - User role
 * @returns {boolean} Can access route
 */
export const canAccessRoute = (route, role) => {
  const accessibleRoutes = getAccessibleRoutes(role);
  
  return accessibleRoutes.some(pattern => {
    if (pattern.endsWith('/*')) {
      const basePath = pattern.slice(0, -2);
      return route.startsWith(basePath);
    }
    return route === pattern;
  });
};

/**
 * Get user permissions for a role
 * @param {string} role - User role
 * @returns {Object} Permissions object
 */
export const getUserPermissions = (role) => {
  const normalized = normalizeRole(role);
  return ROLE_PERMISSIONS[normalized] || ROLE_PERMISSIONS[VALID_ROLES.NONMEMBER];
};

/**
 * Check if user has specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean} Has permission
 */
export const hasPermission = (role, permission) => {
  const permissions = getUserPermissions(role);
  return permissions[permission] === true;
};

/**
 * Compare role hierarchy levels
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {number} -1 if role1 < role2, 0 if equal, 1 if role1 > role2
 */
export const compareRoles = (role1, role2) => {
  const level1 = ROLE_HIERARCHY[normalizeRole(role1)] || 0;
  const level2 = ROLE_HIERARCHY[normalizeRole(role2)] || 0;
  
  if (level1 < level2) return -1;
  if (level1 > level2) return 1;
  return 0;
};

/**
 * Check if a role has admin privileges
 * @param {string} role - Role to check
 * @returns {boolean} Has admin access
 */
export const hasAdminAccess = (role) => {
  return normalizeRole(role) === VALID_ROLES.ADMIN;
};

/**
 * Check if a role has staff privileges
 * @param {string} role - Role to check
 * @returns {boolean} Has staff access
 */
export const hasStaffAccess = (role) => {
  const normalized = normalizeRole(role);
  return normalized === VALID_ROLES.ADMIN || normalized === VALID_ROLES.STAFF;
};

/**
 * Check if a role has member privileges
 * @param {string} role - Role to check
 * @returns {boolean} Has member access
 */
export const hasMemberAccess = (role) => {
  const normalized = normalizeRole(role);
  return [VALID_ROLES.ADMIN, VALID_ROLES.STAFF, VALID_ROLES.MEMBER].includes(normalized);
};

/**
 * Get role display name
 * @param {string} role - Role to format
 * @returns {string} Display name
 */
export const getRoleDisplayName = (role) => {
  const normalized = normalizeRole(role);
  
  switch (normalized) {
    case VALID_ROLES.ADMIN:
      return 'Administrator';
    case VALID_ROLES.STAFF:
      return 'Staff';
    case VALID_ROLES.MEMBER:
      return 'Member';
    case VALID_ROLES.NONMEMBER:
      return 'Non-Member';
    case VALID_ROLES.INACTIVE:
      return 'Inactive';
    default:
      return 'Unknown';
  }
};

// ⭐ EXPORT: Everything needed throughout the app
export default {
  VALID_ROLES,
  ROLE_HIERARCHY,
  ROLE_DEFAULT_ROUTES,
  ROLE_ACCESSIBLE_ROUTES,
  ROLE_PERMISSIONS,
  normalizeRole,
  getDefaultRoute,
  getAccessibleRoutes,
  canAccessRoute,
  getUserPermissions,
  hasPermission,
  compareRoles,
  hasAdminAccess,
  hasStaffAccess,
  hasMemberAccess,
  getRoleDisplayName
};