
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

type UserRole = Tables<'profiles'>['role'];

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Carregando perfil...</h2>
          <p className="text-gray-600 mt-2">Configurando sua conta</p>
        </div>
      </div>
    );
  }

  // Verificar se o usuário está ativo
  if (profile.is_active === false) {
    return <Navigate to="/acesso-negado" replace />;
  }

  if (requiredRole && profile.role !== requiredRole && profile.role !== 'admin') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Acesso Negado</h2>
          <p className="text-gray-600 mt-2">Você não tem permissão para acessar esta página</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
