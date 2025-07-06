import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Camera, FileText, Upload } from 'lucide-react';
import { AssetImport } from '@/components/assets/AssetImport';

interface AssetHeaderProps {
  canEdit: boolean;
  isMobileOrTablet: boolean;
  isDesktop: boolean;
  loading: boolean;
  exportLoading: boolean;
  onScannerOpen: () => void;
  onExport: () => void;
}

export function AssetHeader({
  canEdit,
  isMobileOrTablet,
  isDesktop,
  loading,
  exportLoading,
  onScannerOpen,
  onExport,
}: AssetHeaderProps) {
  if (!canEdit) {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Ativos</h1>
          <p className="mt-2 text-gray-600">
            Gerencie todos os ativos patrimoniais da empresa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Ativos</h1>
        <p className="mt-2 text-gray-600">
          Gerencie todos os ativos patrimoniais da empresa
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        {/* Scanner button - apenas em mobile/tablet */}
        {isMobileOrTablet && (
          <Button
            variant="outline"
            onClick={onScannerOpen}
            className="w-full sm:w-auto"
          >
            <Camera className="h-4 w-4 mr-2" />
            Buscar por Código
          </Button>
        )}

        {/* Export and Import buttons - apenas em desktop */}
        {isDesktop && (
          <>
            <Button
              variant="outline"
              onClick={onExport}
              className="w-full sm:w-auto"
              disabled={loading || exportLoading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Exportar
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <AssetImport />
              </DialogContent>
            </Dialog>
          </>
        )}

        <Button asChild className="w-full sm:w-auto">
          <Link to="/assets/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Ativo
          </Link>
        </Button>
      </div>
    </div>
  );
} 