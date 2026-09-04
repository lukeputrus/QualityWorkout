import { useState } from "react";
import { Navigate } from "react-router-dom";
import { api, setToken } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Button, Card, ErrorBanner, Field, Input } from "../components/ui";

/** The phone-side half of LAN pairing: an attorney generates a 6-digit
 * code from Settings on the desktop app, and enters it here (opened at
 * http://<desktop-lan-ip>:4000/pair from the phone's browser) to link this
 * device without ever typing a firm password on the phone. */
export default function PairDevice() {
  const { user, refresh } = useAuth();
  const [code, setCode] = useState("");
  const [deviceLabel, setDeviceLabel] = useState(() => (navigator.userAgent.includes("iPhone") ? "iPhone" : "My phone"));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await api.auth.pair({ code, deviceLabel });
      setToken(token);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 text-center">
          <div className="text-2xl font-bold text-brand-700">Pair this device</div>
          <p className="mt-1 text-sm text-ink-500">
            On the desktop app, open Settings → Companion App and generate a pairing code.
          </p>
        </div>
        <ErrorBanner message={error} />
        <form onSubmit={submit} className="space-y-3">
          <Field label="6-digit code">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              className="text-center text-2xl tracking-[0.4em]"
              placeholder="000000"
              required
              autoFocus
            />
          </Field>
          <Field label="Label this device">
            <Input value={deviceLabel} onChange={(e) => setDeviceLabel(e.target.value)} required />
          </Field>
          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading ? "Pairing…" : "Pair device"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
