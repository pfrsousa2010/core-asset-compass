
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users as UsersIcon } from 'lucide-react';
import { UserCard } from './UserCard';
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

interface UsersListProps {
  users: User[] | undefined;
  isLoading: boolean;
  onEdit: (user: User) => void;
  onCreateUser: () => void;
}

export function UsersList({ users, isLoading, onEdit, onCreateUser }: UsersListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-md animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="col-span-full">
        <Card className="border-0 shadow-md">
          <CardContent className="text-center py-12">
            <UsersIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece adicionando usuários à sua empresa
            </p>
            <Button onClick={onCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Usuário
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {users.map((user) => (
        <UserCard key={user.id} user={user} onEdit={onEdit} />
      ))}
    </div>
  );
}
