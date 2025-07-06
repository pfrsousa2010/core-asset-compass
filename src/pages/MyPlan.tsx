import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePlanLimits, planRules } from '@/hooks/usePlanLimits';
import { ArrowUpRight, Users, Package, HeadphonesIcon, Mail, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { handleUpgradeBasic, handleUpgradePremium } from '@/api/stripe';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function MyPlan() {
  const { data: planLimits, isLoading, error } = usePlanLimits();
  const { profile, company } = useAuth();
  const [isLoadingBasic, setIsLoadingBasic] = useState(false);
  const [isLoadingPremium, setIsLoadingPremium] = useState(false);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Meu Plano</h1>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !planLimits) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Meu Plano</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Erro ao carregar informações do plano.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getProgressBgColor = (usage: number) => {
    if (usage >= 100) return 'bg-red-100';
    if (usage >= 80) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  // Função para cor do preenchimento da barra
  const getProgressIndicatorColor = (usage: number) => {
    if (usage >= 100) return 'bg-red-500';
    if (usage >= 80) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  // Função para lidar com upgrade do plano Basic
  const handleBasicUpgrade = async () => {
    setIsLoadingBasic(true);
    try {
      await handleUpgradeBasic();
    } catch (error) {
      console.error('Erro ao fazer upgrade para Basic:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Não foi possível iniciar o processo de pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBasic(false);
    }
  };

  // Função para lidar com upgrade do plano Premium
  const handlePremiumUpgrade = async () => {
    setIsLoadingPremium(true);
    try {
      await handleUpgradePremium();
    } catch (error) {
      console.error('Erro ao fazer upgrade para Premium:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Não foi possível iniciar o processo de pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPremium(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meu Plano</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plano Atual */}
        <Card
          className={
            planLimits.currentPlan === 'free'
              ? 'bg-green-50 border-green-300'
              : `${planLimits.isAssetsLimitReached || planLimits.isUsersLimitReached
                  ? 'border-red-500 bg-red-50'
                  : planLimits.isAssetsLimitWarning || planLimits.isUsersLimitWarning
                    ? 'border-yellow-500 bg-yellow-50'
                    : ''}
                ${planLimits.currentPlan === 'basic' ? ' bg-blue-50 border-blue-300' : ''}
                ${planLimits.currentPlan === 'premium' ? ' bg-purple-50 border-purple-300' : ''}`
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{planLimits.planInfo.icon}</span>
              Plano {planLimits.planInfo.name}
            </CardTitle>
            <CardDescription>
              Seu plano atual e benefícios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <HeadphonesIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {planLimits.currentPlan === 'premium'
                  ? 'Suporte: WhatsApp (até 24h) ou E-mail (até 24h)'
                  : `Suporte: ${planLimits.planInfo.support}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Ativos: Até {planLimits.planInfo.maxAssets}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Usuários: Até {planLimits.planInfo.maxUsers}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Uso Atual */}
        <Card>
          <CardHeader>
            <CardTitle>Uso Atual</CardTitle>
            <CardDescription>
              Como você está usando seu plano
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ativos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Ativos</span>
                </div>
                <span className="text-sm text-gray-600">
                  {planLimits.assetsCount} / {planLimits.assetsLimit}
                </span>
              </div>
              <div className="space-y-1">
                <Progress 
                  value={planLimits.assetsUsage} 
                  className={`h-2 ${getProgressBgColor(planLimits.assetsUsage)}`}
                  indicatorClassName={getProgressIndicatorColor(planLimits.assetsUsage)}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{planLimits.assetsUsage}% usado</span>
                  {planLimits.isAssetsLimitWarning && (
                    <Badge variant="destructive" className="text-xs">
                      {planLimits.isAssetsLimitReached ? 'Limite atingido' : 'Aproximando do limite'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Usuários */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Usuários</span>
                </div>
                <span className="text-sm text-gray-600">
                  {planLimits.usersCount} / {planLimits.usersLimit}
                </span>
              </div>
              <div className="space-y-1">
                <Progress 
                  value={planLimits.usersUsage} 
                  className={`h-2 ${getProgressBgColor(planLimits.usersUsage)}`}
                  indicatorClassName={getProgressIndicatorColor(planLimits.usersUsage)}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{planLimits.usersUsage}% usado</span>
                  {planLimits.isUsersLimitWarning && (
                    <Badge variant="destructive" className="text-xs">
                      {planLimits.isUsersLimitReached ? 'Limite atingido' : 'Aproximando do limite'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-center text-center">
              <HeadphonesIcon className="h-5 w-5 text-blue-600" />
              Fale com o Suporte
            </CardTitle>
            <CardDescription className="text-center">
              Entre em contato conforme o seu plano
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-1 w-full">
              <div className="flex items-center gap-2 justify-center">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-700 font-medium">E-mail</span>
              </div>
              <a
                href="mailto:suporte.microfocuspro@gmail.com?subject=Suporte%20Armazena%20App"
                className="text-blue-700 font-medium hover:underline break-all text-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                suporte.microfocuspro@gmail.com
              </a>
            </div>
            {planLimits.currentPlan === 'premium' && (
              <div className="flex flex-col items-center gap-2 w-full mt-2">
                <div className="flex items-center gap-2 justify-center">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700 font-medium">WhatsApp</span>
                </div>
                <Button
                  asChild
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  size="lg"
                >
                  <a
                    href={`https://wa.me/5543988448558?text=${encodeURIComponent(
                      `Preciso de suporte no Armazena App. Meu nome é ${profile?.name || ''} da empresa ${company?.name || ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Falar no WhatsApp
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximos Planos */}
      {planLimits.currentPlan !== 'premium' && (
        <Card>
          <CardHeader>
            <CardTitle>Próximos Planos</CardTitle>
            <CardDescription>
              Conheça os benefícios dos outros planos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(planRules).map(([planKey, planInfo]) => {
                if (planKey === planLimits.currentPlan || planKey === 'enterprise') return null;
                if (planLimits.currentPlan === 'basic' && planKey === 'free') return null;

                return (
                  <div
                    key={planKey}
                    className={`border rounded-lg p-4 space-y-3
                      ${planKey === 'basic' ? 'bg-blue-50 border-blue-300' : ''}
                      ${planKey === 'premium' ? 'bg-purple-50 border-purple-300' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{planInfo.icon}</span>
                      <h3 className="font-semibold">{planInfo.name}</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>Até {planInfo.maxAssets} ativos</div>
                      <div>Até {planInfo.maxUsers} usuários</div>
                      <div>{planInfo.support}</div>
                    </div>
                    {planInfo.price && (
                      <div className="text-lg font-bold text-gray-800 mt-2 flex items-end gap-2">
                        {planInfo.oldPrice && (
                          <span className="text-base text-gray-500 line-through">R$ {planInfo.oldPrice.toFixed(2).replace('.', ',')}</span>
                        )}
                        <span>R$ {planInfo.price.toFixed(2).replace('.', ',')} <span className="text-xs font-normal text-gray-600">/mês</span></span>
                      </div>
                    )}
                    {planKey === 'basic' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full" 
                        onClick={handleBasicUpgrade}
                        disabled={isLoadingBasic}
                      >
                        {isLoadingBasic ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          'Fazer Upgrade'
                        )}
                      </Button>
                    ) : planKey === 'premium' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full" 
                        onClick={handlePremiumUpgrade}
                        disabled={isLoadingPremium}
                      >
                        {isLoadingPremium ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          'Fazer Upgrade'
                        )}
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        Fazer Upgrade
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 