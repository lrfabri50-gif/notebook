'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, ShieldCheck, Tag, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { quickUpdatePrice } from './actions';

export interface TimelineItem {
  id: string;
  daysLeft: number;
  productDescription: string;
  barcode: string;
  departmentName: string;
  shelfLocation: string | null;
  batch: string | null;
  quantity: number;
  expirationFormatted: string;
  priceChange: string | null;
  estimatedRisk: number; // R$
}

interface TimelineDecisionMatrixProps {
  expiredOrToday: TimelineItem[];
  threeDays: TimelineItem[];
  fourToSevenDays: TimelineItem[];
  eightToFifteenDays: TimelineItem[];
}

export default function TimelineDecisionMatrix({
  expiredOrToday,
  threeDays,
  fourToSevenDays,
  eightToFifteenDays
}: TimelineDecisionMatrixProps) {
  const [activeTab, setActiveTab] = useState<'expired' | 'three' | 'seven' | 'fifteen'>('three');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const tabs = [
    {
      id: 'expired',
      label: 'Crítico / Vencidos',
      count: expiredOrToday.length,
      items: expiredOrToday,
      activeColor: 'border-rose-600 text-rose-700 bg-rose-50/50',
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'three',
      label: 'Alerta 3 Dias (WhatsApp)',
      count: threeDays.length,
      items: threeDays,
      activeColor: 'border-amber-600 text-amber-800 bg-amber-50/50',
      badgeColor: 'bg-amber-100 text-amber-900'
    },
    {
      id: 'seven',
      label: '4 a 7 Dias (Oferta)',
      count: fourToSevenDays.length,
      items: fourToSevenDays,
      activeColor: 'border-emerald-600 text-emerald-800 bg-emerald-50/50',
      badgeColor: 'bg-emerald-100 text-emerald-900'
    },
    {
      id: 'fifteen',
      label: '8 a 15 Dias (Prevenção)',
      count: eightToFifteenDays.length,
      items: eightToFifteenDays,
      activeColor: 'border-slate-800 text-slate-900 bg-slate-100',
      badgeColor: 'bg-slate-200 text-slate-800'
    }
  ] as const;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];

  const handleSavePrice = async (collectionId: string) => {
    if (!priceInput.trim()) return;
    setLoadingId(collectionId);
    try {
      await quickUpdatePrice(collectionId, priceInput.trim());
      setSuccessId(collectionId);
      setEditingId(null);
      setPriceInput('');
      setTimeout(() => setSuccessId(null), 3000);
    } catch (err) {
      alert('Erro ao salvar novo preço');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" /> Régua de Decisão e Ação Imediata
          </h3>
          <p className="text-xs text-slate-500">
            Navegue pelos horizontes de vencimento e aplique rebaixas de preço preventivas em tempo real
          </p>
        </div>

        <Link
          href="/relatorios"
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors self-start sm:self-auto"
        >
          Ver relatório analítico <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs / Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingId(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                isActive
                  ? `${tab.activeColor} shadow-sm`
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${tab.badgeColor}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items List */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {currentTab.items.length === 0 ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <ShieldCheck className="w-10 h-10 text-emerald-500 opacity-60" />
            <p className="text-sm font-semibold text-slate-700">Nenhum produto nesta faixa de tempo!</p>
            <p className="text-xs text-slate-400">Excelente! Nenhum item crítico registrado para essa janela.</p>
          </div>
        ) : (
          currentTab.items.map((item) => {
            const isEditing = editingId === item.id;
            const isSaved = successId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                    item.daysLeft <= 0
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : item.daysLeft <= 3
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    <span className="text-[9px] uppercase font-bold tracking-tight">
                      {item.daysLeft <= 0 ? 'Venc' : 'Dias'}
                    </span>
                    <span className="text-base font-black leading-none">
                      {item.daysLeft <= 0 ? `${Math.abs(item.daysLeft)}d` : item.daysLeft}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                      {item.productDescription}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                        {item.departmentName}
                      </span>
                      {item.shelfLocation && (
                        <span>Local: <strong>{item.shelfLocation}</strong></span>
                      )}
                      <span>Lote: <strong>{item.batch || 'N/A'}</strong></span>
                      <span>Vencimento: <strong>{item.expirationFormatted}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Quantities & Quick Action */}
                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Estoque</span>
                    <span className="font-black text-slate-800 text-sm">{item.quantity} un</span>
                    {item.estimatedRisk > 0 && (
                      <span className="text-[11px] text-rose-600 block font-semibold">
                        R$ {item.estimatedRisk.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Promotion Action */}
                  <div className="flex items-center gap-2">
                    {isSaved ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" /> Oferta Ativa!
                      </span>
                    ) : isEditing ? (
                      <div className="flex items-center gap-1.5 bg-white border border-emerald-400 p-1 rounded-lg shadow-sm">
                        <span className="text-xs font-bold text-slate-500 pl-1.5">R$</span>
                        <input
                          type="text"
                          autoFocus
                          placeholder="0,00"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                          className="w-16 text-xs font-bold text-slate-900 focus:outline-none"
                        />
                        <button
                          onClick={() => handleSavePrice(item.id)}
                          disabled={loadingId === item.id}
                          className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[11px] font-bold hover:bg-emerald-800 transition-colors"
                        >
                          {loadingId === item.id ? '...' : 'Salvar'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setPriceInput('');
                          }}
                          className="px-1.5 py-1 text-slate-400 hover:text-slate-600 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setPriceInput(item.priceChange || '');
                        }}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                          item.priceChange
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <Tag className="w-3.5 h-3.5 text-emerald-700" />
                        {item.priceChange ? `R$ ${item.priceChange}` : 'Aplicar Oferta'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
