import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export function useRequireAuth() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [status, setStatus] = useState<"loading" | "authed" | "guest">("loading");
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) {
        navigate({ to: "/auth", search: { redirect: pathname } });
        setStatus("guest");
      } else {
        setUser({ id: data.user.id, email: data.user.email ?? null });
        setStatus("authed");
      }
    });
    return () => { active = false; };
  }, [navigate, pathname]);

  return { status, user };
}
