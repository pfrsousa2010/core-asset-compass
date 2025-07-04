
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';

export default function AuthRedirectHandler() {
  const { hash, pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se é uma confirmação via query params (link de e-mail)
    const searchParams = new URLSearchParams(search);
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    if (token && type) {
      console.log('Processando confirmação via query params:', { type, token: token.substring(0, 10) + '...' });
      
      // Para confirmações de signup, redirecionar para onboarding
      if (type === 'signup') {
        console.log('Redirecionando para onboarding após confirmação de signup');
        navigate('/onboarding', { replace: true });
        return;
      }
      
      // Para recovery, redirecionar para reset password
      if (type === 'recovery') {
        console.log('Redirecionando para reset password');
        navigate('/reset-password', { replace: true });
        return;
      }
      
      // Para outros tipos, redirecionar para dashboard
      navigate('/dashboard', { replace: true });
      return;
    }

    // Verificar se há hash com tokens (callback após OAuth)
    if (!hash?.startsWith("#access_token")) return;

    const params = new URLSearchParams(hash.substring(1)); // remove '#'
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const hashType = params.get("type");

    if (access_token && refresh_token) {
      console.log('Processando tokens do hash:', { type: hashType });
      
      supabase.auth.setSession({ access_token, refresh_token })
        .then(() => {
          if (hashType === "recovery") {
            navigate("/reset-password", { replace: true });
          } else if (hashType === "signup") {
            navigate("/onboarding", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        })
        .catch((error) => {
          console.error('Erro ao definir sessão:', error);
          navigate("/login", { replace: true });
        });
    }
  }, [hash, pathname, search, navigate]);

  return null;
}
