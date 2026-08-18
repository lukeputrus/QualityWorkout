import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Subscribe from './pages/Subscribe.jsx'
import Home from './pages/Home.jsx'
import WorkoutDay from './pages/WorkoutDay.jsx'
import Player from './pages/Player.jsx'
import Profile from './pages/Profile.jsx'
import { useApp } from './context/AppContext.jsx'

function RequireAuth({ children }) {
  const { auth } = useApp()
  if (!auth) return <Navigate to="/app/signup" replace />
  return children
}

function RequireProfile({ children }) {
  const { auth, profile } = useApp()
  if (!auth) return <Navigate to="/app/signup" replace />
  if (!profile?.gender || !profile?.goal) return <Navigate to="/app/onboarding" replace />
  return children
}

function RequireSubscription({ children }) {
  const { auth, profile, subscription } = useApp()
  if (!auth) return <Navigate to="/app/signup" replace />
  if (!profile?.gender || !profile?.goal) return <Navigate to="/app/onboarding" replace />
  if (!subscription?.active) return <Navigate to="/app/subscribe" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app/signup" element={<Auth mode="signup" />} />
      <Route path="/app/login" element={<Auth mode="login" />} />
      <Route
        path="/app/onboarding"
        element={
          <RequireAuth>
            <Onboarding />
          </RequireAuth>
        }
      />
      <Route
        path="/app/subscribe"
        element={
          <RequireProfile>
            <Subscribe />
          </RequireProfile>
        }
      />
      <Route
        path="/app/home"
        element={
          <RequireSubscription>
            <Home />
          </RequireSubscription>
        }
      />
      <Route
        path="/app/day/:dayId"
        element={
          <RequireSubscription>
            <WorkoutDay />
          </RequireSubscription>
        }
      />
      <Route
        path="/app/play/:dayId"
        element={
          <RequireSubscription>
            <Player />
          </RequireSubscription>
        }
      />
      <Route
        path="/app/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
