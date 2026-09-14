'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getSubscriptionDetails() {
  const session = await getSession();
  if (!session) return null;

  const store = await prisma.store.findUnique({
    where: { id: session.storeId as string },
    include: { subscription: true }
  });

  return store?.subscription || null;
}

export async function processCheckout({
  additionalUsers,
  billingCycle,
  amount
}: {
  additionalUsers: number;
  billingCycle: 'mensal' | 'anual';
  amount: number;
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

  const planName = `Plano Flexível (${billingCycle === 'anual' ? 'Anual' : 'Mensal'})`;
  const maxUsers = 1 + additionalUsers;

  // Atualiza o banco
  await prisma.subscription.update({
    where: { id: store.subscriptionId },
    data: {
      status: 'active',
      planName: planName,
      maxUsers: maxUsers,
      basePlanPrice: amount,
      whatsappAddon: true,
      whatsappAddonPrice: 0 // Grátis
    }
  });

  // Registra um pagamento de mentirinha
  await prisma.payment.create({
    data: {
      subscriptionId: store.subscriptionId,
      amount: amount,
      paymentMethod: 'Checkout (Simulado)',
      status: 'paid',
      paidAt: new Date()
    }
  });

  revalidatePath('/meu-plano');
  revalidatePath('/usuarios'); // Importante para destravar os limites

  return { success: true };
}
