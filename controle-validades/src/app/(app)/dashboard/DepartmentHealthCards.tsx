'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck, AlertTriangle, ArrowUpRight } from 'lucide-react';

export interface DepartmentHealth {
  id: string;
  name: string;
  totalProducts: number;
  totalItems: number;
  criticalCount: number; // <= 15 days
  healthScore: number; // 0 - 100%
  financialRisk: number; // in R$
}

export default function DepartmentHealthCards({ departments }: { departments: DepartmentHealth[] }) {
  if (!departments || departments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400">
        <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-medium">Nenhum departamento cadastrado com produtos ainda.</p>
        <Link href="/departamentos" className="text-xs text-emerald-700 font-bold hover:underline mt-2 inline-block">
          Cadastrar departamentos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" /> Raio-X por Departamentos
          </h3>
          <p className="text-xs text-slate-500">Índice de segurança de cada setor da loja em tempo real</p>
        </div>
        <Link 
          href="/relatorios" 
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
        >
          Ver todos os setores <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept) => {
          const isHealthy = dept.healthScore >= 90;
          const isWarning = dept.healthScore >= 70 && dept.healthScore < 90;

          const badgeColor = isHealthy
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : isWarning
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-rose-50 text-rose-800 border-rose-200';

          const progressColor = isHealthy
            ? 'bg-emerald-600'
            : isWarning
            ? 'bg-amber-500'
            : 'bg-rose-500';

          return (
            <Link
              key={dept.id}
              href={`/relatorios?department=${encodeURIComponent(dept.name)}`}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-800 transition-colors">
                    {dept.name}
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    {dept.healthScore}% Seguro
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                    style={{ width: `${dept.healthScore}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Atenção</span>
                  <span className={`font-black ${dept.criticalCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {dept.criticalCount} {dept.criticalCount === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Risco Estimado</span>
                  <span className="font-bold text-slate-900">
                    {dept.financialRisk > 0 ? `R$ ${dept.financialRisk.toFixed(2)}` : 'R$ 0,00'}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
