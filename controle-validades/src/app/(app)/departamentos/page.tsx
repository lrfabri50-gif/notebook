import React from 'react';
import { prisma } from '@/lib/prisma';
import { createDepartment, deleteDepartment } from './actions';
import { Trash2, Plus } from 'lucide-react';

export default async function DepartamentosPage() {
  const departments = await prisma.department.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Departamentos</h2>
          <p className="text-sm text-slate-500">Gerencie as categorias dos seus produtos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-4">Novo Departamento</h3>
            <form action={createDepartment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Departamento</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  placeholder="Ex: Laticínios"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" /> Adicionar
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-4">Nome do Departamento</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-slate-500">
                        Nenhum departamento cadastrado.
                      </td>
                    </tr>
                  )}
                  {departments.map(dept => (
                    <tr key={dept.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{dept.name}</td>
                      <td className="px-6 py-4 text-right">
                        <form action={deleteDepartment.bind(null, dept.id)}>
                          <button type="submit" className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
