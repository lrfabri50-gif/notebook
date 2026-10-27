'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface EvolutionDayData {
  name: string;
  fullDate: string;
  Insercoes: number;
  Perdas: number;
  topInsercoesList?: string[];
  topPerdasList?: string[];
}

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

export async function getEvolutionDataByRange(startDateStr: string, endDateStr: string): Promise<EvolutionDayData[]> {
  const session = await getSession();
  if (!session || !session.storeId) {
    throw new Error('Não autorizado');
  }
  const storeId = session.storeId as string;

  if (!startDateStr || !endDateStr) {
    return [];
  }

  const start = new Date(`${startDateStr}T00:00:00.000Z`);
  const end = new Date(`${endDateStr}T23:59:59.999Z`);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [];
  }

  const collections = await prisma.collection.findMany({
    where: {
      storeId,
      OR: [
        { collectedAt: { gte: start, lte: end } },
        { expirationDate: { gte: start, lte: end } }
      ]
    },
    include: {
      product: true
    }
  });

  const daysMap = new Map<string, EvolutionDayData>();
  const curr = new Date(start);
  let daysCount = 0;

  while (curr <= end && daysCount < 62) {
    const yyyy = curr.getUTCFullYear();
    const mm = String(curr.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(curr.getUTCDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;
    const label = `${dd}/${mm}`;

    daysMap.set(key, {
      name: label,
      fullDate: key,
      Insercoes: 0,
      Perdas: 0,
      topInsercoesList: [],
      topPerdasList: []
    });

    curr.setUTCDate(curr.getUTCDate() + 1);
    daysCount++;
  }

  collections.forEach(c => {
    const prodName = c.product?.description || 'Desconhecido';

    // Inserções: data de coleta
    if (c.collectedAt) {
      const spKey = c.collectedAt.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
      if (daysMap.has(spKey)) {
        const item = daysMap.get(spKey)!;
        item.Insercoes += 1;
        if (item.topInsercoesList && item.topInsercoesList.length < 8) {
          item.topInsercoesList.push(`${prodName} (${c.quantity} un)`);
        }
      }
    }

    // Perdas / Vencimentos: data de validade
    if (c.expirationDate) {
      const expKey = c.expirationDate.toLocaleDateString('en-CA', { timeZone: 'UTC' });
      if (daysMap.has(expKey)) {
        const item = daysMap.get(expKey)!;
        item.Perdas += 1;
        if (item.topPerdasList && item.topPerdasList.length < 8) {
          item.topPerdasList.push(`${prodName} (${c.quantity} un)`);
        }
      }
    }
  });

  return Array.from(daysMap.values());
}
