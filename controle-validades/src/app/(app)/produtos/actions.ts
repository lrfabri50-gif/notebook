'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

export async function createProduct(formData: FormData) {
  const session = await getSession();
  if (!session?.storeId) return { error: 'Não autorizado' };

  const barcode = formData.get('barcode') as string;
  const description = formData.get('description') as string;
  const departmentId = formData.get('departmentId') as string;

  if (!barcode || !description) return { error: 'Campos obrigatórios' };

  try {
    await prisma.product.create({
      data: { 
        barcode, 
        description,
        departmentId: departmentId ? departmentId : undefined,
        storeId: session.storeId as string
      },
    });
    revalidatePath('/produtos');
  } catch (err) {
    console.error("Failed to create product", err);
    return { error: 'Erro ao criar produto' };
  }
}

export async function deleteProduct(id: string) {
  const session = await getSession();
  if (!session?.storeId) return { error: 'Não autorizado' };

  try {
    // Only delete if the product belongs to the user's store
    await prisma.product.delete({
      where: { 
        id,
        storeId: session.storeId as string
      },
    });
    revalidatePath('/produtos');
    return { success: true };
  } catch (err) {
    console.error("Failed to delete product", err);
    return { error: 'Erro ao excluir produto' };
  }
}
