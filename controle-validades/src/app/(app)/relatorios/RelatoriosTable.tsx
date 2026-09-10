'use client';

import React, { useState } from 'react';
import ExportButtons, { ExportData } from './ExportButtons';
import { updateCollectionPrice } from './actions';

interface RelatoriosTableProps {
  initialData: ExportData[];
}

export default function RelatoriosTable({ initialData }: RelatoriosTableProps) {
  const [data, setData] = useState<ExportData[]>(initialData);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handlePriceChange = (id: string, newPrice: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, priceChange: newPrice } : item));
  };

  const handleSavePrice = async (id: string, newPrice: string) => {
    try {
      setSavingId(id);
      await updateCollectionPrice(id, newPrice);
    } catch (error) {
      console.error('Failed to save price', error);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <div className="flex gap-3 items-center">
        <ExportButtons data={data} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden w-full mt-6">
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
                <th className="px-6 py-4 min-w-[150px]">Alteração de Preço</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma coleta encontrada para este filtro.
                  </td>
                </tr>
              )}
              {data.map(row => {
                let colorClass = 'bg-green-100 text-green-700';
                if (row.statusLabel === 'Vencido') {
                  colorClass = 'bg-red-100 text-red-700';
                } else if (row.statusLabel !== 'OK') {
                  colorClass = 'bg-orange-100 text-orange-700';
                }

                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colorClass}`}>
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{row.productDesc}</p>
                      <p className="text-xs text-slate-500 font-mono">{row.barcode}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {row.department}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {row.expirationStr}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {row.batch}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {row.quantity}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">R$</span>
                        <input 
                          type="text" 
                          className={`w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none ${savingId === row.id ? 'opacity-50' : ''}`}
                          placeholder="0,00"
                          value={row.priceChange || ''}
                          onChange={(e) => handlePriceChange(row.id, e.target.value)}
                          onBlur={(e) => handleSavePrice(row.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
