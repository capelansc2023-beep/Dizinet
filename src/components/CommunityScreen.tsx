import React, { useMemo } from 'react';
import {
  BookOpen,
  Cake,
  Megaphone,
  Heart,
  Users,
  Building2,
  MapPin,
  MessageCircle,
  Plus,
  Phone,
} from 'lucide-react';
import { CapelaInfo, Lancamento, Agente, Missa, Intencao, MuralAviso } from '../types';
import {
  formatCurrency,
  formatarDataAniversario,
  getMonthFromDate,
  getYearFromDate,
} from '../utils/pix';

interface CommunityScreenProps {
  capela: CapelaInfo;
  lancamentos: Lancamento[];
  agentes: Agente[];
  missas: Missa[];
  intencoes: Intencao[];
  mural: MuralAviso[];
  onOpenNovaIntencao: () => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  capela,
  lancamentos,
  agentes,
  missas,
  intencoes,
  mural,
  onOpenNovaIntencao,
}) => {
  const now = new Date();
  const mesAtual = now.getMonth() + 1;
  const anoAtual = now.getFullYear();

  const nomesMeses = [
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

  // Birthday parishioners of the current month
  const aniversariantesMes = useMemo(() => {
    const map = new Map<string, { nome: string; nascimento: string; fone?: string }>();
    for (const l of lancamentos) {
      const m = getMonthFromDate(l.nascimento);
      if (m === mesAtual && l.nome) {
        if (!map.has(l.nome.toUpperCase())) {
          map.set(l.nome.toUpperCase(), {
            nome: l.nome,
            nascimento: formatarDataAniversario(l.nascimento),
            fone: l.telefone,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.nascimento.localeCompare(b.nascimento)
    );
  }, [lancamentos, mesAtual]);

  // Agent monthly collections
  const agentTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const l of lancamentos) {
      const m = getMonthFromDate(l.dataRegistro) || getMonthFromDate(l.nascimento);
      const y = getYearFromDate(l.dataRegistro);
      if (m === mesAtual && (!y || y === anoAtual || y === 2026)) {
        if (l.origem && !l.origem.toLowerCase().includes('pix')) {
          totals[l.origem] = (totals[l.origem] || 0) + (Number(l.valor) || 0);
        }
      }
    }
    return totals;
  }, [lancamentos, mesAtual, anoAtual]);

  const handleWhatsAppParabens = (nome: string, fone?: string) => {
    const texto = `Olá ${nome}! A Comunidade da *${capela.nome}* deseja a você um feliz aniversário abençoado! 🎉🎂 Que o Bom Deus e Nossa Senhora derramem graças, paz e saúde sobre sua vida e família. Agradecemos pelo seu testemunho de fé e partilha em nossa capela! 🙏✨`;
    const cleanPhone = (fone || '').replace(/\D/g, '');
    const url = cleanPhone.length >= 10
      ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(texto)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Community Header Banner */}
      <div>
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
          👥 Comunidade & Vida Paroquial
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
          Acompanhe os horários das celebrações, aniversariantes do mês, avisos do mural,
          intenções de missa e a dedicação dos nossos agentes missionários.
        </p>
      </div>

      {/* Row 1: Missas & Aniversariantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Missas e Celebrações */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-900" />
              <span>Missas e Celebrações</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              {missas.length} agendada(s)
            </span>
          </div>

          <div className="space-y-3">
            {missas.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-400 py-6 text-center">
                Nenhuma celebração agendada no momento.
              </p>
            ) : (
              missas.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-200 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 inline-block">
                        {m.tipo}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                        {m.titulo}
                      </h4>
                    </div>
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md self-start whitespace-nowrap">
                      📅 {m.dataHora}
                    </span>
                  </div>

                  <div className="mt-2.5 text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{m.local}</span>
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <span>Celebrante: {m.celebrante}</span>
                    </span>
                  </div>

                  {m.descricao && (
                    <p className="text-xs text-slate-500 mt-2 italic border-t border-slate-200/60 pt-1.5">
                      {m.descricao}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Aniversariantes do Mês */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cake className="w-5 h-5 text-amber-600" />
              <span>Aniversariantes do Mês</span>
            </h3>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
              {nomesMeses[mesAtual]}
            </span>
          </div>

          <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1 touch-scroll">
            {aniversariantesMes.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-400 py-8 text-center">
                Nenhum dizimista aniversariando neste mês de {nomesMeses[mesAtual]}.
              </p>
            ) : (
              aniversariantesMes.map((aniv, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 uppercase">
                      {aniv.nome}
                    </h5>
                    <span className="text-xs text-slate-500 font-mono">
                      📅 Nasc: {aniv.nascimento}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleWhatsAppParabens(aniv.nome, aniv.fone)}
                    className="w-full sm:w-auto min-h-[38px] px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                    title="Enviar felicitação no WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Parabenizar no Zap</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Mural de Avisos & Intenções de Missa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Mural de Avisos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-900" />
              <span>Mural de Avisos Paroquiais</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Comunidade</span>
          </div>

          <div className="space-y-3">
            {mural.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-400 py-6 text-center">
                Nenhum aviso publicado no mural.
              </p>
            ) : (
              mural.map((av) => (
                <div
                  key={av.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50/70 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {av.categoria || 'Pastoral'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      📅 {av.data}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-amber-950">
                    {av.titulo}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {av.textoCompleto || av.resumo}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Intenções de Missa */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              <span>Intenções de Missa</span>
            </h3>

            <button
              type="button"
              onClick={onOpenNovaIntencao}
              className="min-h-[38px] px-3 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Incluir Intenção</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 touch-scroll">
            {intencoes.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-400 py-8 text-center">
                Nenhuma intenção cadastrada no momento.
              </p>
            ) : (
              intencoes.map((it) => (
                <div
                  key={it.id}
                  className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                      {it.solicitante}
                    </h5>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {it.data}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-snug">
                    🙏 {it.falecido}
                  </p>

                  {it.tipoIntencao && (
                    <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded mt-2 inline-block border border-blue-100">
                      {it.tipoIntencao}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Arrecadação por Agente do Dízimo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-900" />
            <span>Arrecadação por Agente Missionário do Dízimo</span>
          </h3>
          <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full self-start sm:self-auto">
            Mês de {nomesMeses[mesAtual]}
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3 rounded-l-xl">Agente Missionário</th>
                <th className="p-3">Setor / Região</th>
                <th className="p-3">Contato</th>
                <th className="p-3 text-right rounded-r-xl">Total no Mês (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agentes.map((ag) => {
                const total = agentTotals[ag.nome] || 0;
                return (
                  <tr key={ag.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">
                      {ag.nome}
                    </td>
                    <td className="p-3 text-slate-600">
                      {ag.regiao || 'Comunidade Geral'}
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-500">
                      {ag.fone || '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-blue-900">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Smartphone Card View (Eliminates horizontal squish) */}
        <div className="block md:hidden space-y-2.5">
          {agentes.map((ag) => {
            const total = agentTotals[ag.nome] || 0;
            return (
              <div
                key={ag.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{ag.nome}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {ag.regiao || 'Comunidade Geral'}
                    </span>
                    {ag.fone && (
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {ag.fone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">No mês</span>
                  <span className="text-base font-bold font-mono text-blue-900">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 4: História e Identidade da Capela */}
      <div className="bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6 space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-blue-950 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-800" />
          <span>História & Vida da {capela.nome}</span>
        </h3>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {capela.historia}
        </p>

        <div className="pt-3 border-t border-blue-200/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-950 font-medium">
          <div>
            <strong>Município:</strong> {capela.cidade}/{capela.estado}
          </div>
          <div>
            <strong>Comunidade:</strong> {capela.comunidade}
          </div>
          <div>
            <strong>Padroeiro(a):</strong> {capela.padroeiro || 'Nossa Senhora da Conceição'}
          </div>
          <div>
            <strong>Idealizador:</strong> {capela.idealizador}
          </div>
        </div>
      </div>
    </div>
  );
};
