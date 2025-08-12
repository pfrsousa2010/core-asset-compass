import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

type AssetStatus = Database['public']['Enums']['asset_status'];

interface ExportFilters {
  search: string;
  statusFilter: string;
  locationFilter: string;
  unityFilter?: string; // <--- Adicionado
  companyName: string;
}

export type ExportFormat = 'csv' | 'excel' | 'pdf';

interface UseAssetExportReturn {
  exportLoading: boolean;
  exportToCSV: (filters: ExportFilters) => Promise<void>;
  exportToExcel: (filters: ExportFilters) => Promise<void>;
  exportToPDF: (filters: ExportFilters) => Promise<void>;
  exportToFormat: (format: ExportFormat, filters: ExportFilters) => Promise<void>;
}

const CSV_HEADERS = [
  'Nome',
  'Código',
  'Status',
  'Localização',
  'Unidade', // <--- Adicionado
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

const EXCEL_HEADERS = [
  'Nome',
  'Código',
  'Status',
  'Localização',
  'Unidade', // <--- Adicionado
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
    if (filters.unityFilter && filters.unityFilter !== 'all') {
      query = query.eq('unity', filters.unityFilter);
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
      asset.unity || '', // <--- Adicionado
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

  const generateExcelData = (assets: any[]) => {
    return assets.map(asset => [
      asset.name,
      asset.code,
      asset.status,
      asset.location || '',
      asset.unity || '', // <--- Adicionado
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
    ]);
  };

  const generateFileName = (companyName: string, format: string, filters?: ExportFilters): string => {
    const now = new Date();
    const utc3 = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const dateStr = utc3.toISOString().replace('T', '_').slice(0, 16).replace(':', '') + "h";
    let filterStr = '';
    if (filters) {
      if (filters.statusFilter && filters.statusFilter !== 'all') {
        filterStr += `_status-${filters.statusFilter}`;
      }
      if (filters.locationFilter && filters.locationFilter !== 'all') {
        filterStr += `_local-${filters.locationFilter.replace(/\s+/g, '')}`;
      }
      if (filters.unityFilter && filters.unityFilter !== 'all') {
        filterStr += `_unidade-${filters.unityFilter.replace(/\s+/g, '')}`;
      }
      if (filters.search) {
        filterStr += `_busca-${filters.search.replace(/\s+/g, '')}`;
      }
    }
    return `ativos_${companyName}_${dateStr}${filterStr}.${format}`;
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

  const downloadExcel = (workbook: XLSX.WorkBook, fileName: string) => {
    XLSX.writeFile(workbook, fileName);
  };

  const downloadPDF = (pdf: jsPDF, fileName: string) => {
    pdf.save(fileName);
  };

  const exportToCSV = async (filters: ExportFilters): Promise<void> => {
    setExportLoading(true);
    
    try {
      const query = buildQuery(filters);
      const { data: assets, error } = await query;
      
      if (error || !assets || assets.length === 0) {
        throw new Error('Nenhum patrimônio encontrado para exportar');
      }

      const csvContent = generateCSVContent(assets);
      const fileName = generateFileName(filters.companyName, 'csv', filters);
      
      downloadCSV(csvContent, fileName);
    } finally {
      setExportLoading(false);
    }
  };

  const exportToExcel = async (filters: ExportFilters): Promise<void> => {
    setExportLoading(true);
    
    try {
      const query = buildQuery(filters);
      const { data: assets, error } = await query;
      
      if (error || !assets || assets.length === 0) {
        throw new Error('Nenhum patrimônio encontrado para exportar');
      }

      const excelData = generateExcelData(assets);
      const worksheet = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS, ...excelData]);
      
      // Auto-size columns
      const columnWidths = EXCEL_HEADERS.map(header => ({ wch: Math.max(header.length, 15) }));
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Patrimônios');
      
      const fileName = generateFileName(filters.companyName, 'xlsx', filters);
      downloadExcel(workbook, fileName);
    } finally {
      setExportLoading(false);
    }
  };

  const exportToPDF = async (filters: ExportFilters): Promise<void> => {
    setExportLoading(true);
    
    try {
      const query = buildQuery(filters);
      const { data: assets, error } = await query;
      
      if (error || !assets || assets.length === 0) {
        throw new Error('Nenhum patrimônio encontrado para exportar');
      }

      // Montar dados para a tabela
      const tableData = assets.map(asset => [
        asset.name || '',
        asset.code || '',
        asset.status || '',
        asset.location || '',
        asset.unity || '', // <--- Adicionado
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
      ]);

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Título e cabeçalho
      doc.setFontSize(12);
      doc.text(`Relatório de Patrimônios - ${filters.companyName}`, 10, 14);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 10, 21);

      // Tabela
      autoTable(doc, {
        startY: 26,
        head: [EXCEL_HEADERS],
        body: tableData,
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: 30,
          fontStyle: 'bold',
        },
        bodyStyles: {
          textColor: 50,
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Nome
          1: { cellWidth: 12 }, // Código
          2: { cellWidth: 13 }, // Status
          3: { cellWidth: 18 }, // Localização
          4: { cellWidth: 18 }, // Unidade
          5: { cellWidth: 12 }, // Valor
          6: { cellWidth: 15 }, // Data de Aquisição
          7: { cellWidth: 17 }, // Fabricante
          8: { cellWidth: 13 }, // Modelo
          9: { cellWidth: 11 }, // Cor
          10: { cellWidth: 15 }, // Número de Série
          11: { cellWidth: 17 }, // Capacidade
          12: { cellWidth: 15 }, // Voltagem
          13: { cellWidth: 18 }, // Condições
          14: { cellWidth: 13 }, // Detentor
          15: { cellWidth: 13 }, // Origem
          16: { cellWidth: 16 }, // Inalienável
          17: { cellWidth: 20 }, // Observações
        },
        margin: { left: 8, right: 8 },
      });

      // Corrigir rodapé de todas as páginas
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text('armazena.app.br', 10, doc.internal.pageSize.getHeight() - 6);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, doc.internal.pageSize.getHeight() - 6);
      }

      const fileName = generateFileName(filters.companyName, 'pdf', filters);
      doc.save(fileName);
    } finally {
      setExportLoading(false);
    }
  };

  const exportToFormat = async (format: ExportFormat, filters: ExportFilters): Promise<void> => {
    switch (format) {
      case 'csv':
        return exportToCSV(filters);
      case 'excel':
        return exportToExcel(filters);
      case 'pdf':
        return exportToPDF(filters);
      default:
        throw new Error('Formato de exportação não suportado');
    }
  };

  return {
    exportLoading,
    exportToCSV,
    exportToExcel,
    exportToPDF,
    exportToFormat,
  };
} 