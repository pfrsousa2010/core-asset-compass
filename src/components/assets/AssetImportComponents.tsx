import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { downloadCSVTemplate } from '@/lib/csv-utils';
import { ImportResult } from '@/types/asset-import';

export const TemplateDownload = () => {
  return (
    <div>
      <Button
        variant="outline"
        onClick={downloadCSVTemplate}
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
  );
};

interface FileUploadSectionProps {
  file: File | null;
  inputKey: number;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: () => void;
  importing: boolean;
}

export const FileUploadSection = ({ 
  file, 
  inputKey, 
  handleFileChange, 
  removeFile, 
  importing 
}: FileUploadSectionProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="csvFile">Arquivo CSV</Label>
      <Input
        id="csvFile"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={importing}
        className="cursor-pointer"
        key={inputKey}
      />
    </div>

    {file && (
      <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            <strong>Arquivo selecionado:</strong> {file.name}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Tamanho:</strong> {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={removeFile}
              className="ml-4 text-gray-400 hover:text-red-600 text-lg font-bold focus:outline-none"
              aria-label="Remover arquivo"
            >
              ×
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" align="center">
            Remover arquivo selecionado
          </TooltipContent>
        </Tooltip>
      </div>
    )}
  </div>
);

interface ImportProgressProps {
  progress: number;
}

export const ImportProgress = ({ progress }: ImportProgressProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span>Importando patrimônios...</span>
      <span>{Math.round(progress)}%</span>
    </div>
    <Progress value={progress} />
  </div>
);

interface ImportResultsProps {
  result: ImportResult | null;
}

export const ImportResults = ({ result }: ImportResultsProps) => {
  if (!result) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center text-green-600">
        <CheckCircle className="h-5 w-5 mr-2" />
        <span className="font-medium">
          {result.success} patrimônios importados com sucesso
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
  );
}; 