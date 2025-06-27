import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AssetStatus = Database['public']['Enums']['asset_status'];

interface ExportFilters {
  search: string;
  statusFilter: string;
  locationFilter: string;
  companyName: string;
}

interface UseAssetExportReturn {
  exportLoading: boolean;
  exportToCSV: (filters: ExportFilters) => Promise<void>;
}

const CSV_HEADERS = [
  'Nome',
  'Código',
  'Status',
  'Localização',
  'Valor',
  'Data de Aquisição',
  'Fabricante',
  'Modelo',
  'Cor',
  'Número de Série',
  'Capacidade',
  'Voltagem',
  'Condições',
  'Detentor',
  'Origem',
  'Inalienável',
  'Observações'
];

export function useAssetExport(): UseAssetExportReturn {
  const [exportLoading, setExportLoading] = useState(false);

  const buildQuery = (filters: ExportFilters) => {
    let query = supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
    }
    if (filters.statusFilter !== 'all') {
      query = query.eq('status', filters.statusFilter as AssetStatus);
    }
    if (filters.locationFilter !== 'all') {
      query = query.eq('location', filters.locationFilter);
    }

    return query;
  };

  const formatCSVField = (field: any): string => {
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    return stringField.includes(',') ? `"${stringField.replace(/"/g, '""')}"` : stringField;
  };

  const generateCSVContent = (assets: any[]) => {
    const csvData = assets.map(asset => [
      asset.name,
      asset.code,
      asset.status,
      asset.location || '',
      asset.value || '',
      asset.acquisition_date || '',
      asset.manufacturer || '',
      asset.model || '',
      asset.color || '',
      asset.serial_number || '',
      asset.capacity || '',
      asset.voltage || '',
      asset.condition || '',
      asset.holder || '',
      asset.origin || '',
      asset.inalienable ? 'Sim' : 'Não',
      asset.notes || ''
    ].map(formatCSVField));

    return [
      CSV_HEADERS.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
  };

  const generateFileName = (companyName: string): string => {
    const now = new Date();
    const utc3 = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const dateStr = utc3.toISOString().replace('T', '_').slice(0, 16).replace(':', '') + "h";
    return `ativos_${companyName}_${dateStr}.csv`;
  };

  const downloadCSV = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToCSV = async (filters: ExportFilters): Promise<void> => {
    setExportLoading(true);
    
    try {
      const query = buildQuery(filters);
      const { data: assets, error } = await query;
      
      if (error || !assets || assets.length === 0) {
        throw new Error('Nenhum ativo encontrado para exportar');
      }

      const csvContent = generateCSVContent(assets);
      const fileName = generateFileName(filters.companyName);
      
      downloadCSV(csvContent, fileName);
    } finally {
      setExportLoading(false);
    }
  };

  return {
    exportLoading,
    exportToCSV,
  };
} 