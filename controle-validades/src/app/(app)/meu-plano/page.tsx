import React from 'react';
import { getSubscriptionDetails } from './actions';
import { Check, ShieldCheck, Zap, MessageCircle, AlertTriangle, Star } from 'lucide-react';
import CheckoutButton from './CheckoutButton';

export default async function MeuPlanoPage() {
  const subscription = await getSubscriptionDetails();

  const isTrial = subscription?.status === 'trial';
  const isActive = subscription?.status === 'active';

  let trialDaysLeft = 0;
  if (isTrial && subscription?.createdAt) {
    const trialStart = new Date(subscription.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - trialStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    trialDaysLeft = Math.max(0, 7 - diffDays); // Assuming 7 days trial
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* HEADER BANNER */}
      <div className="text-center space-y-4 pt-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assinatura e Planos</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Gerencie o acesso da sua loja ao Controle de Validades. 
        </p>
      </div>

      {/* STATUS BANNER */}
      {isTrial && (
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-6 shadow-lg shadow-amber-500/20 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Zap className="w-8 h-8 text-amber-50" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Período de Teste Grátis</h3>
              <p className="text-amber-50 font-medium">Faltam {trialDaysLeft} dias para o fim do seu teste.</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm font-medium text-amber-100 mb-1">Evite interrupções</p>
            <p className="font-bold">Assine abaixo agora</p>
          </div>
        </div>
      )}

      {isActive && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-lg shadow-emerald-500/20 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <ShieldCheck className="w-8 h-8 text-emerald-50" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Plano Ativo</h3>
              <p className="text-emerald-50 font-medium">Sua loja está protegida e faturando.</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                <Star className="w-3 h-3" /> Plano {subscription?.planName || 'Base'} (Até {subscription?.maxUsers || 1} Usuário(s))
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRICING CARDS */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* BÁSICO */}
        <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden flex flex-col">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-800">Plano Básico</h3>
            <p className="text-slate-500 mt-2">Para lojas pequenas com foco em agilidade.</p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-extrabold text-slate-900">R$ 24,90</span>
            <span className="text-slate-500 font-medium">/mês</span>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-slate-700 font-medium">
              <div className="bg-green-100 p-1 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
              <span>1 Usuário (Admin)</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700 font-medium">
              <div className="bg-green-100 p-1 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
              <span>Coletas de Validade Ilimitadas</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700 font-medium">
              <div className="bg-green-100 p-1 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
              <span>Acesso ao Dashboard e Relatórios</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700 font-medium bg-slate-50 p-2 rounded-lg -mx-2">
              <div className="bg-green-100 p-1 rounded-full"><MessageCircle className="w-4 h-4 text-green-600" /></div>
              <span>Avisos por WhatsApp (Grátis)</span>
            </li>
          </ul>

          <CheckoutButton 
            planType="basico" 
            price="24,90" 
            maxUsers={1} 
            isActive={isActive} 
            currentPlanName={subscription?.planName || ''} 
          />
        </div>

        {/* EQUIPE (Destaque) */}
        <div className="bg-primary rounded-3xl p-8 border-2 border-primary shadow-2xl shadow-primary/30 relative overflow-hidden flex flex-col text-white">
          <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-black px-4 py-1.5 rounded-bl-lg uppercase tracking-wider">
            Recomendado
          </div>
          
          <div className="mb-6 mt-2">
            <h3 className="text-2xl font-bold text-white">Plano Equipe</h3>
            <p className="text-primary-foreground/80 mt-2">Para mercados que precisam delegar tarefas.</p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-extrabold text-white">R$ 79,60</span>
            <span className="text-primary-foreground/80 font-medium">/mês</span>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-white font-medium">
              <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4 text-white" /></div>
              <span>Até 4 Usuários (1 Admin + 3 Operadores)</span>
            </li>
            <li className="flex items-center gap-3 text-white font-medium">
              <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4 text-white" /></div>
              <span>Coletas de Validade Ilimitadas</span>
            </li>
            <li className="flex items-center gap-3 text-white font-medium">
              <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4 text-white" /></div>
              <span>Gestão de Níveis de Acesso</span>
            </li>
            <li className="flex items-center gap-3 text-white font-medium bg-black/10 p-2 rounded-lg -mx-2">
              <div className="bg-white/20 p-1 rounded-full"><MessageCircle className="w-4 h-4 text-white" /></div>
              <span>Avisos por WhatsApp (Grátis)</span>
            </li>
          </ul>

          <div className="bg-white/10 p-1 rounded-xl">
            <CheckoutButton 
              planType="equipe" 
              price="79,60" 
              maxUsers={4} 
              isActive={isActive} 
              currentPlanName={subscription?.planName || ''} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
