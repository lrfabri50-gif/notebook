import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Preencha e-mail e senha' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        store: {
          include: {
            subscription: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Cria Payload do JWT
    const payload = {
      userId: user.id,
      storeId: user.storeId,
      role: user.role,
      subscriptionId: user.store?.subscriptionId,
      subscriptionStatus: user.store?.subscription?.status,
      trialEndDate: user.store?.subscription?.trialEndDate,
    };

    const token = await signToken(payload);

    // Salva no Cookie (HTTP Only)
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
