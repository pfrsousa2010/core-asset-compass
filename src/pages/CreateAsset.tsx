
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CreateAsset() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    status: 'ativo' as const,
    acquisition_date: '',
    value: '',
  });
  const [error, setError] = useState('');

  const createAssetMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!profile?.company_id) {
        throw new Error('Company ID not found');
      }

      const { error } = await supabase.from('assets').insert({
        name: data.name,
        code: data.code,
        location: data.location || null,
        status: data.status,
        acquisition_date: data.acquisition_date || null,
        value: data.value ? parseFloat(data.value) : null,
        company_id: profile.company_id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-assets'] });
      toast({
        title: "Ativo criado com sucesso!",
        description: "O ativo foi adicionado ao sistema",
      });
      navigate('/assets');
    },
    onError: (error: any) => {
      setError(error.message || 'Erro ao criar ativo');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.code) {
      setError('Nome e código são obrigatórios');
      return;
    }

    createAssetMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/assets')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Ativo</h1>
          <p className="mt-2 text-gray-600">
            Adicionar um novo ativo ao patrimônio da empresa
          </p>
        </div>
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
                disabled={createAssetMutation.isPending}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {createAssetMutation.isPending ? 'Salvando...' : 'Salvar Ativo'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/assets')}
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
