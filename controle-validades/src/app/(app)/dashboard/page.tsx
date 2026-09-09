import React from 'react';
import { prisma } from '@/lib/prisma';
import { PackageX, ScanLine, AlertTriangle, Tag, CalendarClock, ShieldCheck, ArrowRight } from 'lucide-react';
import DashboardCharts from './DashboardCharts';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || !session.storeId) {
    redirect('/login');
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

  // Build Depto Data (Top 5 perdas by Depto in DB history)
  const expiredCollections = await prisma.collection.findMany({
    where: { 
      storeId,
      expirationDate: { lte: now } 
    },
    include: { product: { include: { department: true } } }
  });

  const deptoMap = new Map<string, number>();
  expiredCollections.forEach(c => {
    const deptName = c.product?.department?.name || 'Sem Depto';
    deptoMap.set(deptName, (deptoMap.get(deptName) || 0) + 1);
  });

  const deptoData = Array.from(deptoMap.entries())
    .map(([name, perdas]) => ({ name, perdas }))
    .sort((a, b) => b.perdas - a.perdas)
    .slice(0, 5);

  return (
    <div className="space-y-4">

      {/* TOP ROW: KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Link href="/relatorios?filter=expiring_30" className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] text-green-700 font-semibold mb-0.5">À Recuperar (30d)</p>
              <h3 className="text-2xl font-black text-green-900 tracking-tight">{ofertaGreen}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-green-100/50 text-green-600 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Tag className="w-4 h-4" />
            </div>
          </div>
        </Link>

        <Link href="/relatorios?filter=expiring_15" className="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-xl border border-yellow-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] text-yellow-700 font-semibold mb-0.5">Vencem em 15d</p>
              <h3 className="text-2xl font-black text-yellow-900 tracking-tight">{expiringYellow}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-yellow-100/50 text-yellow-600 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </Link>

        <Link href="/relatorios?filter=expired" className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] text-red-700 font-semibold mb-0.5">Vencidos</p>
              <h3 className="text-2xl font-black text-red-900 tracking-tight">{expiredRed}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-100/50 text-red-600 flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <PackageX className="w-4 h-4" />
            </div>
          </div>
        </Link>

        <Link href="/relatorios?filter=all" className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] text-blue-700 font-semibold mb-0.5">Coletas de Hoje</p>
              <h3 className="text-2xl font-black text-blue-900 tracking-tight">{coletasHoje}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-100/50 text-blue-600 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <ScanLine className="w-4 h-4" />
            </div>
          </div>
        </Link>

      </div>

      {/* MIDDLE ROW: Charts */}
      <DashboardCharts evolutionData={evolutionData} deptoData={deptoData} />

      {/* BOTTOM ROW: Actionable & Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Ação Imediata */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 flex flex-col h-[210px]">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-orange-500" /> Ação Imediata
            </h3>
            <span className="text-[9px] font-medium bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Próximos 5 vencimentos</span>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
            {imediateActions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-1">
                <ShieldCheck className="w-8 h-8 text-slate-200" />
                <p className="text-xs">Nenhum vencimento próximo. Tudo seguro!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {imediateActions.map((col: any) => {
                  const daysLeft = Math.ceil((col.expirationDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                  return (
                    <div key={col.id} className="py-1.5 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-lg px-1.5 -mx-1.5">
                      <div className="flex items-start gap-2">
                        <div className={`w-8 h-8 rounded-md flex flex-col items-center justify-center shrink-0 ${daysLeft <= 15 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          <span className="text-[8px] uppercase font-bold opacity-70">Dias</span>
                          <span className="text-sm font-black leading-none">{daysLeft}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[12px] line-clamp-1">{col.product?.description}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                            <span className="bg-slate-100 px-1 py-0.5 rounded">{col.product?.department?.name || 'Sem Depto'}</span>
                            {col.shelfLocation && <span>Local: <strong>{col.shelfLocation}</strong></span>}
                            <span>Lote: <strong>{col.batch || 'N/A'}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-1">
                         <span className="block text-[9px] text-slate-400 mb-0.5">Estoque</span>
                         <span className="font-bold text-slate-700 text-[12px]">{col.quantity} un</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {imediateActions.length > 0 && (
            <div className="mt-1 pt-1.5 border-t border-slate-100 text-center shrink-0">
              <Link href="/relatorios" className="text-primary hover:text-primary-hover text-[11px] font-semibold flex items-center justify-center gap-1">
                Ver Relatório Completo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Cobertura de Prevenção */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 flex flex-col items-center justify-center text-center relative overflow-hidden h-[210px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          
          <h3 className="font-bold text-slate-800 text-sm mb-0.5">Cobertura de Validades</h3>
          <p className="text-[10px] text-slate-500 mb-2">Produtos rastreados vs Total cadastrado</p>

          <div className="relative w-20 h-20 flex items-center justify-center mb-2">
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
              <span className="text-xl font-black text-slate-800">{coveragePercent}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-[180px] border-t border-slate-100 pt-2 mt-auto">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Mapeados</p>
              <p className="font-bold text-indigo-600 text-base leading-tight">{coveredProductsCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Faltando</p>
              <p className="font-bold text-slate-600 text-base leading-tight">{totalProdutos - coveredProductsCount}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
