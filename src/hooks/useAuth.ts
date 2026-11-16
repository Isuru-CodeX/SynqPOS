import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const DEMO_USER_STORAGE_KEY = "synqpos_demo_user";

export function getStoredDemoUser(): User | null {
  try {
    const raw = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function loginAsDemo(
  email: string,
  role: string = "owner",
  fullName: string = "Isuru Rathnayaka"
): User {
  const demoUser: User = {
    id: `demo-user-${role}`,
    app_metadata: { provider: "email", roles: [role] },
    user_metadata: { full_name: fullName, role },
    aud: "authenticated",
    confirmation_sent_at: new Date().toISOString(),
    recovery_sent_at: new Date().toISOString(),
    email_change_sent_at: new Date().toISOString(),
    new_email: "",
    invited_at: new Date().toISOString(),
    action_link: "",
    email,
    phone: "",
    created_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    phone_confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    role: "authenticated",
    updated_at: new Date().toISOString(),
    identities: [],
    factors: [],
  };

  localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
  window.dispatchEvent(new Event("synqpos:auth-change"));
  return demoUser;
}

export function logoutDemo(): void {
  localStorage.removeItem(DEMO_USER_STORAGE_KEY);
  window.dispatchEvent(new Event("synqpos:auth-change"));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getStoredDemoUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    function refreshAuth() {
      if (!mounted) return;
      // First check Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          setLoading(false);
          return;
        }

        // If no active Supabase remote session, check local demo session
        const demo = getStoredDemoUser();
        setUser(demo);
        setLoading(false);
      });
    }

    refreshAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "INITIAL_SESSION") return;

      if (session?.user) {
        setUser(session.user);
        setLoading(false);
      } else {
        const demo = getStoredDemoUser();
        setUser(demo);
        setLoading(false);
      }
    });

    const handleCustomAuthChange = () => {
      refreshAuth();
    };

    window.addEventListener("synqpos:auth-change", handleCustomAuthChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("synqpos:auth-change", handleCustomAuthChange);
    };
  }, []);

  return { user, loading };
}
