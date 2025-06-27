// CSV Header mapping for different variations of column names
export const CSV_HEADER_MAP: Record<string, string> = {
  'nome': 'nome',
  'código': 'codigo',
  'codigo': 'codigo',
  'localização': 'localizacao',
  'localizacao': 'localizacao',
  'local': 'localizacao',
  'status': 'status',
  'aquisição': 'data_aquisicao',
  'data de aquisição': 'data_aquisicao',
  'data_aquisicao': 'data_aquisicao',
  'data': 'data_aquisicao',
  'valor': 'valor',
  'preço': 'valor',
  'preco': 'valor',
  'número de série': 'numero_serie',
  'numero_serie': 'numero_serie',
  'serial': 'numero_serie',
  'cor': 'cor',
  'fabricante': 'fabricante',
  'marca': 'fabricante',
  'modelo': 'modelo',
  'capacidade': 'capacidade',
  'voltagem': 'voltagem',
  'origem': 'origem',
  'condições': 'condicoes',
  'condicoes': 'condicoes',
  'condição': 'condicoes',
  'condicao': 'condicoes',
  'inalienável': 'inalienavel',
  'inalienavel': 'inalienavel',
  'detentor': 'detentor',
  'responsável': 'detentor',
  'responsavel': 'detentor',
  'observações': 'observacoes',
  'observacoes': 'observacoes',
  'obs': 'observacoes',
  'notas': 'observacoes',
};

// CSV Template for download
export const CSV_TEMPLATE = `nome,codigo,localizacao,status,data_aquisicao,valor,numero_serie,cor,fabricante,modelo,capacidade,voltagem,origem,condicoes,inalienavel,detentor,observacoes
Notebook Dell,NB001,Sala 101,ativo,2023-01-15,2500.00,SN123456,Preto,Dell,Inspiron 15,8GB RAM,Bivolt,compra,Novo,não,João Silva,Notebook para desenvolvimento
Monitor Samsung,MON001,Sala 102,ativo,2023-02-10,800.00,MON789,Branco,Samsung,24 polegadas,1920x1080,110V,compra,Usado,não,Maria Santos,Monitor secundário`;

// Utility functions
export const normalizeHeader = (header: string): string => {
  return CSV_HEADER_MAP[header.toLowerCase()] || header;
};

export const downloadCSVTemplate = () => {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'template_ativos.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 