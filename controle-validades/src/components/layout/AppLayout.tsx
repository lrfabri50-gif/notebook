'use client';

import React, { useState } from 'react';
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
  Menu,
  X,
  LogOut,
  Smartphone
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
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
  { href: '/coletar', label: 'Coletar', icon: ScanLine },
  { href: '#menu', label: 'Menu', icon: Menu }, 
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

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
    <div className="flex flex-col h-[100dvh] w-full bg-background overflow-hidden relative">
      
      {/* Desktop Header / Top Navigation */}
      <header className="hidden md:flex h-16 bg-primary items-center justify-between px-6 shadow-md z-10 w-full shrink-0 gap-4">
        
        {/* Page Title (Dynamic) replacing the Logo */}
        <div className="flex flex-col justify-center shrink-0 min-w-[200px]">
          <h2 className="text-white font-bold text-lg leading-tight truncate">
            {pathname === '/dashboard' ? 'Painel' : 
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
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-xl overflow-hidden flex flex-col max-h-[80dvh] animate-in slide-in-from-bottom-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">Menu Principal</h3>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex flex-col gap-2">
              <div className="bg-slate-50 p-3 rounded-lg mb-2 flex items-center justify-between border">
                <span className="text-sm font-medium text-slate-700">{storeName}</span>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full uppercase font-bold">{userRole}</span>
              </div>
              
              {menuItems.filter(item => item.roles.includes(userRole)).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'bg-white border border-slate-100 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <Icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-primary")} />
                    {item.label}
                  </Link>
                );
              })}
              
              <button 
                onClick={() => setShowInstallPrompt(true)}
                className="mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100"
              >
                <Smartphone className="w-5 h-5" /> Instalar Aplicativo
              </button>
              
              <button 
                onClick={handleLogout} 
                className="mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold border border-red-100"
              >
                <LogOut className="w-5 h-5" /> Sair do Sistema
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install App Prompt Modal */}
      {showInstallPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowInstallPrompt(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowInstallPrompt(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Instalar Aplicativo</h3>
            <p className="text-slate-500 text-center text-sm mb-6">
              Tenha o sistema direto na tela do seu celular como um app nativo!
            </p>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-sm text-slate-800 mb-1 flex items-center gap-2">🍎 No iPhone (Safari)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Toque no botão <strong>Compartilhar</strong> (quadrado com seta para cima) na barra inferior e depois em <strong>"Adicionar à Tela de Início"</strong>.
                </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-sm text-slate-800 mb-1 flex items-center gap-2">🤖 No Android (Chrome)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Toque nos <strong>3 pontinhos</strong> no canto superior direito e depois selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar aplicativo"</strong>.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowInstallPrompt(false)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-primary text-white flex justify-around items-center h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isMenu = item.href === '#menu';
          const isActive = !isMenu && pathname === item.href;
          return (
            <button
              key={item.label} 
              onClick={(e) => {
                if (isMenu) {
                  e.preventDefault();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                } else {
                  router.push(item.href);
                }
              }}
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                (isActive || (isMenu && isMobileMenuOpen)) ? "text-white bg-white/10" : "text-white/70"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
