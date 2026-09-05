import React from 'react';
import { getUsers } from './actions';
import { Users, Shield, ShieldCheck, User } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserFormModal from './UserFormModal';

export default async function UsuariosPage() {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'manager')) {
    redirect('/dashboard');
  }

  const users = await getUsers();
  const isAdmin = session.role === 'admin';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Equipe e Usuários
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie os acessos dos funcionários da sua loja.
          </p>
        </div>
        <div>
          <UserFormModal isAdmin={isAdmin} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Nível de Acesso</th>
                <th className="px-6 py-4">Data de Criação</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {u.phoneWhatsapp || 'Não informado'}
                  </td>
                  <td className="px-6 py-4">
                    {u.role === 'admin' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                        <ShieldCheck className="w-3 h-3" /> Administrador
                      </span>
                    )}
                    {u.role === 'manager' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3" /> Gerente
                      </span>
                    )}
                    {u.role === 'operator' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        <User className="w-3 h-3" /> Operador
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {u.createdAt ? u.createdAt.toLocaleDateString('pt-BR') : '---'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <UserFormModal 
                      isAdmin={isAdmin}
                      userToEdit={{
                        id: u.id,
                        name: u.name || '',
                        email: u.email,
                        phoneWhatsapp: u.phoneWhatsapp || '',
                        role: u.role
                      }} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
