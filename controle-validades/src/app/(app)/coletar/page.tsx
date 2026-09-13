'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Search, Plus, X, AlertCircle } from 'lucide-react';
import { useZxing } from 'react-zxing';
import { createCollection, getProductByBarcode } from './actions';
import { useRouter } from 'next/navigation';

function BarcodeScanner({ onResult, onClose }: { onResult: (text: string) => void, onClose: () => void }) {
  const { ref } = useZxing({
    onDecodeResult(result) {
      onResult(result.rawValue);
    },
    onError(error) {
      // Ignore common Not-found errors
    }
  });

  return (
    <div className="relative bg-black rounded-xl overflow-hidden aspect-[4/5] flex flex-col">
      <style>{`
        @keyframes scanLine {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
      <video ref={ref} className="flex-1 w-full h-full bg-black relative object-cover" autoPlay playsInline muted />
      {/* Overlay Laser Animado */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
        <div className="w-[280px] h-[150px] border-2 border-white/20 rounded-lg relative overflow-hidden">
          <div 
            className="w-full h-0.5 bg-red-500 absolute left-0" 
            style={{ 
              boxShadow: '0 0 8px 2px rgba(239,68,68,0.8)',
              animation: 'scanLine 2.5s ease-in-out infinite' 
            }}
          ></div>
        </div>
      </div>
      
      <button 
        type="button"
        onClick={onClose} 
        className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur border border-white/20 text-white p-2 rounded-full z-20"
      >
        <X className="w-6 h-6" />
      </button>
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
        <p className="bg-black/70 backdrop-blur text-white px-5 py-2 rounded-full text-sm font-medium border border-white/10 shadow-lg">
          Aponte para o código de barras
        </p>
      </div>
    </div>
  );
}

export default function ColetaPage() {
  const [barcode, setBarcode] = useState('');
  const [expiration, setExpiration] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [batch, setBatch] = useState('');
  const [location, setLocation] = useState('');
  
  const [isScanning, setIsScanning] = useState(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [productInfo, setProductInfo] = useState<{ description: string, department: string } | null>(null);
  
  const router = useRouter();

  // Debounced product lookup
  useEffect(() => {
    const fetchProduct = async () => {
      if (barcode.length < 3) {
        setProductInfo(null);
        return;
      }
      setIsSearchingProduct(true);
      try {
        const product = await getProductByBarcode(barcode);
        if (product) {
          setProductInfo(product);
          setShowNotFoundModal(false);
        } else {
          setProductInfo(null);
        }
      } catch (err) {
        console.error("Error looking up product", err);
      } finally {
        setIsSearchingProduct(false);
      }
    };

    const debounceTimer = setTimeout(fetchProduct, 600);
    return () => clearTimeout(debounceTimer);
  }, [barcode]);

  const handleScanResult = (decodedText: string) => {
    setBarcode(decodedText);
    setIsScanning(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode) return;
    if (!productInfo) {
      setShowNotFoundModal(true);
      return;
    }
    
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
      setProductInfo(null);
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
            <div className="flex-1 relative">
              <label className="block text-xs font-medium text-slate-500 mb-1">Cód. Barras</label>
              <input type="text" value={barcode} onChange={(e)=>setBarcode(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="0000000000" required />
              
              {/* Desktop Product Info Display */}
              {isSearchingProduct && (
                <div className="absolute top-[110%] left-0 text-xs text-primary font-medium">Buscando...</div>
              )}
              {!isSearchingProduct && productInfo && (
                <div className="absolute top-[110%] left-0 text-xs text-slate-600 truncate max-w-full">
                  <span className="font-bold text-slate-800">{productInfo.description}</span>
                  {productInfo.department && <span className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">{productInfo.department}</span>}
                </div>
              )}
              {!isSearchingProduct && !productInfo && barcode.length >= 3 && (
                <div className="absolute top-[110%] left-0 text-xs flex items-center gap-2">
                  <span className="text-red-500 font-medium">Produto não encontrado.</span>
                  <button 
                    type="button" 
                    onClick={() => router.push(`/produtos?barcode=${barcode}`)}
                    className="text-primary hover:underline font-bold"
                  >
                    Cadastrar
                  </button>
                </div>
              )}
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
            <BarcodeScanner 
              onResult={handleScanResult} 
              onClose={() => setIsScanning(false)} 
            />
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

              {/* Mobile Product Info Display */}
              {barcode.length >= 3 && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col items-center justify-center min-h-[60px] text-center">
                  {isSearchingProduct ? (
                    <span className="text-sm font-medium text-slate-500 animate-pulse">Buscando produto...</span>
                  ) : productInfo ? (
                    <>
                      <span className="font-bold text-slate-800 leading-tight">{productInfo.description}</span>
                      {productInfo.department && <span className="text-xs text-slate-500 mt-0.5">{productInfo.department}</span>}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-medium text-red-500">Produto não encontrado</span>
                      <button 
                        type="button" 
                        onClick={() => router.push(`/produtos?barcode=${barcode}`)}
                        className="text-xs bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Cadastrar agora
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex flex-col gap-4">
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
