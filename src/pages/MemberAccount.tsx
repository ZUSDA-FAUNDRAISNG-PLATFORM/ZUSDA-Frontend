import { Link } from "react-router-dom";
import { useAuth } from "@/cms/AuthProvider";
import { Button } from "@/components/ui/button";

const MemberAccount = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="mx-auto max-w-xl rounded-xl border border-navy/10 bg-white p-6 sm:p-8">
        <p className="mb-2 text-sm font-medium text-gold-dark">Member</p>
        <h1 className="mb-4 font-display text-3xl font-bold text-navy">Welcome, {user?.name}</h1>
        <p className="mb-6 text-muted-foreground">
          You are signed in as a member. Members can view church updates on the public site, but cannot edit posters,
          committee details, or other website content.
        </p>
        <div className="space-y-2 rounded-md bg-cream p-4 text-sm text-navy/80">
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="bg-navy text-white hover:bg-navy-light">
            <Link to="/">View website</Link>
          </Button>
          <Button type="button" variant="outline" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemberAccount;
