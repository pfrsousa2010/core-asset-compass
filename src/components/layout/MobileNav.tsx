
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { 
  Menu, 
  LayoutDashboard, 
  Package, 
  Users, 
  User,
  LogOut,
  Building2
} from 'lucide-react';

export function MobileNav() {
  const { profile, company, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Ativos', href: '/assets', icon: Package },
    ...(profile?.role === 'admin' ? [{ name: 'Usuários', href: '/users', icon: Users }] : []),
  ];

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Patrimony</h2>
                {company && (
                  <div className="flex items-start text-sm text-gray-600 mt-1">
                    <Building2 className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                    <span className="break-words leading-tight">{company.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <Separator />

          {/* User Section */}
          <div className="p-4 space-y-2">
            <Link
              to="/profile"
              onClick={handleNavClick}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <User className="mr-3 h-5 w-5" />
              Perfil
            </Link>
            
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </div>

          {profile && (
            <div className="p-4 border-t bg-gray-50">
              <div className="text-xs text-gray-500">
                <p className="font-medium break-words">{profile.name}</p>
                <p className="break-words">{profile.email}</p>
                <p className="capitalize mt-1">
                  {profile.role === 'admin' ? 'Administrador' : 
                   profile.role === 'editor' ? 'Editor' : 'Visualizador'}
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
