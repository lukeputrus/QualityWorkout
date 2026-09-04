import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Card, ErrorBanner, Field, Input } from "../components/ui";

export default function Register() {
  const { user, registerFirm } = useAuth();
  const [firmName, setFirmName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerFirm({ firmName, userName, email, password });
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
          <p className="mt-1 text-sm text-ink-500">14-day free trial, then $500/month per firm</p>
        </div>
        <ErrorBanner message={error} />
        <form onSubmit={submit} className="space-y-3">
          <Field label="Firm name">
            <Input value={firmName} onChange={(e) => setFirmName(e.target.value)} required autoFocus />
          </Field>
          <Field label="Your name">
            <Input value={userName} onChange={(e) => setUserName(e.target.value)} required />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <Input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating your firm…" : "Start free trial"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-ink-600">
          Already have an account? <Link to="/login" className="font-medium text-brand-600 hover:underline">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
