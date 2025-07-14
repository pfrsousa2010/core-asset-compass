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

const parseDate = (dateString?: string): string | null => {
  if (!dateString || dateString.trim() === '') return null;
  
  const trimmedDate = dateString.trim();
  
  // Try to parse as ISO date first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
    return trimmedDate;
  }
  
  // Try to parse DD/MM/YYYY or DD-MM-YYYY
  const slashMatch = trimmedDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Try to parse MM/DD/YYYY or MM-DD-YYYY
  const americanMatch = trimmedDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (americanMatch) {
    const [, month, day, year] = americanMatch;
    // Assume it's MM/DD/YYYY if month > 12, otherwise DD/MM/YYYY
    if (parseInt(month) > 12) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Try to parse with Date constructor (handles various formats including with time)
  try {
    const date = new Date(trimmedDate);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
    }
  } catch (error) {
    // Continue to next parsing attempt
  }
  
  // Try to parse DD.MM.YYYY
  const dotMatch = trimmedDate.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (dotMatch) {
    const [, day, month, year] = dotMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // If all parsing attempts fail, return null
  return null;
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
    unity: row.unity || null, // <--- Adicionado
    status: parseStatus(row.status),
    acquisition_date: parseDate(row.data_aquisicao),
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