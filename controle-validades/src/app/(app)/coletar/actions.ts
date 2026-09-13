'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

export async function createCollection(formData: FormData) {
  const session = await getSession();
  if (!session?.storeId) return { error: 'Não autorizado' };

  const storeId = session.storeId as string;
  const userId = session.id as string;

  const productId = formData.get('productId') as string;
  const expirationStr = formData.get('expirationDate') as string;
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const batch = formData.get('batch') as string;
  const shelfLocation = formData.get('shelfLocation') as string;

  if (!productId || !expirationStr) return { error: 'Campos obrigatórios faltando.' };

  // 1. Find product by ID and storeId
  const product = await prisma.product.findFirst({
    where: { 
      id: productId,
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

export async function getProductsByBarcode(barcode: string) {
  const session = await getSession();
  if (!session?.storeId) return [];

  const products = await prisma.product.findMany({
    where: { 
      barcode,
      storeId: session.storeId as string
    },
    include: { department: true }
  });

  return products.map(product => ({
    id: product.id,
    description: product.description,
    department: product.department?.name || '',
    barcode: product.barcode
  }));
}
