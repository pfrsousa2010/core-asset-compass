import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet, FileType } from 'lucide-react';
import { ExportFormat } from '@/hooks/useAssetExport';

interface ExportFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
  loading: boolean;
}

export function ExportFormatModal({
  isOpen,
  onClose,
  onExport,
  loading
}: ExportFormatModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);

  const formats = [
    {
      id: 'csv' as ExportFormat,
      name: 'CSV',
      description: 'Arquivo de texto separado por vírgulas',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'excel' as ExportFormat,
      name: 'Excel',
      description: 'Arquivo do Microsoft Excel (.xlsx)',
      icon: FileSpreadsheet,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'pdf' as ExportFormat,
      name: 'PDF',
      description: 'Documento em formato PDF',
      icon: FileType,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  const handleFormatSelect = (format: ExportFormat) => {
    setSelectedFormat(format);
  };

  const handleExport = () => {
    if (selectedFormat) {
      onExport(selectedFormat);
      setSelectedFormat(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedFormat(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Escolha o formato de exportação
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600 text-center">
            Selecione o formato desejado para exportar os ativos
          </p>
          
          <div className="grid gap-3">
            {formats.map((format) => {
              const Icon = format.icon;
              const isSelected = selectedFormat === format.id;
              
              return (
                <button
                  key={format.id}
                  onClick={() => handleFormatSelect(format.id)}
                  disabled={loading}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all duration-200
                    ${isSelected 
                      ? `${format.borderColor} ${format.bgColor} ring-2 ring-offset-2 ring-blue-500` 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${format.bgColor}`}>
                      <Icon className={`h-6 w-6 ${format.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900">{format.name}</h3>
                      <p className="text-sm text-gray-500">{format.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={!selectedFormat || loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exportando...</span>
              </div>
            ) : (
              'Exportar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 