import React from 'react';
import { prisma } from '@/lib/prisma';
import { PackageX, ScanLine, AlertTriangle, Tag } from 'lucide-react';
import DashboardCharts from './DashboardCharts';
import Link from 'next/link';

export default async function DashboardPage() {
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
    totalProdutos
  ] = await Promise.all([
    prisma.collection.count(),
    prisma.collection.count({
      where: {
        expirationDate: { gt: next15Days, lte: next30Days },
        status: { not: 'collected' }
      }
    }),
    prisma.collection.count({
      where: {
        expirationDate: { gt: now, lte: next15Days },
        status: { not: 'collected' }
      }
    }),
    prisma.collection.count({
      where: {
        expirationDate: { lte: now },
        status: { not: 'collected' }
      }
    }),
    prisma.collection.findMany({
      where: { collectedAt: { gte: last7Days } },
      include: { product: { include: { department: true } } }
    }),
    prisma.collection.count({
      where: {
        collectedAt: { gte: new Date(now.setHours(0, 0, 0, 0)) }
      }
    }),
    prisma.product.count()
  ]);

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
    where: { expirationDate: { lte: now } },
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
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SEMÁFORO KPI (Left Column) */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <Link href="/relatorios?filter=expiring_30" className="bg-green-50 p-3 rounded-xl border border-green-200 shadow-sm flex items-center justify-between hover:bg-green-100 hover:shadow-md transition-all cursor-pointer">
            <div>
              <h3 className="text-3xl font-bold text-green-800">{ofertaGreen}</h3>
              <p className="text-sm text-green-700 font-medium mt-0.5">Produtos à Recuperar</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-200 text-green-700 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
          </Link>

          <Link href="/relatorios?filter=expiring_15" className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 shadow-sm flex items-center justify-between hover:bg-yellow-100 hover:shadow-md transition-all cursor-pointer">
            <div>
              <h3 className="text-3xl font-bold text-yellow-800">{expiringYellow}</h3>
              <p className="text-sm text-yellow-700 font-medium mt-0.5">Vencem em 15 dias</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-200 text-yellow-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </Link>

          <Link href="/relatorios?filter=expired" className="bg-red-50 p-3 rounded-xl border border-red-200 shadow-sm flex items-center justify-between hover:bg-red-100 hover:shadow-md transition-all cursor-pointer">
            <div>
              <h3 className="text-3xl font-bold text-red-800">{expiredRed}</h3>
              <p className="text-sm text-red-700 font-medium mt-0.5">Produtos Vencidos</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-200 text-red-700 flex items-center justify-center shrink-0">
              <PackageX className="w-5 h-5" />
            </div>
          </Link>

          <Link href="/relatorios?filter=all" className="bg-blue-50 p-3 rounded-xl border border-blue-200 shadow-sm flex items-center justify-between hover:bg-blue-100 hover:shadow-md transition-all cursor-pointer">
            <div>
              <h3 className="text-3xl font-bold text-blue-800">{coletasHoje}</h3>
              <p className="text-sm text-blue-700 font-medium mt-0.5">Coletados Hoje</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <ScanLine className="w-5 h-5" />
            </div>
          </Link>

          <div className="flex flex-col items-center justify-center mt-0 gap-1 opacity-70">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-sm flex items-center justify-center">
              <img src="/logo-empresa.png" alt="Logo Empresa" className="w-full h-full object-contain" />
            </div>
            <span className="text-[10px] text-slate-400 text-center px-4 leading-tight whitespace-nowrap mt-2">
              &copy; 2026 Artos Consultoria Empresarial. Todos os direitos reservados.
            </span>
          </div>
        </div>

        {/* CHARTS (Right Column) */}
        <div className="lg:col-span-3">
          <DashboardCharts evolutionData={evolutionData} deptoData={deptoData} />
        </div>

      </div>
    </div>
  );
}
