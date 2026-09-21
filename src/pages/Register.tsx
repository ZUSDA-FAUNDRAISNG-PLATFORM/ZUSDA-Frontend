import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/cms/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Register = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === "admin" ? "/dashboard" : "/account"} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created.");
      navigate("/account", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-navy/10 bg-white p-6 sm:p-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-navy">Create account</h1>
                <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-navy text-white hover:bg-navy-light">
            {loading ? "Creating…" : "Create member account"}
          </Button>
        </div>
        <Link to="/login" className="mt-6 inline-block text-sm text-navy/60 hover:text-navy">
          Already have an account? Sign in
        </Link>
      </form>
    </div>
  );
};

export default Register;
