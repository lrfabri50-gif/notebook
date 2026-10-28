import React from 'react';
import { getSubscriptionDetails } from './actions';
import { Zap } from 'lucide-react';
import PlanManagementClient from './PlanManagementClient';
import SubscriptionFlow from './SubscriptionFlow';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function MeuPlanoPage() {
  const details = await getSubscriptionDetails();
  const session = await getSession();

  let adminEmail = '';
  if (session && session.userId) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { email: true }
    });
    if (user) {
      adminEmail = user.email;
    }
  }

  const subscription = details?.subscription || null;
  const isTrial = subscription?.status === 'trial';
  const isActive = subscription?.status === 'active';

  let trialDaysLeft = 0;
  if (isTrial && subscription) {
    const end = subscription.trialEndDate
      ? new Date(subscription.trialEndDate)
      : new Date(new Date(subscription.createdAt || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000);
    const diff = end.getTime() - new Date().getTime();
    trialDaysLeft = Math.max(0, Math.min(7, Math.ceil(diff / (1000 * 3600 * 24))));
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* STATUS BANNER QUANDO FOR TESTE */}
      {isTrial && (
        <div className="mt-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 shadow-lg shadow-amber-500/20 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Zap className="w-7 h-7 text-amber-50" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Período de Teste Grátis</h3>
              <p className="text-amber-100 text-xs font-medium">Faltam {trialDaysLeft} dias para o fim do seu teste. Assine para garantir a continuidade da proteção.</p>
            </div>
          </div>
        </div>
      )}

      {/* PAINEL EXECUTIVO DO PLANO E DIREITOS INCLUSOS */}
      <PlanManagementClient 
        subscription={subscription}
        activeUsersCount={details?.activeUsersCount || 1}
        totalProductsCount={details?.totalProductsCount || 0}
        totalCollectionsCount={details?.totalCollectionsCount || 0}
        storeName={details?.storeName || 'Loja Matriz'}
        adminEmail={adminEmail}
      />
    </div>
  );
}
