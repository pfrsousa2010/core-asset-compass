import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tables } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';

type Asset = Tables<'assets'>;
type AssetStatus = Asset['status'];

interface AssetFormProps {
  asset?: Partial<Asset>;
  onSubmit: (data: AssetFormData) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export interface AssetFormData {
  name: string;
  code: string;
  location: string;
  status: AssetStatus;
  acquisition_date: string;
  value: string;
  serial_number: string;
  color: string;
  manufacturer: string;
  model: string;
  capacity: string;
  voltage: string;
  origin: string;
  condition: string;
  inalienable: boolean;
  holder: string;
  notes: string;
}

export function AssetForm({ asset, onSubmit, isSubmitting, submitLabel }: AssetFormProps) {
  const [formData, setFormData] = useState<AssetFormData>({
    name: asset?.name || '',
    code: asset?.code || '',
    location: asset?.location || '',
    status: asset?.status || 'ativo',
    acquisition_date: asset?.acquisition_date || '',
    value: asset?.value?.toString() || '',
    serial_number: asset?.serial_number || '',
    color: asset?.color || '',
    manufacturer: asset?.manufacturer || '',
    model: asset?.model || '',
    capacity: asset?.capacity || '',
    voltage: asset?.voltage || '',
    origin: asset?.origin || '',
    condition: asset?.condition || '',
    inalienable: asset?.inalienable || false,
    holder: asset?.holder || '',
    notes: asset?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof AssetFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Ativo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Notebook Dell"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Código do Ativo *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              placeholder="Ex: NB001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serial_number">Número de Série</Label>
            <Input
              id="serial_number"
              value={formData.serial_number}
              onChange={(e) => handleInputChange('serial_number', e.target.value)}
              placeholder="Ex: SN123456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: AssetStatus) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo"><Badge className='bg-green-100 text-green-800'>ATIVO</Badge></SelectItem>
                <SelectItem value="manutenção"><Badge className='bg-yellow-100 text-yellow-800'>MANUTENÇÃO</Badge></SelectItem>
                <SelectItem value="baixado"><Badge className='bg-red-100 text-red-800'>BAIXADO</Badge></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Especificações Técnicas */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Especificações Técnicas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="manufacturer">Fabricante</Label>
            <Input
              id="manufacturer"
              value={formData.manufacturer}
              onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              placeholder="Ex: Dell, HP, Samsung"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder="Ex: Inspiron 15 3000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              placeholder="Ex: Preto, Branco, Prata"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacidade</Label>
            <Input
              id="capacity"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              placeholder="Ex: 500GB, 8GB RAM"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voltage">Voltagem</Label>
            <Input
              id="voltage"
              value={formData.voltage}
              onChange={(e) => handleInputChange('voltage', e.target.value)}
              placeholder="Ex: 110V, 220V, Bivolt"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condições</Label>
            <Input
              id="condition"
              value={formData.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              placeholder="Ex: Novo, Usado, Bom estado"
            />
          </div>
        </div>
      </div>

      {/* Localização e Patrimônio */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Localização e Patrimônio</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Ex: Sala 201, Almoxarifado"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="holder">Detentor</Label>
            <Input
              id="holder"
              value={formData.holder}
              onChange={(e) => handleInputChange('holder', e.target.value)}
              placeholder="Ex: João Silva, Setor TI"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="origin">Origem</Label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(e) => handleInputChange('origin', e.target.value)}
              placeholder="Ex: Compra, Doação, Transferência"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="acquisition_date">Data de Aquisição</Label>
            <Input
              id="acquisition_date"
              type="date"
              value={formData.acquisition_date}
              onChange={(e) => handleInputChange('acquisition_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor (R$)</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => handleInputChange('value', e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="inalienable"
              checked={formData.inalienable}
              onCheckedChange={(checked) => handleInputChange('inalienable', checked as boolean)}
            />
            <Label htmlFor="inalienable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Inalienável
            </Label>
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>

        <div className="space-y-2">
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Observações adicionais sobre o ativo..."
            rows={4}
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
