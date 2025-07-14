export interface CSVRow {
  nome: string;
  codigo: string;
  localizacao?: string;
  unity?: string;
  status?: string;
  data_aquisicao?: string;
  valor?: string;
  numero_serie?: string;
  cor?: string;
  fabricante?: string;
  modelo?: string;
  capacidade?: string;
  voltagem?: string;
  origem?: string;
  condicoes?: string;
  inalienavel?: string;
  detentor?: string;
  observacoes?: string;
}

export interface ImportResult {
  success: number;
  errors: Array<{ row: number; error: string; data: CSVRow }>;
}

export interface AssetData {
  name: string;
  code: string;
  location: string | null;
  unity: string | null;
  status: 'ativo' | 'manutenção' | 'baixado';
  acquisition_date: string | null;
  value: number | null;
  serial_number: string | null;
  color: string | null;
  manufacturer: string | null;
  model: string | null;
  capacity: string | null;
  voltage: string | null;
  origin: string | null;
  condition: string | null;
  inalienable: boolean;
  holder: string | null;
  notes: string | null;
  company_id: string;
} 