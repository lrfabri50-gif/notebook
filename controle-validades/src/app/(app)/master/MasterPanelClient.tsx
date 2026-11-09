'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Store,
  Users,
  Box,
  ScanLine,
  CheckCircle2,
  Clock,
  Ban,
  KeyRound,
  Trash2,
  MessageCircle,
  Search,
  Sparkles,
  TrendingUp,
  Mail,
  Calendar
} from 'lucide-react';
import {
  masterUpdateStorePlan,
  masterResetUserPassword,
  masterDeleteStore
} from './actions';

export interface StoreMasterItem {
  id: string;
  name: string;
  createdAt: Date | string | null;
  subscription: {
    id: string;
    planName: string;
    maxUsers: number;
    basePlanPrice: number;
    status: string;
    trialStartDate: Date | string | null;
    trialEndDate: Date | string | null;
    createdAt: Date | string | null;
  } | null;
  users: {
    id: string;
    name: string | null;
    email: string;
    phoneWhatsapp: string | null;
    role: string;
  }[];
  _count: {
    products: number;
    collections: number;
    departments: number;
    users: number;
  };
}

export default function MasterPanelClient({
  stores,
  masterEmail,
  masterStoreId
}: {
  stores: StoreMasterItem[];
  masterEmail: string;
  masterStoreId: string;
}) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'trial' | 'active' | 'suspended'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cálculos Executivos
  const totalStores = stores.length;
  const activeStores = stores.filter((s) => s.subscription?.status === 'active').length;
  const trialStores = stores.filter((s) => !s.subscription || s.subscription.status === 'trial').length;

  const estimatedMrr = stores.reduce((acc, s) => {
    if (s.subscription?.status === 'active') {
      const price = s.subscription.basePlanPrice || 49.90;
      const isAnual = s.subscription.planName?.toLowerCase().includes('anual') || price >= 400;
      return acc + (isAnual ? price / 12 : price);
    }
    return acc;
  }, 0);

  const getTrialDaysLeft = (store: StoreMasterItem) => {
    const sub = store.subscription;
    if (!sub || sub.status !== 'trial') return null;
    const end = sub.trialEndDate
      ? new Date(sub.trialEndDate)
      : new Date(new Date(sub.createdAt || store.createdAt || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000);
    const diff = end.getTime() - new Date().getTime();
    return Math.max(0, Math.min(7, Math.ceil(diff / (1000 * 3600 * 24))));
  };

  const handlePlanAction = async (
    storeId: string,
    storeName: string,
    action: 'activate_mensal' | 'activate_anual' | 'extend_trial_7d' | 'suspend'
  ) => {
    const labels = {
      activate_mensal: `Ativar o Plano Mensal (R$ 49,90 - 1 usuário) para "${storeName}"?`,
      activate_anual: `Ativar o Plano Anual Blindagem (R$ 498,99 - 5 usuários) para "${storeName}"?`,
      extend_trial_7d: `Liberar mais 7 dias de Teste Grátis para "${storeName}"?`,
      suspend: `Suspender/Bloquear o acesso da loja "${storeName}"?`
    };

    if (!window.confirm(labels[action])) return;

    setLoadingId(`${storeId}-${action}`);
    setFeedback(null);
    try {
      await masterUpdateStorePlan({ storeId, action });
      setFeedback({ type: 'success', text: `Loja "${storeName}" atualizada com sucesso!` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Erro ao atualizar loja.' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleResetPassword = async (userId: string, email: string, storeName: string) => {
    const newPassword = window.prompt(
      `Digite a nova senha para o acesso "${email}" da loja "${storeName}" (mínimo 6 caracteres):`
    );
    if (!newPassword) return;

    setLoadingId(`pwd-${userId}`);
    setFeedback(null);
    try {
      await masterResetUserPassword({ userId, newPassword });
      setFeedback({ type: 'success', text: `Senha de ${email} alterada com sucesso!` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Erro ao redefinir senha.' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteStore = async (storeId: string, storeName: string) => {
    if (
      !window.confirm(
        `ATENÇÃO: Tem certeza que deseja EXCLUIR permanentemente a loja "${storeName}" e todos os seus dados?`
      )
    ) {
      return;
    }

    setLoadingId(`del-${storeId}`);
    setFeedback(null);
    try {
      await masterDeleteStore({ storeId });
      setFeedback({ type: 'success', text: `Loja "${storeName}" removida com sucesso.` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Erro ao excluir loja.' });
    } finally {
      setLoadingId(null);
    }
  };

  const filteredStores = stores.filter((s) => {
    const status = s.subscription?.status || 'trial';
    if (filterStatus !== 'all' && status !== filterStatus) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchName = s.name.toLowerCase().includes(q);
    const matchUser = s.users.some(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.phoneWhatsapp && u.phoneWhatsapp.includes(q))
    );
    return matchName || matchUser;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* HEADER MASTER */}
      <div className="bg-gradient-to-r from-slate-900 via-[#122b20] to-emerald-950 rounded-2xl p-6 text-white shadow-lg border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Painel Master — Artos Consultoria
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  🔒 Visão Exclusiva do Proprietário
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Gerencie todas as lojas cadastradas, acompanhe testes do Instagram, fale no WhatsApp e libere assinaturas.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2.5 text-right shrink-0">
            <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block">
              Administrador Master
            </span>
            <span className="text-xs font-mono text-white font-semibold">{masterEmail}</span>
          </div>
        </div>
      </div>

      {/* FEEDBACK */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-bold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-xs underline ml-4">
            Fechar
          </button>
        </div>
      )}

      {/* KPIS EXECUTIVOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total de Lojas</span>
            <Store className="w-4 h-4 text-slate-700" />
          </div>
          <p className="text-3xl font-black text-slate-900">{totalStores}</p>
          <p className="text-xs text-slate-500 mt-1">Supermercados e mercearias no banco</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Em Teste Grátis (7 Dias)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600">{trialStores}</p>
          <p className="text-xs text-slate-500 mt-1">Leads testando o aplicativo</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Assinaturas Ativas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{activeStores}</p>
          <p className="text-xs text-slate-500 mt-1">Lojas com plano pago liberado</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Receita Mensal (MRR)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            R$ {estimatedMrr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Equivalente mensal das lojas ativas</p>
        </div>
      </div>

      {/* BARRA DE BUSCA E FILTRO */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar loja, e-mail ou WhatsApp..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: `Todas (${totalStores})` },
            { id: 'trial', label: `Em Teste (${trialStores})` },
            { id: 'active', label: `Ativas (${activeStores})` },
            { id: 'suspended', label: 'Suspensas' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE LOJAS */}
      <div className="space-y-4">
        {filteredStores.map((store) => {
          const sub = store.subscription;
          const status = sub?.status || 'trial';
          const trialDays = getTrialDaysLeft(store);
          const adminUser = store.users.find((u) => u.role === 'admin') || store.users[0];
          const whatsappDigits = adminUser?.phoneWhatsapp?.replace(/\D/g, '') || '';
          const whatsappUrl = whatsappDigits
            ? `https://wa.me/${whatsappDigits.startsWith('55') ? whatsappDigits : `55${whatsappDigits}`}?text=${encodeURIComponent(
                `Olá! Aqui é o Luiz da Artos Consultoria. Vi que você cadastrou a loja "${store.name}" no nosso Controle de Validades! Posso te ajudar na configuração inicial?`
              )}`
            : null;
          const isOwnStore = store.id === masterStoreId;
          const createdDate = store.createdAt
            ? new Date(store.createdAt).toLocaleDateString('pt-BR')
            : '-';

          return (
            <div
              key={store.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Coluna 1: Identificação da Loja e Contato */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-black text-slate-900">{store.name}</h3>
                    {isOwnStore && (
                      <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Sua Loja Matriz
                      </span>
                    )}

                    {status === 'active' ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Ativo — {sub?.planName || 'Plano Assinado'}
                      </span>
                    ) : status === 'suspended' ? (
                      <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                        Suspenso / Bloqueado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Teste Grátis ({trialDays ?? 7} {trialDays === 1 ? 'dia restante' : 'dias restantes'})
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <strong>E-mail:</strong> {adminUser?.email || 'Não informado'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Cadastro:</strong> {createdDate}
                    </span>
                    {whatsappUrl ? (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-800 border border-[#25D366]/30 px-2.5 py-1 rounded-lg font-bold transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                        Chamar no WhatsApp ({adminUser?.phoneWhatsapp})
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Sem WhatsApp cadastrado</span>
                    )}
                  </div>
                </div>

                {/* Coluna 2: Termômetro de Uso da Loja */}
                <div className="grid grid-cols-3 gap-2.5 sm:w-auto shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-center px-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Usuários</span>
                    <span className="text-sm font-black text-slate-800">
                      {store._count.users} / {sub?.maxUsers || 4}
                    </span>
                  </div>
                  <div className="text-center px-2 border-x border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Produtos</span>
                    <span className="text-sm font-black text-slate-800">{store._count.products}</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Coletas</span>
                    <span className="text-sm font-black text-emerald-700">{store._count.collections}</span>
                  </div>
                </div>

                {/* Coluna 3: Botões de Comando Master */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={loadingId !== null}
                    onClick={() => handlePlanAction(store.id, store.name, 'activate_mensal')}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    Liberar Mensal (1 Usu.)
                  </button>

                  <button
                    type="button"
                    disabled={loadingId !== null}
                    onClick={() => handlePlanAction(store.id, store.name, 'activate_anual')}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    Liberar Anual (5 Usu.)
                  </button>

                  <button
                    type="button"
                    disabled={loadingId !== null}
                    onClick={() => handlePlanAction(store.id, store.name, 'extend_trial_7d')}
                    className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    +7 Dias Teste
                  </button>

                  {adminUser && (
                    <button
                      type="button"
                      disabled={loadingId !== null}
                      onClick={() => handleResetPassword(adminUser.id, adminUser.email, store.name)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                      title="Redefinir senha do cliente"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                  )}

                  {!isOwnStore && (
                    <>
                      <button
                        type="button"
                        disabled={loadingId !== null}
                        onClick={() => handlePlanAction(store.id, store.name, 'suspend')}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                        title="Suspender / Bloquear acesso da loja"
                      >
                        <Ban className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={loadingId !== null}
                        onClick={() => handleDeleteStore(store.id, store.name)}
                        className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors"
                        title="Excluir loja"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

