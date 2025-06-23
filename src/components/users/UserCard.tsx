
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, Edit } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
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

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {isActive ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  };

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Mail className="h-3 w-3 mr-1" />
              {user.email}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            {getRoleBadge(user.role)}
            {getStatusBadge(user.is_active ?? true)}
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Calendar className="h-4 w-4 mr-2" />
          Desde {formatDate(user.created_at)}
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(user)}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
