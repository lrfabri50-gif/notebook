'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteUser } from './actions';
import { useRouter } from 'next/navigation';

export default function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteUser(userId);
      if (res?.error) {
        alert(res.error);
        setIsConfirming(false);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir usuário.');
      setIsConfirming(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isConfirming) {
    return (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setIsConfirming(false)}
          className="text-[10px] px-2 py-1 text-slate-500 hover:bg-slate-100 rounded transition-colors"
          disabled={isDeleting}
        >
          Cancelar
        </button>
        <button
          onClick={handleDelete}
          className="text-[10px] px-2 py-1 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors disabled:opacity-50 whitespace-nowrap"
          disabled={isDeleting}
        >
          {isDeleting ? 'Excluindo...' : 'Confirmar'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
      title="Excluir Usuário"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
