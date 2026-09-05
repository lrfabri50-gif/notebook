import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super_secret_fallback_key_for_development';
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Se já estiver logado e tentar acessar /login ou /register, vai pro painel
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      try {
        await jwtVerify(token, encodedKey);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (e) {
        // Token inválido, deixa acessar o login
      }
    }
    return NextResponse.next();
  }

  // Protege todas as outras rotas do painel (tudo que não é /login, /register, /api/auth...)
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next') && pathname !== '/login' && pathname !== '/register') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, encodedKey);
      
      // Checagem de Trial
      if (payload.subscriptionStatus === 'trial' && payload.trialEndDate) {
        const trialEnd = new Date(payload.trialEndDate as string);
        if (trialEnd < new Date() && pathname !== '/meu-plano') {
          // Se o trial expirou, redireciona para Meu Plano obrigando a assinar
          // return NextResponse.redirect(new URL('/meu-plano?expired=true', request.url));
        }
      }

      return NextResponse.next();
    } catch (error) {
      // Token inválido ou expirado
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png, logo-empresa.png etc
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)',
  ],
};
