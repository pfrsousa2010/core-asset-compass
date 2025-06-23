
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Building2, Shield, Clock, UserCheck, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Profile() {
  const { profile, company, user, updatePassword } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    profile: '',
    password: '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      if (!profile?.id) throw new Error('Profile ID not found');

      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          email: data.email,
        })
        .eq('id', profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso",
      });
      setErrors(prev => ({ ...prev, profile: '' }));
    },
    onError: (error: any) => {
      setErrors(prev => ({ ...prev, profile: error.message || 'Erro ao atualizar perfil' }));
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const result = await updatePassword(newPassword);
      if (!result.success) {
        throw new Error(result.error || 'Erro ao alterar senha');
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso",
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setErrors(prev => ({ ...prev, password: '' }));
    },
    onError: (error: any) => {
      setErrors(prev => ({ ...prev, password: error.message || 'Erro ao alterar senha' }));
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, profile: '' }));

    if (!formData.name.trim()) {
      setErrors(prev => ({ ...prev, profile: 'Nome é obrigatório' }));
      return;
    }

    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, profile: 'Email é obrigatório' }));
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, password: '' }));

    if (!passwordData.newPassword) {
      setErrors(prev => ({ ...prev, password: 'Nova senha é obrigatória' }));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Nova senha deve ter pelo menos 6 caracteres' }));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors(prev => ({ ...prev, password: 'Senhas não coincidem' }));
      return;
    }

    updatePasswordMutation.mutate(passwordData.newPassword);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Visualizador';
      default:
        return role;
    }
  };

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Perfil</h1>
        <Card className="border-0 shadow-md">
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Perfil não encontrado
            </h3>
            <p className="text-gray-600">
              Não foi possível carregar as informações do perfil
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl m d:text-3xl font-bold text-gray-900">Perfil</h1>
        <p className="mt-2 text-gray-600">
          Gerencie suas informações pessoais e configurações da conta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Usuário */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editar Perfil */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-3 text-blue-600" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      disabled
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                {errors.profile && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.profile}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-3 text-blue-600" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="Digite a nova senha"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>

                {errors.password && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.password}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {updatePasswordMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar com informações */}
        <div className="space-y-6">
          {/* Informações da Conta */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-3 text-green-600" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900 truncate">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Função</p>
                  <p className="text-sm text-gray-900">{getRoleLabel(profile.role)}</p>
                </div>
              </div>

              {company && (
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-500">Empresa</p>
                    <p className="text-sm text-gray-900 break-words">{company.name}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-blue-600" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Conta criada em</p>
                <p className="text-sm text-gray-900">
                  {format(new Date(profile.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>

              {profile.updated_by_user_name && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Última modificação</p>
                    <p className="text-sm text-gray-900">{profile.updated_by_user_name}</p>
                    <p className="text-sm text-gray-900">{format(new Date(profile.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
