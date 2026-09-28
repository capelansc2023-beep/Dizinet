import { AppState, Lancamento } from '../types';

export const DEFAULT_GOOGLE_SHEETS_URL =
  'https://script.google.com/macros/s/AKfycbwwgWfEFPxRtJuyfExEnwm6f8fkzOTZCTmwweksPXIxzRY1EVcEP0ZIocO4UgEwrZ7S_Q/exec';

export const DEFAULT_APP_STATE: AppState = {
  chavePix: '70560879490',
  adminPassword: 'Ei',
  googleSheetsUrl: DEFAULT_GOOGLE_SHEETS_URL,
  capela: {
    nome: 'Capela Nossa Senhora da Conceição',
    cidade: 'Jaramataia',
    estado: 'AL',
    comunidade: 'Comunidade Centro',
    idealizador: 'Prof. Erivaldo_2026',
    historia:
      'A Capela Nossa Senhora da Conceição é o coração espiritual e ponto de encontro fraterno em Jaramataia/AL. Fundada com a dedicação das famílias locais, a comunidade vive a fé através da oração, da Palavra de Deus e da partilha solidária pelo dízimo consciente.',
    chavePix: '70560879490',
    tipoChavePix: 'cpf',
    titularPix: 'Capela N. Sra. da Conceição',
    bancoPix: 'Caixa Econômica Federal / Sicoob',
    metaMensal: 3500.0,
    telefoneContato: '(82) 99999-2026',
    padroeiro: 'Nossa Senhora da Conceição',
  },
  lancamentos: [
    {
      id: 1,
      nome: 'MARIA LIMA',
      nascimento: '01/09',
      telefone: '(82) 98888-1111',
      endereco: 'Rua Principal, 123 - Centro',
      valor: 30.0,
      tipo: 'Dízimo Mensal',
      origem: 'Pix Online',
      dataRegistro: '01/09/2026',
      statusPix: 'pago',
      txid: 'DIZ20260901001',
    },
    {
      id: 2,
      nome: 'ROSÂNGELA DA SILVA',
      nascimento: '02/09',
      telefone: '(82) 98888-2222',
      endereco: 'Av. Central, 45',
      valor: 25.0,
      tipo: 'Dízimo Espontâneo',
      origem: 'Rosângela',
      dataRegistro: '02/09/2026',
      statusPix: 'pago',
    },
    {
      id: 3,
      nome: 'EDINEIDE OLIVEIRA',
      nascimento: '05/09',
      telefone: '(82) 98888-3333',
      endereco: 'Rua do Comércio, 89',
      valor: 50.0,
      tipo: 'Dízimo Mensal',
      origem: 'Edineide',
      dataRegistro: '05/09/2026',
      statusPix: 'pago',
    },
    {
      id: 4,
      nome: 'TIETA DOS SANTOS',
      nascimento: '07/09',
      telefone: '(82) 98888-4444',
      endereco: 'Travessa da Igreja, 12',
      valor: 40.0,
      tipo: 'Dízimo Mensal',
      origem: 'Pix Online',
      dataRegistro: '07/09/2026',
      statusPix: 'pago',
      txid: 'DIZ20260907004',
    },
    {
      id: 5,
      nome: 'MARCELO PEREIRA',
      nascimento: '10/09',
      telefone: '(82) 98888-5555',
      endereco: 'Sítio Boa Vista',
      valor: 75.0,
      tipo: 'Dízimo Mensal',
      origem: 'Marcelo',
      dataRegistro: '10/09/2026',
      statusPix: 'pago',
    },
    {
      id: 6,
      nome: 'JOSÉ ALVES FILHO',
      nascimento: '11/09',
      telefone: '(82) 98888-6666',
      endereco: 'Rua Nova, 78',
      valor: 20.0,
      tipo: 'Oferta de Missa',
      origem: 'Pix Online',
      dataRegistro: '11/09/2026',
      statusPix: 'pago',
      txid: 'DIZ20260911006',
    },
    {
      id: 7,
      nome: 'JOSÉ TAMPA',
      nascimento: '11/09',
      telefone: '(82) 98888-7777',
      endereco: 'Zona Rural - Fazenda Esperança',
      valor: 50.0,
      tipo: 'Dízimo Espontâneo',
      origem: 'Pix Online',
      dataRegistro: '11/09/2026',
      statusPix: 'pago',
      txid: 'DIZ20260911007',
    },
    {
      id: 8,
      nome: 'FRANCISCO DE ASSIS',
      nascimento: '14/09',
      telefone: '(82) 98888-8888',
      endereco: 'Vila São José, 10',
      valor: 100.0,
      tipo: 'Benfeitor da Capela',
      origem: 'Pix Online',
      dataRegistro: '14/09/2026',
      statusPix: 'pago',
      txid: 'DIZ20260914008',
    },
  ],
  agentes: [
    { id: 1, nome: 'Rosângela', fone: '(82) 99999-0001', regiao: 'Centro Norte', ativo: true },
    { id: 2, nome: 'Lejanira A', fone: '(82) 99999-0002', regiao: 'Vila Esperança', ativo: true },
    { id: 3, nome: 'Marcelo', fone: '(82) 99999-0003', regiao: 'Zona Rural / Sítios', ativo: true },
    { id: 4, nome: 'Nicolas', fone: '(82) 99999-0004', regiao: 'Comércio / Av. Central', ativo: true },
    { id: 5, nome: 'Edineide', fone: '(82) 99999-0005', regiao: 'Bairro Novo', ativo: true },
  ],
  missas: [
    {
      id: 1,
      tipo: 'missa',
      titulo: 'Santa Missa Dominical da Comunidade',
      dataHora: 'Todos os Domingos às 19:00',
      local: 'Capela Nossa Senhora da Conceição',
      celebrante: 'Padre Pároco',
      descricao: 'Liturgia da Palavra, Cânticos e Sagrada Comunhão com a bênção dos dizimistas.',
    },
    {
      id: 2,
      tipo: 'celebração',
      titulo: 'Celebração da Palavra & Terço dos Homens',
      dataHora: 'Toda Terça-feira às 19:30',
      local: 'Capela Nossa Senhora da Conceição',
      celebrante: 'Diácono e Ministros da Palavra',
      descricao: 'Momento de oração em família e consagração mariana.',
    },
    {
      id: 3,
      tipo: 'festas',
      titulo: 'Grande Festa da Padroeira N. Sra. da Conceição',
      dataHora: '29 de Nov a 08 de Dezembro às 19:30',
      local: 'Capela & Pátio Paroquial',
      celebrante: 'Pároco & Padres Convidados',
      descricao: 'Novena Solene, Procissão Luminosa, Quermesse e Louvor.',
    },
  ],
  intencoes: [
    {
      id: 1,
      solicitante: 'Família Silva & Santos',
      falecido: 'Em ação de graças pela saúde da família e alcance de bênção profissional',
      data: '27/09/2026',
      tipoIntencao: 'Ação de Graças',
      status: 'Aprovada',
    },
    {
      id: 2,
      solicitante: 'D. Maria de Lourdes',
      falecido: 'Pelo eterno descanso da alma de Sebastião de Souza (7º Dia)',
      data: '27/09/2026',
      tipoIntencao: 'Sufrágio dos Falecidos',
      status: 'Aprovada',
    },
    {
      id: 3,
      solicitante: 'Comunidade Juvenil',
      falecido: 'Pela paz nas famílias e vocações sacerdotais e religiosas',
      data: '04/10/2026',
      tipoIntencao: 'Ação de Graças',
      status: 'Aprovada',
    },
  ],
  mural: [
    {
      id: 1,
      titulo: 'Encontro de Formação da Pastoral do Dízimo',
      data: '15/09/2026',
      resumo: 'Reunião mensal com todos os agentes missionários para partilha e prestação de contas.',
      textoCompleto:
        'Convidamos com muita alegria todos os agentes do dízimo, benfeitores e voluntários para nossa formação pastoral no salão comunitário. Pauta: prestação de contas transparente e acolhida de novas famílias.',
      categoria: 'Pastoral',
      fixado: true,
    },
    {
      id: 2,
      titulo: 'Chave Pix Oficial da Capela Atualizada',
      data: '20/09/2026',
      resumo: 'Contribua agora de forma instantânea e segura diretamente do seu celular.',
      textoCompleto:
        'Agora é possível contribuir com o dízimo e ofertas utilizando o Pix com confirmação imediata e emissão do comprovante digital paroquial.',
      categoria: 'Geral',
      fixado: true,
    },
  ],
};

const STORAGE_KEY = 'dizinet_pro_state_v2';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Garantir compatibilidade e integridade dos nós
      return {
        ...DEFAULT_APP_STATE,
        ...parsed,
        capela: {
          ...DEFAULT_APP_STATE.capela,
          ...(parsed.capela || {}),
        },
      };
    }
  } catch (err) {
    console.warn('Erro ao carregar localStorage, usando default:', err);
  }
  return DEFAULT_APP_STATE;
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Erro ao salvar no localStorage:', err);
  }
}

/**
 * Sincronização assíncrona com Google Sheets sem travar o usuário
 */
export async function syncWithGoogleSheets(
  url: string,
  acao: 'adicionar' | 'editar' | 'excluir' | 'listar',
  dados?: Partial<Lancamento>
): Promise<Lancamento[] | null> {
  if (!url || !url.startsWith('http')) return null;

  try {
    if (acao === 'listar') {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          return json;
        }
      }
    } else {
      // Uso de text/plain para evitar problemas de CORS no Google Apps Script Web App
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ acao, ...(dados || {}) }),
      });
    }
  } catch (err) {
    console.warn(`Sincronização Google Sheets (${acao}) em modo offline/fallback.`);
  }
  return null;
}
