'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { createDepartmentDirect } from '@/app/(app)/departamentos/actions';

export default function DepartmentSelect({ initialDepartments }: { initialDepartments: { id: string, name: string }[] }) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  const handleAdd = async () => {
    const name = window.prompt('Nome do novo departamento:');
    if (!name) return;
    setLoading(true);
    try {
      const newDept = await createDepartmentDirect(name);
      if (newDept) {
         setDepartments(prev => {
             const updated = [...prev, newDept];
             return updated.sort((a,b) => a.name.localeCompare(b.name));
         });
         setSelectedId(newDept.id);
      }
    } catch (e) {
      alert('Erro ao criar departamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select 
        name="departmentId"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white"
      >
        <option value="">-- Sem Departamento --</option>
        {departments.map(dept => (
          <option key={dept.id} value={dept.id}>{dept.name}</option>
        ))}
      </select>
      <button 
        type="button" 
        onClick={handleAdd}
        disabled={loading}
        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200 shrink-0 flex items-center justify-center disabled:opacity-50"
        title="Criar novo departamento"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}
