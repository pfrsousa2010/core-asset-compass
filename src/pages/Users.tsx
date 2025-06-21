
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Users as UsersIcon, Mail, Calendar, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

export default function Users() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'viewer' as const,
  });
  const [error, setError] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['company-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      toast({
        title: "Usuário atualizado com sucesso!",
        description: "As alterações foram salvas",
      });
      setEditingUser(null);
      resetForm();
    },
    onError: (error: any) => {
      setError(error.message || 'Erro ao atualizar usuário');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      toast({
        title: "Usuário removido com sucesso!",
        description: "O usuário foi excluído do sistema",
      });
    },
    onError: (error: any) => {
      setError(error.message || 'Erro ao excluir usuário');
    },
  });

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'viewer',
    });
    setError('');
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
    });
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
        updates: { name: formData.name, role: formData.role }
      });
    }
  };

  const handleDelete = (userId: string, userName: string) => {
    if (userId === profile?.id) {
      toast({
        title: "Ação não permitida",
        description: "Você não pode excluir sua própria conta",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário ${userName}? Esta ação não pode ser desfeita.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-yellow-100 text-yellow-800',
      viewer: 'bg-green-100 text-green-800',
    };
    
    return (
      <Badge className={styles[role as keyof typeof styles]}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

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
            <Button onClick={() => { resetForm(); setEditingUser(null); }}>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  required
                  disabled={!!editingUser}
                />
                {editingUser && (
                  <p className="text-xs text-gray-500">O email não pode ser alterado</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Papel</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer - Apenas visualização</SelectItem>
                    <SelectItem value="editor">Editor - Pode criar e editar</SelectItem>
                    <SelectItem value="admin">Admin - Controle total</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  disabled={updateUserMutation.isPending}
                  className="flex-1"
                >
                  {updateUserMutation.isPending 
                    ? 'Salvando...' 
                    : editingUser ? 'Salvar Alterações' : 'Criar Usuário'
                  }
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))
        ) : users && users.length > 0 ? (
          users.map((user) => (
            <Card key={user.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {user.email}
                    </div>
                  </div>
                  {getRoleBadge(user.role)}
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  Desde {formatDate(user.created_at)}
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      handleEdit(user);
                      setIsCreateModalOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(user.id, user.name)}
                    disabled={user.id === profile?.id}
                    className="flex-1"
                  >
                    <Trash className="h-3 w-3 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
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
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Usuário
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
