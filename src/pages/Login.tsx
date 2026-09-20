import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/cms/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === "admin" ? "/dashboard" : "/account"} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const next = await login(username, password);
      toast.success("Signed in.");
      navigate(from || (next.role === "admin" ? "/dashboard" : "/account"), { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-navy/10 bg-white p-6 sm:p-8">
        <p className="mb-2 text-sm font-medium text-gold-dark">ZUSDA</p>
        <h1 className="mb-2 font-display text-3xl font-bold text-navy">Login</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Administrators manage website content. Members can sign in without editing access.
        </p>
        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1.5" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-navy text-white hover:bg-navy-light">
            {loading ? "Signing in…" : "Login"}
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm">
          <Link to="/" className="text-navy/60 hover:text-navy">
            Back to site
          </Link>
          <Link to="/register" className="font-medium text-navy hover:text-gold-dark">
            Create member account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
