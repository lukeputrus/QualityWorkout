import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Card, ErrorBanner, Field, Input } from "../components/ui";

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("demo@billbuddy.test");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
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
          <div className="text-2xl font-bold text-brand-700">BillBuddy</div>
          <p className="mt-1 text-sm text-ink-500">Time, billing, and trust accounting for your firm</p>
        </div>
        <ErrorBanner message={error} />
        <form onSubmit={submit} className="space-y-3">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </Field>
          <Field label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-ink-500">
          Demo login is pre-filled (seed with <code>npm run seed --workspace=server</code>).
        </p>
        <p className="mt-2 text-center text-sm text-ink-600">
          New firm? <Link to="/register" className="font-medium text-brand-600 hover:underline">Start your 14-day trial</Link>
        </p>
        <p className="mt-1 text-center text-sm text-ink-600">
          On your phone? <Link to="/pair" className="font-medium text-brand-600 hover:underline">Pair this device</Link>
        </p>
      </Card>
    </div>
  );
}
