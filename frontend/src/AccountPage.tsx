import { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';

export default function AccountPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setRole(user.role);
      } catch (e) {
        setRole('ADMIN');
      }
    }
  }, []);

  if (!role) {
    return <div className="flex justify-center items-center h-full"><p className="text-zinc-500">Loading Dashboard...</p></div>;
  }

  if (role === 'TEACHER') {
    return <TeacherDashboard />;
  }

  // Default to Admin dashboard for ADMIN, STAFF, or unknown roles
  return <AdminDashboard />;
}
 