'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ScanLine, 
  Box, 
  Layers, 
  BarChart2, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  Search,
  BookOpen,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'geral' | 'coleta' | 'whatsapp' | 'plano';
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: '1',
    category: 'whatsapp',
    question: 'Como funcionam os alertas automáticos via WhatsApp?',
    answer: 'O sistema verifica diariamente a base de produtos cadastrados da sua loja. Quando um produto estiver a 3 ou 4 dias de vencer, uma mensagem com o resumo dos itens em alerta é enviada diretamente para o número de WhatsApp configurado na sua conta, permitindo que sua equipe tome uma ação preventiva antes de qualquer perda.'
  },
  {
    id: '2',
    category: 'coleta',
    question: 'O leitor de código de barras pela câmera não abre no meu celular. O que fazer?',
    answer: 'Certifique-se de que o navegador (Chrome no Android ou Safari no iOS) tem permissão para acessar a câmera. Caso o pop-up de permissão não apareça, acesse as configurações do navegador, procure pelas permissões do site e autorize a Câmera. Você também pode digitar o código de barras manualmente ou utilizar leitores físicos USB/Bluetooth.'
  },
  {
    id: '3',
    category: 'geral',
    question: 'O que fazer se um produto não tiver código de barras impresso?',
    answer: 'Você pode cadastrar um código interno identificador (por exemplo: INT-001, PAD-01, FRUT-01). Na hora de coletar a validade na gôndola, basta digitar esse código interno ou pesquisar pelo nome do produto na barra de busca da tela de Coleta.'
  },
  {
    id: '4',
    category: 'coleta',
    question: 'Posso cadastrar mais de uma data de validade para o mesmo produto?',
    answer: 'Sim! Em um supermercado ou mercearia é normal haver diferentes lotes do mesmo produto na prateleira ou estoque. Cada vez que você coleta um produto com uma data ou lote diferente, o sistema registra uma nova entrada com sua respectiva validade e quantidade.'
  },
  {
    id: '5',
    category: 'plano',
    question: 'Como adicionar funcionários ou operadores para ajudarem na coleta?',
    answer: 'Acesse o menu "Usuários" na barra lateral. Como administrador, você pode cadastrar novos usuários definindo seus perfis (Operador ou Gerente). Cada operador terá seu próprio login e senha para realizar as coletas e consultas pelo celular.'
  },
  {
    id: '6',
    category: 'geral',
    question: 'Como exportar os relatórios de produtos para negociar trocas com fornecedores?',
    answer: 'No menu "Relatórios", você pode filtrar os produtos pelo status (ex: Vencendo em 7 dias, Vencidos ou Todos) ou por departamento. Em seguida, clique em "Exportar Excel" ou "Gerar PDF". O documento é gerado automaticamente com os dados da sua loja, código de barras, lote, quantidade e data de validade, pronto para impressão ou envio por e-mail.'
  },
  {
    id: '7',
    category: 'plano',
    question: 'Como funciona a renovação da assinatura e inclusão de novos usuários?',
    answer: 'No menu "Meu Plano", você pode conferir o status atual da sua assinatura, quantidade de usuários inclusos e módulos ativos. Para alterar seu plano ou adicionar novas lojas, você pode solicitar a alteração diretamente pela página ou contatar o suporte da Artos.'
  }
];

export default function AjudaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [openFaq, setOpenFaq] = useState<string | null>('1');

  const toggleFaq = (id: string) => {
    setOpenFaq(prev => prev === id ? null : id);
  };

  const filteredFaqs = FAQ_DATA.filter(item => {
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    const matchesSearch = 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1F4B36] via-[#163627] to-[#0d2118] text-white p-6 sm:p-8 md:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs sm:text-sm font-medium mb-3 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" /> Central de Atendimento & Suporte
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
            Como podemos ajudar você hoje?
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Tire dúvidas sobre o sistema, consulte o passo a passo de uso ou fale diretamente com a equipe técnica da <strong className="text-white">Artos Consultoria</strong>.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-8 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block opacity-20">
          <HelpCircle className="w-48 h-48 text-white" />
        </div>
      </div>

      {/* Canais de Atendimento Direto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card WhatsApp Oficial */}
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Suporte Oficial Artos
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Seg a Sex: 08h às 18h | Sáb: 08h às 12h
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-[#128C7E]" />
              Atendimento via WhatsApp
            </h3>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Fale em tempo real com nosso time de consultores para tirar dúvidas de operação, reportar inconsistências ou solicitar auxílio na configuração da sua loja.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700 font-medium mb-6">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                <Phone className="w-4 h-4 text-emerald-700" />
                (14) 99139-5451
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Resposta rápida
              </div>
            </div>
          </div>

          <a 
            href="https://wa.me/5514991395451?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20Controle%20de%20Validades%20da%20Artos." 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#128C7E] hover:bg-[#0e7064] text-white font-bold text-sm shadow-md shadow-emerald-900/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <MessageCircle className="w-5 h-5" />
            Iniciar Conversa no WhatsApp
            <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
          </a>
        </div>

        {/* Card Contato por E-mail */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Contato por E-mail
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-4 leading-relaxed">
              Para assuntos contratuais, envio de notas fiscais ou solicitações formais:
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs sm:text-sm font-mono text-slate-700 break-all mb-4">
              suporte@artosconsultoria.com.br
            </div>
          </div>

          <a
            href="mailto:suporte@artosconsultoria.com.br?subject=Suporte%20Controle%20de%20Validades"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
          >
            <Mail className="w-4 h-4" />
            Enviar E-mail
          </a>
        </div>
      </div>

      {/* Guia Rápido de Uso do Sistema */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-800" />
              Guia Rápido de Uso da Rotina
            </h2>
            <p className="text-sm text-slate-500">Passo a passo simples para a operação diária no seu mercado</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Passo 1 */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">1</span>
                <Layers className="w-5 h-5 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">Departamentos</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Cadastre os setores da sua loja (Frios, Padaria, Açougue, Mercearia) para organizar a auditoria.
              </p>
            </div>
            <Link href="/departamentos" className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
              Gerenciar setores &rarr;
            </Link>
          </div>

          {/* Passo 2 */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">2</span>
                <Box className="w-5 h-5 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">Produtos</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Cadastre itens individualmente ou importe sua lista em lote via arquivo CSV/Excel de forma rápida.
              </p>
            </div>
            <Link href="/produtos" className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
              Ver produtos &rarr;
            </Link>
          </div>

          {/* Passo 3 */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">3</span>
                <ScanLine className="w-5 h-5 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">Coletar Validades</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Na gôndola, use a câmera do celular para bipar o código de barras e lançar a data de validade e lote.
              </p>
            </div>
            <Link href="/coletar" className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
              Abrir leitor de coleta &rarr;
            </Link>
          </div>

          {/* Passo 4 */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">4</span>
                <BarChart2 className="w-5 h-5 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">Monitorar & Trocar</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Acompanhe o dashboard diário e exporte listas para acionar fornecedores para troca ou fazer queima preventiva.
              </p>
            </div>
            <Link href="/relatorios" className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
              Exportar relatórios &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Dica de Consultoria Artos */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm sm:text-base font-bold text-amber-950 mb-1 flex items-center gap-2">
            Dica de Gestão Artos: A Regra do PEPS (Primeiro que Entra, Primeiro que Sai)
          </h4>
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">
            Ao repor mercadorias nas gôndolas, posicione sempre os lotes com datas mais próximas à frente. Produtos que faltam <strong>3 a 7 dias</strong> para vencer devem entrar imediatamente em ação promocional destacada ou serem separados para troca com a distribuidora.
          </p>
        </div>
      </div>

      {/* Perguntas Frequentes (FAQ) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-800" />
            Perguntas Frequentes (FAQ)
          </h2>
          <p className="text-sm text-slate-500">Respostas rápidas para as dúvidas mais comuns dos nossos clientes</p>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Pesquisar dúvida (ex: código de barras, relatório, whatsapp)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            {[
              { id: 'todos', label: 'Todas' },
              { id: 'whatsapp', label: 'WhatsApp & Alertas' },
              { id: 'coleta', label: 'Coleta & Câmera' },
              { id: 'geral', label: 'Geral & Relatórios' },
              { id: 'plano', label: 'Usuários & Planos' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id 
                    ? 'bg-emerald-900 text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista Accordion */}
        <div className="divide-y divide-slate-100">
          {filteredFaqs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Nenhuma pergunta encontrada com o termo pesquisado.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className="py-4">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between text-left gap-4 font-semibold text-slate-800 hover:text-emerald-900 transition-colors py-1 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base">{faq.question}</span>
                    <span className="text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp className="w-5 h-5 text-emerald-800" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed pr-6 animate-fadeIn">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-400">
        <p>Sistema de Controle de Validades &copy; 2026 Artos Consultoria Empresarial. Todos os direitos reservados.</p>
        <p className="mt-1">Precisa de suporte personalizado na sua loja? Entre em contato pelo WhatsApp (14) 99139-5451.</p>
      </div>
    </div>
  );
}

