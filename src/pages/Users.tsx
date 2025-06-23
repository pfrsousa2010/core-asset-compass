import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { UsersList } from '@/components/users/UsersList';
import { UserForm } from '@/components/users/UserForm';
import { useUserMutations } from '@/hooks/useUserMutations';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export default function Users() {
  const { profile } = useAuth();
  const { createUserMutation, updateUserMutation } = useUserMutations();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'viewer' as UserRole,
    is_active: true,
  });
  const [error, setError] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['company-users'],
    queryFn: async () => {
      // Remover o filtro is_active = true para mostrar todos os usuários
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', profile?.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.company_id,
  });

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'viewer',
      is_active: true,
    });
    setError('');
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: user.is_active ?? true,
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email) {
      setError('Nome e email são obrigatórios');
      return;
    }

    if (editingUser) {
      updateUserMutation.mutate({
        userId: editingUser.id,
        updates: { 
          name: formData.name, 
          role: formData.role,
          is_active: formData.is_active
        }
      }, {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setEditingUser(null);
          resetForm();
        },
        onError: (error: any) => {
          console.error('Error updating user:', error);
          setError(error.message || 'Erro ao atualizar usuário');
        }
      });
    } else {
      createUserMutation.mutate({
        email: formData.email,
        name: formData.name,
        role: formData.role,
        is_active: formData.is_active
      }, {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          resetForm();
        },
        onError: (error: any) => {
          console.error('Error creating user:', error);
          setError(error.message || 'Erro ao criar usuário');
        }
      });
    }
  };

  const handleCancel = () => {
    setIsCreateModalOpen(false);
    setEditingUser(null);
    resetForm();
  };

  const handleCreateUser = () => {
    resetForm();
    setEditingUser(null);
    setIsCreateModalOpen(true);
  };

  // Verificar se o usuário está editando a si mesmo
  const isEditingSelf = editingUser && editingUser.id === profile?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="mt-2 text-gray-600">
            Gerencie os usuários da sua empresa
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Modifique as informações do usuário' 
                  : 'Adicione um novo usuário à empresa. O usuário receberá um convite por email.'
                }
              </DialogDescription>
            </DialogHeader>

            <UserForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              error={error}
              isLoading={createUserMutation.isPending || updateUserMutation.isPending}
              isEditing={!!editingUser}
              isEditingSelf={isEditingSelf}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <UsersList 
        users={users}
        isLoading={isLoading}
        onEdit={handleEdit}
        onCreateUser={handleCreateUser}
      />
    </div>
  );
}
