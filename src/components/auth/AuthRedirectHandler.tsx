
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';

export default function AuthRedirectHandler() {
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hash?.startsWith("#access_token")) return;

    const params = new URLSearchParams(hash.substring(1)); // remove '#'
    const access_token  = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type          = params.get("type"); // login, recovery, signup, etc.

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token })
        .then(() => {
          if (type === "recovery") {
            // redireciona para página de nova senha
            navigate("/reset-password", { replace: true });
          } else if (type === "signup") {
            // redireciona para página de onboarding após confirmação de email
            navigate("/onboarding", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        });
    }
  }, [hash, pathname, navigate]);

  return null; // não renderiza nada
}
