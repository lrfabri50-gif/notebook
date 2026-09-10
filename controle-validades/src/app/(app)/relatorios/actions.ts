'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateCollectionPrice(collectionId: string, priceChange: string) {
  const session = await getSession();
  if (!session || !session.storeId) {
    throw new Error('Não autorizado');
  }

  await prisma.collection.update({
    where: { 
      id: collectionId,
      storeId: session.storeId as string
    },
    data: { priceChange }
  });

  // Revalidate the page so it pulls the updated data next time it renders
  revalidatePath('/relatorios');
}
