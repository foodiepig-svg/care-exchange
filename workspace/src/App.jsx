import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import ProjectPage from './pages/ProjectPage'
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
import Goals from './pages/Goals'
import CarePlans from './pages/CarePlans'
import ProviderSendUpdates from './pages/ProviderSendUpdates'
import ProviderDashboard from './pages/ProviderDashboard'
import CoordinatorParticipants from './pages/CoordinatorParticipants'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/AdminDashboard'
import ParticipantLanding from './pages/ParticipantLanding'
import ProviderLanding from './pages/ProviderLanding'
import CoordinatorLanding from './pages/CoordinatorLanding'
import FamilyLanding from './pages/FamilyLanding'
import ParticipantHelp from './pages/ParticipantHelp'
import ProviderHelp from './pages/ProviderHelp'
import CoordinatorHelp from './pages/CoordinatorHelp'
import FamilyHelp from './pages/FamilyHelp'
import Support from './pages/Support'
import AdminUsers from './pages/AdminUsers'
import AdminSettings from './pages/AdminSettings'
import AdminTickets from './pages/AdminTickets'
import Layout from './components/Layout'
import FamilyDashboard from './pages/FamilyDashboard'
import Features from './pages/Features'
import Feedback from './pages/Feedback'
import AdminFeedback from './pages/AdminFeedback'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null  // Wait for AuthContext to validate token
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
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
          <Route path="/project" element={<ProjectPage />} />
          <Route path="/app/dashboard" element={<Navigate to="/dashboard" replace />} />

          {/* Role-specific landing pages */}
          <Route path="/participant" element={<ParticipantLanding />} />
          <Route path="/provider" element={<ProviderLanding />} />
          <Route path="/coordinator" element={<CoordinatorLanding />} />
          <Route path="/family" element={<FamilyLanding />} />
          <Route path="/family/dashboard" element={<FamilyDashboard />} />

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
            <Route path="goals" element={<Goals />} />
            <Route path="care-plans" element={<CarePlans />} />
            <Route path="coordinator/participants" element={<CoordinatorParticipants />} />
            <Route path="coordinator/referrals" element={<CoordinatorReferrals />} />

            {/* In-app help pages */}
            <Route path="help/participant" element={<ParticipantHelp />} />
            <Route path="help/provider" element={<ProviderHelp />} />
            <Route path="help/coordinator" element={<CoordinatorHelp />} />
            <Route path="help/family" element={<FamilyHelp />} />

            {/* Support */}
            <Route path="support" element={<Support />} />
            <Route path="features" element={<Features />} />
            <Route path="feedback" element={<Feedback />} />
          </Route>

          {/* Admin routes — protected, with Layout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout />
                </AdminRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="settings" element={<AdminSettings />} />
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

          {/* Feature Requests — top-level protected route */}
          <Route
            path="/features"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Features />} />
          </Route>

          {/* Find Providers — top-level protected route */}
          <Route
            path="/providers"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProviderDirectory />} />
          </Route>

          {/* Goals — top-level protected route */}
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Goals />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
