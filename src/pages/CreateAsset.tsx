import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AssetForm, AssetFormData } from '@/components/assets/AssetForm';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useState } from 'react';

export default function CreateAsset() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const { data: planLimits } = usePlanLimits();

  const createAssetMutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      if (!profile?.company_id) {
        throw new Error('Company ID not found');
      }

      // Verificar limites do plano
      if (planLimits?.isAssetsLimitReached) {
        throw new Error('Limite de ativos do seu plano foi atingido. Faça upgrade para adicionar mais ativos.');
      }

      const { error } = await supabase.from('assets').insert({
        name: data.name,
        code: data.code,
        location: data.location || null,
        status: data.status,
        acquisition_date: data.acquisition_date || null,
        value: data.value ? parseFloat(data.value) : null,
        serial_number: data.serial_number || null,
        color: data.color || null,
        manufacturer: data.manufacturer || null,
        model: data.model || null,
        capacity: data.capacity || null,
        voltage: data.voltage || null,
        origin: data.origin && data.origin !== 'nao_informado' ? data.origin : null,
        condition: data.condition || null,
        inalienable: data.inalienable,
        holder: data.holder || null,
        notes: data.notes || null,
        company_id: profile.company_id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-assets'] });
      queryClient.invalidateQueries({ queryKey: ['plan-limits'] });
      
      // Mostrar toast de sucesso
      toast({
        title: "Ativo criado com sucesso!",
        description: "O ativo foi adicionado ao sistema",
      });

      // Verificar se está próximo do limite e mostrar aviso
      if (planLimits?.isAssetsLimitWarning && !planLimits?.isAssetsLimitReached) {
        toast({
          title: "Aproximando do limite",
          description: "Você está próximo do limite de ativos do seu plano. Considere fazer upgrade.",
          variant: "destructive",
        });
      }

      navigate('/assets');
    },
    onError: (error: any) => {
      setError(error.message || 'Erro ao criar ativo');
    },
  });

  const handleSubmit = (data: AssetFormData) => {
    setError('');

    if (!data.name || !data.code) {
      setError('Nome e código são obrigatórios');
      return;
    }

    createAssetMutation.mutate(data);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/assets')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Novo Ativo</h1>
          <p className="mt-2 text-gray-600">
            Adicionar um novo ativo ao patrimônio da empresa
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

        {planLimits?.isAssetsLimitReached && (
          <Alert className="mb-6">
            <AlertDescription>
              Você atingiu o limite de ativos do seu plano atual ({planLimits.assetsCount}/{planLimits.assetsLimit}). 
              <Button 
                variant="link" 
                className="p-0 h-auto font-semibold ml-1"
                onClick={() => navigate('/meu-plano')}
              >
                Faça upgrade do seu plano 
              </Button>
              para adicionar mais ativos.
            </AlertDescription>
          </Alert>
        )}

        <AssetForm
          onSubmit={handleSubmit}
          isSubmitting={createAssetMutation.isPending}
          submitLabel="Salvar Ativo"
          disabled={planLimits?.isAssetsLimitReached}
        />
      </div>
    </div>
  );
}
