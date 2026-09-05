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

  // Busca o nome real da loja no banco
  let storeName = 'Loja Principal';
  if (session.storeId) {
    const store = await prisma.store.findUnique({
      where: { id: session.storeId as string },
      select: { name: true }
    });
    if (store) storeName = store.name;
  }

  let daysRemaining = null;
  if (session.subscriptionStatus === 'trial' && session.trialEndDate) {
    const end = new Date(session.trialEndDate as string);
    const diff = end.getTime() - new Date().getTime();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  }

  return (
    <AppLayout storeName={storeName} userRole={session.role as string}>
      {daysRemaining !== null && daysRemaining <= 14 && (
        <TrialBanner daysRemaining={daysRemaining} />
      )}
      {daysRemaining === 0 ? null : children}
    </AppLayout>
  );
}
