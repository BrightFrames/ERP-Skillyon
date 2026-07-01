import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './LoginPage'
import Dashboard from './dashboard/Dashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('sa_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('sa_token')
  if (token) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
