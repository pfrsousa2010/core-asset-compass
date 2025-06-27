import { useState } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAssetImport } from '@/hooks/useAssetImport';
import { useFileUpload } from '@/hooks/useFileUpload';
import { normalizeHeader } from '@/lib/csv-utils';
import { CSVRow, ImportResult } from '@/types/asset-import';
import {
  TemplateDownload,
  FileUploadSection,
  ImportProgress,
  ImportResults
} from './AssetImportComponents';

export function AssetImport() {
  const { toast } = useToast();
  const importMutation = useAssetImport();
  const { file, inputKey, handleFileChange, removeFile } = useFileUpload();

  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleImport = () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
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

        importMutation.mutate(results.data as CSVRow[], {
          onSuccess: (result) => {
            setResult(result);
          }
        });
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

  const handleRemoveFile = () => {
    removeFile();
    setResult(null);
  };

  return (
    <TooltipProvider delayDuration={500}>
      <div className="space-y-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Importar Ativos por CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <TemplateDownload />

            <FileUploadSection
              file={file}
              inputKey={inputKey}
              handleFileChange={handleFileChange}
              removeFile={handleRemoveFile}
              importing={importing}
            />

            {importing && <ImportProgress progress={progress} />}

            <Button
              onClick={handleImport}
              disabled={!file || importing || importMutation.isPending}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing || importMutation.isPending ? 'Importando...' : 'Importar Ativos'}
            </Button>

            <ImportResults result={result} />
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
