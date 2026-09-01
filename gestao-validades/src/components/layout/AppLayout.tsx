'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/produtos', label: 'Produtos', icon: Box },
  { href: '/departamentos', label: 'Departamentos', icon: Layers },
  { href: '/usuarios', label: 'Usuários', icon: Users },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
  { href: '/coletar', label: 'Coletar', icon: ScanLine },
  { href: '/meu-plano', label: 'Meu Plano', icon: CreditCard },
  { href: '/ajuda', label: 'Ajuda', icon: HelpCircle },
];

const mobileItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/vencimentos', label: 'Vencimentos', icon: List },
  { href: '/coletar', label: 'Coletar', icon: ScanLine },
  { href: '#', label: 'Menu', icon: Menu }, // Opens a drawer or similar
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="h-16 flex items-center justify-center border-b border-slate-200 bg-primary">
          <h1 className="text-white font-bold italic text-lg">GESTÃO DE VALIDADES</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive 
                        ? 'bg-slate-100 text-primary' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <Icon className={clsx("w-5 h-5", isActive ? "text-primary" : "text-slate-400")} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-primary items-center justify-between px-6 shadow-sm z-10">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <select className="bg-white/10 text-white border border-white/20 rounded px-3 py-1.5 text-sm focus:outline-none">
              <option className="text-black">Loja Principal</option>
            </select>
            <button className="flex items-center gap-2 text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm transition-colors font-medium">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

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
                isActive ? "text-white" : "text-white/70"
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
