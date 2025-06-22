
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MobileNav } from './MobileNav';
import { LogOut, Building2 } from 'lucide-react';

export function Header() {
  const { profile, company, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <MobileNav />
          
          {company && (
            <div className="hidden sm:flex items-center text-gray-600">
              <Building2 className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">{company.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {profile && (
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{profile.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {profile.role === 'admin' ? 'Administrador' : 
                 profile.role === 'editor' ? 'Editor' : 'Visualizador'}
              </p>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="hidden md:flex"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
