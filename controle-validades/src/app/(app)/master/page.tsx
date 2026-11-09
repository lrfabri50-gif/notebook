import React from 'react';
import { getSession, isMasterAdminEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getAllStoresForMaster } from './actions';
import MasterPanelClient from './MasterPanelClient';

export default async function MasterPage() {
  const session = await getSession();

  if (!session || !session.userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { id: true, email: true, storeId: true }
  });

  // Trava absoluta: somente os e-mails Master do Luiz podem acessar esta página
  if (!currentUser || !isMasterAdminEmail(currentUser.email)) {
    redirect('/dashboard');
  }

  const stores = await getAllStoresForMaster();

  return (
    <MasterPanelClient
      stores={stores as any}
      masterEmail={currentUser.email}
      masterStoreId={currentUser.storeId || ''}
    />
  );
}

