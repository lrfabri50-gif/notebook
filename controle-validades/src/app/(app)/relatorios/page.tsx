import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

import RelatoriosTable from './RelatoriosTable';
import { ExportData } from './ExportButtons';

export default async function RelatoriosPage(props: { searchParams?: Promise<{ filter?: string }> }) {
  const searchParams = await props.searchParams;
  const filter = searchParams?.filter || 'all';

  const now = new Date();
  
  // Create where clause based on filter
  let whereClause = {};
  if (filter === 'expired') {
    whereClause = { expirationDate: { lte: now } };
  } else if (filter === 'expiring_30') {
    const next15 = new Date();
    next15.setDate(now.getDate() + 15);
    const next30 = new Date();
    next30.setDate(now.getDate() + 30);
    whereClause = { expirationDate: { gt: next15, lte: next30 } };
  } else if (filter === 'expiring_15') {
    const next15 = new Date();
    next15.setDate(now.getDate() + 15);
    whereClause = { expirationDate: { gt: now, lte: next15 } };
  }

  const collections = await prisma.collection.findMany({
    where: whereClause,
    orderBy: { expirationDate: 'asc' },
    include: { product: { include: { department: true } } }
  });

  const getStatusLabel = (date: Date) => {
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Vencido';
    if (diffDays <= 30) return `${diffDays} dias`;
    return 'OK';
  };

  // Prepara dados para exportação (PDF e CSV)
  const exportData: ExportData[] = collections.map(c => ({
    id: c.id,
    statusLabel: getStatusLabel(c.expirationDate),
    productDesc: c.product?.description || '---',
    barcode: c.product?.barcode || '---',
    department: c.product?.department?.name || '---',
    expirationStr: c.expirationDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
    batch: c.batch || '-',
    quantity: c.quantity
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Relatório de Validades</h2>
          <p className="text-sm text-slate-500">
            {filter === 'expired' && 'Mostrando apenas produtos vencidos'}
            {filter === 'expiring_30' && 'Mostrando produtos à recuperar (16 a 30 dias)'}
            {filter === 'expiring_15' && 'Mostrando produtos que vencem em 15 dias'}
            {filter === 'all' && 'Acompanhe todos os itens coletados'}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2">
            <Link href="/relatorios?filter=all" className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-slate-200 text-slate-800' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              Todos
            </Link>
            <Link href="/relatorios?filter=expiring_30" className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === 'expiring_30' ? 'bg-orange-100 text-orange-800' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              30 Dias
            </Link>
            <Link href="/relatorios?filter=expiring_15" className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === 'expiring_15' ? 'bg-orange-200 text-orange-900' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              15 Dias
            </Link>
            <Link href="/relatorios?filter=expired" className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === 'expired' ? 'bg-red-100 text-red-800' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              Vencidos
            </Link>
          </div>
        </div>
      </div>

      <RelatoriosTable initialData={exportData} />
    </div>
  );
}
