import React from 'react';
import { getSubscriptionDetails } from './actions';
import { Zap } from 'lucide-react';
import SubscriptionFlow from './SubscriptionFlow';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function MeuPlanoPage() {
  const subscription = await getSubscriptionDetails();
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
      {/* STATUS BANNER */}
      {isTrial && (
        <div className="mt-6 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-6 shadow-lg shadow-amber-500/20 text-white flex flex-col md:flex-row items-center justify-between gap-4">
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

      {/* NEW SUBSCRIPTION FLOW COMPONENT */}
      <SubscriptionFlow 
        isActive={isActive}
        currentPlanName={subscription?.planName || ''}
        maxUsers={subscription?.maxUsers || 1}
        adminEmail={adminEmail}
      />
    </div>
  );
}
