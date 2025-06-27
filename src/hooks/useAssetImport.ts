import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CSVRow, ImportResult, AssetData } from '@/types/asset-import';

// Utility functions
const parseValue = (value: string): number | null => {
  if (!value) return null;
  return parseFloat(value.replace(',', '.'));
};

const parseStatus = (status?: string): 'ativo' | 'manutenção' | 'baixado' => {
  const normalizedStatus = status?.toLowerCase();
  if (normalizedStatus === 'manutenção') return 'manutenção';
  if (normalizedStatus === 'baixado') return 'baixado';
  return 'ativo';
};

const parseInalienable = (value?: string): boolean => {
  const normalizedValue = value?.toLowerCase();
  return normalizedValue === 'sim' || normalizedValue === 'true';
};

const validateRequiredFields = (row: CSVRow): string | null => {
  if (!row.nome || !row.codigo) {
    return 'Nome e código são obrigatórios';
  }
  return null;
};

const transformCSVRowToAssetData = (row: CSVRow, companyId: string): AssetData => {
  return {
    name: row.nome,
    code: row.codigo,
    location: row.localizacao || null,
    status: parseStatus(row.status),
    acquisition_date: row.data_aquisicao || null,
    value: parseValue(row.valor),
    serial_number: row.numero_serie || null,
    color: row.cor || null,
    manufacturer: row.fabricante || null,
    model: row.modelo || null,
    capacity: row.capacidade || null,
    voltage: row.voltagem || null,
    origin: row.origem || null,
    condition: row.condicoes || null,
    inalienable: parseInalienable(row.inalienavel),
    holder: row.detentor || null,
    notes: row.observacoes || null,
    company_id: companyId,
  };
};

export const useAssetImport = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (csvData: CSVRow[]) => {
      if (!profile?.company_id) {
        throw new Error('Company ID not found');
      }

      const result: ImportResult = { success: 0, errors: [] };
      
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const rowNumber = i + 2; // +2 because CSV has header and is 1-indexed

        // Validate required fields
        const validationError = validateRequiredFields(row);
        if (validationError) {
          result.errors.push({
            row: rowNumber,
            error: validationError,
            data: row
          });
          continue;
        }

        try {
          const assetData = transformCSVRowToAssetData(row, profile.company_id);
          const { error } = await supabase.from('assets').insert(assetData);

          if (error) {
            result.errors.push({
              row: rowNumber,
              error: error.message,
              data: row
            });
          } else {
            result.success++;
          }
        } catch (error) {
          result.errors.push({
            row: rowNumber,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            data: row
          });
        }
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-assets'] });
      
      toast({
        title: "Importação concluída!",
        description: `${result.success} ativos importados com sucesso`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na importação",
        description: error.message || 'Erro ao importar ativos',
        variant: "destructive",
      });
    },
  });
}; 