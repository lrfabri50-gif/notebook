import React from 'react';
import { prisma } from '@/lib/prisma';
import { PackageX, ScanLine, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import DashboardCharts from './DashboardCharts'; // Client component for Recharts

export default async function DashboardPage() {
  // DB Queries
  const now = new Date();
  const next30Days = new Date();
  next30Days.setDate(now.getDate() + 30);

  const [
    totalCollections,
    totalProducts,
    nearExpiration,
    expired
  ] = await Promise.all([
    prisma.collection.count(),
    prisma.product.count(),
    prisma.collection.count({
      where: {
        expirationDate: {
          gt: now,
          lte: next30Days
        },
        status: { not: 'collected' }
      }
    }),
    prisma.collection.count({
      where: {
        expirationDate: { lte: now },
        status: { not: 'collected' }
      }
    })
  ]);

  const recentCollections = await prisma.collection.findMany({
    take: 5,
    orderBy: { collectedAt: 'desc' },
    include: { product: { include: { department: true } } }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500 text-sm">Visão geral do controle de validades</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <ScanLine className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{totalCollections}</h3>
            <p className="text-sm text-slate-500 font-medium">Coletas Realizadas</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{nearExpiration}</h3>
            <p className="text-sm text-slate-500 font-medium">Vencem em 30 dias</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <PackageX className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{expired}</h3>
            <p className="text-sm text-slate-500 font-medium">Produtos Vencidos</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{totalProducts}</h3>
            <p className="text-sm text-slate-500 font-medium">Produtos Cadastrados</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts area */}
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-primary" /> Últimas Coletas
              </h3>
            </div>
            <div className="space-y-4">
              {recentCollections.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Nenhuma coleta registrada ainda.</p>
              ) : (
                recentCollections.map(col => (
                  <div key={col.id} className="flex justify-between items-center pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{col.product?.description || 'Desconhecido'}</p>
                      <p className="text-xs text-slate-500">Vence em: {col.expirationDate.toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        Qtde: {col.quantity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
