/**
 * ERP-Skillyon Frontend Permissions Helper
 */

export const PERMISSIONS = {
  STUDENTS_READ: 'students:read',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',

  CLASSES_READ: 'classes:read',
  CLASSES_CREATE: 'classes:create',
  CLASSES_UPDATE: 'classes:update',
  CLASSES_DELETE: 'classes:delete',

  STAFF_READ: 'staff:read',
  STAFF_CREATE: 'staff:create',
  STAFF_UPDATE: 'staff:update',
  STAFF_DELETE: 'staff:delete',

  FEES_READ: 'fees:read',
  FEES_CREATE: 'fees:create',
  FEES_COLLECT: 'fees:collect',
  FEES_RULES: 'fees:rules',

  ACADEMICS_READ: 'academics:read',
  ACADEMICS_GRADE: 'academics:grade',
  ACADEMICS_ASSIGNMENT: 'academics:create_assignment',

  MESSAGES_READ: 'messages:read',
  MESSAGES_SEND: 'messages:send',

  SETTINGS_MANAGE: 'settings:manage',
};

export const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role === 'ADMIN') return true;

  const userPerms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
  if (userPerms.includes('*') || userPerms.includes(permission)) return true;

  const [resource] = permission.split(':');
  if (userPerms.includes(`${resource}:*`)) return true;

  // Fallback defaults for standard roles
  if (user.role === 'TEACHER') {
    return [
      'students:read',
      'classes:read',
      'academics:read',
      'academics:grade',
      'academics:create_assignment',
      'messages:read',
      'messages:send',
    ].includes(permission);
  }

  if (user.role === 'STAFF') {
    return [
      'students:read',
      'classes:read',
      'fees:read',
      'fees:create',
      'fees:collect',
      'fees:rules',
      'messages:read',
      'messages:send',
    ].includes(permission);
  }

  return false;
};

