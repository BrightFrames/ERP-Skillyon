import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import LoginPage from './LoginPage';
import AccountPage from './AccountPage';
import StudentsPage from './StudentsPage';
import TeachersPage from './TeachersPage';
import WorkersPage from './WorkersPage';
import ClassesPage from './ClassesPage';
import './App.css';

// Protected Route Component to require JWT Auth
function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const userData = JSON.parse(user);
  
  if (roles && !roles.includes(userData.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<AccountPage />} />
          <Route path="students" element={<ProtectedRoute roles={['ADMIN', 'TEACHER']}><StudentsPage /></ProtectedRoute>} />
          <Route path="teachers" element={<ProtectedRoute roles={['ADMIN']}><TeachersPage /></ProtectedRoute>} />
          <Route path="workers" element={<ProtectedRoute roles={['ADMIN']}><WorkersPage /></ProtectedRoute>} />
          <Route path="classes" element={<ProtectedRoute roles={['ADMIN', 'TEACHER']}><ClassesPage /></ProtectedRoute>} />
          <Route path="departments" element={<div className="p-8"><h1 className="text-3xl font-bold tracking-tight mb-2">Departments Management</h1><p className="text-zinc-500">Coming soon.</p></div>} />
          <Route path="attendance" element={<div className="p-8"><h1 className="text-3xl font-bold tracking-tight mb-2">Attendance Module</h1><p className="text-zinc-500">Coming soon.</p></div>} />
          <Route path="fees" element={<div className="p-8"><h1 className="text-3xl font-bold tracking-tight mb-2">Fees Module</h1><p className="text-zinc-500">Coming soon.</p></div>} />
          <Route path="exams" element={<div className="p-8"><h1 className="text-3xl font-bold tracking-tight mb-2">Exams & Results</h1><p className="text-zinc-500">Coming soon.</p></div>} />
          <Route path="notices" element={<div className="p-8"><h1 className="text-3xl font-bold tracking-tight mb-2">Notice Board</h1><p className="text-zinc-500">Coming soon.</p></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
