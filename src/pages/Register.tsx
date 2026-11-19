import { Link } from "react-router-dom";

const Register = () => (
  <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
    <div className="w-full max-w-md rounded-xl border border-navy/10 bg-white p-6 sm:p-8">
      <h1 className="mb-2 font-display text-3xl font-bold text-navy">Registration unavailable</h1>
      <p className="text-sm text-navy/70">
        Accounts must be created by the server. Self-registration is not currently enabled.
      </p>
      <Link to="/login" className="mt-6 inline-block text-sm font-medium text-navy hover:text-gold-dark">
        Return to login
      </Link>
    </div>
  </div>
);

export default Register;
