import { Link } from 'react-router-dom';

export default function TermosDeUso() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Termos de Uso</h1>
      <p className="mb-4">Estes Termos de Uso regulam o uso do sistema Armazena, oferecido por Micro Focus Pro.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Aceitação</h2>
      <p className="mb-4">Ao utilizar o Armazena, você concorda com estes Termos. Se não concordar, não use o serviço.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Acesso e Cadastro</h2>
      <p className="mb-4">O acesso ao Armazena é feito por meio de cadastro. Você é responsável por manter suas credenciais seguras.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Planos e Pagamento</h2>
      <p className="mb-4">Oferecemos planos gratuitos e pagos. A cobrança é feita por meio da plataforma Stripe. Os valores podem ser ajustados com aviso prévio.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Uso do Sistema</h2>
      <p className="mb-4">Você concorda em usar o Armazena apenas para fins legais. É proibido usar o sistema para atividades ilegais ou violar direitos de terceiros.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Propriedade Intelectual</h2>
      <p className="mb-4">Todo o conteúdo e código do Armazena é de propriedade da Micro Focus Pro. É proibido copiar, modificar ou distribuir sem autorização.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Cancelamento</h2>
      <p className="mb-4">Você pode cancelar sua conta a qualquer momento. Dados podem ser removidos ou mantidos conforme nossa política de privacidade.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Alterações</h2>
      <p className="mb-4">Estes termos podem ser alterados a qualquer momento. Avisaremos os usuários em caso de mudanças significativas.</p>

      <p className="mt-6 text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString()}</p>
      <Link to="/" className="text-blue-700 mt-4 inline-block">← Voltar para o site</Link>
    </div>
  );
}
