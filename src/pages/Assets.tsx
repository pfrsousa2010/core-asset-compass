
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDevice } from '@/hooks/useDevice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Package, MapPin, Calendar, DollarSign, Eye, Upload, Camera, FileExport } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';
import { AssetImport } from '@/components/assets/AssetImport';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';

type AssetStatus = Database['public']['Enums']['asset_status'];

export default function Assets() {
  const { profile } = useAuth();
  const { isMobileOrTablet, isDesktop } = useDevice();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showScanner, setShowScanner] = useState(false);

  const { data: assets, isLoading, refetch } = useQuery({
    queryKey: ['assets', search, statusFilter, locationFilter],
    queryFn: async () => {
      let query = supabase.from('assets').select('*').order('created_at', { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as AssetStatus);
      }

      if (locationFilter !== 'all') {
        query = query.eq('location', locationFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: locations } = useQuery({
    queryKey: ['asset-locations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('assets')
        .select('location')
        .not('location', 'is', null);

      const uniqueLocations = [...new Set(data?.map(item => item.location).filter(Boolean))];
      return uniqueLocations;
    },
  });

  const getStatusBadge = (status: AssetStatus) => {
    const variants = {
      ativo: 'bg-green-100 text-green-800',
      manutenção: 'bg-yellow-100 text-yellow-800',
      baixado: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const handleScanResult = (code: string) => {
    setSearch(code);
    refetch();
  };

  const handleExportCSV = () => {
    if (!assets || assets.length === 0) return;

    // Definir cabeçalhos das colunas
    const headers = [
      'Nome',
      'Código',
      'Status',
      'Localização',
      'Valor',
      'Data de Aquisição',
      'Fabricante',
      'Modelo',
      'Cor',
      'Número de Série',
      'Capacidade',
      'Voltagem',
      'Condições',
      'Detentor',
      'Origem',
      'Inalienável',
      'Observações'
    ];

    // Mapear dados dos ativos
    const csvData = assets.map(asset => [
      asset.name,
      asset.code,
      asset.status,
      asset.location || '',
      asset.value || '',
      asset.acquisition_date || '',
      asset.manufacturer || '',
      asset.model || '',
      asset.color || '',
      asset.serial_number || '',
      asset.capacity || '',
      asset.voltage || '',
      asset.condition || '',
      asset.holder || '',
      asset.origin || '',
      asset.inalienable ? 'Sim' : 'Não',
      asset.notes || ''
    ]);

    // Criar conteúdo CSV
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        row.map(field => 
          typeof field === 'string' && field.includes(',') 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(',')
      )
    ].join('\n');

    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ativos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canEdit = profile?.role === 'admin' || profile?.role === 'editor';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Ativos</h1>
          <p className="mt-2 text-gray-600">
            Gerencie todos os ativos patrimoniais da empresa
          </p>
        </div>
        {canEdit && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Scanner button - apenas em mobile/tablet */}
            {isMobileOrTablet && (
              <Button 
                variant="outline" 
                onClick={() => setShowScanner(true)}
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
                  onClick={handleExportCSV}
                  className="w-full sm:w-auto"
                  disabled={!assets || assets.length === 0}
                >
                  <FileExport className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
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
              </>
            )}
            
            <Button asChild className="w-full sm:w-auto">
              <Link to="/assets/new">
                <Plus className="h-4 w-4 mr-2" />
                Novo Ativo
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-8"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Limpar busca"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="ativo"><Badge className='bg-green-100 text-green-800'>ATIVO</Badge></SelectItem>
                <SelectItem value="manutenção"><Badge className='bg-yellow-100 text-yellow-800'>MANUTENÇÃO</Badge></SelectItem>
                <SelectItem value="baixado"><Badge className='bg-red-100 text-red-800'>BAIXADO</Badge></SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Localização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as localizações</SelectItem>
                {locations?.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))
        ) : assets && assets.length > 0 ? (
          assets.map((asset) => (
            <Card key={asset.id} className="border-0 shadow-md hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {asset.name}
                    </h3>
                    <p className="text-sm text-gray-500">#{asset.code}</p>
                  </div>
                  {getStatusBadge(asset.status)}
                </div>

                <div className="space-y-2 mb-4">
                  {asset.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{asset.location}</span>
                    </div>
                  )}
                  
                  {asset.value && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{formatCurrency(asset.value)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      {asset.acquisition_date 
                        ? formatDate(asset.acquisition_date)
                        : formatDate(asset.created_at)
                      }
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/assets/${asset.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="border-0 shadow-md">
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum ativo encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  {search || statusFilter !== 'all' || locationFilter !== 'all'
                    ? 'Tente ajustar os filtros para encontrar ativos'
                    : 'Comece adicionando seus primeiros ativos ao sistema'}
                </p>
                {canEdit && (
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    {/* Import CSV apenas em desktop */}
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
        )}
      </div>

      {/* Scanner Modal */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanResult}
      />
    </div>
  );
}
