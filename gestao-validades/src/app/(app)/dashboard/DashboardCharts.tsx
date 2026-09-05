'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface DashboardChartsProps {
  evolutionData: { name: string; Insercoes: number; Perdas: number; topInsercoesList?: string[]; topPerdasList?: string[] }[];
  deptoData: { name: string; perdas: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-xl text-sm z-50 min-w-[280px]">
        <p className="font-bold text-slate-800 mb-3 border-b pb-2">{label}</p>
        <div className="flex flex-col gap-4">
          {/* Insercoes */}
          <div>
            <p className="text-[#128C7E] font-bold mb-1 flex justify-between">
              <span>Inserções</span>
              <span>{data.Insercoes}</span>
            </p>
            {data.topInsercoesList && data.topInsercoesList.length > 0 ? (
              <ul className="text-slate-600 text-xs list-disc list-inside space-y-1">
                {data.topInsercoesList.map((item: string, i: number) => (
                  <li key={i} className="truncate max-w-[320px]" title={item}>{item}</li>
                ))}
                {data.Insercoes > 10 && <li className="text-slate-400 list-none text-[10px] mt-1 italic">... e mais {data.Insercoes - 10} itens</li>}
              </ul>
            ) : (
              <p className="text-slate-400 text-xs italic">Nenhuma inserção</p>
            )}
          </div>
          
          {/* Perdas */}
          <div>
            <p className="text-[#ef4444] font-bold mb-1 flex justify-between">
              <span>Perdas</span>
              <span>{data.Perdas}</span>
            </p>
            {data.topPerdasList && data.topPerdasList.length > 0 ? (
              <ul className="text-slate-600 text-xs list-disc list-inside space-y-1">
                {data.topPerdasList.map((item: string, i: number) => (
                  <li key={i} className="truncate max-w-[320px]" title={item}>{item}</li>
                ))}
                {data.Perdas > 10 && <li className="text-slate-400 list-none text-[10px] mt-1 italic">... e mais {data.Perdas - 10} itens</li>}
              </ul>
            ) : (
              <p className="text-slate-400 text-xs italic">Nenhuma perda</p>
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
    <div className="space-y-4">
      {/* Evolution Chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Evolução Diária (Últimos 7 dias)</h3>
          <select className="text-sm border-slate-200 rounded-lg text-slate-600 focus:ring-primary">
            <option>Esta Semana</option>
            <option>Este Mês</option>
          </select>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInsercoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#128C7E" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#128C7E" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPerdas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              <Area type="monotone" dataKey="Insercoes" stroke="#128C7E" strokeWidth={2} fillOpacity={1} fill="url(#colorInsercoes)" />
              <Area type="monotone" dataKey="Perdas" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorPerdas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <h3 className="font-bold text-slate-800 mb-4">Top Perdas por Departamento (30 dias)</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptoData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
              <Bar dataKey="perdas" fill="#E65100" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
