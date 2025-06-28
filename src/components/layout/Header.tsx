import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { MobileNav } from './MobileNav';
import { NotificationCenter } from '@/components/NotificationCenter';
import { LogOut, Building2, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { profile, company, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-yellow-100 text-yellow-800',
      viewer: 'bg-green-100 text-green-800',
    };

    const labels = {
      admin: 'Administrador',
      editor: 'Editor',
      viewer: 'Visualizador',
    };

    return (
      <Badge className={styles[role as keyof typeof styles]}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-0 py-0 sm:px-2 sm:py-2 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <MobileNav />

            {company && (
              <div className="hidden lg:flex items-center text-gray-600 min-w-0">
                <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium break-words">
                  {company.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Botão de notificações */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNotificationCenterOpen(true)}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -left-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>

            {profile && (
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900 break-words">
                  {profile.name}
                </p>
                {getRoleBadge(profile.role)}
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

      <NotificationCenter 
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </>
  );
}
