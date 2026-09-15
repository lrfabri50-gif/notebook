import { prisma } from './prisma';

/**
 * Envia uma mensagem de WhatsApp simulada (Mock).
 * Futuramente, esta função fará a chamada HTTP para a API real (Z-API, Evolution, PagBank, etc).
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
  console.log(`[WHATSAPP MOCK] Enviando mensagem para ${recipientPhone}:`);
  console.log(messageContent);
  console.log('---------------------------------------------------');

  // Gravar no banco de dados para histórico
  await prisma.whatsappLog.create({
    data: {
      storeId,
      recipientPhone,
      messageContent,
      status: 'sent_mock',
    }
  });

  return { success: true };
}
