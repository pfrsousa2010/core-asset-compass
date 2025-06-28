# 🔔 Configuração de Notificações Push

## 📋 Pré-requisitos

Para que as notificações push funcionem corretamente, você precisa configurar as chaves VAPID.

### 1. Gerar Chaves VAPID

Execute o seguinte comando para gerar as chaves VAPID:

```bash
npx web-push generate-vapid-keys
```

Isso irá gerar duas chaves:
- **Public Key**: Para o frontend
- **Private Key**: Para o backend (não exponha esta chave)

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# VAPID Keys for Push Notifications
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
VITE_VAPID_PRIVATE_KEY=your_vapid_private_key_here

# App Configuration
VITE_APP_NAME=Armazena
VITE_APP_DESCRIPTION=Sistema de Gestão de Ativos
```

### 3. Configurar Backend (Opcional)

Para enviar notificações push do servidor, você precisará:

1. **Supabase Edge Functions**: Criar uma função para enviar notificações
2. **Web Push Library**: Instalar `web-push` no backend
3. **Cron Job**: Configurar para verificar novas notificações

## 🚀 Funcionalidades Implementadas

### ✅ Notificações Automáticas

- **Criação de Ativos**: Notifica admins quando um ativo é criado
- **Atualização de Ativos**: Notifica admins quando um ativo é editado
- **Remoção de Ativos**: Notifica admins quando um ativo é deletado
- **Atualizações do App**: Notifica todos os usuários sobre novas versões

### ✅ Interface de Usuário

- **Centro de Notificações**: Interface para visualizar e gerenciar notificações
- **Badge de Contador**: Mostra número de notificações não lidas
- **Botão de Ativação**: Permite ativar/desativar notificações push
- **Marcar como Lida**: Funcionalidade para marcar notificações como lidas

### ✅ Service Worker

- **Tratamento de Push**: Recebe e exibe notificações push
- **Ações de Notificação**: Botões "Ver" e "Fechar" nas notificações
- **Navegação Inteligente**: Abre/foca a aplicação quando clicado

## 📱 Como Usar

### Para Usuários

1. **Ativar Notificações**: Clique no ícone de sino no header
2. **Visualizar Notificações**: Abra o centro de notificações
3. **Gerenciar Notificações**: Marque como lidas ou desative

### Para Administradores

- As notificações são enviadas automaticamente quando:
  - Qualquer usuário da empresa cria, edita ou remove um ativo
  - Uma nova versão do app está disponível

## 🔧 Configuração do Banco de Dados

As seguintes tabelas foram criadas:

### `push_subscriptions`
Armazena as assinaturas de push dos usuários:
- `user_id`: ID do usuário
- `endpoint`: Endpoint da assinatura push
- `p256dh`: Chave pública da assinatura
- `auth`: Token de autenticação

### `notifications`
Armazena as notificações:
- `user_id`: ID do usuário destinatário
- `title`: Título da notificação
- `body`: Corpo da notificação
- `type`: Tipo da notificação
- `data`: Dados adicionais (JSON)
- `read_at`: Timestamp de leitura

## 🛠️ Triggers Automáticos

Os seguintes triggers foram configurados no banco:

1. **`trigger_notify_asset_created`**: Dispara quando um ativo é criado
2. **`trigger_notify_asset_updated`**: Dispara quando um ativo é editado
3. **`trigger_notify_asset_deleted`**: Dispara quando um ativo é removido

## 🔒 Segurança

- **RLS (Row Level Security)**: Todas as tabelas têm políticas de segurança
- **VAPID**: Autenticação segura para notificações push
- **Permissões**: Apenas usuários autenticados podem gerenciar suas notificações

## 🐛 Solução de Problemas

### Notificações não aparecem
1. Verifique se as permissões estão habilitadas no navegador
2. Confirme se as chaves VAPID estão configuradas
3. Verifique se o service worker está registrado

### Erro de permissão
1. Vá para Configurações do Navegador > Notificações
2. Habilite as notificações para o domínio
3. Recarregue a página

### Service Worker não registra
1. Verifique se o HTTPS está configurado
2. Confirme se o arquivo `sw.js` está acessível
3. Verifique os logs do console

## 📞 Suporte

Para dúvidas sobre notificações:
1. Verifique esta documentação
2. Consulte os logs do console
3. Teste em diferentes navegadores 