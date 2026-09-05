import React from 'react';
import { prisma } from '@/lib/prisma';
import { Search, Download, Filter } from 'lucide-react';

export default async function RelatoriosPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { expirationDate: 'asc' },
    include: { product: { include: { department: true } } }
  });

  const now = new Date();
  
  // Helper to determine status color
  const getStatusColor = (date: Date) => {
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'bg-red-100 text-red-700'; // Expired
    if (diffDays <= 30) return 'bg-orange-100 text-orange-700'; // Near
    return 'bg-green-100 text-green-700'; // Ok
  };

  const getStatusLabel = (date: Date) => {
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Vencido';
    if (diffDays <= 30) return `${diffDays} dias`;
    return 'OK';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Relatório de Validades</h2>
          <p className="text-sm text-slate-500">Acompanhe todos os itens coletados</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filtros
          </button>
          <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Departamento</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Lote</th>
                <th className="px-6 py-4">Qtde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {collections.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma coleta registrada para exibir no relatório.
                  </td>
                </tr>
              )}
              {collections.map(col => {
                const colorClass = getStatusColor(col.expirationDate);
                const label = getStatusLabel(col.expirationDate);
                
                return (
                  <tr key={col.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colorClass}`}>
                        {label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{col.product?.description || '---'}</p>
                      <p className="text-xs text-slate-500 font-mono">{col.product?.barcode || '---'}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {col.product?.department?.name || '---'}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {col.expirationDate.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {col.batch || '-'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {col.quantity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
