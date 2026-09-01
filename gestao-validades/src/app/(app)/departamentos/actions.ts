'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createDepartment(formData: FormData) {
  const name = formData.get('name') as string;
  if (!name) return;

  await prisma.department.create({
    data: { name },
  });

  revalidatePath('/departamentos');
}

export async function deleteDepartment(id: string) {
  await prisma.department.delete({
    where: { id },
  });
  revalidatePath('/departamentos');
}
