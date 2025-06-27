import { useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AssetCard } from './AssetCard';
import { AssetImport } from './AssetImport';
import { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetListProps {
  assets: Asset[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  canEdit: boolean;
  isDesktop: boolean;
  onLoadMore: () => void;
}

export function AssetList({
  assets,
  loading,
  loadingMore,
  hasMore,
  canEdit,
  isDesktop,
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
            <span className="text-base">Carregando ativos...</span>
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
              Nenhum ativo encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece adicionando seus primeiros ativos ao sistema
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
                        <DialogTitle>Importar Ativos</DialogTitle>
                      </DialogHeader>
                      <AssetImport />
                    </DialogContent>
                  </Dialog>
                )}
                <Button asChild>
                  <Link to="/assets/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Ativo
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <span className="text-sm">Carregando mais ativos...</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 