
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CSVRow {
  nome: string;
  codigo: string;
  localizacao?: string;
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

interface ImportResult {
  success: number;
  errors: Array<{ row: number; error: string; data: CSVRow }>;
}

export function AssetImport() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const importMutation = useMutation({
    mutationFn: async (csvData: CSVRow[]) => {
      if (!profile?.company_id) {
        throw new Error('Company ID not found');
      }

      const result: ImportResult = { success: 0, errors: [] };
      
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        setProgress(((i + 1) / csvData.length) * 100);

        try {
          // Validar campos obrigatórios
          if (!row.nome || !row.codigo) {
            result.errors.push({
              row: i + 2, // +2 porque CSV tem header e é 1-indexed
              error: 'Nome e código são obrigatórios',
              data: row
            });
            continue;
          }

          // Preparar dados para inserção
          const assetData = {
            name: row.nome,
            code: row.codigo,
            location: row.localizacao || null,
            status: (row.status?.toLowerCase() === 'manutenção' ? 'manutenção' : 
                     row.status?.toLowerCase() === 'baixado' ? 'baixado' : 'ativo') as 'ativo' | 'manutenção' | 'baixado',
            acquisition_date: row.data_aquisicao || null,
            value: row.valor ? parseFloat(row.valor.replace(',', '.')) : null,
            serial_number: row.numero_serie || null,
            color: row.cor || null,
            manufacturer: row.fabricante || null,
            model: row.modelo || null,
            capacity: row.capacidade || null,
            voltage: row.voltagem || null,
            origin: row.origem === 'doação' || row.origem === 'compra' ? row.origem : null,
            condition: row.condicoes || null,
            inalienable: row.inalienavel?.toLowerCase() === 'sim' || row.inalienavel?.toLowerCase() ===  'true',
            holder: row.detentor || null,
            notes: row.observacoes || null,
            company_id: profile.company_id,
          };

          const { error } = await supabase.from('assets').insert(assetData);

          if (error) {
            result.errors.push({
              row: i + 2,
              error: error.message,
              data: row
            });
          } else {
            result.success++;
          }
        } catch (error) {
          result.errors.push({
            row: i + 2,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            data: row
          });
        }
      }

      return result;
    },
    onSuccess: (result) => {
      setResult(result);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo CSV",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Mapear headers em português para os campos esperados
        const headerMap: Record<string, string> = {
          'nome': 'nome',
          'código': 'codigo',
          'codigo': 'codigo',
          'localização': 'localizacao',
          'localizacao': 'localizacao',
          'local': 'localizacao',
          'status': 'status',
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

        return headerMap[header.toLowerCase()] || header;
      },
      complete: (results) => {
        setImporting(false);
        if (results.errors.length > 0) {
          toast({
            title: "Erro ao processar CSV",
            description: "Verifique o formato do arquivo",
            variant: "destructive",
          });
          return;
        }

        importMutation.mutate(results.data as CSVRow[]);
      },
      error: (error) => {
        setImporting(false);
        toast({
          title: "Erro ao ler arquivo",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const downloadTemplate = () => {
    const template = `nome,codigo,localizacao,status,data_aquisicao,valor,numero_serie,cor,fabricante,modelo,capacidade,voltagem,origem,condicoes,inalienavel,detentor,observacoes
Notebook Dell,NB001,Sala 101,ativo,2023-01-15,2500.00,SN123456,Preto,Dell,Inspiron 15,8GB RAM,Bivolt,compra,Novo,não,João Silva,Notebook para desenvolvimento
Monitor Samsung,MON001,Sala 102,ativo,2023-02-10,800.00,MON789,Branco,Samsung,24 polegadas,1920x1080,110V,compra,Usado,não,Maria Santos,Monitor secundário`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_ativos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Importar Ativos por CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="mb-4"
            >
              <FileText className="h-4 w-4 mr-2" />
              Baixar Template CSV
            </Button>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Baixe o template CSV acima para ver o formato correto dos dados. 
                Os campos <strong>nome</strong> e <strong>codigo</strong> são obrigatórios.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csvFile">Arquivo CSV</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={importing}
            />
          </div>

          {file && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Arquivo selecionado:</strong> {file.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Tamanho:</strong> {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importando ativos...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!file || importing || importMutation.isPending}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing || importMutation.isPending ? 'Importando...' : 'Importar Ativos'}
          </Button>

          {result && (
            <div className="space-y-4">
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {result.success} ativos importados com sucesso
                </span>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2">
                    {result.errors.length} erros encontrados:
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {result.errors.map((error, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertDescription>
                          <strong>Linha {error.row}:</strong> {error.error}
                          <br />
                          <small>Dados: {JSON.stringify(error.data)}</small>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
