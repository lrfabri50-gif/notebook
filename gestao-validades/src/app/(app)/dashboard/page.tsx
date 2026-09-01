'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const dataEvolucao = [
  { name: '01/05', incluidos: 400, recuperados: 240, perdidos: 20 },
  { name: '02/05', incluidos: 300, recuperados: 139, perdidos: 10 },
  { name: '03/05', incluidos: 200, recuperados: 980, perdidos: 40 },
  { name: '04/05', incluidos: 278, recuperados: 390, perdidos: 15 },
  { name: '05/05', incluidos: 189, recuperados: 480, perdidos: 5 },
];

const dataDeptos = [
  { name: 'Laticínios', perdas: 120 },
  { name: 'Açougue', perdas: 98 },
  { name: 'Hortifruti', perdas: 86 },
  { name: 'Padaria', perdas: 54 },
  { name: 'Bebidas', perdas: 23 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header (Desktop) */}
      <div className="hidden md:flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Visão Geral</h2>
          <p className="text-sm text-slate-500">Acompanhe as métricas da sua loja</p>
        </div>
        <div className="flex gap-3 items-center">
          <input type="date" className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700" />
          <span className="text-slate-400">até</span>
          <input type="date" className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700" />
          <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>
      </div>

      {/* Mobile Title */}
      <div className="md:hidden">
        <h2 className="text-xl font-bold text-slate-800">Loja Principal</h2>
        <p className="text-sm text-slate-500">Resumo do dia</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Vencendo Hoje / 7 Dias</p>
            <h3 className="text-3xl font-bold text-primary">124</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-primary">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Produtos Recuperados</p>
            <h3 className="text-3xl font-bold text-green-600">892</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Produtos Perdidos</p>
            <h3 className="text-3xl font-bold text-red-600">45</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Evolução Diária</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataEvolucao} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} />
                <Legend iconType="circle" />
                <Bar dataKey="incluidos" name="Incluídos" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recuperados" name="Recuperados" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="perdidos" name="Perdidos" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top 5 Departamentos (Perdas)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataDeptos} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} />
                <Bar dataKey="perdas" name="Qtd Perdas" fill="#E65100" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Top Departamentos por Volume</h3>
            <button className="text-sm text-primary font-medium hover:underline">Ver Todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Departamento</th>
                  <th className="px-4 py-3 text-right">Qtd Produtos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">Laticínios</td>
                  <td className="px-4 py-3 text-right">1,245</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">Açougue</td>
                  <td className="px-4 py-3 text-right">980</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">Hortifruti</td>
                  <td className="px-4 py-3 text-right">854</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Top Produtos Vencendo</h3>
            <button className="text-sm text-primary font-medium hover:underline">Ver Todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3 text-right">Vencimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">Iogurte Morango 1L</td>
                  <td className="px-4 py-3 text-right text-red-600 font-medium">Hoje</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">Leite Integral 1L</td>
                  <td className="px-4 py-3 text-right text-orange-500 font-medium">Amanhã</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">Queijo Mussarela Fatiado</td>
                  <td className="px-4 py-3 text-right text-slate-600">Em 3 dias</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
