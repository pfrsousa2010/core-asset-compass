#!/usr/bin/env node

import webpush from 'web-push';

console.log('🔑 Gerando chaves VAPID para notificações push...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Chaves VAPID geradas com sucesso!\n');

console.log('📋 Adicione estas chaves ao seu arquivo .env:\n');

console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VITE_VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);

console.log('\n⚠️  IMPORTANTE:');
console.log('- A chave PRIVADA deve ser mantida segura e nunca exposta no frontend');
console.log('- A chave PÚBLICA pode ser usada no frontend');
console.log('- Para produção, use variáveis de ambiente seguras');

console.log('\n🚀 Para testar as notificações:');
console.log('1. Configure as chaves no arquivo .env');
console.log('2. Execute: npm run dev');
console.log('3. Acesse a aplicação e ative as notificações');
console.log('4. Teste criando, editando ou removendo um ativo'); 