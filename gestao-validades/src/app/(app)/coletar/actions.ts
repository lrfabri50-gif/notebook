'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createCollection(formData: FormData) {
  const barcode = formData.get('barcode') as string;
  const expirationStr = formData.get('expirationDate') as string;
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const batch = formData.get('batch') as string;
  const shelfLocation = formData.get('shelfLocation') as string;

  if (!barcode || !expirationStr) return { error: 'Campos obrigatórios faltando.' };

  // 1. Find product by barcode
  const product = await prisma.product.findFirst({
    where: { barcode }
  });

  if (!product) {
    return { error: 'PRODUTO_NAO_ENCONTRADO' };
  }

  // 2. Create the collection record
  await prisma.collection.create({
    data: {
      productId: product.id,
      expirationDate: new Date(expirationStr),
      quantity: quantity || 1,
      batch: batch || null,
      shelfLocation: shelfLocation || null,
      status: 'pending' // Default status
    }
  });

  revalidatePath('/dashboard');
  revalidatePath('/relatorios');
  revalidatePath('/coletar');
  
  return { success: true };
}
