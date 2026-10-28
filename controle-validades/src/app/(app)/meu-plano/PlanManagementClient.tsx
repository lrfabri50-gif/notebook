'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  CreditCard, 
  Calendar, 
  ArrowUpRight, 
  FileText, 
  Tag, 
  Receipt, 
  Plus, 
  Minus, 
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  TrendingDown,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  X,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { processCheckout } from './actions';

export interface PaymentItem {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  paidAt: Date | string | null;
  createdAt: Date | string | null;
}

export interface PlanManagementProps {
  subscription: {
    id: string;
    planName: string;
    maxUsers: number;
    basePlanPrice: number;
    whatsappAddon: boolean;
    status: string;
    createdAt: Date | string | null;
    payments?: PaymentItem[];
  } | null;
  activeUsersCount: number;
  totalProductsCount: number;
  totalCollectionsCount: number;
  storeName: string;
  adminEmail: string;
}

export default function PlanManagementClient({
  subscription,
  activeUsersCount,
  totalProductsCount,
  totalCollectionsCount,
  storeName,
  adminEmail
}: PlanManagementProps) {
  // Preços Oficiais Artos
  const PRICE_MENSAL = 49.90;
  const PRICE_ANUAL = 498.99;
  const USERS_MENSAL = 1;
  const USERS_ANUAL = 5;

  const currentPlanName = subscription?.planName || 'Plano Anual Blindagem';
  const isAnnual = currentPlanName.toLowerCase().includes('anual');
  const maxUsers = subscription?.maxUsers || (isAnnual ? 5 : 1);
  const currentPrice = subscription?.basePlanPrice || (isAnnual ? PRICE_ANUAL : PRICE_MENSAL);

  // Modal de Troca / Pagamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<'mensal' | 'anual'>(isAnnual ? 'anual' : 'mensal');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [cardInstallments, setCardInstallments] = useState(isAnnual ? '12' : '1');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dados do Cartão (Simulação)
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const selectedPrice = selectedCycle === 'anual' ? PRICE_ANUAL : PRICE_MENSAL;
  const selectedUsers = selectedCycle === 'anual' ? USERS_ANUAL : USERS_MENSAL;
  const monthlyEquivalent = selectedCycle === 'anual' ? (PRICE_ANUAL / 12) : PRICE_MENSAL;

  const pixKeyOfficial = 'luizrfabricio@outlook.com';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKeyOfficial);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleConfirmPayment = async () => {
    setIsSaving(true);
    setFeedbackMsg(null);
    try {
      const methodLabel = paymentMethod === 'pix' 
        ? 'PIX Instantâneo' 
        : `Cartão de Crédito (${selectedCycle === 'anual' ? `${cardInstallments}x` : '1x'})`;

      await processCheckout({
        billingCycle: selectedCycle,
        paymentMethod: methodLabel
      });
      setFeedbackMsg({ type: 'success', text: `Plano ${selectedCycle === 'anual' ? 'Anual' : 'Mensal'} ativado com sucesso!` });
      setTimeout(() => {
        setIsModalOpen(false);
        setFeedbackMsg(null);
      }, 1500);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Erro ao processar ativação do plano.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-14">
      {/* 1. TOPO EXECUTIVO SLIM */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl px-6 py-4 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">
                  Meu Plano & Assinatura
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ativo & Protegido
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {storeName} — Gestão financeira preventiva, capacidade de equipe e direitos inclusos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCycle(isAnnual ? 'anual' : 'mensal');
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> Alterar Plano / Pagamento
            </button>
            <Link
              href="/usuarios"
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
            >
              <Users className="w-3.5 h-3.5" /> Equipe ({activeUsersCount}/{maxUsers})
            </Link>
          </div>
        </div>
      </div>

      {/* 2. CARD PRINCIPAL DA ASSINATURA ATUAL */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Lado Esquerdo: Detalhes do Plano */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs uppercase px-3 py-1 rounded-lg tracking-wider">
                  {currentPlanName}
                </span>
                {isAnnual && (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Até 5 Usuários Inclusos + 2 Meses Grátis
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    R$ {currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-slate-500 text-sm font-medium">
                    / {isAnnual ? 'ano' : 'mês'}
                  </span>
                  {isAnnual && (
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full ml-2">
                      Equivale a R$ 41,58 / mês
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Cobrança corporativa {isAnnual ? 'anual com até 5 usuários inclusos' : 'mensal para 1 usuário'}. Todos os recursos liberados.
                </p>
              </div>

              {/* Badges de Garantia */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Cancelamento sem multa
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Alertas de WhatsApp Inclusos
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Backup Diário em Nuvem
                </div>
              </div>
            </div>

            {/* Lado Direito: Capacidade Operacional da Loja */}
            <div className="lg:col-span-5 bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Capacidade Operacional da Loja
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {maxUsers} Usuários Contratados
                </span>
              </div>

              {/* Métrica 1: Usuários */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> Usuários da Equipe
                  </span>
                  <span className="font-bold text-slate-900">
                    {activeUsersCount} em uso de {maxUsers} liberado{maxUsers > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round((activeUsersCount / maxUsers) * 100))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isAnnual 
                    ? `Você tem direito a cadastrar até ${maxUsers} pessoas (1 Admin + 4 Operadores).`
                    : 'O plano mensal inclui 1 usuário. Migre para o anual para liberar até 5 usuários.'}
                </p>
              </div>

              {/* Métrica 2: Produtos & Coletas */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3 rounded-lg border border-slate-200/60">
                  <span className="text-[11px] text-slate-500 block">Produtos Cadastrados</span>
                  <span className="text-base font-bold text-slate-900">
                    {totalProductsCount} <span className="text-[10px] text-emerald-600 font-semibold">(Ilimitado)</span>
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/60">
                  <span className="text-[11px] text-slate-500 block">Coletas Registradas</span>
                  <span className="text-base font-bold text-slate-900">
                    {totalCollectionsCount} <span className="text-[10px] text-emerald-600 font-semibold">(Ilimitado)</span>
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    setSelectedCycle('anual');
                    setIsModalOpen(true);
                  }}
                  className="w-full text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 py-2.5 rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> 
                  {isAnnual ? 'Gerenciar Pagamento do Plano Anual' : 'Fazer Upgrade para Anual (Até 5 Usuários)'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. SEÇÃO: O QUE SEU PLANO DÁ DIREITO */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Recursos & Direitos Inclusos no Seu Plano
            </h2>
            <p className="text-xs text-slate-500">
              Todos os módulos abaixo estão ativos e liberados para utilização na sua loja.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit">
            100% dos Recursos Desbloqueados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Preço de Etiqueta */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mb-3">
                <Tag className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                Preço de Etiqueta Real
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Ativo</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Registro do preço físico de gôndola no momento da coleta. O sistema calcula a perda monetária exata (R$) por valor de venda sem estimativas arbitrárias.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Apuração financeira de quebra
            </div>
          </div>

          {/* Card 2: Matriz de Decisão Ágil */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-3">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                Matriz de Decisão Preventiva
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Ativo</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Classificação em 4 faixas de ação: 3 dias (queima rápida de estoque), 7 dias, 15 dias e 30 dias com alteração de preço promocional de combate direto na tela.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Resgate antes do vencimento
            </div>
          </div>

          {/* Card 3: WhatsApp em 1 Clique */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                Alertas Diários via WhatsApp
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Ativo</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Disparo em 1 clique de relatórios matinais com lotes críticos, quantidades e preços promocionais diretamente para os repositores ou gerentes da loja.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Comunicação sem ruído
            </div>
          </div>

          {/* Card 4: Dashboard & Tendências */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                Dashboard Executivo Artos
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Ativo</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visão consolidada da loja com filtro de período personalizado (7d, 15d, 30d ou datas customizadas) e diagnóstico de saúde preventiva por setor da loja.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Gestão baseada em dados
            </div>
          </div>

          {/* Card 5: Exportações Ilimitadas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                Exportações em PDF & Excel
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Ativo</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Emissão instantânea de relatórios executivos em formato PDF (prontos para impressão de prancheta) e planilhas em CSV formatadas para o Excel.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Sem limites de downloads
            </div>
          </div>

          {/* Card 6: Suporte & Segurança */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                Segurança & Suporte Humano
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Ativo</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Armazenamento em banco de dados isolado com backup automático contínuo. Suporte consultivo dedicado pelo WhatsApp e pelo e-mail luizrfabricio@outlook.com.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Atendimento direto Artos
            </div>
          </div>

        </div>
      </div>

      {/* 4. SEÇÃO: COMPARATIVO E ESCOLHA DE PLANOS */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900">
            Comparativo de Planos & Expansão
          </h2>
          <p className="text-xs text-slate-500">
            Tabela oficial de investimentos para a sua loja.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Opção 1: Mensal */}
          <div className={`rounded-2xl p-6 border transition-all flex flex-col justify-between ${
            !isAnnual ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-bold text-slate-900">Plano Mensal</h3>
                {!isAnnual && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Seu Plano
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-4">Flexibilidade sem fidelidade, cancele quando quiser.</p>
              
              <div className="mb-4">
                <span className="text-3xl font-black text-slate-900">R$ 49,90</span>
                <span className="text-xs text-slate-500"> / mês</span>
                <p className="text-[11px] text-slate-600 font-semibold mt-1">
                  👤 Acesso para 1 Usuário (Loja / Admin)
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 1 Usuário liberado
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Auditoria ilimitada de produtos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Preço de etiqueta e cálculo de perda
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Alertas em 1 clique no WhatsApp
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                onClick={() => {
                  setSelectedCycle('mensal');
                  setIsModalOpen(true);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  !isAnnual 
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {!isAnnual ? 'Gerenciar Pagamento' : 'Mudar para Mensal (R$ 49,90)'}
              </button>
            </div>
          </div>

          {/* Opção 2: Anual Blindagem (Destaque Artos) */}
          <div className={`rounded-2xl p-6 border transition-all flex flex-col justify-between relative overflow-hidden ${
            isAnnual ? 'bg-gradient-to-b from-emerald-50/50 to-white border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Mais Vantajoso
            </div>

            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-bold text-slate-900">Plano Anual Blindagem</h3>
                {isAnnual && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Seu Plano
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-4">Equipe completa com economia máxima anual.</p>
              
              <div className="mb-4">
                <span className="text-3xl font-black text-slate-900">R$ 498,99</span>
                <span className="text-xs text-slate-500"> / ano</span>
                <p className="text-[11px] text-emerald-700 font-bold mt-1">
                  👥 Até 5 Usuários Inclusos (1 Admin + 4 Operadores)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Equivale a R$ 41,58 / mês (Mais de 2 meses grátis!)
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-2 font-semibold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Até 5 Usuários inclusos na equipe
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Todos os recursos do plano mensal
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Economia anual garantida
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Suporte consultivo prioritário
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                onClick={() => {
                  setSelectedCycle('anual');
                  setIsModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
              >
                {isAnnual ? 'Gerenciar Pagamento Anual' : 'Fazer Upgrade para Anual (Até 5 Usuários)'}
              </button>
            </div>
          </div>

          {/* Opção 3: Rede Multilojas */}
          <div className="rounded-2xl p-6 border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-bold text-slate-900">Rede Multilojas</h3>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  Corporativo
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Gestão integrada para redes com 2 ou mais filiais.</p>
              
              <div className="mb-4">
                <span className="text-2xl font-black text-slate-900">Sob Consulta</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Tabela escalonada por volume de filiais</p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Painel matriz consolidado
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Comparativo de perdas entre lojas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Treinamento presencial/remoto de equipe
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <a
                href="https://wa.me/5514991395451?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20plano%20Multilojas%20da%20Artos"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl text-xs font-bold transition-all bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> Falar com Consultor
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* 5. SEÇÃO: HISTÓRICO DE FATURAMENTO / PAGAMENTOS */}
      {subscription?.payments && subscription.payments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Histórico de Faturamento
              </h2>
              <p className="text-xs text-slate-500">
                Registros de pagamentos confirmados vinculados à sua loja.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Data</th>
                  <th className="pb-3">Descrição / Método</th>
                  <th className="pb-3 text-right">Valor</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscription.payments.map((p) => {
                  const payDate = p.paidAt || p.createdAt;
                  const dateStr = payDate ? new Date(payDate).toLocaleDateString('pt-BR') : '-';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-medium text-slate-700">{dateStr}</td>
                      <td className="py-3 text-slate-600">
                        Assinatura Artos — {p.paymentMethod || 'PIX'}
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900">
                        R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Confirmado
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MODAL INTERATIVO: FORMA DE PAGAMENTO & ATIVAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold">Configuração de Pagamento da Assinatura</h3>
                <p className="text-xs text-slate-300">Escolha o plano e o método de pagamento para a sua loja.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              
              {/* Feedback Alert */}
              {feedbackMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  feedbackMsg.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <CheckCircle2 className="w-4 h-4" /> {feedbackMsg.text}
                </div>
              )}

              {/* Seletor de Plano / Ciclo */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  1. Escolha o Plano:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCycle('mensal');
                      setCardInstallments('1');
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedCycle === 'mensal'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="block text-xs">Plano Mensal</span>
                    <span className="text-base font-black text-slate-900">R$ {PRICE_MENSAL.toFixed(2).replace('.', ',')}</span>
                    <span className="text-[10px] text-slate-500 block">1 Usuário • Sem fidelidade</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCycle('anual');
                      setCardInstallments('12');
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all relative ${
                      selectedCycle === 'anual'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      Até 5 Usuários
                    </span>
                    <span className="block text-xs">Plano Anual Blindagem</span>
                    <span className="text-base font-black text-slate-900">R$ {PRICE_ANUAL.toFixed(2).replace('.', ',')}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      R$ 41,58 / mês (2 Meses Grátis)
                    </span>
                  </button>
                </div>
              </div>

              {/* Seletor de Método de Pagamento */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  2. Forma de Pagamento:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs leading-tight">PIX Instantâneo</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">Aprovação Imediata</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs leading-tight">Cartão de Crédito</span>
                      <span className="text-[10px] text-blue-600 font-semibold">
                        {selectedCycle === 'anual' ? 'Até 12x sem juros' : 'À vista'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Detalhes do Pagamento Conforme Método */}
              {paymentMethod === 'pix' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Chave PIX Oficial (E-mail):</span>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey ? 'Chave Copiada!' : 'Copiar Chave'}
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                    <p className="text-sm font-mono font-bold text-slate-900 select-all">
                      {pixKeyOfficial}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Beneficiário: Luiz Renato Fabricio / Artos Consultoria
                    </p>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Como pagar via PIX:
                    </p>
                    <ol className="list-decimal list-inside text-[11px] text-emerald-800 space-y-0.5 pl-1">
                      <li>Abra o aplicativo do seu banco ou celular.</li>
                      <li>Escolha pagar via PIX por chave e cole o e-mail: <strong>{pixKeyOfficial}</strong></li>
                      <li>Confirme o valor exato de <strong>R$ {selectedPrice.toFixed(2).replace('.', ',')}</strong></li>
                      <li>Clique no botão verde abaixo para confirmar a ativação imediata.</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Parcelamento no Cartão:
                    </label>
                    <select
                      value={cardInstallments}
                      onChange={(e) => setCardInstallments(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {selectedCycle === 'anual' ? (
                        <>
                          <option value="1">1x de R$ 498,99 (À vista)</option>
                          <option value="2">2x de R$ 249,50 sem juros</option>
                          <option value="3">3x de R$ 166,33 sem juros</option>
                          <option value="6">6x de R$ 83,16 sem juros</option>
                          <option value="12">12x de R$ 41,58 sem juros (Recomendado)</option>
                        </>
                      ) : (
                        <option value="1">1x de R$ 49,90 (Mensal recorrente)</option>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <input 
                        type="text" 
                        placeholder="Número do Cartão de Crédito"
                        value={cardData.number}
                        onChange={(e) => setCardData({...cardData, number: e.target.value})}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="text" 
                        placeholder="Nome Impresso no Cartão"
                        value={cardData.name}
                        onChange={(e) => setCardData({...cardData, name: e.target.value})}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Validade (MM/AA)"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="CVV (Código)"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Resumo Financeiro */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-300 block">Total a ser cobrado:</span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    {selectedCycle === 'anual' ? 'Plano Anual Blindagem (Até 5 Usuários)' : 'Plano Mensal (1 Usuário)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white">
                    R$ {selectedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    / {selectedCycle === 'anual' ? 'ano' : 'mês'}
                  </span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isSaving}
                  className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {isSaving ? 'Processando...' : 'Confirmar e Ativar Assinatura'}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
