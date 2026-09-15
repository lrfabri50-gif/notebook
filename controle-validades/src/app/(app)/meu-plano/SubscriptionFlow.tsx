'use client';

import React, { useState } from 'react';
import { processCheckout } from './actions';
import { Minus, Plus, ShieldCheck } from 'lucide-react';

interface Props {
  isActive: boolean;
  currentPlanName: string;
  maxUsers: number;
  adminEmail: string;
}

export default function SubscriptionFlow({ isActive, currentPlanName, maxUsers, adminEmail }: Props) {
  // Configurações de Preço
  const BASE_PRICE = 23.90;
  const EXTRA_USER_PRICE = 5.90;

  // Estado
  const [additionalUsers, setAdditionalUsers] = useState(maxUsers > 1 ? maxUsers - 1 : 0);
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>(currentPlanName.toLowerCase().includes('anual') ? 'anual' : 'mensal');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'payment' | 'success'>(isActive ? 'success' : 'form');
  
  const [formData, setFormData] = useState({
    document: '',
    name: '',
    email: adminEmail || ''
  });

  const monthlyTotal = BASE_PRICE + (additionalUsers * EXTRA_USER_PRICE);
  const annualTotal = monthlyTotal * 11; // Desconto: Paga 11, Leva 12 (~8% off)
  const finalAmount = billingCycle === 'mensal' ? monthlyTotal : annualTotal;

  const handleGoToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.document || !formData.name || !formData.email) {
      alert('Por favor, preencha todos os dados.');
      return;
    }
    setStep('payment');
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await processCheckout({
        additionalUsers,
        billingCycle,
        amount: finalAmount
      });
      setStep('success');
    } catch (err: any) {
      alert(err.message || 'Erro ao simular pagamento.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-8 text-center max-w-lg mx-auto mt-8">
        <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-emerald-900 mb-2">Assinatura Ativa!</h3>
        <p className="text-emerald-700 font-medium mb-6">Sua loja está protegida com o plano {currentPlanName || 'Personalizado'}.</p>
        <div className="bg-white rounded-xl p-4 border border-emerald-100 flex justify-around text-emerald-900">
          <div>
            <p className="text-sm text-emerald-600">Usuários Liberados</p>
            <p className="font-bold text-xl">{maxUsers}</p>
          </div>
          <div>
            <p className="text-sm text-emerald-600">Cobrança</p>
            <p className="font-bold text-xl capitalize">{billingCycle}</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="max-w-md mx-auto bg-slate-50 min-h-screen pb-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 mt-8">
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between relative">
          <button onClick={() => setStep('form')} className="text-slate-400 hover:text-slate-600 font-medium text-sm">
            Voltar
          </button>
          <h2 className="text-xl font-medium text-slate-800">Pagamento</h2>
          <div className="w-10"></div> {/* Spacer para centralizar o título */}
        </div>
        
        <div className="p-6 space-y-6">
          
          <div className="bg-emerald-600 text-white rounded-2xl p-6 text-center shadow-lg shadow-emerald-600/20">
            <p className="text-emerald-100 text-sm font-medium mb-1">Total a pagar</p>
            <h3 className="text-4xl font-black mb-2">R$ {finalAmount.toFixed(2).replace('.', ',')}</h3>
            <p className="text-emerald-200 text-xs">Plano {billingCycle === 'anual' ? 'Anual' : 'Mensal'} • {additionalUsers + 1} Usuário(s)</p>
          </div>

          <div>
            <h3 className="text-slate-800 font-medium mb-3">Como você quer pagar?</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  </div>
                  <span className="text-slate-700 font-bold">PIX (Aprovação na hora)</span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border-2 border-slate-200 bg-white opacity-50 cursor-not-allowed flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                  <span className="text-slate-500 font-medium">Cartão de Crédito (Em breve)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-800 text-sm">
            <p className="font-bold mb-1">Ambiente de Teste</p>
            <p>Esta é uma simulação. Clique no botão abaixo para concluir o pagamento de mentirinha e ativar o plano.</p>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Confirmar Pagamento Simulado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen pb-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 mt-8">
      
      {/* HEADER SIMULANDO MOBILE */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-center relative">
        <h2 className="text-xl font-medium text-slate-800">Assinatura do Plano</h2>
      </div>

      <form onSubmit={handleGoToPayment} className="p-6 space-y-6">
        
        {/* SEU PLANO CARD */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium mb-4">Seu Plano</h3>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-700">Valor da Loja <span className="text-xs text-slate-400 block">(1 Admin)</span></span>
            <span className="font-medium text-slate-900">R$ {BASE_PRICE.toFixed(2).replace('.', ',')}</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <div>
              <span className="text-slate-700 block">Usuários Adicionais</span>
              <span className="text-xs text-slate-400">R$ {EXTRA_USER_PRICE.toFixed(2).replace('.', ',')} / usuário</span>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <button 
                type="button" 
                onClick={() => setAdditionalUsers(Math.max(0, additionalUsers - 1))}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-slate-200 text-slate-600 hover:text-slate-900"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-4 text-center font-bold text-slate-800">{additionalUsers}</span>
              <button 
                type="button" 
                onClick={() => setAdditionalUsers(additionalUsers + 1)}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-slate-200 text-slate-600 hover:text-slate-900"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ESCOLHA O PERIODO */}
        <div>
          <h3 className="text-slate-800 font-medium mb-3">Escolha o Período de Cobrança:</h3>
          <div className="space-y-3">
            
            {/* Mensal */}
            <label 
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                billingCycle === 'mensal' 
                  ? 'border-emerald-500 bg-emerald-50/30' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              onClick={() => setBillingCycle('mensal')}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${billingCycle === 'mensal' ? 'border-emerald-500' : 'border-slate-300'}`}>
                  {billingCycle === 'mensal' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                </div>
                <span className="text-slate-600 font-medium">Assinatura Mensal</span>
              </div>
              <span className="text-xl font-bold text-slate-900">R$ {monthlyTotal.toFixed(2).replace('.', ',')}</span>
            </label>

            {/* Anual */}
            <label 
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                billingCycle === 'anual' 
                  ? 'border-emerald-500 bg-emerald-50/30' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              onClick={() => setBillingCycle('anual')}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${billingCycle === 'anual' ? 'border-emerald-500' : 'border-slate-300'}`}>
                  {billingCycle === 'anual' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                </div>
                <div>
                  <span className="text-slate-600 font-medium block">Assinatura Anual</span>
                  <span className="text-teal-600 text-xs font-bold">1 mês grátis (Pague 11)</span>
                </div>
              </div>
              <span className="text-xl font-bold text-slate-900">R$ {annualTotal.toFixed(2).replace('.', ',')}</span>
            </label>

          </div>
        </div>

        {/* DADOS */}
        <div>
          <h3 className="text-slate-800 font-medium mb-3">Seus dados:</h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
            
            <input 
              type="text" 
              placeholder="CPF / CNPJ"
              required
              value={formData.document}
              onChange={e => setFormData({...formData, document: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 bg-slate-50/50"
            />
            
            <input 
              type="text" 
              placeholder="Nome Completo / Razão Social"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 bg-slate-50/50"
            />
            
            <div className="relative">
              <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-slate-400 font-medium">E-mail</span>
              <input 
                type="email" 
                placeholder="gerente@supermercado.com.br"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 bg-slate-50/50"
              />
            </div>

          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          Continuar para Pagamento
        </button>
        
        <div className="text-center space-y-1 pt-2">
          <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-full inline-block">
            ✨ Avisos por WhatsApp inclusos 100% grátis
          </p>
        </div>
      </form>

    </div>
  );
}
