'use client';

import React, { useState } from 'react';
import { UserPlus, Edit2, X, Trash2 } from 'lucide-react';
import { createUser, updateUser, deleteUser, UserFormData } from './actions';
import { useRouter } from 'next/navigation';

export default function UserFormModal({
  isAdmin,
  userToEdit
}: {
  isAdmin: boolean;
  userToEdit?: {
    id: string;
    name: string;
    email: string;
    phoneWhatsapp: string;
    role: string;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState<UserFormData>({
    name: userToEdit?.name || '',
    email: userToEdit?.email || '',
    phoneWhatsapp: userToEdit?.phoneWhatsapp || '',
    role: userToEdit?.role || 'operator',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (userToEdit) {
        const res = await updateUser(userToEdit.id, formData);
        if (res.error) {
          setError(res.error);
        } else {
          setIsOpen(false);
          router.refresh();
        }
      } else {
        const res = await createUser(formData);
        if (res.error) {
          setError(res.error);
        } else {
          setIsOpen(false);
          setFormData({ name: '', email: '', phoneWhatsapp: '', role: 'operator', password: '' });
          router.refresh();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar usuário.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToEdit) return;
    setLoading(true);
    try {
      const res = await deleteUser(userToEdit.id);
      if (res.error) {
        setError(res.error);
        setIsDeleting(false);
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir usuário.');
      setIsDeleting(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {userToEdit ? (
        <button
          onClick={() => setIsOpen(true)}
          className="text-primary hover:text-primary-hover p-2 rounded-lg hover:bg-slate-100 transition-colors"
          title="Editar Usuário"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Novo Usuário
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden text-left">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {userToEdit ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button
                onClick={() => { setIsOpen(false); setIsDeleting(false); setError(''); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              {isDeleting ? (
                <div className="space-y-4 text-center py-4">
                  <p className="text-slate-700 font-medium">Tem certeza que deseja excluir o usuário <span className="font-bold">{userToEdit?.name}</span>?</p>
                  <p className="text-sm text-red-600">Esta ação não pode ser desfeita e ele perderá o acesso imediatamente.</p>
                  <div className="flex gap-3 justify-center pt-4">
                    <button
                      onClick={() => setIsDeleting(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Excluindo...' : 'Sim, Excluir'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      value={formData.phoneWhatsapp}
                      onChange={e => setFormData({ ...formData, phoneWhatsapp: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nível de Acesso</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      disabled={!isAdmin && formData.role === 'admin'}
                    >
                      <option value="operator">Operador (Apenas Coletas)</option>
                      <option value="manager">Gerente (Relatórios e Produtos)</option>
                      {isAdmin && <option value="admin">Administrador (Acesso Total)</option>}
                    </select>
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {userToEdit ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha de Acesso'}
                    </label>
                    <input
                      type="password"
                      required={!userToEdit}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6 justify-between">
                    {userToEdit ? (
                      <button
                        type="button"
                        onClick={() => setIsDeleting(true)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Usuário"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    ) : (
                      <div></div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover disabled:opacity-50"
                        disabled={loading}
                      >
                        {loading ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
