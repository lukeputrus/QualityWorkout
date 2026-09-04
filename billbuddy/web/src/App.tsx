import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TabsProvider } from "./context/TabsContext";
import AppShell from "./layouts/AppShell";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PairDevice from "./pages/PairDevice";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Matters from "./pages/Matters";
import MatterDetail from "./pages/MatterDetail";
import TimeTracking from "./pages/TimeTracking";
import TimeEntries from "./pages/TimeEntries";
import Expenses from "./pages/Expenses";
import Billing from "./pages/Billing";
import InvoiceDetail from "./pages/InvoiceDetail";
import TrustAccounting from "./pages/TrustAccounting";
import Reports from "./pages/Reports";
import CalendarPage from "./pages/CalendarPage";
import TasksPage from "./pages/TasksPage";
import Settings from "./pages/Settings";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex h-screen items-center justify-center text-ink-400">Loading BillBuddy…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pair" element={<PairDevice />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <TabsProvider>
                  <AppShell />
                </TabsProvider>
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="matters" element={<Matters />} />
            <Route path="matters/:id" element={<MatterDetail />} />
            <Route path="tabs" element={<TimeTracking />} />
            <Route path="time-entries" element={<TimeEntries />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="billing" element={<Billing />} />
            <Route path="billing/:id" element={<InvoiceDetail />} />
            <Route path="trust" element={<TrustAccounting />} />
            <Route path="reports" element={<Reports />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="task-list" element={<TasksPage />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
