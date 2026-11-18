/**
 * ERP-Skillyon Role-Based Permissions Framework
 * Defines granular permissions and role-based access control (RBAC)
 */

export const PERMISSIONS = {
  // Students
  STUDENTS_READ: 'students:read',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',

  // Classes
  CLASSES_READ: 'classes:read',
  CLASSES_CREATE: 'classes:create',
  CLASSES_UPDATE: 'classes:update',
  CLASSES_DELETE: 'classes:delete',

  // Staff & Faculty
  STAFF_READ: 'staff:read',
  STAFF_CREATE: 'staff:create',
  STAFF_UPDATE: 'staff:update',
  STAFF_DELETE: 'staff:delete',

  // Fees & Billing
  FEES_READ: 'fees:read',
  FEES_CREATE: 'fees:create',
  FEES_COLLECT: 'fees:collect',
  FEES_RULES: 'fees:rules',

  // Academics & Gradebook
  ACADEMICS_READ: 'academics:read',
  ACADEMICS_GRADE: 'academics:grade',
  ACADEMICS_ASSIGNMENT: 'academics:create_assignment',

  // Messages & Communication
  MESSAGES_READ: 'messages:read',
  MESSAGES_SEND: 'messages:send',

  // School Administration
  SETTINGS_MANAGE: 'settings:manage',
};

/**
 * Default permission matrix mapped to roles
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'],

  ADMIN: [
    'students:read',
    'students:create',
    'students:update',
    'students:delete',
    'classes:read',
    'classes:create',
    'classes:update',
    'classes:delete',
    'staff:read',
    'staff:create',
    'staff:update',
    'staff:delete',
    'fees:read',
    'fees:create',
    'fees:collect',
    'fees:rules',
    'academics:read',
    'academics:grade',
    'academics:create_assignment',
    'messages:read',
    'messages:send',
    'settings:manage',
  ],

  TEACHER: [
    'students:read',
    'classes:read',
    'academics:read',
    'academics:grade',
    'academics:create_assignment',
    'messages:read',
    'messages:send',
  ],

  STAFF: [
    'students:read',
    'classes:read',
    'fees:read',
    'fees:create',
    'fees:collect',
    'fees:rules',
    'messages:read',
    'messages:send',
  ],

  SECURITY: [
    'students:read',
    'classes:read',
  ],

  PARENT: [
    'parent:access',
  ],

  STUDENT: [
    'student:access',
  ],
};

/**
 * Extract all effective permissions for a user (combining standard role permissions and any custom overrides)
 */
export const getUserPermissions = (user) => {
  if (!user || !user.role) return [];

  const role = String(user.role).toUpperCase();
  if (role === 'SUPER_ADMIN') {
    return ['*'];
  }

  const rolePerms = DEFAULT_ROLE_PERMISSIONS[role] || [];
  let customPerms = [];

  if (Array.isArray(user.permissions)) {
    customPerms = user.permissions;
  } else if (typeof user.permissions === 'string') {
    try {
      customPerms = JSON.parse(user.permissions);
    } catch {
      customPerms = [];
    }
  }

  return Array.from(new Set([...rolePerms, ...customPerms]));
};

/**
 * Checks if a user has a specific permission
 */
export const hasPermission = (user, requiredPermission) => {
  if (!user || !user.role) return false;
  if (user.role === 'SUPER_ADMIN') return true;

  const perms = getUserPermissions(user);
  if (perms.includes('*') || perms.includes(requiredPermission)) {
    return true;
  }

  // Support wildcard prefix matching (e.g. 'students:*' satisfies 'students:create')
  const [resource] = requiredPermission.split(':');
  if (perms.includes(`${resource}:*`)) {
    return true;
  }

  return false;
};

/**
 * Express middleware to enforce a required permission
 * @param {string | string[]} permission Single permission string or array of permissions (any match grants access)
 */
export const requirePermission = (permission) => {
  const permissions = Array.isArray(permission) ? permission : [permission];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const authorized = permissions.some((perm) => hasPermission(req.user, perm));
    if (!authorized) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient privileges for this action',
        required: permissions,
        userRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Express middleware that requires ALL specified permissions
 */
export const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const authorized = permissions.every((perm) => hasPermission(req.user, perm));
    if (!authorized) {
      return res.status(403).json({
        error: 'Forbidden: Missing required permissions',
        required: permissions,
        userRole: req.user.role,
      });
    }

    next();
  };
};

