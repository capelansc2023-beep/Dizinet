import React, { useState, useEffect } from 'react';
import { X, Heart, Save } from 'lucide-react';
import { Intencao } from '../types';
import { normalizarData, toIsoDate } from '../utils/pix';

interface IntencaoModalProps {
  isOpen: boolean;
  intencao: Intencao | null;
  onSave: (data: Partial<Intencao>) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const IntencaoModal: React.FC<IntencaoModalProps> = ({
  isOpen,
  intencao,
  onSave,
  onClose,
  onToast,
}) => {
  const [solicitante, setSolicitante] = useState('');
  const [falecido, setFalecido] = useState('');
  const [data, setData] = useState('');
  const [tipoIntencao, setTipoIntencao] = useState<'Ação de Graças' | 'Sufrágio dos Falecidos' | 'Saúde e Cura' | 'Aniversário' | 'Outro'>('Ação de Graças');

  useEffect(() => {
    if (isOpen) {
      if (intencao) {
        setSolicitante(intencao.solicitante || '');
        setFalecido(intencao.falecido || '');
        setData(toIsoDate(intencao.data));
        setTipoIntencao(intencao.tipoIntencao || 'Ação de Graças');
      } else {
        setSolicitante('');
        setFalecido('');
        setData(new Date().toISOString().slice(0, 10));
        setTipoIntencao('Ação de Graças');
      }
    }
  }, [isOpen, intencao]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitante.trim()) {
      onToast('⚠️ Informe o nome do solicitante ou família.');
      return;
    }
    if (!falecido.trim()) {
      onToast('⚠️ Descreva o motivo ou intenção da missa.');
      return;
    }

    const dataFinal = data ? normalizarData(data) : new Date().toLocaleDateString('pt-BR');

    onSave({
      id: intencao ? intencao.id : Date.now(),
      solicitante: solicitante.trim(),
      falecido: falecido.trim(),
      data: dataFinal,
      tipoIntencao,
      status: 'Aprovada',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 relative touch-scroll">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 active:scale-95"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 pr-10">
          <span className="p-2 bg-blue-50 text-blue-900 rounded-xl shrink-0">
            <Heart className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {intencao ? 'Editar Intenção' : 'Incluir Intenção de Missa'}
            </h3>
            <p className="text-xs text-slate-500">
              A intenção será lida pelo sacerdote na celebração
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              Solicitante / Família *
            </label>
            <input
              type="text"
              required
              value={solicitante}
              onChange={(e) => setSolicitante(e.target.value)}
              placeholder="Ex: Família Silva ou D. Maria"
              className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              Tipo de Intenção
            </label>
            <select
              value={tipoIntencao}
              onChange={(e) => setTipoIntencao(e.target.value as any)}
              className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="Ação de Graças">Ação de Graças (Bênçãos & Conquistas)</option>
              <option value="Sufrágio dos Falecidos">Sufrágio dos Falecidos (7º dia, 30º dia, Memória)</option>
              <option value="Saúde e Cura">Saúde e Cura dos Enfermos</option>
              <option value="Aniversário">Aniversário Natalício / Matrimonial</option>
              <option value="Outro">Outra Intenção Particular</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              Descrição da Intenção / Nomes *
            </label>
            <textarea
              required
              rows={3}
              value={falecido}
              onChange={(e) => setFalecido(e.target.value)}
              placeholder="Ex: Em sufrágio da alma de João da Silva (7º dia) e conforto da família..."
              className="w-full px-3.5 py-3 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              Data da Celebração
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl active:scale-98"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto min-h-[44px] px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Intenção</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
