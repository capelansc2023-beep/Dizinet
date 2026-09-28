import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CircleDollarSign,
  Users,
  BookOpen,
  Heart,
  Megaphone,
  Building2,
  Lock,
  Plus,
  Printer,
  Download,
  Upload,
  Search,
  Receipt,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  MapPin,
} from 'lucide-react';
import {
  AppState,
  Lancamento,
  Agente,
  Missa,
  Intencao,
  MuralAviso,
  CapelaInfo,
} from '../types';
import {
  formatCurrency,
  formatarDataAniversario,
  formatarDataRegistro,
  getMonthFromDate,
  getYearFromDate,
} from '../utils/pix';

interface AdminScreenProps {
  appState: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onOpenNovoLancamento: () => void;
  onEditLancamento: (l: Lancamento) => void;
  onViewReceipt: (l: Lancamento) => void;
  onOpenReportModal: (filtros: { mes: string; ano: string; origem: string; filtrados: Lancamento[] }) => void;
  onOpenNovoAgente: () => void;
  onEditAgente: (a: Agente) => void;
  onOpenNovaMissa: () => void;
  onEditMissa: (m: Missa) => void;
  onOpenNovaIntencao: () => void;
  onEditIntencao: (i: Intencao) => void;
  onOpenNovoAviso: () => void;
  onEditAviso: (a: MuralAviso) => void;
  onRequestConfirm: (title: string, msg: string, onConfirm: () => void) => void;
  onToast: (msg: string) => void;
  onExitAdmin: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  appState,
  onUpdateState,
  onOpenNovoLancamento,
  onEditLancamento,
  onViewReceipt,
  onOpenReportModal,
  onOpenNovoAgente,
  onEditAgente,
  onOpenNovaMissa,
  onEditMissa,
  onOpenNovaIntencao,
  onEditIntencao,
  onOpenNovoAviso,
  onEditAviso,
  onRequestConfirm,
  onToast,
  onExitAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<
    'lancamentos' | 'agentes' | 'missas' | 'intencoes' | 'mural' | 'capela' | 'seguranca'
  >('lancamentos');

  // Filters for Lançamentos
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState('2026');
  const [filtroOrigem, setFiltroOrigem] = useState('');

  // Password change state
  const [novaSenha, setNovaSenha] = useState('');

  // Capela form local state
  const [capelaForm, setCapelaForm] = useState<CapelaInfo>(appState.capela);

  // Filtered entries
  const filtrados = useMemo(() => {
    const qNome = filtroNome.toLowerCase().trim();
    let qData = filtroData.trim().toLowerCase().replace(/-/g, '/');

    let buscaDia = '';
    let buscaMes = '';
    if (qData) {
      if (qData.includes('/')) {
        const partes = qData.split('/');
        buscaDia = partes[0] ? partes[0].padStart(2, '0') : '';
        buscaMes = partes[1] ? partes[1].padStart(2, '0') : '';
      } else if (!isNaN(Number(qData))) {
        if (parseInt(qData, 10) <= 12) {
          buscaMes = qData.padStart(2, '0');
        }
        buscaDia = qData.padStart(2, '0');
      }
    }

    return appState.lancamentos.filter((l) => {
      const matchNome = !qNome || (l.nome && l.nome.toLowerCase().includes(qNome));

      let matchData = true;
      if (qData) {
        const nasc = formatarDataAniversario(l.nascimento);
        const reg = formatarDataRegistro(l.dataRegistro);

        const [dNat, mNat] = nasc.split('/');
        const dNatPad = dNat ? dNat.padStart(2, '0') : '';
        const mNatPad = mNat ? mNat.padStart(2, '0') : '';

        const matchDia = buscaDia ? dNatPad === buscaDia || reg.includes(qData) : true;
        const matchMes = buscaMes ? mNatPad === buscaMes || reg.includes(qData) : true;
        matchData = (matchDia || matchMes) || nasc.includes(qData) || reg.includes(qData);
      }

      const mesReg = getMonthFromDate(l.dataRegistro) || getMonthFromDate(l.nascimento);
      const matchMes = !filtroMes || mesReg === parseInt(filtroMes, 10);
      const matchOrigem = !filtroOrigem || l.origem === filtroOrigem;

      const anoReg = getYearFromDate(l.dataRegistro);
      const matchAno = filtroAno === 'all' || !anoReg || anoReg === parseInt(filtroAno, 10);

      return matchNome && matchData && matchMes && matchOrigem && matchAno;
    });
  }, [appState.lancamentos, filtroNome, filtroData, filtroMes, filtroAno, filtroOrigem]);

  const totalFiltrado = useMemo(() => {
    return filtrados.reduce((acc, l) => acc + (Number(l.valor) || 0), 0);
  }, [filtrados]);

  // General KPIs
  const totalGeral = useMemo(() => {
    return appState.lancamentos.reduce((acc, l) => acc + (Number(l.valor) || 0), 0);
  }, [appState.lancamentos]);

  const mediaPorLancamento = useMemo(() => {
    if (appState.lancamentos.length === 0) return 0;
    return totalGeral / appState.lancamentos.length;
  }, [totalGeral, appState.lancamentos.length]);

  const totalPix = useMemo(() => {
    return appState.lancamentos
      .filter((l) => (l.origem || '').toLowerCase().includes('pix'))
      .reduce((acc, l) => acc + (Number(l.valor) || 0), 0);
  }, [appState.lancamentos]);

  // Handlers
  const handleDeleteLancamento = (id: string | number) => {
    onRequestConfirm(
      'Excluir Lançamento',
      'Tem certeza de que deseja excluir este registro de dízimo? Esta ação não pode ser desfeita.',
      () => {
        onUpdateState((prev) => ({
          ...prev,
          lancamentos: prev.lancamentos.filter((l) => l.id !== id),
        }));
        onToast('Lançamento excluído com sucesso.');
      }
    );
  };

  const handleDeleteAgente = (id: number) => {
    onRequestConfirm(
      'Excluir Agente',
      'Deseja remover este agente missionário do dízimo?',
      () => {
        onUpdateState((prev) => ({
          ...prev,
          agentes: prev.agentes.filter((a) => a.id !== id),
        }));
        onToast('Agente removido com sucesso.');
      }
    );
  };

  const handleDeleteMissa = (id: number) => {
    onRequestConfirm('Excluir Celebração', 'Deseja remover este horário de celebração?', () => {
      onUpdateState((prev) => ({
        ...prev,
        missas: prev.missas.filter((m) => m.id !== id),
      }));
      onToast('Celebração removida com sucesso.');
    });
  };

  const handleDeleteIntencao = (id: number) => {
    onRequestConfirm('Excluir Intenção', 'Deseja remover esta intenção de missa?', () => {
      onUpdateState((prev) => ({
        ...prev,
        intencoes: prev.intencoes.filter((i) => i.id !== id),
      }));
      onToast('Intenção removida com sucesso.');
    });
  };

  const handleDeleteAviso = (id: number) => {
    onRequestConfirm('Excluir Aviso', 'Deseja remover este aviso do mural?', () => {
      onUpdateState((prev) => ({
        ...prev,
        mural: prev.mural.filter((a) => a.id !== id),
      }));
      onToast('Aviso removido do mural.');
    });
  };

  const handleSalvarCapela = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState((prev) => ({
      ...prev,
      capela: { ...capelaForm },
      chavePix: capelaForm.chavePix,
    }));
    onToast('Dados da Capela e Chave Pix atualizados com sucesso!');
  };

  const handleAlterarSenha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaSenha.trim()) {
      onToast('⚠️ Digite a nova senha.');
      return;
    }
    onUpdateState((prev) => ({
      ...prev,
      adminPassword: novaSenha.trim(),
    }));
    setNovaSenha('');
    onToast('Senha administrativa alterada com sucesso!');
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `dizinet_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onToast('Arquivo de backup exportado com sucesso!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          onUpdateState(() => parsed);
          onToast('Backup importado com sucesso!');
        }
      } catch (err) {
        onToast('⚠️ Erro ao ler o arquivo JSON de backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Painel Administrativo da Paróquia
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Gestão financeira, dízimos, prestação de contas, agentes e configurações
          </p>
        </div>

        <button
          onClick={onExitAdmin}
          className="w-full sm:w-auto min-h-[42px] px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs flex items-center justify-center gap-1.5 active:scale-98"
        >
          <span>← Sair do Modo Admin</span>
        </button>
      </div>

      {/* KPI Cards (2 columns on mobile, 4 columns on large) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border-l-4 border-l-blue-900 border border-slate-200 p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Arrecadado
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-blue-950 font-mono mt-1">
            {formatCurrency(totalGeral)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border-l-4 border-l-amber-500 border border-slate-200 p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Lançamentos
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {appState.lancamentos.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl border-l-4 border-l-emerald-600 border border-slate-200 p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Via Pix
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-800 font-mono mt-1">
            {formatCurrency(totalPix)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border-l-4 border-l-indigo-600 border border-slate-200 p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Ticket Médio
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-indigo-950 font-mono mt-1">
            {formatCurrency(mediaPorLancamento)}
          </div>
        </div>
      </div>

      {/* Admin Tabs - Horizontally scrollable on mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2 touch-scroll no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('lancamentos')}
          className={`shrink-0 min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
            activeTab === 'lancamentos'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 sm:border-0'
          }`}
        >
          <CircleDollarSign className="w-4 h-4" />
          <span>Lançamentos</span>
        </button>

        <button
          onClick={() => setActiveTab('agentes')}
          className={`shrink-0 min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
            activeTab === 'agentes'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 sm:border-0'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Agentes ({appState.agentes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('missas')}
          className={`shrink-0 min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
            activeTab === 'missas'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 sm:border-0'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Missas ({appState.missas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('intencoes')}
          className={`shrink-0 min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
            activeTab === 'intencoes'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 sm:border-0'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Intenções ({appState.intencoes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mural')}
          className={`shrink-0 min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
            activeTab === 'mural'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 sm:border-0'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Mural ({appState.mural.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('capela')}
          className={`shrink-0 min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
            activeTab === 'capela'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 sm:border-0'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Capela & Pix</span>
        </button>

        <button
          onClick={() => setActiveTab('seguranca')}
          className={`shrink-0 min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
            activeTab === 'seguranca'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 sm:border-0'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Segurança</span>
        </button>
      </div>

      {/* Tab 1: Lançamentos */}
      {activeTab === 'lancamentos' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gerenciador de Contribuições & Dízimos
              </h3>
              <p className="text-xs text-slate-500">
                Filtre, audite, gere relatórios e emita recibos individuais
              </p>
            </div>

            <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onOpenReportModal({
                    mes: filtroMes,
                    ano: filtroAno,
                    origem: filtroOrigem,
                    filtrados,
                  })
                }
                className="min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-98"
              >
                <Printer className="w-4 h-4 text-amber-700" />
                <span>Imprimir Relatório</span>
              </button>

              <button
                type="button"
                onClick={onOpenNovoLancamento}
                className="min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Lançamento</span>
              </button>
            </div>
          </div>

          {/* Multi-Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar dizimista..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="w-full pl-9 pr-3 py-2 min-h-[42px] text-base sm:text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Data/Nasc (15/08, 08...)"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="w-full px-3 py-2 min-h-[42px] text-base sm:text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>

            <div>
              <select
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                className="w-full px-3 py-2 min-h-[42px] text-base sm:text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="">Todos os Meses</option>
                <option value="1">Janeiro</option>
                <option value="2">Fevereiro</option>
                <option value="3">Março</option>
                <option value="4">Abril</option>
                <option value="5">Maio</option>
                <option value="6">Junho</option>
                <option value="7">Julho</option>
                <option value="8">Agosto</option>
                <option value="9">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
            </div>

            <div>
              <select
                value={filtroAno}
                onChange={(e) => setFiltroAno(e.target.value)}
                className="w-full px-3 py-2 min-h-[42px] text-base sm:text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="2026">Ano 2026</option>
                <option value="2027">Ano 2027</option>
                <option value="2025">Ano 2025</option>
                <option value="all">Todos os Anos</option>
              </select>
            </div>

            <div>
              <select
                value={filtroOrigem}
                onChange={(e) => setFiltroOrigem(e.target.value)}
                className="w-full px-3 py-2 min-h-[42px] text-base sm:text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="">Todos os Canais/Agentes</option>
                <option value="Pix Online">Pix Online</option>
                {appState.agentes.map((ag) => (
                  <option key={ag.id} value={ag.nome}>
                    Agente {ag.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtered Total Highlight */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="font-semibold text-blue-900">
              📊 Selecionado ({filtrados.length} lançamentos):
            </span>
            <span className="text-base sm:text-lg font-black text-blue-950 font-mono">
              {formatCurrency(totalFiltrado)}
            </span>
          </div>

          {/* Mobile Smartphone Card View (Eliminates awkward 8-column horizontal table squeeze) */}
          <div className="block md:hidden space-y-3">
            {filtrados.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                Nenhum lançamento encontrado para os filtros selecionados.
              </div>
            ) : (
              [...filtrados].reverse().map((l) => (
                <div
                  key={l.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase">
                        {l.nome}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="font-mono">Nasc: {formatarDataAniversario(l.nascimento)}</span>
                        {l.telefone && <span>· {l.telefone}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-blue-900 font-mono block">
                        {formatCurrency(l.valor)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatarDataRegistro(l.dataRegistro)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold border border-blue-100">
                      {l.tipo}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {l.origem}
                    </span>
                    {l.endereco && (
                      <span className="text-slate-500 truncate max-w-[180px]">
                        📍 {l.endereco}
                      </span>
                    )}
                  </div>

                  {/* Actions for Mobile */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onViewReceipt(l)}
                      className="flex-1 min-h-[38px] px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Recibo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditLancamento(l)}
                      className="flex-1 min-h-[38px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteLancamento(l.id)}
                      className="min-h-[38px] px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Dizimista</th>
                  <th className="p-2.5">Nasc. / Contato</th>
                  <th className="p-2.5">Endereço</th>
                  <th className="p-2.5">Finalidade</th>
                  <th className="p-2.5">Canal</th>
                  <th className="p-2.5">Data</th>
                  <th className="p-2.5 text-right">Valor</th>
                  <th className="p-2.5 text-right w-28">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400">
                      Nenhum lançamento encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  [...filtrados].reverse().map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-bold text-slate-900 uppercase">
                        {l.nome}
                      </td>
                      <td className="p-2.5 font-mono text-[11px]">
                        {formatarDataAniversario(l.nascimento)}
                        {l.telefone && <span className="block text-slate-400">{l.telefone}</span>}
                      </td>
                      <td className="p-2.5 text-slate-500 truncate max-w-[130px]">
                        {l.endereco || '-'}
                      </td>
                      <td className="p-2.5 font-medium text-slate-800">
                        {l.tipo}
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {l.origem}
                      </td>
                      <td className="p-2.5 font-mono text-[11px]">
                        {formatarDataRegistro(l.dataRegistro)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-blue-900">
                        {formatCurrency(l.valor)}
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onViewReceipt(l)}
                            className="p-1.5 text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
                            title="Ver Recibo Digital"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditLancamento(l)}
                            className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLancamento(l.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Agentes */}
      {activeTab === 'agentes' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Agentes Missionários do Dízimo
              </h3>
              <p className="text-xs text-slate-500">
                Pessoas de confiança responsáveis pelo recolhimento na comunidade
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenNovoAgente}
              className="min-h-[40px] px-3.5 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Agente</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {appState.agentes.map((ag) => (
              <div
                key={ag.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{ag.nome}</h4>
                  <p className="text-xs text-slate-500 font-mono">{ag.fone || 'Sem telefone'}</p>
                  {ag.regiao && (
                    <span className="text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-medium mt-1 inline-block border border-blue-100">
                      {ag.regiao}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditAgente(ag)}
                    className="p-2 min-h-[38px] min-w-[38px] text-slate-600 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAgente(ag.id)}
                    className="p-2 min-h-[38px] min-w-[38px] text-red-600 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Missas */}
      {activeTab === 'missas' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Horários de Missas & Celebrações
              </h3>
              <p className="text-xs text-slate-500">
                Atualize o calendário litúrgico exibido na tela da comunidade
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenNovaMissa}
              className="min-h-[40px] px-3.5 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Missa</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {appState.missas.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      {m.tipo}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{m.titulo}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    📅 {m.dataHora} · 📍 {m.local} · Celebrante: {m.celebrante}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onEditMissa(m)}
                    className="p-2 min-h-[38px] min-w-[38px] text-slate-600 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMissa(m.id)}
                    className="p-2 min-h-[38px] min-w-[38px] text-red-600 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Intenções */}
      {activeTab === 'intencoes' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Intenções de Missa
              </h3>
              <p className="text-xs text-slate-500">
                Lista de intenções para leitura no altar durante a celebração
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenNovaIntencao}
              className="min-h-[40px] px-3.5 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Intenção</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {appState.intencoes.map((it) => (
              <div
                key={it.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{it.solicitante}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">🙏 {it.falecido}</p>
                  <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                    Data: {it.data} · {it.tipoIntencao || 'Ação de Graças'}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onEditIntencao(it)}
                    className="p-2 min-h-[38px] min-w-[38px] text-slate-600 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteIntencao(it.id)}
                    className="p-2 min-h-[38px] min-w-[38px] text-red-600 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Mural */}
      {activeTab === 'mural' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Mural de Avisos Comunitários
              </h3>
              <p className="text-xs text-slate-500">
                Publicações e notícias para a comunidade paroquial
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenNovoAviso}
              className="min-h-[40px] px-3.5 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Aviso</span>
            </button>
          </div>

          <div className="space-y-3">
            {appState.mural.map((av) => (
              <div
                key={av.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      {av.categoria || 'Pastoral'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{av.titulo}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{av.resumo}</p>
                  <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                    Publicado em: {av.data}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => onEditAviso(av)}
                    className="p-2 min-h-[38px] min-w-[38px] text-slate-600 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAviso(av.id)}
                    className="p-2 min-h-[38px] min-w-[38px] text-red-600 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Capela & Pix */}
      {activeTab === 'capela' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Configuração da Capela & Chave Pix
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Essas informações alimentam os recibos e o gerador de QR Code Pix
          </p>

          <form onSubmit={handleSalvarCapela} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Nome da Capela / Paróquia *
              </label>
              <input
                type="text"
                required
                value={capelaForm.nome}
                onChange={(e) =>
                  setCapelaForm((prev) => ({ ...prev, nome: e.target.value }))
                }
                className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  required
                  value={capelaForm.cidade}
                  onChange={(e) =>
                    setCapelaForm((prev) => ({ ...prev, cidade: e.target.value }))
                  }
                  className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Estado (UF) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={capelaForm.estado}
                  onChange={(e) =>
                    setCapelaForm((prev) => ({
                      ...prev,
                      estado: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Comunidade / Bairro *
                </label>
                <input
                  type="text"
                  required
                  value={capelaForm.comunidade}
                  onChange={(e) =>
                    setCapelaForm((prev) => ({ ...prev, comunidade: e.target.value }))
                  }
                  className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Chave Pix de Arrecadação *
                </label>
                <input
                  type="text"
                  required
                  value={capelaForm.chavePix}
                  onChange={(e) =>
                    setCapelaForm((prev) => ({ ...prev, chavePix: e.target.value }))
                  }
                  placeholder="CPF, CNPJ, Celular, E-mail ou Aleatória"
                  className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Nome do Titular do Pix *
                </label>
                <input
                  type="text"
                  required
                  value={capelaForm.titularPix}
                  onChange={(e) =>
                    setCapelaForm((prev) => ({ ...prev, titularPix: e.target.value }))
                  }
                  className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Meta Mensal de Dízimo (R$)
                </label>
                <input
                  type="number"
                  step="100"
                  value={capelaForm.metaMensal || 3500}
                  onChange={(e) =>
                    setCapelaForm((prev) => ({
                      ...prev,
                      metaMensal: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Padroeiro(a)
                </label>
                <input
                  type="text"
                  value={capelaForm.padroeiro || ''}
                  onChange={(e) =>
                    setCapelaForm((prev) => ({ ...prev, padroeiro: e.target.value }))
                  }
                  placeholder="Nossa Senhora da Conceição"
                  className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                História da Capela
              </label>
              <textarea
                rows={3}
                value={capelaForm.historia}
                onChange={(e) =>
                  setCapelaForm((prev) => ({ ...prev, historia: e.target.value }))
                }
                className="w-full px-3.5 py-3 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-sm transition-colors active:scale-98"
            >
              Salvar Informações da Capela
            </button>
          </form>
        </div>
      )}

      {/* Tab 7: Segurança / Backup */}
      {activeTab === 'seguranca' && (
        <div className="space-y-5">
          {/* Alterar Senha */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm max-w-md">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Alterar Senha de Administrador
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Defina uma nova senha para acessar este painel restrito
            </p>

            <form onSubmit={handleAlterarSenha} className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite a nova senha..."
                  className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-sm active:scale-98"
              >
                Atualizar Senha
              </button>
            </form>
          </div>

          {/* Backup e Restauração */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Backup e Restauração de Dados
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              Exporte todos os lançamentos, agentes, missas e configurações em arquivo JSON para
              segurança ou para transferir entre dispositivos.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl flex items-center justify-center gap-2 active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Backup (JSON)</span>
              </button>

              <label className="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98">
                <Upload className="w-4 h-4" />
                <span>Restaurar Backup</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportBackup}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
