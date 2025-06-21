
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-yellow-100 text-yellow-800',
      viewer: 'bg-green-100 text-green-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[role as keyof typeof styles]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">
                {profile?.name}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{profile?.email}</span>
                {profile?.role && getRoleBadge(profile.role)}
              </div>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-gray-500 hover:text-gray-700"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
