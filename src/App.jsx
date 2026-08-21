import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Home from './pages/Home.jsx'
import WorkoutDay from './pages/WorkoutDay.jsx'
import Player from './pages/Player.jsx'
import Profile from './pages/Profile.jsx'
import { useApp } from './context/AppContext.jsx'

// An account is optional — only a saved profile (gender/age/weight/goal) is
// required to use the app, so this guard doesn't check auth at all.
function RequireProfile({ children }) {
  const { profile } = useApp()
  if (!profile?.gender || !profile?.goal) return <Navigate to="/app/onboarding" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app/signup" element={<Auth mode="signup" />} />
      <Route path="/app/login" element={<Auth mode="login" />} />
      <Route path="/app/onboarding" element={<Onboarding />} />
      <Route
        path="/app/home"
        element={
          <RequireProfile>
            <Home />
          </RequireProfile>
        }
      />
      <Route
        path="/app/day/:dayId"
        element={
          <RequireProfile>
            <WorkoutDay />
          </RequireProfile>
        }
      />
      <Route
        path="/app/play/:dayId"
        element={
          <RequireProfile>
            <Player />
          </RequireProfile>
        }
      />
      <Route path="/app/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
