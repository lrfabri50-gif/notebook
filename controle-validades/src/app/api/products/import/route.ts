import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.storeId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { products } = await req.json();

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Nenhum produto enviado' }, { status: 400 });
    }

    const storeId = session.storeId;

    // 1. Extrair nomes de departamentos únicos
    const uniqueDeptNames = Array.from(new Set(products.map((p: any) => p.departmentName).filter(Boolean))) as string[];

    // 2. Buscar ou criar departamentos
    const departmentMap = new Map<string, string>(); // nome -> id

    // Buscar existentes
    const existingDepts = await prisma.department.findMany({
      where: { storeId, name: { in: uniqueDeptNames } }
    });

    existingDepts.forEach(d => departmentMap.set(d.name, d.id));

    // Criar os que faltam
    for (const deptName of uniqueDeptNames) {
      if (!departmentMap.has(deptName)) {
        const newDept = await prisma.department.create({
          data: { name: deptName, storeId }
        });
        departmentMap.set(newDept.name, newDept.id);
      }
    }

    // 3. Upsert de Produtos
    let count = 0;
    
    // Processamos sequencialmente para evitar locks (sqlite/postgres)
    for (const p of products) {
      const deptId = p.departmentName ? departmentMap.get(p.departmentName) : null;
      
      if (!p.barcode || !p.description) continue;

      await prisma.product.upsert({
        where: {
          storeId_barcode: {
            storeId,
            barcode: p.barcode
          }
        },
        update: {
          description: p.description,
          departmentId: deptId
        },
        create: {
          storeId,
          barcode: p.barcode,
          description: p.description,
          departmentId: deptId
        }
      });
      count++;
    }

    return NextResponse.json({ success: true, count });

  } catch (error: any) {
    console.error('Import Error:', error);
    return NextResponse.json({ error: 'Erro ao processar importação' }, { status: 500 });
  }
}
