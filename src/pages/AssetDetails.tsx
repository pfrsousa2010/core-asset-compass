
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Hash,
  Clock,
  User,
  Cpu,
  Palette,
  Zap,
  FileText,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AssetDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      if (!id) throw new Error('Asset ID is required');

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: 'bg-green-100 text-green-800',
      manutenção: 'bg-yellow-100 text-yellow-800',
      baixado: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Package className="h-5 w-5 text-green-600" />;
      case 'manutenção':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'baixado':
        return <Package className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const canEdit = profile?.role === 'admin' || profile?.role === 'editor';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/assets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="animate-pulse max-w-4xl">
          <Card className="border-0 shadow-md">
            <CardContent className="p-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/assets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ativo não encontrado
            </h3>
            <p className="text-gray-600">
              O ativo solicitado não existe ou foi removido
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/assets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{asset.name}</h1>
            <p className="mt-2 text-gray-600">Detalhes do ativo</p>
          </div>
        </div>
        
        {canEdit && (
          <Button asChild>
            <Link to={`/assets/${asset.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(asset.status)}
                  <span className="ml-3">Informações Básicas</span>
                </div>
                {getStatusBadge(asset.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Hash className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Código</p>
                  <p className="text-lg text-gray-900">{asset.code}</p>
                </div>
              </div>

              {asset.serial_number && (
                <div className="flex items-center space-x-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Número de Série</p>
                    <p className="text-lg text-gray-900">{asset.serial_number}</p>
                  </div>
                </div>
              )}

              {asset.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Localização</p>
                    <p className="text-lg text-gray-900">{asset.location}</p>
                  </div>
                </div>
              )}

              {asset.holder && (
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Detentor</p>
                    <p className="text-lg text-gray-900">{asset.holder}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Especificações Técnicas */}
          {(asset.manufacturer || asset.model || asset.color || asset.capacity || asset.voltage || asset.condition) && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="h-5 w-5 mr-3 text-blue-600" />
                  Especificações Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {asset.manufacturer && (
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fabricante</p>
                      <p className="text-lg text-gray-900">{asset.manufacturer}</p>
                    </div>
                  </div>
                )}

                {asset.model && (
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Modelo</p>
                      <p className="text-lg text-gray-900">{asset.model}</p>
                    </div>
                  </div>
                )}

                {asset.color && (
                  <div className="flex items-center space-x-3">
                    <Palette className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cor</p>
                      <p className="text-lg text-gray-900">{asset.color}</p>
                    </div>
                  </div>
                )}

                {asset.capacity && (
                  <div className="flex items-center space-x-3">
                    <Cpu className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Capacidade</p>
                      <p className="text-lg text-gray-900">{asset.capacity}</p>
                    </div>
                  </div>
                )}

                {asset.voltage && (
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Voltagem</p>
                      <p className="text-lg text-gray-900">{asset.voltage}</p>
                    </div>
                  </div>
                )}

                {asset.condition && (
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Condições</p>
                      <p className="text-lg text-gray-900">{asset.condition}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {asset.notes && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-3 text-blue-600" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 whitespace-pre-wrap">{asset.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar com informações financeiras e datas */}
        <div className="space-y-6">
          {/* Informações Financeiras */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-3 text-green-600" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {asset.value && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Valor</p>
                  <p className="text-2xl font-semibold text-green-700">
                    {formatCurrency(asset.value)}
                  </p>
                </div>
              )}

              {asset.origin && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Origem</p>
                  <p className="text-lg text-gray-900 capitalize">{asset.origin}</p>
                </div>
              )}

              {asset.inalienable && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">Inalienável</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datas */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                Datas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {asset.acquisition_date && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Aquisição</p>
                  <p className="text-lg text-gray-900">
                    {format(new Date(asset.acquisition_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500">Criado em</p>
                <p className="text-lg text-gray-900">
                  {format(new Date(asset.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Última atualização</p>
                <p className="text-lg text-gray-900">
                  {format(new Date(asset.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>

              {asset.updated_by_user_name && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Modificado por</p>
                  <p className="text-sm text-gray-900">{asset.updated_by_user_name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
