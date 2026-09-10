'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

export async function createCollection(formData: FormData) {
  const session = await getSession();
  if (!session?.storeId) return { error: 'Não autorizado' };

  const storeId = session.storeId as string;
  const userId = session.id as string;

  const barcode = formData.get('barcode') as string;
  const expirationStr = formData.get('expirationDate') as string;
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const batch = formData.get('batch') as string;
  const shelfLocation = formData.get('shelfLocation') as string;

  if (!barcode || !expirationStr) return { error: 'Campos obrigatórios faltando.' };

  // 1. Find product by barcode and storeId
  const product = await prisma.product.findFirst({
    where: { 
      barcode,
      storeId 
    }
  });

  if (!product) {
    return { error: 'PRODUTO_NAO_ENCONTRADO' };
  }

  // 2. Create the collection record safely for this store and user
  await prisma.collection.create({
    data: {
      productId: product.id,
      storeId: storeId,
      userId: userId || undefined,
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

export async function getProductByBarcode(barcode: string) {
  const session = await getSession();
  if (!session?.storeId) return null;

  const product = await prisma.product.findFirst({
    where: { 
      barcode,
      storeId: session.storeId as string
    },
    include: { department: true }
  });

  if (!product) return null;

  return {
    description: product.description,
    department: product.department?.name || ''
  };
}
