import React from 'react';
import { prisma } from '@/lib/prisma';
import { 
  ShieldCheck, 
  ArrowRight, 
  Coins, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Smartphone,
  CheckCircle2,
  CalendarCheck2
} from 'lucide-react';
import DashboardCharts from './DashboardCharts';
import DepartmentHealthCards, { DepartmentHealth } from './DepartmentHealthCards';
import TimelineDecisionMatrix, { TimelineItem } from './TimelineDecisionMatrix';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getEvolutionDataByRange } from './actions';

function parseItemPrice(tagPrice: string | null | undefined, priceChange?: string | null | undefined): number {
  // O Preço da Etiqueta fixado pelo auxiliar tem prioridade (valor da gôndola), seguido de priceChange
  const priceToUse = tagPrice || priceChange;
  if (!priceToUse) return 12.50; // Estimativa de segurança apenas se nenhum preço de etiqueta foi informado
  const clean = priceToUse.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) || parsed <= 0 ? 12.50 : parsed;
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || !session.storeId) {
    redirect('/login');
  }
  const storeId = session.storeId as string;

  // Normalizar data para o fuso horário de Brasília
  const nowRaw = new Date();
  const spDateString = nowRaw.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
  const spDate = new Date(spDateString);
  const todayUTC = new Date(Date.UTC(spDate.getFullYear(), spDate.getMonth(), spDate.getDate()));
  
  // Datas de corte
  const next3Days = new Date(todayUTC);
  next3Days.setUTCDate(todayUTC.getUTCDate() + 3);

  const next7Days = new Date(todayUTC);
  next7Days.setUTCDate(todayUTC.getUTCDate() + 7);

  const next15Days = new Date(todayUTC);
  next15Days.setUTCDate(todayUTC.getUTCDate() + 15);
  
  const next30Days = new Date(todayUTC);
  next30Days.setUTCDate(todayUTC.getUTCDate() + 30);
  
  const last7Days = new Date(todayUTC);
  last7Days.setUTCDate(todayUTC.getUTCDate() - 7);

  // Consultas principais
  const [
    totalProdutos,
    activeCollections,
    collectionsLast7Days,
    coletasHoje,
    departmentsRaw,
    storeData
  ] = await Promise.all([
    prisma.product.count({ where: { storeId } }),
    prisma.collection.findMany({
      where: {
        storeId,
        status: { not: 'collected' }
      },
      include: {
        product: {
          include: { department: true }
        }
      },
      orderBy: { expirationDate: 'asc' }
    }),
    prisma.collection.findMany({
      where: { 
        storeId,
        collectedAt: { gte: last7Days } 
      },
      include: { product: { include: { department: true } } }
    }),
    prisma.collection.count({
      where: {
        storeId,
        collectedAt: { gte: todayUTC }
      }
    }),
    prisma.department.findMany({
      where: { storeId },
      include: {
        products: {
          include: {
            collections: {
              where: {
                storeId,
                status: { not: 'collected' }
              }
            }
          }
        }
      }
    }),
    prisma.store.findUnique({
      where: { id: storeId },
      select: { name: true }
    })
  ]);

  // Unique products covered
  const coveredProductsResult = await prisma.collection.groupBy({
    by: ['productId'],
    where: { storeId }
  });
  const coveredProductsCount = coveredProductsResult.length;
  const coveragePercent = totalProdutos > 0 ? Math.round((coveredProductsCount / totalProdutos) * 100) : 0;

  // Separação em Buckets da Matriz de Decisão e Cálculos Financeiros
  const expiredOrTodayList: TimelineItem[] = [];
  const threeDaysList: TimelineItem[] = [];
  const fourToSevenDaysList: TimelineItem[] = [];
  const eightToFifteenDaysList: TimelineItem[] = [];
  const thirtyDaysList: TimelineItem[] = [];

  let valorRiscoImediato = 0;
  let valorRiscoRecuperavel = 0;
  let valorMonitorado = 0;
  let totalItensAtivos = 0;

  activeCollections.forEach(c => {
    const expDate = new Date(c.expirationDate);
    expDate.setUTCHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((expDate.getTime() - todayUTC.getTime()) / (1000 * 3600 * 24));
    
    const unitPrice = parseItemPrice((c as any).tagPrice, c.priceChange);
    const itemTotalRisk = c.quantity * unitPrice;
    totalItensAtivos += c.quantity;

    const timelineItem: TimelineItem = {
      id: c.id,
      daysLeft,
      productDescription: c.product?.description || 'Produto sem descrição',
      barcode: c.product?.barcode || 'S/N',
      departmentName: c.product?.department?.name || 'Geral',
      shelfLocation: c.shelfLocation,
      batch: c.batch,
      quantity: c.quantity,
      expirationFormatted: expDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
      priceChange: c.priceChange,
      tagPrice: (c as any).tagPrice || null,
      estimatedRisk: itemTotalRisk
    };

    if (daysLeft <= 0) {
      expiredOrTodayList.push(timelineItem);
      valorRiscoImediato += itemTotalRisk;
    } else if (daysLeft >= 1 && daysLeft <= 3) {
      threeDaysList.push(timelineItem);
      valorRiscoRecuperavel += itemTotalRisk;
    } else if (daysLeft >= 4 && daysLeft <= 7) {
      fourToSevenDaysList.push(timelineItem);
      valorRiscoRecuperavel += itemTotalRisk;
    } else if (daysLeft >= 8 && daysLeft <= 15) {
      eightToFifteenDaysList.push(timelineItem);
      valorRiscoRecuperavel += itemTotalRisk;
    } else if (daysLeft <= 30) {
      thirtyDaysList.push(timelineItem);
      valorMonitorado += itemTotalRisk;
    }
  });


  // Processamento do Raio-X por Departamentos
  const departmentHealthData: DepartmentHealth[] = departmentsRaw.map(dept => {
    let totalItems = 0;
    let criticalCount = 0;
    let criticalQty = 0;
    let financialRisk = 0;

    dept.products.forEach(prod => {
      prod.collections.forEach(col => {
        const exp = new Date(col.expirationDate);
        exp.setUTCHours(0, 0, 0, 0);
        const days = Math.ceil((exp.getTime() - todayUTC.getTime()) / (1000 * 3600 * 24));
        totalItems += col.quantity;

        if (days <= 15) {
          criticalCount += 1;
          criticalQty += col.quantity;
          financialRisk += col.quantity * parseItemPrice((col as any).tagPrice, col.priceChange);
        }
      });
    });

    const healthScore = totalItems > 0
      ? Math.max(0, Math.min(100, Math.round(((totalItems - criticalQty) / totalItems) * 100)))
      : 100;

    return {
      id: dept.id,
      name: dept.name,
      totalProducts: dept.products.length,
      totalItems,
      criticalCount,
      healthScore,
      financialRisk
    };
  }).sort((a, b) => a.healthScore - b.healthScore); // Menor saúde primeiro para destacar ação

  // Evolução Inicial dos Últimos 7 Dias (Inserções vs Vencimentos)
  const endFormattedDate = todayUTC.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  const startFormattedDate = last7Days.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  const evolutionData = await getEvolutionDataByRange(startFormattedDate, endFormattedDate);

  // Top 5 Produtos com Maior Perda (Histórico)
  const expiredCollections = await prisma.collection.findMany({
    where: { 
      storeId,
      expirationDate: { lte: todayUTC } 
    },
    include: { product: true }
  });

  const productLossMap = new Map<string, { count: number; qtd: number }>();
  expiredCollections.forEach(c => {
    const productName = c.product?.description || 'Desconhecido';
    const qtd = c.quantity || 0;
    const existing = productLossMap.get(productName) || { count: 0, qtd: 0 };
    productLossMap.set(productName, {
      count: existing.count + 1,
      qtd: existing.qtd + qtd
    });
  });

  const deptoData = Array.from(productLossMap.entries())
    .map(([name, data]) => ({ name, perdas: data.count, quantidade: data.qtd }))
    .sort((a, b) => b.perdas - a.perdas)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-10">

      {/* TOP HEADER EXECUTIVO ARTOS - SLIM COMPACT */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl px-5 py-3.5 sm:px-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
              <h1 className="text-base font-black tracking-tight text-white whitespace-nowrap">
                {storeData?.name || 'Loja Matriz'}
              </h1>
              <span className="text-emerald-400/80 font-bold hidden sm:inline">—</span>
              <p className="text-xs text-slate-300">
                Monitoramento financeiro e preventivo em tempo real. Identifique riscos antes que se tornem perdas de caixa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/coletar"
              className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl shadow-md transition-all text-xs"
            >
              <CalendarCheck2 className="w-3.5 h-3.5" /> Nova Coleta
            </Link>
            <Link
              href="/relatorios"
              className="inline-flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 px-3.5 py-2 rounded-xl transition-all text-xs font-semibold"
            >
              Relatório Completo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 CARDS FINANCEIROS & MÉTRICAS EXECUTIVAS ARTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Perda / Quebra por Valor de Venda */}
        <Link 
          href="/relatorios?filter=expired" 
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-rose-300 transition-all group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-800 block leading-tight">
                Perda / Quebra
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block tracking-wide uppercase mt-0.5 mb-1.5">
                Por Valor de Venda
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                R$ {valorRiscoImediato.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              <strong className="text-rose-700 font-black">{expiredOrTodayList.length}</strong> itens já vencidos
            </span>
            <span className="text-[11px] text-rose-700 font-bold group-hover:underline flex items-center gap-0.5">
              Ver Vencidos <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Card 2: R$ em Risco a Recuperar */}
        <Link 
          href="/relatorios?filter=expiring_15" 
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-800 block leading-tight">
                Risco a Recuperar
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block tracking-wide uppercase mt-0.5 mb-1.5">
                Vencem em até 15 dias
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
                R$ {valorRiscoRecuperavel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              <strong className="text-amber-800 font-black">{threeDaysList.length + fourToSevenDaysList.length + eightToFifteenDaysList.length}</strong> itens para queima
            </span>
            <span className="text-[11px] text-amber-800 font-bold group-hover:underline flex items-center gap-0.5">
              Criar Oferta <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Card 3: R$ Sob Monitoramento Seguro */}
        <Link 
          href="/relatorios?filter=expiring_30" 
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-800 block leading-tight">
                Prevenção Futura
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block tracking-wide uppercase mt-0.5 mb-1.5">
                Monitorados em 30 dias
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
                R$ {valorMonitorado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              <strong className="text-emerald-800 font-bold">{thirtyDaysList.length}</strong> {thirtyDaysList.length === 1 ? 'lote em 30 dias' : 'lotes em 30 dias'}
            </span>
            <span className="text-[11px] text-emerald-800 font-bold group-hover:underline flex items-center gap-0.5">
              Ver lista <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Card 4: Auditoria e Cobertura da Loja */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-800 block leading-tight">
                Auditoria da Loja
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block tracking-wide uppercase mt-0.5 mb-1.5">
                Cobertura de Validades
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {coveragePercent}%
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${coveragePercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span><strong>{activeCollections.length}</strong> coletas ({expiredOrTodayList.length} {expiredOrTodayList.length === 1 ? 'produto vencido' : 'produtos vencidos'})</span>
              <span className="font-bold text-slate-700">{coletasHoje} hoje</span>
            </div>
          </div>
        </div>

      </div>

      {/* WHATSAPP AUTOMATION PILL BANNER */}
      <div className="bg-emerald-950 border border-emerald-800/80 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h4 className="text-sm font-bold text-white">Automação de Alertas WhatsApp Artos</h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Ativo
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Notificações diárias enviadas diretamente aos operadores com antecedência de 3 dias para queima de estoque.
            </p>
          </div>
        </div>

        <Link
          href="/usuarios"
          className="shrink-0 text-xs font-bold bg-white text-emerald-950 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          Gerenciar Destinatários
        </Link>
      </div>

      {/* TIMELINE DECISION MATRIX (AÇÕES RÁPIDAS & PRECIFICAÇÃO) */}
      <TimelineDecisionMatrix
        expiredOrToday={expiredOrTodayList}
        threeDays={threeDaysList}
        fourToSevenDays={fourToSevenDaysList}
        eightToFifteenDays={eightToFifteenDaysList}
      />

      {/* RAIO-X POR DEPARTAMENTOS */}
      <DepartmentHealthCards departments={departmentHealthData} />

      {/* GRÁFICOS EXECUTIVOS ARTOS */}
      <div className="hidden md:block">
        <DashboardCharts 
          evolutionData={evolutionData} 
          initialStartDate={startFormattedDate}
          initialEndDate={endFormattedDate}
          deptoData={deptoData} 
        />
      </div>

      {/* FOOTER ARTOS COM A LOGO DA EMPRESA */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4 gap-2">
        <div className="w-44 flex items-center justify-center">
          <img src="/logo-empresa.png?v=3" alt="Logo Artos Consultoria" className="w-full h-auto object-contain" />
        </div>
        <span className="text-[11px] text-slate-400 text-center px-4 leading-tight whitespace-nowrap mt-1 font-medium">
          &copy; 2026 Artos Consultoria Empresarial. Sistema de Prevenção de Perdas e Validades.
        </span>
      </div>

    </div>
  );
}
