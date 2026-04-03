import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CoordinatorDashboard from './pages/CoordinatorDashboard'
import CoordinatorReferrals from './pages/CoordinatorReferrals'
import Referrals from './pages/Referrals'
import ProviderDirectory from './pages/ProviderDirectory'
import ProviderReceivedReferrals from './pages/ProviderReceivedReferrals'
import ProviderParticipantLookup from './pages/ProviderParticipantLookup'
import CareRecord from './pages/CareRecord'
import CareTeam from './pages/CareTeam'
import Messages from './pages/Messages'
import Updates from './pages/Updates'
import Notifications from './pages/Notifications'
import Documents from './pages/Documents'
import ConsentSettings from './pages/ConsentSettings'
import ProviderSendUpdates from './pages/ProviderSendUpdates'
import ProviderDashboard from './pages/ProviderDashboard'
import CoordinatorParticipants from './pages/CoordinatorParticipants'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminSettings from './pages/AdminSettings'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
            <Route path="coordinator" element={<CoordinatorDashboard />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="providers" element={<ProviderDirectory />} />
            <Route path="provider/referrals/received" element={<ProviderReceivedReferrals />} />
            <Route path="provider" element={<ProviderDashboard />} />
            <Route path="care-record" element={<CareRecord />} />
            <Route path="care-team" element={<CareTeam />} />
            <Route path="messages" element={<Messages />} />
            <Route path="updates" element={<Updates />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="documents" element={<Documents />} />
            <Route path="consent" element={<ConsentSettings />} />
            <Route path="coordinator/participants" element={<CoordinatorParticipants />} />
            <Route path="coordinator/referrals" element={<CoordinatorReferrals />} />
            <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          </Route>

          {/* Root-level routes — all protected, all use Layout */}
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
          <Route
            path="/referrals"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Referrals />} />
          </Route>
          <Route
            path="/care-record"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CareRecord />} />
          </Route>
          <Route
            path="/care-team"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CareTeam />} />
          </Route>
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Messages />} />
          </Route>
          <Route
            path="/updates"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Updates />} />
          </Route>
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Notifications />} />
          </Route>
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Documents />} />
          </Route>
          <Route
            path="/consent"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ConsentSettings />} />
          </Route>
          <Route
            path="/provider-send-updates"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProviderSendUpdates />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
