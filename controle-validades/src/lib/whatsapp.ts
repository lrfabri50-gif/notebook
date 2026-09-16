import { prisma } from './prisma';

/**
 * Envia uma mensagem de WhatsApp via WhatsApp Cloud API (Meta).
 */
export async function sendWhatsAppAlert({
  storeId,
  recipientPhone,
  messageContent
}: {
  storeId: string;
  recipientPhone: string;
  messageContent: string;
}) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  // Limpar formatação do telefone (deixar só números)
  let cleanPhone = recipientPhone.replace(/\D/g, '');
  
  // Se tiver 10 ou 11 dígitos, provavelmente esqueceu o +55 (código do Brasil). A Meta exige o DDI.
  if (cleanPhone.length === 10 || cleanPhone.length === 11) {
    cleanPhone = `55${cleanPhone}`;
  }

  console.log(`[WHATSAPP META] Tentando envio para ${cleanPhone}...`);

  if (!token || !phoneId) {
    console.log('[WHATSAPP META] Erro: Token ou Phone ID não configurados no .env. Fazendo fallback para MOCK.');
    await prisma.whatsappLog.create({
      data: {
        storeId,
        recipientPhone: cleanPhone,
        messageContent,
        status: 'sent_mock',
      }
    });
    return { success: true, mock: true };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: messageContent
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WHATSAPP META] Erro da API:', JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || 'Erro desconhecido na API da Meta');
    }

    console.log('[WHATSAPP META] Mensagem enviada com sucesso! ID:', data.messages?.[0]?.id);

    // Gravar no banco de dados para histórico (sucesso)
    await prisma.whatsappLog.create({
      data: {
        storeId,
        recipientPhone: cleanPhone,
        messageContent,
        status: 'sent',
      }
    });

    return { success: true, data };
  } catch (error: any) {
    console.error('[WHATSAPP META] Exceção:', error);
    
    // Gravar no banco de dados para histórico (falha)
    await prisma.whatsappLog.create({
      data: {
        storeId,
        recipientPhone: cleanPhone,
        messageContent,
        status: 'failed',
      }
    });

    return { success: false, error: error.message };
  }
}
