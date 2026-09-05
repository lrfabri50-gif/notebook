'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Box, 
  Layers, 
  Users, 
  BarChart2, 
  ScanLine, 
  CreditCard, 
  HelpCircle,
  List,
  Menu,
  LogOut
} from 'lucide-react';
import clsx from 'clsx';

const menuItems = [
  { href: '/dashboard', label: 'Início', icon: Home, roles: ['admin', 'manager', 'operator'] },
  { href: '/produtos', label: 'Produtos', icon: Box, roles: ['admin', 'manager'] },
  { href: '/departamentos', label: 'Departamentos', icon: Layers, roles: ['admin', 'manager'] },
  { href: '/usuarios', label: 'Usuários', icon: Users, roles: ['admin', 'manager'] },
  { href: '/coletar', label: 'Coletar', icon: ScanLine, roles: ['admin', 'manager', 'operator'] },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2, roles: ['admin', 'manager'] },
  { href: '/meu-plano', label: 'Meu Plano', icon: CreditCard, roles: ['admin'] },
  { href: '/ajuda', label: 'Ajuda', icon: HelpCircle, roles: ['admin', 'manager', 'operator'] },
];

const mobileItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/vencimentos', label: 'Vencimentos', icon: List },
  { href: '/coletar', label: 'Coletar', icon: ScanLine },
  { href: '#', label: 'Menu', icon: Menu }, // Opens a drawer or similar
];

export function AppLayout({ 
  children, 
  storeName = 'Loja Principal',
  userRole = 'operator'
}: { 
  children: React.ReactNode;
  storeName?: string;
  userRole?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      
      {/* Desktop Header / Top Navigation */}
      <header className="hidden md:flex h-16 bg-primary items-center justify-between px-6 shadow-md z-10 w-full shrink-0 gap-4">
        
        {/* Page Title (Dynamic) replacing the Logo */}
        <div className="flex flex-col justify-center shrink-0 min-w-[200px]">
          <h2 className="text-white font-bold text-lg leading-tight truncate">
            {pathname === '/dashboard' ? 'Dashboard' : 
             pathname.startsWith('/produtos') ? 'Cadastro de Produtos' :
             pathname.startsWith('/departamentos') ? 'Departamentos' :
             pathname.startsWith('/coletar') ? 'Coleta de Produtos' :
             pathname.startsWith('/relatorios') ? 'Relatórios' :
             pathname.startsWith('/meu-plano') ? 'Meu Plano' : 'Validades'}
          </h2>
          <p className="text-white/70 text-[10px] truncate">
            {pathname === '/dashboard' ? 'Visão geral do controle de validades' : 
             pathname.startsWith('/produtos') ? 'Gerenciamento do catálogo' :
             pathname.startsWith('/departamentos') ? 'Gestão de setores' :
             pathname.startsWith('/coletar') ? 'Registro de vencimentos' :
             pathname.startsWith('/relatorios') ? 'Análise de dados' :
             pathname.startsWith('/meu-plano') ? 'Assinatura e cobrança' : ''}
          </p>
        </div>

        {/* Top Navigation Links - Flexible Space */}
        <nav className="flex-1 flex justify-center items-center h-full gap-2 overflow-x-auto hide-scrollbar px-2">
          {menuItems.filter(item => item.roles.includes(userRole)).map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center justify-end gap-4 shrink-0 min-w-[200px]">
          <select className="bg-white/10 text-white border border-white/20 rounded px-3 py-1.5 text-sm focus:outline-none max-w-[200px] truncate">
            <option className="text-black">{storeName}</option>
          </select>
          <button onClick={handleLogout} className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded text-sm transition-colors font-medium shrink-0">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:pt-2 md:px-6 md:pb-6 pb-20">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-primary text-white flex justify-around items-center h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-white bg-white/10" : "text-white/70"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
