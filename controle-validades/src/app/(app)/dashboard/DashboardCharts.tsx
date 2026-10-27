'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, AlertOctagon } from 'lucide-react';

interface DashboardChartsProps {
  evolutionData: { name: string; Insercoes: number; Perdas: number; topInsercoesList?: string[]; topPerdasList?: string[] }[];
  deptoData: { name: string; perdas: number; quantidade?: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-slate-200/90 shadow-2xl rounded-2xl text-xs z-50 min-w-[260px] space-y-3">
        <p className="font-black text-slate-900 border-b border-slate-100 pb-2 text-sm">{label}</p>
        <div className="space-y-3">
          {/* Insercoes */}
          <div>
            <p className="text-emerald-800 font-bold flex justify-between">
              <span>Novas Inserções</span>
              <span className="font-black">{data.Insercoes}</span>
            </p>
            {data.topInsercoesList && data.topInsercoesList.length > 0 ? (
              <ul className="text-slate-600 text-[11px] list-disc list-inside space-y-0.5 mt-1">
                {data.topInsercoesList.slice(0, 5).map((item: string, i: number) => (
                  <li key={i} className="truncate max-w-[240px]" title={item}>{item}</li>
                ))}
                {data.Insercoes > 5 && <li className="text-slate-400 list-none text-[10px] italic">+ {data.Insercoes - 5} outros itens</li>}
              </ul>
            ) : (
              <p className="text-slate-400 text-[11px] italic">Sem inserções</p>
            )}
          </div>
          
          {/* Perdas */}
          <div>
            <p className="text-rose-600 font-bold flex justify-between">
              <span>Itens Vencidos</span>
              <span className="font-black">{data.Perdas}</span>
            </p>
            {data.topPerdasList && data.topPerdasList.length > 0 ? (
              <ul className="text-slate-600 text-[11px] list-disc list-inside space-y-0.5 mt-1">
                {data.topPerdasList.slice(0, 5).map((item: string, i: number) => (
                  <li key={i} className="truncate max-w-[240px]" title={item}>{item}</li>
                ))}
                {data.Perdas > 5 && <li className="text-slate-400 list-none text-[10px] italic">+ {data.Perdas - 5} outros itens</li>}
              </ul>
            ) : (
              <p className="text-slate-400 text-[11px] italic">Zero perdas</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardCharts({ evolutionData, deptoData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Evolution Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col h-[340px]">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-700" /> Tendência de Rastreamento
            </h3>
            <p className="text-xs text-slate-500">Mapeamento vs Vencimentos (Últimos 7 dias)</p>
          </div>
        </div>

        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInsercoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#047857" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPerdas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={24} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              <Area type="monotone" name="Inserções" dataKey="Insercoes" stroke="#047857" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInsercoes)" />
              <Area type="monotone" name="Perdas" dataKey="Perdas" stroke="#e11d48" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPerdas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Top Ofensores */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col h-[340px]">
        <div className="mb-4 shrink-0">
          <h3 className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" /> Principais Ofensores de Validade
          </h3>
          <p className="text-xs text-slate-500">Produtos com maior frequência de vencimento no histórico</p>
        </div>

        <div className="flex-1 w-full min-h-0">
          {deptoData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs italic">
              Nenhuma perda registrada no histórico.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptoData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} width={140} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any, item: any) => {
                    const qtd = item.payload.quantidade;
                    return [`${value} ocorrências (${qtd || 0} un)`, 'Total'];
                  }}
                />
                <Bar dataKey="perdas" name="Ocorrências" fill="#0f172a" radius={[0, 8, 8, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}
