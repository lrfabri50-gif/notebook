import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function TrialBanner({ daysRemaining }: { daysRemaining: number }) {
  if (daysRemaining === 0) {
    return (
      <div className="bg-red-600 text-white p-3 flex items-center justify-center gap-3 w-full shrink-0 shadow-sm z-20">
        <AlertTriangle className="w-5 h-5" />
        <span className="text-sm font-medium">Seu período de testes acabou. O acesso ao sistema está bloqueado.</span>
        <Link href="/meu-plano" className="bg-white text-red-600 px-4 py-1 rounded font-bold text-sm hover:bg-red-50 transition-colors ml-4">
          Assinar Agora
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-amber-100 border-b border-amber-200 text-amber-800 p-2.5 flex items-center justify-center gap-2 w-full shrink-0 z-20">
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">
        Seu período de testes grátis expira em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}.
      </span>
      <Link href="/meu-plano" className="text-sm font-bold underline ml-2 hover:text-amber-900">
        Ver Planos
      </Link>
    </div>
  );
}
