import { Link } from 'react-router-dom';

export function PoliticaPrivacidade() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Política de Privacidade</h1>
      <p className="mb-4">A privacidade dos nossos usuários é muito importante para nós. Esta Política explica como coletamos, usamos e protegemos seus dados.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Informações Coletadas</h2>
      <p className="mb-4">Coletamos dados como nome, e-mail, nome da empresa e dados de uso do sistema. Esses dados são necessários para o funcionamento e melhoria do Armazena.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Uso das Informações</h2>
      <p className="mb-4">Utilizamos os dados para autenticação, personalização da experiência, contato com o usuário e melhoria do sistema.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Compartilhamento</h2>
      <p className="mb-4">Não vendemos seus dados. Podemos compartilhar informações com serviços de terceiros (como Stripe e Supabase) apenas para garantir o funcionamento do sistema.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Segurança</h2>
      <p className="mb-4">Adotamos medidas técnicas e organizacionais para proteger seus dados contra acessos não autorizados.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Direitos do Usuário</h2>
      <p className="mb-4">Você pode solicitar a exclusão ou atualização de seus dados a qualquer momento, entrando em contato pelo e-mail informado no rodapé do site.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Cookies</h2>
      <p className="mb-4">Utilizamos cookies para melhorar sua navegação. Você pode desativá-los nas configurações do seu navegador.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Alterações</h2>
      <p className="mb-4">Esta política pode ser atualizada. Notificaremos em caso de mudanças relevantes.</p>

      <p className="mt-6 text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString()}</p>
      <Link to="/" className="text-blue-700 mt-4 inline-block">← Voltar para o site</Link>
    </div>
  );
}
