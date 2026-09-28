import React from 'react';
import { Printer, MessageCircle, X, Church, CheckCircle, ShieldCheck } from 'lucide-react';
import { CapelaInfo, Lancamento } from '../types';
import { formatCurrency, valorPorExtenso, formatarDataAniversario } from '../utils/pix';

interface ReceiptModalProps {
  isOpen: boolean;
  capela: CapelaInfo;
  lancamento: Lancamento | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  capela,
  lancamento,
  onClose,
}) => {
  if (!isOpen || !lancamento) return null;

  const numeroRecibo = lancamento.txid || `REC-${lancamento.id}-${new Date().getFullYear()}`;
  const dataExtenso = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const texto = `*RECIBO DE DÍZIMO / CONTRIBUIÇÃO PAROQUIAL* ⛪\n\n` +
      `*${capela.nome}* (${capela.cidade}/${capela.estado})\n` +
      `*Protocolo/Recibo:* ${numeroRecibo}\n` +
      `*Dizimista:* ${lancamento.nome}\n` +
      `*Valor:* ${formatCurrency(lancamento.valor)} (${valorPorExtenso(lancamento.valor)})\n` +
      `*Finalidade:* ${lancamento.tipo}\n` +
      `*Canal:* ${lancamento.origem}\n` +
      `*Data:* ${lancamento.dataRegistro}\n\n` +
      `_"Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama quem dá com alegria." (2 Cor 9:7)_\n\n` +
      `Agradecemos de coração pela sua generosidade e compromisso com nossa comunidade! Que Deus abençoe ricamente sua família e trabalho. 🙏✨`;

    const phoneClean = (lancamento.telefone || '').replace(/\D/g, '');
    const url = phoneClean.length >= 10
      ? `https://api.whatsapp.com/send?phone=55${phoneClean}&text=${encodeURIComponent(texto)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;

    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[92vh] overflow-y-auto relative flex flex-col touch-scroll">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="no-print p-3.5 sm:p-4 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold text-sm sm:text-base">Recibo Digital Paroquial</span>
          </div>
          <button
            onClick={onClose}
            className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Printable Receipt Body */}
        <div className="p-4 sm:p-8 space-y-5 sm:space-y-6 bg-white text-slate-800" id="area-recibo-impressao">
          {/* Header */}
          <div className="text-center border-b-2 border-blue-900 pb-3.5 sm:pb-4">
            <div className="inline-flex p-2 bg-blue-50 text-blue-900 rounded-full mb-2">
              <Church className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-blue-900 tracking-tight">
              {capela.nome}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              {capela.comunidade} · {capela.cidade} - {capela.estado}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Chave Pix: {capela.chavePix} · Pastoral do Dízimo
            </p>
          </div>

          {/* Receipt Title & Protocol */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Comprovante de Contribuição
              </span>
              <div className="text-xs sm:text-sm font-mono font-bold text-blue-950 break-all">
                Protocolo: {numeroRecibo}
              </div>
            </div>
            <div className="xs:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Data do Registro
              </span>
              <div className="text-xs font-semibold text-slate-800">
                {lancamento.dataRegistro}
              </div>
            </div>
          </div>

          {/* Receipt Value Highlight */}
          <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl text-center shadow-inner">
            <span className="text-xs uppercase tracking-wider text-blue-200 font-medium">
              Valor Contribuído
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold text-amber-300 font-mono mt-1">
              {formatCurrency(lancamento.valor)}
            </div>
            <p className="text-xs text-blue-100 italic mt-1 leading-snug">
              ({valorPorExtenso(lancamento.valor)})
            </p>
          </div>

          {/* Donor & Details Table */}
          <div className="space-y-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl p-3.5 sm:p-4 divide-y divide-slate-100">
            <div className="flex justify-between py-1.5 gap-2">
              <span className="text-slate-500 font-medium shrink-0">Dizimista:</span>
              <strong className="text-slate-900 uppercase font-bold text-right">{lancamento.nome}</strong>
            </div>

            {lancamento.nascimento && (
              <div className="flex justify-between py-1.5 gap-2">
                <span className="text-slate-500 font-medium shrink-0">Nascimento:</span>
                <span className="font-mono text-slate-800">{formatarDataAniversario(lancamento.nascimento)}</span>
              </div>
            )}

            {lancamento.telefone && (
              <div className="flex justify-between py-1.5 gap-2">
                <span className="text-slate-500 font-medium shrink-0">Contato:</span>
                <span className="font-mono text-slate-800">{lancamento.telefone}</span>
              </div>
            )}

            {lancamento.endereco && (
              <div className="flex justify-between py-1.5 gap-2">
                <span className="text-slate-500 font-medium shrink-0">Endereço:</span>
                <span className="text-slate-800 text-right">{lancamento.endereco}</span>
              </div>
            )}

            <div className="flex justify-between py-1.5 gap-2">
              <span className="text-slate-500 font-medium shrink-0">Finalidade:</span>
              <span className="font-bold text-blue-900 text-right">{lancamento.tipo}</span>
            </div>

            <div className="flex justify-between py-1.5 gap-2">
              <span className="text-slate-500 font-medium shrink-0">Canal:</span>
              <span className="text-slate-800 font-semibold text-right">{lancamento.origem}</span>
            </div>

            <div className="flex justify-between py-1.5 gap-2">
              <span className="text-slate-500 font-medium shrink-0">Status:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Quitado / Registrado
              </span>
            </div>
          </div>

          {/* Devotional Biblical Scripture */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 sm:p-3.5 text-center text-xs text-amber-950 italic">
            “Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama quem dá com alegria.”
            <span className="block not-italic font-bold text-amber-800 text-[11px] mt-1">
              — 2 Coríntios 9:7
            </span>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 sm:gap-4 text-center text-xs text-slate-600">
            <div>
              <div className="border-b border-slate-400 w-4/5 mx-auto mb-1"></div>
              <p className="font-semibold text-slate-800 text-[11px] sm:text-xs truncate">{capela.nome}</p>
              <p className="text-[10px] text-slate-500">Pastoral do Dízimo</p>
            </div>
            <div>
              <div className="border-b border-slate-400 w-4/5 mx-auto mb-1"></div>
              <p className="font-semibold text-slate-800 text-[11px] sm:text-xs truncate">{lancamento.nome}</p>
              <p className="text-[10px] text-slate-500">Dizimista Benfeitor</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400">
            {capela.cidade} - {capela.estado}, emitido em {dataExtenso}. DiziNet Pro.
          </div>
        </div>

        {/* Modal Actions (No print) */}
        <div className="no-print p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full sm:w-1/2 min-h-[48px] px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Compartilhar no WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-1/2 min-h-[48px] px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
