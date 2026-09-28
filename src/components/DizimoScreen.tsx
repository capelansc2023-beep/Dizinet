import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  QrCode,
  Copy,
  Check,
  Calendar,
  User,
  Phone,
  MapPin,
  CircleDollarSign,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { CapelaInfo, Lancamento, Agente, TipoContribuicao } from '../types';
import {
  formatCurrency,
  validarFormatoNascimento,
  formatarNascimentoPadrao,
  formatarDataAniversario,
  normalizarData,
  getMonthFromDate,
  getYearFromDate,
} from '../utils/pix';

interface DizimoScreenProps {
  capela: CapelaInfo;
  lancamentos: Lancamento[];
  agentes: Agente[];
  onOpenPixModal: (dados: {
    nome: string;
    valor: number;
    tipo: string;
    origem: string;
    telefone?: string;
    nascimento?: string;
    endereco?: string;
  }) => void;
  onSaveDirect: (lancamento: Lancamento) => void;
  onToast: (msg: string) => void;
}

export const DizimoScreen: React.FC<DizimoScreenProps> = ({
  capela,
  lancamentos,
  agentes,
  onOpenPixModal,
  onSaveDirect,
  onToast,
}) => {
  // Form states
  const [nome, setNome] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [valor, setValor] = useState<number | ''>(30);
  const [tipo, setTipo] = useState<TipoContribuicao | string>('Dízimo Mensal');
  const [origem, setOrigem] = useState('Pix Online');
  const [dataRegistro, setDataRegistro] = useState(
    () => new Date().toISOString().slice(0, 10)
  );

  // UI helpers
  const [pixKeyCopied, setPixKeyCopied] = useState(false);
  const [anoFiltroTotal, setAnoFiltroTotal] = useState<string>('2026');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Autocomplete matching names
  const sugestoes = useMemo(() => {
    if (!nome || nome.trim().length < 2) return [];
    const query = nome.toLowerCase().trim();
    const map = new Map<string, Lancamento>();

    for (const l of lancamentos) {
      if (l.nome && l.nome.toLowerCase().includes(query)) {
        if (!map.has(l.nome.toUpperCase())) {
          map.set(l.nome.toUpperCase(), l);
        }
      }
    }
    return Array.from(map.values()).slice(0, 5);
  }, [nome, lancamentos]);

  const handleSelectSugestao = (item: Lancamento) => {
    setNome(item.nome);
    if (item.nascimento) setNascimento(formatarDataAniversario(item.nascimento));
    if (item.telefone) setTelefone(item.telefone);
    if (item.endereco) setEndereco(item.endereco);
    setShowSuggestions(false);
  };

  // Metrics calculations
  const now = new Date();
  const mesAtual = now.getMonth() + 1;
  const anoAtual = now.getFullYear();

  const totalGeral = useMemo(() => {
    return lancamentos.reduce((acc, l) => {
      const y = getYearFromDate(l.dataRegistro);
      if (anoFiltroTotal === 'all' || !y || y === parseInt(anoFiltroTotal, 10)) {
        return acc + (Number(l.valor) || 0);
      }
      return acc;
    }, 0);
  }, [lancamentos, anoFiltroTotal]);

  const totalMesAtual = useMemo(() => {
    return lancamentos.reduce((acc, l) => {
      const m = getMonthFromDate(l.dataRegistro) || getMonthFromDate(l.nascimento);
      const y = getYearFromDate(l.dataRegistro);
      if (m === mesAtual && (!y || y === anoAtual || y === 2026)) {
        return acc + (Number(l.valor) || 0);
      }
      return acc;
    }, 0);
  }, [lancamentos, mesAtual, anoAtual]);

  const totalPixMes = useMemo(() => {
    return lancamentos.reduce((acc, l) => {
      const m = getMonthFromDate(l.dataRegistro) || getMonthFromDate(l.nascimento);
      const isPix = (l.origem || '').toLowerCase().includes('pix');
      if (isPix && m === mesAtual) {
        return acc + (Number(l.valor) || 0);
      }
      return acc;
    }, 0);
  }, [lancamentos, mesAtual]);

  const metaMensal = capela.metaMensal || 3500.0;
  const percentualMeta = Math.min(Math.round((totalMesAtual / metaMensal) * 100), 100);

  const handleCopyPixKey = async () => {
    try {
      const key = capela.chavePix || '70560879490';
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(key);
      }
      setPixKeyCopied(true);
      onToast('Chave Pix copiada com sucesso!');
      setTimeout(() => setPixKeyCopied(false), 3000);
    } catch (e) {
      setPixKeyCopied(true);
    }
  };

  const handlePayViaPixNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      onToast('⚠️ Digite o nome do dizimista.');
      return;
    }
    if (nascimento.trim() && !validarFormatoNascimento(nascimento)) {
      onToast('⚠️ Data de nascimento inválida! Use dd/mm, dd-mm, d/m ou d-m.');
      return;
    }
    const valNum = parseFloat(String(valor));
    if (isNaN(valNum) || valNum <= 0) {
      onToast('⚠️ Digite um valor válido.');
      return;
    }

    onOpenPixModal({
      nome: nome.trim().toUpperCase(),
      valor: valNum,
      tipo,
      origem: 'Pix Online',
      telefone: telefone.trim(),
      nascimento: nascimento.trim() ? formatarNascimentoPadrao(nascimento) : '01/01',
      endereco: endereco.trim(),
    });
  };

  const handleSaveDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      onToast('⚠️ Digite o nome do dizimista.');
      return;
    }
    if (nascimento.trim() && !validarFormatoNascimento(nascimento)) {
      onToast('⚠️ Data de nascimento inválida! Use dd/mm, dd-mm, d/m ou d-m.');
      return;
    }
    const valNum = parseFloat(String(valor));
    if (isNaN(valNum) || valNum <= 0) {
      onToast('⚠️ Digite um valor válido.');
      return;
    }

    const dataFinal = dataRegistro
      ? normalizarData(dataRegistro)
      : new Date().toLocaleDateString('pt-BR');

    const novoLancamento: Lancamento = {
      id: Date.now(),
      nome: nome.trim().toUpperCase(),
      nascimento: nascimento.trim() ? formatarNascimentoPadrao(nascimento) : '01/01',
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      valor: valNum,
      tipo,
      origem,
      dataRegistro: dataFinal,
      statusPix: origem.toLowerCase().includes('pix') ? 'pago' : 'nao_aplicavel',
      observacoes: 'Registrado diretamente no formulário paroquial.',
    };

    onSaveDirect(novoLancamento);
    onToast('Contribuição registrada com sucesso!');

    // Reset clean
    setNome('');
    setNascimento('');
    setTelefone('');
    setEndereco('');
    setValor(30);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-blue-900/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-amber-400">✨</span>
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-blue-200">
              Pastoral do Dízimo · {capela.nome}
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
            Partilha que Transforma Vidas
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
            Seja bem-vindo ao portal de contribuições. Registre seu dízimo ou oferta de forma rápida,
            segura e com confirmação nativa via Pix.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyPixKey}
          className="w-full md:w-auto px-4 py-3 min-h-[46px] bg-blue-800/90 hover:bg-blue-800 text-white border border-blue-700/60 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
        >
          {pixKeyCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span className="truncate">Chave Pix: {capela.chavePix}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="border-b border-slate-100 pb-3.5 mb-4 sm:mb-5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <CircleDollarSign className="w-5 h-5 text-blue-900 shrink-0" />
                <span>Registrar Dízimo ou Oferta</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Preencha os dados abaixo e escolha gerar o Pix dinâmico ou registrar a entrega
              </p>
            </div>

            <form className="space-y-4">
              {/* Contributor Name with Autocomplete */}
              <div className="relative">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Nome do Dizimista / Benfeitor *</span>
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Digite o nome completo (ex: MARIA SILVA)"
                  className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase bg-white transition-all shadow-2xs"
                />

                {/* Autocomplete Dropdown */}
                {showSuggestions && sugestoes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100">
                    <div className="px-3.5 py-2 bg-slate-50 text-[11px] font-semibold text-slate-500">
                      Dizimistas encontrados no cadastro:
                    </div>
                    {sugestoes.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelectSugestao(s)}
                        className="px-4 py-3 min-h-[44px] text-xs sm:text-sm hover:bg-blue-50 active:bg-blue-100 cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <span className="font-bold text-slate-900">{s.nome}</span>
                        <span className="text-xs text-slate-500 font-mono">
                          {formatarDataAniversario(s.nascimento)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Birthday and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>Nascimento (dd/mm) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nascimento}
                    onChange={(e) => setNascimento(e.target.value)}
                    placeholder="Ex: 15/08 ou 5/3"
                    className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Formatos aceitos: dd/mm, dd-mm, d/m ou d-m
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>Contato / WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(82) 99999-0000"
                    className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>Endereço / Comunidade</span>
                </label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, Número, Bairro, Comunidade ou Sítio"
                  className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Amount and Contribution Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                    Valor da Contribuição (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={valor}
                    onChange={(e) =>
                      setValor(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="0,00"
                    className="w-full px-3.5 py-3 min-h-[46px] text-lg sm:text-xl font-bold text-blue-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono transition-all shadow-2xs"
                  />

                  {/* Fast amount buttons */}
                  <div className="grid grid-cols-5 gap-1.5 mt-2">
                    {[10, 20, 30, 50, 100].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setValor(v)}
                        className={`min-h-[40px] py-2 text-xs sm:text-sm font-bold rounded-lg border transition-all active:scale-95 flex items-center justify-center ${
                          valor === v
                            ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        R${v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                    Finalidade da Contribuição
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white transition-all shadow-2xs"
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

              {/* Origin and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                    Agente / Canal de Entrega
                  </label>
                  <select
                    value={origem}
                    onChange={(e) => setOrigem(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white transition-all shadow-2xs"
                  >
                    <option value="Pix Online">Arrecadado via Pix Direct (Online)</option>
                    {agentes.map((ag) => (
                      <option key={ag.id} value={ag.nome}>
                        Agente {ag.nome} {ag.regiao ? `(${ag.regiao})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                    Data da Contribuição
                  </label>
                  <input
                    type="date"
                    value={dataRegistro}
                    onChange={(e) => setDataRegistro(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Submission Buttons */}
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handlePayViaPixNow}
                  className="w-full min-h-[50px] py-3.5 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md hover:shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <QrCode className="w-5 h-5 text-emerald-100" />
                  <span>Pagar com Pix Nativo Agora</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDirectly}
                  className="w-full min-h-[50px] py-3.5 px-4 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <ShieldCheck className="w-5 h-5 text-blue-200" />
                  <span>Salvar Registro no Sistema</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Financial Cards & Metrics */}
        <div className="space-y-4">
          {/* Total Card */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-blue-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider text-blue-200 font-semibold">
                Total Geral Arrecadado
              </span>
              <select
                value={anoFiltroTotal}
                onChange={(e) => setAnoFiltroTotal(e.target.value)}
                className="bg-blue-900/90 text-amber-300 text-xs font-bold rounded-lg px-2.5 py-1.5 min-h-[34px] border border-blue-700/60 focus:outline-none"
              >
                <option value="2026">Ano 2026</option>
                <option value="2027">Ano 2027</option>
                <option value="2025">Ano 2025</option>
                <option value="all">Todos os Anos</option>
              </select>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tracking-tight">
              {formatCurrency(totalGeral)}
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Dízimos e ofertas registrados em favor da nossa capela.
            </p>
          </div>

          {/* Month Stats & Goal Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Arrecadado neste Mês
              </span>
              <span className="text-xs text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded">
                Mês {mesAtual}/2026
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {formatCurrency(totalMesAtual)}
            </div>

            {/* Progress bar towards monthly maintenance goal */}
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Meta: {formatCurrency(metaMensal)}</span>
                <span className="font-bold text-blue-900">{percentualMeta}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-700 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentualMeta}%` }}
                />
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Via Pix Direto:</span>
              <strong className="text-emerald-700 font-mono font-bold text-sm">
                {formatCurrency(totalPixMes)}
              </strong>
            </div>
          </div>

          {/* Pix Key Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <QrCode className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-bold text-white">Chave Pix Oficial</h4>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl text-center font-mono text-xs sm:text-sm text-amber-300 break-all border border-slate-800 select-all">
              {capela.chavePix}
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Titular: {capela.titularPix || capela.nome}
            </p>
            <button
              type="button"
              onClick={handleCopyPixKey}
              className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-blue-800 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-98"
            >
              {pixKeyCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{pixKeyCopied ? 'Chave Copiada!' : 'Copiar Chave Pix'}</span>
            </button>
          </div>

          {/* Devotional Impact Box */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
            <h5 className="font-bold flex items-center gap-1.5 text-amber-900 text-xs sm:text-sm">
              <Heart className="w-4 h-4 text-amber-600 fill-amber-600" />
              <span>Onde é aplicado o seu Dízimo?</span>
            </h5>
            <ul className="space-y-1.5 text-slate-700 text-[11px] sm:text-xs list-disc list-inside">
              <li><strong>Dimensão Religiosa:</strong> Celebrações, hóstias, vinho, velas e som.</li>
              <li><strong>Dimensão Eclesial:</strong> Manutenção da capela, luz, água e melhorias.</li>
              <li><strong>Dimensão Missionária:</strong> Catequese infantil e pastoral familiar.</li>
              <li><strong>Dimensão Caritativa:</strong> Cestas básicas e auxílio aos enfermos locais.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
