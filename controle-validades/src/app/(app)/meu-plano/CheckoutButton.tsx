'use client';

import React, { useState } from 'react';
import { simulatePayment } from './actions';
import { CreditCard, QrCode, CheckCircle2 } from 'lucide-react';

export default function CheckoutButton({ planType, price, maxUsers }: { planType: 'basico' | 'equipe', price: string, maxUsers: number }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      await simulatePayment(planType);
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Erro ao simular pagamento.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold mt-4 border border-green-200">
        <CheckCircle2 className="w-5 h-5" /> Assinatura Ativa!
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <button 
        onClick={handleSimulate}
        disabled={loading}
        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        <CreditCard className="w-5 h-5" /> Pagar com Cartão
      </button>
      <button 
        onClick={handleSimulate}
        disabled={loading}
        className="w-full py-3 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-teal-200 disabled:opacity-50"
      >
        <QrCode className="w-5 h-5" /> Pagar com PIX
      </button>
      <p className="text-xs text-center text-slate-400 mt-2">
        *Apenas simulação para liberar plano de {maxUsers} usuário(s) por R$ {price}.
      </p>
    </div>
  );
}
