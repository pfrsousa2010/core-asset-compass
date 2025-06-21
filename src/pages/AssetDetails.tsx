
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
  User
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

  // Buscar dados do usuário que fez a última atualização separadamente
  const { data: updatedByUser } = useQuery({
    queryKey: ['user-profile', asset?.updated_by_user_id],
    queryFn: async () => {
      if (!asset?.updated_by_user_id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', asset.updated_by_user_id)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!asset?.updated_by_user_id,
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
        return <Package className="h-5 w-5 text-yellow-600" />;
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
        <div className="animate-pulse">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/assets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
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

      {/* Asset Details */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              {getStatusIcon(asset.status)}
              <span className="ml-3">{asset.name}</span>
            </CardTitle>
            {getStatusBadge(asset.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Hash className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Código</p>
                  <p className="text-lg text-gray-900">{asset.code}</p>
                </div>
              </div>

              {asset.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Localização</p>
                    <p className="text-lg text-gray-900">{asset.location}</p>
                  </div>
                </div>
              )}

              {asset.value && (
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valor</p>
                    <p className="text-lg font-semibold text-green-700">
                      {formatCurrency(asset.value)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {asset.acquisition_date && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Aquisição</p>
                    <p className="text-lg text-gray-900">
                      {format(new Date(asset.acquisition_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Criado em</p>
                  <p className="text-lg text-gray-900">
                    {format(new Date(asset.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Atualizado em</p>
                  <p className="text-lg text-gray-900">
                    {format(new Date(asset.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>

              {updatedByUser && (
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Atualizado por</p>
                    <p className="text-lg text-gray-900">{updatedByUser.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Status Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Ativo</h3>
            <div className="flex items-center space-x-4">
              {getStatusIcon(asset.status)}
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Status atual: {getStatusBadge(asset.status)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {asset.status === 'ativo' && 'Este ativo está em operação normal'}
                  {asset.status === 'manutenção' && 'Este ativo está em manutenção'}
                  {asset.status === 'baixado' && 'Este ativo foi baixado do patrimônio'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
