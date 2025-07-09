import { Link } from 'react-router-dom';
import { CheckCircle, Users, FileText, Shield, Upload, History, ArrowRight, Mail, Facebook, Instagram, Twitter, Smartphone, Tablet, Monitor, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
// Se framer-motion estiver instalado, pode ser importado para animações leves
// import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePWA } from '@/hooks/usePWA';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const features = [
  { icon: <CheckCircle className="text-blue-600 w-7 h-7" />, title: 'Cadastro de ativos', desc: 'Registre e organize todos os seus bens facilmente.' },
  { icon: <Shield className="text-blue-600 w-7 h-7" />, title: 'Permissões por usuários', desc: 'Controle de acesso: Administrador, Editor e Visualizador.' },
  { icon: <Users className="text-blue-600 w-7 h-7" />, title: 'Controle de localização', desc: 'Saiba onde está cada ativo em tempo real.' },
  { icon: <FileText className="text-blue-600 w-7 h-7" />, title: 'Exportação em PDF, Excel e CSV', desc: 'Exporte relatórios completos em diversos formatos.' },
  { icon: <Upload className="text-blue-600 w-7 h-7" />, title: 'Importação via CSV', desc: 'Importe ativos em massa com template pronto.' },
  { icon: <History className="text-blue-600 w-7 h-7" />, title: 'Histórico e rastreamento', desc: 'Acompanhe todas as movimentações dos ativos.' },
];

const plans = [
  {
    name: 'Free',
    price: 'R$ 0',
    oldPrice: '',
    desc: 'Ideal para começar',
    features: ['Até 50 ativos', 'Até 2 usuários', 'Exportação CSV', 'Importação CSV', 'Suporte por e-mail (até 72h)'],
    highlight: false,
  },
  {
    name: 'Basic',
    price: 'R$ 39,90/mês',
    oldPrice: 'R$ 59,90',
    desc: 'Mais popular',
    features: ['Até 500 ativos', 'Até 5 usuários', 'Exportação PDF/Excel/CSV', 'Importação CSV', 'Suporte por e-mail (até 48h)'],
    highlight: true,
  },
  {
    name: 'Premium',
    price: 'R$ 79,90/mês',
    oldPrice: 'R$ 99,90',
    desc: 'Para empresas exigentes',
    features: ['Até 1000 ativos', 'Até 10 usuários', 'Todos os recursos', 'Suporte WhatsApp (até 24h)'],
    highlight: false,
  },
];

const faqs = [
  {
    q: 'O plano Free tem alguma limitação?',
    a: 'Sim, o plano Free permite até 50 ativos e 2 usuários, mas já inclui exportação e suporte por e-mail.'
  },
  {
    q: 'Posso migrar de plano depois?',
    a: 'Sim! Você pode mudar de plano a qualquer momento, sem burocracia.'
  },
  {
    q: 'Preciso cadastrar cartão no plano gratuito?',
    a: 'Não! O cadastro no plano Free não exige cartão de crédito.'
  },
  {
    q: 'O sistema é seguro?',
    a: 'Sim, utilizamos criptografia e boas práticas para proteger seus dados.'
  },
  {
    q: 'Tem suporte?',
    a: 'Sim, todos os planos contam com suporte por e-mail.'
  },
];

export default function Index() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const carouselImages = [
    { src: "/Ativos 2.png", alt: "Tela de Ativos" },
    { src: "/Meu plano 2.png", alt: "Tela Meu Plano" },
    { src: "/Perfil 1.png", alt: "Tela Perfil" },
    { src: "/Usuarios 1.png", alt: "Tela Usuários" },
    { src: "/Exportar 1.png", alt: "Tela Exportar" },
  ];
  const navigate = useNavigate();
  const { isInstalled } = usePWA();
  useEffect(() => {
    if (isInstalled) {
      navigate('/login', { replace: true });
    }
  }, [isInstalled, navigate]);
  return (
    <div className="bg-white min-h-screen flex flex-col pt-20">
      {/* Topbar com botão Entrar */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 border-b bg-white/80 backdrop-blur z-30">
        <div className="flex items-center gap-2">
          <img src="/icons/icon-72x72.png" alt="Logo Armazena" className="w-8 h-8" />
          <span className="font-bold text-xl text-blue-700">Armazena</span>
        </div>
        <Link to="/login" className="text-blue-700 font-semibold hover:underline">Já é assinante? Entrar</Link>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between max-w-6xl mx-auto px-6 py-16 gap-10">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-800">Gestão de Ativos e Patrimônio<br />para Empresas e Pessoas</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">Organize, controle e proteja seus bens de forma simples, segura e eficiente. O Armazena é o sistema ideal para quem busca praticidade e controle total do patrimônio.</p>
          <Link to="/signup" className="inline-block bg-blue-700 text-white font-bold px-8 py-4 rounded-lg shadow hover:bg-blue-800 transition text-lg">Comece Grátis</Link>
        </div>
        <div className="flex-1 flex justify-center items-center">
          {/* Print ilustrativo do sistema - agora clicável */}
          <img
            src="/dashboard-print.png"
            alt="Print do sistema Armazena"
            className="rounded-xl shadow-lg w-full max-w-md border cursor-zoom-in transition hover:shadow-2xl"
            onClick={() => { setModalOpen(true); setModalImg("/dashboard-print.png"); }}
          />
        </div>
      </section>

      {/* Modal de imagem expandida */}
      {/* {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setModalOpen(false)}>
          <div className="relative max-w-3xl w-full p-4" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-white bg-black/60 rounded-full p-1 hover:bg-black/80 transition"
              onClick={() => setModalOpen(false)}
              aria-label="Fechar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img
              src="/dashboard-print.png"
              alt="Print do sistema Armazena expandido"
              className="rounded-xl w-full h-auto max-h-[80vh] shadow-2xl border-2 border-white"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )} */}

      {/* Sobre o Sistema */}
      <section className="bg-blue-50 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-800 mb-4">O que é o Armazena?</h2>
          <p className="text-lg text-gray-700 mb-2">O Armazena é um sistema online para gestão de ativos e patrimônio, feito para empresas de todos os portes e também para uso pessoal.</p>
          <p className="text-lg text-gray-700">Fácil de usar, seguro e com recursos que facilitam a organização e o controle dos seus bens.</p>
        </div>
      </section>

      {/* Funcionalidades principais */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-800 mb-10">Funcionalidades principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border hover:shadow-lg transition">
                {f.icon}
                <h3 className="font-semibold text-lg mt-4 mb-2 text-blue-900">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carrossel de telas reais do sistema */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-800 mb-2">Veja o Armazena em ação</h2>
          <p className="text-center text-gray-600 mb-8">Navegue por algumas telas do sistema e descubra como é simples controlar seu patrimônio.</p>
          <Carousel className="w-full">
            <CarouselContent>
              {carouselImages.map((img, idx) => (
                <CarouselItem key={idx} className="flex justify-center items-center">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="rounded-2xl shadow-lg border max-h-[400px] w-auto max-w-full cursor-zoom-in transition hover:shadow-2xl"
                    onClick={() => { setModalImg(img.src); setModalOpen(true); }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10" />
          </Carousel>
        </div>
      </section>

      {/* Seção de responsividade */}
      <section className="py-10 px-6 bg-blue-50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="flex-1 flex justify-center md:justify-start gap-6 text-blue-700 mb-4 md:mb-0">
            <span className="flex flex-col items-center"><Monitor className="w-12 h-12" /><span className="sr-only">Desktop</span></span>
            <span className="flex flex-col items-center"><Tablet className="w-12 h-12" /><span className="sr-only">Tablet</span></span>
            <span className="flex flex-col items-center"><Smartphone className="w-12 h-12" /><span className="sr-only">Celular</span></span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 text-blue-800">Totalmente Responsivo</h3>
            <p className="text-gray-700 text-lg">O Armazena foi projetado para funcionar perfeitamente em qualquer dispositivo: computador, tablet ou celular. Gerencie seus ativos de onde estiver, com uma experiência fluida e adaptada à sua tela.</p>
          </div>
        </div>
      </section>

      {/* Seção PWA - Instale como App */}
      <section className="py-10 px-6 bg-white">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="flex justify-center md:justify-start mb-4 md:mb-0">
            <Download className="w-14 h-14 text-blue-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-blue-800">Instale o Armazena como App!</h3>
            <p className="text-gray-700 text-lg">O Armazena pode ser instalado no seu computador, tablet ou celular como um aplicativo. Assim, você acessa rapidamente, mesmo sem abrir o navegador, e aproveita uma experiência ainda mais fluida e integrada.</p>
          </div>
        </div>
      </section>

      {/* Seção Tablet - Experiência otimizada */}
      <section className="py-10 px-6 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-blue-800 text-center">Experiência otimizada para tablets</h3>
          <p className="text-gray-700 text-lg text-center mb-8">Veja como o Armazena se adapta perfeitamente ao uso em tablets, com navegação fluida e interface amigável.</p>
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-8">
            <img src="/tela tablet menu.png" alt="Menu do Armazena em tablet" className="rounded-2xl shadow-lg border max-w-xs w-full cursor-zoom-in transition hover:shadow-2xl" onClick={() => { setModalImg('/tela tablet menu.png'); setModalOpen(true); }} />
            <img src="/tela tablet ativos 1.png" alt="Tela de ativos em tablet" className="rounded-2xl shadow-lg border max-w-xs w-full cursor-zoom-in transition hover:shadow-2xl" onClick={() => { setModalImg('/tela tablet ativos 1.png'); setModalOpen(true); }} />
          </div>
          <p className="text-gray-700 text-md text-center">Se sua empresa utiliza etiquetas com códigos de barras ou QR Code, o Armazena permite escanear esses códigos diretamente pela câmera do tablet ou celular, facilitando a consulta de ativos de forma rápida e prática.</p>
        </div>
      </section>

      {/* Modal de imagem expandida (usado tanto para o print do Hero quanto para o carrossel) */}
      {modalOpen && modalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => { setModalOpen(false); setModalImg(null); }}>
          <div className="relative flex items-center justify-center w-full h-full p-4" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-white bg-black/60 rounded-full p-1 hover:bg-black/80 transition"
              onClick={() => { setModalOpen(false); setModalImg(null); }}
              aria-label="Fechar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={modalImg}
              alt="Tela expandida do sistema Armazena"
              className="rounded-xl w-auto h-auto max-h-[85vh] max-w-full mx-auto"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      {/* Planos */}
      <section className="bg-blue-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-800 mb-10">Escolha o plano ideal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div key={plan.name} className={`relative rounded-2xl border shadow-lg p-8 flex flex-col items-center text-center bg-white ${plan.highlight ? 'ring-4 ring-blue-400 scale-105 z-10' : ''}`}>
                {plan.highlight && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">Mais Popular</span>
                )}
                <h3 className="text-xl font-bold text-blue-900 mb-2">{plan.name}</h3>
                {plan.oldPrice && <span className="line-through text-gray-400 text-sm">{plan.oldPrice}</span>}
                <div className="text-3xl font-extrabold text-blue-700 mb-2">{plan.price}</div>
                <div className="text-gray-600 mb-4">{plan.desc}</div>
                <ul className="mb-6 space-y-2 text-gray-700 text-left">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /> {f}</li>
                  ))}
                </ul>
                <Button onClick={() => setPlanModalOpen(true)} className={`w-full py-3 rounded-lg font-bold transition ${plan.highlight ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}>Comece agora</Button>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-center">
              <span className="block text-sm text-gray-700 mb-1">
                Precisa de um plano maior ou personalizado?
              </span>
              <a
                href="mailto:microfocuspro@gmail.com"
                className="text-blue-700 font-semibold underline hover:text-blue-900"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fale conosco!
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos/Confiança */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">Quem confia no Armazena</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="bg-white rounded-xl shadow p-6 flex-1 mb-4 md:mb-0 border">
              <p className="text-lg text-gray-700 italic mb-2">“O Armazena facilitou muito o controle dos bens da nossa empresa. Recomendo!”</p>
              <span className="font-semibold text-blue-700">João Silva, Inova Gestão</span>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex-1 border">
              <p className="text-lg text-gray-700 mb-2">Mais de <span className="font-bold text-blue-700">100 usuários</span> confiam no Armazena para controlar seu patrimônio.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-blue-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-blue-800 mb-8 text-center">Perguntas frequentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 border">
                <div className="font-semibold text-blue-900 mb-2">{faq.q}</div>
                <div className="text-gray-700">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de orientação */}
      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Como começar?</DialogTitle>
            <DialogDescription>
              Você será direcionado para a tela de cadastro. Para usar o sistema:
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
            <div className="flex-1">
              <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                <li>Crie sua conta com e-mail e senha.</li>
                <li>Confirme seu e-mail na caixa de entrada.</li>
                <li>Cadastre sua empresa e escolha o plano desejado na tela de onboarding.</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setPlanModalOpen(false); navigate('/signup'); }} className="w-full">Entendi, ir para cadastro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rodapé */}
      <footer className="bg-white border-t py-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img src="/icons/icon-72x72.png" alt="Logo Armazena" className="w-7 h-7" />
            <span className="font-bold text-blue-700">Armazena</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600 mb-4 md:mb-0">
            <Link to="#" className="hover:underline">Termos de Uso</Link>
            <Link to="#" className="hover:underline">Política de Privacidade</Link>
            <a href="mailto:suporte.microfocuspro@gmail.com" className="hover:underline">Suporte</a>
          </div>
          <Link to="/login" className="text-blue-700 font-semibold hover:underline">Entrar</Link>
        </div>
        <div className="text-center text-xs text-gray-400 mt-4">&copy; {new Date().getFullYear()} Armazena. Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}
