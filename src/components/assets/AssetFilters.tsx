import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface AssetFiltersProps {
  search: string;
  statusFilter: string;
  locationFilter: string;
  locations?: string[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onLocationFilterChange: (value: string) => void;
}

export function AssetFilters({
  search,
  statusFilter,
  locationFilter,
  locations,
  onSearchChange,
  onStatusFilterChange,
  onLocationFilterChange,
}: AssetFiltersProps) {
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-8"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Limpar busca"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="ativo">
                <Badge className='bg-green-100 text-green-800'>ATIVO</Badge>
              </SelectItem>
              <SelectItem value="manutenção">
                <Badge className='bg-yellow-100 text-yellow-800'>MANUTENÇÃO</Badge>
              </SelectItem>
              <SelectItem value="baixado">
                <Badge className='bg-red-100 text-red-800'>BAIXADO</Badge>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={onLocationFilterChange}>
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
  );
} 