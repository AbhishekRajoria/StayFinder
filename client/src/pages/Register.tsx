import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthSplit } from "@/components/auth/AuthSplit";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1542317854-0c8d54895d4e?auto=format&fit=crop&w=1600&q=80";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const { register, loading, error: authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Tell us your name.";
    else if (name.length < 2) next.name = "Two characters minimum.";

    if (!email.trim()) next.email = "Email is required.";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email))
      next.email = "That doesn't look quite right.";

    if (!password) next.password = "Pick a password.";
    else if (password.length < 8) next.password = "Eight characters minimum.";
    else if (!/(?=.*[a-z])/.test(password)) next.password = "Add a lowercase letter.";
    else if (!/(?=.*[A-Z])/.test(password)) next.password = "Add an uppercase letter.";
    else if (!/(?=.*\d)/.test(password)) next.password = "Add a number.";
    else if (!/(?=.*[!@#$%^&*])/.test(password)) next.password = "Add a special character.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) await register(name, email, password);
  };

  if (isAuthenticated) return null;

  const clearError = (key: keyof FormErrors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  return (
    <AuthSplit
      image={HERO_IMAGE}
      imageCaption="A villa above the cliffs, Amalfi."
    >
      <p className="eyebrow text-ink2 mb-5">Become a member</p>
      <h1 className="font-display text-display-lg text-ink leading-tight">
        Begin somewhere
        <br />
        unforgettable.
      </h1>
      <p className="text-ink2 mt-4 leading-relaxed">
        Free to join. Curated stays only.
      </p>

      <form onSubmit={handleSubmit} className="mt-12 space-y-7">
        <div>
          <label htmlFor="name" className="eyebrow text-ink mb-2 block">Full name</label>
          <Input
            id="name"
            variant="underline"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError("name");
            }}
            placeholder="Imogen R."
            required
          />
          {errors.name && <p className="text-xs text-danger mt-2">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="eyebrow text-ink mb-2 block">Email</label>
          <Input
            id="email"
            variant="underline"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            placeholder="you@somewhere.com"
            required
          />
          {errors.email && <p className="text-xs text-danger mt-2">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="eyebrow text-ink mb-2 block">Password</label>
          <Input
            id="password"
            variant="underline"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError("password");
            }}
            placeholder="••••••••"
            required
          />
          {errors.password ? (
            <p className="text-xs text-danger mt-2">{errors.password}</p>
          ) : (
            <p className="text-xs text-ink3 mt-2">
              8+ characters with upper, lower, number, and special.
            </p>
          )}
        </div>

        {authError && <p className="text-sm text-danger">{authError}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating your account…" : "Create account"}
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
          onClick={() => toast.info("Google sign-up arriving in the next release.")}
        >
          Continue with Google
        </Button>
      </form>

      <p className="mt-10 text-sm text-ink2">
        Already have an account?{" "}
        <Link to="/login" className="editorial-link text-sm">
          Sign in
        </Link>
      </p>
    </AuthSplit>
  );
}
