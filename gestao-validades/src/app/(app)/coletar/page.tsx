'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Search, Plus, X, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { createCollection } from './actions';
import { useRouter } from 'next/navigation';

export default function ColetaPage() {
  const [barcode, setBarcode] = useState('');
  const [expiration, setExpiration] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [batch, setBatch] = useState('');
  const [location, setLocation] = useState('');
  
  const [isScanning, setIsScanning] = useState(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let html5QrCode: Html5Qrcode;
    if (isScanning) {
      html5QrCode = new Html5Qrcode("reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          setBarcode(decodedText);
          stopScanner(html5QrCode);
          // Simulate product lookup
          if (decodedText === '123') setShowNotFoundModal(true);
        },
        () => {}
      ).catch(err => console.error(err));
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  const stopScanner = (scannerInstance?: Html5Qrcode) => {
    setIsScanning(false);
    if (scannerInstance && scannerInstance.isScanning) {
      scannerInstance.stop().catch(console.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('barcode', barcode);
    formData.append('expirationDate', expiration);
    formData.append('quantity', quantity);
    formData.append('batch', batch);
    formData.append('shelfLocation', location);

    const res = await createCollection(formData);
    setLoading(false);

    if (res?.error === 'PRODUTO_NAO_ENCONTRADO') {
      setShowNotFoundModal(true);
      return;
    }

    if (res?.success) {
      alert(`Coleta salva com sucesso!`);
      setBarcode('');
      setExpiration('');
      setQuantity('1');
      setBatch('');
      setLocation('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Coleta de Validade</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Desktop Quick Insert Line */}
        <div className="hidden md:block p-6">
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Cód. Barras</label>
              <input type="text" value={barcode} onChange={(e)=>setBarcode(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="0000000000" required />
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-slate-500 mb-1">Vencimento</label>
              <input type="date" value={expiration} onChange={(e)=>setExpiration(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
            </div>
            <div className="w-20">
              <label className="block text-xs font-medium text-slate-500 mb-1">Qtde</label>
              <input type="number" value={quantity} onChange={(e)=>setQuantity(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" min="1" required />
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-slate-500 mb-1">Lote (Opc)</label>
              <input type="text" value={batch} onChange={(e)=>setBatch(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-slate-500 mb-1">Local (Opc)</label>
              <input type="text" value={location} onChange={(e)=>setLocation(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap disabled:opacity-50">
              {loading ? 'Enviando...' : 'Enviar Coleta'}
            </button>
          </form>
        </div>

        {/* Mobile View */}
        <div className="md:hidden p-4 space-y-4">
          {isScanning ? (
            <div className="relative bg-black rounded-xl overflow-hidden aspect-[4/5] flex flex-col">
              <div id="reader" className="flex-1 w-full bg-black"></div>
              {/* Overlay with red line is handled by html5-qrcode but we can style it */}
              <button 
                onClick={() => stopScanner()} 
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur text-white p-2 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <p className="bg-black/50 text-white px-4 py-1.5 rounded-full text-sm">Posicione o código de barras na mira</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input 
                    type="number" 
                    value={barcode} 
                    onChange={(e)=>setBarcode(e.target.value)} 
                    className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-lg font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                    placeholder="Código de Barras" 
                    required 
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsScanning(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Vencimento</label>
                  <input type="date" value={expiration} onChange={(e)=>setExpiration(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Quantidade</label>
                  <input type="number" value={quantity} onChange={(e)=>setQuantity(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" min="1" required />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-primary/20 mt-4 disabled:opacity-50">
                {loading ? 'Processando...' : 'Confirmar Coleta'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Modal: Produto Não Cadastrado */}
      {showNotFoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-primary flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Produto Não Encontrado</h3>
            <p className="text-slate-500 text-center mb-6 text-sm">
              O código de barras <strong className="text-slate-700">{barcode}</strong> não está cadastrado no sistema. Deseja cadastrá-lo agora?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowNotFoundModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                Não
              </button>
              <button 
                onClick={() => {
                  setShowNotFoundModal(false);
                  router.push(`/produtos?barcode=${barcode}`);
                }}
                className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
