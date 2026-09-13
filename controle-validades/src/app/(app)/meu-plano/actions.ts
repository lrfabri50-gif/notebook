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

export async function simulatePayment(planType: 'basico' | 'equipe') {
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

  const isBasico = planType === 'basico';
  const planName = isBasico ? 'Básico' : 'Equipe';
  const maxUsers = isBasico ? 1 : 4;
  const price = isBasico ? 24.90 : 79.60;

  // Atualiza o banco
  await prisma.subscription.update({
    where: { id: store.subscriptionId },
    data: {
      status: 'active',
      planName: planName,
      maxUsers: maxUsers,
      basePlanPrice: price,
      whatsappAddon: true,
      whatsappAddonPrice: 0 // Grátis
    }
  });

  // Registra um pagamento de mentirinha
  await prisma.payment.create({
    data: {
      subscriptionId: store.subscriptionId,
      amount: price,
      paymentMethod: 'PIX (Simulado)',
      status: 'paid',
      paidAt: new Date()
    }
  });

  revalidatePath('/meu-plano');
  revalidatePath('/usuarios'); // Importante para destravar os limites

  return { success: true };
}
