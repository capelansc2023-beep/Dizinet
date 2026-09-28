import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Lancamento, Agente, TipoContribuicao } from '../types';
import {
  validarFormatoNascimento,
  formatarNascimentoPadrao,
  normalizarData,
  toIsoDate,
  formatarDataAniversario,
} from '../utils/pix';

interface EditLancamentoModalProps {
  isOpen: boolean;
  lancamento: Lancamento | null;
  agentes: Agente[];
  onSave: (data: Partial<Lancamento>) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const EditLancamentoModal: React.FC<EditLancamentoModalProps> = ({
  isOpen,
  lancamento,
  agentes,
  onSave,
  onClose,
  onToast,
}) => {
  const [nome, setNome] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [valor, setValor] = useState<number | ''>('');
  const [tipo, setTipo] = useState<TipoContribuicao | string>('Dízimo Mensal');
  const [origem, setOrigem] = useState('Pix Online');
  const [dataRegistro, setDataRegistro] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (lancamento) {
        setNome(lancamento.nome || '');
        setNascimento(formatarDataAniversario(lancamento.nascimento) || '');
        setTelefone(lancamento.telefone || '');
        setEndereco(lancamento.endereco || '');
        setValor(lancamento.valor || '');
        setTipo(lancamento.tipo || 'Dízimo Mensal');
        setOrigem(lancamento.origem || 'Pix Online');
        setDataRegistro(toIsoDate(lancamento.dataRegistro));
      } else {
        setNome('');
        setNascimento('');
        setTelefone('');
        setEndereco('');
        setValor('');
        setTipo('Dízimo Mensal');
        setOrigem('Pix Online');
        setDataRegistro(new Date().toISOString().slice(0, 10));
      }
    }
  }, [isOpen, lancamento]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      onToast('⚠️ Informe o nome do dizimista.');
      return;
    }
    if (nascimento.trim() && !validarFormatoNascimento(nascimento)) {
      onToast('⚠️ Data de nascimento inválida! Use dd/mm, dd-mm, d/m ou d-m.');
      return;
    }
    const valNum = parseFloat(String(valor));
    if (isNaN(valNum) || valNum <= 0) {
      onToast('⚠️ Informe um valor numérico válido.');
      return;
    }

    const dataFinal = dataRegistro
      ? normalizarData(dataRegistro)
      : new Date().toLocaleDateString('pt-BR');

    onSave({
      id: lancamento ? lancamento.id : Date.now(),
      nome: nome.trim().toUpperCase(),
      nascimento: nascimento.trim() ? formatarNascimentoPadrao(nascimento) : '01/01',
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      valor: valNum,
      tipo,
      origem,
      dataRegistro: dataFinal,
      statusPix: origem.toLowerCase().includes('pix') ? 'pago' : 'nao_aplicavel',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 relative touch-scroll">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 active:scale-95"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 pr-10">
          {lancamento ? 'Editar Lançamento' : 'Novo Lançamento de Dízimo'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              Nome do Dizimista / Benfeitor *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: MARIA DA SILVA"
              className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Data Nasc. (dd/mm)
              </label>
              <input
                type="text"
                value={nascimento}
                onChange={(e) => setNascimento(e.target.value)}
                placeholder="Ex: 15/08 ou 5/3"
                className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(82) 99999-0000"
                className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              Endereço / Comunidade
            </label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, Número, Bairro ou Sítio"
              className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Valor da Contribuição (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                required
                value={valor}
                onChange={(e) => setValor(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0,00"
                className="w-full px-3.5 py-3 min-h-[46px] text-lg sm:text-xl font-bold text-blue-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Tipo de Contribuição
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="Dízimo Mensal">Dízimo Mensal</option>
                <option value="Dízimo Espontâneo">Dízimo Espontâneo</option>
                <option value="Oferta de Missa">Oferta de Missa</option>
                <option value="Doação Festa Padroeira">Doação Festa Padroeira</option>
                <option value="Benfeitor da Capela">Benfeitor da Capela</option>
                <option value="Campanha da Fraternidade">Campanha da Fraternidade</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Agente / Canal de Entrada
              </label>
              <select
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="Pix Online">Arrecadado via Pix Direct (Online)</option>
                {agentes.map((ag) => (
                  <option key={ag.id} value={ag.nome}>
                    Agente {ag.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Data do Lançamento
              </label>
              <input
                type="date"
                value={dataRegistro}
                onChange={(e) => setDataRegistro(e.target.value)}
                className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl active:scale-98"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Lançamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
