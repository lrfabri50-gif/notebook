'use client';

import React, { useState } from 'react';
import { UploadCloud, X, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ImportButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setMessage('');

    try {
      const text = await file.text();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      const products = [];
      let startIdx = 0;
      
      // Ignore header row if it exists
      if (lines[0].toLowerCase().includes('barras') || lines[0].toLowerCase().includes('cód') || lines[0].toLowerCase().includes('codigo')) {
        startIdx = 1;
      }

      for (let i = startIdx; i < lines.length; i++) {
        const separator = lines[i].includes(';') ? ';' : ',';
        const cols = lines[i].split(separator).map(c => c.trim().replace(/^"|"$/g, ''));
        
        if (cols.length >= 3) {
          products.push({
            barcode: cols[0],
            description: cols[1],
            departmentName: cols[2]
          });
        }
      }

      if (products.length === 0) {
        throw new Error('Nenhum produto válido encontrado no arquivo. Verifique se o formato é: Código;Descrição;Departamento');
      }

      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao importar produtos');
      }

      alert(`Sucesso! ${data.count} produtos foram importados/atualizados.`);
      setIsOpen(false);
      setFile(null);
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
      >
        <UploadCloud className="w-4 h-4" /> Importar CSV
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => !isLoading && setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">Importar Produtos</h3>
            <p className="text-slate-500 text-sm mb-6">
              Faça o upload de um arquivo CSV contendo Cód. de Barras, Descrição e Departamento.
            </p>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className={`border-2 border-dashed border-slate-200 rounded-xl p-8 text-center transition-colors relative ${isLoading ? 'bg-slate-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}`}>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  required
                  disabled={isLoading}
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FileText className="w-8 h-8 text-slate-400" />
                  {file ? (
                    <span className="text-sm font-medium text-primary">{file.name}</span>
                  ) : (
                    <span className="text-sm text-slate-500">Clique ou arraste o arquivo .CSV aqui</span>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!file || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Carregando...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" /> Enviar Arquivo
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
