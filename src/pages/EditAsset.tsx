
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type AssetStatus = Database['public']['Enums']['asset_status'];

export default function EditAsset() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    status: 'ativo' as AssetStatus,
    acquisition_date: '',
    value: '',
  });
  const [error, setError] = useState('');

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      if (!id) throw new Error('Asset ID is required');

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        code: asset.code,
        location: asset.location || '',
        status: asset.status,
        acquisition_date: asset.acquisition_date || '',
        value: asset.value?.toString() || '',
      });
    }
  }, [asset]);

  const updateAssetMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!id) throw new Error('Asset ID is required');

      const { error } = await supabase
        .from('assets')
        .update({
          name: data.name,
          code: data.code,
          location: data.location || null,
          status: data.status,
          acquisition_date: data.acquisition_date || null,
          value: data.value ? parseFloat(data.value) : null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-assets'] });
      toast({
        title: "Ativo atualizado com sucesso!",
        description: "As alterações foram salvas",
      });
      navigate(`/assets/${id}`);
    },
    onError: (error: any) => {
      setError(error.message || 'Erro ao atualizar ativo');
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Asset ID is required');

      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-assets'] });
      toast({
        title: "Ativo removido com sucesso!",
        description: "O ativo foi excluído do sistema",
      });
      navigate('/assets');
    },
    onError: (error: any) => {
      setError(error.message || 'Erro ao excluir ativo');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.code) {
      setError('Nome e código são obrigatórios');
      return;
    }

    updateAssetMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este ativo? Esta ação não pode ser desfeita.')) {
      deleteAssetMutation.mutate();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canDelete = profile?.role === 'admin';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/assets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="animate-pulse">
          <Card className="border-0 shadow-md max-w-2xl">
            <CardContent className="p-8">
              <div className="space-y-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/assets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ativo não encontrado
            </h3>
            <p className="text-gray-600">
              O ativo solicitado não existe ou foi removido
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(`/assets/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Ativo</h1>
            <p className="mt-2 text-gray-600">
              Modificar informações do ativo {asset.name}
            </p>
          </div>
        </div>
        
        {canDelete && (
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteAssetMutation.isPending}
          >
            <Trash className="h-4 w-4 mr-2" />
            {deleteAssetMutation.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        )}
      </div>

      {/* Form */}
      <Card className="border-0 shadow-md max-w-2xl">
        <CardHeader>
          <CardTitle>Informações do Ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Ativo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Notebook Dell"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código do Ativo *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="Ex: NB001"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ex: Sala 201"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="manutenção">Manutenção</SelectItem>
                    <SelectItem value="baixado">Baixado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="acquisition_date">Data de Aquisição</Label>
                <Input
                  id="acquisition_date"
                  type="date"
                  value={formData.acquisition_date}
                  onChange={(e) => handleInputChange('acquisition_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={updateAssetMutation.isPending}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateAssetMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/assets/${id}`)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
