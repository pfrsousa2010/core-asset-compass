import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { PWAUpdateBanner } from "@/components/PWAUpdateBanner";

export function PWABanners() {
  const { user } = useAuth();
  const location = useLocation();
  const hidePwaBanners = [
    '/', '/login', '/onboarding', '/register', '/signup', '/reset-password', '/set-password', '/acesso-negado'
  ].includes(location.pathname);

  if (!user || hidePwaBanners) return null;

  return (
    <>
      <PWAUpdateBanner />
      <PWAInstallBanner />
    </>
  );
} 