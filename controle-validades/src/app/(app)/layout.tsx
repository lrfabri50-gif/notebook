import { AppLayout } from '@/components/layout/AppLayout';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TrialBanner from '@/components/layout/TrialBanner';
import { prisma } from '@/lib/prisma';

export default async function AppGroup({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Busca o nome real da loja e status da assinatura no banco
  let storeName = 'Loja Principal';
  let daysRemaining: number | null = null;

  if (session.storeId) {
    const store = await prisma.store.findUnique({
      where: { id: session.storeId as string },
      select: {
        name: true,
        subscription: {
          select: {
            status: true,
            trialEndDate: true,
            createdAt: true
          }
        }
      }
    });
    if (store) {
      storeName = store.name;
      if (store.subscription?.status === 'trial') {
        const end = store.subscription.trialEndDate
          ? new Date(store.subscription.trialEndDate)
          : new Date(new Date(store.subscription.createdAt || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000);
        const diff = end.getTime() - new Date().getTime();
        daysRemaining = Math.max(0, Math.min(7, Math.ceil(diff / (1000 * 3600 * 24))));
      }
    }
  }

  return (
    <AppLayout storeName={storeName} userRole={session.role as string}>
      {daysRemaining !== null && daysRemaining <= 7 && (
        <TrialBanner daysRemaining={daysRemaining} />
      )}
      {children}
    </AppLayout>
  );
}
