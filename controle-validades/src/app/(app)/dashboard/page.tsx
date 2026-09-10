import React from 'react';
import { prisma } from '@/lib/prisma';
import { CalendarClock, ShieldCheck, ArrowRight, BadgePercent, AlarmClock, Ban, ClipboardCheck } from 'lucide-react';
import DashboardCharts from './DashboardCharts';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || !session.storeId) {
    redirect('/login');
  }

  if (session.role === 'operator') {
    redirect('/coletar');
  }

  const storeId = session.storeId as string;

  const now = new Date();
  
  // KPI dates
  const next15Days = new Date();
  next15Days.setDate(now.getDate() + 15);
  
  const next30Days = new Date();
  next30Days.setDate(now.getDate() + 30);
  
  const last7Days = new Date();
  last7Days.setDate(now.getDate() - 7);

  const [
    totalCollections,
    ofertaGreen, // > 15 days
    expiringYellow, // <= 15 days, > 0 days
    expiredRed, // <= 0 days
    collectionsLast7Days,
    coletasHoje,
    totalProdutos,
    imediateActions // Top 5
  ] = await Promise.all([
    prisma.collection.count({ where: { storeId } }),
    prisma.collection.count({
      where: {
        storeId,
        expirationDate: { gt: next15Days, lte: next30Days },
        status: { not: 'collected' }
      }
    }),
    prisma.collection.count({
      where: {
        storeId,
        expirationDate: { gt: now, lte: next15Days },
        status: { not: 'collected' }
      }
    }),
    prisma.collection.count({
      where: {
        storeId,
        expirationDate: { lte: now },
        status: { not: 'collected' }
      }
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
        collectedAt: { gte: new Date(now.setHours(0, 0, 0, 0)) }
      }
    }),
    prisma.product.count({ where: { storeId } }),
    prisma.collection.findMany({
      where: {
        storeId,
        status: { not: 'collected' },
        expirationDate: { gt: now }
      },
      include: { product: { include: { department: true } } },
      orderBy: { expirationDate: 'asc' },
      take: 5
    })
  ]);

  // Unique products covered
  const coveredProductsResult = await prisma.collection.groupBy({
    by: ['productId'],
    where: { storeId }
  });
  const coveredProductsCount = coveredProductsResult.length;
  const coveragePercent = totalProdutos > 0 ? Math.round((coveredProductsCount / totalProdutos) * 100) : 0;

  // Build Evolution Data (Last 7 Days)
  const evolutionMap = new Map<string, { Insercoes: number, Perdas: number, topInsercoesList: string[], topPerdasList: string[] }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dayStr = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    evolutionMap.set(dayStr, { Insercoes: 0, Perdas: 0, topInsercoesList: [], topPerdasList: [] });
  }

  collectionsLast7Days.forEach(c => {
    if (!c.collectedAt) return;
    const dayStr = c.collectedAt.toLocaleDateString('pt-BR', { weekday: 'short' });
    if (evolutionMap.has(dayStr)) {
      const isLoss = c.expirationDate <= now;
      const data = evolutionMap.get(dayStr)!;
      const prodName = c.product?.description || 'Desconhecido';
      
      data.Insercoes += 1;
      if (data.topInsercoesList.length < 10) {
        data.topInsercoesList.push(prodName);
      }

      if (isLoss) {
        data.Perdas += 1;
        if (data.topPerdasList.length < 10) {
          data.topPerdasList.push(`${prodName} - Qtd: ${c.quantity}`);
        }
      }
    }
  });
  
  const evolutionData = Array.from(evolutionMap.entries()).map(([name, data]) => ({
    name,
    Insercoes: data.Insercoes,
    Perdas: data.Perdas,
    topInsercoesList: data.topInsercoesList,
    topPerdasList: data.topPerdasList
  }));

  // Build Product Loss Data (Top 5 perdas by Product in DB history)
  const expiredCollections = await prisma.collection.findMany({
    where: { 
      storeId,
      expirationDate: { lte: now } 
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
    <div className="space-y-6">

      {/* TOP ROW: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Link href="/relatorios?filter=expiring_30" className="bg-gradient-to-br from-green-50 to-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-green-700 font-semibold mb-1">À Recuperar (30 dias)</p>
              <h3 className="text-3xl font-black text-green-900 tracking-tight">{ofertaGreen}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-100/50 text-green-600 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <BadgePercent className="w-5 h-5" />
            </div>
          </div>
        </Link>

        <Link href="/relatorios?filter=expiring_15" className="bg-gradient-to-br from-yellow-50 to-white p-5 rounded-2xl border border-yellow-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-yellow-700 font-semibold mb-1">Vencem em (15 dias)</p>
              <h3 className="text-3xl font-black text-yellow-900 tracking-tight">{expiringYellow}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-100/50 text-yellow-600 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <AlarmClock className="w-5 h-5" />
            </div>
          </div>
        </Link>

        <Link href="/relatorios?filter=expired" className="bg-gradient-to-br from-red-50 to-white p-5 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-red-700 font-semibold mb-1">Vencidos</p>
              <h3 className="text-3xl font-black text-red-900 tracking-tight">{expiredRed}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-100/50 text-red-600 flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <Ban className="w-5 h-5" />
            </div>
          </div>
        </Link>

        <Link href="/relatorios?filter=all" className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-blue-700 font-semibold mb-1">Coletas de Hoje</p>
              <h3 className="text-3xl font-black text-blue-900 tracking-tight">{coletasHoje}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100/50 text-blue-600 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
        </Link>

      </div>

      {/* MIDDLE ROW: Charts */}
      <DashboardCharts evolutionData={evolutionData} deptoData={deptoData} />

      {/* BOTTOM ROW: Actionable & Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ação Imediata */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-orange-500" /> Ação Imediata
            </h3>
            <span className="text-[10px] font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Próximos 5 vencimentos</span>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
            {imediateActions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-1">
                <ShieldCheck className="w-10 h-10 text-slate-200" />
                <p className="text-sm">Nenhum vencimento próximo. Tudo seguro!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {imediateActions.map((col: any) => {
                  const daysLeft = Math.ceil((col.expirationDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                  return (
                    <div key={col.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-lg px-2 -mx-2">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${daysLeft <= 15 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          <span className="text-[9px] uppercase font-bold opacity-70">Dias</span>
                          <span className="text-base font-black leading-none">{daysLeft}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm line-clamp-1">{col.product?.description}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">{col.product?.department?.name || 'Sem Depto'}</span>
                            {col.shelfLocation && <span>Local: <strong>{col.shelfLocation}</strong></span>}
                            <span>Lote: <strong>{col.batch || 'N/A'}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                         <span className="block text-[10px] text-slate-400 mb-0.5">Estoque</span>
                         <span className="font-bold text-slate-700 text-sm">{col.quantity} un</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {imediateActions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-center shrink-0">
              <Link href="/relatorios" className="text-primary hover:text-primary-hover text-xs font-semibold flex items-center justify-center gap-1">
                Ver Relatório Completo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Cobertura de Prevenção */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden h-[320px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          
          <h3 className="font-bold text-slate-800 text-base mb-1">Cobertura de Validades</h3>
          <p className="text-xs text-slate-500 mb-6">Produtos rastreados vs Total cadastrado</p>

          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            {/* SVG Donut Chart */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="text-indigo-500 drop-shadow-sm transition-all duration-1000 ease-out"
                strokeDasharray={`${coveragePercent}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800">{coveragePercent}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-[200px] border-t border-slate-100 pt-4 mt-auto">
            <div>
              <p className="text-xs text-slate-400 font-medium">Mapeados</p>
              <p className="font-bold text-indigo-600 text-lg leading-tight">{coveredProductsCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Faltando</p>
              <p className="font-bold text-slate-600 text-lg leading-tight">{totalProdutos - coveredProductsCount}</p>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER LOGO */}
      <div className="flex flex-col items-center justify-center pt-6 pb-2 gap-2">
        <div className="w-40 flex items-center justify-center">
          <img src="/logo-empresa.png?v=2" alt="Logo Empresa" className="w-full h-auto object-contain" />
        </div>
        <span className="text-[10px] text-slate-400 text-center px-4 leading-tight whitespace-nowrap mt-1">
          &copy; 2026 Artos Consultoria Empresarial. Todos os direitos reservados.
        </span>
      </div>

    </div>
  );
}
