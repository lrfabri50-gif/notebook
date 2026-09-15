import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppAlert } from '@/lib/whatsapp';

export async function GET(req: Request) {
  try {
    // 1. Determinar as datas alvo (Daqui a 3 e 4 dias na hora de SP)
    const nowRaw = new Date();
    const spDateString = nowRaw.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    const spDate = new Date(spDateString);
    const todayUTC = new Date(Date.UTC(spDate.getFullYear(), spDate.getMonth(), spDate.getDate()));
    
    const targetDate3 = new Date(todayUTC);
    targetDate3.setUTCDate(todayUTC.getUTCDate() + 3);

    const targetDate4 = new Date(todayUTC);
    targetDate4.setUTCDate(todayUTC.getUTCDate() + 4);

    // 2. Buscar todas as coletas pendentes que vencem exatamente nestas datas
    // Também incluir informações do produto e da loja.
    const collections = await prisma.collection.findMany({
      where: {
        expirationDate: {
          in: [targetDate3, targetDate4]
        },
        status: 'pending'
      },
      include: {
        product: true,
        store: {
          include: {
            users: true // Trazer os usuários para pegarmos os telefones
          }
        }
      }
    });

    if (collections.length === 0) {
      return NextResponse.json({ message: 'Nenhum produto a vencer em 3 ou 4 dias.' }, { status: 200 });
    }

    // 3. Agrupar as coletas por loja (storeId)
    const storeMap = new Map<string, any[]>();
    for (const col of collections) {
      if (!col.storeId) continue;
      const list = storeMap.get(col.storeId) || [];
      list.push(col);
      storeMap.set(col.storeId, list);
    }

    let messagesSent = 0;

    // 4. Para cada loja, gerar a mensagem e enviar para os usuários
    for (const [storeId, storeCollections] of storeMap.entries()) {
      const store = storeCollections[0].store;
      
      // Montar a mensagem dinâmica
      const qtdProdutos = storeCollections.length;
      
      const message = `🚨 *Alerta Artos - Controle de Validades* 🚨\n\nExistem *${qtdProdutos}* produto(s) na sua loja que vão vencer em *3 ou 4 dias*!\n\nAcesse o sistema para verificar e tomar a Ação Imediata.`;

      // Disparar para os usuários da loja que têm WhatsApp e são admin/operator
      for (const user of store.users) {
        if (user.phoneWhatsapp && (user.role === 'admin' || user.role === 'operator')) {
          await sendWhatsAppAlert({
            storeId: store.id,
            recipientPhone: user.phoneWhatsapp,
            messageContent: message
          });
          messagesSent++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Enviadas ${messagesSent} mensagens de alerta para ${storeMap.size} lojas.` 
    });

  } catch (error: any) {
    console.error('[CRON ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
