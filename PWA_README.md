# Armazena PWA - Progressive Web App

## 📱 Funcionalidades PWA

O Armazena agora é uma **Progressive Web App (PWA)** completa, oferecendo uma experiência nativa em dispositivos móveis e desktop.

### ✨ Principais Funcionalidades

#### 🏠 Instalação na Tela Inicial
- **Android**: Instale diretamente na tela inicial via Chrome
- **iOS**: Adicione à tela inicial via Safari (ícone de compartilhar)
- **Desktop**: Instale como aplicativo nativo via Chrome/Edge

#### 🔄 Funcionalidade Offline
- Cache inteligente de recursos
- Funcionamento básico sem conexão
- Sincronização automática quando online

#### 📱 Experiência Nativa
- Interface adaptada para dispositivos móveis
- Navegação por gestos
- Ícones e splash screen personalizados

#### 🔔 Notificações Push
- Notificações em tempo real
- Suporte a ações nas notificações
- Badge de contadores

### 🎨 Design e Ícones

O ícone da aplicação é baseado no ícone **Package** do Lucide React, mantendo a identidade visual consistente com a página de login.

### 🛠️ Como Instalar

#### No Android:
1. Abra o Chrome e navegue para `https://armazena.app.br`
2. Toque no menu (três pontos) → "Adicionar à tela inicial"
3. Confirme a instalação

#### No iOS:
1. Abra o Safari e navegue para `https://armazena.app.br`
2. Toque no ícone de compartilhar (quadrado com seta)
3. Selecione "Adicionar à Tela Inicial"

#### No Desktop:
1. Abra o Chrome/Edge e navegue para `https://armazena.app.br`
2. Clique no ícone de instalação na barra de endereços
3. Confirme a instalação

### 📋 Recursos Técnicos

#### Service Worker
- Cache inteligente de recursos
- Estratégias de cache otimizadas
- Background sync para ações offline

#### Manifest
- Configuração completa para instalação
- Ícones em múltiplos tamanhos
- Shortcuts para navegação rápida

#### Meta Tags
- Suporte completo para iOS
- Configuração para Android
- Open Graph para compartilhamento

### 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Build PWA completa
npm run build:pwa

# Gerar ícones PWA
npm run generate-icons
```

### 📱 Testando a PWA

#### Lighthouse Audit
1. Abra o Chrome DevTools
2. Vá para a aba "Lighthouse"
3. Execute o audit de PWA
4. Verifique se todos os critérios estão atendidos

#### Teste de Instalação
1. Abra o site em um dispositivo móvel
2. Verifique se o banner de instalação aparece
3. Teste o processo de instalação
4. Confirme que o app funciona offline

### 🔧 Configuração

#### Vite PWA Plugin
O projeto usa o `vite-plugin-pwa` para:
- Geração automática do manifest
- Configuração do service worker
- Cache de recursos estáticos

#### Ícones
Os ícones são gerados automaticamente em múltiplos tamanhos:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

### 📊 Métricas de Performance

A PWA deve atingir:
- **Performance**: 90+ no Lighthouse
- **Accessibility**: 100 no Lighthouse
- **Best Practices**: 100 no Lighthouse
- **SEO**: 100 no Lighthouse
- **PWA**: 100 no Lighthouse

### 🐛 Solução de Problemas

#### PWA não instala
1. Verifique se o HTTPS está configurado
2. Confirme se o manifest.json está acessível
3. Teste em modo incógnito

#### Cache não funciona
1. Verifique se o service worker está registrado
2. Limpe o cache do navegador
3. Verifique os logs do service worker

#### Ícones não aparecem
1. Confirme se os arquivos de ícone existem
2. Verifique os caminhos no manifest
3. Teste em diferentes dispositivos

### 🔄 Atualizações

A PWA suporta atualizações automáticas:
- Detecção de novas versões
- Notificação para o usuário
- Atualização em background

### 📞 Suporte

Para dúvidas sobre a PWA:
1. Verifique este README
2. Consulte a documentação do Vite PWA
3. Teste em diferentes dispositivos
4. Use as ferramentas de desenvolvedor do navegador 