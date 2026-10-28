'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getSubscriptionDetails() {
  const session = await getSession();
  if (!session) return null;

  const store = await prisma.store.findUnique({
    where: { id: session.storeId as string },
    include: {
      subscription: {
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      },
      users: {
        select: { id: true, name: true, email: true, role: true }
      },
      products: {
        select: { id: true }
      },
      collections: {
        select: { id: true }
      }
    }
  });

  if (!store) return null;

  return {
    subscription: store.subscription,
    activeUsersCount: store.users.length,
    totalProductsCount: store.products.length,
    totalCollectionsCount: store.collections.length,
    storeName: store.name
  };
}

export async function processCheckout({
  billingCycle,
  paymentMethod = 'PIX'
}: {
  billingCycle: 'mensal' | 'anual';
  paymentMethod?: string;
  additionalUsers?: number;
  amount?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('Não autorizado. Apenas administradores podem gerenciar o plano.');
  }

  const store = await prisma.store.findUnique({
    where: { id: session.storeId as string }
  });

  if (!store || !store.subscriptionId) {
    throw new Error('Assinatura não encontrada.');
  }

  const isAnual = billingCycle === 'anual';
  const planName = isAnual ? 'Plano Anual Blindagem' : 'Plano Mensal';
  const maxUsers = isAnual ? 5 : 1;
  const finalPrice = isAnual ? 498.99 : 49.90;

  // Atualiza o banco com a nova regra de plano
  await prisma.subscription.update({
    where: { id: store.subscriptionId },
    data: {
      status: 'active',
      planName: planName,
      maxUsers: maxUsers,
      basePlanPrice: finalPrice,
      whatsappAddon: true,
      whatsappAddonPrice: 0 // Grátis
    }
  });

  // Registra o pagamento com o método selecionado
  await prisma.payment.create({
    data: {
      subscriptionId: store.subscriptionId,
      amount: finalPrice,
      paymentMethod: paymentMethod,
      status: 'paid',
      paidAt: new Date()
    }
  });

  revalidatePath('/meu-plano');
  revalidatePath('/usuarios'); // Importante para destravar os limites da equipe

  return { success: true, planName, maxUsers, finalPrice };
}
