import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Referrals from './pages/Referrals'
import CareRecord from './pages/CareRecord'
import CareTeam from './pages/CareTeam'
import Messages from './pages/Messages'
import Updates from './pages/Updates'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app/dashboard" element={<Navigate to="/dashboard" replace />} />

          {/* Protected routes — all under /app/* */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="care-record" element={<CareRecord />} />
            <Route path="care-team" element={<CareTeam />} />
            <Route path="messages" element={<Messages />} />
            <Route path="updates" element={<Updates />} />
          </Route>

          {/* Fallback protected routes at root */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
