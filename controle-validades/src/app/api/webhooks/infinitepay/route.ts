import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // InfinitePay sends order_nsu, transaction_nsu, invoice_slug/slug, capture_method, amount, paid_amount
    const orderNsu = body.order_nsu || body.metadata?.order_nsu;
    const transactionNsu = body.transaction_nsu || body.id;
    const captureMethod = body.capture_method; // 'pix' | 'credit_card'
    const isPaid =
      body.paid === true ||
      body.status === 'paid' ||
      body.status === 'approved' ||
      body.event === 'paid' ||
      (typeof body.paid_amount === 'number' && body.paid_amount > 0);

    if (!orderNsu) {
      return NextResponse.json({ received: true, warning: 'Missing order_nsu' }, { status: 200 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: orderNsu },
      include: { subscription: true }
    });

    if (!payment || !payment.subscriptionId) {
      return NextResponse.json({ received: true, warning: 'Payment not found' }, { status: 200 });
    }

    if (isPaid && payment.status !== 'paid') {
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
            transactionId: transactionNsu ? String(transactionNsu) : payment.transactionId,
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
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro no Webhook InfinitePay:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 400 });
  }
}

