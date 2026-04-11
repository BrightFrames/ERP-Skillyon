import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import AccountPage from './AccountPage';
import StudentsPage from './StudentsPage';
import StaffPage from './StaffPage';
import ClassesPage from './ClassesPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AccountPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="classes" element={<ClassesPage />} />
          {/* Placeholder routes for the other sidebar links */}
          <Route path="fees" element={<div className="p-8"><h1 className="text-3xl font-bold tracking-tight mb-2">Fees Module</h1><p className="text-zinc-500">Coming soon.</p></div>} />
          <Route path="attendance" element={<div className="p-8"><h1 className="text-3xl font-bold tracking-tight mb-2">Attendance Module</h1><p className="text-zinc-500">Coming soon.</p></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
