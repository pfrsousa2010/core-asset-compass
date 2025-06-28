import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type AssetStatus = Database['public']['Enums']['asset_status'];
type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetCardProps {
  asset: Asset;
  isLast?: boolean;
  onIntersect?: (node: HTMLDivElement) => void;
}

const STATUS_BADGE_VARIANTS = {
  ativo: 'bg-green-100 text-green-800',
  manutenção: 'bg-yellow-100 text-yellow-800',
  baixado: 'bg-red-100 text-red-800',
} as const;

export function AssetCard({ asset, isLast = false, onIntersect }: AssetCardProps) {
  const getStatusBadge = (status: AssetStatus) => (
    <Badge className={STATUS_BADGE_VARIANTS[status]}>
      {status.toUpperCase()}
    </Badge>
  );

  const ref = isLast ? onIntersect : undefined;

  return (
    <Card
      className="border-0 shadow-md hover:shadow-lg transition-shadow group"
      ref={ref}
    >
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
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {asset.location
                ? asset.location
                : "-"
              }</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {asset.value
                ? formatCurrency(asset.value)
                : "-"
              }
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {asset.acquisition_date
                ? "Adiquirido em: " + formatDate(asset.acquisition_date + 'T00:00:00')
                : "Adicionado em: " + formatDate(asset.created_at)
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
  );
} 