import React from 'react';
import { prisma } from '@/lib/prisma';
import { createProduct, deleteProduct } from './actions';
import { Trash2, Plus, Search } from 'lucide-react';
import ImportButton from './ImportButton';

export default async function ProdutosPage(props: { searchParams?: Promise<{ barcode?: string }> }) {
  const searchParams = await props.searchParams;
  const initialBarcode = searchParams?.barcode || '';

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { department: true }
  });

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Produtos</h2>
          <p className="text-sm text-slate-500">Gerencie o cadastro de produtos no sistema</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <ImportButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-4">Novo Produto</h3>
            <form action={createProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cód. Barras</label>
                <input 
                  type="text" 
                  name="barcode" 
                  required
                  defaultValue={initialBarcode}
                  placeholder="7890000000000"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input 
                  type="text" 
                  name="description" 
                  required
                  placeholder="Nome do produto"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                <select 
                  name="departmentId"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                >
                  <option value="">-- Sem Departamento --</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg transition-colors mt-2"
              >
                <Plus className="w-5 h-5" /> Adicionar
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-4">Cód. Barras</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Departamento</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        Nenhum produto cadastrado. Adicione o primeiro ou faça a importação.
                      </td>
                    </tr>
                  )}
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-slate-600">{prod.barcode}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{prod.description}</td>
                      <td className="px-6 py-4">
                        {prod.department ? (
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                            {prod.department.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Sem departamento</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={deleteProduct.bind(null, prod.id)}>
                          <button type="submit" className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Excluir produto">
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
