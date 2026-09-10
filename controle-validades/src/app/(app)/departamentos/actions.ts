'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

export async function createDepartment(formData: FormData) {
  const session = await getSession();
  if (!session?.storeId) throw new Error('Não autorizado');

  const name = formData.get('name') as string;
  if (!name) return;

  await prisma.department.create({
    data: { 
      name,
      storeId: session.storeId as string
    },
  });

  revalidatePath('/departamentos');
}

export async function deleteDepartment(id: string) {
  const session = await getSession();
  if (!session?.storeId) throw new Error('Não autorizado');

  await prisma.department.delete({
    where: { 
      id,
      storeId: session.storeId as string
    },
  });
  revalidatePath('/departamentos');
}
