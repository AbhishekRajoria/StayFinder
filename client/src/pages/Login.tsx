import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthSplit } from "@/components/auth/AuthSplit";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1600&q=80";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  if (isAuthenticated) return null;

  return (
    <AuthSplit
      image={HERO_IMAGE}
      imageCaption="An apartment with a view of the Tagus, Lisbon."
    >
      <p className="eyebrow text-ink2 mb-5">Welcome back</p>
      <h1 className="font-display text-display-lg text-ink leading-tight">
        Sign in to your stays.
      </h1>
      <p className="text-ink2 mt-4 leading-relaxed">
        Continue where you left off — your trips, wishlists, and host tools.
      </p>

      <form onSubmit={handleSubmit} className="mt-12 space-y-7">
        <div>
          <label htmlFor="email" className="eyebrow text-ink mb-2 block">Email</label>
          <Input
            id="email"
            variant="underline"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@somewhere.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="eyebrow text-ink mb-2 block">Password</label>
          <Input
            id="password"
            variant="underline"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-danger">{error}</p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>

        <div className="relative py-4">
          <div className="absolute inset-x-0 top-1/2 h-px bg-linen" />
          <span className="relative bg-cream px-4 eyebrow text-ink3 mx-auto block w-fit">or</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => toast.info("Google sign-in arriving in the next release.")}
        >
          Continue with Google
        </Button>
      </form>

      <p className="mt-10 text-sm text-ink2">
        New here?{" "}
        <Link to="/register" className="editorial-link text-sm">
          Create an account
        </Link>
      </p>
    </AuthSplit>
  );
}
