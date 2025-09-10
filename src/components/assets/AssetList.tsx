import { useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, Upload, MapPin, DollarSign, Building2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AssetCard } from './AssetCard';
import { AssetImport } from './AssetImport';
import { Database } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetListProps {
  assets: Asset[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  canEdit: boolean;
  isDesktop: boolean;
  viewMode: 'cards' | 'list';
  onLoadMore: () => void;
}

export function AssetList({
  assets,
  loading,
  loadingMore,
  hasMore,
  canEdit,
  isDesktop,
  viewMode,
  onLoadMore,
}: AssetListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (!hasMore || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        onLoadMore();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [hasMore, loadingMore, onLoadMore]);

  if (loading) {
    return (
      <div className="col-span-full flex justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="flex items-center space-x-2 text-gray-500">
            <Package className="h-5 w-5 animate-pulse" />
            <span className="text-base">Carregando patrimônios...</span>
          </div>
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="col-span-full">
        <Card className="border-0 shadow-md">
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum patrimônio encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece adicionando seus primeiros patrimônios ao sistema
            </p>
            {canEdit && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {isDesktop && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Importar CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Importar Patrimônios</DialogTitle>
                      </DialogHeader>
                      <AssetImport />
                    </DialogContent>
                  </Dialog>
                )}
                <Button asChild>
                  <Link to="/assets/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro patrimônio
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render list view
  if (viewMode === 'list') {
    return (
      <>
        <div className="col-span-full">
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-100">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patrimônio
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localização
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unidade
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assets.map((asset, index) => (
                      <tr 
                        key={asset.id}
                        ref={index === assets.length - 1 ? lastElementRef : undefined}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-2 py-4 whitespace-nowrap text-sm font-medium w-12">
                          <Button asChild variant="outline" size="sm" title="Ver Detalhes">
                            <Link to={`/assets/${asset.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                        <td className="px-2 py-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs">
                            <div className="truncate" title={asset.name}>
                              {asset.name}
                            </div>
                          </div>
                          <div className="pt-1 text-xs font-light text-gray-500">
                            <div >
                              {asset.acquisition_date ? "Adquirido em: " + formatDate(asset.acquisition_date) : "Adicionado em: " + formatDate(asset.created_at)}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <Badge 
                            className={
                              asset.status === 'ativo' ? 'bg-green-100 text-green-800' :
                              asset.status === 'manutenção' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {asset.status?.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{asset.code}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-start text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 max-w-xs">
                              <div className="break-words leading-tight">
                                {asset.location || '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-start text-sm text-gray-500">
                            <Building2 className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 max-w-xs">
                              <div className="break-words leading-tight">
                                {asset.unity || '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {asset.value ? formatCurrency(asset.value) : '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Loading indicator for infinite scroll */}
        {hasMore && loadingMore && (
          <div ref={loadingRef} className="col-span-full flex justify-center py-8">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="flex items-center space-x-2 text-gray-500">
                <Package className="h-4 w-4 animate-pulse" />
                <span className="text-sm">Carregando mais patrimônios...</span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Render cards view (default)
  return (
    <>
      {assets.map((asset, index) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isLast={index === assets.length - 1}
          onIntersect={lastElementRef}
        />
      ))}
      
      {/* Loading indicator for infinite scroll */}
      {hasMore && loadingMore && (
        <div ref={loadingRef} className="col-span-full flex justify-center py-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="flex items-center space-x-2 text-gray-500">
              <Package className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Carregando mais patrimônios...</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 