import React from 'react';
import { Printer, X, Church, FileText } from 'lucide-react';
import { CapelaInfo, Lancamento } from '../types';
import { formatCurrency, formatarDataAniversario, formatarDataRegistro } from '../utils/pix';

interface ReportModalProps {
  isOpen: boolean;
  capela: CapelaInfo;
  lancamentos: Lancamento[];
  filtroMes: string;
  filtroAno: string;
  filtroOrigem: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  capela,
  lancamentos,
  filtroMes,
  filtroAno,
  filtroOrigem,
  onClose,
}) => {
  if (!isOpen) return null;

  const totalGeral = lancamentos.reduce((acc, l) => acc + (Number(l.valor) || 0), 0);
  const totalPix = lancamentos
    .filter((l) => (l.origem || '').toLowerCase().includes('pix'))
    .reduce((acc, l) => acc + (Number(l.valor) || 0), 0);
  const totalAgentes = totalGeral - totalPix;

  const nomeMeses = [
    '',
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const descricaoMes = filtroMes ? nomeMeses[parseInt(filtroMes, 10)] : 'Todos os Meses';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] overflow-y-auto relative flex flex-col touch-scroll">
        {/* Top bar (No print) */}
        <div className="no-print p-3.5 sm:p-4 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-bold text-xs sm:text-base truncate">
              Relatório Contábil da Pastoral do Dízimo
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => window.print()}
              className="min-h-[38px] px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden xs:inline">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-4 sm:p-8 space-y-5 sm:space-y-6 text-slate-800" id="area-relatorio-impressao">
          {/* Header */}
          <div className="text-center border-b-2 border-blue-900 pb-3.5 sm:pb-4">
            <div className="inline-flex p-2 bg-blue-50 text-blue-900 rounded-full mb-1">
              <Church className="w-7 h-7" />
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-blue-900 tracking-tight">
              {capela.nome}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {capela.comunidade} · {capela.cidade} - {capela.estado}
            </p>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide mt-2">
              Demonstrativo Financeiro de Dízimos e Ofertas
            </h3>
          </div>

          {/* Metadata Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-600 gap-1.5">
            <div>
              <strong>Período:</strong> {descricaoMes} / {filtroAno === 'all' ? 'Todos os Anos' : filtroAno}
              {filtroOrigem ? ` · Canal: ${filtroOrigem}` : ' · Todos os Canais'}
            </div>
            <div>
              <strong>Emissão:</strong> {new Date().toLocaleDateString('pt-BR')} às{' '}
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
              <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                Total Arrecadado
              </span>
              <div className="text-xl sm:text-2xl font-black text-blue-900 font-mono mt-0.5">
                {formatCurrency(totalGeral)}
              </div>
              <span className="text-[11px] text-blue-700">{lancamentos.length} lançamentos</span>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Arrecadação Pix
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 font-mono mt-0.5">
                {formatCurrency(totalPix)}
              </div>
              <span className="text-[11px] text-emerald-700">
                {totalGeral > 0 ? ((totalPix / totalGeral) * 100).toFixed(1) : 0}% do total
              </span>
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                Agentes & Físico
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-900 font-mono mt-0.5">
                {formatCurrency(totalAgentes)}
              </div>
              <span className="text-[11px] text-amber-700">
                {totalGeral > 0 ? ((totalAgentes / totalGeral) * 100).toFixed(1) : 0}% do total
              </span>
            </div>
          </div>

          {/* Table with smooth horizontal scroll */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl touch-scroll">
            <table className="w-full text-left text-xs text-slate-700 min-w-[500px]">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-10">#</th>
                  <th className="p-2.5">Dizimista</th>
                  <th className="p-2.5">Nasc. / Contato</th>
                  <th className="p-2.5">Finalidade</th>
                  <th className="p-2.5">Canal</th>
                  <th className="p-2.5">Data</th>
                  <th className="p-2.5 text-right">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lancamentos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      Nenhum lançamento corresponde aos filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  lancamentos.map((l, idx) => (
                    <tr key={l.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900 uppercase">{l.nome}</td>
                      <td className="p-2.5 font-mono text-[11px]">
                        {formatarDataAniversario(l.nascimento)}
                        {l.telefone && <span className="block text-slate-400">{l.telefone}</span>}
                      </td>
                      <td className="p-2.5">{l.tipo}</td>
                      <td className="p-2.5 text-slate-600">{l.origem}</td>
                      <td className="p-2.5 font-mono text-[11px]">
                        {formatarDataRegistro(l.dataRegistro)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-blue-900">
                        {formatCurrency(l.valor)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-4 sm:gap-8 text-center text-xs text-slate-600">
            <div>
              <div className="border-b border-slate-400 w-4/5 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800 text-[11px] sm:text-xs">Pároco / Administrador</p>
              <p className="text-[10px] text-slate-500">Visto da Paróquia</p>
            </div>
            <div>
              <div className="border-b border-slate-400 w-4/5 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800 text-[11px] sm:text-xs">Coordenação do Dízimo</p>
              <p className="text-[10px] text-slate-500">Tesouraria Comunitária</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions (No print) */}
        <div className="no-print p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex flex-col sm:flex-row justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[42px] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto min-h-[42px] px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>
    </div>
  );
};
