'use server';

import { prisma } from '@/lib/prisma';
import { getSession, isMasterAdminEmail } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

async function assertMasterAdmin() {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new Error('Não autenticado.');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { id: true, email: true, storeId: true }
  });

  if (!currentUser || !isMasterAdminEmail(currentUser.email)) {
    throw new Error('Acesso restrito exclusivamente à diretoria da Artos Consultoria.');
  }

  return currentUser;
}

export async function getAllStoresForMaster() {
  await assertMasterAdmin();

  const stores = await prisma.store.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      subscription: {
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneWhatsapp: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      },
      _count: {
        select: {
          products: true,
          collections: true,
          departments: true,
          users: true
        }
      }
    }
  });

  return stores;
}

export async function masterUpdateStorePlan({
  storeId,
  action
}: {
  storeId: string;
  action: 'activate_mensal' | 'activate_anual' | 'extend_trial_7d' | 'suspend';
}) {
  await assertMasterAdmin();

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { subscription: true, users: true }
  });

  if (!store) {
    throw new Error('Loja não encontrada.');
  }

  let subscriptionId = store.subscriptionId;

  // Caso a loja não tenha registro de assinatura, cria um
  if (!subscriptionId) {
    const newSub = await prisma.subscription.create({
      data: {
        userId: store.users[0]?.id || store.id,
        status: 'trial',
        planName: 'trial',
        maxUsers: 4
      }
    });
    subscriptionId = newSub.id;
    await prisma.store.update({
      where: { id: store.id },
      data: { subscriptionId }
    });
  }

  if (action === 'activate_mensal') {
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'active',
          planName: 'Plano Mensal',
          maxUsers: 1,
          basePlanPrice: 49.90,
          whatsappAddon: true,
          whatsappAddonPrice: 0
        }
      }),
      prisma.payment.create({
        data: {
          subscriptionId,
          amount: 49.90,
          paymentMethod: 'Liberação Painel Master (Mensal)',
          status: 'paid',
          paidAt: new Date()
        }
      })
    ]);
  } else if (action === 'activate_anual') {
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'active',
          planName: 'Plano Anual Blindagem',
          maxUsers: 5,
          basePlanPrice: 498.99,
          whatsappAddon: true,
          whatsappAddonPrice: 0
        }
      }),
      prisma.payment.create({
        data: {
          subscriptionId,
          amount: 498.99,
          paymentMethod: 'Liberação Painel Master (Anual)',
          status: 'paid',
          paidAt: new Date()
        }
      })
    ]);
  } else if (action === 'extend_trial_7d') {
    const newTrialEnd = new Date();
    newTrialEnd.setDate(newTrialEnd.getDate() + 7);

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'trial',
        planName: 'Período de Teste (7 Dias)',
        trialEndDate: newTrialEnd
      }
    });
  } else if (action === 'suspend') {
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1);

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'suspended',
        trialEndDate: expiredDate
      }
    });
  }

  revalidatePath('/master');
  revalidatePath('/meu-plano');
  return { success: true };
}

export async function masterResetUserPassword({
  userId,
  newPassword
}: {
  userId: string;
  newPassword: string;
}) {
  await assertMasterAdmin();

  if (!newPassword || newPassword.length < 6) {
    throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });

  revalidatePath('/master');
  return { success: true };
}

export async function masterDeleteStore({ storeId }: { storeId: string }) {
  const masterUser = await assertMasterAdmin();

  if (masterUser.storeId === storeId) {
    throw new Error('Por segurança, você não pode excluir a sua própria Loja Matriz principal.');
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, subscriptionId: true }
  });

  if (!store) {
    throw new Error('Loja não encontrada.');
  }

  if (store.subscriptionId) {
    await prisma.subscription.delete({
      where: { id: store.subscriptionId }
    });
  } else {
    await prisma.store.delete({
      where: { id: storeId }
    });
  }

  revalidatePath('/master');
  return { success: true };
}
