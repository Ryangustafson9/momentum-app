/**
 * Role hierarchy and permission utilities
 * Hierarchy: admin > staff > member
 */

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  MEMBER: 'member'
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.STAFF]: 2,
  [ROLES.MEMBER]: 1
};

/**
 * Check if user has required role or higher
 */
export const hasRoleOrHigher = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

/**
 * Check if user can access admin features
 */
export const canAccessAdmin = (userRole) => {
  return userRole === ROLES.ADMIN || userRole === ROLES.STAFF;
};

/**
 * Check if user can access member features
 */
export const canAccessMember = (userRole) => {
  return userRole === ROLES.MEMBER;
};

/**
 * Get default dashboard route for role
 */
export const getDefaultRoute = (userRole) => {
  switch (userRole) {
    case ROLES.ADMIN:
    case ROLES.STAFF:
      return '/dashboard';
    case ROLES.MEMBER:
      return '/member/dashboard';
    default:
      return '/login';
  }
};