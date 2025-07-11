import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Database } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';

type UserRole = Database['public']['Enums']['user_role'];

interface FormData {
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
}

interface UserFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  error: string;
  isLoading: boolean;
  isEditing: boolean;
  isEditingSelf: boolean;
  disabled?: boolean;
}

export function UserForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  error,
  isLoading,
  isEditing,
  isEditingSelf,
  disabled = false
}: UserFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          disabled={isEditing}
        />
        {isEditing && (
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
            <SelectItem value="viewer">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Visualizador</Badge>
                <span className="text-xs text-gray-600">Apenas visualiza dados</span>
              </div>
            </SelectItem>
            <SelectItem value="editor">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800">Editor</Badge>
                <span className="text-xs text-gray-600">Pode criar e editar</span>
              </div>
            </SelectItem>
            <SelectItem value="admin">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-800">Administrador</Badge>
                <span className="text-xs text-gray-600">Controle total</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isEditingSelf && (
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is_active">Usuário ativo</Label>
        </div>
      )}

      {isEditingSelf && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-700">
            Você não pode alterar o status de ativação da sua própria conta.
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || disabled}
          className="flex-1"
        >
          {isLoading
            ? 'Salvando...' 
            : isEditing ? 'Salvar Alterações' : 'Criar Usuário'
          }
        </Button>
      </div>
    </form>
  );
}
