import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { storeName, email, password } = await request.json();

    if (!storeName || !email || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 });
    }

    // Verifica se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Trial de 14 dias
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    // Pre-gerar ID do usuário para vincular à Assinatura
    const newUserId = crypto.randomUUID();

    // Cria a Assinatura -> Loja -> Usuário em uma transação
    const subscription = await prisma.subscription.create({
      data: {
        userId: newUserId,
        status: 'trial',
        trialEndDate,
        stores: {
          create: {
            name: storeName,
            users: {
              create: {
                id: newUserId,
                email,
                passwordHash,
                role: 'admin',
                name: 'Administrador'
              }
            }
          }
        }
      },
      include: {
        stores: {
          include: {
            users: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Loja cadastrada com sucesso' });
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json({ error: 'Erro interno ao criar conta' }, { status: 500 });
  }
}
