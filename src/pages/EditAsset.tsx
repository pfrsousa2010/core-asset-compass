
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AssetForm, AssetFormData } from '@/components/assets/AssetForm';

export default function EditAsset() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  const updateAssetMutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      if (!id) throw new Error('Asset ID is required');
      if (!profile?.company_id) throw new Error('Company ID not found');

      const { error } = await supabase
        .from('assets')
        .update({
          name: data.name,
          code: data.code,
          location: data.location || null,
          unity: data.unity || null,
          status: data.status,
          acquisition_date: data.acquisition_date || null,
          value: data.value ? parseFloat(data.value) : null,
          serial_number: data.serial_number || null,
          color: data.color || null,
          manufacturer: data.manufacturer || null,
          model: data.model || null,
          capacity: data.capacity || null,
          voltage: data.voltage || null,
          origin: data.origin || null,
          condition: data.condition || null,
          inalienable: data.inalienable,
          holder: data.holder || null,
          notes: data.notes || null,
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
        title: "Patrimônio atualizado com sucesso!",
        description: "As alterações foram salvas",
      });
      navigate(`/assets/${id}`);
    },
    onError: (error: any) => {
      setError(error.message || 'Erro ao atualizar patrimônio');
    },
  });

  const handleSubmit = (data: AssetFormData) => {
    setError('');

    if (!data.name || !data.code) {
      setError('Nome e código são obrigatórios');
      return;
    }

    updateAssetMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/assets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="animate-pulse max-w-4xl">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/assets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>Patrimônio não encontrado</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(`/assets/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Editar Patrimônio</h1>
          <p className="mt-2 text-gray-600">
            Modificar informações de <strong>{asset.name}</strong>
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AssetForm
          asset={asset}
          onSubmit={handleSubmit}
          isSubmitting={updateAssetMutation.isPending}
          submitLabel="Salvar Alterações"
        />
      </div>
    </div>
  );
}
