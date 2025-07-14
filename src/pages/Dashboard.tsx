import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, MapPin, Clock, TrendingUp, AlertTriangle, XCircle, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: planLimits } = usePlanLimits();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: assets } = await supabase
        .from('assets')
        .select('*');

      if (!assets) return null;

      const totalAssets = assets.length;
      const activeAssets = assets.filter(a => a.status === 'ativo').length;
      const maintenanceAssets = assets.filter(a => a.status === 'manutenção').length;
      const deactivatedAssets = assets.filter(a => a.status === 'baixado').length;

      const totalValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
      const activeValue = assets
        .filter(a => a.status === 'ativo')
        .reduce((sum, asset) => sum + (asset.value || 0), 0);

      return {
        totalAssets,
        activeAssets,
        maintenanceAssets,
        deactivatedAssets,
        totalValue,
        activeValue,
      };
    },
  });

  const { data: recentAssets } = useQuery({
    queryKey: ['recent-assets'],
    queryFn: async () => {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: 'bg-green-100 text-green-800',
      manutenção: 'bg-yellow-100 text-yellow-800',
      baixado: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'manutenção':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'baixado':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Visão geral dos seus ativos patrimoniais
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalAssets || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Todos os ativos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ativos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {stats?.activeAssets || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Em operação normal
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Manutenção
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {stats?.maintenanceAssets || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Em manutenção
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Baixados
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {stats?.deactivatedAssets || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Fora de operação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Total Value Card */}
      <div className="w-full">
        <Card className="border-0 shadow-md">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Valor Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700 break-words">
              {formatCurrency(stats?.totalValue || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assets */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Ativos Recentes
          </CardTitle>
          <CardDescription>
            Últimos ativos adicionados ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAssets && recentAssets.length > 0 ? (
            <div className="space-y-4">
              {recentAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex flex-col md:flex-row items-center md:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(asset.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{asset.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>#{asset.code}</span>
                        {asset.location && (
                          <>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{asset.location}</span>
                          </>
                        )}
                        {asset.unity && (
                          <>
                            <span>•</span>
                            <span className="text-blue-700 font-semibold">{asset.unity}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-center md:space-x-3 space-y-2 md:space-y-0 mt-2 md:mt-0">
                    {asset.value && (
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(asset.value)}
                      </span>
                    )}
                    {getStatusBadge(asset.status)}
                    <span className="text-xs text-gray-500">
                      {asset.acquisition_date
                        ? format(new Date(asset.acquisition_date), 'dd/MM/yyyy', { locale: ptBR })
                        : "-"
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum ativo cadastrado
              </h3>
              <p className="text-gray-600">
                Comece adicionando seus primeiros ativos ao sistema
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
