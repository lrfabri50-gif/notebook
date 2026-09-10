'use client';

import React from 'react';
import { Download, FileText, Table, MessageCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ExportData = {
  id: string;
  statusLabel: string;
  productDesc: string;
  barcode: string;
  department: string;
  expirationStr: string;
  batch: string;
  quantity: number;
  priceChange?: string;
};

export default function ExportButtons({ data }: { data: ExportData[] }) {
  const handleExportCSV = () => {
    // Cabeçalho do CSV (com BOM para acentuação UTF-8 no Excel)
    let csvContent = '\uFEFF'; 
    csvContent += 'Status;Produto;Código;Departamento;Vencimento;Lote;Quantidade;Alteração de Preço\n';

    // Adiciona as linhas
    data.forEach(row => {
      const line = [
        row.statusLabel,
        `"${row.productDesc.replace(/"/g, '""')}"`, // escapa aspas
        `"${row.barcode}"`,
        `"${row.department}"`,
        row.expirationStr,
        `"${row.batch}"`,
        row.quantity,
        `"${row.priceChange || ''}"` // Usando o preço alterado
      ].join(';');
      csvContent += line + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_validades_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');

    // Título
    doc.setFontSize(16);
    doc.text('Relatório de Validades', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);

    const tableColumn = ['Status', 'Produto', 'Código', 'Departamento', 'Venc.', 'Lote', 'Qtd', 'Alteração de Preço'];
    const tableRows = data.map(row => [
      row.statusLabel,
      row.productDesc,
      row.barcode,
      row.department,
      row.expirationStr,
      row.batch,
      row.quantity,
      row.priceChange || '' // Usando o preço alterado
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [18, 140, 126] }, // Cor primária (verde WhatsApp)
    });

    doc.save(`relatorio_validades_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
  };

  const handleExportWhatsApp = () => {
    if (data.length === 0) {
      alert("Nenhum dado para exportar.");
      return;
    }

    let message = `*Relatório de Validades*\n_Gerado em: ${new Date().toLocaleDateString('pt-BR')}_\n\n`;

    data.forEach(row => {
      message += `*${row.productDesc}*\n`;
      message += `Status: ${row.statusLabel}\n`;
      message += `Vencimento: ${row.expirationStr}\n`;
      message += `Qtd: ${row.quantity}\n`;
      if (row.priceChange) {
        message += `*Novo Preço: R$ ${row.priceChange}*\n`;
      }
      message += `-----------------\n`;
    });

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="flex gap-2 items-center ml-4">
      <button 
        onClick={handleExportWhatsApp}
        className="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
        title="Enviar por WhatsApp"
      >
        <MessageCircle className="w-4 h-4" /> WhatsApp
      </button>

      <button 
        onClick={handleExportPDF}
        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
        title="Baixar em PDF (para imprimir)"
      >
        <FileText className="w-4 h-4 text-red-500" /> PDF
      </button>

      <button 
        onClick={handleExportCSV}
        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
        title="Baixar em Excel (CSV)"
      >
        <Table className="w-4 h-4" /> Excel (CSV)
      </button>
    </div>
  );
}
