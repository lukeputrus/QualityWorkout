import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OpenTabsBar from "../components/OpenTabsBar";
import {
  BriefcaseIcon,
  CalendarIcon,
  ChartIcon,
  CheckSquareIcon,
  ClockIcon,
  HomeIcon,
  LandmarkIcon,
  LogOutIcon,
  MenuIcon,
  ReceiptIcon,
  SettingsIcon,
  UsersIcon,
  XIcon,
} from "../components/icons";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: HomeIcon, end: true },
  { to: "/tabs", label: "Open Tabs", icon: ClockIcon },
  { to: "/matters", label: "Matters", icon: BriefcaseIcon },
  { to: "/clients", label: "Clients", icon: UsersIcon },
  { to: "/billing", label: "Billing", icon: ReceiptIcon },
  { to: "/trust", label: "Trust Accounting", icon: LandmarkIcon },
  { to: "/reports", label: "Reports", icon: ChartIcon },
  { to: "/calendar", label: "Calendar", icon: CalendarIcon },
  { to: "/task-list", label: "Tasks", icon: CheckSquareIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

const MOBILE_PRIMARY = NAV_ITEMS.filter((i) => ["/", "/tabs", "/matters", "/billing"].includes(i.to));

export default function AppShell() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-200 bg-white md:flex">
        <div className="border-b border-ink-100 px-5 py-4">
          <div className="text-lg font-bold text-brand-700">BillBuddy</div>
          <div className="truncate text-xs text-ink-500">{user?.firm.name}</div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-100 p-3">
          <div className="mb-2 px-1 text-xs text-ink-500">
            <div className="font-medium text-ink-700">{user?.name}</div>
            <div className="capitalize">{user?.role}</div>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-600 hover:bg-ink-100">
            <LogOutIcon className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3 md:hidden">
        <div className="text-lg font-bold text-brand-700">BillBuddy</div>
        <button onClick={() => setMobileMenuOpen(true)} aria-label="Menu" className="text-ink-600">
          <MenuIcon className="h-6 w-6" />
        </button>
      </header>

      <div className="flex min-w-0 flex-1 flex-col">
        <OpenTabsBar />
        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 md:pb-6">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="grid grid-cols-5 border-t border-ink-200 bg-white md:hidden">
          {MOBILE_PRIMARY.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? "text-brand-700" : "text-ink-500"}`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label.split(" ")[0]}
            </NavLink>
          ))}
          <button onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-ink-500">
            <MenuIcon className="h-5 w-5" />
            More
          </button>
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="h-full w-72 bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-ink-900">{user?.name}</div>
                <div className="text-xs capitalize text-ink-500">{user?.role} · {user?.firm.name}</div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close">
                <XIcon className="h-5 w-5 text-ink-500" />
              </button>
            </div>
            <nav className="space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-ink-600"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
              <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-600">
                <LogOutIcon className="h-4 w-4" /> Log out
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
