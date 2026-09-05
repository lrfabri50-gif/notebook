'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement real authentication
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-background md:bg-white flex-col md:flex-row">
      {/* Mobile Header / Desktop Logo */}
      <div className="md:hidden flex flex-col items-center justify-center p-8 bg-primary">
        <h1 className="text-white font-bold italic text-2xl">VALIDADE DE PRODUTOS</h1>
      </div>

      {/* Desktop Illustration Side */}
      <div className="hidden md:flex flex-1 bg-primary items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8ed7c663be?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="z-10 text-center p-8 text-white max-w-lg">
          <h1 className="text-4xl font-bold italic mb-4">VALIDADE DE PRODUTOS</h1>
          <p className="text-lg opacity-90">Controle, monitore e evite perdas no seu estoque com alertas automáticos e relatórios detalhados.</p>
        </div>
      </div>

      {/* Login Form Side */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 md:max-w-md lg:max-w-xl mx-auto w-full relative">
        <div className="bg-white p-8 rounded-2xl md:rounded-none md:p-0 shadow-lg md:shadow-none -mt-10 md:mt-0 relative z-10">
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl font-bold text-slate-800">Bem-vindo de volta!</h2>
            <p className="text-slate-500 mt-2">Faça login para acessar seu painel.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <a href="#" className="text-sm font-medium text-primary hover:text-primary-hover">Esqueceu sua senha? Clique aqui</a>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-primary/20"
            >
              Acessar
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-500">
            Ainda não tem conta? <a href="#" className="font-bold text-primary hover:text-primary-hover">Cadastre-se grátis</a>
          </div>
        </div>

        {/* Mobile Support Button */}
        <div className="mt-12 md:hidden">
          <a href="#" className="flex items-center justify-center gap-2 w-full bg-whatsapp hover:bg-whatsapp-hover text-white font-bold py-3.5 rounded-xl transition-colors">
            Suporte via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
