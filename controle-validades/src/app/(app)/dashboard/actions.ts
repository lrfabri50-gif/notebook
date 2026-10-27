'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function quickUpdatePrice(collectionId: string, priceChange: string) {
  const session = await getSession();
  if (!session || !session.storeId) {
    throw new Error('Não autorizado');
  }

  await prisma.collection.update({
    where: {
      id: collectionId,
      storeId: session.storeId as string
    },
    data: {
      priceChange,
      status: 'action_taken'
    }
  });

  revalidatePath('/dashboard');
  revalidatePath('/relatorios');
  return { success: true };
}
