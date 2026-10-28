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
  X
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
  // Preços Base
  const BASE_PRICE = 23.90;
  const EXTRA_USER_PRICE = 5.90;

  const currentPlanName = subscription?.planName || 'Plano Flexível (Anual)';
  const isAnnual = currentPlanName.toLowerCase().includes('anual');
  const maxUsers = subscription?.maxUsers || 1;
  const isActive = subscription?.status === 'active';

  // Modal de Personalização / Ajuste
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<'mensal' | 'anual'>(isAnnual ? 'anual' : 'mensal');
  const [additionalUsers, setAdditionalUsers] = useState(Math.max(0, maxUsers - 1));
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cálculos do Simulador
  const monthlyTotal = BASE_PRICE + (additionalUsers * EXTRA_USER_PRICE);
  const annualTotal = monthlyTotal * 11; // 1 mês grátis
  const finalPrice = selectedCycle === 'mensal' ? monthlyTotal : annualTotal;

  const handleSavePlan = async () => {
    setIsSaving(true);
    setFeedbackMsg(null);
    try {
      await processCheckout({
        additionalUsers,
        billingCycle: selectedCycle,
        amount: finalPrice
      });
      setFeedbackMsg({ type: 'success', text: 'Plano atualizado com sucesso!' });
      setTimeout(() => {
        setIsModalOpen(false);
        setFeedbackMsg(null);
      }, 1500);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Erro ao atualizar plano.' });
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
                {storeName} — Controle financeiro preventivo, capacidade operacional e direitos inclusos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAdditionalUsers(Math.max(0, maxUsers - 1));
                setSelectedCycle(isAnnual ? 'anual' : 'mensal');
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> Personalizar / Adicionar Usuários
            </button>
            <Link
              href="/usuarios"
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
            >
              <Users className="w-3.5 h-3.5" /> Equipe
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
                    Economia de ~8% (1 mês grátis)
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    R$ {(subscription?.basePlanPrice || (isAnnual ? 262.90 : 23.90)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-slate-500 text-sm font-medium">
                    / {isAnnual ? 'ano' : 'mês'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Cobrança corporativa {isAnnual ? 'anual com renovação programada' : 'mensal sem fidelidade'}. Todos os recursos liberados.
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Capacidade Operacional da Loja
              </h3>

              {/* Métrica 1: Usuários */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> Usuários da Equipe
                  </span>
                  <span className="font-bold text-slate-900">
                    {activeUsersCount} de {maxUsers} liberado{maxUsers > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round((activeUsersCount / maxUsers) * 100))}%` }}
                  />
                </div>
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
                  onClick={() => setIsModalOpen(true)}
                  className="w-full text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 py-2 rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar mais operadores à equipe
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. SEÇÃO: O QUE SEU PLANO DÁ DIREITO (DESTAQUE PRINCIPAL) */}
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
            Conheça as opções disponíveis para a sua loja e ajuste sua assinatura conforme a demanda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Opção 1: Mensal Flexível */}
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
              <p className="text-xs text-slate-500 mb-4">Flexibilidade total sem período de permanência.</p>
              
              <div className="mb-4">
                <span className="text-2xl font-black text-slate-900">R$ 23,90</span>
                <span className="text-xs text-slate-500"> / mês</span>
                <p className="text-[11px] text-slate-400 mt-0.5">+ R$ 5,90 / usuário adicional</p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Auditoria ilimitada de produtos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Preço de etiqueta e cálculo de quebra
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
                {!isAnnual ? 'Personalizar Usuários' : 'Mudar para Mensal'}
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
              </div>
              <p className="text-xs text-slate-500 mb-4">Máxima economia com 1 mês 100% grátis.</p>
              
              <div className="mb-4">
                <span className="text-2xl font-black text-slate-900">R$ 262,90</span>
                <span className="text-xs text-slate-500"> / ano</span>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  Equivale a R$ 21,90 / mês (Pague 11, Leve 12)
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
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
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isAnnual 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isAnnual ? 'Ajustar Plano / Usuários' : 'Migrar para o Anual (Economizar)'}
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

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
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

      {/* 6. MODAL INTERATIVO: PERSONALIZAR PLANO / ADICIONAR USUÁRIOS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Personalizar Capacidade do Plano</h3>
                <p className="text-xs text-slate-300">Ajuste usuários da equipe ou altere o ciclo de faturamento.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
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

              {/* Seletor de Ciclo */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Ciclo de Cobrança:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCycle('mensal')}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedCycle === 'mensal'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="block text-xs">Mensal</span>
                    <span className="text-sm font-black text-slate-900">R$ {BASE_PRICE.toFixed(2).replace('.', ',')}</span>
                    <span className="text-[10px] text-slate-500 block">Sem fidelidade</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCycle('anual')}
                    className={`p-3 rounded-xl border-2 text-left transition-all relative ${
                      selectedCycle === 'anual'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      1 Mês Grátis
                    </span>
                    <span className="block text-xs">Anual</span>
                    <span className="text-sm font-black text-slate-900">R$ {(BASE_PRICE * 11).toFixed(2).replace('.', ',')}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">Pague 11, Leve 12</span>
                  </button>
                </div>
              </div>

              {/* Seletor de Usuários Adicionais */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Operadores / Usuários Extras</span>
                    <span className="text-[11px] text-slate-500">
                      R$ {EXTRA_USER_PRICE.toFixed(2).replace('.', ',')} / mês por usuário adicional
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setAdditionalUsers(Math.max(0, additionalUsers - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors"
                      disabled={additionalUsers <= 0}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-black text-slate-900 text-sm">
                      {additionalUsers}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdditionalUsers(additionalUsers + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs text-slate-600">
                  <span>Capacidade Total Resultante:</span>
                  <span className="font-bold text-slate-900">
                    {1 + additionalUsers} usuário{1 + additionalUsers > 1 ? 's' : ''} liberado{1 + additionalUsers > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Resumo do Valor */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-300 block">Novo Investimento Total:</span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    Plano {selectedCycle === 'anual' ? 'Anual' : 'Mensal'} • {1 + additionalUsers} Usuário(s)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white">
                    R$ {finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    / {selectedCycle === 'anual' ? 'ano' : 'mês'}
                  </span>
                </div>
              </div>

              {/* Botões do Modal */}
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
                  onClick={handleSavePlan}
                  disabled={isSaving}
                  className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {isSaving ? 'Atualizando...' : 'Confirmar e Atualizar Plano'}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
