import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Onboarding() {
  const [companyName, setCompanyName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'premium' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!companyName || !selectedPlan) {
        setError('Preencha todos os campos');
        setLoading(false);
        return;
      }
      if (!user) {
        setError('Usuário não autenticado. Faça login novamente.');
        setLoading(false);
        return;
      }
      // 1. Cria empresa
      const { data: companyData, error: companyError } = await supabase.from('companies').insert({
        name: companyName,
        plan: selectedPlan,
      }).select().single();
      if (companyError) throw companyError;
      const companyId = companyData?.id;
      if (!companyId) throw new Error('Erro ao criar empresa.');
      // 2. Atualiza perfil do usuário para admin e vincula à empresa
      const { error: profileError } = await supabase.from('profiles').update({
        role: 'admin',
        company_id: companyId,
      }).eq('id', user.id);
      if (profileError) throw profileError;
      toast({
        title: 'Cadastro completo!',
        description: 'Sua empresa foi criada e você é o administrador.',
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao completar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 overflow-auto">
      <div className="max-w-md w-full space-y-8 mx-auto py-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Completar Cadastro</CardTitle>
            <CardDescription className="text-center">
              Informe o nome da empresa e escolha o plano para começar a usar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Nome da empresa"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  {/* Plano Free */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPlan === 'free' ? 'border-green-600 ring-2 ring-green-200 bg-green-50' : 'border-gray-200 bg-white'} hover:shadow-md`}
                    onClick={() => setSelectedPlan('free')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-700">Free</span>
                      <span className="text-green-700 font-semibold">R$ 0/mês</span>
                    </div>
                    <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                      <li>Até 50 ativos</li>
                      <li>Até 2 usuários</li>
                      <li>Suporte: E-mail (até 72h)</li>
                    </ul>
                  </div>
                  {/* Plano Basic */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all relative ${selectedPlan === 'basic' ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 bg-white'} hover:shadow-md`}
                    onClick={() => setSelectedPlan('basic')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-700">Basic</span>
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          O mais popular
                          <Star className="w-3.5 h-3.5 text-yellow-300 ml-1" fill="#fde047" />
                        </span>
                      </div>
                      <span className="text-blue-700 font-semibold">R$ 39,90/mês</span>
                    </div>
                    <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                      <li>Até 500 ativos</li>
                      <li>Até 3 usuários</li>
                      <li>Suporte: E-mail (até 48h)</li>
                    </ul>
                  </div>
                  {/* Plano Premium */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPlan === 'premium' ? 'border-purple-600 ring-2 ring-purple-200 bg-purple-50' : 'border-gray-200 bg-white'} hover:shadow-md`}
                    onClick={() => setSelectedPlan('premium')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-700">Premium</span>
                      <span className="text-purple-700 font-semibold">R$ 79,90/mês</span>
                    </div>
                    <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                      <li>Até 1000 ativos</li>
                      <li>Até 10 usuários</li>
                      <li>Suporte: WhatsApp (até 24h)</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="inline-block bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
                    <span className="block text-sm text-gray-700 mb-1">Precisa de um plano maior ou personalizado?</span>
                    <a
                      href="mailto:microfocuspro@gmail.com"
                      className="text-blue-700 font-semibold underline hover:text-blue-900"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Fale conosco: microfocuspro@gmail.com
                    </a>
                  </div>
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Finalizar Cadastro'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 