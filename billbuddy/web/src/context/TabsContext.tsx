import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { api, type TabDto } from "../api/client";
import { useAuth } from "./AuthContext";

interface TabsContextValue {
  tabs: TabDto[];
  loading: boolean;
  liveSecondsFor: (tab: TabDto) => number;
  openTab: (matterId: string, description?: string) => Promise<void>;
  pauseTab: (id: string) => Promise<void>;
  resumeTab: (id: string) => Promise<void>;
  discardTab: (id: string) => Promise<void>;
  closeTab: (id: string) => Promise<void>;
  updateTab: (id: string, data: Partial<{ description: string; billable: boolean }>) => Promise<void>;
  refresh: () => Promise<void>;
}

const TabsContext = createContext<TabsContextValue | null>(null);

/** Keeps the firm's currently-open "tabs" (live timers) in sync across the
 * whole app, and re-renders once a second so any running tab's elapsed
 * time ticks smoothly without re-polling the server every second. */
export function TabsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tabs, setTabs] = useState<TabDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);
  const fetchedAtRef = useRef<number>(Date.now());

  const refresh = useCallback(async () => {
    if (!user) {
      setTabs([]);
      setLoading(false);
      return;
    }
    const { tabs: rows } = await api.tabs.list();
    fetchedAtRef.current = Date.now();
    setTabs(rows);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const pollId = setInterval(refresh, 30000);
    const tickId = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      clearInterval(pollId);
      clearInterval(tickId);
    };
  }, [user, refresh]);

  function liveSecondsFor(tab: TabDto): number {
    if (tab.status !== "running") return tab.accumulatedSeconds;
    const elapsedSinceFetch = Math.floor((Date.now() - fetchedAtRef.current) / 1000);
    return tab.liveElapsedSeconds + Math.max(0, elapsedSinceFetch);
  }

  async function openTab(matterId: string, description = "") {
    await api.tabs.open({ matterId, description });
    await refresh();
  }
  async function pauseTab(id: string) {
    await api.tabs.pause(id);
    await refresh();
  }
  async function resumeTab(id: string) {
    await api.tabs.resume(id);
    await refresh();
  }
  async function discardTab(id: string) {
    await api.tabs.discard(id);
    await refresh();
  }
  async function closeTab(id: string) {
    await api.tabs.close(id);
    await refresh();
  }
  async function updateTab(id: string, data: Partial<{ description: string; billable: boolean }>) {
    await api.tabs.update(id, data);
    await refresh();
  }

  return (
    <TabsContext.Provider
      value={{ tabs, loading, liveSecondsFor, openTab, pauseTab, resumeTab, discardTab, closeTab, updateTab, refresh }}
    >
      {children}
    </TabsContext.Provider>
  );
}

export function useTabs(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("useTabs must be used within TabsProvider");
  return ctx;
}
