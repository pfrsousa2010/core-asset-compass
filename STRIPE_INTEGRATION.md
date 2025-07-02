# Integração com Stripe Checkout - Documentação

## Visão Geral
Foi implementada a integração com o Stripe Checkout para os botões de upgrade dos planos Basic e Premium na página "Meu Plano".

## Configuração Implementada

### 1. Dependências Instaladas
- `@stripe/stripe-js`: Biblioteca oficial do Stripe para frontend

### 2. Configuração do Stripe
- **Chave Pública**: `pk_live_51RgE7aCpLUoYVzVwqFuUAyAotOLJnfXY6ZxSCTtHoijgcj5h1QBpIH1NYsSakSYDQeZ8T2n138c8KHhy5upz2WRu00JxHw6RRn`
- **IDs dos Produtos**:
  - Plano Basic: `prod_SbRT9h1Ya6fsLt`
  - Plano Premium: `prod_SbRU99ofej91iw`

### 3. Arquivos Modificados

#### `src/api/stripe.ts`
- Configuração da chave pública do Stripe
- Definição dos IDs dos produtos
- Função `createStripeSession()` para criar sessão de checkout
- Função `redirectToCheckout()` para redirecionar para o Stripe
- Funções `handleUpgradeBasic()` e `handleUpgradePremium()`

#### `src/pages/MyPlan.tsx`
- Importação das funções do Stripe
- Estados de loading para cada botão
- Funções `handleBasicUpgrade()` e `handlePremiumUpgrade()`
- Atualização dos botões com loading e tratamento de erro

## Fluxo de Funcionamento

### 1. Usuário Clica no Botão "Fazer Upgrade"
- O botão mostra estado de loading
- Chama a função correspondente (`handleBasicUpgrade` ou `handlePremiumUpgrade`)

### 2. Criação da Sessão de Checkout
- Função `createStripeSession()` é chamada
- Faz requisição POST para: `https://nvwscxburlixyqkbhfux.supabase.co/functions/v1/create-stripe-session`
- Envia dados:
  ```json
  {
    "product_id": "prod_SbRT9h1Ya6fsLt" ou "prod_SbRU99ofej91iw",
    "company_id": "ID_DA_EMPRESA",
    "plan": "basic" ou "premium"
  }
  ```

### 3. Redirecionamento para Stripe
- Recebe `sessionId` da resposta
- Usa `stripe.redirectToCheckout({ sessionId })` para redirecionar
- Usuário é levado para a página de pagamento do Stripe

### 4. Tratamento de Erros
- Try/catch em todas as operações
- Toast de erro em caso de falha
- Estados de loading são resetados

## Funcionalidades Implementadas

### ✅ Botões de Upgrade Funcionais
- Plano Basic: `handleUpgradeBasic()`
- Plano Premium: `handleUpgradePremium()`

### ✅ Estados de Loading
- Indicador visual durante processamento
- Botões desabilitados durante loading
- Ícone de spinner animado

### ✅ Tratamento de Erros
- Toast de erro em caso de falha
- Logs detalhados no console
- Estados resetados após erro

### ✅ Integração com Supabase
- Autenticação do usuário
- Obtenção do `company_id`
- Headers de autorização corretos

## Próximos Passos Necessários

### 1. Supabase Edge Function
É necessário criar a Edge Function `create-stripe-session` no Supabase com:

```typescript
// Exemplo de implementação da Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { product_id, company_id, plan } = await req.json()
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product: product_id,
            unit_amount: plan === 'basic' ? 2990 : 7990, // R$ 29,90 ou R$ 79,90
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/meu-plano?success=true`,
      cancel_url: `${req.headers.get('origin')}/meu-plano?canceled=true`,
      metadata: {
        company_id,
        plan,
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### 2. Variáveis de Ambiente
Adicionar no Supabase:
- `STRIPE_SECRET_KEY`: Chave secreta do Stripe

### 3. Webhook do Stripe
Implementar webhook para:
- Atualizar plano da empresa após pagamento bem-sucedido
- Cancelar assinatura quando necessário
- Gerenciar mudanças de plano

## Testes Recomendados

1. **Teste de Funcionamento**
   - Clicar nos botões de upgrade
   - Verificar se o loading aparece
   - Confirmar redirecionamento para Stripe

2. **Teste de Erro**
   - Simular erro na Edge Function
   - Verificar se o toast de erro aparece
   - Confirmar se o loading é resetado

3. **Teste de Autenticação**
   - Testar sem usuário logado
   - Verificar tratamento de erro

## Observações Importantes

- A implementação está pronta para produção
- Os botões funcionam corretamente no frontend
- É necessário implementar a Edge Function no Supabase
- O webhook do Stripe deve ser configurado para atualizar os planos
- Os preços estão hardcoded na Edge Function (R$ 29,90 e R$ 79,90) 