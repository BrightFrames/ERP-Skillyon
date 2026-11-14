export interface PortalItem {
  id: 'school' | 'student' | 'parent' | 'superadmin';
  name: string;
  desc: string;
  url: string;
  badge?: string;
  color: string;
  bgLight: string;
}

export const getPortalUrls = () => {
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  return {
    school: isLocal
      ? 'http://localhost:5173'
      : 'https://erp-skillyon-frontend.vercel.app',
    student: isLocal
      ? 'http://localhost:5176'
      : 'https://erp-skillyon-student.vercel.app',
    parent: isLocal
      ? 'http://localhost:5174'
      : 'https://erp-skillyon-pare.vercel.app',
    superadmin: isLocal
      ? 'http://localhost:5177'
      : 'https://erp-skillyon-super.vercel.app',
  };
};

export const getPortals = (currentPortalId: string = 'school', includeSuperAdmin: boolean = false): PortalItem[] => {
  const urls = getPortalUrls();
  const all: PortalItem[] = [
    {
      id: 'school',
      name: 'School Staff ERP',
      desc: 'Admin, teachers, gradebooks, attendance & fees',
      url: urls.school,
      badge: currentPortalId === 'school' ? 'Current' : undefined,
      color: 'text-indigo-600',
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      id: 'student',
      name: 'Student Portal',
      desc: 'Assignments, coursework, marks & attendance',
      url: urls.student,
      badge: currentPortalId === 'student' ? 'Current' : undefined,
      color: 'text-sky-600',
      bgLight: 'bg-sky-50 dark:bg-sky-950/40',
    },
    {
      id: 'parent',
      name: 'Parent Portal',
      desc: 'Ward presence, fee payments & teacher messages',
      url: urls.parent,
      badge: currentPortalId === 'parent' ? 'Current' : undefined,
      color: 'text-teal-600',
      bgLight: 'bg-teal-50 dark:bg-teal-950/40',
    },
    {
      id: 'superadmin',
      name: 'Super Admin Console',
      desc: 'SaaS multi-tenant control, subscriptions & schools',
      url: urls.superadmin,
      badge: currentPortalId === 'superadmin' ? 'Current' : undefined,
      color: 'text-amber-600',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    },
  ];

  return includeSuperAdmin ? all : all.filter((p) => p.id !== 'superadmin');
};

