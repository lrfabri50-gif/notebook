'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getSubscriptionDetails() {
  const session = await getSession();
  if (!session) return null;

  const store = await prisma.store.findUnique({
    where: { id: session.storeId as string },
    include: {
      subscription: {
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      },
      users: {
        select: { id: true, name: true, email: true, role: true }
      },
      products: {
        select: { id: true }
      },
      collections: {
        select: { id: true }
      }
    }
  });

  if (!store) return null;

  return {
    subscription: store.subscription,
    activeUsersCount: store.users.length,
    totalProductsCount: store.products.length,
    totalCollectionsCount: store.collections.length,
    storeName: store.name
  };
}

export async function processCheckout({
  billingCycle,
  paymentMethod = 'PIX'
}: {
  billingCycle: 'mensal' | 'anual';
  paymentMethod?: string;
  additionalUsers?: number;
  amount?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('Não autorizado. Apenas administradores podem gerenciar o plano.');
  }

  const store = await prisma.store.findUnique({
    where: { id: session.storeId as string }
  });

  if (!store || !store.subscriptionId) {
    throw new Error('Assinatura não encontrada.');
  }

  const isAnual = billingCycle === 'anual';
  const planName = isAnual ? 'Plano Anual Blindagem' : 'Plano Mensal';
  const maxUsers = isAnual ? 5 : 1;
  const finalPrice = isAnual ? 498.99 : 49.90;

  // Atualiza o banco com a nova regra de plano
  await prisma.subscription.update({
    where: { id: store.subscriptionId },
    data: {
      status: 'active',
      planName: planName,
      maxUsers: maxUsers,
      basePlanPrice: finalPrice,
      whatsappAddon: true,
      whatsappAddonPrice: 0 // Grátis
    }
  });

  // Registra o pagamento com o método selecionado
  await prisma.payment.create({
    data: {
      subscriptionId: store.subscriptionId,
      amount: finalPrice,
      paymentMethod: paymentMethod,
      status: 'paid',
      paidAt: new Date()
    }
  });

  revalidatePath('/meu-plano');
  revalidatePath('/usuarios'); // Importante para destravar os limites da equipe

  return { success: true, planName, maxUsers, finalPrice };
}

export async function createInfinitePayCheckout({
  billingCycle,
  origin
}: {
  billingCycle: 'mensal' | 'anual';
  origin: string;
}) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('Não autorizado. Apenas administradores podem gerenciar o plano.');
  }

  const store = await prisma.store.findUnique({
    where: { id: session.storeId as string }
  });

  if (!store || !store.subscriptionId) {
    throw new Error('Assinatura não encontrada.');
  }

  const isAnual = billingCycle === 'anual';
  const finalPrice = isAnual ? 498.99 : 49.90;
  const priceInCents = Math.round(finalPrice * 100);
  const description = isAnual
    ? 'Plano Anual Blindagem Artos (Até 5 Usuários)'
    : 'Plano Mensal Artos (1 Usuário)';

  // 1. Cria registro de pagamento pendente vinculado à assinatura da loja
  const payment = await prisma.payment.create({
    data: {
      subscriptionId: store.subscriptionId,
      amount: finalPrice,
      paymentMethod: isAnual ? 'InfinitePay (Plano Anual)' : 'InfinitePay (Plano Mensal)',
      status: 'pending'
    }
  });

  const handle = (process.env.INFINITEPAY_HANDLE || 'luiz_fabri50').replace(/^\$/, '');
  const cleanOrigin = origin.replace(/\/$/, '');

  const payload = {
    handle,
    order_nsu: payment.id,
    redirect_url: `${cleanOrigin}/meu-plano?infinitepay=1`,
    webhook_url: `${cleanOrigin}/api/webhooks/infinitepay`,
    items: [
      {
        quantity: 1,
        price: priceInCents,
        description
      }
    ]
  };

  const response = await fetch('https://api.checkout.infinitepay.io/links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.INFINITEPAY_API_KEY ? { 'X-Api-Key': process.env.INFINITEPAY_API_KEY } : {})
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok || !data?.url) {
    return {
      success: false,
      errorCode: data?.error || 'checkout_error',
      message:
        data?.error === 'external_checkout_not_enabled'
          ? 'O Checkout Integrado precisa ser ativado no seu painel da InfinitePay (Configurações -> Checkout Externo).'
          : data?.message || 'Não foi possível gerar o link da InfinitePay no momento.',
      enableUrl: data?.redirect_url || 'https://app.infinitepay.io/external-checkout#configuracoes?enabled=true'
    };
  }

  return {
    success: true,
    checkoutUrl: data.url as string,
    orderNsu: payment.id
  };
}

export async function verifyInfinitePayPayment({
  orderNsu,
  transactionNsu,
  slug,
  captureMethod
}: {
  orderNsu: string;
  transactionNsu?: string;
  slug?: string;
  captureMethod?: string;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, message: 'Sessão inválida.' };
  }

  const payment = await prisma.payment.findUnique({
    where: { id: orderNsu }
  });

  if (!payment || !payment.subscriptionId) {
    return { success: false, message: 'Pedido não encontrado.' };
  }

  // Se o webhook já confirmou, apenas atualiza a tela
  if (payment.status === 'paid') {
    revalidatePath('/meu-plano');
    revalidatePath('/usuarios');
    return { success: true, alreadyPaid: true };
  }

  const handle = (process.env.INFINITEPAY_HANDLE || 'luiz_fabri50').replace(/^\$/, '');

  try {
    const checkRes = await fetch('https://api.checkout.infinitepay.io/payment_check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.INFINITEPAY_API_KEY ? { 'X-Api-Key': process.env.INFINITEPAY_API_KEY } : {})
      },
      body: JSON.stringify({
        handle,
        order_nsu: orderNsu,
        transaction_nsu: transactionNsu,
        slug
      })
    });

    const checkData = await checkRes.json();
    const isPaid =
      checkData?.paid === true ||
      checkData?.success === true ||
      Boolean(transactionNsu && slug);

    if (isPaid) {
      const isAnual = payment.amount >= 400;
      const planName = isAnual ? 'Plano Anual Blindagem' : 'Plano Mensal';
      const maxUsers = isAnual ? 5 : 1;
      const methodLabel =
        captureMethod === 'pix'
          ? 'InfinitePay (PIX)'
          : captureMethod === 'credit_card'
          ? `InfinitePay (Cartão ${isAnual ? 'Anual' : 'Mensal'})`
          : payment.paymentMethod;

      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'paid',
            paymentMethod: methodLabel,
            transactionId: transactionNsu || payment.transactionId,
            paidAt: new Date()
          }
        }),
        prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: 'active',
            planName,
            maxUsers,
            basePlanPrice: payment.amount,
            whatsappAddon: true,
            whatsappAddonPrice: 0
          }
        })
      ]);

      revalidatePath('/meu-plano');
      revalidatePath('/usuarios');

      return { success: true };
    }
  } catch (err) {
    console.error('Erro ao verificar pagamento InfinitePay:', err);
  }

  return { success: false, message: 'Aguardando confirmação do pagamento pela InfinitePay.' };
}
