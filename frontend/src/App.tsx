import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import Layout from "./Layout";
import LoginPage from "./LoginPage";
import AdminDashboard from "./AdminDashboard";
import TeacherDashboard from "./TeacherDashboard";
import StudentsPage from "./StudentsPage";
import StudentProfilePage from "./StudentProfilePage";
import TeachersPage from "./TeachersPage";
import WorkersPage from "./WorkersPage";
import ClassesPage from "./ClassesPage";
import MessagesPage from "./MessagesPage";
import FeesPage from "./FeesPage";
import ReportsPage from "./ReportsPage";
import SettingsPage from "./SettingsPage";
import { syncAppearance } from "./lib/settings";
import "./App.css";

function ThemeAppearanceSync() {
  useEffect(() => {
    const syncTheme = () => {
      syncAppearance();
    };

    syncTheme();
    window.addEventListener("appearance-changed", syncTheme);
    return () => window.removeEventListener("appearance-changed", syncTheme);
  }, []);

  return null;
}

function RoleDashboard() {
  const userStr = localStorage.getItem("user");
  const role = userStr ? JSON.parse(userStr)?.role : "ADMIN";
  if (role === "TEACHER") return <TeacherDashboard />;
  return <AdminDashboard />;
}

// Protected Route Component to require JWT Auth
function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

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
      <ThemeAppearanceSync />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleDashboard />} />
          <Route
            path="students"
            element={
              <ProtectedRoute roles={["ADMIN", "TEACHER"]}>
                <StudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="students/:id"
            element={
              <ProtectedRoute roles={["ADMIN", "TEACHER"]}>
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="teachers"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <TeachersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="workers"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <WorkersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="classes"
            element={
              <ProtectedRoute roles={["ADMIN", "TEACHER"]}>
                <ClassesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="departments"
            element={
              <div className="p-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Departments Management
                </h1>
                <p className="text-zinc-500">Coming soon.</p>
              </div>
            }
          />
          <Route
            path="messages"
            element={
              <ProtectedRoute roles={["ADMIN", "TEACHER", "STAFF"]}>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="fees"
            element={
              <ProtectedRoute roles={["ADMIN", "STAFF"]}>
                <FeesPage />
              </ProtectedRoute>
            }
          />
          {/* Parent panel moved to the separate parents app */}
          <Route
            path="exams"
            element={
              <div className="p-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Exams & Results
                </h1>
                <p className="text-zinc-500">Coming soon.</p>
              </div>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="notices"
            element={
              <div className="p-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Notice Board
                </h1>
                <p className="text-zinc-500">Coming soon.</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
