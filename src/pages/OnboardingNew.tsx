
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function OnboardingNew() {
  const [companyName, setCompanyName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'premium' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Se o usuário não estiver logado, redirecionar para login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Verificar se o usuário já tem uma empresa
    const checkExistingCompany = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (profile?.company_id) {
          // Usuário já tem empresa, redirecionar para dashboard
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Erro ao verificar empresa existente:', error);
      }
    };

    checkExistingCompany();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!companyName || !selectedPlan) {
        setError('Preencha todos os campos');
        return;
      }

      if (!user) {
        setError('Usuário não autenticado. Faça login novamente.');
        navigate('/login', { replace: true });
        return;
      }

      /* 1️⃣  Criar empresa — lendo apenas o id para evitar RLS no SELECT */
      const { data: insertedCompanies, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          plan: selectedPlan,   // hoje pode ser 'free'; depois, 'free' + checkout
        })
        .select('id');          // ✅ só o id é suficiente

      if (companyError) throw companyError;

      const companyId = insertedCompanies?.[0]?.id;
      if (!companyId) throw new Error('Erro ao criar empresa.');

      /* 2️⃣  Atualizar (ou criar) perfil do usuário como admin da empresa */
      const userName =
        user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Usuário';

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          company_id: companyId,
          name: userName,
          is_active: true,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      /* 3️⃣  Feedback + redirecionamento */
      toast({
        title: 'Cadastro completo!',
        description: 'Sua empresa foi criada com sucesso. Bem‑vindo ao Armazena!',
      });

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Erro no onboarding:', err);
      setError(err.message || 'Erro ao completar cadastro');
    } finally {
      setLoading(false);
    }
  };

  // Se não há usuário, não renderizar nada (o useEffect vai redirecionar)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="bg-blue-600 p-3 rounded-full">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Armazena App</h2>
          </div>
          <p className="text-lg text-gray-600">
            Bem-vindo, {user.user_metadata?.name || 'usuário'}!
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Completar Cadastro</CardTitle>
            <CardDescription className="text-center">
              Para começar a usar o sistema, informe os dados da sua empresa e escolha um plano.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa *</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Nome da sua empresa"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-4">
                <Label>Escolha um Plano *</Label>
                <div className="flex flex-col gap-3">
                  {/* Plano Free */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPlan === 'free'
                      ? 'border-green-600 ring-2 ring-green-200 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedPlan('free')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-green-700">Free</span>
                      <span className="text-green-700 font-semibold">R$ 0/mês</span>
                    </div>
                    <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                      <li>Até 50 ativos</li>
                      <li>Até 2 usuários</li>
                      <li>Suporte por e-mail (até 72h)</li>
                      <li>Relatórios básicos</li>
                    </ul>
                  </div>

                  {/* Plano Basic */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all relative ${selectedPlan === 'basic'
                      ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedPlan('basic')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-700">Basic</span>
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          Mais Popular
                          <Star className="w-3 h-3 text-yellow-300" fill="#fde047" />
                        </span>
                      </div>
                      <span className="text-blue-700 font-semibold">R$ 39,90/mês</span>
                    </div>
                    <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                      <li>Até 500 ativos</li>
                      <li>Até 3 usuários</li>
                      <li>Suporte por e-mail (até 48h)</li>
                      <li>Relatórios avançados</li>
                    </ul>
                  </div>

                  {/* Plano Premium */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPlan === 'premium'
                      ? 'border-purple-600 ring-2 ring-purple-200 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedPlan('premium')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-purple-700">Premium</span>
                      <span className="text-purple-700 font-semibold">R$ 79,90/mês</span>
                    </div>
                    <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                      <li>Até 1000 ativos</li>
                      <li>Até 10 usuários</li>
                      <li>Suporte por WhatsApp (até 24h)</li>
                      <li>Relatórios avançados</li>
                      <li>Integração com APIs</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <div className="inline-block bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
                    <span className="block text-sm text-gray-700 mb-1">
                      Precisa de um plano maior ou personalizado?
                    </span>
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
                disabled={loading || !companyName || !selectedPlan}
              >
                {loading ? 'Finalizando cadastro...' : 'Finalizar Cadastro'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
