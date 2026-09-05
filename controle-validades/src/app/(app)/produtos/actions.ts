'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  const barcode = formData.get('barcode') as string;
  const description = formData.get('description') as string;
  const departmentId = formData.get('departmentId') as string;

  if (!barcode || !description) return;

  try {
    await prisma.product.create({
      data: { 
        barcode, 
        description,
        departmentId: departmentId ? departmentId : undefined
      },
    });
    revalidatePath('/produtos');
  } catch (err) {
    console.error("Failed to create product", err);
    // Unique constraint on barcode might fail, handle in real app
  }
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({
    where: { id },
  });
  revalidatePath('/produtos');
}
