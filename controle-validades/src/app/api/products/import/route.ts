import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.storeId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const storeId = session.storeId as string;

    // Check if it's FormData
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
        return NextResponse.json({ error: 'Formato inválido. Envie como multipart/form-data.' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Try to decode as Windows-1252/ISO-8859-1 since Excel CSVs often use it in Brazil
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = new TextDecoder('utf-8').decode(buffer);
    
    // Fallback if there are strange characters like "Descrio"
    if (text.includes('')) {
        text = new TextDecoder('iso-8859-1').decode(buffer);
    }

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length === 0) {
      return NextResponse.json({ error: 'Arquivo vazio' }, { status: 400 });
    }

    // Determine separator from the first line
    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';

    // Verify if first line is header
    let startIdx = 0;
    const lowerFirstLine = firstLine.toLowerCase();
    if (lowerFirstLine.includes('barras') || lowerFirstLine.includes('cód') || lowerFirstLine.includes('codigo') || lowerFirstLine.includes('desc')) {
      startIdx = 1;
    }

    let successCount = 0;
    const departmentCache = new Map<string, string>(); // name -> id

    // Load existing departments to cache
    const existingDepts = await prisma.department.findMany({
      where: { storeId }
    });
    existingDepts.forEach((d: any) => departmentCache.set(d.name.toLowerCase(), d.id));

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(separator);
      
      // Pad empty parts if line is like 'SEM GTIN;0;' -> ['SEM GTIN', '0', '']
      const barcode = (parts[0] || '').trim().replace(/^"|"$/g, '');
      const description = (parts[1] || '').trim().replace(/^"|"$/g, '');
      const departmentName = (parts[2] || '').trim().replace(/^"|"$/g, '');

      if (!barcode || !description) continue;

      // Reject scientific notation from Excel (e.g., 7,89E+12)
      if (barcode.toUpperCase().includes('E+')) {
         return NextResponse.json({ 
             error: `O código de barras "${barcode}" na linha ${i+1} está no formato científico do Excel (ex: 7,89E+12). Formate a coluna de códigos como NÚMERO sem decimais no Excel antes de salvar o CSV.` 
         }, { status: 400 });
      }

      let departmentId = null;

      if (departmentName) {
        const deptKey = departmentName.toLowerCase();
        departmentId = departmentCache.get(deptKey);

        if (!departmentId) {
          // Create department
          const newDept = await prisma.department.create({
            data: {
              name: departmentName,
              storeId: storeId,
            }
          });
          departmentId = newDept.id;
          departmentCache.set(deptKey, departmentId);
        }
      }

      await prisma.product.upsert({
        where: {
          storeId_barcode: {
            storeId: storeId,
            barcode: barcode
          }
        },
        update: {
          description: description,
          departmentId: departmentId
        },
        create: {
          storeId: storeId,
          barcode: barcode,
          description: description,
          departmentId: departmentId
        }
      });
      
      successCount++;
    }

    return NextResponse.json({ 
      success: true,
      message: 'Importação concluída', 
      count: successCount 
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message || 'Erro interno ao importar produtos' }, { status: 500 });
  }
}
