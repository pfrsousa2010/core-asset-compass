
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  User,
  Building2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Ativos', href: '/assets', icon: Package },
  { name: 'Usuários', href: '/users', icon: Users, adminOnly: true },
  { name: 'Perfil', href: '/profile', icon: User },
];

export function Sidebar() {
  const location = useLocation();
  const { profile } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || profile?.role === 'admin'
  );

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 shadow-sm">
        <div className="flex items-center flex-shrink-0 px-6">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div className="ml-3">
            <h1 className="text-lg font-bold text-gray-900">Patrimony</h1>
            <p className="text-xs text-gray-500">Manager</p>
          </div>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-4 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href === '/assets' && location.pathname.startsWith('/assets'));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 text-blue-600" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
