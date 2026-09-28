import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Agente, Missa, MuralAviso } from '../types';
import { normalizarData, toIsoDate } from '../utils/pix';

// ======================== MODAL AGENTE ========================
interface AgenteModalProps {
  isOpen: boolean;
  agente: Agente | null;
  onSave: (data: Partial<Agente>) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const AgenteModal: React.FC<AgenteModalProps> = ({
  isOpen,
  agente,
  onSave,
  onClose,
  onToast,
}) => {
  const [nome, setNome] = useState('');
  const [fone, setFone] = useState('');
  const [regiao, setRegiao] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNome(agente?.nome || '');
      setFone(agente?.fone || '');
      setRegiao(agente?.regiao || '');
    }
  }, [isOpen, agente]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      onToast('⚠️ Informe o nome do agente.');
      return;
    }
    onSave({
      id: agente ? agente.id : Date.now(),
      nome: nome.trim(),
      fone: fone.trim(),
      regiao: regiao.trim(),
      ativo: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-4 sm:p-5 relative">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-base font-bold text-slate-900 mb-3 pr-10">
          {agente ? 'Editar Agente do Dízimo' : 'Novo Agente do Dízimo'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Rosângela ou Marcelo"
              className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
            <input
              type="tel"
              value={fone}
              onChange={(e) => setFone(e.target.value)}
              placeholder="(82) 99999-0000"
              className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Setor / Região de Atuação</label>
            <input
              type="text"
              value={regiao}
              onChange={(e) => setRegiao(e.target.value)}
              placeholder="Ex: Centro, Zona Rural, Bairro Novo"
              className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto min-h-[42px] px-4 py-2 text-xs sm:text-sm text-slate-700 font-semibold bg-slate-100 rounded-xl hover:bg-slate-200 active:scale-98"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 sm:w-auto min-h-[42px] px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-900 rounded-xl hover:bg-blue-800 active:scale-98"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ======================== MODAL MISSA ========================
interface MissaModalProps {
  isOpen: boolean;
  missa: Missa | null;
  capelaNome: string;
  onSave: (data: Partial<Missa>) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const MissaModal: React.FC<MissaModalProps> = ({
  isOpen,
  missa,
  capelaNome,
  onSave,
  onClose,
  onToast,
}) => {
  const [titulo, setTitulo] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [local, setLocal] = useState('');
  const [celebrante, setCelebrante] = useState('');
  const [tipo, setTipo] = useState<'missa' | 'celebração' | 'festas' | 'novena'>('missa');
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitulo(missa?.titulo || '');
      setDataHora(missa?.dataHora || 'Domingos às 19:00');
      setLocal(missa?.local || capelaNome);
      setCelebrante(missa?.celebrante || 'Padre Pároco');
      setTipo(missa?.tipo || 'missa');
      setDescricao(missa?.descricao || '');
    }
  }, [isOpen, missa, capelaNome]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !dataHora.trim()) {
      onToast('⚠️ Título e Horário são obrigatórios.');
      return;
    }
    onSave({
      id: missa ? missa.id : Date.now(),
      titulo: titulo.trim(),
      dataHora: dataHora.trim(),
      local: local.trim() || capelaNome,
      celebrante: celebrante.trim() || 'Pároco',
      tipo,
      descricao: descricao.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[92vh] overflow-y-auto p-4 sm:p-5 relative touch-scroll">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-base font-bold text-slate-900 mb-3 pr-10">
          {missa ? 'Editar Celebração' : 'Cadastrar Celebração'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Título da Celebração *</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Missa Dominical dos Dizimistas"
              className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Data e Horário *</label>
              <input
                type="text"
                required
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
                placeholder="Ex: Domingo às 19:00"
                className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="missa">Missa Solene</option>
                <option value="celebração">Celebração da Palavra</option>
                <option value="festas">Festa da Padroeira</option>
                <option value="novena">Novena / Tríduo</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Local</label>
              <input
                type="text"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Capela N. Sra. da Conceição"
                className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Celebrante</label>
              <input
                type="text"
                value={celebrante}
                onChange={(e) => setCelebrante(e.target.value)}
                placeholder="Padre Pároco"
                className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Detalhes Adicionais</label>
            <textarea
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Informações sobre leituras, bênçãos ou quermesse..."
              className="w-full px-3.5 py-3 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto min-h-[42px] px-4 py-2 text-xs sm:text-sm text-slate-700 font-semibold bg-slate-100 rounded-xl hover:bg-slate-200 active:scale-98"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 sm:w-auto min-h-[42px] px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-900 rounded-xl hover:bg-blue-800 active:scale-98"
            >
              Salvar Missa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ======================== MODAL MURAL ========================
interface MuralModalProps {
  isOpen: boolean;
  aviso: MuralAviso | null;
  onSave: (data: Partial<MuralAviso>) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const MuralModal: React.FC<MuralModalProps> = ({
  isOpen,
  aviso,
  onSave,
  onClose,
  onToast,
}) => {
  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [textoCompleto, setTextoCompleto] = useState('');
  const [data, setData] = useState('');
  const [categoria, setCategoria] = useState<'Pastoral' | 'Avisos Gerais' | 'Festa' | 'Urgente' | 'Geral'>('Pastoral');
  const [fixado, setFixado] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitulo(aviso?.titulo || '');
      setResumo(aviso?.resumo || '');
      setTextoCompleto(aviso?.textoCompleto || aviso?.resumo || '');
      setData(toIsoDate(aviso?.data));
      setCategoria(aviso?.categoria || 'Pastoral');
      setFixado(aviso?.fixado || false);
    }
  }, [isOpen, aviso]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !resumo.trim()) {
      onToast('⚠️ Título e Resumo são obrigatórios.');
      return;
    }
    const dataFinal = data ? normalizarData(data) : new Date().toLocaleDateString('pt-BR');

    onSave({
      id: aviso ? aviso.id : Date.now(),
      titulo: titulo.trim(),
      resumo: resumo.trim(),
      textoCompleto: (textoCompleto.trim() || resumo.trim()),
      data: dataFinal,
      categoria,
      fixado,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[92vh] overflow-y-auto p-4 sm:p-5 relative touch-scroll">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-base font-bold text-slate-900 mb-3 pr-10">
          {aviso ? 'Editar Aviso do Mural' : 'Novo Aviso Paroquial'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Título do Aviso *</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Encontro Mensal da Pastoral do Dízimo"
              className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as any)}
                className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="Pastoral">Pastoral</option>
                <option value="Avisos Gerais">Avisos Gerais</option>
                <option value="Festa">Festa / Solenidade</option>
                <option value="Urgente">Aviso Importante</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Resumo Curto *</label>
            <input
              type="text"
              required
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              placeholder="Breve descrição em uma ou duas frases"
              className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Texto Completo</label>
            <textarea
              rows={3}
              value={textoCompleto}
              onChange={(e) => setTextoCompleto(e.target.value)}
              placeholder="Explicação detalhada para os paroquianos..."
              className="w-full px-3.5 py-3 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 pt-1 min-h-[38px]">
            <input
              type="checkbox"
              id="check-fixado"
              checked={fixado}
              onChange={(e) => setFixado(e.target.checked)}
              className="w-4 h-4 rounded text-blue-900 focus:ring-blue-600"
            />
            <label htmlFor="check-fixado" className="text-xs sm:text-sm text-slate-700 cursor-pointer">
              Fixar este aviso no topo do mural da comunidade
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto min-h-[42px] px-4 py-2 text-xs sm:text-sm text-slate-700 font-semibold bg-slate-100 rounded-xl hover:bg-slate-200 active:scale-98"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 sm:w-auto min-h-[42px] px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-900 rounded-xl hover:bg-blue-800 flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Aviso</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
