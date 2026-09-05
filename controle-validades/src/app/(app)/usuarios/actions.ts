'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

// Types
export type UserFormData = {
  name: string;
  email: string;
  password?: string;
  phoneWhatsapp?: string;
  role: string;
};

// Check if user has permission to manage users
async function canManageUsers() {
  const session = await getSession();
  if (!session) return false;
  
  const user = await prisma.user.findUnique({ where: { id: session.userId as string } });
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return false;
  }
  return true;
}

export async function getUsers() {
  const session = await getSession();
  if (!session) return [];

  return prisma.user.findMany({
    where: { storeId: session.storeId as string },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phoneWhatsapp: true,
      role: true,
      createdAt: true
    }
  });
}

export async function createUser(data: UserFormData) {
  if (!(await canManageUsers())) throw new Error("Unauthorized");
  
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  if (!data.password) throw new Error("A senha é obrigatória para novos usuários.");

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { error: 'Este e-mail já está em uso.' };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      storeId: session.storeId as string,
      name: data.name,
      email: data.email,
      passwordHash,
      phoneWhatsapp: data.phoneWhatsapp,
      role: data.role
    }
  });

  revalidatePath('/usuarios');
  return { success: true };
}

export async function updateUser(id: string, data: UserFormData) {
  if (!(await canManageUsers())) throw new Error("Unauthorized");

  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Verify the user belongs to the same store
  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser || targetUser.storeId !== session.storeId) {
    throw new Error("Unauthorized");
  }

  // Prevent changing their own role (avoid lockout)
  if (id === session.userId && targetUser.role === 'admin' && data.role !== 'admin') {
    return { error: 'Você não pode remover seus próprios privilégios de administrador.' };
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing && existing.id !== id) {
    return { error: 'Este e-mail já está em uso por outro usuário.' };
  }

  const updateData: any = {
    name: data.name,
    email: data.email,
    phoneWhatsapp: data.phoneWhatsapp,
    role: data.role
  };

  if (data.password && data.password.trim() !== '') {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  await prisma.user.update({
    where: { id },
    data: updateData
  });

  revalidatePath('/usuarios');
  return { success: true };
}

export async function deleteUser(id: string) {
  if (!(await canManageUsers())) throw new Error("Unauthorized");

  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  if (id === session.userId) {
    return { error: 'Você não pode excluir a sua própria conta.' };
  }

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser || targetUser.storeId !== session.storeId) {
    throw new Error("Unauthorized");
  }
  
  if (targetUser.role === 'admin') {
     // Prevent deleting the last admin
     const adminCount = await prisma.user.count({ 
       where: { storeId: session.storeId as string, role: 'admin' }
     });
     if (adminCount <= 1) {
       return { error: 'Você não pode excluir o único administrador da loja.' };
     }
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath('/usuarios');
  return { success: true };
}
