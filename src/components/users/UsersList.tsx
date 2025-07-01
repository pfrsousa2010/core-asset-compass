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
  profile: any;
  onDelete: (user: User) => void;
}

export function UsersList({ users, isLoading, onEdit, onCreateUser, profile, onDelete }: UsersListProps) {
  if (isLoading) {
    return (
      <div className="col-span-full flex justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="flex items-center space-x-2 text-gray-500">
            <UsersIcon className="h-5 w-5 animate-pulse" />
            <span className="text-base">Carregando usuários...</span>
          </div>
        </div>
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

  const handleDelete = (user: User) => {
    onDelete(user);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {users.map((user) => (
        <UserCard key={user.id} user={user} onEdit={onEdit} profile={profile} onDelete={handleDelete} />
      ))}
    </div>
  );
}
