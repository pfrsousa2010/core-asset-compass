
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Shield, Building, Save, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(profile?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const updateProfileMutation = useMutation({
    mutationFn: async (newName: string) => {
      if (!profile?.id) throw new Error('User not found');

      const { error } = await supabase
        .from('profiles')
        .update({ name: newName })
        .eq('id', profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      refreshProfile();
      toast({
        title: "Perfil atualizado com sucesso!",
        description: "Suas informações foram salvas",
      });
    },
    onError: (error: any) => {
      setError(error.message || 'Erro ao atualizar perfil');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async ({ current, newPass }: { current: string; newPass: string }) => {
      const { error } = await supabase.auth.updateUser({
        password: newPass,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: "Senha atualizada com sucesso!",
        description: "Sua nova senha foi salva",
      });
    },
    onError: (error: any) => {
      setError(error.message || 'Erro ao atualizar senha');
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    updateProfileMutation.mutate(name);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Todos os campos de senha são obrigatórios');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação devem ser iguais');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    updatePasswordMutation.mutate({
      current: currentPassword,
      newPass: newPassword,
    });
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-yellow-100 text-yellow-800',
      viewer: 'bg-green-100 text-green-800',
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[role as keyof typeof styles]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="mt-2 text-gray-600">
          Gerencie suas informações pessoais e configurações de conta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">O email não pode ser alterado</p>
              </div>

              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>

            <Separator />

            {/* Account Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Informações da Conta</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Papel na empresa</span>
                </div>
                {profile?.role && getRoleBadge(profile.role)}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Membro desde</span>
                </div>
                <span className="text-sm text-gray-900">
                  {profile?.created_at && formatDate(profile.created_at)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2 text-blue-600" />
              Alterar Senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Sua senha atual"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                disabled={updatePasswordMutation.isPending}
                className="w-full"
              >
                <Key className="h-4 w-4 mr-2" />
                {updatePasswordMutation.isPending ? 'Atualizando...' : 'Atualizar Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
