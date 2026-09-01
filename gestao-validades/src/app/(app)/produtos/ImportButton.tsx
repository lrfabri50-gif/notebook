'use client';

import React, { useState } from 'react';
import { UploadCloud, X, FileText } from 'lucide-react';

export default function ImportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    // Simulate upload
    alert(`Arquivo ${file.name} processado com sucesso!`);
    setIsOpen(false);
    setFile(null);
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
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">Importar Produtos</h3>
            <p className="text-slate-500 text-sm mb-6">
              Faça o upload de um arquivo CSV contendo Cód. de Barras, Descrição e Departamento.
            </p>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
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
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-colors mt-2"
                disabled={!file}
              >
                <UploadCloud className="w-5 h-5" /> Processar Arquivo
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
