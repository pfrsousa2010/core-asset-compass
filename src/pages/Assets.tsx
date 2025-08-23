import { useState, useContext, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDevice } from '@/hooks/useDevice';
import { useAssets } from '@/hooks/useAssets';
import { useAssetExport } from '@/hooks/useAssetExport';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { AssetHeader } from '@/components/assets/AssetHeader';
import { AssetFilters } from '@/components/assets/AssetFilters';
import { AssetList } from '@/components/assets/AssetList';
import { ExportFormatModal } from '@/components/assets/ExportFormatModal';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { ScrollContext } from "@/components/layout/Layout";
import { ExportFormat } from '@/hooks/useAssetExport';

export default function Assets() {
  const { profile, company } = useAuth();
  const { isMobileOrTablet, isDesktop } = useDevice();
  const scrollRef = useContext(ScrollContext);
  
  // State
  const [search, setSearch] = useState(() => {
    // Recupera a busca salva do localStorage ou usa string vazia como padrão
    return localStorage.getItem('asset-search') || '';
  });
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    // Recupera o filtro de status salvo do localStorage ou usa 'all' como padrão
    return localStorage.getItem('asset-status-filter') || 'all';
  });
  const [locationFilter, setLocationFilter] = useState<string>(() => {
    // Recupera o filtro de localização salvo do localStorage ou usa 'all' como padrão
    return localStorage.getItem('asset-location-filter') || 'all';
  });
  const [unityFilter, setUnityFilter] = useState<string>(() => {
    // Recupera o filtro de unidade salvo do localStorage ou usa 'all' como padrão
    return localStorage.getItem('asset-unity-filter') || 'all';
  });
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(() => {
    // Recupera a opção salva do localStorage ou usa 'cards' como padrão
    const savedViewMode = localStorage.getItem('asset-view-mode');
    return (savedViewMode === 'list' || savedViewMode === 'cards') ? savedViewMode : 'cards';
  });
  const [showScanner, setShowScanner] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Custom hooks
  const {
    assets,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    locations,
    unities,
  } = useAssets({ search, statusFilter, locationFilter, unityFilter });

  const { exportLoading, exportToFormat } = useAssetExport();
  
  const { showScrollToTop, scrollToTop } = useScrollToTop(scrollRef?.current);

  // Computed values
  const canEdit = profile?.role === 'admin' || profile?.role === 'editor';

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('asset-view-mode', viewMode);
  }, [viewMode]);

  // Save search to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('asset-search', search);
  }, [search]);

  // Save status filter to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('asset-status-filter', statusFilter);
  }, [statusFilter]);

  // Save location filter to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('asset-location-filter', locationFilter);
  }, [locationFilter]);

  // Save unity filter to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('asset-unity-filter', unityFilter);
  }, [unityFilter]);

  // Event handlers
  const handleScanResult = (code: string) => {
    setSearch(code);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setLocationFilter('all');
    setUnityFilter('all');
  };

  const handleExport = (format: ExportFormat) => {
    exportToFormat(format, {
      search,
      statusFilter,
      locationFilter,
      unityFilter,
      companyName: company.name,
    });
  };

  const handleExportButtonClick = () => {
    if (isDesktop) {
      setShowExportModal(true);
    } else {
      // Em mobile, exporta diretamente em CSV
      handleExport('csv');
    }
  };

  return (
    <div
      id="assets-scroll-container"
      className="space-y-6 pb-10 overflow-y-auto"
    >
      {/* Export loading overlay */}
      {exportLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
      )}

      {/* Header */}
      <AssetHeader
        canEdit={canEdit}
        isMobileOrTablet={isMobileOrTablet}
        isDesktop={isDesktop}
        loading={loading}
        exportLoading={exportLoading}
        onScannerOpen={() => setShowScanner(true)}
        onExport={handleExportButtonClick}
      />

      {/* Filters */}
      <AssetFilters
        search={search}
        statusFilter={statusFilter}
        locationFilter={locationFilter}
        unityFilter={unityFilter}
        locations={locations}
        unities={unities}
        viewMode={viewMode} // <--- Adicionado
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onLocationFilterChange={setLocationFilter}
        onUnityFilterChange={setUnityFilter}
        onViewModeChange={setViewMode} // <--- Adicionado
        onClearFilters={handleClearFilters} // <--- Adicionado
      />

      {/* Assets List */}
      <div className={viewMode === 'list' ? 'grid grid-cols-1' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6'}>
        <AssetList
          assets={assets}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          canEdit={canEdit}
          isDesktop={isDesktop}
          viewMode={viewMode}
          onLoadMore={loadMore}
        />
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-200"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Scanner Modal */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanResult}
      />

      {/* Export Format Modal */}
      <ExportFormatModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        loading={exportLoading}
        plan={company?.plan || 'free'}
      />
    </div>
  );
}
