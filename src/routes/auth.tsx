import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogIn, UserPlus } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Fatui Market" },
      { name: "description", content: "Sign in or create a Fatui Market account to track your orders and payment history." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created! You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <div className="surface-card p-8">
        <div className="mb-6 flex gap-2 rounded-xl bg-secondary p-1">
          <button onClick={() => setMode("signin")} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${mode === "signin" ? "bg-background text-foreground shadow" : "text-muted-foreground"}`}>Sign in</button>
          <button onClick={() => setMode("signup")} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${mode === "signup" ? "bg-background text-foreground shadow" : "text-muted-foreground"}`}>Create account</button>
        </div>
        <h1 className="text-2xl font-bold">{mode === "signin" ? "Welcome back" : "Join Fatui Market"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your orders and payment history in one place.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Display name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60">
            {mode === "signin" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our <Link to="/terms" className="underline">Terms</Link> & <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
